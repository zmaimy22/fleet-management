/**
 * Route Pairing System
 * 
 * الفكرة الأساسية:
 * R1 و R1.1 يعملان معاً كرحلة واحدة
 * - نفس الموصل
 * - نفس اليوم
 * - نفس الوقت
 * 
 * الهدف: منع تعيين R1 لموصل و R1.1 لموصل آخر
 */

/**
 * Validate that secondary routes are only paired with their main routes
 * @param {object} schedule - Generated schedule
 * @param {array} routeCodes - All route codes
 * @returns {object} Validation result
 */
export function validateRoutePairing(schedule, routeCodes) {
  const issues = [];
  const secondaryToMain = {};
  
  // Build map of secondary routes
  routeCodes.forEach((route) => {
    if (route.includes('.')) {
      const mainPart = route.split('.')[0];
      if (!secondaryToMain[mainPart]) {
        secondaryToMain[mainPart] = [];
      }
      secondaryToMain[mainPart].push(route);
    }
  });

  // Check each day for pairing violations
  Object.keys(schedule).forEach((driverId) => {
    const driverSchedule = schedule[driverId];
    
    Object.keys(driverSchedule).forEach((day) => {
      const cell = driverSchedule[day];
      const value = cell.value || '';
      
      // Check if this driver has a secondary route without its main route
      routeCodes.forEach((route) => {
        if (route.includes('.')) {
          const mainPart = route.split('.')[0];
          const hasSecondary = value.includes(route);
          const hasMain = value.includes(mainPart);
          
          // Secondary route must always have its main route
          if (hasSecondary && !hasMain && !value.includes('+')) {
            issues.push({
              day,
              driverId,
              issue: `${route} asignada sin ${mainPart}`,
              severity: 'error'
            });
          }
        }
      });
    });
  });

  return {
    valid: issues.length === 0,
    issues,
    totalIssues: issues.length
  };
}

/**
 * Generate pairing documentation
 * @param {array} routeCodes - All route codes
 * @returns {string} Documentation
 */
export function generatePairingDocumentation(routeCodes) {
  const secondaryToMain = {};
  
  // Build map
  routeCodes.forEach((route) => {
    if (route.includes('.')) {
      const mainPart = route.split('.')[0];
      if (!secondaryToMain[mainPart]) {
        secondaryToMain[mainPart] = [];
      }
      secondaryToMain[mainPart].push(route);
    }
  });

  let doc = `📋 SISTEMA DE EMPAREJAMIENTO DE RUTAS\n`;
  doc += `═════════════════════════════════════════\n\n`;
  
  doc += `🔗 PAREJAS DE RUTAS / Route Pairs:\n`;
  doc += `────────────────────────────────────────\n\n`;
  
  if (Object.keys(secondaryToMain).length === 0) {
    doc += `❌ No hay rutas secundarias\n`;
    return doc;
  }
  
  Object.entries(secondaryToMain).forEach(([main, secondaries], index) => {
    doc += `${index + 1}. Ruta ${main} (Principal)\n`;
    secondaries.forEach((secondary) => {
      doc += `   └─ ${secondary} (Secundaria - Siempre con ${main})\n`;
    });
    doc += `\n`;
  });

  doc += `\n⚙️ REGLA FUNDAMENTAL:\n`;
  doc += `────────────────────────────────────────\n`;
  doc += `Si un conductor maneja R2 en un día:\n`;
  doc += `   ✅ R2.2 también debe ser en el MISMO conductor\n`;
  doc += `   ✅ R2.2 también debe ser en el MISMO día\n`;
  doc += `   ❌ R2.2 NO puede estar con otro conductor\n`;
  doc += `   ❌ R2.2 NO puede estar en día diferente\n\n`;

  doc += `📊 FORMATO EN CALENDARIO:\n`;
  doc += `────────────────────────────────────────\n`;
  doc += `- Ruta individual: "R1"\n`;
  doc += `- Pareja de rutas: "R2+R2.2" (juntas en la misma celda)\n`;
  doc += `- Separadas: "R1" y "R1.1" en celdas diferentes (ERROR)\n\n`;

  doc += `🎯 VENTAJAS DEL SISTEMA:\n`;
  doc += `────────────────────────────────────────\n`;
  doc += `✓ Mantiene la coherencia lógica de las rutas\n`;
  doc += `✓ Ruta secundaria NO es abandonada\n`;
  doc += `✓ Conductor conoce ambas rutas juntas\n`;
  doc += `✓ Horarios optimizados (mismo día = menos cambios)\n`;

  return doc;
}

/**
 * Get route pairing status
 * @param {array} routeCodes - All route codes  
 * @returns {object} Pairing status
 */
export function getRoutePairingStatus(routeCodes) {
  const mainRoutes = routeCodes.filter(r => !r.includes('.'));
  const secondaryRoutes = routeCodes.filter(r => r.includes('.'));
  
  const paired = {};
  const unpaired = [];
  
  // Find pairings
  secondaryRoutes.forEach((sr) => {
    const mainPart = sr.split('.')[0];
    if (mainRoutes.includes(mainPart)) {
      if (!paired[mainPart]) {
        paired[mainPart] = [];
      }
      paired[mainPart].push(sr);
    } else {
      unpaired.push(sr);
    }
  });

  return {
    totalMainRoutes: mainRoutes.length,
    totalSecondaryRoutes: secondaryRoutes.length,
    pairedMainRoutes: Object.keys(paired).length,
    unpairedSecondaryRoutes: unpaired.length,
    pairs: paired,
    unpaired
  };
}
