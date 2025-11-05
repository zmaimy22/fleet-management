import React, { useState } from 'react';
import { Truck, Users, Calendar, BarChart3, Settings, Globe, CheckCircle, Palmtree, Menu, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage.jsx';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { language, changeLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const tabs = [
    { id: 'calendar', name: t('calendar'), icon: Calendar },
    { id: 'coverage', name: 'Cobertura', icon: CheckCircle },
    { id: 'vacations', name: t('vacationRequests'), icon: Palmtree },
    { id: 'drivers', name: t('drivers'), icon: Users },
    { id: 'routes', name: t('routes'), icon: Truck },
    { id: 'stats', name: t('stats'), icon: BarChart3 },
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
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="bg-white p-1 sm:p-2 rounded-lg shadow-md flex-shrink-0">
              <img src="/ilunion-logo.svg" alt="ILUNION" className="h-8 sm:h-12 w-auto" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold text-white truncate">Sistema de Gestión de Flotas</h1>
              <p className="text-xs sm:text-sm text-white/90 hidden sm:block">نظام إدارة الأسطول</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-2">
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Language Selector - Desktop */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
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
              
              {/* Language Selector - Mobile */}
              <div className="flex items-center gap-2 px-4 py-3 mt-2 border-t border-white/20">
                <Globe className="text-white" size={20} />
                <div className="flex gap-2 flex-1">
                  <button
                    onClick={() => changeLanguage('es')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${
                      language === 'es' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    Español
                  </button>
                  <button
                    onClick={() => changeLanguage('ar')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${
                      language === 'ar' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${
                      language === 'en' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
