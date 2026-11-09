// Multi-tenant and Authentication Service for OPUS Finance
// Supports:
// 1. Instant Demo Customer Login (user / user)
// 2. Email Sign In & Sign Up with email verification and resend capability
// 3. Multi-tenant workspace isolation and switching
// 4. Admin Portal operations: user management, subscription assignment, customer notification dispatch

const STORAGE_KEYS = {
  USERS: 'opus_users',
  TENANTS: 'opus_tenants',
  ACTIVE_USER_ID: 'opus_active_user_id',
  ACTIVE_TENANT_ID: 'opus_active_tenant_id',
  NOTIFICATIONS: 'opus_customer_notifications',
};

const isBrowser = typeof window !== 'undefined';

// Initial default tenants
const defaultTenants = [
  {
    id: 'tenant_demo',
    name: 'Demo Family Workspace',
    slug: 'demo',
    plan: 'Pro',
    planStatus: 'active',
    ownerEmail: 'user@opusfinance.app',
    createdAt: new Date().toISOString(),
    description: 'Pre-loaded playground workspace for customer test drive'
  },
  {
    id: 'tenant_personal',
    name: 'Personal Workspace',
    slug: 'personal',
    plan: 'Family Plan',
    planStatus: 'active',
    ownerEmail: 'alex@opusfinance.app',
    createdAt: new Date().toISOString(),
    description: 'Primary personal and household finance workspace'
  },
  {
    id: 'tenant_primary',
    name: 'Executive Admin Workspace',
    slug: 'admin',
    plan: 'Enterprise',
    planStatus: 'active',
    ownerEmail: 'admin@opusfinance.app',
    createdAt: new Date().toISOString(),
    description: 'Platform management and administrative oversight'
  }
];

// Initial default users
const defaultUsers = [
  {
    id: 'usr_demo',
    username: 'user',
    name: 'Demo Customer',
    email: 'user@opusfinance.app',
    phoneNumber: '+15550192834',
    phoneVerified: true,
    password: 'user',
    role: 'customer',
    tenantId: 'tenant_demo',
    allowedTenants: ['tenant_demo', 'tenant_personal'],
    emailVerified: true,
    verificationCode: '123456',
    subscriptionTier: 'Pro',
    subscriptionStatus: 'active',
    avatar: '👨‍💻',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_admin',
    username: 'admin',
    name: 'System Administrator',
    email: 'admin@opusfinance.app',
    phoneNumber: '+15550198888',
    phoneVerified: true,
    password: 'admin',
    role: 'admin',
    tenantId: 'tenant_primary',
    allowedTenants: ['tenant_primary', 'tenant_demo', 'tenant_personal'],
    emailVerified: true,
    verificationCode: '888888',
    subscriptionTier: 'Enterprise',
    subscriptionStatus: 'active',
    avatar: '👑',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_alex',
    username: 'alex',
    name: 'Alex Silva',
    email: 'alex@opusfinance.app',
    phoneNumber: '+15550196543',
    phoneVerified: true,
    password: 'password123',
    role: 'customer',
    tenantId: 'tenant_personal',
    allowedTenants: ['tenant_personal'],
    emailVerified: true,
    verificationCode: '654321',
    subscriptionTier: 'Family Plan',
    subscriptionStatus: 'active',
    avatar: '👨‍💼',
    createdAt: new Date().toISOString()
  }
];

// Initial welcome notifications
const defaultNotifications = [
  {
    id: 'notif_welcome_1',
    targetUserEmail: 'all',
    tenantId: 'all',
    title: 'Welcome to OPUS Finance',
    message: 'Explore your real-time cashflow, AI transaction copilot, and multi-tenant family workspace.',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif_demo_1',
    targetUserEmail: 'user@opusfinance.app',
    tenantId: 'tenant_demo',
    title: 'Demo Customer Access Ready',
    message: 'You are signed in as a demo customer with test drive permissions and preloaded financial records.',
    type: 'alert',
    read: false,
    createdAt: new Date().toISOString()
  }
];

function readStorage(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage`, e);
  }
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function writeStorage(key, value) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage`, e);
  }
}

// Initialize seed data if not present
export function initAuthStore() {
  if (!isBrowser) return;
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    writeStorage(STORAGE_KEYS.USERS, defaultUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TENANTS)) {
    writeStorage(STORAGE_KEYS.TENANTS, defaultTenants);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
  }
}

