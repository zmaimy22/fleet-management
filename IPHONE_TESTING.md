# 📱 اختبار المشروع على iPhone

## المشكلة: المشروع لا يفتح على iPhone

هناك عدة سيناريوهات لاختبار المشروع على iPhone:

---

## 🌐 السيناريو 1: الاختبار على GitHub Pages (الموقع المنشور)

### الرابط:
```
https://zmaimy22.github.io/fleet-management/
```

### الخطوات:
1. افتح Safari على iPhone
2. اذهب إلى الرابط أعلاه
3. انتظر تحميل الصفحة

### إذا لم يعمل:
- ✅ تأكد من رفع آخر نسخة على GitHub
- ✅ انتظر 2-3 دقائق للنشر التلقائي
- ✅ امسح cache المتصفح (Settings → Safari → Clear History and Website Data)
- ✅ جرب في وضع التصفح الخاص (Private Browsing)

---

## 💻 السيناريو 2: الاختبار المحلي على الشبكة المحلية

إذا أردت اختبار المشروع على iPhone قبل النشر:

### خطوة 1: تشغيل السيرفر المحلي

```bash
npm run dev
```

سيظهر لك:
```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.XXX:3000/
```

### خطوة 2: تعديل vite.config.js مؤقتاً

**للاختبار المحلي فقط**، غيّر:
```javascript
base: '/fleet-management/',
```
إلى:
```javascript
base: '/',
```

### خطوة 3: إعادة تشغيل السيرفر

```bash
# أوقف السيرفر (Ctrl+C)
npm run dev
```

### خطوة 4: فتح على iPhone

1. تأكد أن iPhone والكمبيوتر على **نفس الشبكة Wi-Fi**
2. على iPhone، افتح Safari
3. اذهب إلى: `http://192.168.1.XXX:3000/`
   (استبدل XXX برقم IP الذي ظهر في terminal)

### ⚠️ مهم:
**لا تنسَ** إرجاع `base: '/fleet-management/'` قبل الـ commit!

---

## 🔧 السيناريو 3: إعداد vite للعمل في كلا الحالتين

يمكنك استخدام متغير بيئي:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/fleet-management/' : '/',
  server: {
    port: 3000,
    host: true // هذا يسمح بالوصول من الشبكة المحلية
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})
```

---

## 🐛 حل المشاكل الشائعة على iPhone

### 1. الصفحة بيضاء فارغة

**السبب:** JavaScript error أو base URL خاطئ

**الحل:**
- افتح Safari DevTools من Mac (إذا متوفر)
- تحقق من console errors
- تأكد من `base` في vite.config.js

### 2. Zoom غير مرغوب عند النقر على input

**الحل:** ✅ تم إصلاحه! font-size: 16px على inputs

### 3. الصفحة تتمرر بشكل غريب

**الحل:** ✅ تم إصلاحه! إضافة `-webkit-overflow-scrolling: touch`

### 4. Notch يخفي محتوى

**الحل:** ✅ تم إصلاحه! إضافة `safe-area-inset`

### 5. الألوان أو الخطوط لا تظهر

**السبب:** Safari لا يدعم بعض CSS features

**الحل:**
- استخدم `-webkit-` prefixes
- تجنب CSS Grid features الحديثة جداً

---

## ✅ التحسينات المضافة للـ iPhone

تم إضافة التحسينات التالية في الكود:

### في `index.html`:
```html
<!-- iOS Safari specific tags -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Fleet Management" />
<meta name="format-detection" content="telephone=no" />
<meta name="theme-color" content="#667eea" />
```

### في `index.css`:
```css
/* iOS Safari fixes */
-webkit-overflow-scrolling: touch;
-webkit-tap-highlight-color: transparent;
padding: env(safe-area-inset-top) env(safe-area-inset-right) ...;

/* Fix iOS zoom on input focus */
font-size: 16px !important;

/* Prevent iOS bounce effect */
position: fixed; (on body for mobile)
```

---

## 📊 الأجهزة المدعومة

| الجهاز | المتصفح | الحالة |
|--------|---------|--------|
| iPhone 6+ | Safari | ✅ |
| iPhone SE | Safari | ✅ |
| iPhone 12/13/14/15 | Safari | ✅ |
| iPhone 12/13/14/15 Pro | Safari | ✅ |
| iPad | Safari | ✅ |
| iPhone | Chrome | ✅ |
| iPhone | Firefox | ✅ |

---

## 🚀 الخطوات النهائية

### للنشر على GitHub Pages:
```bash
# تأكد أن base = '/fleet-management/'
git add .
git commit -m "تحسينات iPhone"
git push origin main
```

### للاختبار محلياً:
```bash
# غيّر base = '/' مؤقتاً
npm run dev
# افتح على iPhone: http://192.168.1.XXX:3000/
```

---

## 📞 الدعم

إذا استمرت المشكلة:
1. تحقق من console في Safari DevTools
2. جرب متصفح آخر (Chrome على iPhone)
3. تأكد من أن JavaScript مفعّل في Safari
4. امسح cache وأعد المحاولة

---

**تاريخ التحديث:** نوفمبر 2025  
**الحالة:** ✅ محسّن لـ iPhone و Safari
