const jsonServer = require('json-server');
const userMiddleware = require('./middleware');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-client');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// API Key configuration
const API_KEY = process.env.API_KEY || 'your-default-api-key-2025';

// OIDC Configuration
const OIDC_ISSUER = 'https://us-services.dev.secureauth.com/oauth'; // e.g., 'https://your-oidc-provider.com'
const OIDC_AUDIENCE = '4e45a1c2-6d94-4dd0-b48f-9061de8f4e0a'; // e.g., 'your-audience-id'
// Initialize JWK client if OIDC is configured
let jwksClientInstance = jwksClient({
  jwksUri: `${OIDC_ISSUER}/jwks`,
  requestHeaders: {}, // Optional
  timeout: 30000, // Defaults to 30s
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000, // 10 minutes
});

// Function to get signing key from JWK
const getKey = (header, callback) => {
  jwksClientInstance.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
};

// Function to verify JWT token
const verifyJwtToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      audience: OIDC_AUDIENCE,
      issuer: OIDC_ISSUER,
      algorithms: ['RS256']
    }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

// Authentication middleware (supports API Key and JWT validation)
const authenticateApiKey = async (req, res, next) => {
  // Skip authentication for health check
  if (req.path === '/health') {
    return next();
  }
  
// Check for API key in headers or query parameter
  const providedApiKey = req.headers['x-api-key'] || req.headers['api-key'] || req.query.apiKey;
  const authHeader = req.headers.authorization;

  if (providedApiKey && providedApiKey === API_KEY) {    
    // Check for Bearer token in Authorization header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const providedToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        
      try {
        const decoded = await verifyJwtToken(providedToken);
        // Add decoded JWT payload to request for use in routes
        req.user = decoded;
        return next();
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError.message);
        return res.status(401).json({
          error: 'Invalid JWT token',
          message: jwtError.message
        });
      }
    } else{            
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please provide both, an API key (x-api-key header or apiKey query parameter) and JWT Bearer token (Authorization header)'
        });      
    }
  }
  
  // If no valid authentication method found
  if (!providedApiKey && !authHeader) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide both, an API key (x-api-key header or apiKey query parameter) and JWT Bearer token (Authorization header)'
    });
  }
  
  return res.status(403).json({
    error: 'Invalid authentication',
    message: 'The provided API key or JWT token is not valid'
  });
};

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Apply API key authentication to all routes except health check
server.use(authenticateApiKey);

// Health check endpoint
server.get('/health', (req, res) => {
  const authMethods = {
    'API Key': [
      'Header: x-api-key',
      'Header: api-key', 
      'Query parameter: apiKey'
    ],
    'JWT Bearer Token': [
      'Header: Authorization: Bearer <token>'
    ]
  };

  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    authentication: 'API key AND JWT token required for all endpoints except /health',
    authenticationMethods: authMethods,
    oidcConfiguration: {
      issuer: OIDC_ISSUER,
      audience: OIDC_AUDIENCE,
      algorithms: ['RS256'],
      jwksUri: `${OIDC_ISSUER}/jwks`
    },
    endpoints: [
      '/api/user/:username',
      '/api/users/:username',
      '/api/user/email/:email',
      '/api/user/role/:role',
      '/api/user/profile/:username',
      '/api/users/search'
    ]
  });
});

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
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
server.listen(port, host, () => {
  console.log(`JSON Server is running on ${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
