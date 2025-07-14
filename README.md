# User API Server

A JSON Server-based API with custom endpoints for user management.

## Getting Started

### Installation
```bash
npm install
```

### Running the Server

#### Option 1: Basic JSON Server (Default)
```bash
npm start
```

#### Option 2: Custom Server with Additional Endpoints
```bash
npm run dev
```

#### Option 3: JSON Server with Custom Routes
```bash
npm run server
```

## API Endpoints

### Basic JSON Server Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user by ID |
| PATCH | `/users/:id` | Partially update user by ID |
| DELETE | `/users/:id` | Delete user by ID |

### Custom API Endpoints (Available with `npm run dev`)

#### User Retrieval (Username-based)
| Method | Endpoint | Description | Example |
|--------|----------|-------------|---------|
| GET | `/api/user/:username` | Get user by username (primary identifier) | `/api/user/AB123456` |
| GET | `/api/users/:username` | Get user by username (alternative route) | `/api/users/CD789012` |
| GET | `/api/user/email/:email` | Get user by email | `/api/user/email/john.smith@nissan-usa.com` |
| GET | `/api/user/role/:role` | Get users by role | `/api/user/role/Sales` |
| GET | `/api/user/profile/:username` | Get user profile by username (limited fields) | `/api/user/profile/XD431834` |

#### User Management (Username-based)
| Method | Endpoint | Description | Example |
|--------|----------|-------------|---------|
| PUT | `/api/users/:username` | Update user by username | `/api/users/AB123456` |
| DELETE | `/api/users/:username` | Delete user by username | `/api/users/AB123456` |

#### Advanced Search
| Method | Endpoint | Description | Example |
|--------|----------|-------------|---------|
| GET | `/api/users/search` | Search users with multiple filters | `/api/users/search?q=john&role=Admin` |

#### Search Parameters
- `q`: Search in username, firstName, lastName, emailAddress
- `role`: Filter by primaryRole
- `userType`: Filter by userType (D, A, U)
- `accessLevel`: Filter by accessLevel (Admin, Manager, User)

### Example Usage

#### Get User by Username (Primary Identifier)
```bash
curl -X GET http://localhost:3000/api/user/AB123456
```

#### Get User by Username (Alternative Route)
```bash
curl -X GET http://localhost:3000/api/users/CD789012
```

#### Get User by Email
```bash
curl -X GET http://localhost:3000/api/user/email/jane.doe@nissan-usa.com
```

#### Get Users by Role
```bash
curl -X GET http://localhost:3000/api/user/role/Sales
```

#### Get User Profile by Username (Limited Fields)
```bash
curl -X GET http://localhost:3000/api/user/profile/XD431834
```

#### Update User by Username
```bash
curl -X PUT http://localhost:3000/api/users/AB123456 \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Jonathan", "accessLevel": "SuperAdmin"}'
```

#### Delete User by Username
```bash
curl -X DELETE http://localhost:3000/api/users/AB123456
```

#### Search Users
```bash
# Search by name
curl -X GET "http://localhost:3000/api/users/search?q=john"

# Search by multiple criteria
curl -X GET "http://localhost:3000/api/users/search?role=Sales&userType=D"

# Search with access level
curl -X GET "http://localhost:3000/api/users/search?accessLevel=Admin"
```

## JSON Server Query Parameters

JSON Server also supports these query parameters on the basic endpoints:

- **Filtering**: `/users?primaryRole=Sales`
- **Sorting**: `/users?_sort=firstName&_order=asc`
- **Pagination**: `/users?_page=1&_limit=10`
- **Full-text search**: `/users?q=nissan`
- **Range**: `/users?id_gte=1&id_lte=3`

## User Data Structure

Each user object contains:
- `id`: Unique identifier
- `username`: User's username
- `userType`: Type of user (D, A, U)
- `firstName`: User's first name
- `lastName`: User's last name
- `emailAddress`: User's email
- `phoneNumber`: User's phone number
- `locale`: User's locale
- `postalCode`: User's postal code
- `primaryRegion`: User's primary region
- `allowedRegions`: Regions user has access to
- `LMSPersonId`: LMS person identifier
- `primaryChannelCode`: Primary channel code
- `EID`: Employee ID
- `primaryRole`: User's primary role
- `primaryOtherRoles`: Other roles
- `primarySpecialDesignations`: Special designations
- `accessLevel`: User's access level
- `affiliateCode`: Affiliate code
- `primaryDealershipCode`: Primary dealership code
- `dealerType`: Type of dealer
- `allowedDealerships`: Dealerships user has access to
- `primaryDealerPosition`: User's position
- `primaryNMACDealerCode`: NMAC dealer code
- `allowedNMACDealerships`: NMAC dealerships user has access to
- `UDEF3`, `UDEF4`, `UDEF5`: Custom user-defined fields

## Error Handling

- Returns `404` with `{"error": "User not found"}` for non-existent users
- Returns empty object `{}` for some endpoints when user doesn't exist
- Returns empty array `[]` for search results with no matches

## Development

### Files Structure
- `db.json`: Database file with user data
- `server.js`: Custom server with additional endpoints
- `middleware.js`: Custom middleware for user-specific endpoints
- `routes.json`: Custom route mappings
- `package.json`: Project configuration
