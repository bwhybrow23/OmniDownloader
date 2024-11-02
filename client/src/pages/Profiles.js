// src/pages/Profiles.js
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AddProfileForm from '../components/AddProfileForm';
import DeleteProfilePrompt from '../components/DeleteProfilePrompt';

const Profiles = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [showAddProfileForm, setShowAddProfileForm] = useState(false);
  const [showDeleteProfilePrompt, setShowDeleteProfilePrompt] = useState(false);

  useEffect(() => {
    fetch('/api/profiles')
      .then(response => response.json())
      .then(data => setWatchlist(data))
      .catch(error => console.error('Error fetching profiles:', error));
  }, []);

  const promptDownload = (user_id) => {
    fetch(`/api/download/${user_id}`, { method: 'POST' })
      .then(() => alert(`Download started for user ${user_id}`))
      .catch(error => console.error(`Error starting download for user ${user_id}:`, error));
  };

  const confirmDeleteProfile = (user_id) => {
    setShowDeleteProfilePrompt(true);
  };

  return (
    <>
      <Header />
      <main>
        <section className="profiles">
          <h2>Manage Profiles</h2>
          <table>
            <thead>
              <tr>
                <th>Profile Username</th>
                <th>User ID</th>
                <th>Platform</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((profile) => (
                <tr key={profile.user_id}>
                  <td>{profile.username}</td>
                  <td>{profile.user_id}</td>
                  <td>{profile.platform}</td>
                  <td className="action-buttons">
                    <button onClick={() => window.location.href = `/profiles/${profile.user_id}`}>View</button>
                    <button onClick={() => confirmDeleteProfile(profile.user_id)}>Delete</button>
                    <button onClick={() => promptDownload(profile.user_id)}>Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setShowAddProfileForm(true)}>Add New Profile</button>
        </section>

        {showAddProfileForm && (
          <AddProfileForm onClose={() => setShowAddProfileForm(false)} />
        )}

        {showDeleteProfilePrompt && (
          <DeleteProfilePrompt onClose={() => setShowDeleteProfilePrompt(false)} />
        )}
      </main>
      <Footer />
    </>
  );
};

export default Profiles;
