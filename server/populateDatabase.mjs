// server/populateDatabase.mjs

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function setup() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS memes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS captions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meme_captions (
      meme_id INTEGER,
      caption_id INTEGER,
      is_correct INTEGER,
      FOREIGN KEY (meme_id) REFERENCES memes(id),
      FOREIGN KEY (caption_id) REFERENCES captions(id)
    );
  `);

  const memes = [
    { url: '/memes/meme1.jpg' },
    { url: '/memes/meme2.jpg' },
    { url: '/memes/meme3.jpg' },
    { url: '/memes/meme4.jpg' },
    { url: '/memes/meme5.jpg' },
    { url: '/memes/meme6.jpg' },
    { url: '/memes/meme7.jpg' },
    { url: '/memes/meme8.jpg' },
    { url: '/memes/meme9.jpg' },
    { url: '/memes/meme10.jpg' },
    { url: '/memes/meme11.jpg' },
    { url: '/memes/meme12.jpg' },
  ];

  const captions = [
    // Captions for meme1
    "When you realize it's Monday tomorrow", // correct
    "That feeling when you finally get home", // correct
    "Trying to act cool but failing miserably",
    "When your favorite song comes on",
    "When you step on a Lego",
    "When you win an argument online",
    "When you accidentally hit 'reply all'",
    
    // Captions for meme2
    "When you forget why you walked into a room", // correct
    "When you see your ex at a party", // correct
    "When someone says 'we need to talk'",
    "When you wake up late for work",
    "When you find money in your old coat",
    "When you realize you sent the wrong text",
    "When you find out it's Friday",

    // Captions for meme3
    "When you realize you left your phone at home", // correct
    "When your team wins the championship", // correct
    "When you can't find the remote",
    "When you see a spider in your room",
    "When your friend makes a bad joke",
    "When you burn your toast",
    "When you accidentally like an old post",

    // Captions for meme4
    "When you finish a series and don't know what to do with your life", // correct
    "When your favorite character dies", // correct
    "When you realize the weekend is over",
    "When you drop your ice cream",
    "When you see someone you know in public",
    "When you step in a puddle with socks on",
    "When you get a text from your crush",

    // Captions for meme5
    "When you wake up from a nap and don't know what day it is", // correct
    "When you laugh at your own joke", // correct
    "When you realize you left the stove on",
    "When you try to take a selfie but the camera is on reverse",
    "When you hear your alarm in your dream",
    "When you trip in public and try to play it cool",
    "When you can't remember if you locked the door",

    // Captions for meme6
    "When you find out your friends went out without you", // correct
    "When you finally finish your homework", // correct
    "When you wake up and realize you still have time to sleep",
    "When your package finally arrives",
    "When you find out it's a holiday",
    "When you get the last slice of pizza",
    "When your favorite show gets renewed for another season",

    // Captions for meme7
    "When you realize you left your charger at home", // correct
    "When you get an unexpected day off", // correct
    "When you realize your phone battery is about to die",
    "When you get caught in the rain without an umbrella",
    "When your friend cancels plans last minute",
    "When you see your favorite food on the menu",
    "When you find out the test is postponed",

    // Captions for meme8
    "When you realize you sent a text to the wrong person", // correct
    "When you get a compliment from a stranger", // correct
    "When you wake up early and can't go back to sleep",
    "When you find out your crush is single",
    "When you finally beat a level you've been stuck on",
    "When you get a promotion at work",
    "When you finish your workout",

    // Captions for meme9
    "When you realize you have a meeting in 5 minutes", // correct
    "When you find out there's free food at work", // correct
    "When you accidentally like an old photo on Instagram",
    "When you get a like from your crush",
    "When you find out your favorite band is coming to town",
    "When you win a raffle",
    "When you get a refund",

    // Captions for meme10
    "When you see a cute dog on the street", // correct
    "When your friend tells a hilarious joke", // correct
    "When you find money on the ground",
    "When you get your test results back",
    "When you successfully parallel park",
    "When you get a high score in a game",
    "When you finish a book",

    // Captions for meme11
    "When you can't stop laughing at a meme", // correct
    "When you find out your favorite show has a new season", // correct
    "When you accidentally call someone",
    "When you get locked out of your house",
    "When you lose your keys",
    "When you see a rainbow",
    "When you win a game of rock-paper-scissors",

    // Captions for meme12
    "When you see a baby smile at you", // correct
    "When you find out you got the job", // correct
    "When you finish a big project",
    "When you solve a difficult puzzle",
    "When you find out you have a day off",
    "When you get a new high score",
    "When you hear your favorite song on the radio",
  ];

  await db.exec('DELETE FROM memes');
  await db.exec('DELETE FROM captions');
  await db.exec('DELETE FROM meme_captions');

  for (const meme of memes) {
    await db.run('INSERT INTO memes (url) VALUES (?)', [meme.url]);
  }

  const insertedCaptions = [];

  for (const caption of captions) {
    const { lastID } = await db.run('INSERT INTO captions (text) VALUES (?)', [caption]);
    insertedCaptions.push({ id: lastID, text: caption });
  }

  const memeCaptions = [
    { memeIndex: 0, captionIndexes: [0, 1, 2, 3, 4, 5, 6], correctIndexes: [0, 1] },
    { memeIndex: 1, captionIndexes: [7, 8, 9, 10, 11, 12, 13], correctIndexes: [7, 8] },
    { memeIndex: 2, captionIndexes: [14, 15, 16, 17, 18, 19, 20], correctIndexes: [14, 15] },
    { memeIndex: 3, captionIndexes: [21, 22, 23, 24, 25, 26, 27], correctIndexes: [21, 22] },
    { memeIndex: 4, captionIndexes: [28, 29, 30, 31, 32, 33, 34], correctIndexes: [28, 29] },
    { memeIndex: 5, captionIndexes: [35, 36, 37, 38, 39, 40, 41], correctIndexes: [35, 36] },
    { memeIndex: 6, captionIndexes: [42, 43, 44, 45, 46, 47, 48], correctIndexes: [42, 43] },
    { memeIndex: 7, captionIndexes: [49, 50, 51, 52, 53, 54, 55], correctIndexes: [49, 50] },
    { memeIndex: 8, captionIndexes: [56, 57, 58, 59, 60, 61, 62], correctIndexes: [56, 57] },
    { memeIndex: 9, captionIndexes: [63, 64, 65, 66, 67, 68, 69], correctIndexes: [63, 64] },
    { memeIndex: 10, captionIndexes: [70, 71, 72, 73, 74, 75, 76], correctIndexes: [70, 71] },
    { memeIndex: 11, captionIndexes: [77, 78, 79, 80, 81, 82, 83], correctIndexes: [77, 78] },
  ];

  for (const memeCaption of memeCaptions) {
    const memeId = memeCaption.memeIndex + 1; // memes array index + 1 for 1-based IDs
    for (const captionIndex of memeCaption.captionIndexes) {
      const captionId = insertedCaptions[captionIndex].id;
      const isCorrect = memeCaption.correctIndexes.includes(captionIndex) ? 1 : 0;
      await db.run('INSERT INTO meme_captions (meme_id, caption_id, is_correct) VALUES (?, ?, ?)', [memeId, captionId, isCorrect]);
    }
  }

  console.log('Database populated successfully');
}

setup().catch(console.error);
