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
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
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
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="">{t('Select a role')}</option>
                        {roles[departmentInfo.id as keyof typeof roles].map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
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