const drivers = [
  { id: 4, name: 'JULIAN TAMAYO VILLA' },
  { id: 7, name: 'ARISTEO OJEDA EXPOSITO' },
  { id: 9, name: 'HAFAD ABDERRAHAMAN' }
];

// محاكاة نمط 4/2
function getPatternIndex(startIndex, day) {
  return (startIndex + day - 1) % 6;
}

function isWorkDay(patternIndex) {
  return patternIndex < 4;
}

// ديسمبر 2024 = 31 يوم
const days = 31;

drivers.forEach(driver => {
  console.log(`\n${driver.name} (ID: ${driver.id}):`);
  console.log('='.repeat(50));
  
  let startIndex = 0; // افتراضي
  let assignedRoutes, driverRole;
  
  if (driver.id === 7) {
    // Primary driver
    assignedRoutes = ['R15', 'R14'];
    driverRole = 'primary';
  } else if (driver.id === 9) {
    // Secondary driver
    assignedRoutes = ['R15', 'R14'];
    driverRole = 'secondary';
  } else if (driver.id === 4) {
    // Alternating driver
    assignedRoutes = ['R14', 'R15'];
    driverRole = 'alternating';
  }
  
  let schedule = [];
  for (let day = 1; day <= days; day++) {
    const patternIndex = getPatternIndex(startIndex, day);
    const isWork = isWorkDay(patternIndex);
    
    if (isWork) {
      const workDayInCycle = patternIndex % 4;
      const twoDayBlock = Math.floor(workDayInCycle / 2);
      const routeValue = assignedRoutes[twoDayBlock];
      schedule.push(`Day ${day}: ${routeValue}`);
    } else {
      schedule.push(`Day ${day}: REST`);
    }
  }
  
  // عرض كل الأيام
  schedule.forEach(s => console.log(s));
  
  // حساب الإحصائيات
  const r15Count = schedule.filter(s => s.includes('R15')).length;
  const r14Count = schedule.filter(s => s.includes('R14')).length;
  const restCount = schedule.filter(s => s.includes('REST')).length;
  
  console.log('\n' + '-'.repeat(50));
  console.log(`إجمالي: R15=${r15Count} أيام, R14=${r14Count} أيام, راحة=${restCount} أيام`);
});
