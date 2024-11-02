import express from 'express';
const router = express.Router();
import * as Database from '../Utils/Database.js';

// Get all profiles as JSON
router.get('/api/profiles', async (req, res) => {
  try {
    const watchlist = await Database.getProfiles();
    watchlist.sort((a, b) => a.username.localeCompare(b.username));
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get a specific profile and its details as JSON
router.get('/api/profiles/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const userData = await Database.getUserData(user_id);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

// Add a new profile
router.post('/api/profiles/add', async (req, res) => {
  const newProfile = req.body;

  if (!newProfile.user_id || !newProfile.platform || !newProfile.media_type) {
    return res.status(400).json({ error: 'User ID, Platform, and Media Type are required' });
  }
  if (!newProfile.username && newProfile.platform !== 'fansly') {
    newProfile.username = newProfile.user_id;
  }

  try {
    await Database.addProfile(newProfile.platform, newProfile.user_id, newProfile.username, newProfile.media_type);
    res.status(201).json({ message: 'Profile added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add profile' });
  }
});

// Edit a profile
router.put('/api/profiles/edit/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  const updatedProfile = req.body;

  if (!user_id || !updatedProfile.user_id || !updatedProfile.platform || !updatedProfile.media_type) {
    return res.status(400).json({ error: 'User ID, Platform, and Media Type are required' });
  }
  if (!updatedProfile.username && updatedProfile.platform !== 'fansly') {
    updatedProfile.username = updatedProfile.user_id;
  }

  try {
    await Database.updateProfile(updatedProfile.platform, updatedProfile.user_id, updatedProfile.username, updatedProfile.media_type);
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete a profile
router.delete('/api/profiles/delete/:user_id', async (req, res) => {
  const user_id = req.params.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    await Database.deleteProfile(user_id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

export default router;