// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to handle API requests
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// ==================== CALENDARS ====================

export async function getAllCalendars() {
  return fetchAPI('/calendars');
}

export async function getCalendar(monthKey) {
  return fetchAPI(`/calendars/${monthKey}`);
}

export async function saveCalendar(monthKey, calendarData) {
  return fetchAPI(`/calendars/${monthKey}`, {
    method: 'POST',
    body: JSON.stringify(calendarData),
  });
}

// ==================== DRIVERS ====================

export async function getDrivers() {
  return fetchAPI('/drivers');
}

export async function saveDrivers(drivers) {
  return fetchAPI('/drivers', {
    method: 'POST',
    body: JSON.stringify(drivers),
  });
}

// ==================== ROUTES ====================

export async function getRoutes() {
  return fetchAPI('/routes');
}

export async function saveRoutes(routes) {
  return fetchAPI('/routes', {
    method: 'POST',
    body: JSON.stringify(routes),
  });
}

// ==================== VACATION REQUESTS ====================

export async function getVacationRequests() {
  return fetchAPI('/vacation-requests');
}

export async function saveVacationRequests(requests) {
  return fetchAPI('/vacation-requests', {
    method: 'POST',
    body: JSON.stringify(requests),
  });
}

// ==================== ROUTE GROUPS ====================

export async function getRouteGroups() {
  return fetchAPI('/route-groups');
}

export async function saveRouteGroups(groups) {
  return fetchAPI('/route-groups', {
    method: 'POST',
    body: JSON.stringify(groups),
  });
}

// ==================== HEALTH CHECK ====================

export async function checkHealth() {
  return fetchAPI('/health');
}

// ==================== FALLBACK TO LOCALSTORAGE ====================

// Check if API is available
export async function isAPIAvailable() {
  try {
    await checkHealth();
    return true;
  } catch {
    return false;
  }
}

// Hybrid storage: Try API first, fallback to localStorage
export class HybridStorage {
  constructor(storageKey) {
    this.storageKey = storageKey;
    this.useAPI = true;
  }

  async checkAPI() {
    try {
      this.useAPI = await isAPIAvailable();
    } catch {
      this.useAPI = false;
    }
  }

  async get() {
    await this.checkAPI();
    
    if (this.useAPI) {
      try {
        switch (this.storageKey) {
          case 'savedCalendars':
            return await getAllCalendars();
          case 'drivers':
            return await getDrivers();
          case 'routes':
            return await getRoutes();
          case 'vacationRequests':
            return await getVacationRequests();
          case 'routeGroups':
            return await getRouteGroups();
          default:
            throw new Error('Unknown storage key');
        }
      } catch (error) {
        console.warn('API failed, using localStorage:', error);
        this.useAPI = false;
      }
    }
    
    // Fallback to localStorage
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  async set(data) {
    // Always save to localStorage as backup
    localStorage.setItem(this.storageKey, JSON.stringify(data));
    
    await this.checkAPI();
    
    if (this.useAPI) {
      try {
        switch (this.storageKey) {
          case 'drivers':
            await saveDrivers(data);
            break;
          case 'routes':
            await saveRoutes(data);
            break;
          case 'vacationRequests':
            await saveVacationRequests(data);
            break;
          case 'routeGroups':
            await saveRouteGroups(data);
            break;
          default:
            console.warn('Unknown storage key for API');
        }
      } catch (error) {
        console.warn('Failed to save to API, saved to localStorage only:', error);
      }
    }
  }

  async saveCalendar(monthKey, calendarData) {
    // Save to localStorage
    const calendars = JSON.parse(localStorage.getItem('savedCalendars') || '{}');
    calendars[monthKey] = calendarData;
    localStorage.setItem('savedCalendars', JSON.stringify(calendars));
    
    await this.checkAPI();
    
    if (this.useAPI) {
      try {
        await saveCalendar(monthKey, calendarData);
      } catch (error) {
        console.warn('Failed to save calendar to API:', error);
      }
    }
  }
}
