// src/components/AddProfileForm.js
import React, { useState } from 'react';

const AddProfileForm = ({ onClose, onSubmit }) => {
  const [platform, setPlatform] = useState('fansly');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [mediaType, setMediaType] = useState('all');

  const handlePlatformChange = (e) => {
    setPlatform(e.target.value);
    if (e.target.value === 'fansly') {
      setUsername('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ platform, userId, username, mediaType });
  };

  return (
    <section className="profile-form" style={{display: 'none'}}>
      <h2>Add New Profile</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="platform">Platform:</label>
        <select id="platform" value={platform} onChange={handlePlatformChange} required>
          <option value="fansly">Fansly</option>
          <option value="onlyfans">OnlyFans</option>
          <option value="candfans">CandFans</option>
        </select>

        <label htmlFor="user_id">User ID:</label>
        <input
          type="text"
          id="user_id"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />

        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required={platform === 'fansly'}
          disabled={platform !== 'fansly'}
        />

        <label htmlFor="media_type">Type of Media:</label>
        <select id="media_type" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
          <option value="all">All</option>
          <option value="photos">Photos</option>
          <option value="videos">Videos</option>
        </select>

        <button type="submit">Add Profile</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </section>
  );
};

export default AddProfileForm;