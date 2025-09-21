# 🚀 Bus Tracking System - Deployment & Running Guide

## 📋 Quick Start (Local Development)

### Prerequisites
- Node.js 16+ installed
- Git installed
- MongoDB (optional, for full backend)

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/charan242726/bus-tracking-system.git
cd bus-tracking-system

# Install backend dependencies
npm install

# Setup React frontend
cd react-frontend
npm install
cd ..
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configurations:
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/bus-tracking
# JWT_SECRET=your-secret-key
```

### 3. Run Development Servers

#### Option A: Frontend Only (React App)
```bash
cd react-frontend
npm run start:windows    # Windows
npm start                # Mac/Linux
```
**Access at:** `http://localhost:3001`

#### Option B: Backend Only (API Server)
```bash
node server.js
# OR
npm start
```
**Access at:** `http://localhost:3000`

#### Option C: Full Stack (Both)
```bash
# Terminal 1: Backend
node server.js

# Terminal 2: Frontend
cd react-frontend
npm run start:windows
```

---

## 🌐 Production Deployment Options

### 1. Traditional VPS/Server Deployment

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 2: Deploy Application
```bash
# Clone repository
git clone https://github.com/charan242726/bus-tracking-system.git
cd bus-tracking-system

# Install dependencies
npm install
cd react-frontend && npm install && cd ..

# Build React app for production
cd react-frontend
npm run build
cd ..
```

#### Step 3: Configure Production Environment
```bash
# Create production environment file
nano .env

# Add production configurations:
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bus-tracking-prod
JWT_SECRET=your-production-secret
```

#### Step 4: Start with PM2
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'bus-tracking-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### 2. Nginx Configuration (Reverse Proxy)
```nginx
# /etc/nginx/sites-available/bus-tracking
server {
    listen 80;
    server_name your-domain.com;

    # Serve React build files
    location / {
        root /path/to/bus-tracking-system/react-frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bus-tracking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## ☁️ Cloud Platform Deployment

### 1. Heroku Deployment

#### Step 1: Prepare for Heroku
```bash
# Install Heroku CLI
# Windows: Download from heroku.com
# Mac: brew install heroku/brew/heroku
# Linux: snap install heroku --classic

# Login to Heroku
heroku login
```

#### Step 2: Create Heroku Apps
```bash
# Create backend app
heroku create bus-tracking-backend

# Create frontend app (optional)
heroku create bus-tracking-frontend
```

#### Step 3: Configure Backend for Heroku
Create `Procfile` in root:
```
web: node server.js
```

Update `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "heroku-postbuild": "cd react-frontend && npm install && npm run build"
  }
}
```

#### Step 4: Deploy
```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 2. Vercel Deployment (Frontend)

#### Deploy React Frontend:
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to React app
cd react-frontend

# Deploy
vercel

# Follow prompts:
# - Project name: bus-tracking-frontend
# - Framework preset: Create React App
```

#### Configure `vercel.json`:
```json
{
  "name": "bus-tracking-frontend",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": { "cache-control": "s-maxage=31536000,immutable" },
      "dest": "/static/$1"
    },
    { "src": "/favicon.ico", "dest": "/favicon.ico" },
    { "src": "/asset-manifest.json", "dest": "/asset-manifest.json" },
    { "src": "/manifest.json", "dest": "/manifest.json" },
    { "src": "/robots.txt", "dest": "/robots.txt" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### 3. Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

---

## 🐳 Docker Deployment

### 1. Create Dockerfile (Backend)
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --only=production

# Copy source code
COPY . .

# Build React app
WORKDIR /app/react-frontend
COPY react-frontend/package*.json ./
RUN npm install
RUN npm run build

# Switch back to app directory
WORKDIR /app

EXPOSE 3000
CMD ["node", "server.js"]
```

### 2. Create Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/bus-tracking
    depends_on:
      - mongo
    volumes:
      - .:/app
      - /app/node_modules
      - /app/react-frontend/node_modules

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 3. Run with Docker
```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## ⚙️ Environment Configuration

### Development (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bus-tracking
JWT_SECRET=dev-secret-key
CORS_ORIGIN=http://localhost:3001
```

### Production (.env)
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-db/bus-tracking
JWT_SECRET=secure-production-secret
CORS_ORIGIN=https://your-domain.com
```

---

## 🔍 Health Checks & Monitoring

### 1. Health Check Endpoint
Add to your `server.js`:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

### 2. PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart bus-tracking-backend

# Stop application
pm2 stop bus-tracking-backend
```

---

## 🚨 Troubleshooting

### Common Issues:

#### 1. Port Already in Use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000   # Windows
```

#### 2. Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Build Errors
```bash
# Clear React build cache
cd react-frontend
rm -rf build node_modules
npm install
npm run build
```

#### 4. Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # Mac
```

---

## 📊 Performance Optimization

### 1. Enable Gzip Compression
```javascript
// In server.js
const compression = require('compression');
app.use(compression());
```

### 2. Static File Caching
```javascript
// Serve static files with caching
app.use(express.static('react-frontend/build', {
  maxAge: '1y',
  etag: false
}));
```

### 3. Database Indexing
```javascript
// Add database indexes for better performance
db.buses.createIndex({ "location": "2dsphere" });
db.users.createIndex({ "email": 1 }, { unique: true });
```

---

## 🎯 Testing Deployment

### 1. Automated Tests
```bash
# Run backend tests
npm test

# Run frontend tests
cd react-frontend
npm test
```

### 2. Manual Testing Checklist
- [ ] Application starts without errors
- [ ] All routes are accessible
- [ ] Language switching works
- [ ] API endpoints respond correctly
- [ ] Database connections are stable
- [ ] Static files load properly

---

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs` or `docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Check port availability
5. Review firewall settings

**Repository:** https://github.com/charan242726/bus-tracking-system
