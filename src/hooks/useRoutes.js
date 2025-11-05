import { useState, useEffect } from 'react';
import { routes as defaultRoutes } from '../data/routes';

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = () => {
    const savedRoutes = localStorage.getItem('customRoutes');
    if (savedRoutes) {
      try {
        setRoutes(JSON.parse(savedRoutes));
      } catch (e) {
        setRoutes(defaultRoutes);
      }
    } else {
      setRoutes(defaultRoutes);
    }
  };

  const saveRoutes = (newRoutes) => {
    setRoutes(newRoutes);
    localStorage.setItem('customRoutes', JSON.stringify(newRoutes));
  };

  const addRoute = (route) => {
    const newRoutes = [...routes, route];
    saveRoutes(newRoutes);
  };

  const updateRoute = (shortCode, updatedRoute) => {
    const newRoutes = routes.map(r => 
      r.shortCode === shortCode ? updatedRoute : r
    );
    saveRoutes(newRoutes);
  };

  const deleteRoute = (shortCode) => {
    const newRoutes = routes.filter(r => r.shortCode !== shortCode);
    saveRoutes(newRoutes);
  };

  const resetToDefaults = () => {
    localStorage.removeItem('customRoutes');
    setRoutes(defaultRoutes);
    saveRoutes(defaultRoutes);
  };

  const getRouteCodes = () => routes.map(r => r.shortCode);

  // Get all routes associated with a main route (main + secondaries)
  const getRelatedRoutes = (routeCode) => {
    const route = routes.find(r => r.shortCode === routeCode);
    if (!route) return [];
    
    // If it's a secondary route, get its main route
    if (route.isSecondary) {
      const mainRoute = routes.find(r => r.shortCode === route.mainRoute);
      const secondaries = routes.filter(r => r.isSecondary && r.mainRoute === route.mainRoute);
      return mainRoute ? [mainRoute, ...secondaries] : [route];
    }
    
    // If it's a main route, get all its secondaries
    const secondaries = routes.filter(r => r.isSecondary && r.mainRoute === routeCode);
    return [route, ...secondaries];
  };

  // Get route group label (for display: R1+R1.1)
  const getRouteGroupLabel = (routeCode) => {
    const related = getRelatedRoutes(routeCode);
    return related.map(r => r.shortCode).join('+');
  };

  // Check if two routes are related (same driver drives both)
  const areRoutesRelated = (route1Code, route2Code) => {
    const related1 = getRelatedRoutes(route1Code).map(r => r.shortCode);
    return related1.includes(route2Code);
  };

  // Get main route code from any route (main or secondary)
  const getMainRouteCode = (routeCode) => {
    const route = routes.find(r => r.shortCode === routeCode);
    if (!route) return routeCode;
    return route.isSecondary ? route.mainRoute : routeCode;
  };

  return {
    routes,
    routeCodes: getRouteCodes(),
    addRoute,
    updateRoute,
    deleteRoute,
    refreshRoutes: loadRoutes,
    resetToDefaults,
    getRelatedRoutes,
    getRouteGroupLabel,
    areRoutesRelated,
    getMainRouteCode
  };
};
