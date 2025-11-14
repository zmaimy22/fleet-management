import * as XLSX from 'xlsx';

// Crear un libro de trabajo con los datos de prueba
const wb = XLSX.utils.book_new();

// Headers
const headers = ['NOMBRE', '', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, '', 15, 16, 17, 18, 19, 20, 21, 22, 23, '', 24, 25, 26, 27, 28, 29, '', 30];

// Datos de ejemplo
const data = [
  headers,
  ['ATILA GEORGE SUHAJDA', '', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', '', '', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', '', '', 'R11'],
  ['MELALIAN', '', 'R12', 'R12', 'R12', 'R12', '', '', 'R12', 'R12', 'R12', 'R12', '', '', 'CM', 'R12', '', '', 'R12', 'CM/R9', '', '', 'CM', 'R12', 'R12', 'CM', '', '', 'CM', 'R12', 'R12', 'CM', '', ''],
  ['GUSTAVO MELIAN FAJARDO', '', '', '', 'R14', 'R14', 'R12', 'CM', '', '', 'R13', 'R13', 'R12', 'R13', '', '', '', 'R13', 'R13', 'R13', 'R13', '', '', 'R13', 'R13', 'R13', '', 'R13', '', '', 'R13', 'R13', 'R13', '', 'R13'],
  ['JULIAN TAMAYO VILLA', '', '', 'R1', 'R1', 'R1', '', '', 'R15', 'R15', 'R14', 'R14', '', '', 'R15', 'R15', '', '', 'R14', 'R14', '', '', 'R15', 'R15', 'R14', 'R14', '', '', 'R15', 'R15', 'R14', 'R14', '', ''],
  ['XERAD HERNADEZ RODRIGUEZ', '', '', 'R5', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', '', 'V', 'R12', 'R12', '', 'R12', 'R6', '', 'R12', 'R12', '', 'R12', 'R12', '', '', 'R12', 'R12', '', 'R9'],
];

const ws = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, 'Calendario');
XLSX.writeFile(wb, 'test_calendar.xlsx');

console.log('✅ Archivo test_calendar.xlsx creado');
