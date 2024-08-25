import express from 'express';
const router = express.Router();
import fs from 'fs';
import * as Database from '../Utils/Database.js';

// Main Page
router.get('/profiles', async (req, res) => {
  const watchlist = await Database.getProfiles();
  res.render('profiles', { watchlist });
});

// Get Profile
router.get('/profiles/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).send('User ID is required');
  }
  
  const profile = await Database.getProfile(user_id);
  res.json(profile);
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