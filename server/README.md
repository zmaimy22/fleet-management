# Fleet Management API Server

Backend API للنظام إدارة الأسطول

## 🚀 Installation

```bash
cd server
npm install
```

## 🏃 Running

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

السيرفر سيعمل على: `http://localhost:3001`

## 📡 API Endpoints

### Calendars
- `GET /api/calendars` - Get all calendars
- `GET /api/calendars/:monthKey` - Get specific calendar
- `POST /api/calendars/:monthKey` - Save calendar

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Save drivers

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Save routes

### Vacation Requests
- `GET /api/vacation-requests` - Get all vacation requests
- `POST /api/vacation-requests` - Save vacation requests

### Route Groups
- `GET /api/route-groups` - Get all route groups
- `POST /api/route-groups` - Save route groups

### Health Check
- `GET /api/health` - Server health status

## 📁 Data Storage

البيانات تُحفظ في: `server/data/`

الملفات:
- `calendars.json`
- `drivers.json`
- `routes.json`
- `vacation-requests.json`
- `route-groups.json`

## 🔧 Configuration

تغيير المنفذ (Port):
```bash
PORT=3001 npm start
```

## 🐧 Ubuntu Deployment

```bash
# 1. Install dependencies
cd ~/projects/fleet-management/server
npm install

# 2. Test
npm start

# 3. Setup PM2 (process manager)
sudo npm install -g pm2
pm2 start server.js --name fleet-api
pm2 save
pm2 startup
```

## 🔄 Nginx Configuration

Add to nginx config:
```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```
