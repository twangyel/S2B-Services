import { Navigate, Route, Routes } from 'react-router';
import RequireAuth from './components/auth/RequireAuth';
import RequireRole from './components/auth/RequireRole';
import PWAInstallBanner from './components/common/PWAInstallBanner';
import PushTokenSync from './components/common/PushTokenSync';
import { Toaster } from 'sonner';
import AdminLayout from './layouts/AdminLayout';
import CustomerLayout from './layouts/CustomerLayout';
import ProviderLayout from './layouts/ProviderLayout';

// Authentication pages
import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';
import UpdatePassword from './pages/auth/UpdatePassword';

// Customer pages
import Account from './pages/customer/Account';
import BookService from './pages/customer/BookService';
import Home from './pages/customer/Home';
import Profile from './pages/customer/Profile';
import ProviderList from './pages/customer/ProviderList';
import ProviderProfile from './pages/customer/ProviderProfile';
import Requests from './pages/customer/Requests';
import Complaints from './pages/customer/Complaints';
import Services from './pages/customer/Services';

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderProfileMgmt from './pages/provider/ProviderProfileMgmt';
import ProviderRegister from './pages/provider/ProviderRegister';
import ProviderRequests from './pages/provider/ProviderRequests';
import ProviderSubscription from './pages/provider/ProviderSubscription';

// Admin pages
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminCategories from './pages/admin/AdminCategories';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayments from './pages/admin/AdminPayments';
import AdminProviders from './pages/admin/AdminProviders';
import AdminPushDiagnostics from './pages/admin/AdminPushDiagnostics';
import AdminRequests from './pages/admin/AdminRequests';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';

// Shared pages
import NotFound from './pages/NotFound';
import FAQ from './pages/shared/FAQ';
import Privacy from './pages/shared/Privacy';
import Support from './pages/shared/Support';
import Terms from './pages/shared/Terms';
import RequestDetails from './pages/shared/RequestDetails';
import Notifications from './pages/shared/Notifications';

export default function App() {
  return (
    <>
      <PWAInstallBanner />
      <PushTokenSync />
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Customer routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:categoryId" element={<ProviderList />} />
          <Route path="/providers/:providerId" element={<ProviderProfile />} />
          <Route
            path="/providers/:providerId/book"
            element={
              <RequireAuth>
                <BookService />
              </RequireAuth>
            }
          />
          <Route
            path="/requests"
            element={
              <RequireAuth>
                <Requests />
              </RequireAuth>
            }
          />
          <Route
            path="/requests/:requestId"
            element={
              <RequireAuth>
                <RequestDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/complaints"
            element={
              <RequireAuth>
                <Complaints />
              </RequireAuth>
            }
          />
          <Route path="/account" element={<Account />} />
          <Route
            path="/account/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
        </Route>

        {/* Provider application requires an account but not provider approval */}
        <Route
          element={
            <RequireAuth>
              <ProviderLayout />
            </RequireAuth>
          }
        >
          <Route path="/become-provider" element={<ProviderRegister />} />
        </Route>

        {/* Approved provider routes */}
        <Route
          element={
            <RequireRole allowed={['provider']}>
              <ProviderLayout />
            </RequireRole>
          }
        >
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/profile" element={<ProviderProfileMgmt />} />
          <Route path="/provider/requests" element={<ProviderRequests />} />
          <Route path="/provider/requests/:requestId" element={<RequestDetails />} />
          <Route path="/provider/subscription" element={<ProviderSubscription />} />
        </Route>

        {/* Admin routes */}
        <Route
          element={
            <RequireRole allowed={['admin', 'super_admin']}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route
            path="/admin/users"
            element={
              <RequireRole allowed={['super_admin']}>
                <AdminUsers />
              </RequireRole>
            }
          />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/requests" element={<AdminRequests />} />
          <Route path="/admin/requests/:requestId" element={<RequestDetails />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/complaints" element={<AdminComplaints />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/push-diagnostics" element={<AdminPushDiagnostics />} />
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <Notifications />
            </RequireAuth>
          }
        />

        {/* Shared pages */}
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faq" element={<FAQ />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
