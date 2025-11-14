import { useState, useEffect } from 'react';
import { drivers as defaultDrivers } from '../data/drivers';
import { getDrivers, saveDrivers } from '../utils/api';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const savedDrivers = await getDrivers();
      if (savedDrivers && Array.isArray(savedDrivers) && savedDrivers.length > 0) {
        setDrivers(savedDrivers);
      } else {
        setDrivers(defaultDrivers);
      }
    } catch (error) {
      console.error('Failed to load drivers from API, using defaults:', error);
      setDrivers(defaultDrivers);
    } finally {
      setLoading(false);
    }
  };

  const updateDriversState = async (newDrivers) => {
    setDrivers(newDrivers);
    try {
      await saveDrivers(newDrivers);
    } catch (error) {
      console.error('Failed to save drivers to API:', error);
      // Drivers are still in state, just warn the user
    }
  };

  const addDriver = (driver) => {
    const newId = Math.max(...drivers.map(d => d.id), 0) + 1;
    const newDriver = { 
      id: newId, 
      ...driver,
      category: driver.category || '',
      originalCategory: driver.originalCategory || driver.category || ''
    };
    const newDrivers = [...drivers, newDriver];
    updateDriversState(newDrivers);
  };

  const updateDriver = (id, updatedDriver) => {
    const newDrivers = drivers.map(d => 
      d.id === id ? { ...d, ...updatedDriver } : d
    );
    updateDriversState(newDrivers);
  };

  const deleteDriver = (id) => {
    const newDrivers = drivers.filter(d => d.id !== id);
    updateDriversState(newDrivers);
  };

  const resetToDefaults = async () => {
    try {
      await saveDrivers(defaultDrivers);
      setDrivers(defaultDrivers);
    } catch (error) {
      console.error('Failed to reset drivers to API:', error);
      setDrivers(defaultDrivers);
    }
  };

  return {
    drivers,
    addDriver,
    updateDriver,
    deleteDriver,
    refreshDrivers: loadDrivers,
    resetToDefaults,
    loading
  };
};
