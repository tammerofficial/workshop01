import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Phone, Mail, MapPin, 
  Award, Calendar, Upload, X, Plus, Camera,
  AlertTriangle, Briefcase, Shield
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import toast from 'react-hot-toast';

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
    toast.success('Employee ID generated automatically');
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
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
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

      toast.success(`${formData.firstName} ${formData.lastName} updated successfully!`, {
        icon: departmentInfo.icon,
        duration: 4000
      });

      // Navigate back to workers page
      navigate('/workers');
    } catch (error) {
      toast.error('Failed to update worker. Please try again.');
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (!worker) {
          return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
              <div className="text-center">
                <User size={48} className="mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Worker Not Found</h2>
                <p className="text-gray-500 mb-4">The worker you're looking for doesn't exist or has been removed.</p>
                <button
                  onClick={() => navigate('/workers')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Workers
                </button>
              </div>
            </div>
          );
        }

        return (
          <div>
            <PageHeader 
              title={`Edit Worker - ${worker.name}`}
              subtitle={`${departmentInfo.name} • Update team member information`}
              action={
                <button
                  onClick={() => navigate('/workers')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Workers
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
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <User size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="worker@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+971 50 123 4567"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        name="address"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <Briefcase size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Employment Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role/Position *
                      </label>
                      <select
                        name="role"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.role}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a role</option>
                        {roles[departmentInfo.id as keyof typeof roles].map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        name="department"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        value={formData.department}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          name="employeeId"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.employeeId}
                          onChange={handleInputChange}
                          placeholder="Enter ID or generate automatically"
                        />
                        <button
                          type="button"
                          onClick={generateEmployeeId}
                          className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="Generate Employee ID"
                        >
                          <Shield size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Joining
                      </label>
                      <input
                        type="date"
                        name="dateOfJoining"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.dateOfJoining}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Salary
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="salary"
                          step="0.01"
                          min="0"
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.salary}
                          onChange={handleInputChange}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Active</option>
                        <option value="on leave">On Leave</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <Award size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Add Custom Skill */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Skills
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter a skill"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-3 py-2 bg-blue-600 text-white border border-blue-600 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Common Skills */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Common Skills for {departmentInfo.name}
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
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selected Skills
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map(skill => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
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
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <AlertTriangle size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        placeholder="+971 50 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship
                      </label>
                      <select
                        name="emergencyContact.relationship"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.emergencyContact.relationship}
                        onChange={handleInputChange}
                      >
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="child">Child</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Profile Photo */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <Camera size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-full border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-2">Upload profile photo</p>
                        <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
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
                          <Plus size={16} className="mr-2" />
                          Choose Photo
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`w-10 h-10 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white mr-3`}>
                      <Calendar size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
                  </div>
                  
                  <textarea
                    name="notes"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional notes about the worker, special requirements, certifications, etc..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/workers')}
                    className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating Worker...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Update Worker
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