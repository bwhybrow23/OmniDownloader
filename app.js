import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import https from 'https';

import logger from './Utils/Logger.js';
import { initDb } from './Database/db.js';

import config from './Data/config.json' with {type: 'json'};

const app = express();

// Set view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(import.meta.dirname, 'Public/Assets')));
app.set('views', path.join(import.meta.dirname, 'Public/Views'));

// HTTP CATS
function httpCatsMiddleware(req, res, next) {
  const { statusCode } = res;
  if (statusCode && statusCode >= 400) {
    const imageUrl = `https://http.cat/images/${statusCode}.jpg`;
    https.get(imageUrl, (response) => {
      response.pipe(res);
    });
  } else {
    next();
  }
}

app.use(httpCatsMiddleware);

// Routers
import indexRouter from './Routers/root.js';
import profilesRouter from './Routers/profiles.js';

app.use('/', indexRouter);
app.use('/', profilesRouter);

// 404 Route Handler
app.use((req, res, next) => {
  const imageUrl = 'https://http.cat/404.jpg';
  https.get(imageUrl, (response) => {
    response.pipe(res);
  });
});

// Initialize the database
await initDb();
logger.info('Database initialized.');

// Start the server
const PORT = config.port || 3069;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});