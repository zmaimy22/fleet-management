import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import DriverDashboard from './components/DriverDashboard';
import UserManagement from './components/UserManagement';
import Navbar from './components/Navbar';
import Calendar from './components/Calendar';
import DriversList from './components/DriversList';
import RoutesList from './components/RoutesList';
import Stats from './components/Stats';
import CoverageStats from './components/CoverageStats';
import CleaningStatus from './components/CleaningStatus';
import CellEditModal from './components/CellEditModal';
import VacationRequests from './components/VacationRequests';
import { scheduleData } from './data/drivers';
import { useRoutes } from './hooks/useRoutes';
import { useDrivers } from './hooks/useDrivers';
import { getAllCalendars, saveCalendar as saveCalendarAPI, getVacationRequests, saveVacationRequests, getRouteGroups } from './utils/api';
import { generateSchedule, generateReport } from './utils/generateSchedule';

function AdminDashboard() {
  const { logout, user } = useAuth();
  const { routeCodes, routes } = useRoutes();
  const { drivers } = useDrivers();
  const [activeTab, setActiveTab] = useState('calendar');
  const [groups, setGroups] = useState([]);
  
  // Get current date
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // Current month (0-11)
  const [currentYear, setCurrentYear] = useState(today.getFullYear()); // Current year
  const [schedule, setSchedule] = useState(scheduleData);
  const [missingRoutesByDay, setMissingRoutesByDay] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  // Load groups on mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const savedGroups = await getRouteGroups();
        if (savedGroups && Array.isArray(savedGroups)) {
          setGroups(savedGroups);
        }
      } catch (error) {
        console.error('Failed to load groups:', error);
      }
    };
    loadGroups();
  }, []);

  // Load calendar for specific month
  const loadCalendar = async (month, year) => {
    const monthKey = `${year}-${month}`;
    try {
      const calendars = await getAllCalendars();
      if (calendars && calendars[monthKey]) {
        setSchedule(calendars[monthKey]);
      } else {
        // Create empty schedule for new month
        setSchedule({});
      }
    } catch (error) {
      console.error('Failed to load calendar from API:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('savedCalendars');
      if (saved) {
        try {
          const calendars = JSON.parse(saved);
          if (calendars[monthKey]) {
            setSchedule(calendars[monthKey]);
          } else {
            setSchedule({});
          }
        } catch (e) {
          setSchedule({});
        }
      }
    }
  };

  // Save current calendar
  const saveCalendar = async (scheduleData) => {
    const monthKey = `${currentYear}-${currentMonth}`;
    try {
      const calendars = await getAllCalendars();
      let calendarMap = calendars || {};
      calendarMap[monthKey] = scheduleData;
      await saveCalendarAPI(monthKey, scheduleData);
    } catch (error) {
      console.error('Failed to save calendar to API:', error);
      // Fallback: save to localStorage
      const saved = localStorage.getItem('savedCalendars');
      let calendarMap = {};
      if (saved) {
        try {
          calendarMap = JSON.parse(saved);
        } catch (e) {
          calendarMap = {};
        }
      }
      calendarMap[monthKey] = scheduleData;
      localStorage.setItem('savedCalendars', JSON.stringify(calendarMap));
    }
  };

  // Handle month change
  const handleMonthChange = async (month, year) => {
    // Save current before switching
    await saveCalendar(schedule);
    setCurrentMonth(month);
    setCurrentYear(year);
    loadCalendar(month, year);
  };

  const handleCellClick = (driver, day, cellData) => {
    setSelectedCell({ driver, day, cellData });
    setModalOpen(true);
  };

  const handleGenerateFourTwo = async () => {
    try {
      // Load approved vacation requests
      let approvedVacations = [];
      try {
        const allRequests = await getVacationRequests();
        if (allRequests && Array.isArray(allRequests)) {
          approvedVacations = allRequests.filter(r => r.status === 'approved');
        }
      } catch (error) {
        console.error('Failed to load vacation requests:', error);
        // Fallback to localStorage
        const savedRequests = localStorage.getItem('vacationRequests');
        if (savedRequests) {
          try {
            const allRequests = JSON.parse(savedRequests);
            approvedVacations = allRequests.filter(r => r.status === 'approved');
          } catch (e) {
            approvedVacations = [];
          }
        }
      }

      // Load previous month's schedule
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const prevMonthKey = `${prevYear}-${prevMonth}`;
      
      let prevSchedule = null;
      try {
        const allCalendars = await getAllCalendars();
        if (allCalendars && allCalendars[prevMonthKey]) {
          prevSchedule = allCalendars[prevMonthKey];
        }
      } catch (error) {
        // Try localStorage fallback
        const saved = localStorage.getItem('savedCalendars');
        if (saved) {
          try {
            const calendars = JSON.parse(saved);
            prevSchedule = calendars[prevMonthKey] || null;
          } catch (e) {
            prevSchedule = null;
          }
        }
      }

      // Generate schedule using the improved algorithm
      const result = generateSchedule({
        drivers,
        currentMonth,
        currentYear,
        routeCodes,
        approvedVacations,
        prevSchedule,
        groups,
        routes,
      });

      // Update state with generated schedule
      setSchedule(result.schedule);
      setMissingRoutesByDay(result.missing);

      // Save to server
      await saveCalendar(result.schedule);

      // Generate and show report
      const report = generateReport(result, {
        currentMonth,
        currentYear,
        drivers,
        approvedVacations,
      });

      alert(report);
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('❌ Error al generar el calendario. Por favor intenta de nuevo.');
    }
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
            routes={routes}
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
      case 'vacations':
        return <VacationRequests />;
      case 'groups':
        return null;
      case 'users':
        return <UserManagement />;
      case 'drivers':
        return <DriversList />;
      case 'routes':
        return <RoutesList />;
      case 'stats':
        return <Stats drivers={drivers} schedule={schedule} />;
      case 'cleaning':
        return (
          <CleaningStatus
            drivers={drivers}
            schedule={schedule}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onRefresh={() => loadCalendar(currentMonth, currentYear)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={logout}
        userName={user?.name}
      />
      
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
            © 2024 نظام تخطيط الطرق / Planificación de Rutas - جميع الحقوق محفوظة / All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  // Not logged in - show login page
  if (!user) {
    return <Login />;
  }

  // Driver role - show driver dashboard
  if (user.role === 'driver') {
    return <DriverDashboard />;
  }

  // Admin role - show full system
  return <AdminDashboard />;
}

export default App;
