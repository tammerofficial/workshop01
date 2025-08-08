import React from 'react';
import { Phone, Mail, Calendar, Building, X, Clock, Edit, Eye, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkerCardProps {
  worker: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string | { id: number; position_code: string; position_name: string };
    department: string;
    salary: number;
    hire_date: string;
    is_active: boolean;
    skills: string[];
    notes?: string;
    biometric_id?: string;
    employee_code?: string;
  };
  onEdit: (worker: WorkerCardProps['worker']) => void;
  onDelete: (id: number) => void;
  t: (key: string) => string;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onEdit, onDelete, t }) => {
  // Function to generate random gradient for avatar background
  const getAvatarGradient = (id: number) => {
    const colors = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-500',
      'from-red-500 to-pink-500',
      'from-emerald-500 to-green-500',
      'from-amber-500 to-yellow-500'
    ];
    return colors[id % colors.length];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format hire date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Card Header with Avatar */}
      <div className="relative">
        <div className={`h-24 w-full bg-gradient-to-r ${getAvatarGradient(worker.id)}`}></div>
        <div className="absolute -bottom-10 left-6">
          <div className={`h-20 w-20 rounded-full bg-gradient-to-r ${getAvatarGradient(worker.id)} flex items-center justify-center text-white text-2xl font-bold border-4 border-white`}>
            {getInitials(worker.name)}
          </div>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${worker.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {worker.is_active ? t('workers.activeStatus') : t('workers.inactiveStatus')}
          </span>
          {worker.biometric_id && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {t('workers.biometric.data')}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="pt-12 px-6 pb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{worker.name}</h3>
        <p className="text-sm text-gray-600 mb-4">
          {typeof worker.role === 'string' 
            ? worker.role 
            : worker.role?.position_name || t('common.notAvailable')
          }
        </p>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{worker.department}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{worker.email || t('common.notAvailable')}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{worker.phone || t('common.notAvailable')}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-gray-700">{formatDate(worker.hire_date)}</span>
          </div>

          {worker.employee_code && (
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700">{t('workers.employeeCode')}: {worker.employee_code}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {worker.skills && worker.skills.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center text-sm mb-2">
              <Star className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700 font-medium">{t('workers.skills')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(worker)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </button>
            <Link
              to={`/workers/${worker.id}`}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
              title="عرض التفاصيل"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete(worker.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              title="حذف"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerCard;