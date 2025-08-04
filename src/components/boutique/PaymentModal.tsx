import React, { useState } from 'react';
import { X, CreditCard, Banknote, Smartphone, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface LoyaltyCustomer {
  loyalty_customer_id: number;
  name: string;
  tier: string;
  available_points: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPayment: (method: string, paidAmount?: number) => void;
  customer?: LoyaltyCustomer | null;
  pointsUsed?: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPayment,
  customer,
  pointsUsed = 0
}) => {
  const { t } = useLanguage();
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(totalAmount);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const paymentMethods = [
    {
      id: 'cash',
      name: t('payment.cash'),
      icon: <Banknote className="w-6 h-6" />,
      color: 'bg-green-500',
      description: t('payment.cashDescription')
    },
    {
      id: 'card',
      name: t('payment.card'),
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: t('payment.cardDescription')
    },
    {
      id: 'knet',
      name: 'K-Net',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: t('payment.knetDescription')
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'bg-gray-800',
      description: t('payment.applePayDescription')
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      await onPayment(selectedMethod, selectedMethod === 'cash' ? paidAmount : totalAmount);
    } finally {
      setIsProcessing(false);
    }
  };

  const changeAmount = selectedMethod === 'cash' ? Math.max(0, paidAmount - totalAmount) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('payment.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* معلومات العميل */}
          {customer && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">{customer.name}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {customer.tier}
                </span>
              </div>
              {pointsUsed > 0 && (
                <div className="text-sm text-blue-700">
                  {t('loyalty.pointsUsed')}: {pointsUsed} ({(pointsUsed / 100).toFixed(3)} {t('common.currency')})
                </div>
              )}
            </div>
          )}

          {/* ملخص المبلغ */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>{t('payment.totalAmount')}</span>
                <span>{totalAmount.toFixed(3)} {t('common.currency')}</span>
              </div>
              {pointsUsed > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('loyalty.discount')}</span>
                  <span>-{(pointsUsed / 100).toFixed(3)} {t('common.currency')}</span>
                </div>
              )}
            </div>
          </div>

          {/* طرق الدفع */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {t('payment.selectMethod')}
            </h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-2 rounded-lg text-white mr-3 ${method.color}`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* مبلغ الدفع (للنقد فقط) */}
          {selectedMethod === 'cash' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('payment.paidAmount')}
              </label>
              <input
                type="number"
                step="0.001"
                min={totalAmount}
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || totalAmount)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center"
              />
              
              {/* مبلغ الباقي */}
              {changeAmount > 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-800 font-medium">
                      {t('payment.change')}
                    </span>
                    <span className="text-yellow-900 font-bold text-lg">
                      {changeAmount.toFixed(3)} {t('common.currency')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* أزرار الإجراء */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isProcessing}
            >
              {t('common.cancel')}
            </button>
            
            <button
              onClick={handlePayment}
              disabled={isProcessing || (selectedMethod === 'cash' && paidAmount < totalAmount)}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {t('payment.processing')}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  {t('payment.confirmPayment')}
                </>
              )}
            </button>
          </div>

          {/* تحذيرات */}
          {selectedMethod === 'cash' && paidAmount < totalAmount && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">
                {t('payment.insufficientAmount')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;