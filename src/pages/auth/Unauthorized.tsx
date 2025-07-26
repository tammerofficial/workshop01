import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, Home, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { logout } = useAuth();

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full space-y-8 p-8 rounded-lg shadow-sm transition-colors duration-300 ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
            <ShieldOff size={40} className="text-red-600" />
          </div>
          <h2 className={`mt-6 text-3xl font-extrabold transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Access Denied
          </h2>
          <p className={`mt-2 text-sm transition-colors duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home size={18} className="mr-2" />
            Go to Dashboard
          </button>
          
          <button
            onClick={logout}
            className={`w-full flex justify-center items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors duration-200 ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <LogOut size={18} className="mr-2" />
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;