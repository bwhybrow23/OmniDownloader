import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { parentPort } from 'worker_threads';
import logger from './Logger.js';

export default async function downloadFile({ file, userDir, headers, timeout }) {
  const savePath = path.join(userDir, file.name);

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

    response.data.on('data', (chunk) => {
      downloadedSize += chunk.length;
      parentPort.postMessage({
        type: 'progress',
        file: file.name,
        downloadedSize,
        totalSize
      });
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
      await fs.promises.rename(tempFilePath, savePath);
      logger.info(`Downloaded: ${savePath}`);
    }

    parentPort.postMessage({
      type: 'done',
      file: file.name,
      success: true
    });
  } catch (error) {
    logger.error(`Failed to download ${file.name}: ${error.message}`);
    if (fs.existsSync(tempFilePath)) {
      await fs.promises.unlink(tempFilePath);
    }

    parentPort.postMessage({
      type: 'done',
      file: file.name,
      success: false,
      error: error.message
    });
  }
}
