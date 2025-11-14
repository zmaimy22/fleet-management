import React, { useState } from 'react';
import { Truck, Users, Calendar, BarChart3, Settings, CheckCircle, Palmtree, Menu, X, UserCog, LogOut } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

const Navbar = ({ activeTab, setActiveTab, onLogout, userName }) => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const tabs = [
    { id: 'calendar', name: t('calendar'), icon: Calendar },
    { id: 'vacations', name: t('vacationRequests'), icon: Palmtree },
    { id: 'users', name: 'Usuarios', icon: UserCog },
    { id: 'drivers', name: t('drivers'), icon: Users },
    { id: 'routes', name: t('routes'), icon: Truck },
    { id: 'cleaning', name: 'Limpieza', icon: CheckCircle },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-full mx-auto px-2 sm:px-4">
        {/* Desktop & Mobile Header */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse min-w-0">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-xl">🚛</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold text-white truncate">Planificación de Rutas</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-2 items-center">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium text-sm">{tab.name}</span>
                </button>
              );
            })}
            
            {/* Logout Button */}
            {onLogout && (
              <div className="ml-2 pl-2 border-l border-white/30">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition"
                  title="Cerrar Sesión"
                >
                  <LogOut size={18} />
                  <span className="font-medium text-sm hidden xl:inline">{userName}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 animate-fadeIn">
            <div className="flex flex-col gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
              
              {/* Mobile Logout */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/20 text-white hover:bg-red-500/30 transition border-t border-white/20 mt-2"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Cerrar Sesión ({userName})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
