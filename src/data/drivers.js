// Driver data with categories: lanzarote, local_morning, local_night
export const drivers = [
  // RUTAS A LANZAROTE (Yellow section)
  { id: 1, name: 'ATILA GEORGE', type: 'driver', category: 'lanzarote' },
  { id: 2, name: 'MELAMAR', type: 'driver', category: 'lanzarote' },
  { id: 3, name: 'GUSTAVO PELAN', type: 'driver', category: 'lanzarote' },
  { id: 4, name: 'JULIAN TAMAYO', type: 'driver', category: 'lanzarote' },
  { id: 5, name: 'SERGIO HERNANDEZ', type: 'driver', category: 'lanzarote' },
  { id: 6, name: 'J.HARRISON LOPEZ', type: 'driver', category: 'lanzarote' },
  { id: 7, name: 'ARISTON', type: 'driver', category: 'lanzarote' },
  { id: 8, name: 'HERMAN GLAUS', type: 'driver', category: 'lanzarote' },
  { id: 9, name: 'RAFY', type: 'driver', category: 'lanzarote' },
  
  // RUTAS LOCALES MAÑANA (Light section)
  { id: 10, name: 'RAFAEL ALBERTO', type: 'driver', category: 'local_morning' },
  { id: 11, name: 'MOHAMED BANITEZ', type: 'driver', category: 'local_morning' },
  { id: 12, name: 'MOHAMED', type: 'driver', category: 'local_morning' },
  { id: 13, name: 'IVAN PEREZ BANITEZ', type: 'driver', category: 'local_morning' },
  { id: 14, name: 'JOSE LUIS SEGUIN', type: 'driver', category: 'local_morning' },
  { id: 15, name: 'JOSE FRANCISCO', type: 'driver', category: 'local_morning' },
  { id: 16, name: 'MERAK CONDEVORK', type: 'driver', category: 'local_morning' },
  { id: 17, name: 'OSCAR MILLAR', type: 'driver', category: 'local_morning' },
  { id: 18, name: 'NAVID DOLGOMANOV', type: 'driver', category: 'local_morning' },
  { id: 19, name: 'JESUS GASGUI', type: 'driver', category: 'local_morning' },
  
  // RUTAS LOCALES NOCHE (Light section)
  { id: 20, name: 'DANIEL BAEZ', type: 'driver', category: 'local_night' },
  { id: 21, name: 'JUAN MANUEL', type: 'driver', category: 'local_night' },
  { id: 22, name: 'RAFAEL GONZALO', type: 'driver', category: 'local_night' },
  { id: 23, name: 'BILAL IACER', type: 'driver', category: 'local_night' },
  { id: 24, name: 'OMAR CONZALO', type: 'driver', category: 'local_night' },
  { id: 25, name: 'JOSE GERRATO', type: 'driver', category: 'local_night' },
  { id: 26, name: 'RAMON HERNANDEZ', type: 'driver', category: 'local_night' },
  { id: 27, name: 'GABRIEL HERMANDEZ', type: 'driver', category: 'local_night' },
  { id: 28, name: 'ANTONIO LUIO', type: 'driver', category: 'local_night' },
  { id: 29, name: 'FEDERICO HENALDO', type: 'driver', category: 'local_night' },
  
  // PERSONAL / STAFF (Green section - Loaders)
  { id: 30, name: 'DANIEL GONZALEZ', type: 'loader' },
  { id: 31, name: 'JESUS FERRI', type: 'loader' },
  { id: 32, name: 'ANTONIO', type: 'loader' },
  { id: 33, name: 'BOUHADDOU', type: 'loader' }
];

// Import November 2024 schedule
import { november2024Schedule } from './november2024.js';

// Use November 2024 data or generate empty schedule
export const scheduleData = november2024Schedule || {};
