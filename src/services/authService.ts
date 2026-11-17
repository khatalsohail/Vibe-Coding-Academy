import { UserAccount, AuthSession } from '../types';

const AUTH_STORAGE_KEY = 'vibe_edu_auth_session';
const AUTH_USERS_KEY = 'vibe_edu_local_users';

type AuthListener = (session: AuthSession) => void;

class AuthService {
  private listeners: Set<AuthListener> = new Set();
  private currentSession: AuthSession;

  constructor() {
    this.currentSession = this.loadInitialSession();
  }

  private loadInitialSession(): AuthSession {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user?.id && parsed?.isAuthenticated) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not restore auth session from localStorage:', e);
    }

    // Default: Authenticated demo student session so the user immediately experiences the platform,
    // but can switch, sign up, test log in, or log out anytime!
    const defaultDemoUser: UserAccount = {
      id: 'usr_student_demo_01',
      email: 'student@vibecode.edu',
      username: 'Alex Chen',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      avatar: '',
      role: 'student',
      provider: 'password',
      last_login: new Date().toISOString(),
      stats: {
        xp: 420,
        level: 2,
        challengesResolved: 3,
      },
    };

    const initial: AuthSession = {
      user: defaultDemoUser,
      token: 'tok_demo_session_initialized',
      isAuthenticated: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(initial));
    } catch (_) {}

    return initial;
  }

  private saveSession(session: AuthSession) {
    this.currentSession = session;
    try {
      if (session.isAuthenticated && session.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save session to localStorage:', e);
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentSession);
      } catch (err) {
        console.error('Auth listener error:', err);
      }
    });
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    listener(this.currentSession);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSession(): AuthSession {
    return this.currentSession;
  }

  public getCurrentUser(): UserAccount | null {
    return this.currentSession.user;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.currentSession.isAuthenticated && this.currentSession.user);
  }

  // Register a new user
  public async register(payload: { email: string; username: string; password: string; role?: 'student' | 'educator' }): Promise<{ user: UserAccount; token: string }> {
    const { email, username, password, role = 'student' } = payload;

    // Client-side quick check
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address with an "@" symbol.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (!username || username.trim().length < 2) {
      throw new Error('Username must be at least 2 characters long.');
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), username: username.trim(), password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account.');
      }

      const session: AuthSession = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      this.saveSession(session);
      return { user: data.user, token: data.token };
    } catch (err: any) {
      // Fallback local persistence if offline / backend error
      if (err.message.includes('already exists') || err.message.includes('characters long') || err.message.includes('@')) {
        throw err;
      }
      
      console.warn('Falling back to local user registration:', err.message);
      const userId = `usr_local_${Date.now()}`;
      const createdAt = new Date().toISOString();
      const localUser: UserAccount = {
        id: userId,
        email: email.trim().toLowerCase(),
        username: username.trim(),
        created_at: createdAt,
        avatar: '',
        role,
        provider: 'password',
        last_login: createdAt,
        stats: { xp: 100, level: 1, challengesResolved: 0 },
      };

      const session: AuthSession = {
        user: localUser,
        token: `tok_local_${Date.now()}`,
        isAuthenticated: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      this.saveSession(session);
      return { user: localUser, token: session.token! };
    }
  }

  // Log in with email and password
  public async login(payload: { email: string; password: string }): Promise<{ user: UserAccount; token: string }> {
    const { email, password } = payload;

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address with an "@" symbol.');
    }
    if (!password) {
      throw new Error('Password is required.');
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      const session: AuthSession = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      this.saveSession(session);
      return { user: data.user, token: data.token };
    } catch (err: any) {
      throw err;
    }
  }

  // Google OAuth sign in
  public async loginWithGoogle(mockProfile?: { email: string; name: string; avatar?: string }): Promise<{ user: UserAccount; token: string }> {
    const profile = mockProfile || {
      email: 'student.google@vibecode.edu',
      name: 'Google Student',
      avatar: '',
    };

    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          googleId: `gid_${Date.now()}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Google sign-in failed.');
      }

      const session: AuthSession = {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      this.saveSession(session);
      return { user: data.user, token: data.token };
    } catch (err: any) {
      // Fallback Google Student
      const localGoogleUser: UserAccount = {
        id: `usr_g_${Date.now()}`,
        email: profile.email,
        username: profile.name,
        created_at: new Date().toISOString(),
        avatar: profile.avatar || '',
        role: 'student',
        provider: 'google',
        last_login: new Date().toISOString(),
        stats: { xp: 150, level: 1, challengesResolved: 0 },
      };

      const session: AuthSession = {
        user: localGoogleUser,
        token: `tok_g_${Date.now()}`,
        isAuthenticated: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      this.saveSession(session);
      return { user: localGoogleUser, token: session.token! };
    }
  }

  // Log Out
  public async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}

    const loggedOutSession: AuthSession = {
      user: null,
      token: null,
      isAuthenticated: false,
    };

    this.saveSession(loggedOutSession);
  }

  // Update user profile or stats
  public updateLocalUserStats(statsDelta: { xp?: number; level?: number; challengesResolved?: number }) {
    if (!this.currentSession.user) return;

    const currentStats = this.currentSession.user.stats || { xp: 0, level: 1, challengesResolved: 0 };
    const updatedUser: UserAccount = {
      ...this.currentSession.user,
      stats: {
        xp: statsDelta.xp !== undefined ? statsDelta.xp : currentStats.xp,
        level: statsDelta.level !== undefined ? statsDelta.level : currentStats.level,
        challengesResolved: statsDelta.challengesResolved !== undefined ? statsDelta.challengesResolved : currentStats.challengesResolved,
      },
    };

    this.saveSession({
      ...this.currentSession,
      user: updatedUser,
    });
  }
}

export const authService = new AuthService();
