import express from 'express';
const router = express.Router();
import fs from 'fs';
import * as Database from '../Utils/Database.js';

// Get all profiles from the database and display them
router.get('/profiles', async (req, res) => {
  const watchlist = await Database.getProfiles();
  watchlist.sort((a, b) => {
    return a.username.localeCompare(b.username);
  });
  res.render('profiles', { watchlist });
});

// Get Profile and display it
router.get('/profiles/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).send('User ID is required');
  }
  
  // Get the profile from the database, but also get the posts linked to the profile and the files linked to the posts
  const userData = await Database.getUserData(user_id);
  res.render('profile', { userData });
});

// Add Profile
router.post('/profiles/add', async (req, res) => {
  const newProfile = req.body;

  // Data Validation
  if (!newProfile.user_id || !newProfile.platform || !newProfile.media_type) {
    return res.status(400).send('User ID, Platform, and Media Type are required');
  }
  if (!newProfile.username && newProfile.platform !== 'fansly') { 
    newProfile.username = newProfile.user_id;
  }

  await Database.addProfile(newProfile.platform, newProfile.user_id, newProfile.username, newProfile.media_type);

  res.redirect('/profiles');
});

// Edit Profile
router.post('/profiles/edit/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).send('User ID is required');
  }
  const updatedProfile = req.body;

  // Data Validation
  if (!updatedProfile.user_id || !updatedProfile.platform || !updatedProfile.media_type) {
    return res.status(400).send('User ID, Platform, and Media Type are required');
  }
  if (!updatedProfile.username && updatedProfile.platform !== 'fansly') { 
    updatedProfile.username = updatedProfile.user_id;
  }

  await Database.updateProfile(updatedProfile.platform, updatedProfile.user_id, updatedProfile.username, updatedProfile.media_type);

  res.redirect('/profiles');
});

// Delete Profile
router.post('/profiles/delete/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).send('User ID is required');
  }
  await Database.deleteProfile(user_id);

  res.redirect('/profiles');
});

export default router;