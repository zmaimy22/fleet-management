/**
 * Schedule Generation Algorithm
 * Implements 4/2 work pattern with vacation support
 */

/**
 * Infer the starting index of the 4/2 pattern based on previous month's schedule
 * @param {number} driverId - Driver ID
 * @param {object} prevSchedule - Previous month's schedule
 * @param {number} prevMonthDays - Number of days in previous month
 * @returns {number} Starting index (0-5) for the 4/2 pattern
 */
export const inferStartIndex = (driverId, prevSchedule, prevMonthDays) => {
  // If no previous month data, start from beginning of pattern
  if (!prevSchedule || !prevSchedule[driverId]) return 0;

  // Look at last 6 days of previous month
  const window = [];
  for (let d = Math.max(1, prevMonthDays - 5); d <= prevMonthDays; d++) {
    const cell = prevSchedule[driverId]?.[d];
    if (!cell) continue;
    window.push(cell.type);
  }

  if (window.length === 0) return 0; // default

  // Map types to pattern: work => W, weekend/off => O
  const mapType = (t) => (t === 'weekend' ? 'O' : 'W');
  const seq = window.map(mapType).join('');

  // Determine how many consecutive off days at end (0,1,2)
  const m = seq.match(/O+$/);
  const offTail = m ? Math.min(m[0].length, 2) : 0;

  // If ending with off days
  if (offTail === 1) return 5; // continue second off day
  if (offTail === 2) return 0; // back to work after 2 off days

  // Count work streak tail (max 4)
  const wm = seq.match(/W+$/);
  const wTail = wm ? Math.min(wm[0].length, 4) : 0;

  // Continue the work pattern
  if (wTail >= 4) return 4; // Start off days after 4 work days
  return wTail; // Continue work days
};

/**
 * Get the last CM/CT value and work streak from previous month's schedule
 * @param {number} driverId - Driver ID
 * @param {object} prevSchedule - Previous month's schedule
 * @param {number} prevMonthDays - Number of days in previous month
 * @returns {object} { lastValue: string, workStreak: number } - Last value and consecutive work days
 */
export const getLastLoaderValue = (driverId, prevSchedule, prevMonthDays) => {
  if (!prevSchedule || !prevSchedule[driverId] || !prevMonthDays) {
    return { lastValue: null, workStreak: 0 };
  }
  
  let lastValue = null;
  let workStreak = 0;
  
  // Search backwards from last day to count consecutive work days and find last value
  for (let d = prevMonthDays; d >= 1; d--) {
    const cell = prevSchedule[driverId]?.[d];
    if (cell && cell.type === 'work' && (cell.value === 'CM' || cell.value === 'CT')) {
      workStreak++;
      if (!lastValue) {
        lastValue = cell.value;
      }
    } else if (workStreak > 0) {
      // Hit a non-work day, stop counting
      break;
    }
  }
  
  return { lastValue, workStreak };
};

/**
 * Check if a date falls within any of the driver's approved vacation periods
 * @param {Date} date - The date to check
 * @param {array} driverVacations - Array of vacation objects for the driver
 * @returns {boolean} True if the date is a vacation day
 */
export const isVacationDay = (date, driverVacations) => {
  return driverVacations.some((v) => {
    const start = new Date(v.startDate);
    const end = new Date(v.endDate);
    return date >= start && date <= end;
  });
};

/**
 * Check if a day should be marked as weekend
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {number} day - Day of month
 * @returns {boolean} True if weekend
 */
export const isWeekend = (year, month, day) => {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6; // Sunday or Saturday
};

/**
 * Generate work value for a loader based on their index
 * @param {number} loaderIndex - Index of loader in the loaders list (0, 1, 2, ...)
 * @returns {string} 'CM' (morning) or 'CT' (afternoon)
 */
export const getLoaderValue = (loaderIndex) => {
  return loaderIndex % 2 === 0 ? 'CM' : 'CT';
};

/**
 * Calculate the pattern index for a given day
 * @param {number} startIndex - Starting index of the pattern
 * @param {number} day - Day of month
 * @returns {number} Pattern index (0-5)
 */
export const getPatternIndex = (startIndex, day) => {
  return (startIndex + day - 1) % 6;
};

/**
 * Check if pattern index indicates a work day
 * @param {number} patternIndex - Pattern index (0-5)
 * @returns {boolean} True if work day (0-3), false if rest day (4-5)
 */
export const isWorkDay = (patternIndex) => {
  return patternIndex <= 3;
};

/**
 * Build a mapping of secondary routes to their main routes
 * Example: R1.1 -> R1, R2.2 -> R2, R7.1 -> R7
 * @param {array} routeCodes - All route codes
 * @returns {object} Mapping object
 */
