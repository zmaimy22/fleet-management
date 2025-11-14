/**
 * Import Calendar Modal Component
 * 
 * واجهة لاستيراد ملف Excel وتحويله إلى Groups
 */

import React, { useState } from 'react';
import { Upload, FileUp, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { importAndProcessCalendar } from '../utils/importExcelCalendar';
import { parseCalendarAndGenerateGroups, validateParsedData } from '../utils/parseCalendarData';
import { saveRouteGroups } from '../utils/api';

export default function ImportCalendarModal({ isOpen, onClose, onSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setProgress('Reading Excel file...');
    setError(null);

    try {
      // Step 1: Import Excel file
      setProgress('📖 Reading Excel file...');
      const calendarData = await importAndProcessCalendar(selectedFile);
      console.log('Imported calendar data:', calendarData);

      // Step 2: Parse and generate groups
      setProgress('🔍 Parsing calendar data...');
      const parseResult = parseCalendarAndGenerateGroups(
        calendarData.calendarData,
        calendarData.driverNames
      );
      console.log('Parsed result:', parseResult);

      // Step 3: Validate
      setProgress('✓ Validating data...');
      const validation = validateParsedData(parseResult);
      if (!validation.valid) {
        console.warn('Validation warnings:', validation.issues);
      }

      // Step 4: Save groups to API
      setProgress('💾 Saving groups to system...');
      await saveRouteGroups(parseResult.groups);

      // Step 5: Success
      setProgress('✅ Done! Groups created successfully');
      setResult({
        success: true,
        summary: parseResult.summary,
        groups: parseResult.groups,
        message: `Created ${parseResult.groups.length} groups from calendar`
      });

      // Call success callback
      if (onSuccess) {
        onSuccess(parseResult.groups);
      }

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
      setProgress('');
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Escape key to close modal
  React.useEffect(() => {
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

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Upload size={28} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            Importar Calendario de Excel
          </h2>
        </div>

        {/* File Selection */}
        {!result && (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Instrucciones:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Exporta tu calendario de Excel</li>
                <li>Asegúrate que tenga nombres de conductores en la primera columna</li>
                <li>Los días deben estar en las columnas (1-30 o 1-31)</li>
                <li>Las rutas deben estar en formato: R1, R2, R1.1, etc.</li>
              </ol>
            </div>

            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={loading}
                className="hidden"
                id="excel-input"
              />

              <label
                htmlFor="excel-input"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileUp size={48} className="text-gray-400" />
                <span className="font-semibold text-gray-700">
                  {selectedFile ? '✓ ' + selectedFile.name : 'Click para seleccionar archivo Excel'}
                </span>
                <span className="text-sm text-gray-500">
                  o arrastra el archivo aquí
                </span>
              </label>
            </div>

            {/* Progress */}
            {progress && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader size={20} className="animate-spin text-blue-600" />
                  <span className="text-sm text-gray-700">{progress}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                disabled={!selectedFile || loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                {loading ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </div>
        )}

        {/* Success Result */}
        {result?.success && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle size={48} className="text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-900 mb-2">¡Éxito!</h3>
              <p className="text-green-700 mb-4">{result.message}</p>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.summary.totalGroups}
                  </div>
                  <div className="text-xs text-gray-600">Grupos Creados</div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.summary.totalRoutes}
                  </div>
                  <div className="text-xs text-gray-600">Rutas</div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-2xl font-bold text-orange-600">
                    {result.summary.totalDrivers}
                  </div>
                  <div className="text-xs text-gray-600">Conductores</div>
                </div>
              </div>

              {/* Groups Preview */}
              <div className="bg-white rounded-lg p-4 max-h-48 overflow-y-auto text-left">
                <h4 className="font-semibold text-gray-700 mb-2">Grupos Generados:</h4>
                <ul className="space-y-2 text-sm">
                  {result.groups.slice(0, 5).map((group) => (
                    <li key={group.id} className="text-gray-600">
                      <span className="font-medium">• {group.name}</span>
                      <span className="text-xs text-gray-500"> ({group.routes.join(', ')})</span>
                    </li>
                  ))}
                  {result.groups.length > 5 && (
                    <li className="text-gray-500 text-xs italic">
                      ... y {result.groups.length - 5} grupos más
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
