# 🚀 Backend API Setup Guide

دليل إعداد Backend API للنظام

---

## 📋 المتطلبات

- Node.js v16+ 
- npm أو yarn

---

## ⚙️ الإعداد المحلي (Windows)

### 1. تثبيت Dependencies للـ Server

```bash
cd server
npm install
```

### 2. تشغيل السيرفر

```bash
npm run dev
```

السيرفر سيعمل على: `http://localhost:3001`

### 3. تكوين Frontend

انسخ `.env.example` إلى `.env`:

```bash
# في المجلد الرئيسي
copy .env.example .env
```

محتوى `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

### 4. تشغيل Frontend

```bash
npm run dev
```

---

## 🐧 الإعداد على Ubuntu Server

### 1. نقل الملفات

```bash
# على جهازك (Windows)
cd c:\Users\aboja\CascadeProjects\fleet-management
git add .
git commit -m "Add Backend API"
git push origin main

# على Ubuntu Server
cd ~/projects/fleet-management
git pull origin main
```

### 2. تثبيت Dependencies

```bash
cd ~/projects/fleet-management/server
npm install
```

### 3. تجربة السيرفر

```bash
npm start
```

### 4. إعداد PM2 (Process Manager)

```bash
# تثبيت PM2 عالمياً
sudo npm install -g pm2

# تشغيل السيرفر مع PM2
cd ~/projects/fleet-management/server
pm2 start server.js --name fleet-api

# حفظ التكوين
pm2 save

# إعداد PM2 للبدء التلقائي
pm2 startup
# نفذ الأمر الذي سيظهر لك

# التحقق من الحالة
pm2 status
pm2 logs fleet-api
```

### 5. تكوين Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

أضف هذا القسم داخل `server {}`:

```nginx
# API Proxy
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
}
```

اختبر وأعد تشغيل Nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 6. بناء Frontend للإنتاج

```bash
cd ~/projects/fleet-management

# إنشاء ملف .env للإنتاج
echo "VITE_API_URL=/api" > .env

# بناء المشروع
npm run build

# نسخ للـ Nginx
sudo rm -rf /var/www/html/*
sudo cp -rv dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

---

## ✅ التحقق من العمل

### 1. اختبار API مباشرة

```bash
# Health Check
curl http://localhost:3001/api/health

# أو من متصفح
http://your-server-ip/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "2024-11-06T00:32:00.000Z"
}
```

### 2. اختبار من Frontend

افتح الموقع في المتصفح:
- المحلي: `http://localhost:5173`
- الإنتاج: `http://your-server-ip`

افتح Console (F12) وابحث عن:
- ✅ لا توجد أخطاء API
- ✅ البيانات تُحفظ وتُقرأ بنجاح

---

## 🔧 أوامر PM2 المفيدة

```bash
# عرض الحالة
pm2 status

# عرض السجلات
pm2 logs fleet-api

# إعادة التشغيل
pm2 restart fleet-api

# إيقاف
pm2 stop fleet-api

# بدء
pm2 start fleet-api

# حذف
pm2 delete fleet-api

# معلومات مفصلة
pm2 info fleet-api
```

---

## 📁 هيكل الملفات

```
fleet-management/
├── server/
│   ├── server.js           # Express server
│   ├── package.json        # Server dependencies
│   ├── data/              # JSON storage (auto-created)
│   │   ├── calendars.json
│   │   ├── drivers.json
│   │   ├── routes.json
│   │   ├── vacation-requests.json
│   │   └── route-groups.json
│   └── README.md
├── src/
│   └── utils/
│       └── api.js          # API client with fallback
├── .env                    # API configuration
└── BACKEND_SETUP.md        # هذا الملف
```

---

## 🔄 النسخ الاحتياطي

### إنشاء نسخة احتياطية

```bash
cd ~/projects/fleet-management/server
tar -czf backup-$(date +%Y%m%d).tar.gz data/
```

### استعادة من نسخة احتياطية

```bash
cd ~/projects/fleet-management/server
tar -xzf backup-20241106.tar.gz
```

---

## 🐛 استكشاف الأخطاء

### السيرفر لا يعمل

```bash
# تحقق من المنفذ 3001
sudo lsof -i :3001

# تحقق من سجلات PM2
pm2 logs fleet-api

# أعد تشغيل
pm2 restart fleet-api
```

### Frontend لا يتصل بـ API

1. تحقق من `.env`:
   ```
   VITE_API_URL=/api
   ```

2. أعد بناء Frontend:
   ```bash
   npm run build
   sudo cp -rv dist/* /var/www/html/
   ```

3. تحقق من Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

### البيانات لا تُحفظ

```bash
# تحقق من مجلد data
cd ~/projects/fleet-management/server/data
ls -la

# تحقق من الصلاحيات
chmod 755 data/
```

---

## 🎯 المزايا

✅ **حفظ دائم**: البيانات تُحفظ على السيرفر
✅ **نسخ احتياطي سهل**: ملفات JSON بسيطة
✅ **Fallback**: يعمل مع localStorage إذا فشل API
✅ **مشاركة البيانات**: الوصول من أي جهاز
✅ **سرعة**: JSON files أسرع من Database لهذا الحجم

---

## 📞 الدعم

إذا واجهت مشكلة:
1. تحقق من السجلات: `pm2 logs fleet-api`
2. تحقق من Nginx: `sudo tail -f /var/log/nginx/error.log`
3. تحقق من Console المتصفح (F12)

---

**جاهز! 🚀**
