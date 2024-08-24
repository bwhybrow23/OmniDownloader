import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbFilePath = path.resolve('../Data/db.sqlite');

const openDb = async () => {
  return open({
    filename: dbFilePath,
    driver: sqlite3.Database
  });
};

// Initialize database by running schema
const initDb = async () => {
  const db = await openDb();
  await db.exec((await import('fs')).promises.readFile('./Database/schema.sql', 'utf-8'));
  return db;
};

export { openDb, initDb };