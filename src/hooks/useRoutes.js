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

  return {
    routes,
    routeCodes: getRouteCodes(),
    addRoute,
    updateRoute,
    deleteRoute,
    refreshRoutes: loadRoutes,
    resetToDefaults
  };
};
