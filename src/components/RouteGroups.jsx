import React, { useState, useEffect } from 'react';
import { Users, Route, Plus, Trash2, Save } from 'lucide-react';
import { getRouteGroups, saveRouteGroups } from '../utils/api';

export default function RouteGroups({ drivers, routes }) {
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const savedGroups = await getRouteGroups();
      if (savedGroups && Array.isArray(savedGroups)) {
        setGroups(savedGroups);
      }
    } catch (error) {
      console.error('Failed to load route groups from API:', error);
      // Fallback to localStorage
      const saved = localStorage.getItem('routeGroups');
      if (saved) {
        try {
          setGroups(JSON.parse(saved));
        } catch (e) {
          setGroups([]);
        }
      }
    }
  };

  const updateGroups = async (newGroups) => {
    setGroups(newGroups);
    try {
      await saveRouteGroups(newGroups);
    } catch (error) {
      console.error('Failed to save route groups to API:', error);
      // Fallback to localStorage
      localStorage.setItem('routeGroups', JSON.stringify(newGroups));
    }
  };

  const addGroup = () => {
    const newGroup = {
      id: Date.now(),
      name: 'Grupo Nuevo',
      routes: [],
      drivers: [],
      patternType: 'pattern1', // pattern1 or pattern2
      driverAssignments: {} // For pattern2: {routeCode: driverId}
    };
    setEditingGroup(newGroup);
  };

  const saveGroup = async () => {
    if (!editingGroup) return;
    
    if (editingGroup.routes.length < 2) {
      alert('⚠️ Selecciona al menos 2 rutas');
      return;
    }
    
    if (editingGroup.drivers.length < 3) {
      alert('⚠️ Selecciona exactamente 3 conductores');
      return;
    }

    // Pattern 2 validation: check driver assignments
    if (editingGroup.patternType === 'pattern2') {
      const assignedRoutes = Object.keys(editingGroup.driverAssignments || {});
      if (assignedRoutes.length !== editingGroup.routes.length) {
        alert('⚠️ Asigna un conductor principal a cada ruta');
        return;
      }
    }

    const existingIndex = groups.findIndex(g => g.id === editingGroup.id);
    let newGroups;
    
    if (existingIndex >= 0) {
      newGroups = [...groups];
      newGroups[existingIndex] = editingGroup;
    } else {
      newGroups = [...groups, editingGroup];
    }
    
    await updateGroups(newGroups);
    setEditingGroup(null); // Cierra el modal y permanece en la misma página
  };

  const deleteGroup = (groupId) => {
    if (confirm('¿Eliminar este grupo?')) {
      const newGroups = groups.filter(g => g.id !== groupId);
      updateGroups(newGroups);
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
                  {(group.routes || []).map(r => (
                    <span key={r} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Conductores:</span>
                <div className="text-xs text-gray-700 mt-1">
                  {(group.drivers || []).map(dId => {
                    const driver = drivers.find(d => d.id === dId);
                    return driver ? <div key={dId}>• {driver.name}</div> : null;
                  })}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  {group.patternType === 'pattern2' ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                      👨‍✈️ Patrón 2: Conductor Fijo
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                      🔄 Patrón 1: Rotación
                    </span>
                  )}
                </div>
                {group.patternType === 'pattern2' && group.driverAssignments && (
                  <div className="mt-2 text-xs text-gray-600">
                    {Object.entries(group.driverAssignments).map(([route, driverId]) => {
                      const driver = drivers.find(d => d.id === driverId);
                      return driver ? (
                        <div key={route}>• {route}: {driver.name}</div>
                      ) : null;
                    })}
                  </div>
                )}
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

              {/* Pattern Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Patrón *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setEditingGroup({ ...editingGroup, patternType: 'pattern1', driverAssignments: {} })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      editingGroup.patternType === 'pattern1'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-bold text-lg mb-2">
                      {editingGroup.patternType === 'pattern1' ? '✅' : '⭕'} Patrón 1
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>🔄 Rotación Simple</div>
                      <div className="mt-1">• 3 conductores</div>
                      <div>• 2 rutas cualquiera</div>
                      <div>• Siempre 2 trabajan</div>
                      <div>• Siempre 1 descansa</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setEditingGroup({ ...editingGroup, patternType: 'pattern2', driverAssignments: {} })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      editingGroup.patternType === 'pattern2'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-bold text-lg mb-2">
                      {editingGroup.patternType === 'pattern2' ? '✅' : '⭕'} Patrón 2
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>👨‍✈️ Con Conductor Fijo</div>
                      <div className="mt-1">• 3 conductores</div>
                      <div>• 2 rutas</div>
                      <div>• 2 conductores fijos</div>
                      <div>• 1 conductor backup</div>
                    </div>
                  </button>
                </div>
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

              {/* Pattern 2: Assign Primary Drivers */}
              {editingGroup.patternType === 'pattern2' && editingGroup.routes.length > 0 && editingGroup.drivers.length === 3 && (
                <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">👨‍✈️ Asignar Conductor Principal a cada Ruta</h4>
                  <div className="space-y-3">
                    {editingGroup.routes.map(routeCode => (
                      <div key={routeCode} className="bg-white rounded-lg p-3 border border-green-200">
                        <div className="font-medium text-gray-700 mb-2">Ruta {routeCode}:</div>
                        <select
                          value={editingGroup.driverAssignments[routeCode] || ''}
                          onChange={(e) => {
                            setEditingGroup({
                              ...editingGroup,
                              driverAssignments: {
                                ...editingGroup.driverAssignments,
                                [routeCode]: parseInt(e.target.value)
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Selecciona conductor principal...</option>
                          {editingGroup.drivers.map(driverId => {
                            const driver = drivers.find(d => d.id === driverId);
                            return driver ? (
                              <option key={driverId} value={driverId}>
                                {driver.name}
                              </option>
                            ) : null;
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-green-700 mt-3">
                    ℹ️ El conductor restante será el backup automático
                  </p>
                </div>
              )}

              {/* Pattern Info */}
              {editingGroup.patternType === 'pattern1' ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🔄 Patrón 1: Rotación Simple</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Siempre 2 conductores trabajan (cubren las rutas)</li>
                    <li>• Siempre 1 conductor descansa (2 días consecutivos)</li>
                    <li>• Los 3 conductores rotan automáticamente</li>
                    <li>• Se respetan las vacaciones aprobadas</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-900 mb-2">👨‍✈️ Patrón 2: Con Conductor Fijo</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Cada ruta tiene un conductor principal fijo</li>
                    <li>• El conductor principal trabaja 4 días y descansa 2</li>
                    <li>• El conductor backup cubre en días de descanso</li>
                    <li>• Siempre 2 rutas cubiertas, 1 conductor descansa</li>
                    <li>• Se respetan las vacaciones aprobadas</li>
                  </ul>
                </div>
              )}

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
