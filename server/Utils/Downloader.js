import fs from 'fs';
import path from 'path';
import logger from './Logger.js';
import { Piscina } from 'piscina';

// Downloader class for handling media downloads
class Downloader {
  constructor(maxRetries = 6, initialWaitTime = 10, timeout = 30000, downloadConcurrency = 3) {
    this.maxRetries = maxRetries;
    this.initialWaitTime = initialWaitTime * 1000; // Convert to milliseconds
    this.timeout = timeout;
    this.downloadConcurrency = downloadConcurrency;
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    };
    this.piscina = new Piscina({ filename: new URL('./DownloadWorker.js', import.meta.url).href, maxThreads: this.downloadConcurrency });

    //Check permissions
    fs.access('/downloads', fs.constants.W_OK, (err) => {
      if (err) {
        logger.debug('No access to /downloads folder, will try to rectify this.');
        if(!fs.existsSync('/downloads')) {
          fs.mkdirSync('/downloads', { recursive: true });
        }
        fs.chmod('/downloads', '777', (err) => {
          if (err) {
            logger.error('Could not change permissions for /downloads folder.');
          }
        });
      } else {
        logger.debug('Access to /downloads folder is OK.');
      }
    });

    // Download tracking JSON file (check if it exists)
    let trackingFile = [];
    if (fs.existsSync('/srv/OmniDownloader/Data/downloads.json')) {
      // If exists, wipe the file
      fs.writeFileSync('/srv/OmniDownloader/Data/downloads.json', JSON.stringify(trackingFile, null, 2));
    } else {
      // If doesn't exist, create the file
      fs.writeFileSync('/srv/OmniDownloader/Data/downloads.json', JSON.stringify(trackingFile, null, 2));
    }

    // Listen to messages from worker threads
    this.piscina.on('message', (message) => {
      if (message.type === 'progress') {
        const { file, downloadedSize, totalSize, profile } = message;

        this._trackDownload({ "file": file, "downloadedSize": this._bytesToSize(downloadedSize), "totalSize": this._bytesToSize(totalSize), "profile": profile });

        // Display console updates for download progress
        logger.debug(`${profile}: Downloading ${file}: ${this._bytesToSize(downloadedSize)} / ${this._bytesToSize(totalSize)}`);

      }

      if (message.type === 'done') {
        this._removeFromTracking(message.file);

        if (message.success) {
          logger.info(`Download completed: ${message.path}`);
        } else {
          logger.error(`Download failed: ${message.path} - `, message.error);
        }

      }

    });
  }

  // Download all posts from fetcher
  async downloadPosts(downloader, posts, profile) {
    logger.debug(`Downloading posts for ${profile.username}.`);

    for (const post of posts) {
      try {
        await downloader.downloadPost(post, profile);
      } catch (error) {
        logger.error(`Failed to download post ${post.id}:`, error);
      }
    }

    logger.debug(`Completed downloading posts for ${profile.username}.`);
  }

  // Download a post
  async downloadPost(post, profile) {
    logger.debug(`Downloading post: ${post.id}.`);

    // Define the user's directory
    const userDir = path.join('/downloads', profile.username); 
    let mediaDir;

    if (process.env.SEPARATE_FOLDERS) {
      if(profile.media_type === 'all') {
        // determine whether the file is an image or video
        const fileExtension = path.extname(post.content[0].name).slice(1).toLowerCase();
        mediaDir = path.join(userDir, this._isValidMedia('photos', fileExtension) ? process.env.IMAGE_FOLDER : process.env.VIDEO_FOLDER);
      } else if (profile.media_type === 'photos') {
        mediaDir = path.join(userDir, process.env.IMAGE_FOLDER);
      } else if (profile.media_type === 'videos') {
        mediaDir = path.join(userDir, process.env.VIDEO_FOLDER);
      } else {
        mediaDir = userDir;
      }
    } else {
      mediaDir = userDir;
    }

    await fs.promises.mkdir(mediaDir, { recursive: true });

    const validFiles = post.content.filter((file) => this._isValidMedia(profile.media_type, path.extname(file.name).slice(1).toLowerCase()));

    const downloadPromises = validFiles.map((file) => {
      return this.piscina.run({ file, userDir: mediaDir, post_id: post.id, headers: this.headers, timeout: this.timeout, profile: profile });
    });

    try {
      await Promise.all(downloadPromises);
    } catch (error) {
      logger.error(`Error downloading files for post ${post.id}:`, error);
    }

    logger.debug('Completed processing all media links for the post.');
  }

  _isValidMedia(mediaType, fileExtension) {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'svg', 'pdf', 'eps', 'ai', 'indd', 'raw'];
    const videoExtensions = ['mp4', 'm4v', 'mov', 'wmv', 'avi', 'flv', 'mkv'];

    if (mediaType === 'photos' && imageExtensions.includes(fileExtension)) {
      return true;
    }

    if (mediaType === 'videos' && videoExtensions.includes(fileExtension)) {
      return true;
    }

    if (mediaType === 'all' || mediaType === 'both') {
      return imageExtensions.includes(fileExtension) || videoExtensions.includes(fileExtension);
    }

    return false;
  }

  _bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return 'n/a'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)
    if (i === 0) return `${bytes} ${sizes[i]})`
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`
  }

  // Download tracking
  async _trackDownload(download) {
    const trackingFile = JSON.parse(fs.readFileSync('/srv/OmniDownloader/Data/downloads.json'));
    // check if the file is already being tracked
    const index = trackingFile.findIndex((item) => item.file === download.file);
    if (index !== -1) {
      trackingFile[index] = download;
    } else {
      trackingFile.push(download);
    }
    fs.writeFileSync('/srv/OmniDownloader/Data/downloads.json', JSON.stringify(trackingFile, null, 2));
  }
  
  // Remove from tracking
  async _removeFromTracking(file) {
    const trackingFile = JSON.parse(fs.readFileSync('/srv/OmniDownloader/Data/downloads.json'));
    const index = trackingFile.findIndex((item) => item.file === file);
    trackingFile.splice(index, 1);
    fs.writeFileSync('/srv/OmniDownloader/Data/downloads.json', JSON.stringify(trackingFile, null, 2));
  }
}

export default Downloader;
