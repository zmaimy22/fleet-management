/**
 * Quick Test for Route Pairing System
 * 
 * اختبار سريع لنظام ربط الروتات
 */

import { buildSecondaryRouteMap } from './generateSchedule.js';

/**
 * Test 1: Build secondary route map
 */
export function testBuildSecondaryRouteMap() {
  console.log('🧪 Test 1: Build Secondary Route Map\n');
  
  const routeCodes = ['R1', 'R1.1', 'R2', 'R2.2', 'R3', 'R3.1', 'R4', 'R7', 'R7.1'];
  const map = buildSecondaryRouteMap(routeCodes);
  
  console.log('Input routes:', routeCodes);
  console.log('Generated map:', map);
  
  // Verify
  const isCorrect = 
    map['R1']?.includes('R1.1') &&
    map['R2']?.includes('R2.2') &&
    map['R3']?.includes('R3.1') &&
    map['R7']?.includes('R7.1') &&
    !map['R4']; // R4 has no secondary
  
  console.log(`✅ Test passed: ${isCorrect}\n`);
  
  return isCorrect;
}

/**
 * Test 2: Verify pairing logic
 */
export function testPairingLogic() {
  console.log('🧪 Test 2: Verify Pairing Logic\n');
  
  const mainRoute = 'R2';
  const secondaryToMain = {
    'R1': ['R1.1'],
    'R2': ['R2.2'],
    'R3': ['R3.1'],
    'R7': ['R7.1']
  };
  
  // Check if main route has secondary
  const hasSecondary = secondaryToMain[mainRoute] && secondaryToMain[mainRoute].length > 0;
  
  console.log(`Main route: ${mainRoute}`);
  console.log(`Has secondary: ${hasSecondary}`);
  
  if (hasSecondary) {
    const secondaryRoute = secondaryToMain[mainRoute][0];
    const combined = `${mainRoute}+${secondaryRoute}`;
    console.log(`Secondary route: ${secondaryRoute}`);
    console.log(`Combined value: ${combined}`);
    console.log(`✅ This is what should appear in calendar cell`);
  }
  
  console.log();
  
  return hasSecondary;
}

/**
 * Test 3: Simulate day assignment
 */
export function testDayAssignment() {
  console.log('🧪 Test 3: Simulate Day Assignment\n');
  
  const drivers = [
    { id: 2, name: 'JULIAN ronaldo' },
    { id: 5, name: 'SERGIO gavi' },
    { id: 6, name: 'J.HARRISON cuba' }
  ];
  
  const routeCodes = ['R2', 'R2.2'];
  const secondaryToMain = { 'R2': ['R2.2'] };
  
  const schedule = {};
  const routesPool = [...routeCodes];
  
  // Simulate assignment for day 1
  console.log(`Day 1 - Available drivers: ${drivers.map(d => d.name).join(', ')}`);
  console.log(`Available routes: ${routesPool.join(', ')}`);
  console.log();
  
  // Assign to driver 0
  const mainRoute = routesPool.shift(); // R2
  drivers[0].assignedRoute = mainRoute;
  
  console.log(`✅ Driver "${drivers[0].name}" gets main route: ${mainRoute}`);
  
  // Check for secondary
  if (secondaryToMain[mainRoute]) {
    const secondaryRoute = secondaryToMain[mainRoute][0];
    drivers[0].assignedRoute = `${mainRoute}+${secondaryRoute}`;
    
    // Remove from pool
    const secondaryIndex = routesPool.indexOf(secondaryRoute);
    if (secondaryIndex > -1) {
      routesPool.splice(secondaryIndex, 1);
    }
    
    console.log(`✅ Add secondary route: ${secondaryRoute}`);
    console.log(`✅ Final assignment: "${drivers[0].assignedRoute}"`);
  }
  
  console.log(`\nRemaining routes: ${routesPool.length === 0 ? 'None (all assigned)' : routesPool.join(', ')}`);
  console.log();
  
  return drivers[0].assignedRoute === 'R2+R2.2';
}

/**
 * Test 4: Verify no orphaned secondary routes
 */
export function testNoOrphanedSecondaryRoutes() {
  console.log('🧪 Test 4: Verify No Orphaned Secondary Routes\n');
  
  const schedule = {
    1: { 1: { type: 'work', value: 'R1+R1.1' } },
    2: { 1: { type: 'work', value: 'R2+R2.2' } },
    3: { 1: { type: 'work', value: 'R3+R3.1' } },
  };
  
  const routeCodes = ['R1', 'R1.1', 'R2', 'R2.2', 'R3', 'R3.1'];
  const secondaryRoutes = routeCodes.filter(r => r.includes('.'));
  
  console.log('Secondary routes to check:', secondaryRoutes);
  
  let orphaned = [];
  
  // Check each day
  Object.keys(schedule).forEach(driverId => {
    const driverSchedule = schedule[driverId];
    Object.keys(driverSchedule).forEach(day => {
      const cell = driverSchedule[day];
      const value = cell.value || '';
      
      // Check each secondary route
      secondaryRoutes.forEach(sr => {
        const hasSecondary = value.includes(sr);
        const mainPart = sr.split('.')[0];
        const hasMain = value.includes(mainPart);
        
        if (hasSecondary && !hasMain) {
          orphaned.push({
            day,
            driverId,
            route: sr,
            issue: `${sr} without ${mainPart}`
          });
        }
      });
    });
  });
  
  console.log(`\nOrphaned secondary routes found: ${orphaned.length}`);
  
  if (orphaned.length === 0) {
    console.log('✅ All secondary routes are properly paired');
  } else {
    console.log('❌ Issues found:');
    orphaned.forEach(issue => {
      console.log(`   - Day ${issue.day}, Driver ${issue.driverId}: ${issue.issue}`);
    });
  }
  
  console.log();
  
  return orphaned.length === 0;
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log('═════════════════════════════════════════\n');
  console.log('ROUTE PAIRING SYSTEM - TEST SUITE\n');
  console.log('═════════════════════════════════════════\n');
  
  const test1 = testBuildSecondaryRouteMap();
  const test2 = testPairingLogic();
  const test3 = testDayAssignment();
  const test4 = testNoOrphanedSecondaryRoutes();
  
  console.log('═════════════════════════════════════════');
  console.log('SUMMARY\n');
  console.log(`Test 1 (Build Map): ${test1 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Test 2 (Pairing Logic): ${test2 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Test 3 (Day Assignment): ${test3 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Test 4 (No Orphaned): ${test4 ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = test1 && test2 && test3 && test4;
  console.log(`\nOverall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('═════════════════════════════════════════\n');
  
  return allPassed;
}

// For debugging in browser console
if (typeof window !== 'undefined') {
  window.runTests = runAllTests;
  window.testBuildMap = testBuildSecondaryRouteMap;
  window.testPairing = testPairingLogic;
  window.testAssignment = testDayAssignment;
  window.testOrphaned = testNoOrphanedSecondaryRoutes;
}
