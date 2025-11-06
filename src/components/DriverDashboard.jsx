import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Palmtree, Route, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useDrivers } from '../hooks/useDrivers';

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const { drivers } = useDrivers();
  const [schedule, setSchedule] = useState({});
  const [currentMonth, setCurrentMonth] = useState(10); // November
  const [currentYear, setCurrentYear] = useState(2025);
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [vacationRequest, setVacationRequest] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });

  const driver = drivers.find(d => d.id === user?.driverId);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    loadSchedule();
  }, [currentMonth, currentYear]);

  const loadSchedule = () => {
    const monthKey = `${currentYear}-${currentMonth}`;
    const saved = localStorage.getItem('savedCalendars');
    if (saved) {
      try {
        const calendars = JSON.parse(saved);
        setSchedule(calendars[monthKey] || {});
      } catch (e) {
        setSchedule({});
      }
    }
  };

  const handleVacationSubmit = (e) => {
    e.preventDefault();
    
    // Save vacation request
    const requests = JSON.parse(localStorage.getItem('vacationRequests') || '[]');
    const newRequest = {
      id: Math.max(...requests.map(r => r.id), 0) + 1,
      driverId: user.driverId,
      driverName: driver?.name || user.name,
      startDate: vacationRequest.startDate,
      endDate: vacationRequest.endDate,
      notes: vacationRequest.notes,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    requests.push(newRequest);
    localStorage.setItem('vacationRequests', JSON.stringify(requests));
    
    alert('✅ Solicitud de vacaciones enviada correctamente');
    setShowVacationForm(false);
    setVacationRequest({ startDate: '', endDate: '', notes: '' });
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const driverSchedule = schedule[user?.driverId] || {};

  const getCellColor = (cell) => {
    if (!cell) return 'bg-gray-100';
    
    switch (cell.type) {
      case 'work':
        return 'bg-green-100 border-green-300';
      case 'weekend':
        return 'bg-blue-100 border-blue-300';
      case 'vacation':
        return 'bg-yellow-100 border-yellow-300';
      case 'sick':
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100';
    }
  };

  const getCellValue = (cell) => {
    if (!cell) return '--';
    if (cell.type === 'vacation') return 'V';
    if (cell.type === 'sick') return 'Baja';
    if (cell.type === 'weekend') return 'FDS';
    return cell.value || 'T';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <img src="/ilunion-logo.svg" alt="ILUNION" className="h-10" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Panel de Conductor</h1>
                <p className="text-sm text-white/80">{driver?.name || user.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <CalendarIcon size={32} className="text-blue-600" />
              <div>
                <h3 className="font-bold text-lg">Mi Horario</h3>
                <p className="text-sm text-gray-600">Consulta tus días de trabajo</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowVacationForm(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6 hover:from-green-600 hover:to-green-700 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <Palmtree size={32} />
              <div>
                <h3 className="font-bold text-lg">Solicitar Vacaciones</h3>
                <p className="text-sm opacity-90">Enviar nueva solicitud</p>
              </div>
            </div>
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ← Anterior
              </button>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Siguiente →
              </button>
            </div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const cell = driverSchedule[day];
              return (
                <div
                  key={day}
                  className={`p-4 rounded-lg border-2 text-center ${getCellColor(cell)}`}
                >
                  <div className="font-bold text-lg mb-1">{day}</div>
                  <div className="text-xl font-bold">{getCellValue(cell)}</div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3">Leyenda:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
                <span>Trabajo (T)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded"></div>
                <span>Fin de Semana</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
                <span>Vacación (V)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded"></div>
                <span>Baja</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vacation Request Modal */}
      {showVacationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Solicitar Vacaciones</h3>
            
            <form onSubmit={handleVacationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={vacationRequest.startDate}
                  onChange={(e) => setVacationRequest({ ...vacationRequest, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={vacationRequest.endDate}
                  onChange={(e) => setVacationRequest({ ...vacationRequest, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={vacationRequest.notes}
                  onChange={(e) => setVacationRequest({ ...vacationRequest, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Añade cualquier información adicional..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowVacationForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
