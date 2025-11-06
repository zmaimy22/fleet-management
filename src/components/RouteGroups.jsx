import React, { useState, useEffect } from 'react';
import { Users, Route, Plus, Trash2, Save } from 'lucide-react';

export default function RouteGroups({ drivers, routes }) {
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    const saved = localStorage.getItem('routeGroups');
    if (saved) {
      try {
        setGroups(JSON.parse(saved));
      } catch (e) {
        setGroups([]);
      }
    }
  };

  const saveGroups = (newGroups) => {
    setGroups(newGroups);
    localStorage.setItem('routeGroups', JSON.stringify(newGroups));
  };

  const addGroup = () => {
    const newGroup = {
      id: Date.now(),
      name: 'Grupo Nuevo',
      routes: [],
      drivers: [],
      pattern: 'rotation' // rotation pattern
    };
    setEditingGroup(newGroup);
  };

  const saveGroup = () => {
    if (!editingGroup) return;
    
    if (editingGroup.routes.length < 2) {
      alert('⚠️ Selecciona al menos 2 rutas');
      return;
    }
    
    if (editingGroup.drivers.length < 3) {
      alert('⚠️ Selecciona exactamente 3 conductores');
      return;
    }

    const existingIndex = groups.findIndex(g => g.id === editingGroup.id);
    let newGroups;
    
    if (existingIndex >= 0) {
      newGroups = [...groups];
      newGroups[existingIndex] = editingGroup;
    } else {
      newGroups = [...groups, editingGroup];
    }
    
    saveGroups(newGroups);
    setEditingGroup(null);
  };

  const deleteGroup = (groupId) => {
    if (confirm('¿Eliminar este grupo?')) {
      const newGroups = groups.filter(g => g.id !== groupId);
      saveGroups(newGroups);
    }
  };

  const toggleRoute = (routeCode) => {
    setEditingGroup({
      ...editingGroup,
      routes: editingGroup.routes.includes(routeCode)
        ? editingGroup.routes.filter(r => r !== routeCode)
        : [...editingGroup.routes, routeCode]
    });
  };

  const toggleDriver = (driverId) => {
    setEditingGroup({
      ...editingGroup,
      drivers: editingGroup.drivers.includes(driverId)
        ? editingGroup.drivers.filter(d => d !== driverId)
        : [...editingGroup.drivers, driverId]
    });
  };

  // Only show drivers that are not loaders
  const availableDrivers = drivers.filter(d => d.type === 'driver');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Grupos de Rutas</h2>
          <p className="text-sm text-gray-600 mt-1">Sistema de rotación 4/2 para grupos específicos</p>
        </div>
        <button
          onClick={addGroup}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Nuevo Grupo</span>
        </button>
      </div>

      {/* Existing Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg text-gray-800">{group.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingGroup(group)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteGroup(group.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Rutas:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {group.routes.map(r => (
                    <span key={r} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Conductores:</span>
                <div className="text-xs text-gray-700 mt-1">
                  {group.drivers.map(dId => {
                    const driver = drivers.find(d => d.id === dId);
                    return driver ? <div key={dId}>• {driver.name}</div> : null;
                  })}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <span className="text-xs text-gray-500">
                  🔄 Rotación 4/2 - Siempre 2 trabajan, 1 descansa
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {groups.find(g => g.id === editingGroup.id) ? 'Editar Grupo' : 'Nuevo Grupo'}
              </h3>

              {/* Group Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Grupo
                </label>
                <input
                  type="text"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ejemplo: Grupo R1-R2"
                />
              </div>

              {/* Routes Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rutas (mínimo 2) *
                </label>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {routes.map(routeCode => (
                    <button
                      key={routeCode}
                      onClick={() => toggleRoute(routeCode)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        editingGroup.routes.includes(routeCode)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {routeCode}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Seleccionadas: {editingGroup.routes.length} rutas
                </p>
              </div>

              {/* Drivers Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conductores (exactamente 3) *
                </label>
                <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                  <div className="space-y-1">
                    {availableDrivers.map(driver => (
                      <button
                        key={driver.id}
                        onClick={() => toggleDriver(driver.id)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          editingGroup.drivers.includes(driver.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {driver.name}
                        {editingGroup.drivers.includes(driver.id) && ' ✓'}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Seleccionados: {editingGroup.drivers.length} conductores
                </p>
              </div>

              {/* Pattern Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">🔄 Patrón de Rotación 4/2</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Siempre 2 conductores trabajan (cubren las rutas)</li>
                  <li>• Siempre 1 conductor descansa (2 días consecutivos)</li>
                  <li>• Los 3 conductores rotan automáticamente</li>
                  <li>• Se respetan las vacaciones aprobadas</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveGroup}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save size={18} />
                  <span>Guardar Grupo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {groups.length === 0 && !editingGroup && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Route size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay grupos configurados
          </h3>
          <p className="text-gray-600 mb-4">
            Crea grupos para aplicar rotación automática 4/2 en rutas específicas
          </p>
          <button
            onClick={addGroup}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Crear Primer Grupo</span>
          </button>
        </div>
      )}
    </div>
  );
}
