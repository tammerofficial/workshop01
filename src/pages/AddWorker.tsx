import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, User, Award, Upload, X, Plus, Camera, Briefcase, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/common/PageHeader';
import { LanguageContext } from '../contexts/LanguageContext';
import { DepartmentContext } from '../contexts/DepartmentContext';
import { workerService } from '../api/laravel';
import { roles, commonSkills } from '../data/mockData';

const AddWorker = () => {
  const { t } = useContext(LanguageContext)!;
  const { departmentInfo } = useContext(DepartmentContext)!;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    department: departmentInfo.name,
    employeeId: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    salary: '',
    skills: [] as string[],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: '',
    status: 'active',
    imageFile: null as File | null,
  });

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
        toast.error(t('addWorker.imageSizeError'));
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
    toast.success(t('addWorker.employeeIdGenerated'));
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
        toast.error(t('addWorker.requiredFieldsError'));
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error(t('addWorker.invalidEmailError'));
        return;
      }

      // Prepare worker data for API
      const workerData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        role: formData.role,
        department: formData.department,
        employee_id: formData.employeeId,
        date_of_joining: formData.dateOfJoining,
        salary: parseFloat(formData.salary) || 0,
        skills: formData.skills,
        emergency_contact: JSON.stringify(formData.emergencyContact),
        notes: formData.notes,
        status: formData.status,
        department_id: departmentInfo.id
      };

      // Call API to create worker
      const response = await workerService.create(workerData);
      
      if (response.data) {
        toast.success(t('addWorker.success', { name: `${formData.firstName} ${formData.lastName}`, department: departmentInfo.name }), {
          icon: departmentInfo.icon,
          duration: 4000
        });

        // Navigate back to workers page
        navigate('/workers');
      }
    } catch (error) {
      toast.error(t('addWorker.failedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title={t('addWorker.title', { department: departmentInfo.name })}
        subtitle={t('addWorker.subtitle', { description: departmentInfo.description.toLowerCase() })}
        action={
          <button
            onClick={() => navigate('/workers')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft size={16} className="mr-2" />
            {t('addWorker.backToWorkers')}
          </button>
        }
      />

      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                    <User size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('addWorker.personalInfo')}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.firstName')} *</label>
                    <input type="text" name="firstName" required className="w-full form-input" value={formData.firstName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.lastName')} *</label>
                    <input type="text" name="lastName" required className="w-full form-input" value={formData.lastName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.email')} *</label>
                    <input type="email" name="email" required className="w-full form-input" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.phone')} *</label>
                    <input type="tel" name="phone" required className="w-full form-input" value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.address')}</label>
                    <textarea name="address" rows={3} className="w-full form-input" value={formData.address} onChange={handleInputChange}></textarea>
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                    <Briefcase size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('addWorker.jobInfo')}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.role')} *</label>
                    <select name="role" required className="w-full form-input" value={formData.role} onChange={handleInputChange}>
                      <option value="">{t('addWorker.selectRole')}</option>
                      {roles[departmentInfo.id as keyof typeof roles].map((role: string) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.department')}</label>
                    <input type="text" name="department" disabled className="w-full form-input bg-gray-100" value={formData.department} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.employeeId')}</label>
                    <div className="flex">
                      <input type="text" name="employeeId" className="w-full form-input rounded-r-none" value={formData.employeeId} onChange={handleInputChange} />
                      <button type="button" onClick={generateEmployeeId} className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">{t('addWorker.generate')}</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.dateOfJoining')}</label>
                    <input type="date" name="dateOfJoining" className="w-full form-input" value={formData.dateOfJoining} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.salary')}</label>
                    <input type="number" name="salary" className="w-full form-input" value={formData.salary} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.status')}</label>
                    <select name="status" className="w-full form-input" value={formData.status} onChange={handleInputChange}>
                      <option value="active">{t('addWorker.active')}</option>
                      <option value="on leave">{t('addWorker.onLeave')}</option>
                      <option value="unavailable">{t('addWorker.unavailable')}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skills & Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                    <Award size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('addWorker.skillsAndNotes')}</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.skills')}</label>
                  <div className="flex mb-2">
                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="w-full form-input rounded-r-none" placeholder="e.g., Hand Stitching" />
                    <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">{t('addWorker.addSkill')}</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map(skill => (
                      <span key={skill} className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-blue-600 hover:text-blue-800">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.commonSkills', { department: departmentInfo.name })}</label>
                  <div className="flex flex-wrap gap-2">
                    {commonSkills[departmentInfo.id as keyof typeof commonSkills].map((skill: string) => (
                      <button type="button" key={skill} onClick={() => addCommonSkill(skill)} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm hover:bg-gray-300">
                        <Plus size={12} className="inline mr-1" /> {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.notes')}</label>
                  <textarea name="notes" rows={4} className="w-full form-input" value={formData.notes} onChange={handleInputChange}></textarea>
                </div>
              </div>
            </div>

            {/* Right Column: Image & Emergency Contact */}
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                    <Shield size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('addWorker.emergencyContact')}</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.contactName')}</label>
                    <input type="text" name="emergencyContact.name" className="w-full form-input" value={formData.emergencyContact.name} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.contactPhone')}</label>
                    <input type="tel" name="emergencyContact.phone" className="w-full form-input" value={formData.emergencyContact.phone} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('addWorker.relationship')}</label>
                    <input type="text" name="emergencyContact.relationship" className="w-full form-input" value={formData.emergencyContact.relationship} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('addWorker.profilePicture')}</h3>
                <div className="flex flex-col items-center">
                  {imagePreview ? (
                    <div className="relative w-40 h-40 mb-4">
                      <img src={imagePreview} alt="Worker preview" className="w-full h-full object-cover rounded-full" />
                      <button type="button" onClick={removeImage} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <User size={60} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex gap-4">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      <Upload size={16} className="mr-2" />
                      {t('addWorker.uploadImage')}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                      <Camera size={16} className="mr-2" />
                      {t('addWorker.takePhoto')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              <Save size={20} className="mr-3" />
              {loading ? 'Saving...' : t('addWorker.saveWorker')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddWorker;