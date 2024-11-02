// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Profile = () => {
  const { user_id } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetch(`/api/profiles/${user_id}`)
      .then(response => response.json())
      .then(data => setUserData(data))
      .catch(error => console.error('Error fetching user data:', error));
  }, [user_id]);

  if (!userData) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <main>
        <section className="profile">
          <h2>Profile: {userData.profile.username}</h2>
          <p>User ID: {userData.profile.user_id}</p>
          <p>Platform: {userData.profile.platform}</p>
          <h3>Posts</h3>
          <table>
            <thead>
              <tr>
                <th>Post ID</th>
                <th>Post Title</th>
                <th>Post Files</th>
              </tr>
            </thead>
            <tbody>
              {userData.profile.posts.map((post) => (
                <tr key={post.post_id}>
                  <td>{post.post_id}</td>
                  <td>{post.post_date}</td>
                  <td>{post.post_content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Profile;