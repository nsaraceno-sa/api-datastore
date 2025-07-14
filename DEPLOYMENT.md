# Deployment Guide for Render.com

## Prerequisites
- GitHub repository with your code
- Render.com account

## Deployment Steps

### 1. Push Your Code to GitHub
Make sure all your files are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Updated API for username-based endpoints"
git push origin main
```

### 2. Create a New Web Service on Render.com
1. Go to [Render.com](https://render.com) and log in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select your repository: `api-datastore`

### 3. Configure the Service
- **Name**: `api-datastore` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose your preferred region
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave blank (unless your code is in a subdirectory)
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (this will use our custom server)

### 4. Environment Variables
No special environment variables are needed. The app will automatically use:
- `PORT`: Automatically provided by Render.com
- `NODE_ENV`: Set to `production` by Render.com

### 5. Deploy
Click "Create Web Service" and wait for the deployment to complete.

## Testing Your Deployment

Once deployed, your API will be available at:
`https://your-service-name.onrender.com`

### Test Endpoints:
```bash
# Health check
curl https://your-service-name.onrender.com/health

# Get user by username
curl https://your-service-name.onrender.com/api/user/AB123456

# Get user profile
curl https://your-service-name.onrender.com/api/user/profile/XD431834

# Search users
curl "https://your-service-name.onrender.com/api/users/search?role=Sales"
```

## Troubleshooting

### Common Issues:

1. **404 Errors**: 
   - Make sure you're using the correct URL format
   - Check that the service is fully deployed
   - Verify the endpoints with the health check: `/health`

2. **Build Failures**:
   - Ensure `package.json` has the correct start script
   - Check that all dependencies are listed in `package.json`

3. **Server Not Starting**:
   - Make sure the start script is `node server.js`
   - Check Render.com logs for error messages

### Debugging Steps:
1. Check the health endpoint: `https://your-service-name.onrender.com/health`
2. Review the deployment logs in Render.com dashboard
3. Test endpoints one by one using the examples above

## URL Structure
Your deployed API will have these endpoints:
- `https://your-service-name.onrender.com/api/user/:username`
- `https://your-service-name.onrender.com/api/users/:username`
- `https://your-service-name.onrender.com/api/user/email/:email`
- `https://your-service-name.onrender.com/api/user/role/:role`
- `https://your-service-name.onrender.com/api/user/profile/:username`
- `https://your-service-name.onrender.com/api/users/search`

## Important Notes:
- Render.com may take a few minutes to deploy
- Free tier services may spin down after inactivity
- The first request after inactivity may take longer to respond
- Check the Render.com dashboard for deployment status and logs
