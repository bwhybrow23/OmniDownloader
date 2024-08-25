import fs from 'fs';
import path from 'path';
import logger from './Logger.js';
import { Piscina } from 'piscina';
import MultiProgress from 'multi-progress';

import config from '../Data/config.json' with {type: 'json'};

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

    // Initialize multi-progress to manage multiple progress bars
    this.multi = new MultiProgress(process.stderr);
    this.progressBars = new Map();

    // Listen to messages from worker threads
    this.piscina.on('message', (message) => {
      if (message.type === 'progress') {
        const { file, downloadedSize, totalSize } = message;

        // Check if a progress bar already exists for this file
        if (!this.progressBars.has(file)) {
          // Create a new progress bar for this file using multi-progress
          const progressBar = this.multi.newBar(`Downloading ${file} [:bar] :percent :etas`, {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: totalSize,
          });
          this.progressBars.set(file, progressBar);
        }

        // Update the progress bar with the latest data
        const progressBar = this.progressBars.get(file);
        progressBar.tick(downloadedSize - progressBar.curr);
      }

      if (message.type === 'done') {
        if (message.success) {
          console.log(`Download completed: ${message.file}`);
        } else {
          console.error(`Download failed: ${message.file}, error: ${message.error}`);
        }

        // Optionally, remove the progress bar after completion
        this.progressBars.delete(message.file);
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
        logger.error(`Failed to download post ${post.id}: ${error.message}`);
      }
    }

    logger.debug(`Completed downloading posts for ${profile.username}.`);
  }

  // Download a post
  async downloadPost(post, profile) {
    logger.debug(`Downloading post: ${post.id}.`);

    // Define the user's directory
    const userDir = path.join(config.BASE_DIR, profile.username);
    let mediaDir;

    if (config.SEPARATE_FOLDERS) {
      mediaDir = path.join(userDir, profile.media_type === 'photos' ? config.IMAGE_FOLDER : config.VIDEO_FOLDER);
    } else {
      mediaDir = userDir;
    }

    await fs.promises.mkdir(mediaDir, { recursive: true });

    const validFiles = post.content.filter((file) => this._isValidMedia(profile.media_type, path.extname(file.name).slice(1).toLowerCase()));

    const downloadPromises = validFiles.map((file) => {
      return this.piscina.run({ file, userDir: mediaDir, post_id: post.id, headers: this.headers, timeout: this.timeout });
    });

    try {
      await Promise.all(downloadPromises);
    } catch (error) {
      logger.error(`Error downloading files for post ${post.id}: ${error.message}`);
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
}

export default Downloader;
