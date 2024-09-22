import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { parentPort } from 'worker_threads';
import logger from './Logger.js';
import * as Database from '../Utils/Database.js';
import mv from 'mv';

function _sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9-_\.]/g, '_');
}

export default async function downloadFile({ file, userDir, post_id, headers, timeout, profile }) {
  const sanitizedFilename = _sanitizeFilename(file.name);
  const savePath = path.join(userDir, sanitizedFilename);

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
      headers,
      responseType: 'stream',
      timeout,
    });

    const totalSize = parseInt(response.headers['content-length'], 10);
    const writer = fs.createWriteStream(tempFilePath);
    let downloadedSize = 0;
    let lastReportedTime = Date.now();

    response.data.on('data', (chunk) => {
      downloadedSize += chunk.length;
      const currentTime = Date.now();
      if (currentTime - lastReportedTime >= 1000) { // Report progress every second
        parentPort.postMessage({
          type: 'progress',
          file: file.name,
          downloadedSize,
          totalSize,
          profile: profile.username
        });
        lastReportedTime = currentTime;
      }
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    if (totalSize !== 0 && downloadedSize !== totalSize) {
      logger.error(`Download incomplete: ${file.name}`);
      await fs.promises.unlink(tempFilePath);
    } else {
      mv(tempFilePath, savePath, (err) => {
        if (err) {
          logger.error(`Failed to move ${tempFilePath} to ${savePath}:`, err);
        }
      });
    }

    parentPort.postMessage({
      type: 'done',
      file: file.name,
      path: savePath,
      profile: profile.username,
      success: true
    });

    await Database.addFile(post_id, file.name, savePath);

  } catch (error) {
    logger.error(`Failed to download ${file.name}:`, error);
    if (fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath);
    }

    parentPort.postMessage({
      type: 'done',
      file: file.name,
      path: savePath,
      profile: profile.username,
      success: false,
      error: error.message
    });
  }
}