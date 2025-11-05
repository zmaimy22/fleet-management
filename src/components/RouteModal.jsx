import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const RouteModal = ({ isOpen, onClose, route, onSave }) => {
  const [formData, setFormData] = useState({
    shortCode: '',
    plate: '',
    clients: ['']
  });

  useEffect(() => {
    if (route) {
      setFormData({
        shortCode: route.shortCode || '',
        plate: route.plate || '',
        clients: route.clients?.length > 0 ? [...route.clients] : ['']
      });
    } else {
      setFormData({ shortCode: '', plate: '', clients: [''] });
    }
  }, [route, isOpen]);

  if (!isOpen) return null;

  const handleClientChange = (index, value) => {
    const newClients = [...formData.clients];
    newClients[index] = value;
    setFormData({ ...formData, clients: newClients });
  };

  const addClient = () => {
    setFormData({ ...formData, clients: [...formData.clients, ''] });
  };

  const removeClient = (index) => {
    if (formData.clients.length > 1) {
      const newClients = formData.clients.filter((_, i) => i !== index);
      setFormData({ ...formData, clients: newClients });
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
    
    onSave({
      code: `${formData.shortCode} ${formData.plate}`,
      shortCode: formData.shortCode,
      plate: formData.plate,
      clients: filteredClients
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Ruta *
            </label>
            <input
              type="text"
              value={formData.shortCode}
              onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
              placeholder="Ejemplo: R1, R2.2, R14"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Clientes * (3 columnas)
              </label>
              <button
                onClick={addClient}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} />
                Añadir Cliente
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
              {formData.clients.map((client, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => handleClientChange(index, e.target.value)}
                    placeholder={`${index + 1}`}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  {formData.clients.length > 1 && (
                    <button
                      onClick={() => removeClient(index)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-red-600 hover:bg-red-50 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total: {formData.clients.length} cliente{formData.clients.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            <Save size={20} />
            <span>حفظ / Save</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            إلغاء / Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteModal;
