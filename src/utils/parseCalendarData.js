/**
 * Parse Calendar Data from Excel/CSV format
 * 
 * يقرأ بيانات الجدول من صيغة Excel/CSV
 * ويستخرج السائقين والروتات والبيانات الأخرى
 */

/**
 * Parse a row of calendar data
 * @param {string} name - Driver name
 * @param {array} dayValues - Array of values for each day (1-30)
 * @returns {object} Parsed driver data
 */
export function parseDriverRow(name, dayValues) {
  const driverData = {
    name: name.trim(),
    type: identifyDriverType(name),
    category: identifyCategory(name),
    scheduleByDay: {},
    routes: [],
    vacations: [],
    specialCases: []
  };

  // Parse each day
  dayValues.forEach((value, index) => {
    const day = index + 1;
    const cell = value ? value.trim() : '';
    
    if (!cell) {
      driverData.scheduleByDay[day] = { type: 'empty', value: '' };
      return;
    }

    // Identify what type of entry this is
    const parsed = parseCell(cell);
    driverData.scheduleByDay[day] = parsed;

    // Collect data
    if (parsed.type === 'route') {
      driverData.routes.push({
        day,
        route: parsed.value,
        value: parsed.value
      });
    } else if (parsed.type === 'vacation') {
      driverData.vacations.push({
        day,
        type: parsed.value
      });
    } else if (parsed.type === 'special') {
      driverData.specialCases.push({
        day,
        type: parsed.value
      });
    }
  });

  return driverData;
}

/**
 * Identify driver type based on name or position
 * @param {string} name - Driver name
 * @returns {string} Driver type
 */
function identifyDriverType(name) {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('cargador') || lowerName.includes('jefe')) {
    return 'loader';
  }
  if (lowerName.includes('engargado')) {
    return 'supervisor';
  }
  
  return 'driver';
}

/**
 * Identify driver category based on name patterns
 * @param {string} name - Driver name
 * @returns {string} Category
 */
function identifyCategory(name) {
  // This would need to be matched against the actual driver database
  // For now, return a generic category
  return 'general';
}

/**
 * Parse a single cell value
 * @param {string} cell - Cell value from calendar
 * @returns {object} Parsed data
 */
function parseCell(cell) {
  const value = cell.trim().toUpperCase();

  // Check for vacation/rest
  if (value === 'V' || value === 'VACACION') {
    return { type: 'vacation', value: 'V', description: 'Vacation' };
  }
  
  if (value === 'HS' || value === 'HUELGA') {
    return { type: 'vacation', value: 'HS', description: 'Strike/No work' };
  }
  
  if (value === 'BAJA' || value === 'INCAPACIDAD') {
    return { type: 'vacation', value: 'BAJA', description: 'Sick leave' };
  }
  
  if (value === 'P' || value === 'PERMISO') {
    return { type: 'vacation', value: 'P', description: 'Permission/Leave' };
  }

  // Check for loader/cargo operations
  if (value === 'CM') {
    return { type: 'special', value: 'CM', description: 'Loading operation' };
  }
  
  if (value === 'CT') {
    return { type: 'special', value: 'CT', description: 'Another operation type' };
  }
  
  if (value === 'GT') {
    return { type: 'special', value: 'GT', description: 'Another operation type' };
  }

  // Check for route assignments
  const routeMatch = value.match(/^R\d+(\.\d+)?$/);
  if (routeMatch) {
    return { type: 'route', value: value, description: `Route ${value}` };
  }

  // Check for combined (route + operation)
  const combinedMatch = value.match(/^(R\d+(?:\.\d+)?)\/?(CM|CT|GT)$/);
  if (combinedMatch) {
    return { 
      type: 'combined', 
      route: combinedMatch[1],
      operation: combinedMatch[2],
      value: value,
      description: `Route ${combinedMatch[1]} with ${combinedMatch[2]}`
    };
  }

  // Unknown
  return { type: 'unknown', value: value, description: 'Unknown entry' };
}

/**
 * Extract all routes from calendar data
 * @param {array} drivers - Array of parsed driver data
 * @returns {array} Unique routes
 */
export function extractAllRoutes(drivers) {
  const routes = new Set();
  
  drivers.forEach(driver => {
    driver.routes.forEach(routeData => {
      routes.add(routeData.route);
    });
  });

  return Array.from(routes).sort();
}

/**
 * Build driver-route mapping
 * @param {array} drivers - Array of parsed driver data
 * @returns {object} Mapping
 */
