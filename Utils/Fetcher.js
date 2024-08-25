import axios from 'axios';
import logger from './Logger.js';
import * as Database from '../Utils/Database.js';

// Function to fetch new posts for a user
async function fetchPosts(platform, user_id) {
  const baseUrl = `https://coomer.su/api/v1/${platform}/user/${user_id}`;
  let offset = 0;
  let posts = [];
  const maxRetries = 6;
  const initialWaitTime = 10 * 1000; // Converted to milliseconds
  const headers = {
    'accept': 'application/json',
  };

  // Loop through all posts by offset
  let url = `${baseUrl}?o=${offset}`;
  logger.debug(`Fetching new posts from URL: ${url}`);
  let retries = 0;

  // Retry logic for handling request failures
  while (retries < maxRetries) {
    try {
      const response = await axios.get(url, { headers });
      // Break out of the loop if the request is successful
      if (response.status === 200) {
        const jsonResponse = response.data;

        // If response is an empty array, exit
        if (!jsonResponse.length) {
          return posts;
        }

        // Extract ID, files and attachments from JSON response
        for (const post of jsonResponse) {
          const postId = post.id;
          let postFiles = post.file;
          const postAttachments = post.attachments;

          let postContent = [];

          // If post files isn't empty, add to post_content
          if (postFiles.length > 0) {
            // If only one object with no array, convert to array
            if (!Array.isArray(postFiles)) {
              postFiles = [postFiles];
            }

            for (const file of postFiles) {
              const content = { name: file.name, path: file.path };
              postContent.push(content);
            }
          }

          // If post attachments isn't empty, add to post_content
          if (postAttachments.length > 0) {
            for (const attachment of postAttachments) {
              const content = { name: attachment.name, path: attachment.path };
              postContent.push(content);
            }
          }

          // If no post files or attachments, skip post
          if (!postFiles && !postAttachments) {
            continue;
          }

          // Append post details to posts list
          posts.push({ id: postId, content: postContent });

          // Insert post into database
          // post title - if empty, send empty string, if not empty, send post.title but remove emojis
          // post description - if empty, send empty string, if not empty, send post.content but remove emojis
          let postTitle = post.title ? _removeEmojis(post.title) : '';
          let postDescription = post.content ? _removeEmojis(post.content) : '';
          await Database.addPost(user_id, post.id, postTitle, postDescription);
          
        }

        // Output post count
        logger.debug(`Found ${posts.length} posts on the page with offset ${offset}.`);

        // Increment the offset to fetch the next page
        offset += 50;
        logger.debug(`Fetched posts: ${JSON.stringify(posts, null, 2)}`);
        return posts;
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const waitTime = initialWaitTime * (2 ** retries); // Exponential backoff
        logger.error(`Too Many Requests: ${error.message}`);
        logger.info(`Waiting for ${waitTime / 1000} seconds before retrying...`);
        await setTimeout(waitTime);
        retries += 1;
      } else {
        logger.error(`Request failed: ${error.message}`);
        return posts; // Exit and return fetched posts so far
      }
    }
  }

  logger.error(`Max retries reached for URL: ${url}`);
  return posts; // Exit and return fetched posts so far
}

import emojiRegex from 'emoji-regex';
let eRegex = emojiRegex();
function _removeEmojis(text) {
  return text.replace(eRegex, '');
}

export { fetchPosts };