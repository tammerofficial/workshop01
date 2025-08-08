import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isRTL } = useLanguage();
  const { isDark } = useTheme();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div 
      className={`flex h-screen transition-colors duration-300`}
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ 
          marginLeft: !isRTL && sidebarOpen ? '16rem' : !isRTL ? '5rem' : '0',
          marginRight: isRTL && sidebarOpen ? '16rem' : isRTL ? '5rem' : '0',
          transition: 'margin 0.3s ease-in-out' 
        }}
      >
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <main className={`flex-1 overflow-y-auto p-6 transition-colors duration-300`}
          style={{
            backgroundColor: 'var(--bg-primary)'
          }}>
          <Outlet />
        </main>
        <footer className={`py-4 px-6 text-center border-t transition-colors duration-300`}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-secondary)'
          }}>
          <p className="text-sm">created by tammer <span className="text-red-500">❤</span></p>
        </footer>
      </motion.div>
    </div>
  );
};

export default Layout;