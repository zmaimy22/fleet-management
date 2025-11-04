import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Download } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { useDrivers } from '../hooks/useDrivers';
import DriverModal from './DriverModal';
import ExcelJS from 'exceljs';

const Calendar = ({ drivers, schedule, onCellClick, onImportFile, onGenerate, onMonthChange }) => {
  const { t } = useLanguage();
  const { updateDriver } = useDrivers();
  const [currentMonth, setCurrentMonth] = useState(10); // November (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const fileInputRef = useRef(null);

  // Categorize drivers by their category field
  const lanzaroteDrivers = drivers.filter(d => d.category === 'lanzarote');
  const localMorningDrivers = drivers.filter(d => d.category === 'local_morning');
  const localNightDrivers = drivers.filter(d => d.category === 'local_night');
  const otherStaff = drivers.filter(d => d.type !== 'driver');

  // Load available months from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedCalendars');
    if (saved) {
      try {
        const calendars = JSON.parse(saved);
        setAvailableMonths(Object.keys(calendars));
      } catch (e) {
        setAvailableMonths([]);
      }
    }
  }, [schedule]);
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const monthNamesES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    if (onMonthChange) {
      const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      onMonthChange(newMonth, newYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    if (onMonthChange) {
      const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      onMonthChange(newMonth, newYear);
    }
  };

  const handleSelectMonth = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    setCurrentYear(year);
    setCurrentMonth(month);
    setShowMonthPicker(false);
    if (onMonthChange) onMonthChange(month, year);
  };

  const handleDriverClick = (driver, e) => {
    e.stopPropagation();
    setEditingDriver(driver);
    setShowDriverModal(true);
  };

  const handleDriverSave = (driverData) => {
    if (editingDriver) {
      updateDriver(editingDriver.id, driverData);
    }
    setShowDriverModal(false);
    setEditingDriver(null);
  };

  const handleExportToExcel = async () => {
    try {
      const days = new Date(currentYear, currentMonth + 1, 0).getDate();
      const monthNamesES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Fleet Management System';
      workbook.created = new Date();
      
      const worksheet = workbook.addWorksheet(`${monthNamesES[currentMonth]} ${currentYear}`);
      
      // Add header row
      const headerRow = worksheet.addRow(['CONDUCTOR / السائق', ...Array.from({length: days}, (_, i) => i + 1)]);
      headerRow.height = 20;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1976D2' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      
      // Set column widths
      worksheet.getColumn(1).width = 28;
      for (let i = 2; i <= days + 1; i++) {
        worksheet.getColumn(i).width = 5;
      }
      
      // Helper to add section
      const addSection = (sectionTitle, driversList) => {
        if (driversList.length === 0) return;
        
        // Section header
        const sectionRow = worksheet.addRow([sectionTitle]);
        sectionRow.height = 18;
        sectionRow.getCell(1).font = { bold: true, size: 11 };
        sectionRow.getCell(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        
        // Add drivers
        driversList.forEach(driver => {
          const rowData = [driver.name];
          const cellStyles = [];
          
          for (let day = 1; day <= days; day++) {
            const cellData = schedule[driver.id]?.[day];
            let cellValue = '';
            let bgColor = 'FFFFFFFF';
            let fontColor = 'FF000000';
            
            if (cellData) {
              if (cellData.type === 'weekend') {
                cellValue = '';
                bgColor = 'FFFF0000';
                fontColor = 'FFFFFFFF';
              } else if (cellData.type === 'vacation') {
                cellValue = cellData.value || 'V';
                bgColor = 'FFFFEB3B';
                fontColor = 'FF000000';
              } else if (cellData.type === 'sick') {
                cellValue = cellData.value || 'Baja';
                bgColor = 'FFFFF176';
                fontColor = 'FF000000';
              } else if (cellData.value) {
                cellValue = cellData.value;
                if (cellData.value === 'CT' || cellData.value === 'CM' || cellData.value === 'CP/dt') {
                  bgColor = 'FFFF9800';
                  fontColor = 'FFFFFFFF';
                } else if (cellData.value === 'GT') {
                  bgColor = 'FF9C27B0';
                  fontColor = 'FFFFFFFF';
                } else if (cellData.value === 'P') {
                  bgColor = 'FF3F51B5';
                  fontColor = 'FFFFFFFF';
                } else {
                  bgColor = 'FFE0E0E0';
                  fontColor = 'FF000000';
                }
              }
            }
            
            rowData.push(cellValue);
            cellStyles.push({ bgColor, fontColor });
          }
          
          const row = worksheet.addRow(rowData);
          row.height = 16;
          
          // Apply colors
          row.eachCell((cell, colNumber) => {
            if (colNumber === 1) {
              cell.font = { bold: true, size: 10 };
            } else {
              const style = cellStyles[colNumber - 2];
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: style.bgColor }
              };
              cell.font = { bold: true, size: 10, color: { argb: style.fontColor } };
            }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
              bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
              left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
              right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
            };
          });
        });
        
        // Empty row
        worksheet.addRow([]);
      };
      
      // Add all sections
      addSection('=== RUTAS A LANZAROTE ===', lanzaroteDrivers);
      addSection('=== RUTAS LOCALES MAÑANA ===', localMorningDrivers);
      addSection('=== RUTAS LOCALES NOCHE ===', localNightDrivers);
      addSection('=== PERSONAL / CARGADORES ===', otherStaff);
      
      // Generate filename
      const fileName = `Calendario_${monthNamesES[currentMonth]}_${currentYear}.xlsx`;
      
      // Write file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      
      // Success message
      alert(`✅ تم تصدير التقويم بنجاح! / Calendario exportado exitosamente!\n\n📁 ${fileName}\n👥 ${drivers.length} conductores\n🎨 Con colores completos / مع ألوان كاملة\n\n✔️ DONE / تم`);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert(`❌ خطأ في التصدير!\nError al exportar!\n\n${error.message}`);
    }
  };
  
  const getCellColor = (cellData) => {
    if (!cellData || !cellData.value) return 'bg-white hover:bg-gray-50 border-gray-200';
    
    switch (cellData.type) {
      case 'weekend':
        return 'bg-red-500 text-white font-bold';
      case 'vacation':
        return 'bg-yellow-400 text-gray-900 font-bold';
      case 'sick':
        return 'bg-yellow-300 text-gray-900 font-bold';
      case 'work':
        if (cellData.value === 'CT' || cellData.value === 'CM' || cellData.value === 'CP/dt') {
          return 'bg-orange-500 text-white font-bold';
        }
        if (cellData.value === 'GT') {
          return 'bg-purple-500 text-white font-bold';
        }
        if (cellData.value === 'P') {
          return 'bg-indigo-500 text-white font-bold';
        }
        return 'bg-gray-200 text-gray-800 font-semibold';
      default:
        return 'bg-white hover:bg-gray-50 border-gray-200';
    }
  };

  // Render driver rows
  const renderDriverRows = (driversList, startIdx) => {
    return driversList.map((driver, idx) => (
      <tr key={driver.id} className={`${(startIdx + idx) % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/30 transition-colors duration-150`}>
        <td 
          className="sticky left-0 z-10 border-2 border-gray-300 p-3 font-semibold bg-gradient-to-r from-gray-100 to-gray-50 text-sm text-gray-800 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors group"
          onClick={(e) => handleDriverClick(driver, e)}
          title="Clic para editar conductor / انقر لتعديل السائق"
        >
          <span className="flex items-center gap-2 justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {driver.name}
            </span>
            <Edit2 size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </span>
        </td>
        {days.map(day => {
          const cellData = schedule[driver.id]?.[day];
          return (
            <td
              key={`${driver.id}-${day}`}
              className={`border border-gray-300 p-1 text-center cursor-pointer transition-all duration-150 hover:opacity-80 hover:scale-105 active:scale-95 ${getCellColor(cellData)}`}
              onClick={() => onCellClick(driver, day, cellData)}
            >
              <span className="text-xs font-semibold">
                {cellData?.value || ''}
              </span>
            </td>
          );
        })}
      </tr>
    ));
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]"></div>
        <div className="flex items-center justify-between gap-3 flex-wrap relative z-10">
          <button 
            onClick={handlePrevMonth}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm shadow-lg"
            title={t('prevMonth') || 'الشهر السابق / Previous month'}
          >
            <ChevronLeft size={28} className="drop-shadow-lg" />
          </button>
          <div className="relative z-50">
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="text-2xl font-bold hover:bg-white/20 px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 backdrop-blur-sm hover:scale-105 active:scale-95 shadow-lg"
            >
              <CalendarIcon size={28} className="drop-shadow-lg" />
              <span className="drop-shadow-lg">{monthNamesES[currentMonth]} {currentYear}</span>
            </button>
            {showMonthPicker && availableMonths.length > 0 && (
              <div className="fixed inset-0 z-[100]" onClick={() => setShowMonthPicker(false)}>
                <div 
                  className="absolute left-1/2 top-24 -translate-x-1/2 bg-white text-gray-800 rounded-xl shadow-2xl p-4 min-w-[280px] border border-gray-200 animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                <h4 className="font-bold mb-3 text-sm text-gray-600 flex items-center gap-2">
                  <CalendarIcon size={16} />
                  {t('availableCalendars') || 'التقويمات المتاحة'}:
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableMonths.map(monthKey => {
                    const [year, month] = monthKey.split('-').map(Number);
                    return (
                      <button
                        key={monthKey}
                        onClick={() => handleSelectMonth(monthKey)}
                        className={`w-full text-left px-4 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-md ${
                          year === currentYear && month === currentMonth 
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 font-bold text-blue-700 shadow-sm border-l-4 border-blue-500' 
                            : 'hover:translate-x-1'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {year === currentYear && month === currentMonth && <span className="text-blue-500">▶</span>}
                          {monthNamesES[month]} {year}
                        </span>
                      </button>
                    );
                  })}
                </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/schedule_template.csv"
              download
              className="px-4 py-2.5 bg-white/10 hover:bg-white/25 rounded-lg text-sm font-medium backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              title="تنزيل القالب / Download template"
            >
              📥 Download
            </a>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onImportFile) onImportFile(file);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />
            <button
              className="px-4 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              onClick={() => fileInputRef.current?.click()}
            >
              📤 Import
            </button>
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              onClick={() => onGenerate && onGenerate()}
              title="توليد جدول 4 عمل / 2 راحة (يستمر من الشهر السابق إن وجد) / Generate 4/2 pattern (continues from previous month if exists)"
            >
              ⚡ Generate 4/2
            </button>
            <button
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={handleExportToExcel}
              title="تصدير إلى Excel / Export to Excel"
            >
              <Download size={18} />
              📊 Export Excel
            </button>
          </div>
          <button 
            onClick={handleNextMonth}
            className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm shadow-lg"
            title={t('nextMonth') || 'الشهر التالي / Next month'}
          >
            <ChevronRight size={28} className="drop-shadow-lg" />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="overflow-x-auto max-w-full">
        <div className="inline-block min-w-full">
          <table className="border-collapse w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="sticky left-0 z-10 bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300 p-3 w-[200px] text-right text-sm font-bold text-gray-700 shadow-sm">
                  <span className="flex items-center gap-2">
                    👤 السائق / Driver
                  </span>
                </th>
                {days.map(day => (
                  <th key={day} className="border border-gray-300 p-2 min-w-[50px] text-center font-bold text-sm bg-gradient-to-b from-white to-gray-50 hover:bg-blue-50 transition-colors">
                    <span className="inline-block transform hover:scale-125 transition-transform">{day}</span>
                  </th>
                ))}
              </tr>
            </thead>
          <tbody>
            {/* Section 1: Rutas a Lanzarote */}
            {lanzaroteDrivers.length > 0 && (
              <>
                <tr className="bg-yellow-100">
                  <td colSpan={days.length + 1} className="sticky left-0 z-10 p-2 font-bold text-gray-800 text-center border-2 border-yellow-300">
                    🚢 Rutas a Lanzarote / المسارات إلى Lanzarote ({lanzaroteDrivers.length} conductores)
                  </td>
                </tr>
                {renderDriverRows(lanzaroteDrivers, 0)}
              </>
            )}

            {/* Section 2: Rutas Locales Mañana */}
            {localMorningDrivers.length > 0 && (
              <>
                <tr className="bg-gray-100">
                  <td colSpan={days.length + 1} className="sticky left-0 z-10 p-2 font-bold text-gray-800 text-center border-2 border-gray-300">
                    ☀️ Rutas Locales Mañana / المسارات المحلية صباحاً ({localMorningDrivers.length} conductores)
                  </td>
                </tr>
                {renderDriverRows(localMorningDrivers, lanzaroteDrivers.length)}
              </>
            )}

            {/* Section 3: Rutas Locales Noche */}
            {localNightDrivers.length > 0 && (
              <>
                <tr className="bg-gray-100">
                  <td colSpan={days.length + 1} className="sticky left-0 z-10 p-2 font-bold text-gray-800 text-center border-2 border-gray-300">
                    🌙 Rutas Locales Noche / المسارات المحلية ليلاً ({localNightDrivers.length} conductores)
                  </td>
                </tr>
                {renderDriverRows(localNightDrivers, lanzaroteDrivers.length + localMorningDrivers.length)}
              </>
            )}

            {/* Other Staff (Loaders, Supervisors) */}
            {otherStaff.length > 0 && (
              <>
                <tr className="bg-green-100">
                  <td colSpan={days.length + 1} className="sticky left-0 z-10 p-2 font-bold text-gray-800 text-center border-2 border-green-300">
                    👥 Personal / الموظفون ({otherStaff.length} personas)
                  </td>
                </tr>
                {renderDriverRows(otherStaff, lanzaroteDrivers.length + localMorningDrivers.length + localNightDrivers.length)}
              </>
            )}
          </tbody>
        </table>
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
        <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2 text-lg">
          <span className="text-2xl">ℹ️</span>
          المفتاح / Legend:
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">عطلة أسبوعية / Weekend</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">عطلة سنوية (V) / Annual Leave</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">عطلة مرضية (Baja) / Sick Leave</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">مسؤول الشحن (CT/CM) / Loader</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-purple-500 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">GT - Gran Turismo</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">P - Particular</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gray-200 border-2 border-gray-400 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">مسار عمل / Route</span>
          </div>
        </div>
      </div>
      
      {/* Driver Edit Modal */}
      {showDriverModal && (
        <DriverModal
          isOpen={showDriverModal}
          onClose={() => {
            setShowDriverModal(false);
            setEditingDriver(null);
          }}
          onSave={handleDriverSave}
          driver={editingDriver}
        />
      )}
    </div>
  );
};

export default Calendar;