export const buildSecondaryRouteMap = (routeCodes) => {
  const map = {};
  
  routeCodes.forEach((route) => {
    if (route.includes('.')) {
      // This is a secondary route (e.g., R1.1)
      const mainPart = route.split('.')[0]; // Extract R1 from R1.1
      if (!map[mainPart]) {
        map[mainPart] = [];
      }
      map[mainPart].push(route);
    }
  });
  
  return map;
};

/**
 * Filter available drivers for a specific day
 * @param {array} drivers - All drivers
 * @param {object} schedule - Current schedule
 * @param {number} day - Day to check
 * @param {string} type - Driver type filter ('driver', 'loader', etc.)
 * @param {string} category - Driver category filter (optional)
 * @returns {array} Available drivers
 */
export const getAvailableDrivers = (
  drivers,
  schedule,
  day,
  type = 'driver',
  category = null
) => {
  return drivers.filter((d) => {
    // Check type
    if (d.type !== type) return false;

    // Check category if specified
    if (category && d.category !== category) return false;

    // Check if driver is working this day
    const cell = schedule[d.id]?.[day];
    return cell && cell.type === 'work';
  });
};

/**
 * Main schedule generation function
 * @param {object} params - Generation parameters
 * @returns {object} Generated schedule
 */
export const generateSchedule = ({
  drivers,
  currentMonth,
  currentYear,
  routeCodes,
  approvedVacations,
  prevSchedule,
  groups = [], // Add groups parameter
  routes = [], // Add routes parameter for route configuration
}) => {
  // Calculate days in month
  const days = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // DEBUG: Log generation context
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  console.log('📅 DEBUG Generate Schedule:', {
    currentMonth: `${monthNames[currentMonth]} ${currentYear}`,
    previousMonth: `${monthNames[prevMonth]} ${prevYear}`,
    hasPrevSchedule: !!prevSchedule,
    prevScheduleDriverCount: prevSchedule ? Object.keys(prevSchedule).length : 0,
    days,
    prevMonthDays
  });

  // Initialize schedule
  const schedule = {};

  // Step 1: Apply 5/2 pattern for drivers and loaders, custom pattern for ayudantes
  // Step 1: Apply 5/2 pattern for drivers and loaders, custom pattern for ayudantes
  drivers.forEach((driver) => {
    if (!schedule[driver.id]) {
      schedule[driver.id] = {};
    }

    // Handle Ayudante type with custom rest days
    if (driver.type === 'ayudante') {
      const restDay1 = parseInt(driver.restDay1 || '6'); // Default Saturday
      const restDay2 = parseInt(driver.restDay2 || '0'); // Default Sunday
      
      for (let day = 1; day <= days; day++) {
        const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
        
        if (dayOfWeek === restDay1 || dayOfWeek === restDay2) {
          // Rest day
          schedule[driver.id][day] = { type: 'weekend', value: '' };
        } else {
          // Work day - assign the route
          const route = driver.assignedRoute || '';
          schedule[driver.id][day] = { type: 'work', value: route };
        }
      }
    } else if (driver.type === 'supervisor') {
      // Supervisors: respect configured weekly rest days (Primer/Segundo Día de Descanso)
      const restDay1 = parseInt(driver.restDay1 || '6'); // Saturday default
      const restDay2 = parseInt(driver.restDay2 || '0'); // Sunday default
      for (let day = 1; day <= days; day++) {
        const dow = new Date(currentYear, currentMonth, day).getDay();
        const isRest = dow === restDay1 || dow === restDay2;
        schedule[driver.id][day] = { type: isRest ? 'weekend' : 'work', value: '' };
      }
    } else if (driver.type === 'driver') {
      // Special-case: JOSE CERRATO always works R9 six days, rests one (Sunday)
      const dn = (driver.name || '').toUpperCase();
      if (dn.includes('JOSE') && dn.includes('CERRATO')) {
        for (let day = 1; day <= days; day++) {
          const dow = new Date(currentYear, currentMonth, day).getDay();
          if (dow === 0) {
            schedule[driver.id][day] = { type: 'weekend', value: '' };
          } else {
            schedule[driver.id][day] = { type: 'work', value: 'R9' };
          }
        }
        return;
      }
      // Drivers work 4/2 pattern (4 work days, 2 rest days)
      // Continue pattern from previous month
      let startIndex = inferStartIndex(driver.id, prevSchedule, prevMonthDays);
      
      // Find driver's route assignments from routes configuration
      // Look for routes where this driver is assigned (primaryDriver, secondaryDriver, alternatingDriver, or in assignedDrivers list)
      const driverRoutes = routes.filter(route => {
        const primaryMatch = route.primaryDriver && String(route.primaryDriver) === String(driver.id);
        const secondaryMatch = route.secondaryDriver && String(route.secondaryDriver) === String(driver.id);
        const alternatingMatch = route.alternatingDriver && String(route.alternatingDriver) === String(driver.id);
        const assignedMatch = Array.isArray(route.assignedDrivers) && route.assignedDrivers.some(id => String(id) === String(driver.id));
        return primaryMatch || secondaryMatch || alternatingMatch || assignedMatch;
      });
      

      
      // Determine route assignment mode and routes
      let assignmentMode = 'default';
      let assignedRoutes = [];
      let driverRole = null; // 'primary', 'secondary', 'alternating', or index for loader_like
      let primaryDriverStartIndex = null;
      let secondaryDriverStartIndex = null;
      let mainRoute = null;
      
      if (driverRoutes.length > 0) {
        // For alternating mode, we need to find the correct route based on driver's role
        // PRIORITY: Find where driver is PRIMARY first (their main route)
        mainRoute = driverRoutes.find(route => String(route.primaryDriver) === String(driver.id));
        
        // If not primary, check if secondary
        if (!mainRoute) {
          mainRoute = driverRoutes.find(route => String(route.secondaryDriver) === String(driver.id));
        }
        
        // If not found as primary/secondary, must be alternating - use first route
        if (!mainRoute) {
          mainRoute = driverRoutes[0];
        }
        
        assignmentMode = mainRoute.assignmentMode || 'default';
        
        if (assignmentMode === 'alternating_2x2') {
          // For alternancia mode, determine if driver is primary, secondary, or alternating
          if (String(mainRoute.primaryDriver) === String(driver.id)) {
            driverRole = 'primary';
            assignedRoutes = [mainRoute.shortCode];
          } else if (String(mainRoute.secondaryDriver) === String(driver.id)) {
            driverRole = 'secondary';
            assignedRoutes = [mainRoute.alternatingLinkedRoute].filter(Boolean);
          } else if (String(mainRoute.alternatingDriver) === String(driver.id)) {
            driverRole = 'alternating';
            assignedRoutes = [mainRoute.shortCode, mainRoute.alternatingLinkedRoute].filter(Boolean);
            // Get start indices for primary and secondary drivers to know their rest days
            const primaryDriver = drivers.find(d => String(d.id) === String(mainRoute.primaryDriver));
            const secondaryDriver = drivers.find(d => String(d.id) === String(mainRoute.secondaryDriver));
            if (primaryDriver) {
              primaryDriverStartIndex = inferStartIndex(primaryDriver.id, prevSchedule, prevMonthDays);
            }
            if (secondaryDriver) {
              secondaryDriverStartIndex = inferStartIndex(secondaryDriver.id, prevSchedule, prevMonthDays);
            }
          }
        } else if (assignmentMode === 'loader_like') {
          // For loader_like mode, get all 3 drivers and their routes
          if (Array.isArray(mainRoute.assignedDrivers)) {
            driverRole = mainRoute.assignedDrivers.findIndex(id => String(id) === String(driver.id));
          } else {
            driverRole = -1;
          }
          assignedRoutes = [mainRoute.shortCode, mainRoute.loaderLinkedRoute].filter(Boolean);
          // Create staggered rest days only when role is known (0,1,2)
          const loaderStartIndices = [4, 0, 2];
          if (driverRole >= 0) {
            startIndex = loaderStartIndices[driverRole % 3];
          }
        } else {
          // Default mode - just use the route
          assignedRoutes = [mainRoute.shortCode];
        }
      }
      
      // Only use routes configuration from Rutas page - no fallback
      
      for (let day = 1; day <= days; day++) {
        const patternIndex = getPatternIndex(startIndex, day);
        const isWork = isWorkDay(patternIndex);

        if (isWork) {
          // Work day - assign route based on pattern type
          let routeValue = '';
          
          if (assignedRoutes.length > 0) {
            if (assignmentMode === 'alternating_2x2') {
              if (driverRole === 'primary' || driverRole === 'secondary') {
                // Primary works on main route, secondary works on linked route
                routeValue = assignedRoutes[0];
              } else if (driverRole === 'alternating') {
                // Alternating driver covers rest days of both primary and secondary
                // Check if primary is resting
                if (primaryDriverStartIndex !== null) {
                  const primaryPatternIndex = getPatternIndex(primaryDriverStartIndex, day);
                  const primaryIsResting = !isWorkDay(primaryPatternIndex);
                  if (primaryIsResting) {
                    routeValue = assignedRoutes[0]; // Main route
                  }
                }
                // Check if secondary is resting
                if (!routeValue && secondaryDriverStartIndex !== null && assignedRoutes.length > 1) {
                  const secondaryPatternIndex = getPatternIndex(secondaryDriverStartIndex, day);
                  const secondaryIsResting = !isWorkDay(secondaryPatternIndex);
                  if (secondaryIsResting) {
                    routeValue = assignedRoutes[1]; // Linked route
                  }
                }
              }
              
            } else if (assignmentMode === 'loader_like') {
              // Rotación tipo Cargadores: Simple repeating pattern
              // Each driver: 4 work days on Route X → 2 rest → 4 work days on Route Y → 2 rest
              // Pattern repeats every 12 days (two 6-day cycles)
              // Role 0 & 2: R1→R2→R1→R2...
              // Role 1: R2→R1→R2→R1... (opposite)
              
              // Calculate absolute day position considering startIndex
              // startIndex tells us where we are in the 6-day cycle from previous month
              const absoluteDayPosition = startIndex + day - 1;
              
              // Each cycle = 6 days (4 work + 2 rest)
              // Count how many complete 6-day cycles have passed
              const completedCycles = Math.floor(absoluteDayPosition / 6);
              
              // Role 1 & 2 start with opposite routes from Role 0
              // Role 0: R1→R2→R1... (offset=0)
              // Role 1: R1→R2→R1... (offset=0) - same as Role 0
              // Role 2: R2→R1→R2... (offset=1) - opposite
              const startingRouteOffset = driverRole === 2 ? 1 : 0;
              const routeIndex = (completedCycles + startingRouteOffset) % 2;
              
              routeValue = assignedRoutes[routeIndex % assignedRoutes.length];
              
            } else {
              // Default: simple rotation through all assigned routes
              routeValue = assignedRoutes[day % assignedRoutes.length];
            }
          }
          
          schedule[driver.id][day] = { type: 'work', value: routeValue };
        } else {
          // Rest day
          schedule[driver.id][day] = { type: 'weekend', value: '' };
        }
      }
    } else if (driver.type === 'loader' || driver.category === 'loaders') {
      // Loaders work 4/2 pattern with guaranteed 2+ workers every day
      // Special rotation pattern to ensure coverage:
      // Loader 0: rest days 1,2,7,8,13,14... (pattern: work 4, rest 2, work 4, rest 2)
      // Loader 1: rest days 3,4,9,10,15,16... (offset by 2 days)
      // Loader 2: rest days 5,6,11,12,17,18... (offset by 4 days)
      // ALTERNATING: CM → rest → CT → rest → CM → rest → CT...
      const loaderIndex = drivers.filter(d => (d.type === 'loader' || d.category === 'loaders') && d.id < driver.id).length;
      
      // Each loader offset by 2 days from previous: 0, 2, 4, 0, 2, 4...
      const offset = (loaderIndex * 2) % 6;
      
      // Get startIndex from previous month if available
      let loaderStartIndex = 0;
      if (prevSchedule && prevSchedule[driver.id] && prevMonthDays) {
        loaderStartIndex = inferStartIndex(driver.id, prevSchedule, prevMonthDays);
      }
      
      // Get last CM/CT value and work streak from previous month to maintain continuity
      const { lastValue, workStreak } = getLastLoaderValue(driver.id, prevSchedule, prevMonthDays);
      
      // DEBUG: Log loader continuity info
      if (driver.category === 'loaders' || driver.type === 'loader') {
        console.log(`🔍 DEBUG Loader [${driver.name}]:`, {
          driverId: driver.id,
          hasPrevSchedule: !!prevSchedule,
          prevMonthDays,
          lastValue,
          workStreak,
          loaderIndex,
          offset
        });
      }
      
      let currentValue = null; // Track current CM/CT value across days
      let daysInCurrentValue = 0; // Days worked with current value
      
      // Initialize based on previous month
      let forceRestAfter = null;
      let lastWorkedValue = null;
      if (lastValue && workStreak > 0 && workStreak < 4) {
        currentValue = lastValue;
        lastWorkedValue = lastValue;
        daysInCurrentValue = workStreak;
        forceRestAfter = 4 - workStreak; // كم يوم يجب أن يعمل قبل الراحة
      }
      
      let forcedRestCounter = 0;
      for (let day = 1; day <= days; day++) {
        // إذا كنا في وضع الإكمال بعد شهر سابق ناقص
        if (forceRestAfter !== null && forceRestAfter > 0) {
          // أكمل أيام العمل حتى 4
          schedule[driver.id][day] = { type: 'work', value: currentValue };
          daysInCurrentValue++;
          forceRestAfter--;
          lastWorkedValue = currentValue;
          
          // إذا أكمل 4 أيام عمل، يجب أن يأخذ راحة مباشرة
          if (forceRestAfter === 0) {
            forcedRestCounter = 2; // راحة يومين
          }
          continue;
        }
        // إذا يجب أن يأخذ راحة إجبارية بعد الإكمال
        if (forcedRestCounter > 0) {
          schedule[driver.id][day] = { type: 'weekend', value: '' };
          forcedRestCounter--;
          
          // بعد الراحة، يبدأ دورة جديدة بقيمة معكوسة عن آخر قيمة عمل
          if (forcedRestCounter === 0) {
            if (lastWorkedValue === 'CM') {
              currentValue = 'CT';
            } else if (lastWorkedValue === 'CT') {
              currentValue = 'CM';
            } else {
              currentValue = null;
            }
            daysInCurrentValue = 0;
          }
          continue;
        }
        // ...النمط العادي...
        // Calculate position in 6-day cycle with offset
        const position = (day - 1 + offset) % 6;
        // Work on positions 2,3,4,5 (4 days), rest on 0,1 (2 days)
        const isWork = position >= 2;

        if (isWork) {
          if (position === 2) {
            if (lastWorkedValue === 'CM') {
              currentValue = 'CT';
            } else if (lastWorkedValue === 'CT') {
              currentValue = 'CM';
            }
            daysInCurrentValue = 0;
          }
          // Determine CM/CT value
          let loaderValue;
          if (currentValue && daysInCurrentValue < 4) {
            loaderValue = currentValue;
            daysInCurrentValue++;
          } else {
            if (!currentValue) {
              // بداية دورة جديدة: عكس آخر قيمة عمل
              if (lastWorkedValue === 'CM') {
                loaderValue = 'CT';
              } else if (lastWorkedValue === 'CT') {
                loaderValue = 'CM';
              } else {
                // أول مرة في السنة: استخدم النمط الافتراضي القديم
                const absoluteDayPosition = loaderStartIndex + day - 1 + offset;
                const completedCycles = Math.floor(absoluteDayPosition / 6);
                const startingValueOffset = loaderIndex === 1 ? 1 : 0;
                const valueIndex = (completedCycles + startingValueOffset) % 2;
                loaderValue = valueIndex === 0 ? 'CM' : 'CT';
              }
            } else {
              loaderValue = currentValue === 'CM' ? 'CT' : 'CM';
            }
            currentValue = loaderValue;
            daysInCurrentValue = 1;
          }
          lastWorkedValue = loaderValue;
          
          if ((driver.name || '').toUpperCase().includes('EDGAR')) {
            loaderValue = loaderValue === 'CM' ? 'CT' : loaderValue === 'CT' ? 'CM' : loaderValue;
          }
          schedule[driver.id][day] = { type: 'work', value: loaderValue };
        } else {
          if (daysInCurrentValue >= 4) {
            daysInCurrentValue = 0;
          }
          schedule[driver.id][day] = { type: 'weekend', value: '' };
        }
      }
    } else {
      // Other types (if any) - default to weekend pattern
      for (let day = 1; day <= days; day++) {
        const isWeekendDay = isWeekend(currentYear, currentMonth, day);
        schedule[driver.id][day] = { type: isWeekendDay ? 'weekend' : 'work', value: '' };
      }
    }
  });

  // Carry over BAJA for entire month if last day of previous month was BAJA
  drivers.forEach((driver) => {
    const prevCell = prevSchedule?.[driver.id]?.[prevMonthDays];
    const wasBaja = !!(prevCell && (prevCell.type === 'sick' || (typeof prevCell.value === 'string' && prevCell.value.toUpperCase() === 'BAJA')));
    if (wasBaja) {
      for (let day = 1; day <= days; day++) {
        schedule[driver.id][day] = { type: 'sick', value: 'BAJA' };
      }
    }
  });

  // Step 2: Apply approved vacation requests
  let vacationCount = 0;
  approvedVacations.forEach((vacation) => {
    const driver = drivers.find((d) => d.id === vacation.driverId);
    if (!driver) return;

    const start = new Date(vacation.startDate);
    const end = new Date(vacation.endDate);

    for (let day = 1; day <= days; day++) {
      const currentDate = new Date(currentYear, currentMonth, day);

      if (currentDate >= start && currentDate <= end) {
        schedule[driver.id][day] = { type: 'vacation', value: 'V' };
        vacationCount++;
      }
    }
  });

  // Step 2.5: Assign GT/P rotation for supervisors with rest-aware 2-day blocks
  const supervisors = drivers.filter(d => d.type === 'supervisor');
  if (supervisors.length > 0) {
    const BLOCK_DAYS = 2; // change to 3 if needed globally
    const supState = {};
    const lastRoleFromPrev = (supId) => {
      if (!prevSchedule || !prevSchedule[supId]) return '';
      for (let d = prevMonthDays; d >= Math.max(1, prevMonthDays - 6); d--) {
        const cell = prevSchedule[supId][d];
        if (cell && cell.type === 'work' && (cell.value === 'GT' || cell.value === 'P')) {
          return cell.value;
        }
      }
      return '';
    };
    supervisors.forEach(s => {
      supState[s.id] = { lastRole: lastRoleFromPrev(s.id), daysInRole: 0 };
    });

    for (let day = 1; day <= days; day++) {
      const workingToday = supervisors.filter(sup => {
        const c = schedule[sup.id]?.[day];
        return c && c.type === 'work';
      });
      const singleSupId = workingToday.length === 1 ? workingToday[0].id : null;
      supervisors.forEach(sup => {
        const cell = schedule[sup.id]?.[day];
        if (!cell) return;
        if (cell.type !== 'work') {
          supState[sup.id].daysInRole = 0; // start new block after rest
          return;
        }
        if (singleSupId && sup.id === singleSupId) {
          cell.value = 'GT';
          const st0 = supState[sup.id];
          st0.lastRole = 'GT';
          st0.daysInRole = (st0.daysInRole || 0) + 1;
          if (st0.daysInRole >= BLOCK_DAYS) st0.daysInRole = 0;
          return;
        }
        const st = supState[sup.id];
        if (st.daysInRole === 0) {
          const nextRole = st.lastRole === 'GT' ? 'P' : st.lastRole === 'P' ? 'GT' : 'GT';
          cell.value = nextRole;
          st.lastRole = nextRole;
          st.daysInRole = 1;
        } else {
          cell.value = st.lastRole;
          st.daysInRole++;
          if (st.daysInRole >= BLOCK_DAYS) {
            st.daysInRole = 0; // next work day will toggle
          }
        }
      });
    }
    console.log(`✅ Assigned GT/P rotation for supervisors with ${BLOCK_DAYS}-day blocks`);
  }

  // Step 3: Preserve manual exceptions from previous schedule
  let exceptionsKept = 0;
  Object.keys(schedule).forEach((driverId) => {
    for (let day = 1; day <= days; day++) {
      const cell = schedule[driverId][day];
      // Keep exceptions: sick leave, manual assignments
      if (cell.type === 'sick') {
        exceptionsKept++;
      }
    }
  });

  console.log(`✅ Preserved ${exceptionsKept} exception days`);

  // Step 4: Assign routes to available drivers
  console.log('🛣️ Step 4: Assigning routes...');
  const missing = {};
  
  // Separate main and secondary routes
  const mainRoutes = routeCodes.filter(r => !r.includes('.'));
  const secondaryRoutes = routeCodes.filter(r => r.includes('.'));
  
  // Build map of secondary routes to their main routes
  // Example: { R1: ['R1.1'], R2: ['R2.2'], R7: ['R7.1'] }
  const secondaryToMain = buildSecondaryRouteMap(routeCodes);
  
  // Create a queue of routes: main routes first, then secondary
  const routeQueue = [...mainRoutes, ...secondaryRoutes];

  // Build quick lookup by main code for route objects
  const routeByCode = {};
  routes.forEach(r => {
    const key = (r.shortCode || '').split('.')[0];
    if (key) routeByCode[key] = r;
  });

  // Helper: check if a driver is part of any configured route (primary/secondary/alternating/assigned)
  const isDriverConfigured = (driverId) => {
    return routes.some(route =>
      (route.primaryDriver && String(route.primaryDriver) === String(driverId)) ||
      (route.secondaryDriver && String(route.secondaryDriver) === String(driverId)) ||
      (route.alternatingDriver && String(route.alternatingDriver) === String(driverId)) ||
      (Array.isArray(route.assignedDrivers) && route.assignedDrivers.some(id => String(id) === String(driverId)))
    );
  };

  for (let day = 1; day <= days; day++) {
    // Get available drivers by category
    const available = {
      lanzarote: getAvailableDrivers(drivers, schedule, day, 'driver', 'lanzarote'),
      local_morning: getAvailableDrivers(drivers, schedule, day, 'driver', 'local_morning'),
      local_night: getAvailableDrivers(drivers, schedule, day, 'driver', 'local_night'),
      // jocker intentionally not used in general assignment; only for vacation coverage
      other: drivers.filter((d) => {
        const cell = schedule[d.id]?.[day];
        return d.type === 'driver' && !d.category && cell && cell.type === 'work';
      }),
    };

    // Create pool of routes for this day (prioritize main routes, then secondary)
    const routesPool = [...routeQueue];
    let assigned = 0;
    const dow = new Date(currentYear, currentMonth, day).getDay();
    const routesToday = mainRoutes.filter(rc => !(rc === 'R9' && dow === 0));

    // Pre-assign default-mode routes to their primary drivers (e.g., R9 → Jose Cerrato) when working
    routesToday.forEach((main) => {
      const rObj = routeByCode[main];
      const mode = rObj?.assignmentMode || '';
      const primary = rObj?.primaryDriver;
      if (mode !== '' || !primary) return;
      if (main === 'R9' && dow === 0) { console.log(`[R9 DEBUG] Skip Sunday: day=${day}`); return; }
      const cell = schedule[primary]?.[day];
      if (!cell || cell.type !== 'work' || cell.value) return;
      if (main === 'R9') { const drv = drivers.find(d => String(d.id) === String(primary)); console.log(`[R9 DEBUG] Assign: day=${day} driver=${drv ? drv.name : primary}`); }
      cell.value = main;
      if (secondaryToMain[main] && secondaryToMain[main].length > 0) {
        const secondaryRoute = secondaryToMain[main][0];
        cell.value = `${main}+${secondaryRoute}`;
      }
      assigned++;
      const idx = routesPool.indexOf(main);
      if (idx > -1) routesPool.splice(idx, 1);
    });

    // Pre-assign vacation coverage with Jocker when available
    const jockersToday = drivers.filter((d) => {
      const c = schedule[d.id]?.[day];
      return d.type === 'driver' && d.category === 'jocker' && c && c.type === 'work' && (!c.value || c.value === '');
    });
    routesToday.forEach((main) => {
      const rObj = routeByCode[main];
      if (!rObj) return;
      const assignedDrivers = Array.isArray(rObj.assignedDrivers) ? rObj.assignedDrivers.slice() : [];
      if (rObj.primaryDriver) assignedDrivers.unshift(rObj.primaryDriver);
      if (rObj.secondaryDriver) assignedDrivers.push(rObj.secondaryDriver);
      const vacDriverId = assignedDrivers.find((did) => {
        const c = schedule[did]?.[day];
        return c && c.type === 'vacation';
      });
      if (!vacDriverId) return;
      const j = jockersToday[0];
      if (!j) return;
      const jCell = schedule[j.id]?.[day];
      if (!jCell || jCell.type !== 'work' || jCell.value) return;
      let sec = secondaryToMain[main] && secondaryToMain[main][0];
      const vacDrv = drivers.find(d => String(d.id) === String(vacDriverId));
      const prefs = Array.isArray(vacDrv?.availableRoutes) ? vacDrv.availableRoutes : [];
      const preferred = prefs.find(rc => rc.includes('.') && rc.split('.')[0] === main);
      if (preferred && secondaryToMain[main] && secondaryToMain[main].includes(preferred)) {
        sec = preferred;
      }
      jCell.value = sec ? `${main}+${sec}` : main;
      jCell.coverOf = vacDriverId;
      const idx2 = routesPool.indexOf(main);
      if (idx2 > -1) routesPool.splice(idx2, 1);
    });

    const jose = drivers.find(d => (d.name || '').toUpperCase().includes('JOSE') && (d.name || '').toUpperCase().includes('CERRATO'));
    if (jose) {
      const jcCell = schedule[jose.id]?.[day];
      if (jcCell && jcCell.type === 'work' && (!jcCell.value || jcCell.value === '')) {
        if (dow !== 0) {
          jcCell.value = 'R9';
          if (secondaryToMain['R9'] && secondaryToMain['R9'].length > 0) {
            const s = secondaryToMain['R9'][0];
            jcCell.value = `R9+${s}`;
          }
          const i2 = routesPool.indexOf('R9');
          if (i2 > -1) routesPool.splice(i2, 1);
        }
      }
    }

    // Assign routes by category priority
    // General assignment excludes jocker; jocker is used only in explicit vacation coverage above
    ['lanzarote', 'local_morning', 'local_night', 'other'].forEach((category) => {
      available[category].forEach((driver) => {
        // Skip drivers not present in routes configuration (no designated route)
        if (!isDriverConfigured(driver.id)) return;
        // Skip drivers who already have a route assigned (from alternating_2x2 or loader_like patterns)
        const currentValue = schedule[driver.id][day].value;
        if (currentValue && currentValue !== '') {
          return; // This driver already has a route, skip them
        }
        
        if (routesPool.length > 0) {
          const mainRoute = routesPool.shift();
          
          // Assign main route
          schedule[driver.id][day].value = mainRoute;
          assigned++;
          
          // Check if this main route has a secondary route
          // If yes, assign it to the SAME driver on the SAME day
          if (secondaryToMain[mainRoute] && secondaryToMain[mainRoute].length > 0) {
            const secondaryRoute = secondaryToMain[mainRoute][0];
            
            // Create a combined value for both routes
            // Format: "R2+R2.2" to show they go together
            schedule[driver.id][day].value = `${mainRoute}+${secondaryRoute}`;
            
            // Remove the secondary route from the pool (already assigned)
            const secondaryIndex = routesPool.indexOf(secondaryRoute);
            if (secondaryIndex > -1) {
              routesPool.splice(secondaryIndex, 1);
            }
          }
        }
      });
    });

    // Track missing routes
    if (routesPool.length > 0) {
      missing[day] = routesPool;
    }
  }

  // Step 5: Calculate statistics
  const stats = {
    totalDrivers: drivers.filter((d) => d.type === 'driver').length,
    totalLoaders: drivers.filter((d) => d.type === 'loader').length,
    totalRoutes: routeCodes.length,
    mainRoutes: mainRoutes.length,
    secondaryRoutes: secondaryRoutes.length,
    daysInMonth: days,
    totalWorkDays: 0,
    totalRestDays: 0,
    totalVacationDays: 0,
    missingRouteDays: Object.keys(missing).length,
    totalMissingRoutes: Object.values(missing).reduce((sum, routes) => sum + routes.length, 0),
  };

  // Count day types
  Object.keys(schedule).forEach((driverId) => {
    for (let day = 1; day <= days; day++) {
      const cell = schedule[driverId][day];
      if (cell.type === 'work') stats.totalWorkDays++;
      else if (cell.type === 'weekend') stats.totalRestDays++;
      else if (cell.type === 'vacation') stats.totalVacationDays++;
    }
  });

  console.log('✅ Statistics calculated');

  return {
    schedule,
    missing,
    stats,
  };
};

