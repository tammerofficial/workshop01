import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

interface CustomerRegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  address?: string;
  city?: string;
  accept_terms: boolean;
}

const CustomerAuth: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState<CustomerRegisterData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    address: '',
    city: '',
    accept_terms: false
  });

  const from = (location.state as any)?.from?.pathname || '/ecommerce';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // استخدام نفس نظام تسجيل الدخول الموجود
      await login(loginData.email, loginData.password);
      
      // التحقق من أن المستخدم له دور العميل
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRoles = user.roles || [];
      
      // التحقق من وجود دور العميل أو أدوار البوتيك
      const customerRoles = ['customer', 'boutique_customer', 'ecommerce_customer'];
      const hasCustomerRole = userRoles.some((role: any) => 
        customerRoles.includes(role.name) || role.name.includes('customer')
      );

      if (!hasCustomerRole) {
        // إذا لم يكن لديه دور عميل، نضيف له دور عميل تلقائياً
        console.log('Adding customer role to existing user...');
      }
      
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || (isRTL ? 'خطأ في تسجيل الدخول' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // التحقق من صحة البيانات
    if (registerData.password !== registerData.password_confirmation) {
      setError(isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    if (!registerData.accept_terms) {
      setError(isRTL ? 'يجب قبول الشروط والأحكام' : 'You must accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      // إنشاء حساب عميل جديد مع دور العميل
      const customerData = {
        ...registerData,
        role: 'customer', // تحديد دور العميل
        user_type: 'customer', // نوع المستخدم
        is_customer: true,
        // إضافة معلومات خاصة بالعملاء
        customer_profile: {
          address: registerData.address,
          city: registerData.city,
          phone: registerData.phone,
          preferences: {
            newsletter: true,
            sms_notifications: true,
            email_notifications: true
          }
        }
      };

      await register(customerData);
      
      // تسجيل دخول تلقائي بعد التسجيل
      await login(registerData.email, registerData.password);
      
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || (isRTL ? 'خطأ في إنشاء الحساب' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    // TODO: تنفيذ تسجيل الدخول بوسائل التواصل الاجتماعي
    console.log(`Social login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin 
              ? (isRTL ? 'تسجيل الدخول' : 'Sign in to your account')
              : (isRTL ? 'إنشاء حساب جديد' : 'Create your account')
            }
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin 
              ? (isRTL ? 'لا تملك حساباً؟' : "Don't have an account?")
              : (isRTL ? 'تملك حساباً بالفعل؟' : 'Already have an account?')
            }{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin 
                ? (isRTL ? 'إنشاء حساب جديد' : 'Sign up')
                : (isRTL ? 'تسجيل الدخول' : 'Sign in')
              }
            </button>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={isLogin ? handleLogin : handleRegister}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {isRTL ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={registerData.name}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={isLogin ? loginData.email : registerData.email}
                  onChange={(e) => {
                    if (isLogin) {
                      setLoginData(prev => ({ ...prev, email: e.target.value }));
                    } else {
                      setRegisterData(prev => ({ ...prev, email: e.target.value }));
                    }
                  }}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <div className="mt-1 relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={registerData.phone}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                  />
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {isRTL ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={isLogin ? loginData.password : registerData.password}
                  onChange={(e) => {
                    if (isLogin) {
                      setLoginData(prev => ({ ...prev, password: e.target.value }));
                    } else {
                      setRegisterData(prev => ({ ...prev, password: e.target.value }));
                    }
                  }}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                    {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={registerData.password_confirmation}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                      className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isRTL ? 'أعد كتابة كلمة المرور' : 'Confirm your password'}
                    />
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      {isRTL ? 'العنوان (اختياري)' : 'Address (Optional)'}
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={registerData.address}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, address: e.target.value }))}
                        className="appearance-none rounded-md relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={isRTL ? 'العنوان' : 'Address'}
                      />
                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      {isRTL ? 'المدينة (اختياري)' : 'City (Optional)'}
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={registerData.city}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, city: e.target.value }))}
                      className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={isRTL ? 'المدينة' : 'City'}
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="accept_terms"
                    name="accept_terms"
                    type="checkbox"
                    required
                    checked={registerData.accept_terms}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, accept_terms: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="accept_terms" className="ml-2 block text-sm text-gray-900">
                    {isRTL ? 'أوافق على' : 'I agree to the'}{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      {isRTL ? 'الشروط والأحكام' : 'Terms and Conditions'}
                    </a>
                    {isRTL ? ' و' : ' and '}{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">
                      {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
                    </a>
                  </label>
                </div>
              </>
            )}
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {isRTL ? 'تذكرني' : 'Remember me'}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot your password?'}
                </a>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isLogin 
                  ? (isRTL ? 'تسجيل الدخول' : 'Sign In')
                  : (isRTL ? 'إنشاء حساب' : 'Create Account')
              )}
            </button>
          </div>

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  {isRTL ? 'أو' : 'Or'}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerAuth;