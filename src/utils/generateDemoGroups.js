/**
 * Demo Groups Generator
 * Creates sample route groups to demonstrate the grouping mechanism
 * with main routes prioritized over secondary routes
 * 
 * IMPORTANTE: Las rutas secundarias (R1.1, R2.2, etc.) SIEMPRE van con su ruta principal
 * R1.1 solo existe si R1 existe en el grupo
 * R2.2 solo existe si R2 existe en el grupo
 */

export function generateDemoGroups(drivers, routes) {
  // Separate main and secondary routes
  const mainRoutes = routes.filter(r => !r.includes('.'));
  const secondaryRoutes = routes.filter(r => r.includes('.'));

  // Build a map of secondary routes to their main route
  const secondaryToMain = {};
  secondaryRoutes.forEach(sr => {
    const mainPart = sr.split('.')[0]; // e.g., "R1.1" -> "R1"
    if (!secondaryToMain[mainPart]) {
      secondaryToMain[mainPart] = [];
    }
    secondaryToMain[mainPart].push(sr);
  });

  // Get drivers by category
  const lanzaroteDrivers = drivers
    .filter(d => d.type === 'driver' && d.category === 'lanzarote')
    .slice(0, 9); // Get first 9 Lanzarote drivers

  const localMorningDrivers = drivers
    .filter(d => d.type === 'driver' && d.category === 'local_morning')
    .slice(0, 9);

  const localNightDrivers = drivers
    .filter(d => d.type === 'driver' && d.category === 'local_night')
    .slice(0, 9);

  const demoGroups = [];

  // GROUP 1: R1 + R1.1 (Main + Secondary paired)
  demoGroups.push({
    id: Date.now() + 1,
    name: '🌊 Ruta 1 (Principal + Secundaria)',
    description: 'R1 con su ruta secundaria R1.1 - siempre juntas',
    routes: ['R1', 'R1.1'], // R1.1 SOLO porque R1 existe
    drivers: [
      lanzaroteDrivers[0]?.id,
      lanzaroteDrivers[1]?.id,
      lanzaroteDrivers[2]?.id
    ].filter(Boolean),
    patternType: 'pattern1',
    driverAssignments: {}
  });

  // GROUP 2: R2 + R2.2 (Main + Secondary paired)
  demoGroups.push({
    id: Date.now() + 2,
    name: '🌊 Ruta 2 (Principal + Secundaria)',
    description: 'R2 con su ruta secundaria R2.2 - siempre juntas',
    routes: ['R2', 'R2.2'], // R2.2 SOLO porque R2 existe
    drivers: [
      lanzaroteDrivers[3]?.id,
      lanzaroteDrivers[4]?.id,
      lanzaroteDrivers[5]?.id
    ].filter(Boolean),
    patternType: 'pattern1',
    driverAssignments: {}
  });

  // GROUP 3: R3 + R3.1 (Main + Secondary paired)
  demoGroups.push({
    id: Date.now() + 3,
    name: '� Ruta 3 (Principal + Secundaria)',
    description: 'R3 con su ruta secundaria R3.1 - siempre juntas',
    routes: ['R3', 'R3.1'], // R3.1 SOLO porque R3 existe
    drivers: [
      lanzaroteDrivers[6]?.id,
      lanzaroteDrivers[7]?.id,
      lanzaroteDrivers[8]?.id
    ].filter(Boolean),
    patternType: 'pattern2',
    driverAssignments: {
      'R3': lanzaroteDrivers[6]?.id,
      'R3.1': lanzaroteDrivers[7]?.id
    }
  });

  // GROUP 4: R7 + R7.1 (Main + Secondary paired)
  demoGroups.push({
    id: Date.now() + 4,
    name: '🌙 Ruta 7 (Principal + Secundaria)',
    description: 'R7 con su ruta secundaria R7.1 - siempre juntas',
    routes: ['R7', 'R7.1'], // R7.1 SOLO porque R7 existe
    drivers: [
      localNightDrivers[0]?.id,
      localNightDrivers[1]?.id,
      localNightDrivers[2]?.id
    ].filter(Boolean),
    patternType: 'pattern2',
    driverAssignments: {
      'R7': localNightDrivers[0]?.id,
      'R7.1': localNightDrivers[1]?.id
    }
  });

  // GROUP 5: Multiple main routes (SIN rutas secundarias sueltas)
  demoGroups.push({
    id: Date.now() + 5,
    name: '🚚 Rutas 4 y 5 (Solo Principales)',
    description: 'Grupo con múltiples rutas principales - sin rutas secundarias sueltas',
    routes: ['R4', 'R5'], // SIN R4.1 ni R5.1 porque no queremos secundarias sueltas
    drivers: [
      localMorningDrivers[0]?.id,
      localMorningDrivers[1]?.id,
      localMorningDrivers[2]?.id
    ].filter(Boolean),
    patternType: 'pattern1',
    driverAssignments: {}
  });

  return demoGroups;
}

/**
 * Generate a detailed report about how the demo groups work
 */
export function generateGroupsReport(groups, drivers, routes) {
  let report = '📊 REPORTE DE GRUPOS DEMOSTRATIVOS\n';
  report += '=====================================\n\n';

  // Overview
  report += `✅ Total de grupos creados: ${groups.length}\n\n`;

  // Separate main and secondary routes for reference
  const mainRoutes = routes.filter(r => !r.includes('.'));
  const secondaryRoutes = routes.filter(r => r.includes('.'));

  report += `🛣️  RUTAS DISPONIBLES:\n`;
  report += `   • Principales (sin punto decimal): ${mainRoutes.join(', ')}\n`;
  report += `   • Secundarias (con punto decimal): ${secondaryRoutes.join(', ')}\n\n`;

  // Details per group
  groups.forEach((group, index) => {
    report += `\n${'═'.repeat(50)}\n`;
    report += `GRUPO ${index + 1}: ${group.name}\n`;
    report += `${'═'.repeat(50)}\n`;

    // Routes breakdown with relationship explanation
    const groupMainRoutes = group.routes.filter(r => !r.includes('.'));
    const groupSecondaryRoutes = group.routes.filter(r => r.includes('.'));

    report += `📍 Rutas: ${group.routes.join(', ')}\n`;
    if (groupMainRoutes.length > 0) {
      report += `   └─ Principales: ${groupMainRoutes.join(', ')}\n`;
    }
    if (groupSecondaryRoutes.length > 0) {
      report += `   └─ Secundarias: ${groupSecondaryRoutes.join(', ')}\n`;
      report += `      ⚠️  SIEMPRE acompañan a su ruta principal:\n`;
      groupSecondaryRoutes.forEach(sr => {
        const mainPart = sr.split('.')[0];
        report += `      • ${sr} ← SOLO porque ${mainPart} existe en el grupo\n`;
      });
    }

    // Drivers
    report += `\n👥 Conductores:\n`;
    group.drivers.forEach((driverId, idx) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver) {
        report += `   ${idx + 1}. ${driver.name} (${driver.category})\n`;
      }
    });

    // Pattern type
    report += `\n🔄 Patrón de Rotación:\n`;
    if (group.patternType === 'pattern1') {
      report += `   Patrón 1: Rotación Simple\n`;
      report += `   • 2 conductores trabajan siempre\n`;
      report += `   • 1 conductor descansa (2 días)\n`;
      report += `   • Rotación automática cada 2 días\n`;
    } else {
      report += `   Patrón 2: Conductor Fijo\n`;
      report += `   • Cada ruta tiene conductor principal\n`;
      Object.entries(group.driverAssignments).forEach(([route, driverId]) => {
        const driver = drivers.find(d => d.id === driverId);
        if (driver) {
          report += `     - Ruta ${route}: ${driver.name} (principal)\n`;
        }
      });
      const backupDriver = group.drivers.find(
        id => !Object.values(group.driverAssignments).includes(id)
      );
      if (backupDriver) {
        const backup = drivers.find(d => d.id === backupDriver);
        if (backup) {
          report += `     - Backup automático: ${backup.name}\n`;
        }
      }
    }

    report += `\n💡 Descripción:\n`;
    report += `   ${group.description}\n`;
  });

  // Algorithm explanation
  report += `\n\n${'═'.repeat(50)}\n`;
  report += `⚙️  MECANISMO DE ASIGNACIÓN DE RUTAS\n`;
  report += `${'═'.repeat(50)}\n\n`;
  report += `🎯 REGLA FUNDAMENTAL:\n`;
  report += `La ruta secundaria SIEMPRE acompaña a su ruta principal\n`;
  report += `Ejemplo:\n`;
  report += `   ✅ R1.1 solo existe SI R1 existe en el grupo\n`;
  report += `   ✅ R2.2 solo existe SI R2 existe en el grupo\n`;
  report += `   ✅ R7.1 solo existe SI R7 existe en el grupo\n`;
  report += `   ❌ Nunca tenemos R1.1 sin R1\n`;
  report += `   ❌ Nunca tenemos R2.2 sin R2\n\n`;

  report += `📋 PASOS DEL ALGORITMO:\n`;
  report += `1️⃣  Para cada grupo, se crean las rutas en parejas:\n`;
  report += `   • Ruta Principal (R1, R2, R3, ...)\n`;
  report += `   • Su Ruta Secundaria opcional (R1.1, R2.2, ...)\n\n`;
  
  report += `2️⃣  En cada día del calendario:\n`;
  report += `   a) Aplicar patrón 4/2 (4 trabajan, 2 descansan)\n`;
  report += `   b) Respetar vacaciones aprobadas\n`;
  report += `   c) Asignar rutas en orden de disponibilidad\n\n`;

  report += `3️⃣  Distribución de rutas al conductor:\n`;
  report += `   Si asignamos R1 → Automáticamente asignamos R1.1 también\n`;
  report += `   El conductor maneja AMBAS rutas en el mismo día\n\n`;

  report += `4️⃣  Resultado esperado:\n`;
  report += `   ✅ Todas las rutas principales (R1, R2, R3, ...)\n`;
  report += `   ✅ Todas sus secundarias asociadas (R1.1, R2.2, R3.1, ...)\n`;
  report += `   ✅ Cobertura completa del calendario\n`;
  report += `   ✅ Siempre respetando parejas: principal + secundaria\n\n`;

  return report;
}

/**
 * Validate demo groups structure
 */
export function validateGroups(groups, drivers) {
  const errors = [];
  const warnings = [];

  groups.forEach((group, idx) => {
    // Check group name
    if (!group.name || group.name.trim() === '') {
      errors.push(`Grupo ${idx + 1}: Nombre vacío`);
    }

    // Check routes count
    if (!group.routes || group.routes.length < 2) {
      errors.push(`Grupo ${idx + 1}: Debe tener al menos 2 rutas`);
    }

    // Check drivers count
    if (!group.drivers || group.drivers.length !== 3) {
      errors.push(`Grupo ${idx + 1}: Debe tener exactamente 3 conductores`);
    }

    // Check pattern type
    if (!['pattern1', 'pattern2'].includes(group.patternType)) {
      errors.push(`Grupo ${idx + 1}: Tipo de patrón inválido`);
    }

    // Check pattern2 assignments
    if (group.patternType === 'pattern2') {
      const assignedCount = Object.keys(group.driverAssignments || {}).length;
      if (assignedCount !== group.routes.length) {
        warnings.push(
          `Grupo ${idx + 1}: Pattern2 requiere asignación de conductor a cada ruta`
        );
      }
    }

    // Check drivers exist
    group.drivers.forEach(driverId => {
      if (!drivers.find(d => d.id === driverId)) {
        errors.push(`Grupo ${idx + 1}: Conductor con ID ${driverId} no encontrado`);
      }
    });
  });

  return { valid: errors.length === 0, errors, warnings };
}
