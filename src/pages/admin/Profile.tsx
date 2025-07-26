import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Camera, 
  Save, Edit2, Shield, Award, Clock, Activity, Users
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  department: string;
  joinDate: string;
  bio: string;
  avatar: string;
}

const Profile: React.FC = () => {
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hudaaljarallah.com',
    phone: '+971 50 123 4567',
    address: 'Dubai, UAE',
    role: 'System Administrator',
    department: 'Management',
    joinDate: '2023-01-15',
    bio: 'Experienced system administrator with expertise in tailoring workshop management and operations.',
    avatar: 'https://i.pravatar.cc/150?img=1'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <PageHeader 
        title="My Profile"
        subtitle="Manage your personal information and account settings"
        action={
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {isEditing ? <Save size={16} className="mr-2" /> : <Edit2 size={16} className="mr-2" />}
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        }
      />

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div 
            className={`lg:col-span-1 rounded-lg shadow-sm p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={profileData.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
                />
                {isEditing && (
                  <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                    <Camera size={16} />
                  </button>
                )}
              </div>
              
              <h2 className={`text-xl font-semibold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className={`transition-colors duration-300 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {profileData.role}
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-center">
                  <Shield size={16} className="text-blue-500 mr-2" />
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Administrator Access
                  </span>
                </div>
                
                <div className="flex items-center justify-center">
                  <Calendar size={16} className="text-green-500 mr-2" />
                  <span className={`text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Joined {new Date(profileData.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div 
            className={`lg:col-span-2 rounded-lg shadow-sm p-6 transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <p className={`py-2 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {profileData.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <p className={`py-2 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {profileData.lastName}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <p className={`py-2 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {profileData.email}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    ) : (
                      <p className={`py-2 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {profileData.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                ) : (
                  <p className={`py-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {profileData.bio}
                  </p>
                )}
              </div>
              
              {isEditing && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancel}
                    className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Activity Stats */}
        <motion.div 
          className={`mt-6 rounded-lg shadow-sm p-6 transition-colors duration-300 ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className={`text-lg font-medium mb-4 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Activity Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity size={24} className="mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">127</div>
              <div className="text-sm text-gray-600">Actions Today</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award size={24} className="mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">98%</div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users size={24} className="mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">45</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock size={24} className="mx-auto text-orange-600 mb-2" />
              <div className="text-2xl font-bold text-orange-600">2.3h</div>
              <div className="text-sm text-gray-600">Avg Session</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;