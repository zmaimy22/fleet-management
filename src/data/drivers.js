// Driver data with categories: lanzarote, local_morning, local_night
export const drivers = [
  // RUTAS A LANZAROTE (Yellow section)
  { id: 1, name: 'ATILA MARTINEZ', type: 'driver', category: 'lanzarote' },
  { id: 2, name: 'MELAMAR RODRIGUEZ', type: 'driver', category: 'lanzarote' },
  { id: 3, name: 'GUSTAVO GARCIA', type: 'driver', category: 'lanzarote' },
  { id: 4, name: 'JULIAN FERNANDEZ', type: 'driver', category: 'lanzarote' },
  { id: 5, name: 'SERGIO LOPEZ', type: 'driver', category: 'lanzarote' },
  { id: 6, name: 'J.HARRISON SANCHEZ', type: 'driver', category: 'lanzarote' },
  { id: 7, name: 'ARISTON PEREZ', type: 'driver', category: 'lanzarote' },
  { id: 8, name: 'HERMAN GONZALEZ', type: 'driver', category: 'lanzarote' },
  { id: 9, name: 'RAFY MORALES', type: 'driver', category: 'lanzarote' },
  
  // RUTAS LOCALES MAÑANA (Light section)
  { id: 10, name: 'RAFAEL NAVARRO', type: 'driver', category: 'local_morning' },
  { id: 11, name: 'MOHAMED DIAZ', type: 'driver', category: 'local_morning' },
  { id: 12, name: 'MOHAMED TORRES', type: 'driver', category: 'local_morning' },
  { id: 13, name: 'IVAN RAMIREZ', type: 'driver', category: 'local_morning' },
  { id: 14, name: 'JOSE LUIS JIMENEZ', type: 'driver', category: 'local_morning' },
  { id: 15, name: 'JOSE FRANCISCO RUIZ', type: 'driver', category: 'local_morning' },
  { id: 16, name: 'MERAK ALVAREZ', type: 'driver', category: 'local_morning' },
  { id: 17, name: 'OSCAR ROMERO', type: 'driver', category: 'local_morning' },
  { id: 18, name: 'NAVID CRUZ', type: 'driver', category: 'local_morning' },
  { id: 19, name: 'JESUS MOLINA', type: 'driver', category: 'local_morning' },
  
  // RUTAS LOCALES NOCHE (Light section)
  { id: 20, name: 'DANIEL CASTRO', type: 'driver', category: 'local_night' },
  { id: 21, name: 'JUAN MANUEL ORTIZ', type: 'driver', category: 'local_night' },
  { id: 22, name: 'RAFAEL REYES', type: 'driver', category: 'local_night' },
  { id: 23, name: 'BILAL VARGAS', type: 'driver', category: 'local_night' },
  { id: 24, name: 'OMAR MENDEZ', type: 'driver', category: 'local_night' },
  { id: 25, name: 'JOSE HERRERA', type: 'driver', category: 'local_night' },
  { id: 26, name: 'RAMON IGLESIAS', type: 'driver', category: 'local_night' },
  { id: 27, name: 'GABRIEL MEDINA', type: 'driver', category: 'local_night' },
  { id: 28, name: 'ANTONIO SILVA', type: 'driver', category: 'local_night' },
  { id: 29, name: 'FEDERICO VEGA', type: 'driver', category: 'local_night' },
  
  // PERSONAL / STAFF (Green section - Loaders)
  { id: 30, name: 'DANIEL RAMOS', type: 'loader' },
  { id: 31, name: 'JESUS SUAREZ', type: 'loader' },
  { id: 32, name: 'ANTONIO CAMPOS', type: 'loader' },
  { id: 33, name: 'BOUHADDOU DELGADO', type: 'loader' }
];

// Import November 2024 schedule
import { november2024Schedule } from './november2024.js';

// Use November 2024 data or generate empty schedule
export const scheduleData = november2024Schedule || {};
