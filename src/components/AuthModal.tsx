import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  Database,
} from 'lucide-react';
import { authService } from '../services/authService';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
  isProtectedRedirect?: boolean;
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
          role: 'student',
        });
        setSuccessMessage(
          `Welcome to Vibe Code Academy, ${user.username}. Account created and registered in database.`
        );
        setTimeout(() => {
          onSuccess?.(user);
          onClose?.();
        }, 900);
      } else {
        const { user } = await authService.login({
          email: trimmedEmail,
          password,
        });
        setSuccessMessage(`Welcome back, ${user.username}. Redirecting to student dashboard...`);
        setTimeout(() => {
          onSuccess?.(user);
          onClose?.();
        }, 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      if (err.message?.toLowerCase().includes('password')) {
        setErrorField('password');
      } else if (err.message?.toLowerCase().includes('email') || err.message?.toLowerCase().includes('exists')) {
        setErrorField('email');
      } else if (err.message?.toLowerCase().includes('username')) {
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
      }, 800);
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 overflow-y-auto"
    >
      <div
        id="auth-modal-container"
        className="w-full max-w-md bg-[var(--white)] border-2 border-[var(--black)] p-6 sm:p-8 relative my-8"
      >
        <div className="h-1 bg-[var(--red)] absolute top-0 left-0 right-0" aria-hidden="true" />

        {isProtectedRedirect && (
          <div
            id="protected-route-banner"
            className="mb-5 p-3 bg-[var(--gray)] border border-[var(--red)] flex items-start gap-2.5 text-xs text-[var(--black)]"
          >
            <Lock className="w-4 h-4 text-[var(--red)] shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold uppercase text-[var(--red)] block">
                Protected Route Notice
              </span>
              <span>You must be logged in to view your learning progress and student dashboard.</span>
            </div>
          </div>
        )}

        <div className="mb-6 space-y-1">
          <div className="eyebrow font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authentication Gateway</span>
          </div>
          <h2 id="auth-modal-title" className="text-2xl font-bold text-[var(--black)]">
            {mode === 'login' ? 'Student Sign-In' : 'Create Student Account'}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {mode === 'login'
              ? 'Access your saved projects, Google Drive sync, and badges'
              : 'Join the platform to track your learning journey across 5 cloud tiers'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 border border-[var(--black)] mb-6">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => resetForm('login')}
            className={`py-2 text-xs font-mono font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-[var(--black)] text-[var(--white)]'
                : 'bg-[var(--white)] text-[var(--black)] hover:bg-[var(--gray)]'
            }`}
          >
            Log In
          </button>
          <button
            id="auth-tab-signup"
            type="button"
            onClick={() => resetForm('signup')}
            className={`py-2 text-xs font-mono font-semibold border-l border-[var(--black)] transition-colors ${
              mode === 'signup'
                ? 'bg-[var(--black)] text-[var(--white)]'
                : 'bg-[var(--white)] text-[var(--black)] hover:bg-[var(--gray)]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div
            id="auth-error-banner"
            role="alert"
            className="mb-5 p-3.5 bg-[var(--gray)] border-2 border-[var(--red)] flex items-start gap-3 text-xs text-[var(--black)]"
          >
            <AlertCircle className="w-4 h-4 text-[var(--red)] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-mono font-bold uppercase text-[var(--red)] block">
                Action Required
              </span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div
            id="auth-success-banner"
            role="status"
            className="mb-5 p-3.5 bg-[var(--gray)] border-2 border-[var(--black)] flex items-start gap-3 text-xs text-[var(--black)]"
          >
            <Check className="w-4 h-4 text-[var(--black)] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-mono font-bold uppercase block">Authenticated</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            id="auth-google-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="button button--outline w-full"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
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
            <div className="border-t border-[var(--rule)] w-full"></div>
            <span className="bg-[var(--white)] px-3 text-[10px] font-mono uppercase text-[var(--text-muted)] absolute">
              or with email
            </span>
          </div>

          <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label htmlFor="auth-input-username" className="block text-xs font-mono font-semibold text-[var(--black)] uppercase">
                  Student Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-input-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    className={`w-full pl-9 pr-3 py-2 bg-[var(--gray)] border text-xs text-[var(--black)] ${
                      errorField === 'username' ? 'border-[var(--red)]' : 'border-[var(--black)]'
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="auth-input-email" className="block text-xs font-mono font-semibold text-[var(--black)] uppercase">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@vibecode.edu"
                  className={`w-full pl-9 pr-3 py-2 bg-[var(--gray)] border text-xs text-[var(--black)] ${
                    errorField === 'email' ? 'border-[var(--red)]' : 'border-[var(--black)]'
                  }`}
                />
              </div>
              {errorField === 'email' && (
                <span className="text-[11px] text-[var(--red)] block">
                  Must include a valid &lsquo;@&rsquo; domain.
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="auth-input-password" className="block text-xs font-mono font-semibold text-[var(--black)] uppercase">
                  Password
                </label>
                {mode === 'signup' && (
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">Min 6 characters</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-input-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2 bg-[var(--gray)] border text-xs text-[var(--black)] ${
                    errorField === 'password' ? 'border-[var(--red)]' : 'border-[var(--black)]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-[var(--black)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errorField === 'password' && (
                <span className="text-[11px] text-[var(--red)] block">
                  Password requirement not met.
                </span>
              )}
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="button w-full"
            >
              {loading ? (
                <span>Connecting to Database...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <span>Create Account &amp; Save to Database</span>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-mono">
            <button
              id="auth-quick-fill-demo-btn"
              type="button"
              onClick={fillDemoAccount}
              className="text-[var(--red)] hover:underline flex items-center gap-1 font-semibold"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Demo Credentials</span>
            </button>

            {onClose && (
              <button
                id="auth-cancel-close-btn"
                type="button"
                onClick={onClose}
                className="text-[var(--text-muted)] hover:text-[var(--black)]"
              >
                Close
              </button>
            )}
          </div>

          <div className="mt-4 p-3 bg-[var(--gray)] border border-[var(--rule)]">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">
              <Database className="w-3 h-3 text-[var(--black)]" />
              <span>Auth Review Phase Tests</span>
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
                className="p-1.5 border border-[var(--red)] text-[var(--red)] bg-[var(--white)] hover:bg-[var(--red)] hover:text-white text-center transition-colors"
              >
                1. Bad Data
              </button>

              <button
                id="test-trigger-refresh-btn"
                type="button"
                onClick={() => onRunTestSandbox?.('refresh')}
                className="p-1.5 border border-[var(--black)] text-[var(--black)] bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] text-center transition-colors"
              >
                2. Refresh
              </button>

              <button
                id="test-trigger-bounce-btn"
                type="button"
                onClick={() => onRunTestSandbox?.('bounce')}
                className="p-1.5 border border-[var(--black)] text-[var(--black)] bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] text-center transition-colors"
              >
                3. Bounce
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
