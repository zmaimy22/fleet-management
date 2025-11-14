import * as XLSX from 'xlsx';
import fs from 'fs';

// Create November 2024 Calendar Data
const wb = XLSX.utils.book_new();

// Headers with days 1-30 for November
const headers = ['NOMBRE', '', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, '', 15, 16, 17, 18, 19, 20, 21, 22, 23, '', 24, 25, 26, 27, 28, 29, '', 30];

// Real data from your calendar
const data = [
  headers,
  ['ATILA GEORGE SUHAJDA', '', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', '', '', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', '', '', 'R11', 'R11', 'R11', 'R11', '', '', 'R11'],
  ['MELALIAN', '', 'R12', 'R12', 'R12', 'R12', '', '', 'R12', 'R12', 'R12', 'R12', '', '', 'CM', 'R12', '', '', 'R12', 'CM/R9', '', '', 'CM', 'R12', 'R12', 'CM', '', '', 'CM', 'R12', 'R12', 'CM', '', ''],
  ['GUSTAVO MELIAN FAJARDO', '', '', '', 'R14', 'R14', 'R12', 'CM', '', '', 'R13', 'R13', 'R12', 'R13', '', '', '', 'R13', 'R13', 'R13', 'R13', '', '', 'R13', 'R13', 'R13', '', 'R13', '', '', 'R13', 'R13', 'R13', '', 'R13'],
  ['JULIAN TAMAYO VILLA', '', '', 'R1', 'R1', 'R1', '', '', 'R15', 'R15', 'R14', 'R14', '', '', 'R15', 'R15', '', '', 'R14', 'R14', '', '', 'R15', 'R15', 'R14', 'R14', '', '', 'R15', 'R15', 'R14', 'R14', '', ''],
  ['XERAD HERNADEZ RODRIGUEZ', '', '', 'R5', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', 'V', '', 'V', 'R12', 'R12', '', 'R12', 'R6', '', 'R12', 'R12', '', 'R12', 'R12', '', '', 'R12', 'R12', '', 'R9'],
  ['J.JARRIZON LOPEZ AMARILES', '', 'R12', '', '', 'R11', 'R11', 'R12', 'R15', '', '', 'R11', 'R11', 'R12', 'R12', '', '', '', 'R11', 'R11', 'R12', '', '', 'R11', 'R11', '', 'CM', 'CM', '', '', 'R11', 'R11', '', 'R12'],
  ['ARISTEO OJEDA EXPOSITO', '', '', '', 'R15', 'R15', 'R15', 'R15', '', '', 'R15', 'R15', 'R15', 'R15', '', '', '', 'R15', 'R15', 'R15', 'R15', '', '', 'R15', 'R15', 'R15', '', 'R15', '', '', 'R15', 'R15', 'R15', '', 'R15'],
  ['TRAIAN OLARU', '', 'R15', 'R15', 'R13', '', '', 'R13', 'R13', 'R13', '', '', 'R13', 'CM', 'R13', 'R13', '', '', '', 'CM', 'CM', 'R13', 'R13', '', '', 'R7', '', 'CT', 'R13', 'R13', '', '', 'R5', '', 'R13'],
  ['HAFAD ABDERRAHAMAN', '', 'R14', 'R14', '', '', 'R14', 'R14', 'R14', 'R14', '', '', 'R14', 'R14', 'R14', 'R14', '', '', '', 'R14', 'R14', 'R14', 'R14', '', '', 'R14', '', 'R14', 'R14', 'R14', '', '', 'R14', '', 'R14'],
  ['RAFAEL ALBERTO SADOVAL', '', 'R2', 'R2', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA'],
  ['MHAMED KARZOUTI', '', 'R1', 'R1', 'R1', 'R1', '', '', 'R2', 'R2', 'R2', 'R2', '', '', 'R1', 'R1', '', '', 'R1', 'R1', '', '', 'R2', 'R2', 'R2', 'R2', '', '', 'R1', 'R1', 'R1', 'R1', '', ''],
  ['JOSE LUIS SEGUIN TOLA', '', '', 'R4', 'R2', 'R2', 'R2', 'R2', '', '', 'R1', 'R1', 'R1', 'R1', '', '', '', 'R2', 'R2', 'R2', 'R2', '', '', 'R1', 'R1', 'R1', '', 'R1', '', '', 'R2', 'R2', 'R2', '', 'R2'],
  ['IVAN PEREZ BENITEZ', '', 'R2', 'R2', '', '', 'R1', 'R1', 'R3', 'R1', '', '', 'R2', 'R2', 'R2', 'R2', '', '', '', 'R1', 'R1', 'R1', 'R1', '', '', 'R2', '', 'R2', 'R2', 'R2', '', '', 'R1', '', 'R1'],
  ['JOSE ANTONIO MEDINA MORENO', '', '', '', 'R3', 'R3', 'R3', 'R3', '', '', '', 'R4', 'R4', 'R4', '', '', '', 'R3', 'R3', 'R3', 'R3', '', '', 'R4', 'R4', 'R4', '', 'R4', '', '', 'R3', 'R3', 'R3', '', 'R3'],
  ['JOSE FRANCISCO RODRIGUEZ', '', 'V', 'V', 'V', 'V', 'V', 'V', 'R3', 'R3', 'R3', 'R3', '', '', 'R4', 'R4', '', '', 'R4', 'R4', '', '', 'R3', 'R3', 'R3', 'R3', '', '', 'R4', 'R4', 'R4', 'R4', '', ''],
  ['MBARK CHMOURK', '', 'R3', 'R3', '', '', 'R4', 'R4', 'R4', 'R4', '', '', 'R3', 'R3', 'R3', 'R3', '', '', '', 'R4', 'R4', 'R4', 'R4', '', '', 'R3', '', 'R3', 'R3', 'R3', '', '', 'R4', '', 'R4'],
  ['OSCAR VILLAR RODRIGUEZ', '', 'R7', '', '', 'R7', 'R7', 'R7', 'R7', '', '', 'R7', 'R7', 'R7', 'R7', '', '', '', 'R7', 'R7', 'R7', 'R7', '', '', 'R7', 'V', '', 'R7', 'R7', '', '', 'R7', 'R7', '', 'R7'],
  ['HAMID BOULAAJOUL', '', '', '', 'R7', 'R7', 'R8', 'R8', '', '', 'R7', 'R7', 'R8', 'R8', '', '', 'R7', '', '', 'R7', 'R8', 'R8', '', '', 'R7', 'R7', 'R8', 'R8', '', '', 'R7', 'R7', 'R8', 'R8', '', ''],
  ['TOMAS RUBIO', '', 'R8', 'R8', 'R8', '', '', 'R8', 'R8', 'R8', 'R8', '', '', 'R8', 'R8', 'R8', '', '', 'R8', '', '', 'R8', 'R8', 'R8', 'R8', '', '', 'R8', 'R8', 'R8', 'R8', '', '', 'R8'],
  ['JUAN MANUEL SANTANA', '', '', '', 'HS', 'R5', 'R5', 'R5', '', '', 'R6', 'HS', 'R6', 'R6', '', '', 'HS', '', '', 'HS', 'R5', 'R5', '', '', 'HS', 'R6', 'R6', 'R6', '', '', 'R5', 'R5', 'R5', 'HS', '', ''],
  ['MOHAMMED SERBITOU', '', 'R5', '', '', 'R6', 'R6', 'R6', 'R6', '', 'R4', 'R5', 'R5', 'R5', 'R5', '', '', '', 'R6', 'R6', 'R6', 'R6', '', '', 'R5', 'R5', '', 'R5', 'R5', '', '', 'R6', 'R6', '', 'R6'],
  ['BILAL IKKEN', '', 'R6', 'R6', 'R6', '', '', 'R5', 'R5', 'R5', 'R5', '', '', 'R6', 'R6', 'R6', '', '', 'R6', '', '', 'R5', 'R5', 'R5', 'R5', '', '', 'R6', 'R6', 'R6', 'R6', '', '', 'R5'],
  ['JOSE CERRATO', '', 'R9', '', 'R9', 'R9', 'R9', 'R9', 'R9', 'R9', '', 'R9', 'R9', 'R9', 'R9', 'R9', '', '', 'R9', '', 'R9', 'R9', 'R9', 'R9', 'R9', 'R9', '', '', 'R9', 'R9', 'R9', 'R9', 'R9', 'R9', '', ''],
  ['GABRIEL HERNANDEZ RAMIREZ', '', 'CM', 'CM/R9', '', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA'],
  ['EDGARDO', '', 'CT', '', 'CM', 'CM', 'CT', 'CT', '', '', 'CM-R9', 'CM', 'CT', 'CT', '', '', '', 'CM', 'CM', 'CT', 'CT', '', '', 'CT', 'CT', 'CT', '', 'CT', '', '', 'CT', 'CT', 'CT', '', 'CT'],
  ['FEDERICO RENALDO', '', 'R4', 'CT', 'CT', 'CT', '', '', 'CT', 'CT', 'CT', 'CT', '', '', 'CT', 'CT', '', '', 'CT', 'CT', '', '', 'V', 'V', 'V', 'V', '', 'V', 'CT', 'CT', 'CT', 'CT', '', ''],
  ['JESUS YERAY PERDOMO ORTEGA', '', '', '', 'R4', 'R4', 'GT', 'GT', 'GT', '', '', 'P', 'P', 'GT', 'GT', 'R5', '', '', 'P', 'P', 'CT', 'CT', 'GT', '', '', 'P', 'P', 'GT', 'CM', 'GT', '', '', ''],
  ['ANTONIO LOPEZ ALFARO', '', '', '', 'GT', 'GT', 'P', 'P', 'P', '', '', 'GT', 'GT', 'P', 'P', 'P', '', '', 'GT', 'GT', 'P', 'P', 'P', '', '', 'GT', 'GT', 'P', 'P', 'P', '', ''],
  ['NOUREDDIND LAGHZAOUNI', '', 'R13', 'R13', 'P', 'R13', 'R13', '', '', 'GT', 'R6', 'P', 'P', 'P', '', '', '', 'R5', 'GT', 'P', 'P', 'CT', '', '', 'GT', 'GT', '', 'P', 'P', 'P', '', '', 'GT', '', 'GT'],
  ['ALEJANDRO FUENTE LOPEZ', '', 'R14', 'R14', 'R14', 'R14', 'R14', '', '', '', '', 'R14', 'R14', 'R14', 'R14', 'R14', '', '', '', 'R14', 'R14', 'R14', 'R14', 'R14', '', '', 'R14', 'R14', 'R14', 'R14', 'R14', '', ''],
  ['JAIMEN GOMEZ ORDOÑEZ', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA'],
  ['J ENRIQUE SOTO', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', 'BAJA', '', 'BAJA'],
];

const ws = XLSX.utils.aoa_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, 'November 2024');
XLSX.writeFile(wb, 'November_2024_Calendar.xlsx');

console.log('✅ November 2024 Calendar created: November_2024_Calendar.xlsx');
console.log('📊 Data Summary:');
console.log('   - 31 Drivers (Conductores)');
console.log('   - 30 Days (November 2024)');
console.log('   - Multiple Routes (R1-R15)');
console.log('   - Vacations (V, BAJA, HS, P)');
console.log('   - Operations (CM, CT, GT)');
