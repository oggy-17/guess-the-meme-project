import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:5173', // Ensure this matches the client's origin
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// SQLite setup
let db;
(async () => {
  db = await open({
    filename: './database.db',
    driver: sqlite3.Database
  });
  await db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS memes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url TEXT
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS captions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS meme_captions (
    meme_id INTEGER,
    caption_id INTEGER,
    best_match BOOLEAN
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    meme_id INTEGER,
    selected_caption_id INTEGER,
    is_correct BOOLEAN
  )`);
})();

// Passport setup
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

// API routes
app.post('/login', (req, res, next) => {
  console.log('Login attempt:', req.body); // Log the login attempt
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Authentication error:', err);
      return next(err);
    }
    if (!user) {
      console.warn('Invalid username or password:', info.message);
      return res.status(401).send(info.message || 'Invalid username or password');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      console.log('User logged in:', user.username); // Log successful login
      return res.send('Logged in');
    });
  })(req, res, next);
});

app.get('/logout', (req, res) => {
  req.logout();
  res.send('Logged out');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Registering user:', { username, hashedPassword }); // Log the registration details
  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).send('User registered');
  } catch (err) {
    console.error('Registration error:', err); // Log any errors
    res.status(500).send('User registration failed');
  }
});

app.get('/api/meme', async (req, res) => {
  try {
    const meme = await db.get('SELECT * FROM memes ORDER BY RANDOM() LIMIT 1');
    if (!meme) {
      return res.status(404).json({ error: 'No meme found' });
    }

    const captions = await db.all('SELECT * FROM captions ORDER BY RANDOM() LIMIT 7');
    const bestMatchCaptions = await db.all('SELECT caption_id FROM meme_captions WHERE meme_id = ? AND best_match = 1', [meme.id]);
    
    res.json({ meme, captions, bestMatchCaptions });
  } catch (err) {
    console.error('Error fetching meme:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/submit', async (req, res) => {
  const { meme_id, caption_id } = req.body;
  const bestMatchCaptions = await db.all('SELECT caption_id FROM meme_captions WHERE meme_id = ? AND best_match = 1', [meme_id]);
  const isCorrect = bestMatchCaptions.some(c => c.caption_id === caption_id);
  res.json({ isCorrect });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
