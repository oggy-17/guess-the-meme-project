import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPromise = open({
    filename: './database.sqlite',
    driver: sqlite3.Database
});

const createTables = async () => {
    const db = await dbPromise;
    await db.exec(`
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
            PRIMARY KEY (meme_id, caption_id),
            FOREIGN KEY (meme_id) REFERENCES memes(id),
            FOREIGN KEY (caption_id) REFERENCES captions(id)
        );
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_score INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
        CREATE TABLE IF NOT EXISTS rounds (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER,
            meme_id INTEGER,
            selected_caption_id INTEGER,
            score INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (game_id) REFERENCES games(id),
            FOREIGN KEY (meme_id) REFERENCES memes(id),
            FOREIGN KEY (selected_caption_id) REFERENCES captions(id)
        );
    `);
    console.log('Tables created');
};

createTables().catch(err => console.error(err));
