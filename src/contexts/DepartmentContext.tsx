import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export type Department = 'general';

export interface DepartmentInfo {
  id: Department;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const departments: DepartmentInfo[] = [
  {
    id: 'general',
    name: 'General Workshop',
    description: 'All workshop activities',
    color: 'bg-gray-500',
    icon: '🧵'
  }
];

interface DepartmentContextType {
  currentDepartment: Department;
  setCurrentDepartment: (department: Department) => void;
  departmentInfo: DepartmentInfo;
  isLoading: boolean;
}

export const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

interface DepartmentProviderProps {
  children: ReactNode;
}

export const DepartmentProvider: React.FC<DepartmentProviderProps> = ({ children }) => {
  const [currentDepartment, setCurrentDepartmentState] = useState<Department>('general');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved department from localStorage on mount
  useEffect(() => {
    const savedDepartment = localStorage.getItem('selectedDepartment') as Department;
    if (savedDepartment && departments.find(d => d.id === savedDepartment)) {
      setCurrentDepartmentState(savedDepartment);
    }
  }, []);

  const setCurrentDepartment = async (department: Department) => {
    if (department === currentDepartment) return;
    
    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('selectedDepartment', department);
      
      // Update state
      setCurrentDepartmentState(department);
      
      // Show notification
      const deptInfo = departments.find(d => d.id === department);
      toast.success(`Switched to ${deptInfo?.name}`, {
        icon: deptInfo?.icon,
        duration: 2000
      });
      
      // Simulate data loading delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error('Error switching department:', error);
      toast.error('Failed to switch department');
    } finally {
      setIsLoading(false);
    }
  };

  const departmentInfo = departments.find(d => d.id === currentDepartment) || departments[0];

  return (
    <DepartmentContext.Provider value={{
      currentDepartment,
      setCurrentDepartment,
      departmentInfo,
      isLoading
    }}>
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};
