// Master routes data: code, plate, clients (ordered)
// Secondary routes (e.g., R1.1) are performed after main routes (e.g., R1)
// Route categories: lanzarote (to Lanzarote), local_morning (same island morning), local_night (same island night)
export const routes = [
  {
    code: 'R1 2391MMR',
    shortCode: 'R1',
    plate: '2391MMR',
    clients: ['PLAYA', 'PLAYA', 'FARO'],
    isSecondary: false,
    category: 'lanzarote', // Ruta a Lanzarote
    driversNeeded: 3 // Number of drivers needed for this route
  },
  {
    code: 'R1.1 6712BHF',
    shortCode: 'R1.1',
    plate: '6712BHF',
    clients: ['BAY', 'BAY', 'BAY', 'GALERA B', 'V.ANTONIO'],
    isSecondary: true,
    mainRoute: 'R1'
  },
  {
    code: 'R2 3590LLL',
    shortCode: 'R2',
    plate: '3590LLL',
    clients: ['MAR', 'MAR', 'PARK'],
    isSecondary: false,
    driversNeeded: 3 // Number of drivers needed for this route
  },
  {
    code: 'R2.2 6555HSS',
    shortCode: 'R2.2',
    plate: '6555HSS',
    clients: ['BAHIA REAL', 'BAHIA REAL', 'BAHIA REAL', 'MAXORATA', 'MAXORATA', 'SURFRIDER'],
    isSecondary: true,
    mainRoute: 'R2'
  },
  {
    code: 'R3 111DZZ',
    shortCode: 'R3',
    plate: '111DZZ',
    clients: ['PALMERA', 'O.DUNA', 'V.RENTAL', 'PALMERA', 'SATOCAN', 'V.RENTAL', 'PALMERA', 'SATOCAN', 'SURFINCOLOR', 'SURFINCOLOR', 'SURFINCOLOR', 'SURFINCOLOR'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R3.1 5456GCC',
    shortCode: 'R3.1',
    plate: '5456GCC',
    clients: ['FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'SALADAR'],
    isSecondary: true,
    mainRoute: 'R3'
  },
  {
    code: 'R4 9569GTT',
    shortCode: 'R4',
    plate: '9569GTT',
    clients: ['BRISTOL', 'SAND', 'SAND', 'BRISTOL', 'SAND', 'SAND', 'BRISTOL', 'SAND', 'SAND', 'ALOE', 'SAND', 'DREAM', 'ALOE', 'I.HOME', 'I.HOME'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R5 6755Mbf',
    shortCode: 'R5',
    plate: '6755Mbf',
    clients: ['PRINCES', 'PRINCES', 'GAVIOTA', 'PRINCES', 'PRINCES', 'GAVIOTA', 'PRINCES', 'PRINCES', 'GAVIOTA', 'PRINCES', 'PRINCES', 'GAVIOTA', 'PRINCES', 'PRINCES', 'GAVIOTA'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R6 fgytr',
    shortCode: 'R6',
    plate: '5543DSE',
    clients: ['ALTAMARENA', 'PALGARDEN', 'IB PALACE', 'ALTAMARENA', 'PALGARDEN', 'IB PALACE', 'ALTAMARENA', 'IGRAMAR', 'IB PALACE', 'V.ALTA M', 'B.CALMA', 'B.CALMA'],
    notes: 'Igramar: domingo, martes, viernes',
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R7 9590HN',
    shortCode: 'R7',
    plate: '9590HN',
    clients: ['B.CLUB', 'B.CLUB', 'MAJORRERO', 'B.CLUB', 'B.CLUB', 'MAJORRERO', 'B.CLUB', 'B.CLUB', 'MAJORRERO', 'B.CLUB', 'B.CLUB', 'MAJORRERO', 'B.CLUB', 'TAHONA', 'TAHONA'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R7.1 6447HS',
    shortCode: 'R7.1',
    plate: '6447HS',
    clients: ['CHATUR', 'SALINAS', 'VISTA', 'CHATUR', 'SALINAS', 'VISTA', 'CHATUR', 'SALINAS', 'LAKE', 'CHATUR', 'SALINAS', 'LAKE', 'CHATUR', 'SALINAS', 'LAKE'],
    isSecondary: true,
    mainRoute: 'R7'
  },
  {
    code: 'R8 7178MD',
    shortCode: 'R8',
    plate: '7178MD',
    clients: ['ESMERALDA', 'TINDAYA', 'DRAGO', 'ESMERALDA', 'TINDAYA', 'DRAGO', 'ESMERALDA', 'TINDAYA', 'R.GATO', 'ESMERALDA', 'TINDAYA', 'TINDAYA', 'RIO JARDIN', 'RIO PLAYA', 'V.ANGELICA'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R9 9590HN',
    shortCode: 'R9',
    plate: '9590HN',
    clients: ['B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'F.SOL', 'M.CASTILLO'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R11 7517HW',
    shortCode: 'R11',
    plate: '7517HW',
    clients: ['RUBICON', 'TIMANFAYA', 'H10', 'RUBICON', 'TIMANFAYA', 'H10', 'RUBICON', 'TIMANFAYA', 'H10', 'RUBICON', 'TIMANFAYA', 'H10', 'RUBICON', 'TIMANFAYA', 'B.ROCK'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R12 5466DDE',
    shortCode: 'R12',
    plate: '5466DDE',
    clients: ['ROYAL', 'ACTIVE', 'ACTIVE', 'ROYAL', 'ACTIVE', 'ACTIVE', 'ROYAL', 'ACTIVE', 'ACTIVE', 'ROYAL', 'ACTIVE', 'ACTIVE', 'ROYAL', 'ROYAL', 'ACTIVE'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R13 2391MHH',
    shortCode: 'R13',
    plate: '2391MHH',
    clients: ['P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'I.BEROSTAR', 'I.BEROSTAR', 'I.BEROSTAR'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R14 3590LOO',
    shortCode: 'R14',
    plate: '3590LOO',
    clients: ['TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE'],
    isSecondary: false,
    driversNeeded: 1
  },
  {
    code: 'R15 9569GPP',
    shortCode: 'R15',
    plate: '9569GPP',
    clients: ['RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU'],
    isSecondary: false,
    driversNeeded: 1
  }
];

// Get all route codes
export const routeCodes = routes.map(r => r.shortCode);

// Get main routes only (exclude secondary routes)
export const mainRoutes = routes.filter(r => !r.isSecondary);

// Get secondary routes grouped by main route
export const getSecondaryRoutes = (mainRouteCode) => {
  return routes.filter(r => r.isSecondary && r.mainRoute === mainRouteCode);
};

// Get route by code
export const getRouteByCode = (code) => {
  return routes.find(r => r.shortCode === code);
};

// Get routes by category
export const getRoutesByCategory = (category) => {
  return routes.filter(r => r.category === category);
};

// Route categories
export const ROUTE_CATEGORIES = {
  LANZAROTE: 'lanzarote',
  LOCAL_MORNING: 'local_morning',
  LOCAL_NIGHT: 'local_night'
};
