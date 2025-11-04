import { useState, useEffect } from 'react';
import { drivers as defaultDrivers } from '../data/drivers';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = () => {
    const savedDrivers = localStorage.getItem('customDrivers');
    if (savedDrivers) {
      try {
        setDrivers(JSON.parse(savedDrivers));
      } catch (e) {
        setDrivers(defaultDrivers);
      }
    } else {
      setDrivers(defaultDrivers);
    }
  };

  const saveDrivers = (newDrivers) => {
    setDrivers(newDrivers);
    localStorage.setItem('customDrivers', JSON.stringify(newDrivers));
  };

  const addDriver = (driver) => {
    const newId = Math.max(...drivers.map(d => d.id), 0) + 1;
    const newDriver = { id: newId, ...driver };
    const newDrivers = [...drivers, newDriver];
    saveDrivers(newDrivers);
  };

  const updateDriver = (id, updatedDriver) => {
    const newDrivers = drivers.map(d => 
      d.id === id ? { ...d, ...updatedDriver } : d
    );
    saveDrivers(newDrivers);
  };

  const deleteDriver = (id) => {
    const newDrivers = drivers.filter(d => d.id !== id);
    saveDrivers(newDrivers);
  };

  const resetToDefaults = () => {
    localStorage.removeItem('customDrivers');
    setDrivers(defaultDrivers);
    saveDrivers(defaultDrivers);
  };

  return {
    drivers,
    addDriver,
    updateDriver,
    deleteDriver,
    refreshDrivers: loadDrivers,
    resetToDefaults
  };
};
