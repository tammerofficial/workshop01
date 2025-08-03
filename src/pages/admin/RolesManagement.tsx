import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Shield, 
  Users, 
  Settings,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { rbacApi } from '../../api/laravel';

interface Permission {
  name: string;
  display_name: string;
  description: string;
  module: string;
  action: string;
  scope?: string;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  hierarchy_level: number;
  parent_role_id?: number;
  permissions: string[];
  users_count: number;
  is_system_role: boolean;
  is_inheritable: boolean;
  children?: Role[];
}

const RolesManagement: React.FC = () => {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    parent_role_id: '',
    is_inheritable: true,
    permissions: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        rbacApi.getRoleHierarchy(),
        rbacApi.getGroupedPermissions()
      ]);

      if (rolesResponse.data) {
        setRoles(rolesResponse.data);
      }

      if (permissionsResponse.data) {
        setPermissions(permissionsResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Use mock data
      const mockRoles: Role[] = [
        {
          id: 1,
          name: 'system_administrator',
          display_name: 'مدير النظام',
          description: 'صلاحيات كاملة للنظام',
          hierarchy_level: 0,
          permissions: ['*'],
          users_count: 1,
          is_system_role: true,
          is_inheritable: true
        },
        {
          id: 2,
          name: 'administrator',
          display_name: 'مدير',
          description: 'مدير عام مع صلاحيات إدارية',
          hierarchy_level: 1,
          parent_role_id: 1,
          permissions: ['users.manage', 'orders.manage', 'products.manage'],
          users_count: 140,
          is_system_role: true,
          is_inheritable: true
        },
        {
          id: 3,
          name: 'production_manager',
          display_name: 'مدير الإنتاج',
          description: 'مدير قسم الإنتاج',
          hierarchy_level: 3,
          parent_role_id: 2,
          permissions: ['production.manage', 'workers.view', 'orders.view'],
          users_count: 0,
          is_system_role: true,
          is_inheritable: true
        }
      ];

      const mockPermissions = {
        'dashboard': [
          { name: 'dashboard.view', display_name: 'عرض لوحة التحكم', description: 'الوصول للوحة التحكم الرئيسية', module: 'dashboard', action: 'view' },
        ],
        'users': [
          { name: 'users.view', display_name: 'عرض المستخدمين', description: 'عرض قائمة المستخدمين', module: 'users', action: 'view' },
          { name: 'users.create', display_name: 'إنشاء مستخدم', description: 'إضافة مستخدمين جدد', module: 'users', action: 'create' },
          { name: 'users.edit', display_name: 'تعديل المستخدمين', description: 'تعديل بيانات المستخدمين', module: 'users', action: 'edit' },
          { name: 'users.delete', display_name: 'حذف المستخدمين', description: 'حذف المستخدمين', module: 'users', action: 'delete' },
          { name: 'users.manage', display_name: 'إدارة المستخدمين', description: 'إدارة كاملة للمستخدمين', module: 'users', action: 'manage' },
        ],
        'roles': [
          { name: 'roles.view', display_name: 'عرض الأدوار', description: 'عرض الأدوار والصلاحيات', module: 'roles', action: 'view' },
          { name: 'roles.create', display_name: 'إنشاء أدوار', description: 'إنشاء أدوار جديدة', module: 'roles', action: 'create' },
          { name: 'roles.edit', display_name: 'تعديل الأدوار', description: 'تعديل الأدوار الموجودة', module: 'roles', action: 'edit' },
          { name: 'roles.delete', display_name: 'حذف الأدوار', description: 'حذف الأدوار', module: 'roles', action: 'delete' },
          { name: 'roles.manage', display_name: 'إدارة الأدوار', description: 'إدارة كاملة للأدوار', module: 'roles', action: 'manage' },
        ],
        'orders': [
          { name: 'orders.view', display_name: 'عرض الطلبات', description: 'عرض الطلبات', module: 'orders', action: 'view' },
          { name: 'orders.create', display_name: 'إنشاء طلبات', description: 'إنشاء طلبات جديدة', module: 'orders', action: 'create' },
          { name: 'orders.edit', display_name: 'تعديل الطلبات', description: 'تعديل الطلبات', module: 'orders', action: 'edit' },
          { name: 'orders.delete', display_name: 'حذف الطلبات', description: 'حذف الطلبات', module: 'orders', action: 'delete' },
          { name: 'orders.manage', display_name: 'إدارة الطلبات', description: 'إدارة كاملة للطلبات', module: 'orders', action: 'manage' },
        ],
        'products': [
          { name: 'products.view', display_name: 'عرض المنتجات', description: 'عرض المنتجات', module: 'products', action: 'view' },
          { name: 'products.create', display_name: 'إنشاء منتجات', description: 'إضافة منتجات جديدة', module: 'products', action: 'create' },
          { name: 'products.edit', display_name: 'تعديل المنتجات', description: 'تعديل المنتجات', module: 'products', action: 'edit' },
          { name: 'products.delete', display_name: 'حذف المنتجات', description: 'حذف المنتجات', module: 'products', action: 'delete' },
          { name: 'products.manage', display_name: 'إدارة المنتجات', description: 'إدارة كاملة للمنتجات', module: 'products', action: 'manage' },
        ],
        'production': [
          { name: 'production.view', display_name: 'عرض الإنتاج', description: 'عرض عمليات الإنتاج', module: 'production', action: 'view' },
          { name: 'production.manage', display_name: 'إدارة الإنتاج', description: 'إدارة عمليات الإنتاج', module: 'production', action: 'manage' },
        ],
        'workers': [
          { name: 'workers.view', display_name: 'عرض العمال', description: 'عرض قائمة العمال', module: 'workers', action: 'view' },
          { name: 'workers.manage', display_name: 'إدارة العمال', description: 'إدارة العمال', module: 'workers', action: 'manage' },
        ]
      };

      setRoles(mockRoles);
      setPermissions(mockPermissions);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      console.log('Creating role:', formData);
      
      const newRole: Role = {
        id: roles.length + 1,
        name: formData.name,
        display_name: formData.display_name,
        description: formData.description,
        hierarchy_level: formData.parent_role_id ? 
          (roles.find(r => r.id === parseInt(formData.parent_role_id))?.hierarchy_level || 0) + 1 : 0,
        parent_role_id: formData.parent_role_id ? parseInt(formData.parent_role_id) : undefined,
        permissions: formData.permissions,
        users_count: 0,
        is_system_role: false,
        is_inheritable: formData.is_inheritable
      };

      setRoles([...roles, newRole]);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async () => {
    try {
      if (selectedRole) {
        console.log('Updating role:', selectedRole.id, formData);
        
        const updatedRoles = roles.map(role => 
          role.id === selectedRole.id 
            ? { 
                ...role, 
                name: formData.name,
                display_name: formData.display_name,
                description: formData.description,
                parent_role_id: formData.parent_role_id ? parseInt(formData.parent_role_id) : undefined,
                permissions: formData.permissions,
                is_inheritable: formData.is_inheritable
              }
            : role
        );
        setRoles(updatedRoles);
      }
      
      setShowEditModal(false);
      setSelectedRole(null);
      resetForm();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async () => {
    try {
      if (selectedRole) {
        console.log('Deleting role:', selectedRole.id);
        setRoles(roles.filter(role => role.id !== selectedRole.id));
      }
      
      setShowDeleteConfirm(false);
      setSelectedRole(null);
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      parent_role_id: '',
      is_inheritable: true,
      permissions: []
    });
  };

  const openEditModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      parent_role_id: role.parent_role_id?.toString() || '',
      is_inheritable: role.is_inheritable,
      permissions: [...role.permissions]
    });
    setShowEditModal(true);
  };

  const openPermissionsModal = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      ...formData,
      permissions: [...role.permissions]
    });
    setShowPermissionsModal(true);
  };

  const togglePermission = (permissionName: string) => {
    const newPermissions = formData.permissions.includes(permissionName)
      ? formData.permissions.filter(p => p !== permissionName)
      : [...formData.permissions, permissionName];
    
    setFormData({ ...formData, permissions: newPermissions });
  };

  const toggleModule = (moduleName: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            {t('roles.title')}
          </h1>
          <p className="text-gray-600 mt-1">إدارة الأدوار والصلاحيات</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('roles.createRole')}
        </motion.button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث في الأدوار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Roles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  role.is_system_role ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  <Shield className={`w-5 h-5 ${
                    role.is_system_role ? 'text-purple-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="mr-3">
                  <h3 className="text-lg font-semibold text-gray-900">{role.display_name}</h3>
                  <p className="text-sm text-gray-500">المستوى: {role.hierarchy_level}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                {role.is_system_role && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    نظام
                  </span>
                )}
                {role.is_inheritable && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    وراثي
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{role.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                {role.users_count} مستخدم
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-1" />
                {role.permissions.length} صلاحية
              </div>
            </div>

            <div className="flex justify-between space-x-2 space-x-reverse">
              <button
                onClick={() => openPermissionsModal(role)}
                className="flex-1 bg-green-100 text-green-700 py-2 px-3 rounded-md hover:bg-green-200 transition-colors text-sm flex items-center justify-center"
              >
                <Settings className="w-4 h-4 mr-1" />
                الصلاحيات
              </button>
              <button
                onClick={() => openEditModal(role)}
                className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded-md hover:bg-blue-200 transition-colors text-sm flex items-center justify-center"
                disabled={role.is_system_role}
              >
                <Edit className="w-4 h-4 mr-1" />
                تعديل
              </button>
              <button
                onClick={() => {
                  setSelectedRole(role);
                  setShowDeleteConfirm(true);
                }}
                className="bg-red-100 text-red-700 py-2 px-3 rounded-md hover:bg-red-200 transition-colors"
                disabled={role.is_system_role || role.users_count > 0}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                {t('roles.createRole')}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم الدور (بالإنجليزية)
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="production_manager"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم الدور (للعرض)
                    </label>
                    <input
                      type="text"
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="مدير الإنتاج"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور الأب
                  </label>
                  <select
                    value={formData.parent_role_id}
                    onChange={(e) => setFormData({...formData, parent_role_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">بدون دور أب</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.display_name} (المستوى {role.hierarchy_level})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="create_is_inheritable"
                    checked={formData.is_inheritable}
                    onChange={(e) => setFormData({...formData, is_inheritable: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="create_is_inheritable" className="mr-2 block text-sm text-gray-900">
                    دور وراثي (يمكن وراثة الصلاحيات)
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateRole}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  إنشاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                صلاحيات الدور: {selectedRole.display_name}
              </h3>
              <div className="space-y-4">
                {Object.entries(permissions).map(([moduleName, modulePermissions]) => (
                  <div key={moduleName} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleModule(moduleName)}
                      className="w-full px-4 py-3 bg-gray-50 text-right flex items-center justify-between hover:bg-gray-100"
                    >
                      <span className="font-medium text-gray-900 capitalize">
                        {moduleName === 'users' ? 'المستخدمين' :
                         moduleName === 'roles' ? 'الأدوار' :
                         moduleName === 'orders' ? 'الطلبات' :
                         moduleName === 'products' ? 'المنتجات' :
                         moduleName === 'production' ? 'الإنتاج' :
                         moduleName === 'workers' ? 'العمال' :
                         moduleName === 'dashboard' ? 'لوحة التحكم' :
                         moduleName}
                      </span>
                      {expandedModules.includes(moduleName) ? 
                        <ChevronDown className="w-5 h-5" /> : 
                        <ChevronRight className="w-5 h-5" />
                      }
                    </button>
                    {expandedModules.includes(moduleName) && (
                      <div className="p-4 space-y-2">
                        {modulePermissions.map((permission) => (
                          <label key={permission.name} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.name)}
                              onChange={() => togglePermission(permission.name)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="mr-3">
                              <div className="text-sm font-medium text-gray-900">
                                {permission.display_name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {permission.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-2 space-x-reverse mt-6">
                <button
                  onClick={() => {
                    setShowPermissionsModal(false);
                    setSelectedRole(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    if (selectedRole) {
                      const updatedRoles = roles.map(role =>
                        role.id === selectedRole.id
                          ? { ...role, permissions: formData.permissions }
                          : role
                      );
                      setRoles(updatedRoles);
                    }
                    setShowPermissionsModal(false);
                    setSelectedRole(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  حفظ الصلاحيات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                حذف الدور
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  هل أنت متأكد من حذف الدور "{selectedRole.display_name}"؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex justify-center space-x-2 space-x-reverse mt-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedRole(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteRole}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManagement;