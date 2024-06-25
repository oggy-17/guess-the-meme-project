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
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 30
  }
}));

app.use(passport.initialize());
app.use(passport.session());

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
    user_game_id INTEGER,
    score INTEGER,
    timestamp TEXT
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER,
    meme_id INTEGER,
    selected_caption_id INTEGER,
    is_correct BOOLEAN
  )`);
  await db.run(`CREATE TABLE IF NOT EXISTS correct_captions (
    round_id INTEGER,
    caption_id INTEGER,
    FOREIGN KEY (round_id) REFERENCES rounds(id),
    FOREIGN KEY (caption_id) REFERENCES captions(id)
  )`);
})();

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

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() || req.query.guest) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).send(info.message || 'Invalid username or password');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.send('Logged in');
    });
  })(req, res, next);
});

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Error in logout');
      }
      res.send('Logged out');
    });
  });
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).send('User registered');
  } catch (err) {
    res.status(500).send('User registration failed');
  }
});

app.get('/api/meme', ensureAuthenticated, async (req, res) => {
  try {
    const meme = await db.get('SELECT * FROM memes ORDER BY RANDOM() LIMIT 1');
    if (!meme) {
      return res.status(404).json({ error: 'No meme found' });
    }

    const correctCaptions = await db.all('SELECT c.id, c.text FROM captions c JOIN meme_captions mc ON c.id = mc.caption_id WHERE mc.meme_id = ? AND mc.best_match = 1', [meme.id]);
    const incorrectCaptions = await db.all('SELECT c.id, c.text FROM captions c JOIN meme_captions mc ON c.id = mc.caption_id WHERE mc.meme_id = ? AND mc.best_match = 0', [meme.id]);

    if (correctCaptions.length < 2 || incorrectCaptions.length < 5) {
      return res.status(500).json({ error: 'Not enough captions found' });
    }

    const selectedCaptions = [
      ...correctCaptions.slice(0, 2),
      ...incorrectCaptions.slice(0, 5)
    ].sort(() => Math.random() - 0.5);

    res.json({ meme, captions: selectedCaptions });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/submit', ensureAuthenticated, async (req, res) => {
  const { meme_id, caption_id } = req.body;
  const bestMatchCaptions = await db.all('SELECT caption_id FROM meme_captions WHERE meme_id = ? AND best_match = 1', [meme_id]);
  const isCorrect = bestMatchCaptions.some(c => c.caption_id === caption_id);

  // Fetch the correct captions to send back
  const correctCaptions = await db.all('SELECT c.id, c.text FROM captions c JOIN meme_captions mc ON c.id = mc.caption_id WHERE mc.meme_id = ? AND mc.best_match = 1', [meme_id]);

  res.json({ isCorrect, correctCaptions });
});

app.post('/api/save-game', ensureAuthenticated, async (req, res) => {
  const { results, score } = req.body;
  const user = req.user;

  try {
    const timestamp = new Date().toISOString();
    const maxGameId = await db.get('SELECT MAX(user_game_id) AS max_id FROM games WHERE user_id = ?', [user.id]);
    const userGameId = (maxGameId.max_id || 0) + 1;

    const { lastID: gameId } = await db.run('INSERT INTO games (user_id, user_game_id, score, timestamp) VALUES (?, ?, ?, ?)', [user.id, userGameId, score, timestamp]);

    for (const result of results) {
      const { lastID: roundId } = await db.run('INSERT INTO rounds (game_id, meme_id, selected_caption_id, is_correct) VALUES (?, ?, ?, ?)', [
        gameId,
        result.meme.id,
        result.selectedCaption ? result.selectedCaption.id : null,
        result.isCorrect
      ]);

      // Store correct captions for the round
      for (const caption of result.correctCaptions) {
        await db.run('INSERT INTO correct_captions (round_id, caption_id) VALUES (?, ?)', [
          roundId,
          caption.id
        ]);
      }
    }

    res.status(201).send('Game saved');
  } catch (err) {
    res.status(500).send('Failed to save game');
  }
});

app.get('/api/games', ensureAuthenticated, async (req, res) => {
  const user = req.user;
  try {
    const games = await db.all('SELECT * FROM games WHERE user_id = ? ORDER BY user_game_id DESC', [user.id]);
    const gameDetails = await Promise.all(games.map(async (game) => {
      const rounds = await db.all('SELECT * FROM rounds WHERE game_id = ?', [game.id]);
      const roundsDetails = await Promise.all(rounds.map(async (round) => {
        const meme = await db.get('SELECT * FROM memes WHERE id = ?', [round.meme_id]);
        const caption = await db.get('SELECT text FROM captions WHERE id = ?', [round.selected_caption_id]);
        const correctCaptions = await db.all('SELECT c.text FROM correct_captions cc JOIN captions c ON cc.caption_id = c.id WHERE cc.round_id = ?', [round.id]);
        return { ...round, meme, selected_caption: caption ? caption.text : null, correctCaptions };
      }));
      return { ...game, rounds: roundsDetails };
    }));
    res.json(gameDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
