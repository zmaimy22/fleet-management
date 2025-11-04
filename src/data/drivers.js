// Driver data with categories: lanzarote, local_morning, local_night
export const drivers = [
  // RUTAS A LANZAROTE (Yellow section)
  { id: 1, name: 'ATILA badi', type: 'driver', category: 'lanzarote' },
  { id: 2, name: 'minarman', type: 'driver', category: 'lanzarote' },
  { id: 3, name: 'GUSTAVO ramos', type: 'driver', category: 'lanzarote' },
  { id: 4, name: 'JULIAN ronaldo', type: 'driver', category: 'lanzarote' },
  { id: 5, name: 'SERGIO gavi', type: 'driver', category: 'lanzarote' },
  { id: 6, name: 'J.HARRISON cuba', type: 'driver', category: 'lanzarote' },
  { id: 7, name: 'ARISTON italy', type: 'driver', category: 'lanzarote' },
  { id: 8, name: 'HERMAN mini', type: 'driver', category: 'lanzarote' },
  { id: 9, name: 'RAFYel', type: 'driver', category: 'lanzarote' },
  
  // RUTAS LOCALES MAÑANA (Light section)
  { id: 10, name: 'RAFAEL suarez', type: 'driver', category: 'local_morning' },
  { id: 11, name: 'MOHAMED BENJAMIN', type: 'driver', category: 'local_morning' },
  { id: 12, name: 'MOHAMED', type: 'driver', category: 'local_morning' },
  { id: 13, name: 'IVAN RUBIO', type: 'driver', category: 'local_morning' },
  { id: 14, name: 'JOSE LUIS AZNAR', type: 'driver', category: 'local_morning' },
  { id: 15, name: 'JOSE DIEGO', type: 'driver', category: 'local_morning' },
  { id: 16, name: 'MERAK JAKI', type: 'driver', category: 'local_morning' },
  { id: 17, name: 'OSCAR ', type: 'driver', category: 'local_morning' },
  { id: 18, name: 'NAVID SERBOUTI', type: 'driver', category: 'local_morning' },
  { id: 19, name: 'JESUS ', type: 'driver', category: 'local_morning' },
  
  // RUTAS LOCALES NOCHE (Light section)
  { id: 20, name: 'DANIEL DANI', type: 'driver', category: 'local_night' },
  { id: 21, name: 'JUAN JUAM', type: 'driver', category: 'local_night' },
  { id: 22, name: 'RAFAEL RAFAEL', type: 'driver', category: 'local_night' },
  { id: 23, name: 'BILAL IS7AK', type: 'driver', category: 'local_night' },
  { id: 24, name: 'OMAR LAGH', type: 'driver', category: 'local_night' },
  { id: 25, name: 'JOSE TOTO', type: 'driver', category: 'local_night' },
  { id: 26, name: 'RAMON VILLAR', type: 'driver', category: 'local_night' },
  { id: 27, name: 'GABRIEL MONO', type: 'driver', category: 'local_night' },
  { id: 28, name: 'ANTONIO LUIS', type: 'driver', category: 'local_night' },
  { id: 29, name: 'FEDERICO MARIA', type: 'driver', category: 'local_night' },
  
  // PERSONAL / STAFF (Green section - Loaders)
  { id: 30, name: 'DANIEL DAVID', type: 'loader' },
  { id: 31, name: 'JESUS ROCHE', type: 'loader' },
  { id: 32, name: 'ANTONIO', type: 'loader' },
  { id: 33, name: 'BOUHADDOU', type: 'loader' }
];

// Import November 2024 schedule
import { november2024Schedule } from './november2024.js';

// Use November 2024 data or generate empty schedule
export const scheduleData = november2024Schedule || {};
