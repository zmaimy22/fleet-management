import React from 'react';
import { Users, Truck, Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const Stats = ({ drivers, schedule }) => {
  // Calculate statistics
  const totalDrivers = drivers.filter(d => d.type === 'driver').length;
  const totalLoaders = drivers.filter(d => d.type === 'loader').length;
  const totalSupervisors = drivers.filter(d => d.type === 'supervisor').length;
  
  const stats = [
    {
      title: 'Total de Conductores',
      value: totalDrivers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Cargadores',
      value: totalLoaders,
      icon: Truck,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    {
      title: 'Supervisores',
      value: totalSupervisors,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Días de Trabajo',
      value: 22,
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Vacaciones Anuales',
      value: 15,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Bajas por Enfermedad',
      value: 8,
      icon: AlertCircle,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Rutas Activas',
      value: 11,
      icon: CheckCircle,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-600'
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Estadísticas</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-2">{stat.title}</p>
                  <p className="text-4xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-full ${stat.bgColor}`}>
                  <Icon className={stat.textColor} size={32} />
                </div>
              </div>
              <div className={`mt-4 h-2 rounded-full bg-gradient-to-r ${stat.color}`}></div>
            </div>
          );
        })}
      </div>
      
      {/* Monthly Overview */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen de Noviembre</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <span className="text-gray-700">Días Totales del Mes</span>
            <span className="font-bold text-blue-600">30</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <span className="text-gray-700">Días Laborables</span>
            <span className="font-bold text-green-600">22</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <span className="text-gray-700">Fines de Semana</span>
            <span className="font-bold text-red-600">8</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
