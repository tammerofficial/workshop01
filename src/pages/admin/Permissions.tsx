import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, Check, X, Save, Search, 
  Filter, AlertTriangle, Info, HelpCircle
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
}

interface PermissionGroup {
  id: string;
  name: string;
  permissions: {
    id: string;
    name: string;
    description: string;
  }[];
}

const Permissions: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedRole, setSelectedRole] = useState<string>('admin');
  const [showHelp, setShowHelp] = useState(false);

  const [roles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: {
        'dashboard_view': true,
        'dashboard_edit': true,
        'orders_view': true,
        'orders_create': true,
        'orders_edit': true,
        'orders_delete': true,
        'inventory_view': true,
        'inventory_create': true,
        'inventory_edit': true,
        'inventory_delete': true,
        'workers_view': true,
        'workers_create': true,
        'workers_edit': true,
        'workers_delete': true,
        'reports_view': true,
        'reports_export': true,
        'settings_view': true,
        'settings_edit': true,
        'users_view': true,
        'users_create': true,
        'users_edit': true,
        'users_delete': true,
      }
    },
    {
      id: 'manager',
      name: 'Department Manager',
      description: 'Department-specific management access',
      permissions: {
        'dashboard_view': true,
        'dashboard_edit': false,
        'orders_view': true,
        'orders_create': true,
        'orders_edit': true,
        'orders_delete': false,
        'inventory_view': true,
        'inventory_create': true,
        'inventory_edit': true,
        'inventory_delete': false,
        'workers_view': true,
        'workers_create': true,
        'workers_edit': true,
        'workers_delete': false,
        'reports_view': true,
        'reports_export': true,
        'settings_view': true,
        'settings_edit': false,
        'users_view': true,
        'users_create': false,
        'users_edit': false,
        'users_delete': false,
      }
    },
    {
      id: 'worker',
      name: 'Worker',
      description: 'Limited access to assigned tasks and orders',
      permissions: {
        'dashboard_view': true,
        'dashboard_edit': false,
        'orders_view': true,
        'orders_create': false,
        'orders_edit': false,
        'orders_delete': false,
        'inventory_view': true,
        'inventory_create': false,
        'inventory_edit': false,
        'inventory_delete': false,
        'workers_view': false,
        'workers_create': false,
        'workers_edit': false,
        'workers_delete': false,
        'reports_view': false,
        'reports_export': false,
        'settings_view': false,
        'settings_edit': false,
        'users_view': false,
        'users_create': false,
        'users_edit': false,
        'users_delete': false,
      }
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access to system data',
      permissions: {
        'dashboard_view': true,
        'dashboard_edit': false,
        'orders_view': true,
        'orders_create': false,
        'orders_edit': false,
        'orders_delete': false,
        'inventory_view': true,
        'inventory_create': false,
        'inventory_edit': false,
        'inventory_delete': false,
        'workers_view': true,
        'workers_create': false,
        'workers_edit': false,
        'workers_delete': false,
        'reports_view': true,
        'reports_export': false,
        'settings_view': false,
        'settings_edit': false,
        'users_view': false,
        'users_create': false,
        'users_edit': false,
        'users_delete': false,
      }
    }
  ]);

  const permissionGroups: PermissionGroup[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      permissions: [
        { id: 'dashboard_view', name: 'View Dashboard', description: 'Access to view dashboard and statistics' },
        { id: 'dashboard_edit', name: 'Edit Dashboard', description: 'Ability to customize dashboard widgets and layout' }
      ]
    },
    {
      id: 'orders',
      name: 'Orders',
      permissions: [
        { id: 'orders_view', name: 'View Orders', description: 'Access to view all orders' },
        { id: 'orders_create', name: 'Create Orders', description: 'Ability to create new orders' },
        { id: 'orders_edit', name: 'Edit Orders', description: 'Ability to modify existing orders' },
        { id: 'orders_delete', name: 'Delete Orders', description: 'Ability to delete orders' }
      ]
    },
    {
      id: 'inventory',
      name: 'Inventory',
      permissions: [
        { id: 'inventory_view', name: 'View Inventory', description: 'Access to view inventory items' },
        { id: 'inventory_create', name: 'Create Inventory', description: 'Ability to add new inventory items' },
        { id: 'inventory_edit', name: 'Edit Inventory', description: 'Ability to modify inventory items' },
        { id: 'inventory_delete', name: 'Delete Inventory', description: 'Ability to delete inventory items' }
      ]
    },
    {
      id: 'workers',
      name: 'Workers',
      permissions: [
        { id: 'workers_view', name: 'View Workers', description: 'Access to view worker profiles' },
        { id: 'workers_create', name: 'Create Workers', description: 'Ability to add new workers' },
        { id: 'workers_edit', name: 'Edit Workers', description: 'Ability to modify worker information' },
        { id: 'workers_delete', name: 'Delete Workers', description: 'Ability to remove workers' }
      ]
    },
    {
      id: 'reports',
      name: 'Reports & Analytics',
      permissions: [
        { id: 'reports_view', name: 'View Reports', description: 'Access to view reports and analytics' },
        { id: 'reports_export', name: 'Export Reports', description: 'Ability to export reports' }
      ]
    },
    {
      id: 'settings',
      name: 'Settings',
      permissions: [
        { id: 'settings_view', name: 'View Settings', description: 'Access to view system settings' },
        { id: 'settings_edit', name: 'Edit Settings', description: 'Ability to modify system settings' }
      ]
    },
    {
      id: 'users',
      name: 'User Management',
      permissions: [
        { id: 'users_view', name: 'View Users', description: 'Access to view system users' },
        { id: 'users_create', name: 'Create Users', description: 'Ability to add new users' },
        { id: 'users_edit', name: 'Edit Users', description: 'Ability to modify user information' },
        { id: 'users_delete', name: 'Delete Users', description: 'Ability to remove users' }
      ]
    }
  ];

  const currentRole = roles.find(role => role.id === selectedRole) || roles[0];

  const togglePermission = (permissionId: string) => {
    // In a real app, this would update the state and eventually save to the backend
    console.log(`Toggling permission ${permissionId} for role ${selectedRole}`);
    toast.success(`Permission updated for ${currentRole.name} role`);
  };

  const savePermissions = () => {
    toast.success(`Permissions saved for ${currentRole.name} role`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <PageHeader 
        title="Roles & Permissions"
        subtitle="Manage user roles and access permissions"
        action={
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors duration-200 ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <HelpCircle size={16} className="mr-2" />
            {showHelp ? 'Hide Help' : 'Show Help'}
          </button>
        }
      />

      <div className="max-w-7xl mx-auto">
        {/* Help Panel */}
        {showHelp && (
          <motion.div 
            className={`rounded-lg shadow-sm p-6 mb-6 transition-colors duration-300 ${
              isDark ? 'bg-blue-900 border border-blue-800' : 'bg-blue-50 border border-blue-100'
            }`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-start">
              <Info size={24} className="text-blue-500 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h3 className={`text-lg font-medium mb-2 transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-blue-800'
                }`}>
                  Understanding Roles & Permissions
                </h3>
                <div className={`space-y-2 transition-colors duration-300 ${
                  isDark ? 'text-blue-100' : 'text-blue-700'
                }`}>
                  <p>Roles define a set of permissions that determine what actions users can perform in the system.</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Administrator:</strong> Has full access to all system features</li>
                    <li><strong>Department Manager:</strong> Can manage their department but has limited system-wide access</li>
                    <li><strong>Worker:</strong> Has access only to assigned tasks and related information</li>
                    <li><strong>Viewer:</strong> Has read-only access to system data</li>
                  </ul>
                  <p className="mt-2">To modify permissions, select a role and toggle the permissions as needed.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Role Selection */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <div className={`p-4 border-b transition-colors duration-300 ${
                isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <h3 className={`font-medium transition-colors duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Roles
                </h3>
              </div>
              
              <div className="p-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors duration-200 ${
                      selectedRole === role.id
                        ? isDark 
                          ? 'bg-blue-900 text-white' 
                          : 'bg-blue-50 text-blue-700'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Shield size={16} className="mr-2" />
                      <div>
                        <div className="font-medium">{role.name}</div>
                        <div className={`text-xs transition-colors duration-300 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Permissions Grid */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <div className={`p-4 border-b transition-colors duration-300 ${
                isDark ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentRole.name} Permissions
                  </h3>
                  <button
                    onClick={savePermissions}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save size={14} className="mr-1" />
                    Save Changes
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                {permissionGroups.map((group) => (
                  <div key={group.id} className="mb-6">
                    <h4 className={`text-md font-medium mb-3 transition-colors duration-300 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {group.name}
                    </h4>
                    
                    <div className={`rounded-lg border transition-colors duration-300 ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      {group.permissions.map((permission, index) => (
                        <div 
                          key={permission.id}
                          className={`flex items-center justify-between p-3 ${
                            index !== group.permissions.length - 1 
                              ? isDark 
                                ? 'border-b border-gray-700' 
                                : 'border-b border-gray-200'
                              : ''
                          }`}
                        >
                          <div>
                            <div className={`font-medium transition-colors duration-300 ${
                              isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                              {permission.name}
                            </div>
                            <div className={`text-sm transition-colors duration-300 ${
                              isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {permission.description}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => togglePermission(permission.id)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              currentRole.permissions[permission.id] 
                                ? 'bg-blue-600' 
                                : isDark 
                                  ? 'bg-gray-600' 
                                  : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                currentRole.permissions[permission.id] ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;