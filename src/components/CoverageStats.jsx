import React, { useMemo } from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useRoutes } from '../hooks/useRoutes';

const CoverageStats = ({ drivers, schedule, currentMonth, currentYear }) => {
  const { routeCodes } = useRoutes();
  const [selectedDay, setSelectedDay] = React.useState(null);
  const monthNamesES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const days = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get total routes from routeCodes
  const totalRoutes = routeCodes.length;
  
  // Calculate coverage for each day
  const dailyCoverage = useMemo(() => {
    const coverage = [];
    
    for (let day = 1; day <= days; day++) {
      const assignedRoutes = new Set();
      
      // Count unique routes assigned to drivers on this day
      drivers.forEach(driver => {
        if (driver.type === 'driver') {
          const cellData = schedule[driver.id]?.[day];
          if (cellData && cellData.type === 'work' && cellData.value) {
            // Only count actual route codes, not CT/CM/GT/P
            if (routeCodes.includes(cellData.value)) {
              assignedRoutes.add(cellData.value);
            }
          }
        }
      });
      
      const coveredRoutes = assignedRoutes.size;
      const percentage = totalRoutes > 0 ? Math.round((coveredRoutes / totalRoutes) * 100) : 0;
      
      coverage.push({
        day,
        covered: coveredRoutes,
        total: totalRoutes,
        percentage,
        status: percentage === 100 ? 'complete' : percentage > 0 ? 'partial' : 'empty'
      });
    }
    
    return coverage;
  }, [drivers, schedule, days, totalRoutes, routeCodes]);
  
  // Calculate overall statistics
  const stats = useMemo(() => {
    const complete = dailyCoverage.filter(d => d.status === 'complete').length;
    const partial = dailyCoverage.filter(d => d.status === 'partial').length;
    const empty = dailyCoverage.filter(d => d.status === 'empty').length;
    const totalCoverage = Math.round(
      dailyCoverage.reduce((sum, d) => sum + d.percentage, 0) / days
    );
    
    return { complete, partial, empty, totalCoverage };
  }, [dailyCoverage, days]);
  
  // Get color for day based on coverage
  const getDayColor = (percentage) => {
    if (percentage === 100) return 'bg-green-200 border-green-400 text-green-900';
    if (percentage >= 50) return 'bg-orange-200 border-orange-400 text-orange-900';
    if (percentage > 0) return 'bg-orange-300 border-orange-500 text-orange-900';
    return 'bg-red-200 border-red-400 text-red-900';
  };
  
  // Get day details
  const getDayDetails = (day) => {
    const assignedRoutes = new Set();
    const routeAssignments = {};
    
    drivers.forEach(driver => {
      if (driver.type === 'driver') {
        const cellData = schedule[driver.id]?.[day];
        if (cellData && cellData.type === 'work' && cellData.value) {
          if (routeCodes.includes(cellData.value)) {
            assignedRoutes.add(cellData.value);
            routeAssignments[cellData.value] = driver.name;
          }
        }
      }
    });
    
    const covered = Array.from(assignedRoutes);
    const uncovered = routeCodes.filter(route => !assignedRoutes.has(route));
    
    return { covered, uncovered, routeAssignments };
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Cobertura Total / التغطية الكلية</p>
              <p className="text-4xl font-bold text-blue-600">{stats.totalCoverage}%</p>
              <p className="text-xs text-gray-500 mt-1">{totalRoutes} rutas / مسار</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircle size={32} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Días Completos / أيام كاملة</p>
              <p className="text-4xl font-bold text-green-600">{stats.complete}</p>
              <p className="text-xs text-gray-500 mt-1">100%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle size={32} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Días Parciales / أيام جزئية</p>
              <p className="text-4xl font-bold text-orange-600">{stats.partial}</p>
              <p className="text-xs text-gray-500 mt-1">1-99%</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock size={32} className="text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Días Sin Cubrir / أيام فارغة</p>
              <p className="text-4xl font-bold text-red-600">{stats.empty}</p>
              <p className="text-xs text-gray-500 mt-1">0%</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle size={32} className="text-red-600" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Daily Coverage Calendar */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Cobertura Diaria - {monthNamesES[currentMonth]} {currentYear}
          <span className="text-lg text-gray-600 mr-2">/ التغطية اليومية</span>
        </h2>
        
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {dailyCoverage.map(({ day, covered, total, percentage, status }) => (
            <div
              key={day}
              className={`rounded-xl p-4 border-2 transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer ${getDayColor(percentage)} ${selectedDay === day ? 'ring-4 ring-blue-500 scale-110' : ''}`}
              title={`Día ${day}: ${covered}/${total} rutas cubiertas (${percentage}%)`}
              onClick={() => setSelectedDay(day)}
            >
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">{day}</p>
                <p className="text-sm font-bold">{percentage}%</p>
                <p className="text-xs font-semibold mt-1">{covered}/{total}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Leyenda / المفتاح / Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-200 border-2 border-green-400 rounded"></div>
            <span className="text-sm">100% Completo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-200 border-2 border-orange-400 rounded"></div>
            <span className="text-sm">50-99% Parcial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-300 border-2 border-orange-500 rounded"></div>
            <span className="text-sm">1-49% Parcial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-200 border-2 border-red-400 rounded"></div>
            <span className="text-sm">0% Sin Cubrir</span>
          </div>
        </div>
      </div>
      
      {/* Day Details Panel */}
      {selectedDay && (
        <div className="bg-white rounded-xl p-6 shadow-2xl border-2 border-blue-300 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              Detalles del día {selectedDay} de {monthNamesES[currentMonth]}
              <span className="text-lg text-gray-600 mr-2"> / تفاصيل يوم {selectedDay}</span>
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-gray-500 hover:text-red-600 transition-colors text-2xl font-bold"
            >
              ✕
            </button>
          </div>
          
          {(() => {
            const { covered, uncovered, routeAssignments } = getDayDetails(selectedDay);
            
            return (
              <div className="space-y-6">
                {/* Uncovered Routes */}
                {uncovered.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                      ⚠️ Turnos Sin Cubrir / مسارات غير مغطاة ({uncovered.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {uncovered.map(route => (
                        <div
                          key={route}
                          className="px-4 py-2 bg-red-200 text-red-900 rounded-lg font-bold border-2 border-red-300"
                        >
                          {route}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Covered Routes */}
                <div>
                  <h4 className="text-lg font-bold text-green-700 mb-3">
                    Turnos Cubiertos / مسارات مغطاة ({covered.length}/{totalRoutes})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {routeCodes.map(route => {
                      const isCovered = covered.includes(route);
                      const driverName = routeAssignments[route];
                      
                      return (
                        <div
                          key={route}
                          className={`p-3 rounded-lg font-bold text-center transition-all ${
                            isCovered
                              ? 'bg-green-200 text-green-900 border-2 border-green-400'
                              : 'bg-gray-200 text-gray-500 border-2 border-gray-300'
                          }`}
                          title={isCovered ? `Conductor: ${driverName}` : 'Sin asignar'}
                        >
                          <p className="text-lg">{route}</p>
                          {isCovered && driverName && (
                            <p className="text-xs mt-1 truncate">{driverName}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CoverageStats;
