import express from 'express';
import fs from 'fs';
const router = express.Router();
import logger from '../Utils/Logger.js';
import Downloader from '../Utils/Downloader.js';
import { fetchPosts } from '../Utils/Fetcher.js';
import * as Database from '../Utils/Database.js';

// Home Route - Fetch dashboard data as JSON
router.get('/api/dashboard', (req, res) => {
  let trackingFile = [];
  if (fs.existsSync('/srv/OmniDownloader/Data/downloads.json')) {
    trackingFile = JSON.parse(fs.readFileSync('/srv/OmniDownloader/Data/downloads.json'));
  } else {
    trackingFile = [
      { file: ' ', downloadedSize: '0 MB', totalSize: '0 MB', profile: 'No downloads in progress.' }
    ];
  }

  const recentActivities = [
    { message: 'Downloaded content for User1', time: '10:00 AM' },
    { message: 'Profile User2 added', time: '9:00 AM' }
  ];

  res.json({ downloads: trackingFile, recentActivities });
});

// Download all profiles
router.post('/api/download-all', async (req, res) => {
  try {
    const downloader = new Downloader();
    const watchlist = await Database.getProfiles();

    for (const profile of watchlist) {
      try {
        const new_posts = await fetchPosts(profile.platform, profile.user_id);
        await downloader.downloadPosts(downloader, new_posts, profile);
      } catch (error) {
        logger.error(`Failed to download new posts for user ${profile.user_id}:`, error);
      }
    }

    res.json({ message: 'Download started for all profiles' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate download for all profiles' });
  }
});

// Download a specific profile
router.post('/api/download/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const downloader = new Downloader();
    const profile = await Database.getProfile(user_id);

    const new_posts = await fetchPosts(profile.platform, profile.user_id);
    await downloader.downloadPosts(downloader, new_posts, profile);

    res.json({ message: `Download started for user ${user_id}` });
  } catch (error) {
    logger.error(`Failed to download new posts for user ${user_id}:`, error);
    res.status(500).json({ error: `Failed to download content for user ${user_id}` });
  }
});

export default router;