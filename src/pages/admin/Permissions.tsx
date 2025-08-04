import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { roleApi, permissionService } from '../../api/laravel';
import { 
  Shield, 
  Users, 
  Settings, 
  Check, 
  X, 
  Edit, 
  Save,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  User,
  Crown
} from 'lucide-react';

interface Permission {
  id: number;
  name: string;
  display_name: string;
  description: string;
  module: string;
  action: string;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
  users_count?: number;
}

interface GroupedPermissions {
  [module: string]: { [key: string]: Permission };
}

const Permissions: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Force fresh data by adding timestamp
      const timestamp = Date.now();
      const [rolesResponse, permissionsResponse] = await Promise.all([
        roleApi.getRoles({ _t: timestamp }),
        roleApi.getAvailablePermissions({ _t: timestamp })
      ]);
      
      const rolesData = rolesResponse?.data?.data || rolesResponse?.data || [];
      const permissionsData = permissionsResponse?.data?.data || permissionsResponse?.data || {};
      
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setGroupedPermissions(typeof permissionsData === 'object' && permissionsData !== null ? permissionsData : {});
      
      // Expand all modules by default
      if (typeof permissionsData === 'object' && permissionsData !== null) {
        setExpandedModules(Object.keys(permissionsData));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setRoles([]);
      setGroupedPermissions({});
      // Show error message to user
      alert('فشل في تحميل البيانات. يرجى تحديث الصفحة والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    // Ensure permissions is always an array
    const rolePermissions = Array.isArray(role.permissions) ? role.permissions : [];
    setSelectedPermissions([...rolePermissions]);
  };

  const handleSaveRole = async () => {
    if (!editingRole) return;
    
    try {
      setSaving(true);
      const roleData = {
        name: editingRole.name,
        display_name: editingRole.display_name,
        description: editingRole.description,
        permissions: selectedPermissions
      };

      await roleApi.updateRole(editingRole.id, roleData);
      await loadData();
      setEditingRole(null);
      setSelectedPermissions([]);
    } catch (error) {
      console.error('Failed to save role:', error);
      alert('فشل في حفظ الصلاحيات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const toggleModule = (moduleName: string) => {
    const modulePermissions = groupedPermissions[moduleName] || {};
    const modulePermissionNames = Object.keys(modulePermissions);
    
    const allSelected = modulePermissionNames.every(p => selectedPermissions.includes(p));
    
    if (allSelected) {
      // Deselect all module permissions
      setSelectedPermissions(prev => prev.filter(p => !modulePermissionNames.includes(p)));
    } else {
      // Select all module permissions
      setSelectedPermissions(prev => [
        ...prev.filter(p => !modulePermissionNames.includes(p)),
        ...modulePermissionNames
      ]);
    }
  };

  const selectAllPermissions = () => {
    const allPermissions = Object.values(groupedPermissions)
      .flatMap(permissions => Object.keys(permissions));
    setSelectedPermissions(allPermissions);
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const toggleModuleExpansion = (moduleName: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const getModuleDisplayName = (moduleName: string): string => {
    const moduleNames: { [key: string]: string } = {
      'dashboard': 'لوحة التحكم',
      'users': 'إدارة المستخدمين',
      'orders': 'الطلبات',
      'production': 'الإنتاج',
      'inventory': 'المخزون',
      'workers': 'العمال',
      'clients': 'العملاء',
      'reports': 'التقارير والتحليلات',
      'analytics': 'التحليلات',
      'calendar': 'التقويم',
      'tasks': 'المهام',
      'payroll': 'كشف الرواتب',
      'invoices': 'الفواتير',
      'settings': 'الإعدادات',
      'roles': 'الأدوار',
      'permissions': 'الصلاحيات',
      'system': 'النظام',
      'department': 'الأقسام',
      'loyalty': 'نظام الولاء',
      'attendance': 'الحضور'
    };
    return moduleNames[moduleName] || moduleName;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('permissions.title', 'إدارة الصلاحيات')}</h1>
              <p className="text-gray-600">{t('permissions.subtitle', 'تحرير صلاحيات الأدوار المختلفة')}</p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg 
              className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'جاري التحديث...' : 'تحديث البيانات'}
          </button>
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 ml-2" />
          {t('permissions.available_roles', 'الأدوار المتاحة')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                editingRole?.id === role.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  {role.is_system_role ? (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <User className="h-4 w-4 text-gray-500" />
                  )}
                  <h3 className="font-semibold text-gray-900">{role.display_name}</h3>
                </div>
                {editingRole?.id === role.id ? (
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={handleSaveRole}
                      disabled={saving}
                      className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditRole(role)}
                    className="p-1 text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{role.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {(role.permissions || []).length} صلاحية
                </span>
                <span className="text-gray-500">
                  {role.users_count || 0} مستخدم
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Editor */}
      {editingRole && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Settings className="h-5 w-5 ml-2" />
              تحرير صلاحيات: {editingRole.display_name}
            </h2>
            
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={selectAllPermissions}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                تحديد الكل
              </button>
              <button
                onClick={clearAllPermissions}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                إلغاء الكل
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([moduleName, permissions]) => {
              const permissionsArray = Object.values(permissions);
              const modulePermissionNames = Object.keys(permissions);
              const selectedCount = modulePermissionNames.filter(p => selectedPermissions.includes(p)).length;
              const totalCount = modulePermissionNames.length;
              const allSelected = selectedCount === totalCount;
              const someSelected = selectedCount > 0 && selectedCount < totalCount;
              const isExpanded = expandedModules.includes(moduleName);

              return (
                <div key={moduleName} className="border border-gray-200 rounded-lg">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <button
                          onClick={() => toggleModuleExpansion(moduleName)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => toggleModule(moduleName)}
                          className="flex items-center space-x-2 space-x-reverse"
                        >
                          {allSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : someSelected ? (
                            <div className="h-5 w-5 border-2 border-blue-600 bg-blue-200 rounded"></div>
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="font-medium text-gray-900">
                            {getModuleDisplayName(moduleName)}
                          </span>
                        </button>
                      </div>
                      
                      <span className="text-sm text-gray-500">
                        {selectedCount}/{totalCount}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {permissionsArray.map((permission) => (
                        <label
                          key={permission.name}
                          className="flex items-start space-x-3 space-x-reverse cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(permission.name)}
                            onChange={() => togglePermission(permission.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {permission.display_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {permission.description}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {permission.name}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save/Cancel Footer */}
          <div className="flex justify-end space-x-3 space-x-reverse mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleSaveRole}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 space-x-reverse"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>حفظ الصلاحيات</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* No Role Selected */}
      {!editingRole && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('permissions.select_role', 'اختر دوراً لتحرير صلاحياته')}
          </h3>
          <p className="text-gray-600">
            {t('permissions.select_role_hint', 'انقر على أيقونة التحرير بجانب أي دور لبدء تعديل صلاحياته')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Permissions;