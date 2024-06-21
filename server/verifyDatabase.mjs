import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

(async () => {
  const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });

  const memes = await db.all('SELECT * FROM memes');
  const captions = await db.all('SELECT * FROM captions');
  const memeCaptions = await db.all('SELECT * FROM meme_captions');

  console.log('Memes:', memes);
  console.log('Captions:', captions);
  console.log('Meme Captions:', memeCaptions);
})();
