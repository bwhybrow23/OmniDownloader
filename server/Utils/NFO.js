import { openDb } from '../Database/db.js';
import { writeFileSync } from 'fs';
import path from 'path';
import logger from './Utils/Logger.js';

const generateNFO = async (postId) => {
    const db = await openDb();
    const post = await db.get(`SELECT * FROM posts WHERE id = ?`, [postId]);
    const files = await db.all(`SELECT * FROM files WHERE post_id = ?`, [postId]);

    if (!post) {
        logger.error(`Post with ID ${postId} not found.`);
        return;
    }

    const nfoContent = `
<movie>
    <title>${post.title}</title>
    <plot>${post.content}</plot>
    <premiered>${post.published}</premiered>
    <fileinfo>
        ${files.map(file => `<streamdetails><filename>${file.file_name}</filename></streamdetails>`).join('\n')}
    </fileinfo>
</movie>
    `.trim();

    const nfoPath = path.join('./media/', `${files[0]?.file_name || post.title}.nfo`);
    writeFileSync(nfoPath, nfoContent);

    logger.debug(`NFO file generated at: ${nfoPath}`);
};

const syncNFOs = async () => {
  const db = await openDb();
  const posts = await db.all(`SELECT id FROM posts`);

  for (const post of posts) {
      await generateNFO(post.id);
  }

  logger.info('All NFO files are up to date.');
};

export { generateNFO, syncNFOs };