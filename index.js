// 📁 auth-service/index.js
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const USERS = [{ id: '1', email: 'test@example.com', password: '123456' }];
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      roles: ['user'],
      aud: ['api_a', 'api_b'],
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate Refresh Token (in production, store securely)
const generateRefreshToken = (user) => {
  return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' });
};

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.json({ accessToken, refreshToken });
});

app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const user = USERS.find((u) => u.id === payload.sub);
    if (!user) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.sendStatus(403);
  }
});

app.listen(3001, () => console.log('Auth Service running on port 3001'));