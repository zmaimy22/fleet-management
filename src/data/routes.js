// Master routes data: code, plate, clients (ordered)
// Secondary routes (e.g., R1.1) are performed after main routes (e.g., R1)
// Route categories: lanzarote (to Lanzarote), local_morning (same island morning), local_night (same island night)
export const routes = [
  {
    code: 'R1 2391MKG',
    shortCode: 'R1',
    plate: '2391MKG',
    clients: ['PLAYA', 'PLAYA', 'FARO'],
    isSecondary: false,
    category: 'lanzarote' // Ruta a Lanzarote
  },
  {
    code: 'R1.1 6173HDP',
    shortCode: 'R1.1',
    plate: '6173HDP',
    clients: ['BAY', 'BAY', 'BAY', 'GALERA B', 'V.ANTONIO'],
    isSecondary: true,
    mainRoute: 'R1'
  },
  {
    code: 'R2 3590LHP',
    shortCode: 'R2',
    plate: '3590LHP',
    clients: ['MAR', 'MAR', 'PARK'],
    isSecondary: false
  },
  {
    code: 'R2.2 6447HSF',
    shortCode: 'R2.2',
    plate: '6447HSF',
    clients: ['BAHIA REAL', 'BAHIA REAL', 'BAHIA REAL', 'MAXORATA', 'MAXORATA', 'SURFRIDER'],
    isSecondary: true,
    mainRoute: 'R2'
  },
  {
    code: 'R3 2635DZX',
    shortCode: 'R3',
    plate: '2635DZX',
    clients: ['PALMERA', 'O.DUNA', 'V.RENTAL', 'PALMERA', 'SATOCAN', 'V.RENTAL', 'PALMERA', 'SATOCAN', 'SURFINCOLOR', 'SURFINCOLOR', 'SURFINCOLOR', 'SURFINCOLOR'],
    isSecondary: false
  },
  {
    code: 'R3.1 3416GCV',
    shortCode: 'R3.1',
    plate: '3416GCV',
    clients: ['FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'FLISA', 'SALADAR'],
    isSecondary: true,
    mainRoute: 'R3'
  },
  {
    code: 'R4 9569GPY',
    shortCode: 'R4',
    plate: '9569GPY',
    clients: ['BRISTOL', 'SAND', 'SAND', 'BRISTOL', 'SAND', 'SAND', 'BRISTOL', 'SAND', 'SAND', 'ALOE', 'SAND', 'DREAM', 'ALOE', 'I.HOME', 'I.HOME'],
    isSecondary: false
  },
  {
    code: 'R5 9569GPY',
    shortCode: 'R5',
    plate: '9569GPY',
    clients: ['PRINCES', 'PRINCES', 'GAVIOTA', 'PRINCES', 'PRINCES', 'GAVIOTA', 'PRINCES', 'PRINCES', 'GAVIOTA', 'PRINCES', 'PRINCES', 'GAVIOTA', 'PRINCES', 'PRINCES', 'GAVIOTA'],
    isSecondary: false
  },
  {
    code: 'R6 2635DZX',
    shortCode: 'R6',
    plate: '2635DZX',
    clients: ['ALTAMARENA', 'PALGARDEN', 'IB PALACE', 'ALTAMARENA', 'PALGARDEN', 'IB PALACE', 'ALTAMARENA', 'IGRAMAR', 'IB PALACE', 'V.ALTA M', 'B.CALMA', 'B.CALMA'],
    notes: 'Igramar: domingo, martes, viernes',
    isSecondary: false
  },
  {
    code: 'R7 9590HNF',
    shortCode: 'R7',
    plate: '9590HNF',
    clients: ['B.CLUB', 'B.CLUB', 'MAJORRERO', 'B.CLUB', 'B.CLUB', 'MAJORRERO', 'B.CLUB', 'B.CLUB', 'MAJORRERO', 'B.CLUB', 'B.CLUB', 'MAJORRERO', 'B.CLUB', 'TAHONA', 'TAHONA'],
    isSecondary: false
  },
  {
    code: 'R7.1 6447HSF',
    shortCode: 'R7.1',
    plate: '6447HSF',
    clients: ['CHATUR', 'SALINAS', 'VISTA', 'CHATUR', 'SALINAS', 'VISTA', 'CHATUR', 'SALINAS', 'LAKE', 'CHATUR', 'SALINAS', 'LAKE', 'CHATUR', 'SALINAS', 'LAKE'],
    isSecondary: true,
    mainRoute: 'R7'
  },
  {
    code: 'R8 7178MDG',
    shortCode: 'R8',
    plate: '7178MDG',
    clients: ['ESMERALDA', 'TINDAYA', 'DRAGO', 'ESMERALDA', 'TINDAYA', 'DRAGO', 'ESMERALDA', 'TINDAYA', 'R.GATO', 'ESMERALDA', 'TINDAYA', 'TINDAYA', 'RIO JARDIN', 'RIO PLAYA', 'V.ANGELICA'],
    isSecondary: false
  },
  {
    code: 'R9 9590HNF',
    shortCode: 'R9',
    plate: '9590HNF',
    clients: ['B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'B.FTV', 'F.SOL', 'M.CASTILLO'],
    isSecondary: false
  },
  {
    code: 'R11 7517HWS',
    shortCode: 'R11',
    plate: '7517HWS',
    clients: ['RUBICON', 'TIMANFAYA', 'H10', 'RUBICON', 'TIMANFAYA', 'H10', 'RUBICON', 'TIMANFAYA', 'H10', 'RUBICON', 'TIMANFAYA', 'H10', 'RUBICON', 'TIMANFAYA', 'B.ROCK'],
    isSecondary: false
  },
  {
    code: 'R12 5082LHG',
    shortCode: 'R12',
    plate: '5082LHG',
    clients: ['ROYAL', 'ACTIVE', 'ACTIVE', 'ROYAL', 'ACTIVE', 'ACTIVE', 'ROYAL', 'ACTIVE', 'ACTIVE', 'ROYAL', 'ACTIVE', 'ACTIVE', 'ROYAL', 'ROYAL', 'ACTIVE'],
    isSecondary: false
  },
  {
    code: 'R13 2391MKG',
    shortCode: 'R13',
    plate: '2391MKG',
    clients: ['P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'P.BLANCA', 'I.BEROSTAR', 'I.BEROSTAR', 'I.BEROSTAR'],
    isSecondary: false
  },
  {
    code: 'R14 3590LHP',
    shortCode: 'R14',
    plate: '3590LHP',
    clients: ['TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE', 'TEGUISE', 'TEGUISE', 'ACTIVE'],
    isSecondary: false
  },
  {
    code: 'R15 9569GPY',
    shortCode: 'R15',
    plate: '9569GPY',
    clients: ['RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU', 'RIU'],
    isSecondary: false
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
