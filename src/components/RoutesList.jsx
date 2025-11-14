import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Navigation, RefreshCw } from 'lucide-react';
import { useRoutes } from '../hooks/useRoutes';
import { useDrivers } from '../hooks/useDrivers';
import RouteModal from './RouteModal';

const RoutesList = ({ readOnly = false }) => {
  const { routes, addRoute, updateRoute, updateRoutesBatch, deleteRoute, resetToDefaults } = useRoutes();
  const { drivers } = useDrivers();
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const handleAdd = () => {
    if (readOnly) return;
    setEditingRoute(null);
    setShowModal(true);
  };

  const handleEdit = (route) => {
    if (readOnly) return;
    setEditingRoute(route);
    setShowModal(true);
  };

  const handleSave = (routeData) => {
    if (readOnly) return;
    if (editingRoute) {
      const updates = [{ shortCode: editingRoute.shortCode, ...routeData }];
      if (routeData.assignmentMode === 'alternating_2x2' && routeData.alternatingLinkedRoute) {
        const linked = routes.find(r => r.shortCode === routeData.alternatingLinkedRoute);
        if (linked) {
          const p = routeData.primaryDriver ? parseInt(routeData.primaryDriver, 10) : (Array.isArray(routeData.assignedDrivers) ? routeData.assignedDrivers[0] : undefined);
          const s = routeData.secondaryDriver ? parseInt(routeData.secondaryDriver, 10) : (Array.isArray(routeData.assignedDrivers) ? routeData.assignedDrivers[1] : undefined);
          const swappedPair = [s, p].filter(v => v !== undefined);
          updates.push({
            shortCode: linked.shortCode,
            assignmentMode: 'alternating_2x2',
            assignedDrivers: swappedPair,
            primaryDriver: s !== undefined ? String(s) : (linked.primaryDriver || ''),
            secondaryDriver: p !== undefined ? String(p) : (linked.secondaryDriver || ''),
            alternatingLinkedRoute: editingRoute.shortCode,
            alternatingDriver: routeData.alternatingDriver || linked.alternatingDriver || ''
          });
        }
      }
      if (routeData.assignmentMode === 'loader_like' && routeData.loaderLinkedRoute) {
        const linked = routes.find(r => r.shortCode === routeData.loaderLinkedRoute);
        if (linked) {
          const trio = Array.isArray(routeData.assignedDrivers) && routeData.assignedDrivers.length >= 3
            ? routeData.assignedDrivers
            : [routeData.loaderDriver1, routeData.loaderDriver2, routeData.loaderDriver3].filter(Boolean).map(id => parseInt(id, 10));
          updates.push({
            shortCode: linked.shortCode,
            assignmentMode: 'loader_like',
            assignedDrivers: trio,
            loaderLinkedRoute: editingRoute.shortCode
          });
        }
      }
      updateRoutesBatch(updates);
    } else {
      addRoute(routeData);
    }
  };

  const handleDelete = (route) => {
    if (readOnly) return;
    if (confirm(`¿Eliminar la ruta ${route.shortCode}?`)) {
      deleteRoute(route.shortCode);
    }
  };

  const handleReset = () => {
    if (readOnly) return;
    if (confirm('¿Restablecer todas las rutas a los valores predeterminados?')) {
      resetToDefaults();
      alert('Rutas restablecidas');
    }
  };

  const openInMaps = (lat, lng, clientName) => {
    if (lat && lng) {
      // Detect iOS/Mac devices
      const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
      
      if (isApple) {
        // Open Apple Maps
        window.open(`http://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(clientName)}`, '_blank');
      } else {
        // Open Google Maps
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
      }
    } else {
      alert(`GPS no disponible para ${clientName}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rutas ({routes.length})</h2>
        {!readOnly && (
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
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {routes.map((route) => (
          <div
            key={route.shortCode}
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
              {!readOnly && (
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
              )}
            </div>
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Clientes:</p>
              <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                {route.clients.map((client, i) => {
                  const hasGps = route.gps && route.gps[i] && route.gps[i].lat && route.gps[i].lng;
                  return (
                    <div key={i} className="flex items-center gap-0.5">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded whitespace-nowrap text-center flex-1 min-w-0">
                        {client}
                      </span>
                      {hasGps ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openInMaps(route.gps[i].lat, route.gps[i].lng, client);
                          }}
                          className="p-0.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex-shrink-0"
                          title={`Ver ${client} en Google Maps`}
                          type="button"
                        >
                          <MapPin size={12} />
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
            {!readOnly && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Conductores asignados:</p>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    const toDisplayIds = [];
                    if (route.assignmentMode === 'alternating_2x2') {
                      const primary = route.primaryDriver || (Array.isArray(route.assignedDrivers) ? route.assignedDrivers[0] : null);
                      const alt = route.alternatingDriver || null;
                      if (primary) toDisplayIds.push(primary);
                      if (alt) toDisplayIds.push(alt);
                    } else if (route.assignmentMode === 'loader_like') {
                      if (Array.isArray(route.assignedDrivers)) {
                        toDisplayIds.push(...route.assignedDrivers.slice(0, 3));
                      }
                    } else {
                      if (route.shortCode === 'R9') {
                        const primary = route.primaryDriver || (Array.isArray(route.assignedDrivers) ? route.assignedDrivers[0] : null);
                        if (primary) toDisplayIds.push(primary);
                      } else {
                        if (Array.isArray(route.assignedDrivers)) toDisplayIds.push(...route.assignedDrivers);
                      }
                    }
                    const uniqIds = Array.from(new Set(toDisplayIds.map(String)));
                    return uniqIds
                      .map(idStr => {
                        const d = drivers.find(dr => String(dr.id) === idStr);
                        return { id: idStr, name: d ? d.name : `ID ${idStr}` };
                      })
                      .sort((a,b)=> (a.name||'').localeCompare(b.name||'', 'es', { sensitivity: 'base' }))
                      .map(({id, name}) => (
                        <span key={id} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                          {name}
                        </span>
                      ));
                  })()}
                </div>
              </div>
            )}
            {route.assignmentMode && (
              <div className="mt-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Modo: {route.assignmentMode === 'loader_like' ? 'Tipo Cargadores' : route.assignmentMode === 'alternating_2x2' ? 'Alternancia 2x2' : 'Por defecto'}
                </span>
              </div>
            )}
            {route.assignmentMode === 'alternating_2x2' && (
              <div className="mt-1 text-xs text-gray-600">
                {route.alternatingLinkedRoute && (
                  <span className="mr-2">Y: {route.alternatingLinkedRoute}</span>
                )}
                {route.alternatingDriver && (
                  <span>
                    Alternante: {(() => {
                      const d = drivers.find(dr => String(dr.id) === String(route.alternatingDriver));
                      return d ? d.name : route.alternatingDriver;
                    })()}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!readOnly && (
        <RouteModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          route={editingRoute}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default RoutesList;
