import React from 'react';
import IntegratedProductionProgress from '../components/production/IntegratedProductionProgress';

const IntegratedProductionPage: React.FC = () => {
  // For now, we can hardcode an order ID for testing
  const orderId = 7;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">إدارة الإنتاج المتكامل</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        {orderId ? (
          <IntegratedProductionProgress orderId={orderId} />
        ) : (
          <p>الرجاء تحديد طلب لعرض تفاصيل الإنتاج.</p>
        )}
      </div>
    </div>
  );
};

export default IntegratedProductionPage;
