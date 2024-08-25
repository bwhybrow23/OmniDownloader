import sqlite3 from 'sqlite3';
import fs from 'fs';
import logger from '../Utils/Logger.js';

const dbFile = 'Data/db.sqlite';

import watchlist from '../Data/watchlist.json' with {type: 'json'};

export async function createDbConnection() {
  if (fs.existsSync(dbFile)) {
    logger.debug('Database file already exists, so using that file.');
    logger.info('Database initialized.');
    return new sqlite3.Database(dbFile);
  } else {
    logger.debug('Database file does not exist, so creating a new file.');
    const db = new sqlite3.Database(dbFile, async (error) => {
      if (error) {
        return logger.error(`Error creating database file:`, error);
      }

      logger.debug('Database file created successfully.');

      // Create tables
      await createProfilesTable(db);
      await createPostsTable(db);
      await createFilesTable(db);
      logger.debug('Database tables created successfully.');

      // Convert watchlist to database
      await convertWatchlistToDatabase(db);
    });

    logger.info('Connection with SQLite database established.');
    return db;
  }
}

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

async function createProfilesTable(db) {
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
}

async function createPostsTable(db) {
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
}

async function createFilesTable(db) {
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
async function convertWatchlistToDatabase(db) {  
  try {
    for (const profile of watchlist) {
      const { platform, user_id, username, media_type } = profile;
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