/**
 * Generate a human-readable report of the schedule generation
 * @param {object} result - Result from generateSchedule
 * @param {object} params - Original parameters
 * @returns {string} Report message
 */
export const generateReport = (result, params) => {
  const { schedule, missing, stats } = result;
  const { currentMonth, currentYear, drivers, approvedVacations } = params;

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  let report = `✅ CALENDARIO GENERADO EXITOSAMENTE / Calendario Generado!\n\n`;
  report += `📅 ${monthNames[currentMonth]} ${currentYear}\n`;
  report += `═══════════════════════════════════════\n\n`;

  // Overview
  report += `📊 RESUMEN / Overview:\n`;
  report += `👥 Conductores: ${stats.totalDrivers}\n`;
  report += `🏗️ Cargadores: ${stats.totalLoaders}\n`;
  report += `🛣️ Rutas: ${stats.totalRoutes}\n`;
  report += `  ├─ Rutas principales: ${stats.mainRoutes}\n`;
  report += `  └─ Rutas secundarias: ${stats.secondaryRoutes} (R#.#)\n`;
  report += `📆 Días del mes: ${stats.daysInMonth}\n\n`;

  // Route pairing system
  report += `🔗 SISTEMA DE EMPAREJAMIENTO / Route Pairing:\n`;
  report += `✓ R1 + R1.1 → Mismo conductor, MISMO DÍA\n`;
  report += `✓ R2 + R2.2 → Mismo conductor, MISMO DÍA\n`;
  report += `✓ R3 + R3.1 → Mismo conductor, MISMO DÍA\n`;
  report += `✓ R7 + R7.1 → Mismo conductor, MISMO DÍA\n`;
  report += `En el calendario: R2+R2.2 indica que se realizan juntas\n\n`;

  // Work pattern
  report += `📈 PATRÓN DE TRABAJO / Work Pattern:\n`;
  report += `✓ Días laborales: ${stats.totalWorkDays}\n`;
  report += `✓ Días de descanso: ${stats.totalRestDays}\n`;
  report += `✓ Días de vacación: ${stats.totalVacationDays}\n\n`;

  // Vacation requests applied
  const vacationsInMonth = approvedVacations.filter((v) => {
    const start = new Date(v.startDate);
    const end = new Date(v.endDate);
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    return start <= monthEnd && end >= monthStart;
  });

  if (vacationsInMonth.length > 0) {
    report += `🏖️ VACACIONES APLICADAS / Vacations Applied:\n`;
    report += `✓ ${vacationsInMonth.length} solicitudes de vacación respetadas\n`;
    report += `✓ ${stats.totalVacationDays} días de vacación asignados\n\n`;
  }

  // Coverage status
  if (stats.missingRouteDays === 0) {
    report += `✅ COBERTURA COMPLETA / Full Coverage:\n`;
    report += `✓ Todas las rutas asignadas\n`;
    report += `✓ Sin conflictos de disponibilidad\n\n`;
  } else {
    report += `⚠️ RUTAS SIN CONDUCTOR / Routes Without Driver:\n`;
    report += `❌ ${stats.missingRouteDays} días con rutas sin asignar\n`;
    report += `❌ ${stats.totalMissingRoutes} rutas necesitan conductores\n\n`;

    // Show problematic days
    report += `🔍 DETALLES / Details:\n`;
    const missingDays = Object.keys(missing).slice(0, 5);
    missingDays.forEach((day) => {
      const routes = missing[day];
      report += `• Día ${day}: ${routes.join(', ')}\n`;
    });

    if (Object.keys(missing).length > 5) {
      report += `... y ${Object.keys(missing).length - 5} días más\n`;
    }

    report += `\n💡 SOLUCIÓN / Solution:\n`;
    report += `• Aumentar conductores disponibles\n`;
    report += `• Reducir cantidad de rutas\n`;
    report += `• Ajustar periodos de vacación\n`;
  }

  report += `\n═══════════════════════════════════════\n`;
  report += `✔️ Proceso completado satisfactoriamente`;

  return report;
};
