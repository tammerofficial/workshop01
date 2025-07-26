import React from 'react';
import { useDepartmentData } from '../../hooks/useDepartmentData';
import DepartmentLoader from './DepartmentLoader';

interface DepartmentAwareComponentProps {
  children: (data: ReturnType<typeof useDepartmentData>) => React.ReactNode;
}

const DepartmentAwareComponent: React.FC<DepartmentAwareComponentProps> = ({ children }) => {
  const departmentData = useDepartmentData();

  return (
    <DepartmentLoader>
      {children(departmentData)}
    </DepartmentLoader>
  );
};

export default DepartmentAwareComponent;