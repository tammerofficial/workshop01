import React from 'react';
import { Database } from 'lucide-react';

interface CacheStatusFallbackProps {
  className?: string;
}

const CacheStatusFallback: React.FC<CacheStatusFallbackProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center text-gray-400 ${className}`}>
      <Database className="w-4 h-4" />
      <span className="ml-1 text-xs">Cache N/A</span>
    </div>
  );
};

export default CacheStatusFallback;