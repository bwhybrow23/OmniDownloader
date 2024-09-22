import sqlite3 from 'sqlite3';
import fs from 'fs';
import logger from './Logger.js';

const dbFile = 'Data/db.sqlite';

// watchlist.json file (if present)
let watchlist = [];
if (fs.existsSync('/srv/OmniDownloader/Data/watchlist.json')) {
  watchlist = JSON.parse(fs.readFileSync('/srv/OmniDownloader/Data/watchlist.json'));
} else {
  logger.debug('No watchlist file found, skipping conversion.');
}

// Create database connection (connect if existing, create if not)
export async function createDbConnection() {
  if (fs.existsSync(dbFile)) {
    logger.debug('Database file already exists, so using that file.');
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) {
        return logger.error(`Error opening database file:`, err);
      }

      // Enable WAL mode
      db.exec('PRAGMA journal_mode = WAL;', (error) => {
        if (error) {
          return logger.error('Error setting WAL mode:', error);
        } else {
          logger.info('WAL mode enabled.');
        }
      });
    });

    logger.info('Database initialized.');
    return db;
  } else {
    logger.debug('Database file does not exist, so creating a new file.');
    const db = new sqlite3.Database(dbFile, async (error) => {
      if (error) {
        return logger.error(`Error creating database file:`, error);
      }

      logger.debug('Database file created successfully.');

      // Enable WAL mode
      db.exec('PRAGMA journal_mode = WAL;', (error) => {
        if (error) {
          return logger.error('Error setting WAL mode:', error);
        } else {
          logger.info('WAL mode enabled.');
        }
      });

      // Create tables
      await _createTables(db);
      logger.debug('Database tables created successfully.');

      // Convert watchlist to database
      await _convertWatchlistToDatabase(db);
    });

    logger.info('Connection with SQLite database established.');
    return db;
  }
}

// Create tables - profiles, posts, files
async function _createTables(db) {
  // Profiles table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS profiles
    (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT,
      user_id TEXT,
      username TEXT,
      media_type TEXT
    );
  `);

  // Posts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts
    (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      post_id TEXT,
      title TEXT,
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES profiles(id)
    );
  `);

  // Files table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS files
    (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      file_name TEXT,
      file_path TEXT,
      FOREIGN KEY (post_id) REFERENCES posts(id)
    );
  `);
}

//Convert watchlist.json (if present) to the new database
async function _convertWatchlistToDatabase(db) {
  if (!watchlist || !watchlist.length) {
    return logger.info('No watchlist found to convert to database.');
  }

  try {
    for (const profile of watchlist) {
      const {
        platform,
        user_id,
        username,
        media_type
      } = profile;
      await db.run(`
        INSERT INTO profiles (platform, user_id, username, media_type)
        VALUES (?, ?, ?, ?);
      `, [platform, user_id, username, media_type]);
    }
  } catch (error) {
    return logger.error('Error converting watchlist to database:', error);
  }

  return logger.info('Watchlist converted to database successfully.');
}

// Open database connection
export async function openDb() {
  if (!fs.existsSync(dbFile)) {
    logger.error('Database file does not exist, attempting to create one.');
    try {
      const db = await createDbConnection();
      if (!db) {
        logger.error('Could not create database file.');
        return null;
      } else {
        return db;
      }
    } catch (error) {
      logger.error('Error creating database file:', error);
      return null;
    }
  } else {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbFile, (err) => {
        if (err) {
          logger.error('Error opening database file:', err);
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }
}

/**
 * 
 * Database Functions
 * 
 */

/**
 * 
 * Profiles
 * 
 */

export async function getProfiles() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM profiles', [], (err, rows) => {
      if (err) {
        logger.error('Error querying profiles:', err);
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
        logger.error('Error querying profile:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

export async function getUserData(user_id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        profiles.id AS profile_id,
        profiles.platform,
        profiles.user_id AS profile_user_id,
        profiles.username,
        profiles.media_type,
        posts.id AS post_id,
        posts.title,
        posts.content,
        files.id AS file_id,
        files.file_name,
        files.file_path
      FROM
        profiles
      JOIN
        posts ON profiles.id = posts.user_id
      LEFT JOIN
        files ON posts.id = files.post_id
      WHERE
        profiles.user_id = ?
    `;
    
    db.all(query, [user_id], (err, rows) => {
      if (err) {
        logger.error('Error querying user data:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export async function addProfile(platform, user_id, username, media_type) {
  const db = await openDb();
  return db.run(
    `INSERT INTO profiles (platform, user_id, username, media_type) VALUES (?, ?, ?, ?)`,
    [platform, user_id, username, media_type]
  );
};

export async function updateProfile(platform, user_id, username, media_type) {
  const db = await openDb();

  db.run(
    `UPDATE profiles SET username = ?, media_type = ? WHERE platform = ? AND user_id = ?`,
    [username, media_type, platform, user_id]
  );
}

export async function deleteProfile(user_id) {
  const db = await openDb();
  return db.run(
    `DELETE FROM profiles WHERE user_id = ?`,
    [user_id]
  );
}

/**
 * 
 * Posts
 * 
 */

export async function getPost(post_id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM posts WHERE post_id = ?', [post_id], (err, row) => {
      if (err) {
        logger.error('Error querying post:', err);
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
    `INSERT INTO posts (user_id, post_id, title, content) VALUES (?, ?, ?, ?)`,
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

/**
 * 
 * Files
 * 
 */

export async function getFiles(post_id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM files WHERE post_id = ?', [post_id], (err, rows) => {
      if (err) {
        logger.error('Error querying files:', err);
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