import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User,
  Award, Calendar, Upload, X, Plus, Camera,
  AlertTriangle, Briefcase, Shield
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { useCache } from '../contexts/CacheContext';
import { biometricService } from '../api/laravel';

interface WorkerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  department: string;
  employeeId: string;
  dateOfJoining: string;
  salary: string;
  // Payroll fields
  baseSalary: string;
  hourlyRate: string;
  overtimeRate: string;
  standardHoursPerDay: string;
  standardHoursPerWeek: string;
  standardHoursPerMonth: string;
  enableOvertime: boolean;
  enableBonus: boolean;
  bonusPercentage: string;
  payrollStatus: 'active' | 'inactive' | 'suspended';
  skills: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes: string;
  status: 'active' | 'on leave' | 'unavailable';
  imageFile: File | null;
}

const EditWorker: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const { t, isRTL } = useLanguage();
  const cache = useCache();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  
  // Dynamic data from API
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [formData, setFormData] = useState<WorkerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    department: departmentInfo.name,
    employeeId: '',
    dateOfJoining: '',
    salary: '',
    // Payroll fields with default values
    baseSalary: '',
    hourlyRate: '5.00',
    overtimeRate: '7.50',
    standardHoursPerDay: '8',
    standardHoursPerWeek: '40',
    standardHoursPerMonth: '160',
    enableOvertime: true,
    enableBonus: true,
    bonusPercentage: '0',
    payrollStatus: 'active',
    skills: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: '',
    status: 'active',
    imageFile: null
  });

  const roles = {
    wedding: ['Bridal Specialist', 'Wedding Coordinator', 'Seamstress', 'Fitting Specialist', 'Quality Inspector'],
    'ready-to-wear': ['Fashion Designer', 'Pattern Maker', 'Sewing Operator', 'Quality Controller', 'Production Manager'],
    'custom-made': ['Custom Tailor', 'Master Craftsman', 'Alterations Specialist', 'Bespoke Designer', 'Fitting Expert']
  };

  const commonSkills = {
    wedding: ['Bridal Alterations', 'Beadwork', 'Embroidery', 'Veil Making', 'Corsetry', 'Hand Sewing'],
    'ready-to-wear': ['Machine Sewing', 'Pattern Making', 'Cutting', 'Pressing', 'Quality Control', 'Production Planning'],
    'custom-made': ['Bespoke Tailoring', 'Hand Stitching', 'Pattern Drafting', 'Fitting', 'Alterations', 'Fabric Knowledge']
  };

  // Load departments and positions from API with caching
  const loadDepartmentsAndPositions = async (forceRefresh = false) => {
    try {
      setLoadingDepartments(true);
      
      // Try to get from cache first
      if (!forceRefresh) {
        const cachedDepartments = cache.getCachedData('biometric_departments');
        const cachedPositions = cache.getCachedData('biometric_positions');
        
        if (cachedDepartments && cachedPositions) {
          setDepartments(cachedDepartments);
          setPositions(cachedPositions);
          setLoadingDepartments(false);
          return;
        }
      }

      // Fetch from API with caching
      const [departmentsResponse, positionsResponse] = await Promise.all([
        cache.fetchWithCache(
          'biometric_departments',
          () => biometricService.getBiometricDepartments(),
          15 * 60 * 1000 // 15 minutes cache
        ),
        cache.fetchWithCache(
          'biometric_positions',
          () => biometricService.getBiometricPositions(),
          15 * 60 * 1000 // 15 minutes cache
        )
      ]);

      const departmentsData = departmentsResponse.data?.data || departmentsResponse.data || departmentsResponse || [];
      const positionsData = positionsResponse.data?.data || positionsResponse.data || positionsResponse || [];

      setDepartments(departmentsData);
      setPositions(positionsData);

      // Cache the data
      cache.setCachedData('biometric_departments', departmentsData, 15 * 60 * 1000);
      cache.setCachedData('biometric_positions', positionsData, 15 * 60 * 1000);

    } catch (error) {
      console.error('Error loading departments and positions:', error);
      toast.error(t('Error loading departments and positions'));
      
      // Fallback to hardcoded roles if API fails
      const fallbackDepartments = [
        { id: 'wedding', name: 'Wedding', name_ar: 'زفاف' },
        { id: 'ready-to-wear', name: 'Ready to Wear', name_ar: 'جاهز للارتداء' },
        { id: 'custom-made', name: 'Custom Made', name_ar: 'مفصل حسب الطلب' }
      ];
      setDepartments(fallbackDepartments);
      
      // Use hardcoded roles as fallback
      const allPositions = Object.values(roles).flat().map((role, index) => ({
        id: index + 1,
        position_name: role,
        position_name_ar: role,
        department_id: null
      }));
      setPositions(allPositions);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Auto-calculate hourly rate when salary or monthly hours change
  const calculateHourlyRate = (salary: string, monthlyHours: string) => {
    const salaryNum = parseFloat(salary) || 0;
    const hoursNum = parseFloat(monthlyHours) || 160; // Default 160 hours per month
    return hoursNum > 0 ? (salaryNum / hoursNum).toFixed(2) : '0.00';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => {
        const newData = { ...prev, [name]: value };
        
        // Auto-calculate hourly rate when salary or monthly hours change
        if (name === 'salary' || name === 'standardHoursPerMonth') {
          const salary = name === 'salary' ? value : prev.salary;
          const monthlyHours = name === 'standardHoursPerMonth' ? value : prev.standardHoursPerMonth;
          newData.hourlyRate = calculateHourlyRate(salary, monthlyHours);
          
          // Also calculate overtime rate (1.5x hourly rate)
          const hourlyRateNum = parseFloat(newData.hourlyRate) || 0;
          newData.overtimeRate = (hourlyRateNum * 1.5).toFixed(2);
        }
        
        return newData;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null }));
    setImagePreview(null);
  };

  const generateEmployeeId = () => {
    const prefix = departmentInfo.id.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const employeeId = `${prefix}-EMP-${timestamp}-${random}`;
    
    setFormData(prev => ({ ...prev, employeeId }));
    toast.success(t('Employee ID generated automatically'));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addCommonSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.role) {
        toast.error(t('Please fill in all required fields'));
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error(t('Please enter a valid email address'));
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedWorker = {
        id,
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        departmentId: departmentInfo.id,
        salary: parseFloat(formData.salary) || 0,
        updatedAt: new Date().toISOString()
      };

      console.log('Updating worker:', updatedWorker);

      toast.success(t('{firstName} {lastName} updated successfully!', { firstName: formData.firstName, lastName: formData.lastName }), {
        icon: departmentInfo.icon,
        duration: 4000
      });

      // Navigate back to workers page
      navigate('/workers');
    } catch (error) {
      toast.error(t('Failed to update worker. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DepartmentAwareComponent>
      {({ workers, loading: workersLoading }) => {
        const worker = workers.find(w => w.id === id);

        useEffect(() => {
          // Load departments and positions on component mount
          loadDepartmentsAndPositions();
        }, []);

        useEffect(() => {
          if (worker) {
            const nameParts = worker.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            setFormData({
              firstName,
              lastName,
              email: worker.contactInfo.email,
              phone: worker.contactInfo.phone,
              address: '',
              role: worker.role,
              department: worker.department,
              employeeId: worker.id,
              dateOfJoining: '',
              salary: '',
              skills: worker.skills || [],
              emergencyContact: {
                name: '',
                phone: '',
                relationship: ''
              },
              notes: '',
              status: worker.status,
              imageFile: null
            });
            setImagePreview(worker.imageUrl);
          }
        }, [worker]);

        if (workersLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
          );
        }

        if (!worker) {
          return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
              <div className="text-center">
                <User size={48} className="mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('Worker Not Found')}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{t("The worker you're looking for doesn't exist or has been removed.")}</p>
                <button
                  onClick={() => navigate('/workers')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <ArrowLeft size={16} className={isRTL ? "ml-2" : "mr-2"} />
                  {t('Back to Workers')}
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="dark:bg-gray-900">
            <PageHeader 
              title={t('Edit Worker - {workerName}', { workerName: worker.name })}
              subtitle={`${departmentInfo.name} • ${t('Update team member information')}`}
              action={
                <button
                  onClick={() => navigate('/workers')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <ArrowLeft size={16} className={isRTL ? "ml-2" : "mr-2"} />
                  {t('Back to Workers')}
                </button>
              }
            />

            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <User size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Personal Information')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('First Name')} *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder={t('Enter first name')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Last Name')} *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder={t('Enter last name')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Email Address')} *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('worker@email.com')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Phone Number')} *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t('+971 50 123 4567')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Address')}
                      </label>
                      <textarea
                        name="address"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder={t('Enter full address')}
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <Briefcase size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Employment Information')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Role/Position')} *
                      </label>
                      <select
                        name="role"
                        required
                        disabled={loadingDepartments}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="">
                          {loadingDepartments ? t('Loading positions...') : t('Select a role')}
                        </option>
                        {!loadingDepartments && positions.map(position => (
                          <option key={position.id || position.position_name} value={position.position_name}>
                            {isRTL ? (position.position_name_ar || position.position_name) : position.position_name}
                          </option>
                        ))}
                      </select>
                                              {loadingDepartments && (
                        <div className="mt-1 text-sm text-blue-500 flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500 mr-2"></div>
                          {t('Loading latest positions...')}
                        </div>
                      )}
                      {!loadingDepartments && (
                        <button
                          type="button"
                          onClick={() => loadDepartmentsAndPositions(true)}
                          className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center"
                          title={t('Refresh positions list')}
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t('Refresh positions')}
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Department')}
                      </label>
                      <input
                        type="text"
                        name="department"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300"
                        value={formData.department}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Employee ID')}
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="employeeId"
                          className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 ${isRTL ? 'rounded-r-md' : 'rounded-l-md'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                          value={formData.employeeId}
                          onChange={handleInputChange}
                          placeholder={t('Enter ID or generate automatically')}
                        />
                        <button
                          type="button"
                          onClick={generateEmployeeId}
                          className={`px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-l-0 dark:border-l-0 border-gray-300 dark:border-gray-500 ${isRTL ? 'rounded-l-md' : 'rounded-r-md'} hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          title={t('Generate Employee ID')}
                        >
                          <Shield size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Date of Joining')}
                      </label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.dateOfJoining}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Monthly Salary')}
                      </label>
                      <div className="relative">
                        <span className={`absolute top-2 text-gray-500 dark:text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}>$</span>
                        <input
                          type="number"
                          name="salary"
                          step="0.01"
                          min="0"
                          className={`w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2`}
                          value={formData.salary}
                          onChange={handleInputChange}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Status')}
                      </label>
                      <select
                        name="status"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">{t('Active')}</option>
                        <option value="on leave">{t('On Leave')}</option>
                        <option value="unavailable">{t('Unavailable')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payroll Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <span className="text-lg">💰</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Payroll Information')}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Base Salary */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Base Salary')}
                      </label>
                      <div className="relative">
                        <span className={`absolute top-2 text-gray-500 dark:text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}>$</span>
                        <input
                          type="number"
                          name="baseSalary"
                          step="0.01"
                          min="0"
                          className={`w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2`}
                          value={formData.baseSalary}
                          onChange={handleInputChange}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    {/* Hourly Rate (Auto-calculated) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Hourly Rate')} <span className="text-xs text-blue-500">({t('Auto-calculated')})</span>
                      </label>
                      <div className="relative">
                        <span className={`absolute top-2 text-gray-500 dark:text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}>$</span>
                        <input
                          type="number"
                          name="hourlyRate"
                          step="0.01"
                          min="0"
                          readOnly
                          className={`w-full border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2`}
                          value={formData.hourlyRate}
                          title={t('Calculated from: Monthly Salary ÷ Monthly Working Hours')}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('Formula')}: {formData.salary || '0'}$ ÷ {formData.standardHoursPerMonth || '160'}h = {formData.hourlyRate}$/h
                      </p>
                    </div>

                    {/* Overtime Rate (Auto-calculated) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Overtime Rate')} <span className="text-xs text-blue-500">({t('Auto-calculated')})</span>
                      </label>
                      <div className="relative">
                        <span className={`absolute top-2 text-gray-500 dark:text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}>$</span>
                        <input
                          type="number"
                          name="overtimeRate"
                          step="0.01"
                          min="0"
                          readOnly
                          className={`w-full border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2`}
                          value={formData.overtimeRate}
                          title={t('Calculated as: Hourly Rate × 1.5')}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('Formula')}: {formData.hourlyRate}$ × 1.5 = {formData.overtimeRate}$/h
                      </p>
                    </div>

                    {/* Standard Hours Per Day */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Daily Working Hours')}
                      </label>
                      <input
                        type="number"
                        name="standardHoursPerDay"
                        min="1"
                        max="24"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.standardHoursPerDay}
                        onChange={handleInputChange}
                        placeholder="8"
                      />
                    </div>

                    {/* Standard Hours Per Week */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Weekly Working Hours')}
                      </label>
                      <input
                        type="number"
                        name="standardHoursPerWeek"
                        min="1"
                        max="168"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.standardHoursPerWeek}
                        onChange={handleInputChange}
                        placeholder="40"
                      />
                    </div>

                    {/* Standard Hours Per Month */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Monthly Working Hours')}
                      </label>
                      <input
                        type="number"
                        name="standardHoursPerMonth"
                        min="1"
                        max="744"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.standardHoursPerMonth}
                        onChange={handleInputChange}
                        placeholder="160"
                      />
                    </div>

                    {/* Bonus Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Bonus Percentage')}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="bonusPercentage"
                          step="0.01"
                          min="0"
                          max="100"
                          className={`w-full border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${isRTL ? 'pl-8 pr-3' : 'pr-8 pl-3'} py-2`}
                          value={formData.bonusPercentage}
                          onChange={handleInputChange}
                          placeholder="0"
                        />
                        <span className={`absolute top-2 text-gray-500 dark:text-gray-400 ${isRTL ? 'left-3' : 'right-3'}`}>%</span>
                      </div>
                    </div>

                    {/* Payroll Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Payroll Status')}
                      </label>
                      <select
                        name="payrollStatus"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.payrollStatus}
                        onChange={handleInputChange}
                      >
                        <option value="active">{t('Active')}</option>
                        <option value="inactive">{t('Inactive')}</option>
                        <option value="suspended">{t('Suspended')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Payroll Options */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableOvertime"
                        name="enableOvertime"
                        checked={formData.enableOvertime}
                        onChange={(e) => setFormData(prev => ({ ...prev, enableOvertime: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                      />
                      <label htmlFor="enableOvertime" className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                        {t('Enable Overtime Calculation')}
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableBonus"
                        name="enableBonus"
                        checked={formData.enableBonus}
                        onChange={(e) => setFormData(prev => ({ ...prev, enableBonus: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600"
                      />
                      <label htmlFor="enableBonus" className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isRTL ? 'mr-3' : 'ml-3'}`}>
                        {t('Enable Bonus Calculation')}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <Award size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Skills & Expertise')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Add Custom Skill */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Add Skills')}
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className={`flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 ${isRTL ? 'rounded-r-md' : 'rounded-l-md'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                          placeholder={t('Enter a skill')}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className={`px-3 py-2 bg-blue-600 text-white border border-blue-600 ${isRTL ? 'rounded-l-md' : 'rounded-r-md'} hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Common Skills */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Common Skills for {departmentName}', { departmentName: departmentInfo.name })}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {commonSkills[departmentInfo.id as keyof typeof commonSkills].map(skill => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => addCommonSkill(skill)}
                            disabled={formData.skills.includes(skill)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                              formData.skills.includes(skill)
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Skills */}
                    {formData.skills.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('Selected Skills')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map(skill => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className={`${isRTL ? 'mr-2' : 'ml-2'} text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200`}
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Emergency Contact')}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Contact Name')}
                      </label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                        placeholder={t('Full name')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Phone Number')}
                      </label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        placeholder={t('+971 50 123 4567')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Relationship')}
                      </label>
                      <select
                        name="emergencyContact.relationship"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.emergencyContact.relationship}
                        onChange={handleInputChange}
                      >
                        <option value="">{t('Select relationship')}</option>
                        <option value="spouse">{t('Spouse')}</option>
                        <option value="parent">{t('Parent')}</option>
                        <option value="sibling">{t('Sibling')}</option>
                        <option value="child">{t('Child')}</option>
                        <option value="friend">{t('Friend')}</option>
                        <option value="other">{t('Other')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <Camera size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Profile Photo')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-full border border-gray-300 dark:border-gray-600"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <Upload size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{t('Upload profile photo')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('PNG, JPG up to 5MB')}</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        >
                          <Plus size={16} className={isRTL ? "ml-2" : "mr-2"} />
                          {t('Choose Photo')}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white ${isRTL ? 'ml-3' : 'mr-3'}`}>
                      <Calendar size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('Additional Notes')}</h3>
                  </div>
                  
                  <textarea
                    name="notes"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder={t('Any additional notes about the worker, special requirements, certifications, etc...')}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/workers')}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading 
                        ? 'bg-gray-400 dark:bg-gray-500 cursor-not-allowed' 
                        : 'bg-black dark:bg-gray-200 dark:text-black hover:bg-gray-800 dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-300'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('Updating Worker...')}
                      </>
                    ) : (
                      <>
                        <Save size={16} className={isRTL ? "ml-2" : "mr-2"} />
                        {t('Update Worker')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        );
      }}
    </DepartmentAwareComponent>
  );
};

export default EditWorker;