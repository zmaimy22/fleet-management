#!/bin/bash

# Script to update Ubuntu server with latest code

echo "🔄 Updating Fleet Management on Ubuntu Server..."

# Navigate to project directory
cd ~/projects/fleet-management

# Stash local changes
echo "📦 Stashing local changes..."
git stash

# Pull latest changes
echo "⬇️ Pulling from GitHub..."
git pull origin main

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install terser if not present
echo "📦 Installing terser (required for build)..."
npm install terser --save-dev

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Copy to nginx
echo "📋 Copying to nginx..."
sudo rm -rf /var/www/html/*
sudo cp -rv dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Restart/Start backend with PM2
echo "🔄 Managing backend server..."
if pm2 list | grep -q "fleet-api"; then
    echo "Restarting backend..."
    pm2 restart fleet-api
else
    echo "Starting backend for first time..."
    pm2 start server/server.js --name fleet-api
    pm2 save
fi

echo "✅ Update complete!"
echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🌐 Access your app at: http://localhost"
echo "📡 API Health: http://localhost/api/health"
