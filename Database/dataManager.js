import { openDb } from './db.js';
// import logger from '../Utils/Logger.js';

// Profiles Table
export async function getProfiles() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM profiles', [], (err, rows) => {
      if (err) {
        console.error('Error querying profiles:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function getProfile(user_id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM profiles WHERE user_id = ?', [user_id], (err, row) => {
      if (err) {
        console.error('Error querying profile:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export async function addProfile(platform, user_id, username, media_type) {
  const db = await openDb();
  return db.run(
    `INSERT INTO profiles (platform, user_id, username, media_type) VALUES (?, ?, ?, ?)`,
    [platform, user_id, username, media_type]
  );
};

export async function updateProfile(platform, user_id, username, media_type) {
  const db = await openDb();
  return db.run(
    `UPDATE profiles SET username = ?, media_type = ? WHERE platform = ? AND user_id = ?`,
    [username, media_type, platform, user_id]
  );
}

// Posts Table
export async function getPost(post_id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM posts WHERE post_id = ?', [post_id], (err, row) => {
      if (err) {
        console.error('Error querying post:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export async function addPost(user_id, post_id, title, content) {
  const db = await openDb();
  return db.run(
    `INSERT INTO posts (user_id, post_id, title, content) VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, post_id, title, content]
  );
};

export async function updatePost(post_id, title, content) {
  const db = await openDb();
  return db.run(
    `UPDATE posts SET title = ?, content = ? WHERE post_id = ?`,
    [title, content, post_id]
  );
}

// Files Table
export async function getFiles(post_id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM files WHERE post_id = ?', [post_id], (err, rows) => {
      if (err) {
        console.error('Error querying files:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function addFile(post_id, file_name, file_path) {
  const db = await openDb();
  return db.run(
    `INSERT INTO files (post_id, file_name, file_path) VALUES (?, ?, ?)`,
    [post_id, file_name, file_path]
  );
};

export async function updateFile(file_id, file_name, file_path) {
  const db = await openDb();
  return db.run(
    `UPDATE files SET file_name = ?, file_path = ? WHERE file_id = ?`,
    [file_name, file_path, file_id]
  );
}