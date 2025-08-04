
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DepartmentProvider } from './contexts/DepartmentContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CacheProvider } from './contexts/CacheContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Products from './pages/Products';
import CreateOrder from './pages/CreateOrder';
import OrderDetails from './pages/OrderDetails';
import ScheduleFitting from './pages/ScheduleFitting';
import Inventory from './pages/Inventory';
import AddInventoryItem from './pages/AddInventoryItem';
import ViewBarcode from './pages/ViewBarcode';
import EditInventoryItem from './pages/EditInventoryItem';
import OrderMoreInventory from './pages/OrderMoreInventory';
import Workers from './pages/Workers';
import Clients from './pages/Clients';
import AddWorker from './pages/AddWorker';
import EditWorker from './pages/EditWorker';
import WorkerDetails from './pages/WorkerDetails';
import Calendar from './pages/Calendar';
import SuitProductionFlow from './pages/SuitProductionFlow';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AssignTask from './pages/AssignTask';
import StationDisplay from './pages/StationDisplay';
import Analytics from './pages/Analytics';
import AdvancedFeatures from './pages/AdvancedFeatures';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import Sales from './pages/Sales';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import ProductionTracking from './pages/ProductionTracking';
import BarcodeQRManagement from './pages/BarcodeQRManagement';
import WorkerIpadDashboard from './pages/WorkerIpadDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import WorkflowDashboard from './pages/WorkflowDashboard';

// Admin pages
import Profile from './pages/admin/Profile';
import UserManagement from './pages/admin/UserManagement';
import RolesManagement from './pages/admin/RolesManagement';

import Permissions from './pages/admin/Permissions';
import SecurityLogs from './pages/admin/SecurityLogs';
import SystemSettings from './pages/admin/SystemSettings';
import Backup from './pages/admin/Backup';

// Auth pages
import Login from './pages/auth/Login';
import Logout from './pages/auth/Logout';
import Unauthorized from './pages/auth/Unauthorized';

// ERP pages
import ERPManagement from './pages/ERPManagement';
import OrdersManagement from './pages/OrdersManagement';

// Plugin Management
import PluginManagement from './pages/PluginManagement';
import RBACDashboard from './pages/RBACDashboard';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LanguageProvider>
            <CacheProvider>
              <AuthProvider>
                <DepartmentProvider>
                <Toaster position="top-right" />
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={
                    <ProtectedRoute requiredPermissions={['dashboard.view']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedRoute requiredPermissions={['orders.view']}>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="orders-management" element={
                    <ProtectedRoute requiredPermissions={['orders.view']}>
                      <OrdersManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="products" element={
                    <ProtectedRoute requiredPermissions={['products.view']}>
                      <Products />
                    </ProtectedRoute>
                  } />
                  <Route path="orders/create" element={
                    <ProtectedRoute requiredPermissions={['orders.create']}>
                      <CreateOrder />
                    </ProtectedRoute>
                  } />
                  <Route path="orders/:id" element={
                    <ProtectedRoute requiredPermissions={['orders.view']}>
                      <OrderDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="orders/:id/schedule-fitting" element={
                    <ProtectedRoute requiredPermissions={['orders.edit']}>
                      <ScheduleFitting />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory" element={
                    <ProtectedRoute requiredPermissions={['inventory.view']}>
                      <Inventory />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory/add" element={
                    <ProtectedRoute requiredPermissions={['inventory.create']}>
                      <AddInventoryItem />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory/:id/barcode" element={
                    <ProtectedRoute requiredPermissions={['inventory.view']}>
                      <ViewBarcode />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory/:id/edit" element={
                    <ProtectedRoute requiredPermissions={['inventory.edit']}>
                      <EditInventoryItem />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory/:id/order" element={
                    <ProtectedRoute requiredPermissions={['inventory.create']}>
                      <OrderMoreInventory />
                    </ProtectedRoute>
                  } />
                  <Route path="clients" element={
                    <ProtectedRoute requiredPermissions={['clients.view']}>
                      <Clients />
                    </ProtectedRoute>
                  } />
                  <Route path="workers" element={
                    <ProtectedRoute requiredPermissions={['workers.view']}>
                      <Workers />
                    </ProtectedRoute>
                  } />
                  <Route path="workers/add" element={
                    <ProtectedRoute requiredPermissions={['workers.create']}>
                      <AddWorker />
                    </ProtectedRoute>
                  } />
                  <Route path="workers/:id/edit" element={
                    <ProtectedRoute requiredPermissions={['workers.edit']}>
                      <EditWorker />
                    </ProtectedRoute>
                  } />
                  <Route path="workers/:id" element={
                    <ProtectedRoute requiredPermissions={['workers.view']}>
                      <WorkerDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="suit-production" element={<SuitProductionFlow />} />
                  <Route path="assign-task" element={<AssignTask />} />
                  <Route path="station-display" element={<StationDisplay />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="advanced-features" element={<AdvancedFeatures />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="invoices" element={<Invoices />} />
                  <Route path="invoices/create" element={<CreateInvoice />} />
                  <Route path="sales" element={<Sales />} />
                  <Route path="payroll" element={<Payroll />} />
                  <Route path="attendance" element={<Attendance />} />
                                    <Route path="production-tracking" element={<ProductionTracking />} />
                  <Route path="barcode-qr" element={<BarcodeQRManagement />} />
                  <Route path="worker-ipad" element={<WorkerIpadDashboard workerId={1} />} />
                  <Route path="workflow-dashboard" element={<WorkflowDashboard />} />
                  <Route path="manager-dashboard" element={<ManagerDashboard />} />
                  
                  {/* Admin Routes - with role-based protection */}
                  <Route path="admin/profile" element={<Profile />} />
                  <Route path="admin/users" element={
                    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/roles" element={
                    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                      <RolesManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/permissions" element={
                    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                      <Permissions />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/security-logs" element={
                    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                      <SecurityLogs />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/system-settings" element={
                    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                      <SystemSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/backup" element={
                    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                      <Backup />
                    </ProtectedRoute>
                  } />
                  
                  {/* ERP Management */}
                  <Route path="erp" element={
                    <ProtectedRoute allowedRoles={['system_super_admin', 'system_admin', 'super_admin']}>
                      <ERPManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* Plugin Management */}
                  <Route path="plugins" element={
                    <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                      <PluginManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* RBAC Dashboard */}
                  <Route path="rbac-dashboard" element={
                    <ProtectedRoute requiredRoles={['admin', 'system_administrator', 'super_admin']}>
                      <RBACDashboard />
                    </ProtectedRoute>
                  } />
                </Route>
                
                {/* Redirect to login for any unknown routes */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              </DepartmentProvider>
            </AuthProvider>
          </CacheProvider>
        </LanguageProvider>
      </Router>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;