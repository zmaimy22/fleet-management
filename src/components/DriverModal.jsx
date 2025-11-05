import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useRoutes } from '../hooks/useRoutes';
import { useLanguage } from '../hooks/useLanguage.jsx';

const DriverModal = ({ isOpen, onClose, driver, onSave }) => {
  const { t } = useLanguage();
  const { routeCodes } = useRoutes();
  const [formData, setFormData] = useState({
    name: '',
    type: 'driver',
    routeType: 'single', // single, double, multiple
    assignedRoute: '', // for single route type
    availableRoutes: [] // for double and multiple types
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || '',
        type: driver.type || 'driver',
        routeType: driver.routeType || 'single',
        assignedRoute: driver.assignedRoute || '',
        availableRoutes: driver.availableRoutes || []
      });
    } else {
      setFormData({ name: '', type: 'driver', routeType: 'single', assignedRoute: '', availableRoutes: [] });
    }
  }, [driver, isOpen]);

  if (!isOpen) return null;

  const handleRouteToggle = (routeCode) => {
    const newRoutes = formData.availableRoutes.includes(routeCode)
      ? formData.availableRoutes.filter(r => r !== routeCode)
      : [...formData.availableRoutes, routeCode];
    setFormData({ ...formData, availableRoutes: newRoutes });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert(t('pleaseEnterName'));
      return;
    }
    
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
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
            </select>
          </div>

          {formData.type === 'driver' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('routeType')}
                </label>
                <select
                  value={formData.routeType}
                  onChange={(e) => setFormData({ ...formData, routeType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">{t('singleFixedRoute')}</option>
                  <option value="double">{t('twoRoutesOption')}</option>
                  <option value="multiple">{t('multipleRoutesOption')}</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.routeType === 'single' && t('worksAlways')}
                  {formData.routeType === 'double' && t('worksTwoRoutes')}
                  {formData.routeType === 'multiple' && t('worksMultiple')}
                </p>
              </div>

              {formData.routeType === 'single' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('assignedRoute')}
                  </label>
                  <select
                    value={formData.assignedRoute}
                    onChange={(e) => setFormData({ ...formData, assignedRoute: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('selectRoute')}</option>
                    {routeCodes.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              )}

              {(formData.routeType === 'double' || formData.routeType === 'multiple') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('availableRoutes')}
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {routeCodes.map(code => (
                        <label key={code} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.availableRoutes.includes(code)}
                            onChange={() => handleRouteToggle(code)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm">{code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('selected')}: {formData.availableRoutes.length} {t('routes')}
                  </p>
                </div>
              )}
            </>
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
