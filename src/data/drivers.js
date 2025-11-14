// Driver data with categories: lanzarote, local_morning, local_night
// originalCategory: permanent category (where driver belongs when not on sick leave)
// category: current category (can be 'bajas' temporarily)
export const drivers = [
  // RUTAS A LANZAROTE (Yellow section)
  { id: 1, name: 'ATILA GEORGE SUHAJDA', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R11' },
  { id: 2, name: 'MELALIAN', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R12' },
  { id: 3, name: 'GUSTAVO MELIAN FAJARDO', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R1' },
  { id: 4, name: 'JULIAN TAMAYO VILLA', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R5' },
  { id: 5, name: 'XERAD HERNADEZ RODRIGUEZ', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R13' },
  { id: 6, name: 'J.JARRIZON LOPEZ AMARILES', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R12' },
  { id: 7, name: 'ARISTEO OJEDA EXPOSITO', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R15' },
  { id: 8, name: 'TRAIAN OLARU', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R15' },
  { id: 9, name: 'HAFAD ABDERRAHAMAN', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R14' },
  { id: 31, name: 'ALEJANDRO FUENTE LOPEZ', type: 'driver', category: 'lanzarote', originalCategory: 'lanzarote', route: 'R14' },
  
  // RUTAS LOCALES MAÑANA (Light section)
  { id: 10, name: 'MHAMED KARZOUTI', type: 'driver', category: 'local_morning', originalCategory: 'local_morning', route: 'R1/R2' },
  { id: 11, name: 'IVAN PEREZ BENITEZ', type: 'driver', category: 'local_morning', originalCategory: 'local_morning' },
  { id: 12, name: 'JOSE ANTONIO MEDINA MORENO', type: 'driver', category: 'local_morning', originalCategory: 'local_morning', route: 'R3/R4' },
  { id: 13, name: 'HAMID BOULAAJOUL', type: 'driver', category: 'local_morning', originalCategory: 'local_morning', route: 'R7/R8' },
  { id: 14, name: 'TOMAS RUBIO', type: 'driver', category: 'local_morning', originalCategory: 'local_morning', route: 'R8' },
  { id: 15, name: 'RAFAEL ALBERTO SADOVAL', type: 'driver', category: 'local_morning', originalCategory: 'local_morning', route: 'R2' },
  { id: 32, name: 'JOSE LUIS SEGUIN TOLA', type: 'driver', category: 'local_morning', originalCategory: 'local_morning', route: 'R4' },
  { id: 33, name: 'JOSE FRANCISCO RODRIGUEZ', type: 'driver', category: 'local_morning', originalCategory: 'local_morning', route: 'R3/R4' },
  { id: 34, name: 'MBARK CHMOURK', type: 'driver', category: 'local_morning', originalCategory: 'local_morning', route: 'R3' },
  
  // ENCARGADOS / JEFE DE LOGISTICA
  { id: 18, name: 'JESUS YERAY PERDOMO ORTEGA', type: 'supervisor', category: 'supervisors', originalCategory: 'supervisors', route: 'R4/R5' },
  { id: 19, name: 'ANTONIO LOPEZ ALFARO', type: 'supervisor', category: 'supervisors', originalCategory: 'supervisors' },
  { id: 20, name: 'NOUREDDIND LAGHZAOUNI', type: 'supervisor', category: 'supervisors', originalCategory: 'supervisors', route: 'R13/R6/R5' },
  
  // CARGADORES
  { id: 16, name: 'EDGARDO', type: 'loader', category: 'loaders', originalCategory: 'loaders' },
  { id: 17, name: 'FEDERICO RENALDO', type: 'driver', category: 'loaders', originalCategory: 'loaders', route: 'R4' },
  { id: 30, name: 'JUAN MANUEL SANTANA', type: 'driver', category: 'loaders', originalCategory: 'loaders', route: 'R5/R6' },
  
  // BAJAS (Sick Leave) - drivers are dynamically moved here based on schedule
  
  // RUTAS LOCALES NOCHE (Light section)
  { id: 21, name: 'JAIMEN GOMEZ ORDOÑEZ', type: 'driver', category: 'local_night', originalCategory: 'local_night' },
  { id: 25, name: 'BILAL IKKEN', type: 'driver', category: 'local_night', originalCategory: 'local_night' },
  { id: 35, name: 'MOHAMMED SERBOUTI', type: 'driver', category: 'local_night', originalCategory: 'local_night', route: 'R5/R6' },
  { id: 36, name: 'JOSE CERRATO', type: 'driver', category: 'local_night', originalCategory: 'local_night', route: 'R9' },
  { id: 37, name: 'J ENRIQUE SOTO', type: 'driver', category: 'local_night', originalCategory: 'local_night' },
  { id: 28, name: 'OSCAR VILLAR RODRIGUEZ', type: 'driver', category: 'local_night', originalCategory: 'local_night', route: 'R7' },
  { id: 29, name: 'GABRIEL HERNANDEZ RAMIREZ', type: 'driver', category: 'local_night', originalCategory: 'local_night' }
];

// Import November 2024 schedule
import { november2024Schedule } from './november2024.js';

// Use November 2024 data or generate empty schedule
export const scheduleData = november2024Schedule || {};
