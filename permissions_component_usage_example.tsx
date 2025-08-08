// Example React component showing how to use the permissions translations
// This is for reference only - shows how to properly use the translation keys

import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Role {
  id: string;
  name: string;
  display_name?: string;
  description?: string;
  permissions_count: number;
  users_count: number;
}

const PermissionsComponent: React.FC = () => {
  const { t } = useLanguage();
  
  // Mock roles data - replace with actual API data
  const roles: Role[] = [
    {
      id: '1',
      name: 'super_admin',
      display_name: 'سوبر أدمن',
      description: 'صلاحيات كاملة لجميع أجزاء النظام',
      permissions_count: 124,
      users_count: 3
    },
    {
      id: '2', 
      name: 'System Administrator',
      display_name: 'System Administrator',
      description: 'Full system access with all permissions and emergency access',
      permissions_count: 81,
      users_count: 0
    }
  ];

  // Function to get translated role name
  const getRoleName = (role: Role) => {
    // First try the roleDisplayNames mapping
    const translatedName = t(`permissions.roleDisplayNames.${role.name}`);
    if (translatedName && !translatedName.startsWith('permissions.')) {
      return translatedName;
    }
    
    // Fallback to display_name or name
    return role.display_name || role.name;
  };

  // Function to get translated role description  
  const getRoleDescription = (role: Role) => {
    // First try the roleDescriptions mapping
    const translatedDesc = t(`permissions.roleDescriptions.${role.name}`);
    if (translatedDesc && !translatedDesc.startsWith('permissions.')) {
      return translatedDesc;
    }
    
    // Fallback to description or name
    return role.description || role.name;
  };

  return (
    <div className="permissions-management">
      <div className="header">
        <h1>{t('permissions.title')}</h1>
        <p>{t('permissions.subtitle')}</p>
        <button>{t('permissions.refreshData')}</button>
      </div>

      <div className="roles-section">
        <h2>{t('permissions.availableRoles')}</h2>
        
        <div className="roles-grid">
          {roles.map((role) => (
            <div key={role.id} className="role-card">
              <h3>{getRoleName(role)}</h3>
              <p>{getRoleDescription(role)}</p>
              
              <div className="role-stats">
                <span>
                  {role.permissions_count} {t('permissions.permissionCount')}
                </span>
                <span>
                  {role.users_count} {t('permissions.userCount')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="role-selection">
        <h3>{t('permissions.selectRole')}</h3>
        <p>{t('permissions.selectRoleHint')}</p>
      </div>
    </div>
  );
};

export default PermissionsComponent;

/*
Usage Notes:
============

1. Main Interface Translations:
   - t('permissions.title') → "Permissions Management" / "إدارة الصلاحيات"
   - t('permissions.subtitle') → "Manage roles and their permissions" / "إدارة الأدوار وصلاحياتها"
   - t('permissions.refreshData') → "Refresh Data" / "تحديث البيانات"
   - t('permissions.availableRoles') → "Available Roles" / "الأدوار المتاحة"

2. Role Name Translation:
   - t('permissions.roleDisplayNames.super_admin') → "Super Admin" / "سوبر أدمن"
   - t('permissions.roleDisplayNames.System Administrator') → "System Administrator" / "مدير النظام"
   - t('permissions.roleDisplayNames.Worker') → "Worker" / "عامل"

3. Role Description Translation:
   - t('permissions.roleDescriptions.super_admin') → "Full permissions for all system parts" / "صلاحيات كاملة لجميع أجزاء النظام"
   - t('permissions.roleDescriptions.System Administrator') → "Full system access..." / "وصول كامل للنظام..."

4. Counter Labels:
   - t('permissions.permissionCount') → "permissions" / "صلاحية"
   - t('permissions.userCount') → "users" / "مستخدم"

5. Selection Guidance:
   - t('permissions.selectRole') → "Select a role to view permissions" / "اختر دور لعرض الصلاحيات"
   - t('permissions.selectRoleHint') → "Choose a role from the list above..." / "اختر دوراً من القائمة أعلاه..."

Key Benefits:
=============
✅ Handles both snake_case (super_admin) and space-separated (System Administrator) role names
✅ Supports mixed Arabic/English role names from database
✅ Fallback mechanism if translation key not found
✅ Proper counting labels for permissions and users
✅ Complete interface translation support
✅ Professional role management interface

Translation Keys Added:
======================
- 6 main interface keys
- 20 role display name mappings  
- 20 role description mappings
- 2 counter labels
- 2 selection guidance keys
Total: 50 translation keys per language
*/