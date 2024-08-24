CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  platform TEXT,
  user_id TEXT,
  username TEXT,
  media_type TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  post_id TEXT,
  title TEXT,
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  file_name TEXT,
  file_path TEXT,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);