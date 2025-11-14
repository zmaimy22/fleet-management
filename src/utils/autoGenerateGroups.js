/**
 * Auto-generate Route Groups from existing Calendar Schedule
 * 
 * توليد المجموعات تلقائياً من الجدول الموجود
 * مع تبديل أسماء الموصلين
 */

/**
 * Generate groups based on current schedule
 * @param {object} schedule - Current calendar schedule
 * @param {array} drivers - All drivers
 * @param {array} routeCodes - All route codes
 * @returns {array} Generated groups
 */
export function generateGroupsFromSchedule(schedule, drivers, routeCodes) {
  const groups = [];
  const processedRoutes = new Set();
  
  // Build a map of secondary routes to their main routes
  const secondaryToMain = {};
  const mainToSecondary = {};
  
  routeCodes.forEach((route) => {
    if (route.includes('.')) {
      const mainPart = route.split('.')[0];
      if (!secondaryToMain[route]) {
        secondaryToMain[route] = mainPart;
      }
      if (!mainToSecondary[mainPart]) {
        mainToSecondary[mainPart] = [];
      }
      mainToSecondary[mainPart].push(route);
    }
  });

  // Group 1: Collect all main routes and their secondary routes that appear together
  const routePairs = new Map(); // route -> Set of drivers that have it
  
  // Analyze schedule to find which routes are used together
  Object.keys(schedule).forEach((driverId) => {
    const driverSchedule = schedule[driverId];
    
    Object.keys(driverSchedule).forEach((day) => {
      const cell = driverSchedule[day];
      const value = cell.value || '';
      
      if (value) {
        // Extract routes from value (could be "R1" or "R1+R1.1")
        const routeMatches = value.match(/R\d+\.?\d*/g);
        if (routeMatches) {
          routeMatches.forEach((route) => {
            if (!routePairs.has(route)) {
              routePairs.set(route, new Set());
            }
            routePairs.get(route).add(parseInt(driverId));
          });
        }
      }
    });
  });

  // Generate groups for each route pair
  const mainRoutes = routeCodes.filter(r => !r.includes('.'));
  
  mainRoutes.forEach((mainRoute) => {
    if (processedRoutes.has(mainRoute)) return;
    
    const groupRoutes = [mainRoute];
    
    // Add secondary routes if they exist
    if (mainToSecondary[mainRoute]) {
      groupRoutes.push(...mainToSecondary[mainRoute]);
    }
    
    // Get drivers that work with this route
    const driverSet = routePairs.get(mainRoute) || new Set();
    const groupDrivers = Array.from(driverSet).slice(0, 3); // Take first 3 drivers
    
    // Only create group if we have at least 3 drivers
    if (groupDrivers.length >= 3) {
      const group = {
        id: Date.now() + Math.random(),
        name: `🛣️ Ruta ${mainRoute}${mainToSecondary[mainRoute] ? ' (con secundaria)' : ''}`,
        description: `Grupo auto-generado para ruta ${mainRoute}`,
        routes: groupRoutes,
        drivers: groupDrivers,
        patternType: 'pattern1',
        driverAssignments: {},
        generatedFrom: 'schedule',
        timestamp: new Date().toISOString()
      };
      
      groups.push(group);
      processedRoutes.add(mainRoute);
    }
  });

  return groups;
}

/**
 * Rotate driver names (shuffle them)
 * تبديل أسماء الموصلين
 * @param {array} drivers - All drivers
 * @returns {array} Drivers with rotated names
 */
export function rotateDriverNames(drivers) {
  // Create a copy
  const driversCopy = JSON.parse(JSON.stringify(drivers));
  
  // Get only driver names (not loaders)
  const driversList = driversCopy.filter(d => d.type === 'driver');
  const names = driversList.map(d => d.name);
  
  // Rotate names (shift them)
  const rotatedNames = [names[names.length - 1], ...names.slice(0, -1)];
  
  // Apply rotated names back
  driversList.forEach((driver, index) => {
    driver.name = rotatedNames[index];
  });
  
  return driversCopy;
}

/**
 * Shuffle driver names randomly
 * خلط أسماء الموصلين عشوائياً
 * @param {array} drivers - All drivers
 * @returns {array} Drivers with shuffled names
 */
