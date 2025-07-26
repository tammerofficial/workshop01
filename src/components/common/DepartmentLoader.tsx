import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { useDepartment } from '../../contexts/DepartmentContext';

interface DepartmentLoaderProps {
  children: React.ReactNode;
}

const DepartmentLoader: React.FC<DepartmentLoaderProps> = ({ children }) => {
  const { isLoading, departmentInfo } = useDepartment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className={`w-16 h-16 rounded-full ${departmentInfo.color} flex items-center justify-center text-white text-2xl mb-4 mx-auto`}>
            <Loader className="animate-spin" size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading {departmentInfo.name}
          </h3>
          <p className="text-gray-500">Switching department data...</p>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DepartmentLoader;