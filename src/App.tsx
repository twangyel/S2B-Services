import { Routes, Route } from 'react-router';
import CustomerLayout from './layouts/CustomerLayout';
import ProviderLayout from './layouts/ProviderLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer pages
import Home from './pages/customer/Home';
import Services from './pages/customer/Services';
import ProviderList from './pages/customer/ProviderList';
import ProviderProfile from './pages/customer/ProviderProfile';
import Requests from './pages/customer/Requests';
import Account from './pages/customer/Account';

// Provider pages
import ProviderRegister from './pages/provider/ProviderRegister';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderProfileMgmt from './pages/provider/ProviderProfileMgmt';
import ProviderRequests from './pages/provider/ProviderRequests';
import ProviderSubscription from './pages/provider/ProviderSubscription';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProviders from './pages/admin/AdminProviders';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminCategories from './pages/admin/AdminCategories';
import AdminPayments from './pages/admin/AdminPayments';
import AdminRequests from './pages/admin/AdminRequests';
import AdminReviews from './pages/admin/AdminReviews';
import AdminSettings from './pages/admin/AdminSettings';

// Shared pages
import Support from './pages/shared/Support';
import Terms from './pages/shared/Terms';
import Privacy from './pages/shared/Privacy';
import FAQ from './pages/shared/FAQ';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Customer routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:categoryId" element={<ProviderList />} />
        <Route path="/providers/:providerId" element={<ProviderProfile />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/account" element={<Account />} />
      </Route>

      {/* Provider routes */}
      <Route element={<ProviderLayout />}>
        <Route path="/become-provider" element={<ProviderRegister />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/profile" element={<ProviderProfileMgmt />} />
        <Route path="/provider/requests" element={<ProviderRequests />} />
        <Route path="/provider/subscription" element={<ProviderSubscription />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/providers" element={<AdminProviders />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* Shared pages - no layout */}
      <Route path="/support" element={<Support />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/faq" element={<FAQ />} />

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
