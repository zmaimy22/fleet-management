import { useState, useEffect } from 'react';
import { getVacationRequests, saveVacationRequests } from '../utils/api';

export const useVacationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const savedRequests = await getVacationRequests();
      if (savedRequests && Array.isArray(savedRequests)) {
        setRequests(savedRequests);
      }
    } catch (error) {
      console.error('Failed to load vacation requests from API:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('vacationRequests');
      if (saved) {
        try {
          setRequests(JSON.parse(saved));
        } catch (e) {
          setRequests([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const updateRequestsState = async (newRequests) => {
    setRequests(newRequests);
    try {
      await saveVacationRequests(newRequests);
    } catch (error) {
      console.error('Failed to save vacation requests to API:', error);
      // Fallback to localStorage
      localStorage.setItem('vacationRequests', JSON.stringify(newRequests));
    }
  };

  const addRequest = (request) => {
    const newId = Math.max(...requests.map(r => r.id), 0) + 1;
    const newRequest = {
      id: newId,
      ...request,
      status: 'pending', // pending, approved, rejected
      createdAt: new Date().toISOString(),
    };
    const newRequests = [...requests, newRequest];
    updateRequestsState(newRequests);
  };

  const updateRequest = (id, updatedData) => {
    const newRequests = requests.map(r =>
      r.id === id ? { ...r, ...updatedData } : r
    );
    updateRequestsState(newRequests);
  };

  const deleteRequest = (id) => {
    const newRequests = requests.filter(r => r.id !== id);
    updateRequestsState(newRequests);
  };

  const approveRequest = (id) => {
    updateRequest(id, { status: 'approved' });
  };

  const rejectRequest = (id) => {
    updateRequest(id, { status: 'rejected' });
  };

  const getRequestsByDriver = (driverId) => {
    return requests.filter(r => r.driverId === driverId);
  };

  const getRequestsByStatus = (status) => {
    return requests.filter(r => r.status === status);
  };

  const getRequestsByYear = (year) => {
    return requests.filter(r => {
      const startDate = new Date(r.startDate);
      return startDate.getFullYear() === year;
    });
  };

  return {
    requests,
    addRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
    getRequestsByDriver,
    getRequestsByStatus,
    getRequestsByYear,
    refreshRequests: loadRequests,
    loading
  };
};
