import { useState, useEffect } from 'react';

export const useVacationRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const saved = localStorage.getItem('vacationRequests');
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (e) {
        setRequests([]);
      }
    } else {
      setRequests([]);
    }
  };

  const saveRequests = (newRequests) => {
    setRequests(newRequests);
    localStorage.setItem('vacationRequests', JSON.stringify(newRequests));
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
    saveRequests(newRequests);
  };

  const updateRequest = (id, updatedData) => {
    const newRequests = requests.map(r =>
      r.id === id ? { ...r, ...updatedData } : r
    );
    saveRequests(newRequests);
  };

  const deleteRequest = (id) => {
    const newRequests = requests.filter(r => r.id !== id);
    saveRequests(newRequests);
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
  };
};
