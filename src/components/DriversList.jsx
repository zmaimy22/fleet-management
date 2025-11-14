import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, UserCircle } from 'lucide-react';
import { useDrivers } from '../hooks/useDrivers';
import { useLanguage } from '../hooks/useLanguage.jsx';
import DriverModal from './DriverModal';

const DriversList = () => {
  const { t } = useLanguage();
  const { drivers, addDriver, updateDriver, deleteDriver, resetToDefaults } = useDrivers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || driver.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAdd = () => {
    setEditingDriver(null);
    setShowModal(true);
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setShowModal(true);
  };

  const handleSave = (driverData) => {
    if (editingDriver) {
      updateDriver(editingDriver.id, driverData);
    } else {
      addDriver(driverData);
    }
  };

  const handleDelete = (driver) => {
    if (confirm(`${t('deleteConfirm')} ${driver.name}?`)) {
      deleteDriver(driver.id);
    }
  };

  const clearAllDriverRoutes = () => {
    if (!confirm('¿Borrar datos de rutas para todos los conductores?')) return;
    drivers.filter(d => d.type === 'driver').forEach(d => {
      updateDriver(d.id, {
        ...d,
        route: '',
        routeType: '',
        assignedRoute: '',
        availableRoutes: []
      });
    });
    alert('Se borraron rutas de todos los conductores');
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t('driversList')} ({drivers.length})</h2>
        <div className="flex gap-2">
          <button
            onClick={clearAllDriverRoutes}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            title="Borrar rutas de todos"
          >
            <Trash2 size={18} />
            <span>Limpiar rutas</span>
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={20} />
            <span>{t('addDriver')}</span>
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm transition ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('all')}
          </button>
          <button
            onClick={() => setFilterType('driver')}
            className={`px-4 py-2 rounded-lg text-sm transition ${filterType === 'driver' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('driverType')}
          </button>
          <button
            onClick={() => setFilterType('loader')}
            className={`px-4 py-2 rounded-lg text-sm transition ${filterType === 'loader' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('loaderType')}
          </button>
          <button
            onClick={() => setFilterType('supervisor')}
            className={`px-4 py-2 rounded-lg text-sm transition ${filterType === 'supervisor' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {t('supervisorType')}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={t('search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => (
          <div
            key={driver.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${
                  driver.type === 'driver' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                  driver.type === 'loader' ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  'bg-gradient-to-r from-green-600 to-teal-600'
                }`}>
                  <UserCircle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{driver.name}</h3>
                  <span className="text-sm text-gray-500 capitalize">
                    {driver.type === 'driver' ? t('driverType') : 
                     driver.type === 'loader' ? t('loaderType') : 
                     t('supervisorType')}
                  </span>
                  
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEdit(driver)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title={t('edit')}
                >
                  <Edit2 size={16} className="text-blue-600" />
                </button>
                <button 
                  onClick={() => handleDelete(driver)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title={t('delete')}
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredDrivers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <UserCircle size={64} className="mx-auto mb-4 text-gray-300" />
          <p>{t('noDriversFound')}</p>
        </div>
      )}

      <DriverModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        driver={editingDriver}
        onSave={handleSave}
      />
    </div>
  );
};

export default DriversList;
