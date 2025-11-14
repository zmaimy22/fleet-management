const fs = require('fs');

// Read the calendars file
const calendars = JSON.parse(fs.readFileSync('server/data/calendars.json', 'utf8'));

// Check all months for driver 17 and duplicates
for (const month in calendars) {
  if (month.includes('2025') || month.includes('2024')) {
    const monthData = calendars[month];
    if (typeof monthData === 'object' && Object.keys(monthData).length > 0) {
      const drivers = Object.keys(monthData);
      
      // Check for driver 17
      if (drivers.includes('17')) {
        console.log(`Month ${month} has driver 17`);
        console.log(`  Total drivers: ${drivers.length}`);
      }
    }
  }
}

console.log('\nNow checking specifically November 2025...');
const nov2025 = calendars['2025-11'];
if (nov2025) {
  const drivers = Object.keys(nov2025);
  console.log('All drivers in November 2025:', drivers.sort((a, b) => parseInt(a) - parseInt(b)));
  
  // Count how many times driver 17 appears
  let count17 = 0;
  for (const key in nov2025) {
    if (key === '17') count17++;
  }
  console.log('Driver 17 appears', count17, 'times in November 2025');
}
