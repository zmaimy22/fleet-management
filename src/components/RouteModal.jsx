import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
// duplicate import removed
import { useRoutes } from '../hooks/useRoutes';
import { useDrivers } from '../hooks/useDrivers';

const RouteModal = ({ isOpen, onClose, route, onSave }) => {
  const { drivers } = useDrivers();
  const { routes, routeCodes } = useRoutes();
  const [gpsInput, setGpsInput] = useState('');
  const [formData, setFormData] = useState({
    shortCode: '',
    plate: '',
    clients: [''],
    gps: [{ lat: '', lng: '' }],
    assignedDrivers: [],
    assignmentMode: '',
    alternatingLinkedRoute: '',
    alternatingDriver: '',
    primaryDriver: '',
    secondaryDriver: '',
    loaderDriver1: '',
    loaderDriver2: '',
    loaderDriver3: '',
    loaderLinkedRoute: ''
  });

  useEffect(() => {
    if (route) {
      const inferredMode = route.assignmentMode || (
        Array.isArray(route.assignedDrivers)
          ? (route.assignedDrivers.length >= 3
              ? 'loader_like'
              : (route.assignedDrivers.length === 2 ? 'alternating_2x2' : ''))
          : ''
      );
      const ad = Array.isArray(route.assignedDrivers) ? route.assignedDrivers : [];
      const str = (v) => (v !== undefined && v !== null ? String(v) : '');
      const primaryFromAD = ad.length >= 1 ? str(ad[0]) : '';
      const secondaryFromAD = ad.length >= 2 ? str(ad[1]) : '';
      const loader1FromAD = ad.length >= 1 ? str(ad[0]) : '';
      const loader2FromAD = ad.length >= 2 ? str(ad[1]) : '';
      const loader3FromAD = ad.length >= 3 ? str(ad[2]) : '';
      setFormData({
        shortCode: route.shortCode || '',
        plate: route.plate || '',
        clients: route.clients?.length > 0 ? [...route.clients] : [''],
        gps: (Array.isArray(route.gps) && route.gps.length > 0)
          ? route.gps.map(g => ({ lat: g.lat || '', lng: g.lng || '' }))
          : (Array.isArray(route.clients) ? route.clients.map(() => ({ lat: '', lng: '' })) : [{ lat: '', lng: '' }]),
        assignedDrivers: Array.isArray(route.assignedDrivers) ? route.assignedDrivers : [],
        assignmentMode: inferredMode,
        alternatingLinkedRoute: route.alternatingLinkedRoute || '',
        alternatingDriver: route.alternatingDriver || '',
        primaryDriver: route.primaryDriver || ((inferredMode === 'alternating_2x2' || (route.shortCode === 'R9' && inferredMode === '')) ? primaryFromAD : ''),
        secondaryDriver: route.secondaryDriver || (inferredMode === 'alternating_2x2' ? secondaryFromAD : ''),
        loaderDriver1: route.loaderDriver1 || (inferredMode === 'loader_like' ? loader1FromAD : ''),
        loaderDriver2: route.loaderDriver2 || (inferredMode === 'loader_like' ? loader2FromAD : ''),
        loaderDriver3: route.loaderDriver3 || (inferredMode === 'loader_like' ? loader3FromAD : ''),
        loaderLinkedRoute: route.loaderLinkedRoute || ''
      });
    } else {
      setFormData({ shortCode: '', plate: '', clients: [''], gps: [{ lat: '', lng: '' }], assignedDrivers: [], assignmentMode: '', alternatingLinkedRoute: '', alternatingDriver: '', primaryDriver: '', secondaryDriver: '', loaderDriver1: '', loaderDriver2: '', loaderDriver3: '', loaderLinkedRoute: '' });
    }
  }, [route, isOpen]);

  // Build set of drivers used in other routes (exclude current and linked Y)
  const usedElsewhere = useMemo(() => {
    const used = new Set();
    routes.forEach(r => {
      if (r.shortCode === formData.shortCode) return;
      if (formData.alternatingLinkedRoute && r.shortCode === formData.alternatingLinkedRoute) return;
      if (formData.loaderLinkedRoute && r.shortCode === formData.loaderLinkedRoute) return;
      const addIf = (val) => { if (val !== undefined && val !== null && val !== '') used.add(String(val)); };
      if (Array.isArray(r.assignedDrivers)) r.assignedDrivers.forEach(id => addIf(id));
      addIf(r.alternatingDriver);
      addIf(r.primaryDriver);
      addIf(r.secondaryDriver);
      addIf(r.loaderDriver1);
      addIf(r.loaderDriver2);
      addIf(r.loaderDriver3);
    });
    return used;
  }, [routes, formData.shortCode, formData.alternatingLinkedRoute, formData.loaderLinkedRoute]);

  const candidateDrivers = (excludeIds = []) => {
    const exclude = new Set(excludeIds.map(x => String(x)));
    return drivers
      .filter(d => d.type === 'driver')
      .filter(d => !usedElsewhere.has(String(d.id)))
      .filter(d => !exclude.has(String(d.id)));
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClientChange = (index, value) => {
    const newClients = [...formData.clients];
    newClients[index] = value;
    setFormData({ ...formData, clients: newClients });
  };

  const handleGpsChange = (index, field, value) => {
    const newGps = [...formData.gps];
    newGps[index] = { ...newGps[index], [field]: value };
    setFormData({ ...formData, gps: newGps });
  };

  const handleImportGps = () => {
    if (!gpsInput.trim()) {
      alert('Por favor, pegue las coordenadas GPS');
      return;
    }

    // Parse GPS data - format: "lat, lng" per line
    const lines = gpsInput.trim().split('\n');
    const newGps = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length === 2) {
        return { lat: parts[0], lng: parts[1] };
      }
      return { lat: '', lng: '' };
    });

    if (newGps.length !== formData.clients.length) {
      if (!confirm(`Hay ${formData.clients.length} clientes pero ${newGps.length} coordenadas GPS. ¿Continuar?`)) {
        return;
      }
    }

    // Match GPS to existing clients or adjust client count
    const updatedGps = [...formData.gps];
    for (let i = 0; i < Math.min(newGps.length, updatedGps.length); i++) {
      updatedGps[i] = newGps[i];
    }

    setFormData({ ...formData, gps: updatedGps });
    setGpsInput('');
    alert(`${Math.min(newGps.length, formData.clients.length)} coordenadas GPS importadas`);
  };

  const openInMaps = (lat, lng) => {
    if (lat && lng) {
      // Detect iOS/Mac devices
      const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
      
      if (isApple) {
        // Open Apple Maps
        window.open(`http://maps.apple.com/?ll=${lat},${lng}`, '_blank');
      } else {
        // Open Google Maps
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
      }
    } else {
      alert('GPS no disponible para este cliente');
    }
  };

  const searchLocationForClient = (index) => {
    const clientName = formData.clients[index];
    if (!clientName || clientName.trim() === '') {
      alert('Por favor, ingrese el nombre del cliente primero');
      return;
    }
    
    // Open Google Maps search in a new window
    const searchQuery = encodeURIComponent(clientName + ' Fuerteventura');
    window.open(`https://www.google.com/maps/search/${searchQuery}`, '_blank', 'width=800,height=600');
    
    // Show instructions
    alert(`Instrucciones:
1. Busca y selecciona la ubicación en Google Maps
2. Copia las coordenadas de la URL (ej: @28.995864,-13.489441)
3. Pega las coordenadas aquí cuando regreses`);
  };

  const addClient = () => {
    setFormData({ 
      ...formData, 
      clients: [...formData.clients, ''],
      gps: [...formData.gps, {lat: '', lng: ''}]
    });
  };

  const removeClient = (index) => {
    if (formData.clients.length > 1) {
      const newClients = formData.clients.filter((_, i) => i !== index);
      const newGps = formData.gps.filter((_, i) => i !== index);
      setFormData({ ...formData, clients: newClients, gps: newGps });
    }
  };


  const handleSave = () => {
    if (!formData.shortCode || !formData.plate) {
      alert('Por favor, complete el código de ruta y la matrícula');
      return;
    }
    const filteredClients = formData.clients.filter(c => c.trim() !== '');
    if (filteredClients.length === 0) {
      alert('Por favor, añada al menos un cliente');
      return;
    }
    
    const r9Assigned = (formData.shortCode === 'R9' && !formData.assignmentMode)
      ? [formData.primaryDriver].filter(Boolean).map(id => parseInt(id, 10))
      : null;

    onSave({
      code: `${formData.shortCode} ${formData.plate}`,
      shortCode: formData.shortCode,
      plate: formData.plate,
      clients: filteredClients,
      assignedDrivers: r9Assigned ?? ((formData.assignmentMode === 'alternating_2x2')
        ? [formData.primaryDriver, formData.secondaryDriver].filter(Boolean).map(id => parseInt(id, 10))
        : (formData.assignmentMode === 'loader_like'
          ? [formData.loaderDriver1, formData.loaderDriver2, formData.loaderDriver3].filter(Boolean).map(id => parseInt(id, 10))
          : formData.assignedDrivers)),
      assignmentMode: formData.assignmentMode,
      alternatingLinkedRoute: formData.alternatingLinkedRoute,
      alternatingDriver: formData.alternatingDriver,
      primaryDriver: formData.primaryDriver,
      secondaryDriver: formData.secondaryDriver,
      loaderDriver1: formData.loaderDriver1,
      loaderDriver2: formData.loaderDriver2,
      loaderDriver3: formData.loaderDriver3,
      loaderLinkedRoute: formData.loaderLinkedRoute
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {route ? 'Editar Ruta' : 'Añadir Ruta'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Ruta *
            </label>
            <input
              type="text"
              value={formData.shortCode}
              onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
              placeholder="Ejemplo: R1, R2.2, R14"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matrícula del Camión *
            </label>
            <input
              type="text"
              value={formData.plate}
              onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
              placeholder="Ejemplo: 2391MKG"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Clientes * (3 columnas)
              </label>
              <button
                onClick={addClient}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={16} />
                Añadir Cliente
              </button>
            </div>


            <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto p-3 border border-gray-200 rounded-xl bg-gray-50">
              {formData.clients.map((client, index) => (
                <div key={index} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={client}
                        onChange={(e) => handleClientChange(index, e.target.value)}
                        placeholder={`${index + 1}`}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      {formData.clients.length > 1 && (
                        <button
                          onClick={() => removeClient(index)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-red-600 hover:bg-red-50 rounded transition"
                          title="Eliminar"
                          type="button"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total: {formData.clients.length} cliente{formData.clients.length !== 1 ? 's' : ''}
            </p>
          </div>

          

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Modo de asignación</label>
            <select
              value={formData.assignmentMode}
              onChange={(e) => setFormData({ ...formData, assignmentMode: e.target.value })}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Por defecto</option>
              <option value="loader_like">Rotación tipo Cargadores (≥3 conductores)</option>
              <option value="alternating_2x2">Alternancia 2x2 (2 conductores)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Selecciona cómo se reparte la ruta entre los conductores asignados</p>
          </div>
          {formData.assignmentMode === 'alternating_2x2' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ruta vinculada (Y)</label>
                <select
                  value={formData.alternatingLinkedRoute}
                  onChange={(e) => setFormData({ ...formData, alternatingLinkedRoute: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona ruta</option>
                  {routeCodes.filter(code => !code.includes('.')).map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Ruta Y que alterna con esta ruta</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conductor alternante</label>
                <select
                  value={formData.alternatingDriver}
                  onChange={(e) => setFormData({ ...formData, alternatingDriver: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona conductor</option>
                  {candidateDrivers([formData.primaryDriver, formData.secondaryDriver]).map(d => (
                      <option key={d.id} value={String(d.id)}>{d.name}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Trabaja 2 días en X y 2 días en Y</p>
              </div>
            </div>
          )}
          {formData.assignmentMode === '' && formData.shortCode === 'R9' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conductor 1</label>
                <select
                  value={formData.primaryDriver}
                  onChange={(e) => setFormData({ ...formData, primaryDriver: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona conductor</option>
                  {drivers.filter(d => d.type === 'driver').map(d => (
                    <option key={d.id} value={String(d.id)}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {formData.assignmentMode === 'alternating_2x2' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conductor 1</label>
                <select
                  value={formData.primaryDriver}
                  onChange={(e) => setFormData({ ...formData, primaryDriver: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona conductor</option>
                {candidateDrivers([formData.secondaryDriver, formData.alternatingDriver]).map(d => (
                    <option key={d.id} value={String(d.id)}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conductor 2</label>
                <select
                  value={formData.secondaryDriver}
                  onChange={(e) => setFormData({ ...formData, secondaryDriver: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona conductor</option>
                {candidateDrivers([formData.primaryDriver, formData.alternatingDriver]).map(d => (
                    <option key={d.id} value={String(d.id)}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {formData.assignmentMode === 'loader_like' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conductor 1 (rotación)</label>
                <select
                  value={formData.loaderDriver1}
                  onChange={(e) => setFormData({ ...formData, loaderDriver1: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona conductor</option>
                  {candidateDrivers([formData.loaderDriver2, formData.loaderDriver3]).map(d => (
                      <option key={d.id} value={String(d.id)}>{d.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conductor 2 (rotación)</label>
                <select
                  value={formData.loaderDriver2}
                  onChange={(e) => setFormData({ ...formData, loaderDriver2: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona conductor</option>
                  {candidateDrivers([formData.loaderDriver1, formData.loaderDriver3]).map(d => (
                      <option key={d.id} value={String(d.id)}>{d.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conductor 3 (rotación)</label>
                <select
                  value={formData.loaderDriver3}
                  onChange={(e) => setFormData({ ...formData, loaderDriver3: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona conductor</option>
                  {candidateDrivers([formData.loaderDriver1, formData.loaderDriver2]).map(d => (
                      <option key={d.id} value={String(d.id)}>{d.name}</option>
                    ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ruta vinculada (Y)</label>
                <select
                  value={formData.loaderLinkedRoute}
                  onChange={(e) => setFormData({ ...formData, loaderLinkedRoute: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Selecciona ruta</option>
                  {routeCodes.filter(code => !code.includes('.')).map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {/* sección anterior de 'Conductores para este modo' تم حذفها */}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition shadow"
          >
            <Save size={20} />
            <span>Guardar</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteModal;
