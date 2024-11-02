// src/components/EditProfileForm.js
import React, { useState, useEffect } from 'react';

const EditProfileForm = ({ userId, initialData, onClose, onSubmit }) => {
  const [platform, setPlatform] = useState(initialData.platform || 'fansly');
  const [username, setUsername] = useState(initialData.username || '');
  const [mediaType, setMediaType] = useState(initialData.mediaType || 'all');

  useEffect(() => {
    setPlatform(initialData.platform || 'fansly');
    setUsername(initialData.username || '');
    setMediaType(initialData.mediaType || 'all');
  }, [initialData]);

  const handlePlatformChange = (e) => {
    setPlatform(e.target.value);
    if (e.target.value !== 'fansly') {
      setUsername('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ platform, userId, username, mediaType });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <section className="profile-form">
          <h2>Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="edit_platform">Platform:</label>
            <select id="edit_platform" value={platform} onChange={handlePlatformChange} required>
              <option value="fansly">Fansly</option>
              <option value="onlyfans">OnlyFans</option>
              <option value="candfans">CandFans</option>
            </select>

            <label htmlFor="edit_user_id">User ID:</label>
            <input type="text" id="edit_user_id" value={userId} disabled />

            <label htmlFor="edit_username">Username:</label>
            <input
              type="text"
              id="edit_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={platform === 'fansly'}
              disabled={platform !== 'fansly'}
            />

            <label htmlFor="edit_media_type">Type of Media:</label>
            <select
              id="edit_media_type"
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="photos">Photos</option>
              <option value="videos">Videos</option>
            </select>

            <button type="submit">Save Changes</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default EditProfileForm;