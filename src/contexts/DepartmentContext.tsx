import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export type Department = 'wedding' | 'ready-to-wear' | 'custom-made';

export interface DepartmentInfo {
  id: Department;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const departments: DepartmentInfo[] = [
  {
    id: 'wedding',
    name: 'Wedding Dresses',
    description: 'Bridal and formal wedding attire',
    color: 'bg-pink-500',
    icon: '👰'
  },
  {
    id: 'ready-to-wear',
    name: 'Ready-to-Wear',
    description: 'Pre-designed dresses and collections',
    color: 'bg-purple-500',
    icon: '👗'
  },
  {
    id: 'custom-made',
    name: 'Custom-Made',
    description: 'Bespoke and tailored dresses',
    color: 'bg-blue-500',
    icon: '✂️'
  }
];

interface DepartmentContextType {
  currentDepartment: Department;
  setCurrentDepartment: (department: Department) => void;
  departmentInfo: DepartmentInfo;
  isLoading: boolean;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

interface DepartmentProviderProps {
  children: ReactNode;
}

export const DepartmentProvider: React.FC<DepartmentProviderProps> = ({ children }) => {
  const [currentDepartment, setCurrentDepartmentState] = useState<Department>('wedding');
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