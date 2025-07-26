import React from 'react';
import { motion } from 'framer-motion';
import { useDepartment, departments, Department } from '../../contexts/DepartmentContext';
import { useTheme } from '../../contexts/ThemeContext';

const DepartmentToggle: React.FC = () => {
  const { currentDepartment, setCurrentDepartment, isLoading } = useDepartment();
  const { isDark } = useTheme();

  const handleDepartmentChange = (departmentId: Department) => {
    if (departmentId !== currentDepartment && !isLoading) {
      setCurrentDepartment(departmentId);
    }
  };

  return (
    <div className={`flex items-center space-x-1 rounded-xl p-1 ${
      isDark ? 'bg-gray-700' : 'bg-gray-100'
    }`}>
      {departments.map((department) => (
        <motion.button
          key={department.id}
          onClick={() => handleDepartmentChange(department.id)}
          disabled={isLoading}
          className={`
            relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
            disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]
            ${currentDepartment === department.id 
              ? 'text-white shadow-lg' 
              : isDark 
                ? 'text-gray-300 hover:text-white hover:bg-gray-600' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }
          `}
          whileHover={currentDepartment !== department.id ? { scale: 1.02 } : {}}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">{department.icon}</span>
            <span className="hidden sm:inline font-medium">{department.name}</span>
          </div>
          
          {/* Active indicator */}
          {currentDepartment === department.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-black rounded-lg -z-10"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default DepartmentToggle;