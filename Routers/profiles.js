import express from 'express';
const router = express.Router();
import fs from 'fs';

import watchlist from '../Data/watchlist.json' with {type: 'json'};

// Main Page
router.get('/profiles', (req, res) => {
  res.render('profiles', { watchlist });
});

// Get Profile
router.get('/profiles/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const profile = watchlist.find(p => p.user_id == user_id);
  res.json(profile);
});

// Add Profile
router.post('/profiles/add', (req, res) => {
  const newProfile = req.body;

  // Data Validation
  if (!newProfile.user_id || !newProfile.platform || !newProfile.media_type) {
    return res.status(400).send('User ID, Platform, and Media Type are required');
  }
  if (!newProfile.username && newProfile.platform !== 'fansly') { 
    newProfile.username = newProfile.user_id;
  }

  watchlist.push(newProfile);
  fs.writeFileSync('./Data/watchlist.json', JSON.stringify(watchlist, null, 2));

  res.redirect('/profiles');
});

// Edit Profile
router.post('/profiles/edit/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const updatedProfile = req.body;

  // Data Validation
  if (!updatedProfile.user_id || !updatedProfile.platform || !updatedProfile.media_type) {
    return res.status(400).send('User ID, Platform, and Media Type are required');
  }
  if (!updatedProfile.username && updatedProfile.platform !== 'fansly') { 
    updatedProfile.username = updatedProfile.user_id;
  }

  const index = watchlist.findIndex(p => p.user_id == user_id);
  watchlist[index] = updatedProfile;
  fs.writeFileSync('./Data/watchlist.json', JSON.stringify(watchlist, null, 2));

  res.redirect('/profiles');
});

// Delete Profile
router.post('/profiles/delete/:user_id', (req, res) => {
  const user_id = req.params.user_id;
  const index = watchlist.findIndex(p => p.user_id == user_id);
  watchlist.splice(index, 1);
  fs.writeFileSync('./Data/watchlist.json', JSON.stringify(watchlist, null, 2));

  res.redirect('/profiles');
});

export default router;