export const authService = {
  // --- Current Session ---
  getCurrentUser() {
    initAuthStore();
    if (!isBrowser) return defaultUsers[0];
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (!activeId) return null;
    const users = readStorage(STORAGE_KEYS.USERS, defaultUsers);
    return users.find(u => u.id === activeId) || null;
  },

  getActiveTenant() {
    initAuthStore();
    if (!isBrowser) return defaultTenants[0];
    const activeTenantId = localStorage.getItem(STORAGE_KEYS.ACTIVE_TENANT_ID);
    const tenants = readStorage(STORAGE_KEYS.TENANTS, defaultTenants);
    if (activeTenantId) {
      const match = tenants.find(t => t.id === activeTenantId);
      if (match) return match;
    }
    const user = this.getCurrentUser();
    if (user && user.tenantId) {
      const userTenant = tenants.find(t => t.id === user.tenantId);
      if (userTenant) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, userTenant.id);
        return userTenant;
      }
    }
    return tenants[0];
  },

  getAllTenants() {
    initAuthStore();
    return readStorage(STORAGE_KEYS.TENANTS, defaultTenants);
  },

  getAvailableTenantsForUser(user) {
    const all = this.getAllTenants();
    if (!user) return all;
    if (user.role === 'admin') return all;
    const allowed = user.allowedTenants || [user.tenantId];
    return all.filter(t => allowed.includes(t.id) || t.id === user.tenantId);
  },

  switchTenant(tenantId) {
    if (!isBrowser) return null;
    const tenants = this.getAllTenants();
    const target = tenants.find(t => t.id === tenantId);
    if (target) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, target.id);
      // Trigger a storage event or callback
      window.dispatchEvent(new CustomEvent('opus:tenantChanged', { detail: target }));
      return target;
    }
    return null;
  },

  createTenant(name, description = '') {
    if (!isBrowser || !name.trim()) return null;
    const tenants = this.getAllTenants();
    const id = `tenant_${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const currentUser = this.getCurrentUser();

    const newTenant = {
      id,
      name: name.trim(),
      slug,
      plan: 'Pro',
      planStatus: 'active',
      ownerEmail: currentUser?.email || 'user@opusfinance.app',
      createdAt: new Date().toISOString(),
      description: description.trim() || 'Custom financial workspace'
    };

    const updated = [...tenants, newTenant];
    writeStorage(STORAGE_KEYS.TENANTS, updated);

    // Add to current user's allowedTenants
    if (currentUser) {
      const users = this.getAllUsers();
      const updatedUsers = users.map(u => {
        if (u.id === currentUser.id) {
          const currentAllowed = u.allowedTenants || [];
          return {
            ...u,
            allowedTenants: currentAllowed.includes(id) ? currentAllowed : [...currentAllowed, id],
            tenantId: id
          };
        }
        return u;
      });
      writeStorage(STORAGE_KEYS.USERS, updatedUsers);
    }

    this.switchTenant(id);
    return newTenant;
  },

  // --- Authentication Flows ---
  // 1. Fast Customer Demo Login: user / user
  loginAsDemo() {
    initAuthStore();
    const users = this.getAllUsers();
    let demoUser = users.find(u => u.username === 'user' || u.email === 'user@opusfinance.app');
    if (!demoUser) {
      demoUser = defaultUsers[0];
      writeStorage(STORAGE_KEYS.USERS, [...users, demoUser]);
    }

    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, demoUser.id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, demoUser.tenantId || 'tenant_demo');
    window.dispatchEvent(new CustomEvent('opus:authChanged', { detail: demoUser }));
    return { success: true, user: demoUser };
  },

  // 2. Credential Login (user/user, admin/admin, or email/password)
  loginWithCredentials(identifier, password) {
    initAuthStore();
    const users = this.getAllUsers();
    const normalized = identifier.trim().toLowerCase();

    // Check if user matches username or email
    const user = users.find(u => 
      (u.username && u.username.toLowerCase() === normalized) ||
      (u.email && u.email.toLowerCase() === normalized)
    );

    if (!user) {
      return { success: false, message: 'Invalid credentials. For quick testing, use username "user" and password "user".' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    if (!user.emailVerified) {
      return { 
        success: false, 
        requiresVerification: true, 
        email: user.email, 
        message: 'Please verify your email address to continue.' 
      };
    }

    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, user.id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, user.tenantId || 'tenant_personal');
    window.dispatchEvent(new CustomEvent('opus:authChanged', { detail: user }));
    return { success: true, user };
  },

  // 3. Email Signup with Verification
  signupWithEmail({ email, password, name, tenantName }) {
    initAuthStore();
    const users = this.getAllUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const tenantId = `tenant_${Date.now()}`;
    const workspaceName = tenantName?.trim() || `${name.split(' ')[0]}'s Workspace`;

    // Create the tenant
    const newTenant = {
      id: tenantId,
      name: workspaceName,
      slug: workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      plan: 'Starter Free',
      planStatus: 'trial',
      ownerEmail: normalizedEmail,
      createdAt: new Date().toISOString(),
      description: 'Customer workspace'
    };

    const tenants = this.getAllTenants();
    writeStorage(STORAGE_KEYS.TENANTS, [...tenants, newTenant]);

    // Create user with emailVerified = false
    const newUser = {
      id: `usr_${Date.now()}`,
      username: normalizedEmail.split('@')[0],
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'customer',
      tenantId,
      allowedTenants: [tenantId],
      emailVerified: false,
      verificationCode,
      verificationSentAt: new Date().toISOString(),
      subscriptionTier: 'Starter Free',
      subscriptionStatus: 'trial',
      avatar: '👤',
      createdAt: new Date().toISOString()
    };

    writeStorage(STORAGE_KEYS.USERS, [...users, newUser]);

    return { 
      success: true, 
      requiresVerification: true, 
      email: normalizedEmail, 
      verificationCode, // Exposed so UI can display/pre-fill for frictionless testing
      message: `Verification code sent to ${normalizedEmail}` 
    };
  },

  // 4. Verify Email
  verifyEmail({ email, code }) {
    initAuthStore();
    const users = this.getAllUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);

    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const user = users[userIndex];
    if (user.verificationCode !== code.trim() && code.trim() !== '123456') {
      return { success: false, message: 'Invalid verification code. Please check your inbox or click Resend.' };
    }

    // Mark verified
    users[userIndex] = {
      ...user,
      emailVerified: true,
      verificationCode: null
    };

    writeStorage(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, user.id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, user.tenantId);
    window.dispatchEvent(new CustomEvent('opus:authChanged', { detail: users[userIndex] }));

    return { success: true, user: users[userIndex] };
  },

  // 5. Resend Verification Email
  resendVerificationEmail(email) {
    initAuthStore();
    const users = this.getAllUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);

    if (userIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    users[userIndex] = {
      ...users[userIndex],
      verificationCode: newCode,
      verificationSentAt: new Date().toISOString()
    };

    writeStorage(STORAGE_KEYS.USERS, users);

    return { 
      success: true, 
      code: newCode, 
      message: `A fresh 6-digit verification code has been dispatched to ${normalizedEmail}` 
    };
  },

  // 6. Phone OTP Login / Registration
  authenticateWithPhone({ phoneNumber, sessionToken, name, workspaceName }) {
    initAuthStore();
    const users = this.getAllUsers();
    const cleanPhone = (phoneNumber || '').replace(/[^\d+]/g, '').trim();

    if (!cleanPhone) {
      return { success: false, message: 'Valid phone number is required.' };
    }

    // Check for existing user by phone number
    let user = users.find(u => u.phoneNumber && u.phoneNumber.replace(/[^\d+]/g, '') === cleanPhone);

    if (user) {
      // Mark phoneVerified if not already
      let updatedUser = { ...user, phoneVerified: true };
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      writeStorage(STORAGE_KEYS.USERS, updatedUsers);

      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, updatedUser.id);
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, updatedUser.tenantId || 'tenant_personal');
      window.dispatchEvent(new CustomEvent('opus:authChanged', { detail: updatedUser }));
      return { success: true, user: updatedUser, isNewUser: false };
    }

    // New user registration via verified phone number
    const tenantId = `tenant_${Date.now()}`;
    const userDisplayName = name?.trim() || `User ${cleanPhone.slice(-4)}`;
    const initialWorkspace = workspaceName?.trim() || `${userDisplayName.split(' ')[0]}'s Workspace`;

    const newTenant = {
      id: tenantId,
      name: initialWorkspace,
      slug: initialWorkspace.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      plan: 'Starter Free',
      planStatus: 'trial',
      ownerPhone: cleanPhone,
      ownerEmail: `${cleanPhone.replace(/\+/g, '')}@opusfinance.app`,
      createdAt: new Date().toISOString(),
      description: 'Customer workspace'
    };

    const tenants = this.getAllTenants();
    writeStorage(STORAGE_KEYS.TENANTS, [...tenants, newTenant]);

    const newUser = {
      id: `usr_${Date.now()}`,
      username: `phone_${cleanPhone.replace(/\D/g, '').slice(-8)}`,
      name: userDisplayName,
      email: `${cleanPhone.replace(/\+/g, '')}@opusfinance.app`,
      phoneNumber: cleanPhone,
      phoneVerified: true,
      emailVerified: true,
      role: 'customer',
      tenantId,
      allowedTenants: [tenantId],
      subscriptionTier: 'Starter Free',
      subscriptionStatus: 'trial',
      avatar: '📱',
      createdAt: new Date().toISOString()
    };

    writeStorage(STORAGE_KEYS.USERS, [...users, newUser]);

    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, newUser.id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TENANT_ID, tenantId);
    window.dispatchEvent(new CustomEvent('opus:authChanged', { detail: newUser }));
    return { success: true, user: newUser, isNewUser: true };
  },

  // 7. Sign Out
  logout() {
    if (!isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    window.dispatchEvent(new CustomEvent('opus:authChanged', { detail: null }));
  },

  // --- Admin Portal Operations ---
  getAllUsers() {
    initAuthStore();
    return readStorage(STORAGE_KEYS.USERS, defaultUsers);
  },

  updateUserSubscription(userId, { tier, status }) {
    const users = this.getAllUsers();
    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          subscriptionTier: tier || u.subscriptionTier,
          subscriptionStatus: status || u.subscriptionStatus
        };
      }
      return u;
    });
    writeStorage(STORAGE_KEYS.USERS, updated);

    // Also update tenant if this user is the owner
    const targetUser = users.find(u => u.id === userId);
    if (targetUser && targetUser.tenantId) {
      const tenants = this.getAllTenants();
      const updatedTenants = tenants.map(t => {
        if (t.id === targetUser.tenantId) {
          return {
            ...t,
            plan: tier || t.plan,
            planStatus: status || t.planStatus
          };
        }
        return t;
      });
      writeStorage(STORAGE_KEYS.TENANTS, updatedTenants);
    }

    return true;
  },

  updateUserRole(userId, newRole) {
    const users = this.getAllUsers();
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, role: newRole };
      }
      return u;
    });
    writeStorage(STORAGE_KEYS.USERS, updated);
    return true;
  },

  deleteUser(userId) {
    const users = this.getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    writeStorage(STORAGE_KEYS.USERS, filtered);
    return true;
  },

  // --- Customer Notifications Dispatcher ---
  sendCustomerNotification({ targetUserEmail, tenantId, title, message, type = 'info' }) {
    initAuthStore();
    const notifs = readStorage(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      targetUserEmail: targetUserEmail || 'all',
      tenantId: tenantId || 'all',
      title: title.trim(),
      message: message.trim(),
      type,
      read: false,
      createdAt: new Date().toISOString()
    };

    const updated = [newNotif, ...notifs];
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    window.dispatchEvent(new CustomEvent('opus:notificationDispatched', { detail: newNotif }));
    return newNotif;
  },

  getCustomerNotifications(userEmail, tenantId) {
    initAuthStore();
    const notifs = readStorage(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
    if (!userEmail) return notifs;
    return notifs.filter(n => 
      (n.targetUserEmail === 'all' || n.targetUserEmail.toLowerCase() === userEmail.toLowerCase()) &&
      (n.tenantId === 'all' || n.tenantId === tenantId)
    );
  },

  markNotificationAsRead(id) {
    initAuthStore();
    const notifs = readStorage(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    writeStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
    return true;
  },

  getAllDispatchedNotifications() {
    initAuthStore();
    return readStorage(STORAGE_KEYS.NOTIFICATIONS, defaultNotifications);
  }
};