export function buildDriverRouteMapping(drivers) {
  const mapping = {};
  
  drivers.forEach(driver => {
    if (driver.type !== 'driver') return;
    
    const routes = driver.routes.map(r => r.route);
    if (routes.length > 0) {
      mapping[driver.name] = routes;
    }
  });

  return mapping;
}

/**
 * Group routes that should go together (main + secondary)
 * @param {array} routes - All routes
 * @returns {array} Grouped routes
 */
export function groupRelatedRoutes(routes) {
  const groups = [];
  const processed = new Set();

  routes.sort().forEach(route => {
    if (processed.has(route)) return;

    // Check if this is a main route with secondary
    if (!route.includes('.')) {
      const secondary = routes.filter(r => r.startsWith(route + '.'));
      
      if (secondary.length > 0) {
        groups.push({
          type: 'pair',
          main: route,
          secondary: secondary,
          all: [route, ...secondary]
        });
        
        processed.add(route);
        secondary.forEach(s => processed.add(s));
      } else {
        groups.push({
          type: 'single',
          main: route,
          all: [route]
        });
        processed.add(route);
      }
    }
  });

  return groups;
}

/**
 * Generate groups from parsed calendar data
 * @param {array} drivers - Parsed driver data
 * @param {array} routeGroups - Grouped routes
 * @returns {array} Generated groups
 */
export function generateGroupsFromParsedData(drivers, routeGroups) {
  const groups = [];

  routeGroups.forEach((routeGroup, index) => {
    // Find drivers assigned to these routes
    const assignedDrivers = new Set();
    
    drivers.forEach(driver => {
      if (driver.type !== 'driver') return;
      
      driver.routes.forEach(routeData => {
        if (routeGroup.all.includes(routeData.route)) {
          assignedDrivers.add(driver.name);
        }
      });
    });

    if (assignedDrivers.size === 0) return; // Skip if no drivers

    // Create group
    const groupName = routeGroup.type === 'pair'
      ? `Ruta ${routeGroup.main} (Principal + Secundaria)`
      : `Ruta ${routeGroup.main}`;

    groups.push({
      id: Date.now() + index,
      name: groupName,
      routes: routeGroup.all,
      drivers: Array.from(assignedDrivers),
      patternType: 'pattern1',
      driverAssignments: {},
      source: 'calendar_auto_generated',
      generatedAt: new Date().toISOString()
    });
  });

  return groups;
}

/**
 * Main function: Parse calendar and generate groups
 * @param {array} calendarRows - Raw calendar rows
 * @param {array} driverNames - Driver names in order
 * @returns {object} Result with drivers and groups
 */
export function parseCalendarAndGenerateGroups(calendarRows, driverNames) {
  // Parse each driver row
  const parsedDrivers = driverNames.map((name, index) => {
    const dayValues = calendarRows[index] || [];
    return parseDriverRow(name, dayValues);
  });

  // Extract all routes
  const allRoutes = extractAllRoutes(parsedDrivers);

  // Group related routes
  const routeGroups = groupRelatedRoutes(allRoutes);

  // Generate groups
  const generatedGroups = generateGroupsFromParsedData(parsedDrivers, routeGroups);

  return {
    drivers: parsedDrivers,
    routes: allRoutes,
    routeGroups,
    groups: generatedGroups,
    summary: {
      totalDrivers: parsedDrivers.length,
      totalRoutes: allRoutes.length,
      totalGroups: generatedGroups.length,
      pairedRoutes: routeGroups.filter(g => g.type === 'pair').length,
      singleRoutes: routeGroups.filter(g => g.type === 'single').length
    }
  };
}

/**
 * Validate parsed data
 * @param {object} result - Result from parseCalendarAndGenerateGroups
 * @returns {object} Validation result
 */
export function validateParsedData(result) {
  const issues = [];

  // Check if drivers have routes
  result.drivers.forEach(driver => {
    if (driver.type === 'driver' && driver.routes.length === 0) {
      issues.push({
        severity: 'warning',
        message: `Driver "${driver.name}" has no routes assigned`
      });
    }
  });

  // Check if groups have drivers
  result.groups.forEach(group => {
    if (group.drivers.length < 2) {
      issues.push({
        severity: 'warning',
        message: `Group "${group.name}" has fewer than 2 drivers`
      });
    }
  });

  // Check for orphaned secondary routes
  result.groups.forEach(group => {
    if (group.routes.some(r => r.includes('.'))) {
      const main = group.routes.find(r => !r.includes('.'));
      if (!main) {
        issues.push({
          severity: 'error',
          message: `Group "${group.name}" has secondary routes without main route`
        });
      }
    }
  });

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    summary: `${issues.length} issues found`
  };
}
