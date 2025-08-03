import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { roleService, permissionService } from '../../api/laravel';
import { 
  Shield, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  HelpCircle,
  Check,
  AlertCircle
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
  users_count?: number;
}

interface Permission {
  name: string;
  display_name: string;
  description: string;
  module: string;
  action: string;
}

interface GroupedPermissions {
  [module: string]: {
    [permission: string]: Permission;
  };
}

const Permissions: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    is_system_role: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        roleService.getAll(),
        permissionService.getGrouped()
      ]);
      
      // التأكد من أن البيانات صحيحة قبل استخدامها
      const rolesData = rolesResponse?.data?.data || rolesResponse?.data || [];
      const permissionsData = permissionsResponse?.data?.data || permissionsResponse?.data || {};
      
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setGroupedPermissions(typeof permissionsData === 'object' ? permissionsData : {});
    } catch (error) {
      console.error('Failed to load data:', error);
      // تعيين قيم افتراضية في حالة الخطأ
      setRoles([]);
      setGroupedPermissions({});
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      is_system_role: false
    });
    setSelectedPermissions([]);
    setShowCreateModal(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      is_system_role: role.is_system_role
    });
    setSelectedPermissions(role.permissions || []);
    setShowEditModal(true);
  };

  const handleDeleteRole = async (role: Role) => {
    if (!window.confirm(t('roles.confirmDelete'))) return;
    
    try {
      await roleService.delete(role.id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  const handleSaveRole = async () => {
    try {
      const roleData = {
        ...formData,
        permissions: selectedPermissions
      };

      if (showEditModal && editingRole) {
        await roleService.update(editingRole.id, roleData);
      } else {
        await roleService.create(roleData);
      }

      await loadData();
      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingRole(null);
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const selectAllPermissions = () => {
    const allPermissions = Object.values(groupedPermissions)
      .flatMap(module => Object.keys(module));
    setSelectedPermissions(allPermissions);
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const getPermissionDisplayName = (permissionKey: string): string => {
    const [module, action] = permissionKey.split('.');
    const moduleName = t(`permissions.${module}`) || module;
    const actionName = t(`permissions.${action}`) || action;
    return `${moduleName} - ${actionName}`;
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">{t('roles.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="text-blue-500" size={32} />
              {t('roles.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('roles.subtitle')}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                theme === 'dark' 
                  ? 'border-gray-600 hover:border-gray-500' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <HelpCircle size={20} />
              {t('roles.showHelp')}
            </button>
            <button
              onClick={handleCreateRole}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              <Plus size={20} />
              {t('roles.createRole')}
            </button>
          </div>
        </div>

        {/* Help Section */}
        {showHelp && (
          <div className={`mb-6 p-4 rounded-lg border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
          }`}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <HelpCircle size={20} className="text-blue-500" />
              {t('roles.showHelp')}
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Administrator:</strong> {t('roles.default.administratorDesc')}</p>
              <p><strong>Department Manager:</strong> {t('roles.default.departmentManagerDesc')}</p>
              <p><strong>Worker:</strong> {t('roles.default.workerDesc')}</p>
              <p><strong>Viewer:</strong> {t('roles.default.viewerDesc')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roles Section */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users size={24} className="text-blue-500" />
                {t('roles.roles')}
              </h2>
              
              <div className="space-y-3">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{role.display_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {role.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{role.users_count || 0} {t('roles.usersCount')}</span>
                          {role.is_system_role && (
                            <span className="text-orange-500 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {t('roles.isSystemRole')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-1 text-blue-500 hover:text-blue-600"
                          title={t('roles.editRole')}
                        >
                          <Edit size={16} />
                        </button>
                        {!role.is_system_role && (
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="p-1 text-red-500 hover:text-red-600"
                            title={t('roles.deleteRole')}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings size={24} className="text-green-500" />
                {t('roles.permissionsList')}
              </h2>

              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([module, permissions]) => (
                  <div key={module}>
                    <h3 className="font-semibold text-lg mb-3 text-blue-600 dark:text-blue-400">
                      {t(`permissions.${module}`) || module}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(permissions).map(([permissionKey, permission]) => (
                        <div
                          key={permissionKey}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedPermissions.includes(permissionKey)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : theme === 'dark'
                              ? 'border-gray-600 hover:border-gray-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => togglePermission(permissionKey)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedPermissions.includes(permissionKey)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedPermissions.includes(permissionKey) && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{permission.display_name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Permission Actions */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={selectAllPermissions}
                  className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  {t('roles.allPermissions')}
                </button>
                <button
                  onClick={clearAllPermissions}
                  className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                >
                  {t('roles.noPermissions')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Role Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md p-6 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className="text-xl font-semibold mb-4">
              {showEditModal ? t('roles.editRole') : t('roles.createRole')}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('roles.roleName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('roles.displayName')}
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  className={`w-full p-2 border rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('roles.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className={`w-full p-2 border rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_system_role"
                  checked={formData.is_system_role}
                  onChange={(e) => setFormData({...formData, is_system_role: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="is_system_role" className="text-sm">
                  {t('roles.isSystemRole')}
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveRole}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                <Save size={16} />
                {t('common.save')}
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingRole(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                <X size={16} />
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;