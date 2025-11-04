import React from 'react';
import { Truck, Users, Calendar, BarChart3, Settings, Globe, CheckCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { language, changeLanguage, t } = useLanguage();
  
  const tabs = [
    { id: 'calendar', name: t('calendar'), icon: Calendar },
    { id: 'coverage', name: 'Cobertura', icon: CheckCircle },
    { id: 'drivers', name: t('drivers'), icon: Users },
    { id: 'routes', name: t('routes'), icon: Truck },
    { id: 'stats', name: t('stats'), icon: BarChart3 },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <img src="/ilunion-logo.svg" alt="ILUNION" className="h-12 w-auto" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sistema de Gestión de Flotas</h1>
              <p className="text-sm text-white/90">نظام إدارة الأسطول</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium hidden md:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="text-white" size={20} />
            <div className="flex gap-1 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => changeLanguage('es')}
                className={`px-3 py-1 rounded text-sm transition ${
                  language === 'es' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => changeLanguage('ar')}
                className={`px-3 py-1 rounded text-sm transition ${
                  language === 'ar' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
                }`}
              >
                AR
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded text-sm transition ${
                  language === 'en' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
