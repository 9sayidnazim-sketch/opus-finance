import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Login from '@/pages/Login';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show luxury loading spinner while checking local auth state
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0B0C10]">
        <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated:
  if (!isAuthenticated) {
    // If user is accessing /admin directly, let the AdminPortal render with its admin unlock screen
    if (location.pathname.toLowerCase() === '/admin') {
      return (
        <Routes>
          <Route path="/admin" element={
            <LayoutWrapper currentPageName="Admin">
              <Pages.Admin />
            </LayoutWrapper>
          } />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      );
    }
    // Otherwise show the 2-option login screen (Demo Customer Test user/user + Email Sign In/Sign Up with verification)
    return <Login />;
  }

  // Render the authenticated app routes
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/admin" element={
        <LayoutWrapper currentPageName="Admin">
          <Pages.Admin />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).flatMap(([path, Page]) => {
        const lowerPath = path.toLowerCase().replace(/ /g, '-');
        const routes = [
          <Route
            key={path}
            path={`/${path}`}
            element={
              <LayoutWrapper currentPageName={path}>
                <Page />
              </LayoutWrapper>
            }
          />
        ];
        if (lowerPath !== path) {
          routes.push(
            <Route
              key={`${path}-lower`}
              path={`/${lowerPath}`}
              element={
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              }
            />
          );
        }
        return routes;
      })}
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
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
