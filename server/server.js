const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Helper function to read JSON file
async function readJSONFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // File doesn't exist
    }
    throw error;
  }
}

// Helper function to write JSON file
async function writeJSONFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// ==================== CALENDARS ====================

// Get all saved calendars
app.get('/api/calendars', async (req, res) => {
  try {
    const calendars = await readJSONFile('calendars.json') || {};
    res.json(calendars);
  } catch (error) {
    console.error('Error reading calendars:', error);
    res.status(500).json({ error: 'Failed to read calendars' });
  }
});

// Get specific calendar by month key
app.get('/api/calendars/:monthKey', async (req, res) => {
  try {
    const calendars = await readJSONFile('calendars.json') || {};
    const calendar = calendars[req.params.monthKey];
    
    if (!calendar) {
      return res.status(404).json({ error: 'Calendar not found' });
    }
    
    res.json(calendar);
  } catch (error) {
    console.error('Error reading calendar:', error);
    res.status(500).json({ error: 'Failed to read calendar' });
  }
});

// Save/Update calendar
app.post('/api/calendars/:monthKey', async (req, res) => {
  try {
    const { monthKey } = req.params;
    const calendarData = req.body;
    
    const calendars = await readJSONFile('calendars.json') || {};
    calendars[monthKey] = calendarData;
    
    await writeJSONFile('calendars.json', calendars);
    res.json({ success: true, message: 'Calendar saved successfully' });
  } catch (error) {
    console.error('Error saving calendar:', error);
    res.status(500).json({ error: 'Failed to save calendar' });
  }
});

// ==================== DRIVERS ====================

// Get all drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const drivers = await readJSONFile('drivers.json');
    res.json(drivers || []);
  } catch (error) {
    console.error('Error reading drivers:', error);
    res.status(500).json({ error: 'Failed to read drivers' });
  }
});

// Save drivers
app.post('/api/drivers', async (req, res) => {
  try {
    await writeJSONFile('drivers.json', req.body);
    res.json({ success: true, message: 'Drivers saved successfully' });
  } catch (error) {
    console.error('Error saving drivers:', error);
    res.status(500).json({ error: 'Failed to save drivers' });
  }
});

// ==================== ROUTES ====================

// Get all routes
app.get('/api/routes', async (req, res) => {
  try {
    const routes = await readJSONFile('routes.json');
    res.json(routes || []);
  } catch (error) {
    console.error('Error reading routes:', error);
    res.status(500).json({ error: 'Failed to read routes' });
  }
});

// Save routes
app.post('/api/routes', async (req, res) => {
  try {
    await writeJSONFile('routes.json', req.body);
    res.json({ success: true, message: 'Routes saved successfully' });
  } catch (error) {
    console.error('Error saving routes:', error);
    res.status(500).json({ error: 'Failed to save routes' });
  }
});

// ==================== VACATION REQUESTS ====================

// Get all vacation requests
app.get('/api/vacation-requests', async (req, res) => {
  try {
    const requests = await readJSONFile('vacation-requests.json');
    res.json(requests || []);
  } catch (error) {
    console.error('Error reading vacation requests:', error);
    res.status(500).json({ error: 'Failed to read vacation requests' });
  }
});

// Save vacation requests
app.post('/api/vacation-requests', async (req, res) => {
  try {
    await writeJSONFile('vacation-requests.json', req.body);
    res.json({ success: true, message: 'Vacation requests saved successfully' });
  } catch (error) {
    console.error('Error saving vacation requests:', error);
    res.status(500).json({ error: 'Failed to save vacation requests' });
  }
});

// ==================== ROUTE GROUPS ====================

// Get all route groups
app.get('/api/route-groups', async (req, res) => {
  try {
    const groups = await readJSONFile('route-groups.json');
    res.json(groups || []);
  } catch (error) {
    console.error('Error reading route groups:', error);
    res.status(500).json({ error: 'Failed to read route groups' });
  }
});

// Save route groups
app.post('/api/route-groups', async (req, res) => {
  try {
    await writeJSONFile('route-groups.json', req.body);
    res.json({ success: true, message: 'Route groups saved successfully' });
  } catch (error) {
    console.error('Error saving route groups:', error);
    res.status(500).json({ error: 'Failed to save route groups' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== START SERVER ====================

async function startServer() {
  await ensureDataDir();
  
  app.listen(PORT, () => {
    console.log(`🚀 Fleet Management API Server running on port ${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);
