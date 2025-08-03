import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DepartmentProvider } from './contexts/DepartmentContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CacheProvider } from './contexts/CacheContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
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

// Admin pages
import Profile from './pages/admin/Profile';
import UserManagement from './pages/admin/UserManagement';
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
import OrdersNew from './pages/OrdersNew';

// Plugin Management
import PluginManagement from './pages/PluginManagement';
import RBACDashboard from './pages/RBACDashboard';

function App() {
  return (
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
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="orders-management" element={<OrdersNew />} />
                  <Route path="products" element={<Products />} />
                  <Route path="orders/create" element={<CreateOrder />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="orders/:id/schedule-fitting" element={<ScheduleFitting />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="inventory/add" element={<AddInventoryItem />} />
                  <Route path="inventory/:id/barcode" element={<ViewBarcode />} />
                  <Route path="inventory/:id/edit" element={<EditInventoryItem />} />
                  <Route path="inventory/:id/order" element={<OrderMoreInventory />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="workers" element={<Workers />} />
                  <Route path="workers/add" element={<AddWorker />} />
                  <Route path="workers/:id/edit" element={<EditWorker />} />
                  <Route path="workers/:id" element={<WorkerDetails />} />
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
                  
                  {/* Admin Routes - with role-based protection */}
                  <Route path="admin/profile" element={<Profile />} />
                  <Route path="admin/users" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/permissions" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <Permissions />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/security-logs" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <SecurityLogs />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/system-settings" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <SystemSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="admin/backup" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <Backup />
                    </ProtectedRoute>
                  } />
                  
                  {/* ERP Management */}
                  <Route path="erp" element={
                    <ProtectedRoute allowedRoles={['system_super_admin', 'system_admin']}>
                      <ERPManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* Plugin Management */}
                  <Route path="plugins" element={
                    <ProtectedRoute requiredRoles={['admin']}>
                      <PluginManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* RBAC Dashboard */}
                  <Route path="rbac-dashboard" element={
                    <ProtectedRoute requiredRoles={['admin', 'system_administrator']}>
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
  );
}

export default App;