// src/pages/Home.js
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const [downloads, setDownloads] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(response => response.json())
      .then(data => {
        setDownloads(data.downloads);
        setRecentActivities(data.recentActivities);
      })
      .catch(error => console.error('Error fetching dashboard data:', error));
  }, []);

  const downloadAll = () => {
    fetch('/api/download-all', { method: 'POST' })
      .then(() => alert('Download started for all users.'))
      .catch(error => console.error('Error starting download:', error));
  };

  return (
    <>
      <Header />
      <main>
        <section className="dashboard">
          <h2>Current Downloads</h2>
          <div className="downloads">
            {downloads.map((download, index) => (
              <div className="download-item" key={index}>
                <h3>{`${download.profile} - ${download.file}`}</h3>
                <p>{`Downloaded: ${download.downloadedSize} / ${download.totalSize}`}</p>
              </div>
            ))}
          </div>
          <div className="quick-actions">
            <button onClick={downloadAll}>Download All Content</button>
            <button onClick={() => window.location.href = '/profiles'}>Manage Profiles</button>
          </div>
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <ul>
              {recentActivities.map((activity, index) => (
                <li key={index}>{`${activity.message} - ${activity.time}`}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;