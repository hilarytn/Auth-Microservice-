// 📁 api-b/index.js
import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/dashboard', authenticate, (req, res) => {
  res.json({ message: `Welcome to API B, ${req.user.email}` });
});

app.listen(3003, () => console.log('API B running on port 3003'));
