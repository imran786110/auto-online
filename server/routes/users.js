const express = require('express');
const { db } = require('../database/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/:id', (req, res) => {
  db.get(
    'SELECT id, email, fullName, createdAt FROM users WHERE id = ?',
    [req.params.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    }
  );
});

// Update user profile
router.put('/profile', authenticate, (req, res) => {
  const { firstName, lastName, phone, address, city, postalCode, country } = req.body;
  const fullName = `${firstName} ${lastName}`;

  db.run(
    `UPDATE users
     SET fullName = ?, firstName = ?, lastName = ?, phone = ?, address = ?, city = ?, postalCode = ?, country = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [fullName, firstName, lastName, phone, address, city, postalCode, country, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      // Return updated user data
      db.get(
        'SELECT id, email, fullName, firstName, lastName, phone, address, city, postalCode, country, role, createdAt FROM users WHERE id = ?',
        [req.user.userId],
        (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch updated profile' });
          }

          res.json({
            message: 'Profile updated successfully',
            user
          });
        }
      );
    }
  );
});

// Contact car owner
router.post('/contact', authenticate, (req, res) => {
  const { toUserId, listingId, message } = req.body;

  if (!message || !toUserId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO contacts (fromUserId, toUserId, listingId, message) VALUES (?, ?, ?, ?)',
    [req.user.userId, toUserId, listingId, message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to send message' });
      }

      res.status(201).json({
        message: 'Message sent successfully',
        contactId: this.lastID
      });
    }
  );
});

module.exports = router;
