const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;
    const fullName = `${firstName} ${lastName}`;

    try {
      // Check if user exists
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (user) {
          return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        db.run(
          'INSERT INTO users (email, password, fullName, firstName, lastName) VALUES (?, ?, ?, ?, ?)',
          [email, hashedPassword, fullName, firstName, lastName],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create user' });
            }

            const userId = this.lastID;

            // Create token
            const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

            res.cookie('token', token, {
              httpOnly: true,
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
              secure: process.env.NODE_ENV === 'production'
            });

            // Fetch the complete user data
            db.get(
              'SELECT id, email, fullName, firstName, lastName, phone, address, city, postalCode, country, role FROM users WHERE id = ?',
              [userId],
              (err, newUser) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to fetch user data' });
                }

                res.status(201).json({
                  message: 'User registered successfully',
                  user: newUser,
                  token
                });
              }
            );
          }
        );
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          secure: process.env.NODE_ENV === 'production'
        });

        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            city: user.city,
            postalCode: user.postalCode,
            country: user.country,
            role: user.role
          },
          token
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    db.get('SELECT id, email, fullName, firstName, lastName, phone, address, city, postalCode, country, role, createdAt FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({ user });
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
