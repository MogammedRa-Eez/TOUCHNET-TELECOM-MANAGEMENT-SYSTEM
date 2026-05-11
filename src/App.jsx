import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';

// ── Sales Prototype ──────────────────────────────────────────────────────────
import SalesLayout from './sales-proto/SalesLayout';
import SalesHome from './sales-proto/SalesHome';
import SalesCoverageWrapper from './sales-proto/SalesCoverageWrapper';
import Customers from './pages/Customers';
import Billing from './pages/Billing';
import DepartmentDashboard from './pages/DepartmentDashboard';
import CustomerPortalMain from './pages/CustomerPortalMain';
import CynetSecurity from './pages/CynetSecurity';
import NotificationSettings from './pages/NotificationSettings';
import Quotes from './pages/Quotes.jsx';
import AIAssistant from './pages/AIAssistant';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import SystemDemo from './pages/SystemDemo';
import CoverageCheck from './pages/CoverageCheck.jsx';
import QuoteView from './pages/QuoteView';
import UserManual from './pages/UserManual';
import AuditLog from './pages/AuditLog';
import SLADashboard from './pages/SLADashboard';
import NOCView from './pages/NOCView';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

/**
 * AdminOnly — renders children only for admin users.
 * Non-admins are silently redirected to the Sales prototype.
 */
const AdminOnly = ({ children }) => {
  const { user, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return null;
  if (user?.role !== 'admin') return <Navigate to="/sales" replace />;
  return children;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Root: admins go to TMS dashboard, everyone else goes to Sales prototype */}
      <Route path="/" element={
        <AdminOnly>
          <LayoutWrapper currentPageName="Dashboard">
            <Dashboard />
          </LayoutWrapper>
        </AdminOnly>
      } />

      {/* ── Full TMS — admin only ──────────────────────────────────────── */}
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <AdminOnly>
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            </AdminOnly>
          }
        />
      ))}
      <Route path="/AIAssistant" element={<AdminOnly><LayoutWrapper currentPageName="AIAssistant"><AIAssistant /></LayoutWrapper></AdminOnly>} />
      <Route path="/SystemDemo" element={<AdminOnly><LayoutWrapper currentPageName="SystemDemo"><SystemDemo /></LayoutWrapper></AdminOnly>} />
      <Route path="/Quotes" element={<AdminOnly><LayoutWrapper currentPageName="Quotes"><Quotes /></LayoutWrapper></AdminOnly>} />
      <Route path="/NotificationSettings" element={<AdminOnly><LayoutWrapper currentPageName="NotificationSettings"><NotificationSettings /></LayoutWrapper></AdminOnly>} />
      <Route path="/DepartmentDashboard" element={<AdminOnly><LayoutWrapper currentPageName="DepartmentDashboard"><DepartmentDashboard /></LayoutWrapper></AdminOnly>} />
      <Route path="/CustomerPortalMain" element={<AdminOnly><CustomerPortalMain /></AdminOnly>} />
      <Route path="/CoverageCheck" element={<CoverageCheck />} />
      <Route path="/AuditLog" element={<AdminOnly><LayoutWrapper currentPageName="AuditLog"><AuditLog /></LayoutWrapper></AdminOnly>} />
      <Route path="/UserManual" element={<AdminOnly><LayoutWrapper currentPageName="UserManual"><UserManual /></LayoutWrapper></AdminOnly>} />
      <Route path="/quote" element={<QuoteView />} />
      <Route path="/SLADashboard" element={<AdminOnly><LayoutWrapper currentPageName="SLADashboard"><SLADashboard /></LayoutWrapper></AdminOnly>} />
      <Route path="/NOCView" element={<AdminOnly><NOCView /></AdminOnly>} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/CynetSecurity" element={<AdminOnly><LayoutWrapper currentPageName="CynetSecurity"><CynetSecurity /></LayoutWrapper></AdminOnly>} />

      {/* ── Sales Prototype Routes — all authenticated users ───────────── */}
      <Route path="/sales" element={<SalesLayout><SalesHome /></SalesLayout>} />
      <Route path="/sales/dashboard" element={<SalesLayout><Dashboard /></SalesLayout>} />
      <Route path="/sales/quotes" element={<SalesLayout><Quotes /></SalesLayout>} />
      <Route path="/sales/customers" element={<SalesLayout><Customers /></SalesLayout>} />
      <Route path="/sales/billing" element={<SalesLayout><Billing /></SalesLayout>} />
      <Route path="/sales/coverage" element={<SalesCoverageWrapper />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App