import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function Login({ onLoginSuccess }) {
  const { login, loginAsDemo, signup, verifyEmail, resendVerification, authError } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'email' | 'verify'
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'

  // Demo form state (prefilled with user / user)
  const [demoUsername, setDemoUsername] = useState('user');
  const [demoPassword, setDemoPassword] = useState('user');

  // Email login / signup state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  // Verification state
  const [verifyTargetEmail, setVerifyTargetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [latestCodeHint, setLatestCodeHint] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // One-click Demo Login
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    setFormError('');
    try {
      const res = loginAsDemo();
      if (res.success) {
        toast({
          title: "Welcome to OPUS Demo",
          description: "Logged in as Demo Customer (user/user) with preloaded records.",
        });
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        setFormError(res.message || "Failed to start demo session.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Demo manual submission
  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    try {
      const res = login(demoUsername, demoPassword);
      if (res.success) {
        toast({
          title: "Authenticated",
          description: `Welcome back, ${res.user.name || res.user.username}!`,
        });
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        setFormError(res.message || "Invalid credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Email Sign In / Sign Up submission
  const handleEmailAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');

    try {
      if (authMode === 'signin') {
        const res = login(email, password);
        if (res.success) {
          toast({
            title: "Signed In Successfully",
            description: `Welcome back, ${res.user.name || res.user.email}!`,
          });
          if (onLoginSuccess) onLoginSuccess(res.user);
        } else if (res.requiresVerification) {
          setVerifyTargetEmail(res.email);
          setActiveTab('verify');
          toast({
            title: "Verification Required",
            description: "Please verify your email address before continuing.",
            variant: "destructive"
          });
        } else {
          setFormError(res.message || "Invalid email or password.");
        }
      } else {
        // Sign Up
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          setFormError("Please fill in all required fields.");
          setIsLoading(false);
          return;
        }

        const res = signup({
          email,
          password,
          name: fullName,
          tenantName: workspaceName || `${fullName.split(' ')[0]}'s Workspace`
        });

        if (res.success && res.requiresVerification) {
          setVerifyTargetEmail(res.email);
          setLatestCodeHint(res.verificationCode);
          setResendCooldown(30);
          setActiveTab('verify');
          toast({
            title: "Verification Email Sent",
            description: `We've sent a 6-digit confirmation code to ${res.email}.`,
          });
        } else {
          setFormError(res.message || "Could not complete signup.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verification Code Submit
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setFormError("Please enter your 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      const res = verifyEmail({
        email: verifyTargetEmail,
        code: verificationCode
      });

      if (res.success) {
        toast({
          title: "Account Verified & Activated",
          description: "Your workspace is ready. Welcome to OPUS Finance!",
        });
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        setFormError(res.message || "Invalid or expired verification code.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Verification Email
  const handleResend = () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      const res = resendVerification(verifyTargetEmail);
      if (res.success) {
        setLatestCodeHint(res.code);
        setResendCooldown(30);
        toast({
          title: "Verification Email Resent",
          description: `Dispatched fresh verification code: ${res.code}`,
        });
      } else {
        setFormError(res.message || "Failed to resend email.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0C10] text-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(139,92,246,0.18),rgba(255,255,255,0))] pointer-events-none blur-2xl" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.08),rgba(255,255,255,0))] pointer-events-none blur-3xl" />

      {/* Brand Header */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-600 to-violet-800 shadow-[0_0_32px_rgba(139,92,246,0.5)] border border-white/20 mb-3 transition-transform hover:scale-105">
          <span className="font-display text-white text-2xl font-bold">O</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">OPUS</h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider">
            Finance
          </span>
        </div>
        <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
          Personal, family & multi-tenant wealth intelligence with AI copilot.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-[#12131A]/95 border border-white/[0.09] rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative z-10">
        
        {/* Tab Selection */}
        {activeTab !== 'verify' && (
          <div className="grid grid-cols-2 p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('demo'); setFormError(''); }}
              className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'demo'
                  ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Customer Test Drive
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('email'); setFormError(''); }}
              className={`py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Email Sign Up & Login
            </button>
          </div>
        )}

        {/* Global Error Notice */}
        {(formError || authError) && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2 text-rose-300 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <p>{formError || authError}</p>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 1: CUSTOMER TEST DRIVE (user / user)                  */}
        {/* ============================================================ */}
        {activeTab === 'demo' && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent border border-violet-500/20">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <h3 className="text-sm font-semibold text-white tracking-tight">Instant Customer Evaluation</h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Test the application with preloaded multi-month cashflow, transaction histories, family budgets, and the AI copilot.
              </p>
              
              <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <div className="text-zinc-400">
                  Credentials: <span className="text-violet-300 font-mono font-medium">user</span> / <span className="text-violet-300 font-mono font-medium">user</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/25">
                  No signup required
                </span>
              </div>
            </div>

            {/* Prominent One-Click Demo Button */}
            <Button
              type="button"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <span>Explore Demo as Customer</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Standard manual user/user form if evaluator prefers typing */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.07]"></div></div>
              <span className="relative px-3 text-[11px] font-medium text-zinc-500 bg-[#12131A] uppercase tracking-wider">
                Or type credentials
              </span>
            </div>

            <form onSubmit={handleDemoSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Username</Label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    value={demoUsername}
                    onChange={(e) => setDemoUsername(e.target.value)}
                    className="pl-9 bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl font-mono text-sm"
                    placeholder="user"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    value={demoPassword}
                    onChange={(e) => setDemoPassword(e.target.value)}
                    className="pl-9 bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl font-mono text-sm"
                    placeholder="user"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="outline"
                disabled={isLoading}
                className="w-full h-10 border-white/[0.12] hover:bg-white/[0.06] text-white rounded-xl text-sm"
              >
                Sign In with Credentials
              </Button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* OPTION 2: EMAIL SIGN IN & SIGN UP                            */}
        {/* ============================================================ */}
        {activeTab === 'email' && (
          <div className="space-y-5">
            {/* Toggle Sign In / Create Account */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-semibold text-white">
                {authMode === 'signin' ? 'Sign In to Your Workspace' : 'Create New Account & Workspace'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setFormError('');
                }}
                className="text-xs text-violet-400 hover:text-violet-300 underline font-medium"
              >
                {authMode === 'signin' ? 'Create Account' : 'Already have an account?'}
              </button>
            </div>

            <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Your Full Name</Label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="pl-9 bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-300">Workspace / Tenant Name</Label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="text"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="e.g. Acme Family Office or Personal"
                        className="pl-9 bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="pl-9 bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-white/[0.03] border-white/[0.1] text-white focus:border-violet-500 h-10 rounded-xl text-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.35)] mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : authMode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Sign Up with Verification'
                )}
              </Button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* EMAIL VERIFICATION SCREEN WITH RESEND CAPABILITY             */}
        {/* ============================================================ */}
        {activeTab === 'verify' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-white">Check Your Inbox</h3>
              <p className="text-xs text-zinc-400 mt-1">
                We sent a 6-digit confirmation code to:
              </p>
              <p className="text-xs font-mono font-medium text-violet-300 mt-0.5">
                {verifyTargetEmail}
              </p>
            </div>

            {/* Quick Helper Badge for fast testing */}
            {latestCodeHint && (
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <KeyRound className="w-3.5 h-3.5 text-violet-400" />
                  <span>Simulated Code: <strong className="font-mono text-violet-300">{latestCodeHint}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setVerificationCode(latestCodeHint)}
                  className="text-[11px] font-semibold text-violet-300 hover:text-white underline"
                >
                  Auto Fill
                </button>
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">6-Digit Verification Code</Label>
                <Input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="bg-white/[0.03] border-white/[0.1] text-white text-center font-mono text-lg tracking-widest h-12 rounded-xl focus:border-violet-500"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.35)] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Enter Workspace</span>
              </Button>
            </form>

            {/* Resend Verification Email Button */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-zinc-400">Didn't receive the email?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className={`flex items-center gap-1.5 font-medium transition-colors ${
                  resendCooldown > 0
                    ? 'text-zinc-500 cursor-not-allowed'
                    : 'text-violet-400 hover:text-violet-300 underline'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
                </span>
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setActiveTab('email'); setFormError(''); }}
                className="text-xs text-zinc-400 hover:text-white underline"
              >
                ← Back to email sign in
              </button>
            </div>
          </div>
        )}

        {/* Footer info: Admin Portal shortcut */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
          <p className="text-[11px] text-zinc-400">
            Platform Administrator?{' '}
            <button
              type="button"
              onClick={() => {
                setDemoUsername('admin');
                setDemoPassword('admin');
                setActiveTab('demo');
              }}
              className="text-amber-400/90 hover:text-amber-300 underline font-medium"
            >
              Sign in with admin / admin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
