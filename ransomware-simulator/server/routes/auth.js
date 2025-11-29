const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Simple authentication for demo purposes
// In production, use proper user management and authentication

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Demo credentials - replace with proper authentication
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === 'admin' && password === adminPassword) {
      const token = jwt.sign(
        { username, role: 'admin' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: { username, role: 'admin' }
      });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    res.json({ success: true, user: decoded });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

module.exports = router;
