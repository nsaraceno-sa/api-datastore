const express = require('express');
const fs = require('fs');
const path = require('path');

// Custom middleware for user-specific endpoints
const userMiddleware = (req, res, next) => {
  // Log incoming requests for debugging
  const apiKey = req.headers['x-api-key'] || req.headers['api-key'] || req.query.apiKey;
  console.log(`${req.method} ${req.path} - API Key: ${apiKey ? 'Valid' : 'Missing'}`);
  
  // Read the database
  const dbPath = path.join(__dirname, 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // Custom endpoint: Get user by username (primary identifier)
  if (req.path.match(/^\/api\/user\/([^\/]+)$/) && !req.path.includes('/email/') && !req.path.includes('/role/') && !req.path.includes('/profile/')) {
    const username = req.path.split('/').pop();
    const user = db.users.find(u => u.username === username);
    
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  }
  
  // Custom endpoint: Get user by email
  if (req.path.match(/^\/api\/user\/email\/(.+)$/)) {
    const email = req.path.split('/').pop();
    const user = db.users.find(u => u.emailAddress === email);
    
    if (user) {
      return res.json(user);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  }
  
  // Custom endpoint: Get users by role
  if (req.path.match(/^\/api\/user\/role\/(.+)$/)) {
    const role = req.path.split('/').pop();
    const users = db.users.filter(u => u.primaryRole === role);
    
    return res.json(users);
  }
  
  // Custom endpoint: Get user profile by username (limited fields)
  if (req.path.match(/^\/api\/user\/profile\/(.+)$/)) {
    const username = req.path.split('/').pop();
    const user = db.users.find(u => u.username === username);
    
    if (user) {
      const profile = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        primaryRole: user.primaryRole,
        accessLevel: user.accessLevel
      };
      return res.json(profile);
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  }
  
  // Continue to next middleware
  next();
};

module.exports = userMiddleware;
