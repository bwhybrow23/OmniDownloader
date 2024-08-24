import { openDb } from './db.js';
// import logger from '../Utils/Logger.js';

// Profiles Table
const getProfiles = async () => {
  const db = await openDb();
  return db.all(`SELECT * FROM profiles`);
}

const getProfile = async (platform, user_id) => {
  const db = await openDb();
  return db.get(`SELECT * FROM profiles WHERE platform = ? AND user_id = ?`, [platform, user_id]);
}

const addProfile = async (platform, user_id, username, media_type) => {
  const db = await openDb();
  return db.run(
    `INSERT INTO profiles (platform, user_id, username, media_type) VALUES (?, ?, ?, ?)`,
    [platform, user_id, username, media_type]
  );
};

const updateProfile = async (platform, user_id, username, media_type) => {
  const db = await openDb();
  return db.run(
    `UPDATE profiles SET username = ?, media_type = ? WHERE platform = ? AND user_id = ?`,
    [username, media_type, platform, user_id]
  );
}

// Posts Table
const getPost = async (post_id) => {
  const db = await openDb();
  return db.get(`SELECT * FROM posts WHERE post_id = ?`, [post_id]);
}

const addPost = async (user_id, post_id, title, content) => {
  const db = await openDb();
  return db.run(
    `INSERT INTO posts (user_id, post_id, title, content) VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, post_id, title, content]
  );
};

const updatePost = async (post_id, title, content) => {
  const db = await openDb();
  return db.run(
    `UPDATE posts SET title = ?, content = ? WHERE post_id = ?`,
    [title, content, post_id]
  );
}

// Files Table
const getFiles = async (post_id) => {
  const db = await openDb();
  return db.all(`SELECT * FROM files WHERE post_id = ?`, [post_id]);
}

const addFile = async (post_id, file_name, file_path) => {
  const db = await openDb();
  return db.run(
    `INSERT INTO files (post_id, file_name, file_path) VALUES (?, ?, ?)`,
    [post_id, file_name, file_path]
  );
};

const updateFile = async (file_id, file_name, file_path) => {
  const db = await openDb();
  return db.run(
    `UPDATE files SET file_name = ?, file_path = ? WHERE file_id = ?`,
    [file_name, file_path, file_id]
  );
}

export { getProfiles, getProfile, addProfile, updateProfile, getPost, addPost, updatePost, getFiles, addFile, updateFile };