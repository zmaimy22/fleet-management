import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Edit2, Download, Monitor, Smartphone, ArrowLeft, ArrowRight, Upload, FileText } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';
import { useDrivers } from '../hooks/useDrivers';
import DriverModal from './DriverModal';
import ImportCalendarModal from "./ImportCalendarModal";
import SickLeaveModal from './SickLeaveModal';
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAllCalendars, saveCalendar } from "../utils/api";
import CoverageStats from './CoverageStats';

const Calendar = ({ drivers, schedule, routes, onCellClick, onImportFile, onGenerate, onMonthChange, onAddSickRange }) => {
  const { t } = useLanguage();
  const { updateDriver } = useDrivers();
  const [currentMonth, setCurrentMonth] = useState(10); // November (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [mobileView, setMobileView] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSickModal, setShowSickModal] = useState(false);
  const headerRef = useRef(null);
  const [driverOrders, setDriverOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('calendarDriverOrders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('calendarDriverOrders', JSON.stringify(driverOrders));
    } catch {}
  }, [driverOrders]);

  const getOrderedDrivers = (driversList, groupKey) => {
    const order = driverOrders[groupKey];
    const byId = Object.fromEntries(driversList.map(d => [d.id, d]));
    if (Array.isArray(order) && order.length) {
      const ordered = order.map(id => byId[id]).filter(Boolean);
      const remaining = driversList.filter(d => !order.includes(d.id));
      return [...ordered, ...remaining];
    }
    return driversList;
  };

  const onDragStartRow = (e, driver, groupKey) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: driver.id, groupKey }));
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDropRow = (e, targetDriver, groupKey, currentList) => {
    e.preventDefault();
    let payload;
    try { payload = JSON.parse(e.dataTransfer.getData('text/plain') || '{}'); } catch { payload = {}; }
    if (!payload.id || payload.groupKey !== groupKey) return;
    const ids = currentList.map(d => d.id);
    const fromIdx = ids.indexOf(payload.id);
    const toIdx = ids.indexOf(targetDriver.id);
    if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
    const newIds = [...ids];
    const [moved] = newIds.splice(fromIdx, 1);
    newIds.splice(toIdx, 0, moved);
    setDriverOrders(prev => ({ ...prev, [groupKey]: newIds }));
  };
  
  // Detect mobile screen and header height
  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 768);
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper function to check if driver has ANY sick leave days in the current month
  const hasAnySickLeaveInMonth = (driver) => {
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const daySchedule = schedule[driver.id]?.[day];
      // Exclude HS (horas sindical/union hours) from sick leave detection
      if (daySchedule?.value === 'HS') continue;
      
      if (daySchedule?.type === 'sick' || 
          (daySchedule?.value && (daySchedule.value === 'BAJA' || daySchedule.value === 'Baja'))) {
        return true;
      }
    }
    return false;
  };
  
  // Dynamically categorize drivers based on sick leave status
  // If driver has ANY sick leave in this month, they appear in Bajas category
  // Otherwise, they appear in their original category
  const lanzaroteDrivers = drivers.filter(d => {
    const originalCat = d.originalCategory || d.category;
    return d.type === 'driver' && originalCat === 'lanzarote' && !hasAnySickLeaveInMonth(d);
  });
  
  const localMorningDrivers = drivers.filter(d => {
    const originalCat = d.originalCategory || d.category;
    return d.type === 'driver' && originalCat === 'local_morning' && !hasAnySickLeaveInMonth(d);
  });
  
  const localNightDrivers = drivers.filter(d => {
    const originalCat = d.originalCategory || d.category;
    return d.type === 'driver' && originalCat === 'local_night' && !hasAnySickLeaveInMonth(d);
  });
  
  const supervisorsStaff = drivers.filter(d => {
    const originalCat = d.originalCategory || d.category;
    return d.type === 'supervisor' && (originalCat === 'supervisors' || originalCat) && !hasAnySickLeaveInMonth(d);
  });
  
  const loadersStaff = drivers.filter(d => {
    const originalCat = d.originalCategory || d.category;
    return d.type === 'loader' && (originalCat === 'loaders' || originalCat) && !hasAnySickLeaveInMonth(d);
  });

  const jockerDrivers = drivers.filter(d => {
    const cat = d.category || d.originalCategory;
    return d.type === 'driver' && cat === 'jocker' && !hasAnySickLeaveInMonth(d);
  });
  
  // Ayudante: helpers/assistants
  const ayudanteStaff = drivers.filter(d => {
    return d.type === 'ayudante' && !hasAnySickLeaveInMonth(d);
  });
  
  // Bajas: drivers who have ANY sick leave days in this month
  const bajasStaff = drivers.filter(d => hasAnySickLeaveInMonth(d));
  
  // Other staff: drivers with no category or category not in known set
  const otherStaff = drivers.filter(d => {
    const originalCat = d.originalCategory || d.category;
    const known = new Set(['lanzarote','local_morning','local_night','supervisors','loaders','ayudante','jocker']);
    return d.type === 'driver' && (!originalCat || !known.has(originalCat)) && !hasAnySickLeaveInMonth(d);
  });

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

  // Load November 2025 data when November 2025 is selected
  useEffect(() => {
    if (currentMonth === 10 && currentYear === 2025) {
      loadNovemberData();
    }
  }, [currentMonth, currentYear]);
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // For mobile: show 7 days at a time
  const getDaysToShow = () => {
    if (!mobileView) return allDays;
    const startDay = weekOffset * 7 + 1;
    const endDay = Math.min(startDay + 6, daysInMonth);
    return allDays.slice(startDay - 1, endDay);
  };
  
  const days = getDaysToShow();
  const totalWeeks = Math.ceil(daysInMonth / 7);
  const currentWeek = weekOffset + 1;
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    setWeekOffset(0); // Reset to first week
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
    setWeekOffset(0); // Reset to first week
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

  const handleClearMonth = async () => {
    const monthKey = `${currentYear}-${currentMonth}`;
    const monthName = monthNames[currentMonth];
    
    if (!window.confirm(`¿Estás seguro de que deseas limpiar el calendario completo de ${monthName} ${currentYear}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const base = (window.location.hostname === 'localhost') ? 'http://localhost:3001/api' : '/api';
      await fetch(`${base}/calendars/${monthKey}`, {
        method: 'DELETE',
      });
      
      const saved = localStorage.getItem('savedCalendars');
      if (saved) {
        const calendars = JSON.parse(saved);
        delete calendars[monthKey];
        localStorage.setItem('savedCalendars', JSON.stringify(calendars));
      }
      
      window.location.reload();
    } catch (error) {
      window.alert(`❌ Error: ${error.message}`);
    }
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
      
      const worksheet = workbook.addWorksheet(`${monthNames[currentMonth]} ${currentYear}`);
      
      // Add header row
      const headerRow = worksheet.addRow(['CONDUCTOR', ...Array.from({length: days}, (_, i) => i + 1)]);
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
                bgColor = 'FFFFFFFF'; // White for weekend (like in image)
                fontColor = 'FF000000';
              } else if (cellData.type === 'vacation') {
                cellValue = cellData.value || 'V';
                bgColor = 'FFFACC15'; // Yellow-400 for vacation
                fontColor = 'FF000000';
              } else if (cellData.type === 'sick') {
                cellValue = cellData.value || 'Baja';
                bgColor = 'FFFDE047'; // Yellow-300 for sick
                fontColor = 'FF000000';
              } else if (cellData.value) {
                cellValue = cellData.value;
                if (cellData.value === 'CT' || cellData.value === 'CM' || cellData.value === 'CP/dt') {
                  bgColor = 'FFF97316'; // Orange-500 for CM/CT (like in image)
                  fontColor = 'FFFFFFFF';
                } else if (cellData.value === 'GT') {
                  bgColor = 'FFA855F7'; // Purple-500 for GT
                  fontColor = 'FFFFFFFF';
                } else if (cellData.value === 'P') {
                  bgColor = 'FF6366F1'; // Indigo-500 for P
                  fontColor = 'FFFFFFFF';
                } else {
                  bgColor = 'FFE5E7EB'; // Gray-200 for regular work (like in image)
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
      addSection('=== ENCARGADOS / JEFE DE LOGISTICA ===', supervisorsStaff);
      addSection('=== CARGADORES ===', loadersStaff);
      addSection('=== JOCKER ===', jockerDrivers);
      addSection('=== AYUDANTE ===', ayudanteStaff);
      addSection('=== BAJAS ===', bajasStaff);
      addSection('=== PERSONAL / OTROS ===', otherStaff);
      
      // Add footer note
      const footerRow = worksheet.addRow(['CUADRANTE SUJETO A CAMBIOS POR NECESIDADES DE PRODUCCIÓN']);
      footerRow.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF666666' } };
      footerRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells(footerRow.number, 1, footerRow.number, days + 1);
      
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
      
      // Success: no alert
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert(`❌ ¡Error al exportar!\n\n${error.message}`);
    }
  };

  const handleExportToPDF = () => {
    try {
      const days = new Date(currentYear, currentMonth + 1, 0).getDate();
      const monthNamesES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      // Create PDF in landscape A4
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Title
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Calendario ${monthNamesES[currentMonth]} ${currentYear}`, 148.5, 15, { align: 'center' });

      // Collect all drivers by sections
      const allSections = [];
      
      if (lanzaroteDrivers.length > 0) {
        allSections.push({ title: 'RUTAS A LANZAROTE', drivers: lanzaroteDrivers });
      }
      if (localMorningDrivers.length > 0) {
        allSections.push({ title: 'RUTAS LOCALES MAÑANA', drivers: localMorningDrivers });
      }
      if (localNightDrivers.length > 0) {
        allSections.push({ title: 'RUTAS LOCALES NOCHE', drivers: localNightDrivers });
      }
      if (supervisorsStaff.length > 0) {
        allSections.push({ title: 'ENCARGADOS', drivers: supervisorsStaff });
      }
      if (jockerDrivers.length > 0) {
        allSections.push({ title: 'JOCKER', drivers: jockerDrivers });
      }
      if (loadersStaff.length > 0) {
        allSections.push({ title: 'CARGADORES', drivers: loadersStaff });
      }
      if (ayudanteStaff.length > 0) {
        allSections.push({ title: 'AYUDANTE', drivers: ayudanteStaff });
      }
      if (bajasStaff.length > 0) {
        allSections.push({ title: 'BAJAS', drivers: bajasStaff });
      }
      if (otherStaff.length > 0) {
        allSections.push({ title: 'OTROS', drivers: otherStaff });
      }

      // Prepare table data
      const tableData = [];
      
      allSections.forEach(section => {
        // Add section header
        tableData.push([{
          content: section.title,
          colSpan: days + 1,
          styles: { 
            fillColor: [200, 200, 200],
            fontStyle: 'bold',
            fontSize: 7,
            halign: 'left'
          }
        }]);
        
        // Add drivers
        section.drivers.forEach(driver => {
          const row = [driver.name];
          
          for (let day = 1; day <= days; day++) {
            const cellData = schedule[driver.id]?.[day];
            let cellValue = '';
            if (cellData) {
              if (cellData.type === 'weekend') {
                cellValue = '';
              } else if (cellData.value) {
                let v = cellData.value || '';
                const mainPart = v.split('+')[0];
                const main = mainPart.includes('.') ? mainPart.split('.')[0] : mainPart;
                cellValue = main;
              }
            }
            row.push(cellValue);
          }
          
          tableData.push(row);
        });
      });

      // Table headers (day number + weekday letter)
      const dayLetters = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
      const headerDays = Array.from({ length: days }, (_, i) => {
        const dow = new Date(currentYear, currentMonth, i + 1).getDay();
        const letter = dayLetters[dow];
        return `${i + 1}\n${letter}`;
      });
      const headers = [['CONDUCTOR', ...headerDays]];

      // Generate table
      autoTable(doc, {
        startY: 20,
        head: headers,
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 5,
          cellPadding: 0.5,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 5.5,
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold', fontSize: 5 }
        },
        didParseCell: function(data) {
          // Color cells based on content
          if (data.section === 'body' && data.column.index > 0) {
            const cellText = data.cell.text[0];
            const rowIndex = data.row.index;
            
            // Find actual driver for this row
            let driverRowCount = 0;
            let currentDriver = null;
            
            for (const section of allSections) {
              driverRowCount++; // Section header
              for (const driver of section.drivers) {
                if (driverRowCount === rowIndex) {
                  currentDriver = driver;
                  break;
                }
                driverRowCount++;
              }
              if (currentDriver) break;
            }
            
            if (currentDriver) {
              const day = data.column.index;
              const cellData = schedule[currentDriver.id]?.[day];
              
              if (cellData) {
                if (cellData.type === 'weekend') {
                  // White/light gray for weekend (like in image)
                  data.cell.styles.fillColor = [255, 255, 255];
                  data.cell.styles.textColor = [0, 0, 0];
                } else if (cellData.type === 'vacation') {
                  // Yellow for vacation (V)
                  data.cell.styles.fillColor = [250, 204, 21];
                  data.cell.styles.textColor = [0, 0, 0];
                } else if (cellData.type === 'sick') {
                  // Light yellow for sick
                  data.cell.styles.fillColor = [253, 224, 71];
                  data.cell.styles.textColor = [0, 0, 0];
                } else if (cellText === 'CT' || cellText === 'CM' || cellText === 'CP/dt') {
                  // Orange for CM/CT (like in image)
                  data.cell.styles.fillColor = [249, 115, 22];
                  data.cell.styles.textColor = [255, 255, 255];
                } else if (cellText === 'GT') {
                  // Purple for GT
                  data.cell.styles.fillColor = [168, 85, 247];
                  data.cell.styles.textColor = [255, 255, 255];
                } else if (cellText === 'P') {
                  // Blue for P
                  data.cell.styles.fillColor = [99, 102, 241];
                  data.cell.styles.textColor = [255, 255, 255];
                } else if (cellData.value) {
                  // Light gray for regular work days (R11, R12, etc. - like in image)
                  data.cell.styles.fillColor = [229, 231, 235];
                  data.cell.styles.textColor = [0, 0, 0];
                }
              }
            }
          }
        },
        margin: { top: 20, right: 5, bottom: 10, left: 5 }
      });

      // Add footer note
      const finalY = doc.lastAutoTable.finalY || 20;
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('CUADRANTE SUJETO A CAMBIOS POR NECESIDADES DE PRODUCCIÓN', 148.5, finalY + 8, { align: 'center' });

      // Save PDF
      const fileName = `Calendario_${monthNamesES[currentMonth]}_${currentYear}.pdf`;
      doc.save(fileName);
      
      // Success: no alert
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert(`❌ ¡Error al exportar PDF!\n\n${error.message}`);
    }
  };

  // Load November 2025 data
  const loadNovemberData = async () => {
    try {
      const response = await fetch('/api/calendars/november-2024');
      if (!response.ok) {
        console.log('November data API not available, skipping...');
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return;
      }
      
      const novemberData = await response.json();
      
      // Transform API data to schedule format
      // API returns: { drivers: [{ name: "...", schedule: ["R1", "R12", ...] }] }
      // We need: { driverId: { day: { type: "work", value: "R1" } } }
      
      const newSchedule = {};
      
      novemberData.drivers.forEach(apiDriver => {
        // Find driver ID by name
        const driver = drivers.find(d => d.name === apiDriver.name);
        if (driver) {
          newSchedule[driver.id] = {};
          
          // Convert schedule array to object with days
          apiDriver.schedule.forEach((value, index) => {
            const day = index + 1;
            if (!value) {
              newSchedule[driver.id][day] = { type: 'weekend', value: '' };
            } else if (value === 'V' || value === 'BAJA' || value === 'HS') {
              newSchedule[driver.id][day] = { type: 'sick', value };
            } else {
              newSchedule[driver.id][day] = { type: 'work', value };
            }
          });
        }
      });
      
      // Save to state with new key
      const monthKey = `2025-10`; // November is month 10
      const updatedSaved = localStorage.getItem('savedCalendars');
      const calendars = updatedSaved ? JSON.parse(updatedSaved) : {};
      calendars[monthKey] = newSchedule;
      localStorage.setItem('savedCalendars', JSON.stringify(calendars));
      
      console.log('✅ November 2025 data loaded successfully');
    } catch (error) {
      console.log('November data not available, using existing data:', error.message);
      // Silently fail - data will work from localStorage or manual entry
    }
  };
  
  const routeCountsByDay = React.useMemo(() => {
    const counts = {};
    days.forEach((day) => {
      counts[day] = {};
      drivers.forEach((d) => {
        if (d.type !== 'driver') return; // exclude ayudante, loaders, supervisors
        const c = schedule[d.id]?.[day];
        if (!c || c.type !== 'work') return;
        const v = c.value || '';
        if (!v) return;
        const special = new Set(['GT','P','CT','CM','HS','CP/dt']);
        if (special.has(v)) return; // skip non-route markers
        const main = v.split('+')[0];
        const key = main.includes('.') ? main.split('.')[0] : main;
        if (!key) return;
        counts[day][key] = (counts[day][key] || 0) + 1;
      });
    });
    return counts;
  }, [schedule, drivers, days]);

  const configuredDriverIds = React.useMemo(() => {
    const set = new Set();
    (routes || []).forEach(route => {
      if (route.primaryDriver) set.add(String(route.primaryDriver));
      if (route.secondaryDriver) set.add(String(route.secondaryDriver));
      if (route.alternatingDriver) set.add(String(route.alternatingDriver));
      if (Array.isArray(route.assignedDrivers)) route.assignedDrivers.forEach(id => set.add(String(id)));
    });
    return set;
  }, [routes]);

  const getCellColor = (cellData, day, driver) => {
    if (!cellData) return 'bg-white hover:bg-gray-50 border-gray-200';
    switch (cellData.type) {
      case 'weekend':
        return 'bg-white text-gray-800 font-bold';
      case 'vacation':
        return 'bg-yellow-400 text-gray-900 font-bold';
      case 'sick':
        return 'bg-yellow-300 text-gray-900 font-bold';
      case 'work':
        if (cellData.value === 'HS') {
          return 'bg-teal-500 text-white font-bold';
        }
        // Jocker: empty work cell (no replacement) gets distinct color
        if (driver?.type === 'driver' && (driver.category === 'jocker' || driver.originalCategory === 'jocker') && !cellData.value) {
          return 'bg-blue-200 text-gray-900 font-semibold border-2 border-blue-400';
        }
        if (!cellData.value && driver?.type === 'driver' && !configuredDriverIds.has(String(driver.id))) {
          return 'bg-pink-200 text-gray-900 font-semibold border-2 border-pink-400';
        }
        // Highlight over-assigned routes (drivers only)
        if (cellData.value && driver?.type === 'driver') {
          const main = (cellData.value || '').split('+')[0];
          const key = main.includes('.') ? main.split('.')[0] : main;
          if (key && routeCountsByDay[day] && routeCountsByDay[day][key] > 1) {
            return 'bg-red-500 text-white font-bold border-2 border-red-700';
          }
        }
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
  const renderDriverRows = (driversList, startIdx, groupKey) => {
    const getPrimaryRoute = (d) => {
      // First check routes.json for loader_like or alternating assignments
      if (routes && routes.length > 0) {
        const driverRoute = routes.find(route => {
          const primaryMatch = route.primaryDriver && String(route.primaryDriver) === String(d.id);
          const secondaryMatch = route.secondaryDriver && String(route.secondaryDriver) === String(d.id);
          const alternatingMatch = route.alternatingDriver && String(route.alternatingDriver) === String(d.id);
          const assignedMatch = Array.isArray(route.assignedDrivers) && route.assignedDrivers.some(id => String(id) === String(d.id));
          return primaryMatch || secondaryMatch || alternatingMatch || assignedMatch;
        });
        if (driverRoute) {
          return (driverRoute.shortCode || '').split('.')[0];
        }
      }
      // Fallback to original logic
      if (d.assignedRoute) return (d.assignedRoute || '').split('.')[0];
      if (d.route) {
        const first = d.route.split('/')[0] || '';
        return first.split('+')[0].split('.')[0];
      }
      return '';
    };
    const routeRank = (code) => {
      const m = (code || '').match(/^R(\d+)$/);
      if (m) return parseInt(m[1], 10);
      return Number.MAX_SAFE_INTEGER;
    };
    let sortedDrivers = [...driversList].sort((a, b) => {
      const ra = getPrimaryRoute(a);
      const rb = getPrimaryRoute(b);
      const ka = routeRank(ra);
      const kb = routeRank(rb);
      if (ka !== kb) return ka - kb;
      return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
    });
    sortedDrivers = getOrderedDrivers(sortedDrivers, groupKey);
    return sortedDrivers.map((driver, idx) => (
      <tr key={driver.id}
        draggable
        onDragStart={(e) => onDragStartRow(e, driver, groupKey)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDropRow(e, driver, groupKey, sortedDrivers)}
        className={`${(startIdx + idx) % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/30 transition-colors duration-150`}
      >
        <td 
          className={`sticky left-0 z-[5] border-2 border-gray-300 font-semibold bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors group ${
            mobileView ? 'p-2 text-xs' : 'p-3 text-sm'
          }`}
          onClick={(e) => handleDriverClick(driver, e)}
          title="Clic para editar conductor"
        >
          <span className="flex items-center gap-2 justify-between">
            <span className="flex items-center gap-1">
              <span className={`rounded-full bg-blue-500 ${mobileView ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}></span>
              <span className={mobileView ? 'truncate max-w-[80px]' : ''}>{driver.name}</span>
            </span>
            {!mobileView && (
              <span className="flex items-center gap-3">
                <span className="text-gray-400 cursor-grab">⋮⋮</span>
                <Edit2 size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </span>
            )}
          </span>
        </td>
        {days.map(day => {
          const cellData = schedule[driver.id]?.[day];
          return (
            <td
              key={`${driver.id}-${day}`}
              className={`border border-gray-300 text-center cursor-pointer transition-all duration-150 hover:opacity-80 active:scale-95 ${getCellColor(cellData, day, driver)} ${
                mobileView ? 'p-2 hover:scale-100' : 'p-1 hover:scale-105'
              }`}
              onClick={() => onCellClick(driver, day, cellData)}
            >
              <span className={`font-semibold ${mobileView ? 'text-sm' : 'text-xs'}`}>
                {(() => {
                  const c = cellData;
                  if (!c) return '';
                  if (c.type === 'sick') return 'BAJA';
                  if (c.type === 'vacation') return c.value || 'V';
                  const v = c.value || '';
                  if (!v) return '';
                  const main = v.split('+')[0];
                  return main.includes('.') ? main.split('.')[0] : main;
                })()}
              </span>
            </td>
          );
        })}
      </tr>
    ));
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-visible transform transition-all duration-300 hover:shadow-3xl">
      {/* Header */}
      <div ref={headerRef} className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden rounded-t-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]"></div>
        <div className="flex items-center justify-between gap-3 flex-wrap relative z-10">
          <button 
            onClick={handlePrevMonth}
            className={`hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm shadow-lg ${
              mobileView ? 'p-2' : 'p-3'
            }`}
            title="Mes Anterior"
          >
            <ChevronLeft size={mobileView ? 20 : 28} className="drop-shadow-lg" />
          </button>
          <div className="relative z-[50]">
            <button
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className={`font-bold hover:bg-white/20 rounded-xl transition-all duration-200 flex items-center backdrop-blur-sm hover:scale-105 active:scale-95 shadow-lg relative z-[9998] ${
                mobileView ? 'text-sm px-3 py-2 gap-2' : 'text-2xl px-6 py-3 gap-3'
              }`}
            >
              <CalendarIcon size={mobileView ? 20 : 28} className="drop-shadow-lg" />
              <span className="drop-shadow-lg">{monthNames[currentMonth]} {currentYear}</span>
            </button>
            {showMonthPicker && availableMonths.length > 0 && (
              <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm" onClick={() => setShowMonthPicker(false)}>
                <div 
                  className="absolute left-1/2 top-28 -translate-x-1/2 bg-white text-gray-800 rounded-2xl shadow-2xl p-6 min-w-[360px] max-w-[400px] border-2 border-purple-200 animate-fadeIn z-[10000]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-4 -mx-6 -mt-6 rounded-t-2xl mb-5">
                    <h4 className="font-bold text-lg flex items-center justify-center gap-3">
                      <CalendarIcon size={24} className="drop-shadow-lg" />
                      <span className="drop-shadow-lg">
                        Calendarios Disponibles
                      </span>
                    </h4>
                    <p className="text-white/80 text-sm text-center mt-1">
                      Selecciona un mes para visualizar
                    </p>
                  </div>

                  {/* Month List */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                    {availableMonths.map(monthKey => {
                      const [year, month] = monthKey.split('-').map(Number);
                      const isActive = year === currentYear && month === currentMonth;
                      return (
                        <button
                          key={monthKey}
                          onClick={() => handleSelectMonth(monthKey)}
                          className={`w-full text-left px-5 py-3.5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] font-medium text-base shadow-sm hover:shadow-lg ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold shadow-md scale-[1.02] border-2 border-blue-400' 
                              : 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 text-gray-700 border-2 border-transparent hover:border-purple-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CalendarIcon size={20} className={isActive ? 'text-white' : 'text-purple-500'} />
                            <div className="flex-1">
                              <div className={`font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                {monthNames[month]} {year}
                              </div>
                              {isActive && (
                                <div className="text-xs text-white/90 mt-0.5">
                                  Mes Actual
                                </div>
                              )}
                            </div>
                            {isActive && <span className="text-xl">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-gray-200 text-center">
                    <button
                      onClick={() => setShowMonthPicker(false)}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                    >
                      Cerrar ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={`flex items-center ${mobileView ? 'gap-1' : 'gap-2'}`}>
            <button
              onClick={handleExportToPDF}
              className={`bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg font-medium backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 ${
                mobileView ? 'p-2 text-xs' : 'px-4 py-2.5 text-sm'
              }`}
              title="Exportar a PDF"
            >
              {mobileView ? '📄' : (
                <>
                  <FileText size={18} />
                  📄 PDF
                </>
              )}
            </button>
            <button
              onClick={handleExportToExcel}
              className={`bg-blue-500/20 hover:bg-blue-500/30 text-white rounded-lg font-medium backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 ${
                mobileView ? 'p-2 text-xs' : 'px-4 py-2.5 text-sm'
              }`}
              title="Exportar a Excel"
            >
              {mobileView ? '📊' : (
                <>
                  <Download size={18} />
                  📊 Excel
                </>
              )}
            </button>
            <button
              className={`bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                mobileView ? 'p-2 text-xs' : 'px-4 py-2.5 text-sm'
              }`}
              onClick={() => onGenerate && onGenerate()}
              title="Generate schedule with work patterns"
            >
              {mobileView ? '⚡' : '⚡ Generate Schedule'}
            </button>
            <button
              className={`bg-yellow-500/20 hover:bg-yellow-500/30 text-white rounded-lg font-medium backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                mobileView ? 'p-2 text-xs' : 'px-4 py-2.5 text-sm'
              }`}
              onClick={() => setShowSickModal(true)}
              title="Añadir Baja"
            >
              {mobileView ? '🏥' : '🏥 Baja'}
            </button>
            <button
              className={`bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2 ${
                mobileView ? 'p-2 text-xs' : 'px-4 py-2.5 text-sm'
              }`}
              onClick={handleClearMonth}
              title="Clear entire month"
            >
              {mobileView ? '🗑️' : (
                <>
                  🗑️ Clear Month
                </>
              )}
            </button>
          </div>
          <button 
            onClick={handleNextMonth}
            className={`hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm shadow-lg ${
              mobileView ? 'p-2' : 'p-3'
            }`}
            title="Mes Siguiente"
          >
            <ChevronRight size={mobileView ? 20 : 28} className="drop-shadow-lg" />
          </button>
        </div>
      </div>
      
      {/* Mobile Week Navigation */}
      {mobileView && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b-2 border-blue-200 sticky top-0 z-50">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <button
              onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
              disabled={weekOffset === 0}
              className={`p-2 rounded-lg transition-all ${
                weekOffset === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-purple-600 hover:bg-purple-100 active:scale-95 shadow-md'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="text-center">
              <p className="text-sm font-bold text-purple-700">
                📅 Semana {currentWeek} de {totalWeeks}
              </p>
              <p className="text-xs text-gray-600">
                {days[0]} - {days[days.length - 1]} {monthNames[currentMonth]}
              </p>
            </div>
            
            <button
              onClick={() => setWeekOffset(Math.min(totalWeeks - 1, weekOffset + 1))}
              disabled={weekOffset >= totalWeeks - 1}
              className={`p-2 rounded-lg transition-all ${
                weekOffset >= totalWeeks - 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-purple-600 hover:bg-purple-100 active:scale-95 shadow-md'
              }`}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
      
      {/* Calendar Grid */}
      <div className="overflow-x-auto max-w-full relative">
        <div className="inline-block min-w-full">
          <table className="border-collapse w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className={`sticky left-0 z-[5] bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-300 text-right font-bold text-gray-700 shadow-sm ${
                  mobileView ? 'p-2 w-[120px] text-xs' : 'p-3 w-[200px] text-sm'
                }`}>
                  <span className="flex items-center gap-2">
                    {mobileView ? '👤' : '👤 Conductor'}
                  </span>
                </th>
                {days.map(day => {
                  const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
                  const dayNames = ['D', 'L', 'M', 'X', 'J', 'V', 'S']; // Domingo, Lunes, Martes, Miércoles, Jueves, Viernes, Sábado
                  return (
                    <th key={day} className={`border border-gray-300 text-center font-bold bg-gradient-to-b from-white to-gray-50 hover:bg-blue-50 transition-colors ${
                      mobileView ? 'p-3 min-w-[60px] text-base' : 'p-2 min-w-[50px] text-sm'
                    }`}>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="inline-block transform hover:scale-125 transition-transform">{day}</span>
                        <span className="text-xs text-gray-500 font-normal">{dayNames[dayOfWeek]}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
          <tbody>
            {/* Section 1: Rutas a Lanzarote */}
            {lanzaroteDrivers.length > 0 && (
              <>
                <tr className="bg-yellow-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-yellow-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '😢 Lanzarote' : '😢 Rutas a Lanzarote'} ({lanzaroteDrivers.length})
                  </td>
                </tr>
                {renderDriverRows(lanzaroteDrivers, 0, 'lanzarote')}
              </>
            )}

            {/* Section 2: Rutas Locales Mañana */}
            {localMorningDrivers.length > 0 && (
              <>
                <tr className="bg-gray-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-gray-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '☀️ Local Mañana' : '☀️ Rutas Locales Mañana'} ({localMorningDrivers.length})
                  </td>
                </tr>
                {renderDriverRows(localMorningDrivers, lanzaroteDrivers.length, 'local_morning')}
              </>
            )}

            {/* Section 3: Rutas Locales Noche */}
            {localNightDrivers.length > 0 && (
              <>
                <tr className="bg-gray-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-gray-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '🌙 Local Noche' : '🌙 Rutas Locales Noche'} ({localNightDrivers.length})
                  </td>
                </tr>
                {renderDriverRows(localNightDrivers, lanzaroteDrivers.length + localMorningDrivers.length, 'local_night')}
              </>
            )}

            {/* Section 4: Encargados / Jefe de Logistica */}
            {supervisorsStaff.length > 0 && (
              <>
                <tr className="bg-blue-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-blue-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '👔 Encargados' : '👔 Encargados / Jefe de Logistica'} ({supervisorsStaff.length})
                  </td>
                </tr>
                {renderDriverRows(supervisorsStaff, lanzaroteDrivers.length + localMorningDrivers.length + localNightDrivers.length, 'supervisors')}
              </>
            )}

            {/* Section 5: Cargadores */}
            {loadersStaff.length > 0 && (
              <>
                <tr className="bg-orange-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-orange-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '📦 Cargadores' : '📦 Cargadores'} ({loadersStaff.length})
                  </td>
                </tr>
                {renderDriverRows(loadersStaff, lanzaroteDrivers.length + localMorningDrivers.length + localNightDrivers.length + supervisorsStaff.length, 'loaders')}
              </>
            )}

            {/* Section 5.5: Jocker */}
            {jockerDrivers.length > 0 && (
              <>
                <tr className="bg-pink-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-pink-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '🃏 Jocker' : '🃏 Jocker'} ({jockerDrivers.length})
                  </td>
                </tr>
                {renderDriverRows(jockerDrivers, lanzaroteDrivers.length + localMorningDrivers.length + localNightDrivers.length + supervisorsStaff.length + loadersStaff.length, 'jocker')}
              </>
            )}

            {/* Section 6: Ayudante */}
            {ayudanteStaff.length > 0 && (
              <>
                <tr className="bg-orange-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-orange-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '🤝 Ayudante' : '🤝 Ayudante'} ({ayudanteStaff.length})
                  </td>
                </tr>
                {renderDriverRows(ayudanteStaff, lanzaroteDrivers.length + localMorningDrivers.length + localNightDrivers.length + supervisorsStaff.length + loadersStaff.length, 'ayudante')}
              </>
            )}

            {/* Section 7: Bajas */}
            {bajasStaff.length > 0 && (
              <>
                <tr className="bg-red-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-red-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '🏥 Bajas' : '🏥 Bajas (Sick Leave)'} ({bajasStaff.length})
                  </td>
                </tr>
                {renderDriverRows(bajasStaff, lanzaroteDrivers.length + localMorningDrivers.length + localNightDrivers.length + supervisorsStaff.length + loadersStaff.length + ayudanteStaff.length, 'bajas')}
              </>
            )}

            {/* Other Staff */}
            {otherStaff.length > 0 && (
              <>
                <tr className="bg-green-100">
                  <td colSpan={days.length + 1} className={`sticky left-0 z-[5] font-bold text-gray-800 text-center border-2 border-green-300 ${
                    mobileView ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}>
                    {mobileView ? '👥 Otros' : '👥 Personal / Otros'} ({otherStaff.length})
                  </td>
                </tr>
                {renderDriverRows(otherStaff, lanzaroteDrivers.length + localMorningDrivers.length + localNightDrivers.length + supervisorsStaff.length + loadersStaff.length + ayudanteStaff.length + bajasStaff.length, 'otros')}
              </>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Coverage moved into Calendar */}
      <CoverageStats drivers={drivers} schedule={schedule} currentMonth={currentMonth} currentYear={currentYear} />
      {/* Legend */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200">
        <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2 text-lg">
          <span className="text-2xl">ℹ️</span>
          Leyenda:
        </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-white border-2 border-gray-300 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">Fin de Semana</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">Vacación Anual (V)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">Baja por Enfermedad (Baja)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">Cargador (CT/CM)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-purple-500 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">GT - Guardia Tarde</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">P - Planta</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">Asignación Duplicada (misma ruta/mismo día)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-blue-200 border-2 border-blue-400 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">Jocker Disponible (sin reemplazo)</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="w-8 h-8 bg-gray-200 border-2 border-gray-400 rounded-lg shadow-md"></div>
            <span className="text-sm font-medium">Ruta de Trabajo</span>
          </div>
        </div>
      </div>

      {/* Limpieza (moved to separate page) */}
      
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
      
      {/* Import Calendar Modal */}
      <ImportCalendarModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          // Reload calendar or update state
          window.location.reload();
        }}
      />
      <SickLeaveModal
        isOpen={showSickModal}
        onClose={() => setShowSickModal(false)}
        drivers={drivers}
        daysInMonth={daysInMonth}
        onSubmit={(did, s, e) => {
          if (typeof onAddSickRange === 'function') onAddSickRange(did, s, e)
        }}
      />
    </div>
  );
};

export default Calendar;
