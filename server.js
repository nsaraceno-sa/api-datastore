const jsonServer = require('json-server');
const userMiddleware = require('./middleware');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom middleware for user endpoints
server.use(userMiddleware);

// Custom routes
server.get('/api/user/:username', (req, res) => {
  // This is handled by middleware
});

server.get('/api/user/email/:email', (req, res) => {
  // This is handled by middleware
});

server.get('/api/user/role/:role', (req, res) => {
  // This is handled by middleware
});

server.get('/api/user/profile/:username', (req, res) => {
  // This is handled by middleware
});

// Custom endpoint for user search
server.get('/api/users/search', (req, res) => {
  const db = router.db;
  const { q, role, userType, accessLevel } = req.query;
  
  let users = db.get('users').value();
  
  // Filter by search query (searches in username, firstName, lastName, email)
  if (q) {
    users = users.filter(user => 
      user.username.toLowerCase().includes(q.toLowerCase()) ||
      user.firstName.toLowerCase().includes(q.toLowerCase()) ||
      user.lastName.toLowerCase().includes(q.toLowerCase()) ||
      user.emailAddress.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  // Filter by role
  if (role) {
    users = users.filter(user => user.primaryRole === role);
  }
  
  // Filter by user type
  if (userType) {
    users = users.filter(user => user.userType === userType);
  }
  
  // Filter by access level
  if (accessLevel) {
    users = users.filter(user => user.accessLevel === accessLevel);
  }
  
  res.json(users);
});

// Custom endpoint to get user by username (alternative route)
server.get('/api/users/:username', (req, res) => {
  const db = router.db;
  const username = req.params.username;
  const user = db.get('users').find({ username }).value();
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Custom endpoint to update user by username
server.put('/api/users/:username', (req, res) => {
  const db = router.db;
  const username = req.params.username;
  const user = db.get('users').find({ username }).value();
  
  if (user) {
    db.get('users').find({ username }).assign(req.body).write();
    const updatedUser = db.get('users').find({ username }).value();
    res.json(updatedUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Custom endpoint to delete user by username
server.delete('/api/users/:username', (req, res) => {
  const db = router.db;
  const username = req.params.username;
  const user = db.get('users').find({ username }).value();
  
  if (user) {
    db.get('users').remove({ username }).write();
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Use default router
server.use('/api', router);
server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`JSON Server is running on port ${port}`);
});
