import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authService, initAuthStore } from '@/api/authService';
import { 
  sendPhoneVerificationCode, 
  verifyPhoneSecurityCode, 
  resendPhoneVerificationCode 
} from '@/api/phoneVerifyService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeTenant, setActiveTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshState = useCallback(() => {
    try {
      initAuthStore();
      const currentUser = authService.getCurrentUser();
      const currentTenant = authService.getActiveTenant();
      const userTenants = authService.getAvailableTenantsForUser(currentUser);
      
      setUser(currentUser);
      setActiveTenant(currentTenant);
      setTenants(userTenants);

      if (currentUser) {
        const notifs = authService.getCustomerNotifications(currentUser.email, currentTenant?.id);
        setNotifications(notifs);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Failed to load auth state:', err);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshState();

    const handleAuthChanged = () => refreshState();
    const handleTenantChanged = () => refreshState();
    const handleNotifChanged = () => refreshState();

    window.addEventListener('opus:authChanged', handleAuthChanged);
    window.addEventListener('opus:tenantChanged', handleTenantChanged);
    window.addEventListener('opus:notificationDispatched', handleNotifChanged);

    return () => {
      window.removeEventListener('opus:authChanged', handleAuthChanged);
      window.removeEventListener('opus:tenantChanged', handleTenantChanged);
      window.removeEventListener('opus:notificationDispatched', handleNotifChanged);
    };
  }, [refreshState]);

  // Demo Login: user / user
  const loginAsDemo = () => {
    setAuthError(null);
    const result = authService.loginAsDemo();
    if (result.success) {
      refreshState();
    }
    return result;
  };

  // Credential Login: user / user, admin / admin, or email
  const login = (identifier, password) => {
    setAuthError(null);
    const result = authService.loginWithCredentials(identifier, password);
    if (result.success) {
      refreshState();
    } else {
      setAuthError(result.message);
    }
    return result;
  };

  // Email Signup
  const signup = ({ email, password, name, tenantName }) => {
    setAuthError(null);
    const result = authService.signupWithEmail({ email, password, name, tenantName });
    if (!result.success) {
      setAuthError(result.message);
    }
    return result;
  };

  // Verify Email
  const verifyEmail = ({ email, code }) => {
    setAuthError(null);
    const result = authService.verifyEmail({ email, code });
    if (result.success) {
      refreshState();
    } else {
      setAuthError(result.message);
    }
    return result;
  };

  // Resend Email Verification Code
  const resendVerification = (email) => {
    return authService.resendVerificationEmail(email);
  };

  // --- Phone OTP Authentication (django-phone-verify pattern) ---
  const sendPhoneCode = async (phoneNumber) => {
    setAuthError(null);
    return await sendPhoneVerificationCode({ phoneNumber });
  };

  const verifyPhoneCode = async ({ phoneNumber, securityCode }) => {
    setAuthError(null);
    return await verifyPhoneSecurityCode({ phoneNumber, securityCode });
  };

  const resendPhoneCode = async (phoneNumber) => {
    setAuthError(null);
    return await resendPhoneVerificationCode({ phoneNumber });
  };

  const loginWithPhone = ({ phoneNumber, sessionToken, name, workspaceName }) => {
    setAuthError(null);
    const result = authService.authenticateWithPhone({ phoneNumber, sessionToken, name, workspaceName });
    if (result.success) {
      refreshState();
    } else {
      setAuthError(result.message);
    }
    return result;
  };

  // Switch Workspace / Tenant
  const switchTenant = (tenantId) => {
    const updated = authService.switchTenant(tenantId);
    if (updated) {
      setActiveTenant(updated);
      refreshState();
      // Reload window or trigger query refresh so all queries pull new tenant storage
      window.location.reload();
    }
    return updated;
  };

  // Create New Workspace
  const createTenant = (name, description) => {
    const created = authService.createTenant(name, description);
    if (created) {
      refreshState();
      window.location.reload();
    }
    return created;
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    refreshState();
  };

  const markNotificationAsRead = (id) => {
    authService.markNotificationAsRead(id);
    refreshState();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin,
      activeTenant,
      tenants,
      notifications,
      unreadCount,
      isLoadingAuth,
      authError,
      loginAsDemo,
      login,
      signup,
      verifyEmail,
      resendVerification,
      sendPhoneCode,
      verifyPhoneCode,
      resendPhoneCode,
      loginWithPhone,
      switchTenant,
      createTenant,
      logout,
      markNotificationAsRead,
      refreshState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
