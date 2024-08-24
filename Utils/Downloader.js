import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import logger from './Logger.js';
import WorkerPool from 'workerpool';
import ProgressBar from 'progress';

import config from '../Data/config.json' with {type: 'json'};

// Settings from config to variables
const BASE_DIR = config.BASE_DIR;
const SEPARATE_FOLDERS = config.separate_folders;
const IMAGE_FOLDER = config.image_folder;
const VIDEO_FOLDER = config.video_folder;

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
  }

  // File Download Logic
  async _downloadFile(file, userDir) {
    const savePath = path.join(userDir, file.name);

    // Skip download if the file already exists
    if (fs.existsSync(savePath)) {
      logger.debug(`File ${savePath} already exists. Skipping download.`);
      return;
    }

    const fileUrl = `https://coomer.su/data${file.path}`;
    const tempFileName = `${file.name}.tmp`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    try {
      const response = await axios({
        method: 'get',
        url: fileUrl,
        headers: this.headers,
        responseType: 'stream',
        timeout: this.timeout,
      });

      const totalSize = parseInt(response.headers['content-length'], 10);
      const writer = createWriteStream(tempFilePath);
      let downloadedSize = 0;

      const progressBar = new ProgressBar(`Downloading ${file.name} [:bar] :percent :etas`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: totalSize,
      });

      response.data.on('data', (chunk) => {
        downloadedSize += chunk.length;
        progressBar.tick(chunk.length);
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      if (totalSize !== 0 && downloadedSize !== totalSize) {
        logger.error(`Download incomplete: ${file.name}`);
        await unlink(tempFilePath);
      } else {
        await rename(tempFilePath, savePath);
        logger.info(`Downloaded: ${savePath}`);
      }
    } catch (error) {
      logger.error(`Failed to download ${file.name}: ${error.message}`);
      if (fs.existsSync(tempFilePath)) {
        await unlink(tempFilePath);
      }
    }
  }

  // Download a post (concurrent)
  async downloadPost(post, username, mediaType) {
    logger.debug(`Downloading post: ${post.id}.`);

    // Define the user's directory
    const userDir = path.join(BASE_DIR, username);
    let mediaDir;

    if (SEPARATE_FOLDERS) {
      mediaDir = path.join(userDir, mediaType === 'photos' ? IMAGE_FOLDER : VIDEO_FOLDER);
    } else {
      mediaDir = userDir;
    }

    await mkdir(mediaDir, { recursive: true });

    // Filter files based on mediaType
    const validFiles = post.content.filter((file) => this._isValidMedia(mediaType, path.extname(file.name).slice(1).toLowerCase()));

    // Download files concurrently within the post
    const pool = WorkerPool.pool({ maxWorkers: this.downloadConcurrency });

    const downloadPromises = validFiles.map((file) =>
      pool.exec(this._downloadFile.bind(this), [file, mediaDir])
    );

    try {
      await Promise.all(downloadPromises);
    } catch (error) {
      logger.error(`Error downloading files for post ${post.id}: ${error.message}`);
    } finally {
      await pool.terminate(); // Close worker pool after downloads
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

async function downloadPostsConcurrently(downloader, newPosts, username, mediaType, postConcurrency = 3) {
  const pool = WorkerPool.pool({ maxWorkers: postConcurrency });

  const downloadPromises = newPosts.map((post) =>
    pool.exec(downloader.downloadPost.bind(downloader), [post, username, mediaType])
  );

  try {
    await Promise.all(downloadPromises);
  } catch (error) {
    // logger.error(`Error downloading posts:`, error);
    console.log(error);
  } finally {
    await pool.terminate(); // Close worker pool after downloads
  }
}

export { Downloader, downloadPostsConcurrently };