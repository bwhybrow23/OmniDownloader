import express from 'express';
const router = express.Router();
import logger from '../Utils/Logger.js';
import Downloader from '../Utils/Downloader.js';
import { fetchPosts } from '../Utils/Fetcher.js';
import * as Database from '../Utils/Database.js';

// Home Route
router.get('/', (req, res) => {
  res.render('index', { 
    title: 'Dashboard',
    downloads: [
      { profileName: 'User1', contentType: 'Image', status: 'Completed' },
      { profileName: 'User2', contentType: 'Video', status: 'Downloading' }
    ],
    recentActivities: [
      { message: 'Downloaded content for User1', time: '10:00 AM' },
      { message: 'Profile User2 added', time: '9:00 AM' }
    ]
  });
});

// Download all profiles
router.post('/download-all', async (req, res) => {
  const downloader = new Downloader();

  //Get all profiles from the database
  const watchlist = await Database.getProfiles();

  for (const profile of watchlist) {
    try {
      const new_posts = await fetchPosts(profile.platform, profile.user_id);
      await downloader.downloadPosts(downloader, new_posts, profile);
    } catch (error) {
      logger.error(`Failed to download new posts for user ${profile.user_id}:`, error);
    }
  }

  res.redirect('/profiles');
});

// Download single profile
router.post('/download/:user_id', async (req, res) => {
  const downloader = new Downloader();

  if(!req.params.user_id) {
    return res.status(400).send('User ID is required');
  }
  const profile = await Database.getProfile(req.params.user_id);

  try {
    const new_posts = await fetchPosts(profile.platform, profile.user_id);
    await downloader.downloadPosts(downloader, new_posts, profile);
  } catch (error) {
    logger.error(`Failed to download new posts for user ${profile.user_id}:`, error);
  }

  res.redirect('/profiles');
});

export default router;