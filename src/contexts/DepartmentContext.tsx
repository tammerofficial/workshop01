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

export const departments: DepartmentInfo[] = [];

interface DepartmentContextType {
  currentDepartment: Department | null;
  setCurrentDepartment: (department: Department) => void;
  departmentInfo: DepartmentInfo | null;
  isLoading: boolean;
}

export const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

interface DepartmentProviderProps {
  children: ReactNode;
}

export const DepartmentProvider: React.FC<DepartmentProviderProps> = ({ children }) => {
  const [currentDepartment, setCurrentDepartmentState] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved department from localStorage on mount
  useEffect(() => {
    if (departments.length > 0) {
      const savedDepartment = localStorage.getItem('selectedDepartment') as Department;
      if (savedDepartment && departments.find(d => d.id === savedDepartment)) {
        setCurrentDepartmentState(savedDepartment);
      } else {
        setCurrentDepartmentState(departments[0].id);
      }
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
      if (deptInfo) {
        toast.success(`Switched to ${deptInfo.name}`, {
          icon: deptInfo.icon,
          duration: 2000
        });
      }
      
      // Simulate data loading delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (error) {
      console.error('Error switching department:', error);
      toast.error('Failed to switch department');
    } finally {
      setIsLoading(false);
    }
  };

  const departmentInfo = currentDepartment ? departments.find(d => d.id === currentDepartment) || null : null;

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
