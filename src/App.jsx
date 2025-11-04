import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import Navbar from './components/Navbar';
import Calendar from './components/Calendar';
import DriversList from './components/DriversList';
import RoutesList from './components/RoutesList';
import Stats from './components/Stats';
import CoverageStats from './components/CoverageStats';
import CellEditModal from './components/CellEditModal';
import { scheduleData } from './data/drivers';
import { useRoutes } from './hooks/useRoutes';
import { useDrivers } from './hooks/useDrivers';

function App() {
  const { routeCodes } = useRoutes();
  const { drivers } = useDrivers();
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentMonth, setCurrentMonth] = useState(10); // November
  const [currentYear, setCurrentYear] = useState(2025);
  const [schedule, setSchedule] = useState(scheduleData);
  const [missingRoutesByDay, setMissingRoutesByDay] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  // Load calendar for specific month
  const loadCalendar = (month, year) => {
    const monthKey = `${year}-${month}`;
    const saved = localStorage.getItem('savedCalendars');
    if (saved) {
      try {
        const calendars = JSON.parse(saved);
        if (calendars[monthKey]) {
          setSchedule(calendars[monthKey]);
        } else {
          // Create empty schedule for new month
          setSchedule({});
        }
      } catch (e) {
        setSchedule({});
      }
    }
  };

  // Save current calendar
  const saveCalendar = (scheduleData) => {
    const monthKey = `${currentYear}-${currentMonth}`;
    const saved = localStorage.getItem('savedCalendars');
    let calendars = {};
    if (saved) {
      try {
        calendars = JSON.parse(saved);
      } catch (e) {
        calendars = {};
      }
    }
    calendars[monthKey] = scheduleData;
    localStorage.setItem('savedCalendars', JSON.stringify(calendars));
  };

  // Handle month change
  const handleMonthChange = (month, year) => {
    // Save current before switching
    saveCalendar(schedule);
    setCurrentMonth(month);
    setCurrentYear(year);
    loadCalendar(month, year);
  };

  const handleCellClick = (driver, day, cellData) => {
    setSelectedCell({ driver, day, cellData });
    setModalOpen(true);
  };

  const handleGenerateFourTwo = () => {
    // Calculate days dynamically based on current month and year
    const days = new Date(currentYear, currentMonth + 1, 0).getDate();
    const allRoutes = routeCodes; // use configured routes list
    const next = { ...schedule };
    const missing = {};
    
    // Calculate previous month info for user message
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthKey = `${prevYear}-${prevMonth}`;
    const monthNames = ['يناير/Jan', 'فبراير/Feb', 'مارس/Mar', 'أبريل/Apr', 'مايو/May', 'يونيو/Jun', 
                        'يوليو/Jul', 'أغسطس/Aug', 'سبتمبر/Sep', 'أكتوبر/Oct', 'نوفمبر/Nov', 'ديسمبر/Dec'];

    // Helper: infer starting position of 4/2 pattern from previous month
    const inferStartIndex = (driverId) => {
      // Use cached prev month values
      const prevMonthKey = `${prevYear}-${prevMonth}`;
      
      // Load previous month's schedule
      const saved = localStorage.getItem('savedCalendars');
      let prevSchedule = null;
      if (saved) {
        try {
          const calendars = JSON.parse(saved);
          prevSchedule = calendars[prevMonthKey];
        } catch (e) {
          prevSchedule = null;
        }
      }
      
      // If no previous month data, start from beginning of pattern
      if (!prevSchedule || !prevSchedule[driverId]) return 0;
      
      // Look at last 6 days of previous month
      const prevMonthDays = new Date(prevYear, prevMonth + 1, 0).getDate();
      const window = [];
      for (let d = Math.max(1, prevMonthDays - 5); d <= prevMonthDays; d++) {
        const cell = prevSchedule[driverId]?.[d];
        if (!cell) continue;
        window.push(cell.type);
      }
      
      if (window.length === 0) return 0; // default
      
      // Map types to pattern: work => W, weekend/off => O
      const mapType = (t) => (t === 'weekend' ? 'O' : 'W');
      const seq = window.map(mapType).join('');
      
      // Determine how many consecutive off days at end (0,1,2)
      const m = seq.match(/O+$/);
      const offTail = m ? Math.min(m[0].length, 2) : 0;
      
      // If ending with off days
      if (offTail === 1) return 5; // continue second off day
      if (offTail === 2) return 0; // back to work after 2 off days
      
      // Count work streak tail (max 4)
      const wm = seq.match(/W+$/);
      const wTail = wm ? Math.min(wm[0].length, 4) : 0;
      
      // Continue the work pattern
      if (wTail >= 4) return 4; // Start off days after 4 work days
      return wTail; // Continue work days
    };

    drivers.forEach((d, idx) => {
      if (!next[d.id]) next[d.id] = {};
      const startIndex = inferStartIndex(d.id);
      for (let day = 1; day <= days; day++) {
        const existing = next[d.id][day];
        // keep strict exceptions
        if (existing && (existing.type === 'vacation' || existing.type === 'sick')) continue;

        const pi = (startIndex + day - 1) % 6; // 0-3 work, 4-5 off
        if (pi <= 3) {
          const value = d.type === 'loader' ? (pi % 2 === 0 ? 'CT' : 'CM') : '';
          next[d.id][day] = { type: 'work', value };
        } else {
          next[d.id][day] = { type: 'weekend', value: '' };
        }
      }
    });

    // Ensure route coverage per day (non-loader workers only)
    for (let day = 1; day <= days; day++) {
      // Get available drivers by category
      const availableByCategory = {
        lanzarote: drivers.filter(d => d.type === 'driver' && d.category === 'lanzarote' && next[d.id]?.[day]?.type === 'work'),
        local_morning: drivers.filter(d => d.type === 'driver' && d.category === 'local_morning' && next[d.id]?.[day]?.type === 'work'),
        local_night: drivers.filter(d => d.type === 'driver' && d.category === 'local_night' && next[d.id]?.[day]?.type === 'work'),
        other: drivers.filter(d => d.type === 'driver' && !d.category && next[d.id]?.[day]?.type === 'work')
      };
      
      const routesPool = [...allRoutes];
      const assigned = new Set();
      
      // Assign routes intelligently based on driver category
      Object.entries(availableByCategory).forEach(([category, driversList]) => {
        driversList.forEach((driver) => {
          if (routesPool.length > 0) {
            // Pick the first available route
            const route = routesPool.shift();
            next[driver.id][day].value = route;
            assigned.add(route);
          }
        });
      });
      
      // Track missing routes
      if (routesPool.length > 0) {
        missing[day] = routesPool;
      }
    }

    setSchedule(next);
    saveCalendar(next);
    setMissingRoutesByDay(missing);
    
    // Calculate statistics
    const totalDrivers = drivers.filter(d => d.type === 'driver').length;
    const totalRoutes = allRoutes.length;
    const missingDays = Object.keys(missing);
    
    // Check if previous month exists
    const saved = localStorage.getItem('savedCalendars');
    let hasPrevMonth = false;
    if (saved) {
      try {
        const calendars = JSON.parse(saved);
        hasPrevMonth = !!calendars[prevMonthKey];
      } catch (e) {}
    }
    
    // Build detailed message
    let message = `✅ تم إنشاء الجدول بنجاح! / Calendario generado!\n\n`;
    
    // Continuity info
    if (hasPrevMonth) {
      message += `📅 مواصلة من ${monthNames[prevMonth]} ${prevYear}\n`;
    } else {
      message += `🆕 جدول جديد - نمط 4/2\n`;
    }
    
    // Statistics
    message += `\n📊 الإحصائيات / Estadísticas:\n`;
    message += `👥 السائقون: ${totalDrivers} conductores\n`;
    message += `🛣️ المسارات: ${totalRoutes} rutas\n`;
    message += `📅 الأيام: ${days} días\n`;
    
    // Missing routes warning
    if (missingDays.length > 0) {
      const totalMissing = missingDays.reduce((sum, day) => sum + missing[day].length, 0);
      message += `\n⚠️ تحذير: مسارات بدون سائق!\n`;
      message += `⚠️ Advertencia: Rutas sin conductor!\n\n`;
      message += `❌ ${missingDays.length} أيام بها نقص / días con déficit\n`;
      message += `❌ ${totalMissing} مسار محتاج سائق / rutas necesitan conductor\n\n`;
      
      // Show first few problematic days
      const showDays = missingDays.slice(0, 5);
      message += `🔍 التفاصيل / Detalles:\n`;
      showDays.forEach(day => {
        const routesList = missing[day].join(', ');
        message += `• يوم ${day}: ${routesList}\n`;
      });
      
      if (missingDays.length > 5) {
        message += `\n... و ${missingDays.length - 5} أيام أخرى\n`;
      }
      
      message += `\n💡 الحل: أضف المزيد من السائقين أو قلل عدد المسارات`;
    } else {
      message += `\n✅ جميع المسارات مغطاة!\n✅ Todas las rutas cubiertas!`;
    }
    
    alert(message);
  };

  const handleUpdateCell = (driver, day, value) => {
    const next = { ...schedule };
    if (!next[driver.id]) next[driver.id] = {};
    next[driver.id][day] = value;
    setSchedule(next);
    saveCalendar(next); // Auto-save
    setModalOpen(false);
  };

  const handleSaveCell = (driver, day, newData) => {
    setSchedule(prev => ({
      ...prev,
      [driver.id]: {
        ...prev[driver.id],
        [day]: newData
      }
    }));
  };

  const handleImportFile = (file) => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    const processRows = (rows) => {
      try {
        const nameToId = new Map(drivers.map(d => [d.name.toLowerCase().trim(), d.id]));
        const newSchedule = {};
        let matched = 0;
        let unmatched = [];
        rows.forEach((row) => {
          const rawName = (row['Driver'] || row['السائق'] || '').toLowerCase().trim();
          const driverId = nameToId.get(rawName);
          if (!driverId) {
            if (rawName) unmatched.push(row['Driver'] || row['السائق']);
            return;
          }
          matched += 1;
          newSchedule[driverId] = {};
          for (let day = 1; day <= 30; day++) {
            const val = (row[String(day)] || '').toString().trim();
            const dow = new Date(2024, 10, day).getDay();
            if (!val) {
              if (dow === 0 || dow === 6) {
                newSchedule[driverId][day] = { type: 'weekend', value: '' };
              }
              continue;
            }
            const v = val.toUpperCase();
            if (v === 'V') {
              newSchedule[driverId][day] = { type: 'vacation', value: 'V' };
            } else if (v === 'BAJA') {
              newSchedule[driverId][day] = { type: 'sick', value: 'Baja' };
            } else {
              newSchedule[driverId][day] = { type: 'work', value: val };
            }
          }
        });
        setSchedule(prev => ({ ...prev, ...newSchedule }));
        if (unmatched.length) {
          alert(`تم الاستيراد مع ملاحظات. لم يتم العثور على هؤلاء الأسماء:\n${unmatched.join('\n')}`);
        } else {
          alert(`تم استيراد الجدول بنجاح لعدد ${matched} سائق.`);
        }
      } catch (e) {
        alert('فشل الاستيراد. تأكد من استخدام القالب الصحيح.');
      }
    };

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processRows(results.data),
        error: () => alert('تعذر قراءة الملف.')
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
          processRows(json);
        } catch (err) {
          alert('تعذر قراءة ملف Excel.');
        }
      };
      reader.onerror = () => alert('تعذر فتح ملف Excel.');
      reader.readAsArrayBuffer(file);
    } else {
      alert('صيغة غير مدعومة. الرجاء رفع CSV أو XLSX.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <Calendar
            drivers={drivers}
            schedule={schedule}
            onCellClick={handleCellClick}
            onImportFile={handleImportFile}
            onGenerate={handleGenerateFourTwo}
            onMonthChange={handleMonthChange}
            missingRoutes={missingRoutesByDay}
          />
        );
      case 'coverage':
        return (
          <CoverageStats
            drivers={drivers}
            schedule={schedule}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        );
      case 'drivers':
        return <DriversList />;
      case 'routes':
        return <RoutesList />;
      case 'stats':
        return <Stats drivers={drivers} schedule={schedule} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="w-full px-4 py-6">
        <div className="overflow-x-auto">
          {renderContent()}
        </div>
      </main>

      <CellEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        driver={selectedCell?.driver}
        day={selectedCell?.day}
        cellData={selectedCell?.cellData}
        onSave={handleSaveCell}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            © 2024 نظام إدارة الأسطول / Fleet Management System - جميع الحقوق محفوظة / All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
