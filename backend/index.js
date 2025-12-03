import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';
const DB_PATH = path.join(__dirname, '..', 'db.json');

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

const stateStore = new Map();

app.use(cors());
app.use(express.json());

async function readDB() {
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function generateToken(userId, email) {
  return jwt.sign(
    { sub: userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await readDB();

    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      email,
      password: hashedPassword,
      id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1
    };

    db.users.push(newUser);
    await writeDB(db);

    const accessToken = generateToken(newUser.id, newUser.email);

    res.status(201).json({ accessToken });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await readDB();

    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateToken(user.id, user.email);

    res.json({ accessToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/tasks/:userId', verifyToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    if (req.user.sub !== userId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other users tasks' });
    }

    const db = await readDB();
    const userTasks = db.tasks.filter(task => task.userId === userId);

    res.json(userTasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/tasks', verifyToken, async (req, res) => {
  try {
    const { title, completed = false } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const db = await readDB();

    const newTask = {
      userId: req.user.sub,
      id: db.tasks.length > 0 ? Math.max(...db.tasks.map(t => t.id)) + 1 : 1,
      title,
      completed
    };

    db.tasks.push(newTask);
    await writeDB(db);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, completed } = req.body;

    const db = await readDB();

    const taskIndex = db.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (db.tasks[taskIndex].userId !== req.user.sub) {
      return res.status(403).json({ error: 'Forbidden: Cannot update other users tasks' });
    }

    if (title !== undefined) {
      db.tasks[taskIndex].title = title;
    }
    if (completed !== undefined) {
      db.tasks[taskIndex].completed = completed;
    }

    await writeDB(db);

    res.json(db.tasks[taskIndex]);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const db = await readDB();

    const taskIndex = db.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (db.tasks[taskIndex].userId !== req.user.sub) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete other users tasks' });
    }

    db.tasks.splice(taskIndex, 1);
    await writeDB(db);

    res.json({ id: taskId });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/auth/google', (req, res) => {
  try {
    const state = crypto.randomBytes(32).toString('hex');

    stateStore.set(state, { createdAt: Date.now() });

    setTimeout(() => stateStore.delete(state), 10 * 60 * 1000);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      state,
      prompt: 'select_account'
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('OAuth URL generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/#/login?error=missing_params`);
    }

    if (!stateStore.has(state)) {
      return res.redirect(`${process.env.FRONTEND_URL}/#/login?error=invalid_state`);
    }

    stateStore.delete(state);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    const db = await readDB();

    let user = db.users.find(u => u.googleId === googleId);

    if (!user) {
      user = db.users.find(u => u.email === email);

      if (user) {
        user.googleId = googleId;
        user.authProvider = user.password ? 'both' : 'google';
        user.name = user.name || name;
        user.picture = picture;
      } else {
        user = {
          email,
          password: null,
          authProvider: 'google',
          googleId,
          name,
          picture,
          id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1
        };
        db.users.push(user);
      }

      await writeDB(db);
    }

    const accessToken = generateToken(user.id, user.email);

    res.redirect(`${process.env.FRONTEND_URL}/#/auth/callback?token=${accessToken}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/#/login?error=auth_failed`);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
