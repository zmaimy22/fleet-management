import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Copy } from 'lucide-react';
import { useRoutes } from '../hooks/useRoutes';
import { useLanguage } from '../hooks/useLanguage.jsx';

const CellEditModal = ({ isOpen, onClose, driver, day, cellData, onSave }) => {
  const { t } = useLanguage();
  const { routeCodes } = useRoutes();
  const [type, setType] = useState(cellData?.type || 'work');
  const [value, setValue] = useState(cellData?.value || '');
  const [customValue, setCustomValue] = useState(false);

  useEffect(() => {
    if (cellData) {
      setType(cellData.type);
      setValue(cellData.value);
    }
  }, [cellData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(driver, day, { type, value });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            Editar Horario
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
              Conductor
            </label>
            <input
              type="text"
              value={driver?.name || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día
            </label>
            <input
              type="text"
              value={`November ${day}, 2024`}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="work">Trabajo</option>
              <option value="weekend">Fin de Semana</option>
              <option value="vacation">Vacación</option>
              <option value="sick">Baja por Enfermedad</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Valor
              </label>
              {type === 'work' && (
                <button
                  onClick={() => setCustomValue(!customValue)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {customValue ? '📋 Lista' : '✏️ Manual'}
                </button>
              )}
            </div>
            
            {type === 'work' && !customValue ? (
              driver?.type === 'loader' ? (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="CT">CT - Mañana</option>
                  <option value="CM">CM - Tarde</option>
                  <option value="CP/dt">CP/dt - Descanso</option>
                  <option value="GT">GT - Gran Turismo</option>
                  <option value="P">P - Particular</option>
                </select>
              ) : (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar ruta</option>
                  {routeCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
              )
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  type === 'vacation' ? 'V' : 
                  type === 'sick' ? 'Baja' : 
                  type === 'work' ? 'R1, R2, etc.' : 
                  ''
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2 font-medium">⚡ Acciones rápidas:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {setType('weekend'); setValue('');}}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition"
              >
                🔴 Weekend
              </button>
              <button
                onClick={() => {setType('vacation'); setValue('V');}}
                className="px-3 py-1 bg-yellow-400 text-gray-900 text-xs rounded hover:bg-yellow-500 transition"
              >
                🟡 Vacación (V)
              </button>
              <button
                onClick={() => {setType('sick'); setValue('Baja');}}
                className="px-3 py-1 bg-yellow-300 text-gray-900 text-xs rounded hover:bg-yellow-400 transition"
              >
                🟡 Baja
              </button>
              {driver?.type === 'loader' && (
                <>
                  <button
                    onClick={() => {setType('work'); setValue('CT');}}
                    className="px-3 py-1 bg-orange-400 text-white text-xs rounded hover:bg-orange-500 transition"
                  >
                    CT
                  </button>
                  <button
                    onClick={() => {setType('work'); setValue('CM');}}
                    className="px-3 py-1 bg-orange-400 text-white text-xs rounded hover:bg-orange-500 transition"
                  >
                    CM
                  </button>
                  <button
                    onClick={() => {setType('work'); setValue('GT');}}
                    className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition"
                  >
                    GT
                  </button>
                  <button
                    onClick={() => {setType('work'); setValue('P');}}
                    className="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 transition"
                  >
                    P
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => {setValue(''); setType('work');}}
            className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
            title="Limpiar"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 transition shadow-lg"
          >
            <Save size={20} />
            <span>💾 Guardar</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CellEditModal;
