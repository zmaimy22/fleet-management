import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

const DriverModal = ({ isOpen, onClose, driver, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    type: 'driver',
    category: '',
    originalCategory: '',
    supervisorRole: '', // 'jefe1' | 'segundo1' | 'segundo2' | 'segundo3'
    restDay1: '6',
    restDay2: '0'
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        type: driver.type || 'driver',
        category: driver.category || driver.originalCategory || '',
        originalCategory: driver.originalCategory || driver.category || '',
        supervisorRole: driver.supervisorRole || '',
        restDay1: driver.restDay1 || '6',
        restDay2: driver.restDay2 || '0'
      });
    } else {
      setFormData({ name: '', type: 'driver', category: '', originalCategory: '', supervisorRole: '', restDay1: '6', restDay2: '0' });
    }
  }, [driver, isOpen]);

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


  const handleSave = () => {
    if (!formData.name.trim()) {
      alert(t('pleaseEnterName'));
      return;
    }
    
    const driverData = {
      ...formData,
      route: ''
    };
    
    onSave(driverData);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {driver ? t('editDriver') : t('addDriver')}
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
              {t('fullName')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ejemplo: JUAN PÉREZ BENÍTEZ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {formData.type === 'supervisor' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primer Día de Descanso</label>
                <select
                  value={formData.restDay1}
                  onChange={(e) => setFormData({ ...formData, restDay1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Domingo</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segundo Día de Descanso</label>
                <select
                  value={formData.restDay2}
                  onChange={(e) => setFormData({ ...formData, restDay2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Domingo</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                </select>
              </div>
            </div>
          )}

          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('type')} *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="driver">{t('driverType')}</option>
              <option value="loader">{t('loaderType')}</option>
              <option value="supervisor">{t('supervisorType')}</option>
              <option value="ayudante">Ayudante</option>
            </select>
          </div>

          {formData.type === 'ayudante' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primer Día de Descanso
                </label>
                <select
                  value={formData.restDay1 || '6'}
                  onChange={(e) => setFormData({ ...formData, restDay1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Domingo</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segundo Día de Descanso
                </label>
                <select
                  value={formData.restDay2 || '0'}
                  onChange={(e) => setFormData({ ...formData, restDay2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">Domingo</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Estos dos días se repetirán como descanso cada semana
                </p>
              </div>
            </>
          )}

          

          {formData.type !== 'ayudante' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, originalCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin categoría (Libre)</option>
                <option value="lanzarote">Rutas a Lanzarote</option>
                <option value="local_morning">Rutas Locales Mañana</option>
                <option value="local_night">Rutas Locales Noche</option>
                <option value="supervisors">Encargados / Jefe de Logística</option>
                <option value="loaders">Cargadores</option>
                <option value="ayudante">Ayudante</option>
                <option value="jocker">Jocker</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            <Save size={20} />
            <span>{t('save')}</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {t('cancel')}
          </button>
      </div>
    </div>
    </div>
  );
};

export default DriverModal;
