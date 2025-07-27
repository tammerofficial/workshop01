import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <motion.div 
      className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div>
        <h1 
          className="text-3xl font-bold text-gray-900"
          style={{
            fontFamily: 'var(--font-family)',
            fontSize: 'calc(var(--font-size) * 1.875)',
            fontWeight: 'var(--font-weight)',
            lineHeight: 'var(--line-height)',
            color: 'var(--text-color)'
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p 
            className="mt-2 text-lg text-gray-600"
            style={{
              fontFamily: 'var(--font-family)',
              fontSize: 'calc(var(--font-size) * 1.125)',
              fontWeight: 'var(--font-weight)',
              lineHeight: 'var(--line-height)',
              color: 'var(--secondary-color)'
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <motion.div 
          className="mt-6 sm:mt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PageHeader;