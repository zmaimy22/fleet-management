# ⚡ Quick Start - Backend API

## 🚀 للبدء السريع على Windows:

### 1. تثبيت Dependencies للـ Backend

```bash
cd server
npm install
```

### 2. تشغيل Backend

في terminal جديد:
```bash
npm run server:dev
```

سترى:
```
🚀 Fleet Management API Server running on port 3001
📁 Data directory: C:\Users\aboja\...\server\data
🌐 API: http://localhost:3001/api
```

### 3. إنشاء ملف .env

في المجلد الرئيسي:
```bash
copy .env.example .env
```

### 4. تشغيل Frontend

في terminal آخر:
```bash
npm run dev
```

### 5. افتح المتصفح

```
http://localhost:5173
```

---

## ✅ اختبار سريع

افتح في المتصفح:
```
http://localhost:3001/api/health
```

يجب أن ترى:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

---

## 🎯 الآن البيانات تُحفظ على السيرفر!

- ✅ Calendars → `server/data/calendars.json`
- ✅ Drivers → `server/data/drivers.json`
- ✅ Routes → `server/data/routes.json`
- ✅ Vacation Requests → `server/data/vacation-requests.json`
- ✅ Route Groups → `server/data/route-groups.json`

---

## 📝 ملاحظات

1. السيرفر يجب أن يكون **مشغلاً** طوال الوقت
2. إذا أوقفت السيرفر، سيعود التطبيق لاستخدام localStorage
3. البيانات في `server/data/` آمنة ودائمة

---

## 🐧 للنشر على Ubuntu Server

راجع: `BACKEND_SETUP.md`

---

**استمتع! 🎉**
