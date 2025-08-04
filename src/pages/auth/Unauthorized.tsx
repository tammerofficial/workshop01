import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft, User, Mail, UserCheck, Building2, AlertCircle, Phone, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">🚫 غير مصرح لك</h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            عذراً، ليس لديك الصلاحية اللازمة للوصول إلى هذه الصفحة أو الميزة المطلوبة
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* User Info Section */}
          {user && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 ml-2" />
                معلومات حسابك الحالي
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <User className="w-4 h-4 text-blue-200" />
                  <div>
                    <p className="text-xs text-blue-200">الاسم</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Mail className="w-4 h-4 text-blue-200" />
                  <div>
                    <p className="text-xs text-blue-200">البريد الإلكتروني</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse">
                  <UserCheck className="w-4 h-4 text-blue-200" />
                  <div>
                    <p className="text-xs text-blue-200">الدور الحالي</p>
                    <p className="font-medium">
                      {user.role?.display_name || 'غير محدد'}
                      {!user.role?.display_name && (
                        <span className="text-red-200 text-xs mr-2">(يحتاج إلى تعيين دور)</span>
                      )}
                    </p>
                  </div>
                </div>
                {user.department && (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <Building2 className="w-4 h-4 text-blue-200" />
                    <div>
                      <p className="text-xs text-blue-200">القسم</p>
                      <p className="font-medium">{user.department}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* What you can do */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 ml-2" />
                <h3 className="text-lg font-semibold text-amber-800">ما الذي يمكنك فعله؟</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-amber-700">تواصل مع مدير النظام لطلب صلاحيات إضافية</p>
                  </div>
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-amber-700">تأكد من أنك تستخدم الحساب الصحيح</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-amber-700">جرب تسجيل الخروج وإعادة تسجيل الدخول</p>
                  </div>
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                    <p className="text-amber-700">عد إلى الصفحة الرئيسية المتاحة لدورك</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center mb-3">
                <Phone className="w-5 h-5 text-emerald-600 ml-2" />
                <h3 className="text-lg font-semibold text-emerald-800">تحتاج مساعدة؟</h3>
              </div>
              <p className="text-emerald-700 mb-4">
                إذا كنت تعتقد أن هذا خطأ أو تحتاج صلاحيات إضافية، يرجى التواصل مع:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-emerald-800">مدير النظام</p>
                  <p className="text-xs text-emerald-600">admin@workshop.local</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-emerald-800">الدعم التقني</p>
                  <p className="text-xs text-emerald-600">support@workshop.local</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse pt-2">
              <Link
                to="/"
                className="flex-1 flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
              >
                <Home className="w-4 h-4 ml-2" />
                الصفحة الرئيسية
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="flex-1 flex justify-center items-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للخلف
              </button>

              <Link
                to="/login"
                className="flex-1 flex justify-center items-center px-6 py-3 border border-emerald-300 rounded-lg shadow-sm text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all duration-200 transform hover:scale-105"
              >
                <Settings className="w-4 h-4 ml-2" />
                تغيير الحساب
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            🏭 نظام إدارة الورشة - ورشة الخياطة المتقدمة
          </p>
          <p className="text-xs text-gray-400">
            جميع الحقوق محفوظة © 2024 | نظام حماية متقدم
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;