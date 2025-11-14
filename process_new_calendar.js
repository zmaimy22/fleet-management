#!/usr/bin/env node

/**
 * معالج بيانات جدول نوفمبر الجديد
 * يقرأ من HTML ويحول إلى Excel و JSON مع تحديث الـ Groups
 */

import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// البيانات المستخرجة من ملف HTML
const driversData = {
  1: { name: "ATILA GEORGE SUHAJDA", baseRoute: "R11" },
  2: { name: "MELALIAN", baseRoute: "R12" },
  4: { name: "GUSTAVO MELIAN", baseRoute: "R1" },
  6: { name: "JULIAN TAMAYO", baseRoute: "R5" },
  8: { name: "TRAIAN OLARU", baseRoute: "R15" },
  9: { name: "XERAD HERNANDEZ", baseRoute: "R13" },
  10: { name: "MHAMED KARZOUTI", baseRoute: "R1" },
  11: { name: "MOHAMMED SERBITOU", baseRoute: "R5" },
  12: { name: "BILAL IKKEN", baseRoute: "R6" },
  13: { name: "TOMAS RUBIO", baseRoute: "R8" },
  14: { name: "FEDERICO RENALDO", baseRoute: "R4" },
  15: { name: "NOUREDDIND LAGHZAOUNI", baseRoute: "R13" }
};

// نمط البيانات للشهر (30 يوم)
// يتم ملؤها حسب الأيام
const novemberSchedule = {
  'ATILA GEORGE SUHAJDA': ['R11', 'R11', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', 'R11', 'R11'],
  'MELALIAN': ['R12', 'R12', 'R12', 'R12', 'R12', '', '', 'R12', 'R12', 'R12', 'CM', 'R12', 'R12', 'CM', '', 'CM', 'R12', 'R12', 'R12', 'CM', 'R12', '', '', 'CM', 'R12', 'R12', 'R12', 'R12', 'R12'],
  'GUSTAVO MELIAN': ['R1', 'R1', '', '', 'R1', 'R1', 'R1', 'R1', 'R1', 'R1', '', '', 'R5', 'R5', 'V', 'V', 'R5', 'V', 'V', 'R12', 'R12', '', '', 'R12', 'R1', 'R1', 'R1', 'R1', 'R2'],
  'JULIAN TAMAYO': ['R1', 'R1', '', '', 'R1', 'R1', 'R1', 'R1', 'R1', 'R1', '', '', 'R5', 'R5', '', '', 'R5', 'R5', 'R5', 'R1', 'R1', '', '', 'R1', 'R2', 'R2', 'R2', 'R2', 'R2'],
  'TRAIAN OLARU': ['R15', 'R15', '', '', 'R15', 'R15', 'R7', 'R7', 'CT', 'R5', 'R13', '', '', 'V', '', 'V', 'V', 'V', 'V', 'V', 'V', '', '', 'V', 'V', 'V', 'V', 'V', 'V'],
  'XERAD HERNANDEZ': ['R13', 'R13', 'R13', 'R13', 'R13', '', '', 'R13', 'R13', 'R13', 'R13', 'R13', 'R13', '', '', 'R13', 'R13', 'R13', 'R13', 'R13', 'R13', '', '', 'R13', 'R13', 'R13', 'R13', 'R13', 'R1'],
  'MHAMED KARZOUTI': ['R1', 'R1', 'R1', 'R1', 'R1', '', '', 'R1', 'R1', 'R1', 'R1', 'R1', 'R2', '', '', 'R2', 'R2', 'R2', 'R2', 'R2', 'R1', '', '', 'R1', 'R1', 'R1', 'R3', 'R1', 'R2'],
  'MOHAMMED SERBITOU': ['R5', 'R5', '', '', 'R6', 'R6', 'R6', 'R6', 'R6', 'R6', '', '', 'R6', 'R6', 'R6', 'R6', 'HS', 'R5', 'R5', 'R5', 'R5', '', '', 'R5', 'R5', 'R5', 'HS', '', 'R6'],
  'BILAL IKKEN': ['R6', 'R6', '', '', 'R5', 'R5', 'R5', 'R5', 'R5', 'R5', '', '', 'R6', 'R6', 'R6', 'R6', 'R6', '', '', 'R5', 'R5', '', '', 'R5', 'R5', 'R5', 'R6', 'R6', 'R5'],
  'TOMAS RUBIO': ['R8', 'R8', '', '', 'R8', 'R8', 'R8', 'R8', 'R8', 'R8', '', '', 'R8', 'R8', 'R8', 'R8', 'R8', '', '', 'R8', 'R8', '', '', 'R8', 'R8', 'R8', 'R8', 'R8', 'R8'],
  'FEDERICO RENALDO': ['R4', 'CT', 'V', 'V', 'R4', 'R4', 'R4', 'CT', 'GT', 'GT', 'GT', '', '', 'R5', 'GT', 'GT', 'CM', 'GT', '', '', 'GT', '', '', 'GT', 'GT', 'R4', 'R4', 'GT', ''],
  'NOUREDDIND LAGHZAOUNI': ['R13', 'R13', '', '', 'R13', 'GT', 'R6', 'R6', 'GT', 'GT', 'GT', '', '', 'R13', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA']
};

// مفاتيح الإجازات والمناوبات
const vacationKeywords = ['V', 'HS', 'BAJA', 'INCAPACIDAD', 'PERMISO', 'P'];
const operationKeywords = ['CM', 'CT', 'GT'];

// استخراج جميع الروتات الفريدة
function extractRoutes() {
  const routes = new Set();
  
  Object.values(novemberSchedule).forEach(schedule => {
    schedule.forEach(day => {
      if (day && !vacationKeywords.includes(day) && !operationKeywords.includes(day)) {
        // استخراج الروت الأساسي (بدون الرقم العشري)
        const match = day.match(/^R\d+/);
        if (match) routes.add(match[0]);
      }
    });
  });
  
  return Array.from(routes).sort();
}

// تجميع السائقين حسب الروت
function groupByRoute() {
  const groups = {};
  
  Object.entries(novemberSchedule).forEach(([driver, schedule]) => {
    // الروت الأساسي للسائق
    const mainRoute = Object.entries(driversData).find(
      ([_, d]) => d.name === driver
    )?.[1]?.baseRoute;
    
    if (mainRoute && !groups[mainRoute]) {
      groups[mainRoute] = [];
    }
    if (mainRoute) {
      groups[mainRoute].push(driver);
    }
  });
  
  return groups;
}

// إنشاء ملف Excel
function createExcel() {
  const routes = extractRoutes();
  const days = Array.from({length: 30}, (_, i) => i + 1);
  
  // إنشاء ورقة العمل
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['NOMBRE', '', ...days], // رؤوس الأعمدة
    ...Object.entries(novemberSchedule).map(([driver, schedule]) => [
      driver, 
      '',
      ...schedule
    ])
  ]);
  
  // تعديل عروض الأعمدة
  worksheet['!cols'] = [
    { wch: 25 }, // NOMBRE
    { wch: 2 },  // فاصل
    ...days.map(() => ({ wch: 8 })) // الأيام
  ];
  
  // إنشاء المصنف
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Calendario");
  
  // حفظ الملف
  const filePath = path.join(__dirname, 'Calendario_Noviembre_2024.xlsx');
  XLSX.writeFile(workbook, filePath);
  
  console.log(`✅ تم إنشاء ملف Excel: ${filePath}`);
  return filePath;
}

// تحديث البيانات في النظام
function updateSystemData() {
  const routes = extractRoutes();
  const groups = groupByRoute();
  
  // حفظ بيانات الروتات
  const routesData = {
    month: 'November',
    year: 2024,
    routes: routes,
    created_at: new Date().toISOString(),
    source: 'html_calendar_import'
  };
  
  const routesPath = path.join(__dirname, 'server/data/routes.json');
  fs.writeFileSync(routesPath, JSON.stringify(routesData, null, 2));
  console.log(`✅ تم تحديث الروتات: ${routes.length} روت`);
  
  // حفظ بيانات الـ Groups
  const groupsData = Object.entries(groups).map(([route, drivers]) => ({
    id: route.toLowerCase(),
    name: `Ruta ${route}`,
    route: route,
    drivers: drivers,
    driverCount: drivers.length,
    created_at: new Date().toISOString(),
    source: 'calendar_auto_generated',
    month: 'November',
    year: 2024
  }));
  
  const groupsPath = path.join(__dirname, 'server/data/route-groups.json');
  fs.writeFileSync(groupsPath, JSON.stringify(groupsData, null, 2));
  console.log(`✅ تم تحديث Groups: ${groupsData.length} مجموعة`);
  
  // حفظ جدول نوفمبر الكامل
  const calendarPath = path.join(__dirname, 'server/data/november_2024_schedule.json');
  const calendarData = {
    month: 'November',
    year: 2024,
    days: 30,
    drivers: Object.entries(novemberSchedule).map(([name, schedule]) => ({
      name,
      schedule: schedule
    })),
    routes: routes,
    totalDrivers: Object.keys(novemberSchedule).length,
    created_at: new Date().toISOString(),
    source: 'html_import'
  };
  
  fs.writeFileSync(calendarPath, JSON.stringify(calendarData, null, 2));
  console.log(`✅ تم حفظ جدول نوفمبر: ${calendarData.totalDrivers} سائق`);
  
  return {
    routesCount: routes.length,
    groupsCount: groupsData.length,
    driversCount: Object.keys(novemberSchedule).length,
    groups: groupsData
  };
}

// التنفيذ الرئيسي
async function main() {
  console.log('\n📊 معالجة جدول نوفمبر الجديد...\n');
  
  try {
    // إنشاء Excel
    createExcel();
    
    // تحديث البيانات
    const result = updateSystemData();
    
    console.log('\n✅ اكتمل تحديث النظام بنجاح!');
    console.log(`   - الروتات: ${result.routesCount}`);
    console.log(`   - المجموعات: ${result.groupsCount}`);
    console.log(`   - السائقين: ${result.driversCount}`);
    console.log('\n📝 Groups الجديدة:');
    result.groups.forEach(g => {
      console.log(`   ✓ ${g.name} - ${g.drivers.length} سائق`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في المعالجة:', error.message);
    process.exit(1);
  }
}

main();
