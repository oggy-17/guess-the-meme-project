// server/index.mjs

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import bodyParser from 'body-parser';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 3001;

let db;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return done(null, false, { message: 'Incorrect username.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return done(null, false, { message: 'Incorrect password.' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Connect to the database
(async () => {
  db = await open({
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
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      score INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id INTEGER,
      meme_id INTEGER,
      selected_caption_id INTEGER,
      score INTEGER,
      FOREIGN KEY (game_id) REFERENCES games(id),
      FOREIGN KEY (meme_id) REFERENCES memes(id),
      FOREIGN KEY (selected_caption_id) REFERENCES captions(id)
    );
  `);
})();

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).send('User registered');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in');
});

app.post('/api/logout', (req, res) => {
  req.logout(err => {
    if (err) { 
      return res.status(500).send(err.message);
    }
    res.send('Logged out');
  });
});

app.get('/api/profile', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Not authenticated');
  }
  try {
    const user = req.user;
    const games = await db.all('SELECT * FROM games WHERE user_id = ?', [user.id]);
    res.json({ user, games });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/memes', async (req, res) => {
  try {
    const memes = await db.all('SELECT * FROM memes');
    if (memes.length === 0) {
      return res.status(500).send('No memes available');
    }
    const meme = memes[Math.floor(Math.random() * memes.length)];

    const correctCaptions = await db.all('SELECT * FROM captions JOIN meme_captions ON captions.id = meme_captions.caption_id WHERE meme_captions.meme_id = ? AND meme_captions.is_correct = 1', [meme.id]);
    const incorrectCaptions = await db.all('SELECT * FROM captions WHERE id NOT IN (SELECT caption_id FROM meme_captions WHERE meme_id = ?)', [meme.id]);
    
    if (correctCaptions.length < 2 || incorrectCaptions.length < 5) {
      return res.status(500).send('Not enough captions available');
    }

    const selectedIncorrectCaptions = incorrectCaptions.sort(() => 0.5 - Math.random()).slice(0, 5);
    const allCaptions = [...correctCaptions, ...selectedIncorrectCaptions].sort(() => 0.5 - Math.random());

    res.json({ meme, captions: allCaptions });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/api/rounds', async (req, res) => {
  try {
    const { gameId, memeId, selectedCaptionId, score } = req.body;
    await db.run('INSERT INTO rounds (game_id, meme_id, selected_caption_id, score) VALUES (?, ?, ?, ?)', [gameId, memeId, selectedCaptionId, score]);
    res.status(201).send('Round recorded');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
