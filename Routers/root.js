import express from 'express';
const router = express.Router();
import logger from '../Utils/Logger.js';
import { Downloader, downloadPostsConcurrently } from '../Utils/Downloader.js';
import { fetchPosts } from '../Utils/Fetcher.js';

import watchlist from '../Data/watchlist.json' with {type: 'json'};

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

  for (const profile of watchlist) {
    try {
      const new_posts = await fetchPosts(profile.platform, profile.user_id);
      await downloadPostsConcurrently(downloader, new_posts, profile.username, profile.mediaType);
    } catch (error) {
      console.error(`Failed to download new posts for user ${profile.user_id}`);
    }
  }

  res.redirect('/profiles');
});

// Download single profile
router.post('/download/:user_id', async (req, res) => {
  const downloader = new Downloader();

  const profile = watchlist.find(profile => profile.user_id === req.params.user_id);

  try {
    const new_posts = await fetchPosts(profile.platform, profile.user_id);
    await downloadPostsConcurrently(downloader, new_posts, profile.username, profile.mediaType);
  } catch (error) {
    console.error(`Failed to download new posts for user ${profile.user_id}`);
    logger.error(error);
  }

  res.redirect('/profiles');
});

export default router;