export function shuffleDriverNames(drivers) {
  const driversCopy = JSON.parse(JSON.stringify(drivers));
  
  // Get only driver names
  const driversList = driversCopy.filter(d => d.type === 'driver');
  const names = driversList.map(d => d.name);
  
  // Fisher-Yates shuffle
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  
  // Apply shuffled names back
  driversList.forEach((driver, index) => {
    driver.name = names[index];
  });
  
  return driversCopy;
}

/**
 * Create a mapping of old names to new names for reference
 * @param {array} originalDrivers - Original drivers list
 * @param {array} shuffledDrivers - Shuffled drivers list
 * @returns {object} Mapping of old names to new names
 */
export function createNameMappingReport(originalDrivers, shuffledDrivers) {
  let report = `📋 MAPEO DE NOMBRES DE CONDUCTORES\n`;
  report += `Cambios de nombres - Registro de cambios\n`;
  report += `═════════════════════════════════════\n\n`;
  
  const originalMap = {};
  originalDrivers
    .filter(d => d.type === 'driver')
    .forEach(d => {
      originalMap[d.id] = d.name;
    });
  
  const shuffledMap = {};
  shuffledDrivers
    .filter(d => d.type === 'driver')
    .forEach(d => {
      shuffledMap[d.id] = d.name;
    });
  
  report += `CAMBIOS REALIZADOS:\n`;
  report += `──────────────────\n\n`;
  
  let changesCount = 0;
  Object.keys(originalMap).forEach(id => {
    const oldName = originalMap[id];
    const newName = shuffledMap[id];
    
    if (oldName !== newName) {
      report += `ID ${id}:\n`;
      report += `  • Anterior: ${oldName}\n`;
      report += `  • Actual:   ${newName}\n\n`;
      changesCount++;
    }
  });
  
  if (changesCount === 0) {
    report += `❌ No hay cambios de nombres\n`;
  } else {
    report += `✅ Total de cambios: ${changesCount}\n`;
  }
  
  return report;
}

/**
 * Generate summary report
 * @param {array} groups - Generated groups
 * @param {array} drivers - All drivers
 * @param {object} schedule - Schedule used
 * @returns {string} Summary report
 */
export function generateAutoGroupsReport(groups, drivers, schedule) {
  let report = `✅ GRUPOS GENERADOS AUTOMÁTICAMENTE\n`;
  report += `Generado desde el jádulo actual\n`;
  report += `═════════════════════════════════════\n\n`;
  
  report += `📊 RESUMEN:\n`;
  report += `• Grupos creados: ${groups.length}\n`;
  report += `• Conductores totales: ${drivers.filter(d => d.type === 'driver').length}\n`;
  report += `• Rutas totales: ${new Set(
    groups.flatMap(g => g.routes)
  ).size}\n\n`;
  
  report += `DETALLES DE CADA GRUPO:\n`;
  report += `─────────────────────\n\n`;
  
  groups.forEach((group, index) => {
    report += `${index + 1}. ${group.name}\n`;
    report += `   Rutas: ${group.routes.join(', ')}\n`;
    report += `   Conductores: ${group.drivers.length}\n`;
    report += `   Tipo: ${group.patternType === 'pattern1' ? 'Rotación Simple' : 'Conductor Fijo'}\n\n`;
  });
  
  report += `🔗 NOTAS IMPORTANTES:\n`;
  report += `• Los grupos fueron creados automáticamente\n`;
  report += `• Se basaron en las rutas usadas en el calendario\n`;
  report += `• Puedes editarlos en cualquier momento\n`;
  report += `• Cada grupo mantiene su estructura de 3 conductores\n`;
  
  return report;
}

/**
 * Validate generated groups
 * @param {array} groups - Groups to validate
 * @returns {object} Validation result
 */
export function validateGeneratedGroups(groups) {
  const errors = [];
  const warnings = [];
  
  if (groups.length === 0) {
    warnings.push('No se generaron grupos (puede que no haya rutas en el calendario)');
  }
  
  groups.forEach((group, index) => {
    if (group.routes.length < 2) {
      errors.push(`Grupo ${index + 1}: Debe tener al menos 2 rutas`);
    }
    
    if (group.drivers.length !== 3) {
      errors.push(`Grupo ${index + 1}: Debe tener exactamente 3 conductores`);
    }
    
    if (!group.routes || group.routes.length === 0) {
      errors.push(`Grupo ${index + 1}: No tiene rutas`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    groupsCount: groups.length
  };
}
