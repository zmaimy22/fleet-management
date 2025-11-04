// November 2024 Schedule Data
// Format: Each driver has days 1-30 with {type, value}
// Types: 'weekend', 'work', 'vacation', 'sick'
// Red cells = weekend, Yellow with V = vacation, Blue/White = work routes

export const november2024Schedule = {
  // ID 1: ATILA GEORGE
  1: {
    1: {type: 'weekend', value: ''}, 2: {type: 'weekend', value: ''}, 3: {type: 'weekend', value: ''},
    4: {type: 'work', value: 'R12'}, 5: {type: 'work', value: 'R12'}, 6: {type: 'work', value: 'R12'},
    7: {type: 'work', value: 'R12'}, 8: {type: 'work', value: 'R12'}, 9: {type: 'weekend', value: ''},
    10: {type: 'weekend', value: ''}, 11: {type: 'work', value: 'R12'}, 12: {type: 'work', value: 'R12'},
    13: {type: 'work', value: 'R12'}, 14: {type: 'work', value: 'R12'}, 15: {type: 'work', value: 'R12'},
    16: {type: 'weekend', value: ''}, 17: {type: 'weekend', value: ''}, 18: {type: 'work', value: 'CM'},
    19: {type: 'work', value: 'R12'}, 20: {type: 'work', value: 'R12'}, 21: {type: 'work', value: 'CM'},
    22: {type: 'work', value: 'R12'}, 23: {type: 'weekend', value: ''}, 24: {type: 'weekend', value: ''},
    25: {type: 'work', value: 'CM'}, 26: {type: 'work', value: 'CM'}, 27: {type: 'work', value: 'R12'},
    28: {type: 'work', value: 'CM'}, 29: {type: 'work', value: 'R12'}, 30: {type: 'weekend', value: ''}
  },
  
  // ID 2: MELAMAR
  2: {
    1: {type: 'work', value: 'R12'}, 2: {type: 'work', value: 'R12'}, 3: {type: 'weekend', value: ''},
    4: {type: 'weekend', value: ''}, 5: {type: 'work', value: 'R12'}, 6: {type: 'work', value: 'R12'},
    7: {type: 'work', value: 'R12'}, 8: {type: 'work', value: 'R12'}, 9: {type: 'work', value: 'R12'},
    10: {type: 'weekend', value: ''}, 11: {type: 'weekend', value: ''}, 12: {type: 'work', value: 'R12'},
    13: {type: 'work', value: 'R13'}, 14: {type: 'weekend', value: ''}, 15: {type: 'work', value: 'R12'},
    16: {type: 'work', value: 'CP/dt'}, 17: {type: 'weekend', value: ''}, 18: {type: 'work', value: 'R12'},
    19: {type: 'work', value: 'R13'}, 20: {type: 'vacation', value: 'V'}, 21: {type: 'weekend', value: ''},
    22: {type: 'weekend', value: ''}, 23: {type: 'work', value: 'R13'}, 24: {type: 'work', value: 'R13'},
    25: {type: 'work', value: 'R13'}, 26: {type: 'work', value: 'R13'}, 27: {type: 'work', value: 'R13'},
    28: {type: 'weekend', value: ''}, 29: {type: 'weekend', value: ''}, 30: {type: 'work', value: 'R13'}
  },

  // ID 3: GUSTAVO PELAN - Generate with 4/2 pattern
  3: generateDriverSchedule(3, 1),
  4: generateDriverSchedule(4, 2),
  5: generateDriverSchedule(5, 3),
  6: generateDriverSchedule(6, 4),
  7: generateDriverSchedule(7, 0),
  8: generateDriverSchedule(8, 1),
  9: generateDriverSchedule(9, 2),
  10: generateDriverSchedule(10, 3),
  11: generateDriverSchedule(11, 4),
  12: generateDriverSchedule(12, 0),
  13: generateDriverSchedule(13, 1),
  14: generateDriverSchedule(14, 2),
  15: generateDriverSchedule(15, 3),
  16: generateDriverSchedule(16, 4),
  17: generateDriverSchedule(17, 0),
  18: generateDriverSchedule(18, 1),
  19: generateDriverSchedule(19, 2),
  20: generateDriverSchedule(20, 3),
  21: generateDriverSchedule(21, 4),
  22: generateDriverSchedule(22, 0),
  23: generateDriverSchedule(23, 1),
  24: generateDriverSchedule(24, 2),
  25: generateDriverSchedule(25, 3),
  26: generateDriverSchedule(26, 4),
  27: generateDriverSchedule(27, 0),
  28: generateDriverSchedule(28, 1),
  29: generateDriverSchedule(29, 2),
  
  // Loaders
  30: generateLoaderSchedule(30, 0),
  31: generateLoaderSchedule(31, 3),
  32: generateLoaderSchedule(32, 0),
  33: generateLoaderSchedule(33, 3)
};

// Helper function to generate 4 work / 2 rest pattern
function generateDriverSchedule(driverId, startOffset) {
  const schedule = {};
  const routes = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R11', 'R12', 'R13', 'R14', 'R15'];
  
  for (let day = 1; day <= 30; day++) {
    const dayIndex = (day - 1 + startOffset) % 6;
    
    if (dayIndex < 4) {
      // Work day
      const routeIndex = (driverId + day) % routes.length;
      schedule[day] = { type: 'work', value: routes[routeIndex] };
    } else {
      // Rest day
      schedule[day] = { type: 'weekend', value: '' };
    }
  }
  
  return schedule;
}

// Helper for loaders (CT/CM pattern)
function generateLoaderSchedule(loaderId, startOffset) {
  const schedule = {};
  
  for (let day = 1; day <= 30; day++) {
    const dayIndex = (day - 1 + startOffset) % 6;
    
    if (dayIndex < 4) {
      const shift = day % 2 === 0 ? 'CM' : 'CT';
      schedule[day] = { type: 'work', value: shift };
    } else {
      schedule[day] = { type: 'weekend', value: '' };
    }
  }
  
  return schedule;
};
