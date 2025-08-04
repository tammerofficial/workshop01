import React, { useState, useEffect } from 'react';
import { Search, Users, Star, X, CreditCard } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import laravel from '../../api/laravel';

interface LoyaltyCustomer {
  loyalty_customer_id: number;
  client_id: number;
  membership_number: string;
  name: string;
  email: string;
  phone: string;
  tier: string;
  available_points: number;
  total_points: number;
  tier_multiplier: number;
  wallet_enabled: boolean;
  can_earn_points: boolean;
  points_per_kwd: number;
}

interface LoyaltyCustomerSearchProps {
  onCustomerSelect: (customer: LoyaltyCustomer | null) => void;
  selectedCustomer: LoyaltyCustomer | null;
}

const LoyaltyCustomerSearch: React.FC<LoyaltyCustomerSearchProps> = ({
  onCustomerSelect,
  selectedCustomer
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // البحث عن العملاء
  const searchCustomers = async (term: string) => {
    if (term.length < 3) {
      setCustomers([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await laravel.post('/boutique/loyalty/search-customer', {
        search_term: term,
        boutique_id: 1 // يجب الحصول على هذا من السياق
      });

      if (response.data.success) {
        setCustomers(response.data.data || []);
        setShowResults(true);
      } else {
        setCustomers([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Customer search error:', error);
      setCustomers([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // استخدام debounce للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      searchCustomers(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // اختيار عميل
  const selectCustomer = (customer: LoyaltyCustomer) => {
    onCustomerSelect(customer);
    setSearchTerm('');
    setShowResults(false);
  };

  // إلغاء اختيار العميل
  const clearCustomer = () => {
    onCustomerSelect(null);
    setSearchTerm('');
  };

  // الحصول على لون المستوى
  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'bronze':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // الحصول على أيقونة المستوى
  const getTierIcon = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'vip':
        return '👑';
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '⭐';
    }
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
          <Users className="mr-2" />
          {t('loyalty.customerSearch')}
        </h3>

        {/* العميل المحدد */}
        {selectedCustomer ? (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold">{selectedCustomer.name}</h4>
                  <div className="text-sm opacity-90 space-x-4">
                    <span>{selectedCustomer.membership_number}</span>
                    <span>•</span>
                    <span>{getTierIcon(selectedCustomer.tier)} {selectedCustomer.tier}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  {selectedCustomer.available_points} {t('loyalty.points')}
                </div>
                <div className="text-sm opacity-90">
                  {t('loyalty.available')}
                </div>
              </div>

              <button
                onClick={clearCustomer}
                className="ml-3 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                title={t('loyalty.clearCustomer')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* معلومات إضافية */}
            <div className="mt-3 pt-3 border-t border-white border-opacity-20">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="opacity-80">{t('loyalty.totalPoints')}</div>
                  <div className="font-medium">{selectedCustomer.total_points}</div>
                </div>
                <div>
                  <div className="opacity-80">{t('loyalty.multiplier')}</div>
                  <div className="font-medium">{selectedCustomer.tier_multiplier}x</div>
                </div>
                <div>
                  <div className="opacity-80">Apple Wallet</div>
                  <div className="font-medium">
                    {selectedCustomer.wallet_enabled ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* شريط البحث */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('loyalty.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onFocus={() => searchTerm.length >= 3 && setShowResults(true)}
              />
              {isLoading && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* نتائج البحث */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <button
                      key={customer.loyalty_customer_id}
                      onClick={() => selectCustomer(customer)}
                      className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getTierColor(customer.tier)}`}>
                              {getTierIcon(customer.tier)} {customer.tier}
                            </span>
                            {customer.wallet_enabled && (
                              <CreditCard className="w-4 h-4 text-blue-500" title="Apple Wallet" />
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 space-x-4">
                            <span>{customer.membership_number}</span>
                            <span>•</span>
                            <span>{customer.email}</span>
                            {customer.phone && (
                              <>
                                <span>•</span>
                                <span>{customer.phone}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            {customer.available_points} {t('loyalty.points')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t('loyalty.multiplier')}: {customer.tier_multiplier}x
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : searchTerm.length >= 3 && !isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>{t('loyalty.noCustomersFound')}</p>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      {/* زر المتابعة بدون عميل */}
      {!selectedCustomer && (
        <div className="text-center">
          <button
            onClick={() => setShowResults(false)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {t('loyalty.continueWithoutCustomer')}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoyaltyCustomerSearch;