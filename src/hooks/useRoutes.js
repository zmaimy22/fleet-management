import { useState, useEffect } from 'react';
import { routes as defaultRoutes } from '../data/routes';
import { getRoutes, saveRoutes } from '../utils/api';

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const savedRoutes = await getRoutes();
      if (savedRoutes && Array.isArray(savedRoutes) && savedRoutes.length > 0) {
        setRoutes(savedRoutes);
      } else {
        setRoutes(defaultRoutes);
      }
    } catch (error) {
      console.error('Failed to load routes from API, using defaults:', error);
      setRoutes(defaultRoutes);
    } finally {
      setLoading(false);
    }
  };

  const updateRoutesState = async (newRoutes) => {
    setRoutes(newRoutes);
    try {
      await saveRoutes(newRoutes);
    } catch (error) {
      console.error('Failed to save routes to API:', error);
      // Routes are still in state, just warn the user
    }
  };

  const addRoute = (route) => {
    const newRoutes = [...routes, route];
    updateRoutesState(newRoutes);
  };

  const updateRoute = (shortCode, updatedRoute) => {
    const newRoutes = routes.map(r => 
      r.shortCode === shortCode ? { ...r, ...updatedRoute, shortCode: r.shortCode } : r
    );
    updateRoutesState(newRoutes);
  };

  const updateRoutesBatch = (updates) => {
    const newRoutes = routes.map(r => {
      const upd = updates.find(u => u && u.shortCode === r.shortCode);
      return upd ? { ...r, ...upd, shortCode: r.shortCode } : r;
    });
    updateRoutesState(newRoutes);
  };

  const deleteRoute = (shortCode) => {
    const newRoutes = routes.filter(r => r.shortCode !== shortCode);
    updateRoutesState(newRoutes);
  };

  const resetToDefaults = async () => {
    try {
      await saveRoutes(defaultRoutes);
      setRoutes(defaultRoutes);
    } catch (error) {
      console.error('Failed to reset routes to API:', error);
      setRoutes(defaultRoutes);
    }
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
    updateRoutesBatch,
    deleteRoute,
    refreshRoutes: loadRoutes,
    resetToDefaults,
    getRelatedRoutes,
    getRouteGroupLabel,
    areRoutesRelated,
    getMainRouteCode,
    loading
  };
};
