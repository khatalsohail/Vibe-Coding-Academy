import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  RefreshCw,
  LogOut,
  HelpCircle,
  Database,
  KeyRound,
  Compass,
  Zap,
} from 'lucide-react';
import { authService } from '../services/authService';
import { UserAccount, AuthSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
  isProtectedRedirect?: boolean; // true when user was bounced from /dashboard
  onRunTestSandbox?: (testType: 'bad_data' | 'refresh' | 'bounce') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  isProtectedRedirect = false,
  onRunTestSandbox,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'educator'>('student');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMessage(null);
    setErrorField(null);
    setSuccessMessage(null);
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorField(null);
    setSuccessMessage(null);

    // Front-end Pre-validation for Immediate Friendly Red Error UI
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address with an "@" symbol.');
      setErrorField('email');
      return;
    }

    if (mode === 'signup') {
      if (!username.trim() || username.trim().length < 2) {
        setErrorMessage('Username must be at least 2 characters long.');
        setErrorField('username');
        return;
      }
      if (!password || password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        setErrorField('password');
        return;
      }
    } else {
      if (!password) {
        setErrorMessage('Please enter your password.');
        setErrorField('password');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { user } = await authService.register({
          email: trimmedEmail,
          username: username.trim(),
          password,
          role,
        });
        setSuccessMessage(`Welcome to Vibe Code Academy, ${user.username}! Account created and registered in database.`);
        setTimeout(() => {
          onSuccess?.(user);
          onClose?.();
        }, 1200);
      } else {
        const { user } = await authService.login({
          email: trimmedEmail,
          password,
        });
        setSuccessMessage(`Welcome back, ${user.username}! Redirecting to student dashboard...`);
        setTimeout(() => {
          onSuccess?.(user);
          onClose?.();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      if (err.message.toLowerCase().includes('password')) {
        setErrorField('password');
      } else if (err.message.toLowerCase().includes('email') || err.message.toLowerCase().includes('exists')) {
        setErrorField('email');
      } else if (err.message.toLowerCase().includes('username')) {
        setErrorField('username');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const { user } = await authService.loginWithGoogle();
      setSuccessMessage(`Google Authentication verified for ${user.email}. Connecting to database...`);
      setTimeout(() => {
        onSuccess?.(user);
        onClose?.();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('student@vibecode.edu');
    setPassword('password123');
    setUsername('Alex Chen');
    setErrorMessage(null);
    setErrorField(null);
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="auth-modal-container"
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/40 p-6 sm:p-8 relative overflow-hidden my-8"
      >
        {/* Top Accent Gradient Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500"></div>

        {/* Protected Route Notice Banner (When bounced from /dashboard) */}
        {isProtectedRedirect && (
          <div
            id="protected-route-banner"
            className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300"
          >
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Protected Route Notice</span>
              <span>You must be logged in to view your learning progress and student dashboard.</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-mono">
            {mode === 'login' ? 'Student Sign-In' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            {mode === 'login'
              ? 'Access your saved projects, Google Drive sync, and badges'
              : 'Join the platform to track your learning journey across 5 cloud tiers'}
          </p>
        </div>

        {/* Sign In vs Sign Up Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mb-6">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => resetForm('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              mode === 'login'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Log In
          </button>
          <button
            id="auth-tab-signup"
            type="button"
            onClick={() => resetForm('signup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              mode === 'signup'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Friendly Red Error Banner */}
        {errorMessage && (
          <div
            id="auth-error-banner"
            className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/60 flex items-start gap-3 text-xs text-rose-200 animate-in fade-in slide-in-from-top-1"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-rose-300">Action Required</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {successMessage && (
          <div
            id="auth-success-banner"
            className="mb-5 p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-start gap-3 text-xs text-emerald-200 animate-in fade-in slide-in-from-top-1"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block text-emerald-300">Authenticated</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        {/* Google OAuth Button */}
        <div className="space-y-4">
          <button
            id="auth-google-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800/80 text-slate-100 font-medium text-xs rounded-xl border border-slate-700/80 transition flex items-center justify-center gap-3 shadow-md hover:border-slate-600 disabled:opacity-50 group"
          >
            {/* Google Vector Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] font-mono uppercase text-slate-500 absolute">
              or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
            {/* Username field (for Signup) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Student Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-input-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-950 border text-xs text-white rounded-xl focus:outline-none transition ${
                      errorField === 'username'
                        ? 'border-rose-500 ring-1 ring-rose-500/30'
                        : 'border-slate-800 focus:border-cyan-500'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@vibecode.edu"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-950 border text-xs text-white rounded-xl focus:outline-none transition ${
                    errorField === 'email'
                      ? 'border-rose-500 ring-1 ring-rose-500/30'
                      : 'border-slate-800 focus:border-cyan-500'
                  }`}
                />
              </div>
              {errorField === 'email' && (
                <span className="text-[11px] text-rose-400 flex items-center gap-1 font-sans">
                  Must include a valid '@' domain.
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                {mode === 'signup' && (
                  <span className="text-[10px] text-slate-500 font-mono">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 bg-slate-950 border text-xs text-white rounded-xl focus:outline-none transition ${
                    errorField === 'password'
                      ? 'border-rose-500 ring-1 ring-rose-500/30'
                      : 'border-slate-800 focus:border-cyan-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorField === 'password' && (
                <span className="text-[11px] text-rose-400 flex items-center gap-1 font-sans">
                  Password requirement not met.
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Database...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Account & Save to Database</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Helper & Test Suite Launcher */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <button
              id="auth-quick-fill-demo-btn"
              type="button"
              onClick={fillDemoAccount}
              className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Demo Credentials</span>
            </button>

            {onClose && (
              <button
                id="auth-cancel-close-btn"
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-300"
              >
                Close
              </button>
            )}
          </div>

          {/* Post-Generation Checklist & Vibe Code Review Suite Banner */}
          <div className="mt-4 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1">
                <Database className="w-3 h-3 text-cyan-400" />
                Vibe Coding Review Phase Tests
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <button
                id="test-trigger-bad-data-btn"
                type="button"
                onClick={() => {
                  setEmail('invalidemail');
                  setPassword('12');
                  setUsername('A');
                  setMode('signup');
                  setErrorMessage('Please enter a valid email address with an "@" symbol.');
                  setErrorField('email');
                  onRunTestSandbox?.('bad_data');
                }}
                className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/40 text-rose-300 text-center transition"
                title="Test short password (2 chars) or missing @"
              >
                1. Bad Data Test
              </button>

              <button
                id="test-trigger-refresh-btn"
                type="button"
                onClick={() => {
                  onRunTestSandbox?.('refresh');
                }}
                className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 hover:bg-cyan-900/40 text-cyan-300 text-center transition"
                title="Verify session persists on reload"
              >
                2. Refresh Test
              </button>

              <button
                id="test-trigger-bounce-btn"
                type="button"
                onClick={() => {
                  onRunTestSandbox?.('bounce');
                }}
                className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/40 text-amber-300 text-center transition"
                title="Verify logout bounces unauthenticated users"
              >
                3. Bounce Test
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
