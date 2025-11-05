import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Navigation, RefreshCw } from 'lucide-react';
import { useRoutes } from '../hooks/useRoutes';
import RouteModal from './RouteModal';

const RoutesList = () => {
  const { routes, addRoute, updateRoute, deleteRoute, resetToDefaults } = useRoutes();
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const handleAdd = () => {
    setEditingRoute(null);
    setShowModal(true);
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setShowModal(true);
  };

  const handleSave = (routeData) => {
    if (editingRoute) {
      updateRoute(editingRoute.shortCode, routeData);
    } else {
      addRoute(routeData);
    }
  };

  const handleDelete = (route) => {
    if (confirm(`¿Eliminar la ruta ${route.shortCode}?`)) {
      deleteRoute(route.shortCode);
    }
  };

  const handleReset = () => {
    if (confirm('¿Restablecer todas las rutas a los valores predeterminados?')) {
      resetToDefaults();
      alert('Rutas restablecidas');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rutas ({routes.length})</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
            title="Restablecer rutas"
          >
            <RefreshCw size={18} />
            <span className="hidden md:inline">Reset</span>
          </button>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={20} />
            <span>Añadir Ruta</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-3 rounded-full">
                  <Navigation className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{route.shortCode}</h3>
                  <span className="text-xs text-gray-500">{route.plate}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(route)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Editar"
                >
                  <Edit2 size={16} className="text-blue-600" />
                </button>
                <button 
                  onClick={() => handleDelete(route)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Eliminar"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Clientes:</p>
              <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                {route.clients.map((client, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded whitespace-nowrap text-center">
                    {client}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <RouteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        route={editingRoute}
        onSave={handleSave}
      />
    </div>
  );
};

export default RoutesList;
