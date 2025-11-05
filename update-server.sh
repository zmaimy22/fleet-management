#!/bin/bash

# 🚀 Fleet Management - Auto Update Script
# تحديث تلقائي للموقع من GitHub

echo "🚀 بدء تحديث الموقع من GitHub..."
echo "================================================"

# الانتقال إلى مجلد المشروع
cd ~/projects/fleet-management

echo "📥 جلب آخر التحديثات من GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ فشل في جلب التحديثات!"
    exit 1
fi

echo "📦 تثبيت التبعيات الجديدة (إن وجدت)..."
npm install

echo "🏗️  بناء المشروع..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ فشل في بناء المشروع!"
    exit 1
fi

echo "📂 نسخ الملفات إلى الخادم..."
sudo rm -rf /var/www/html/*
sudo cp -rv dist/* /var/www/html/

echo "🔒 ضبط الصلاحيات..."
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

echo "🔄 إعادة تشغيل Nginx..."
sudo service nginx restart

echo "================================================"
echo "✅ تم تحديث الموقع بنجاح!"
echo "🌐 الموقع متاح على: http://localhost"
echo "================================================"
