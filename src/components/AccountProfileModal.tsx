import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Key,
  LogOut,
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Flame,
  Zap,
  RefreshCw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { UserAccount } from '../types';
import { authService } from '../services/authService';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onLogout: () => void;
  onOpenTestReviewer: () => void;
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenTestReviewer,
}) => {
  const [allUsers, setAllUsers] = useState<UserAccount[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRegisteredUsers();
    }
  }, [isOpen]);

  const fetchRegisteredUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data.users || []);
      }
    } catch (e) {
      console.warn('Could not fetch registered users:', e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  if (!isOpen || !user) return null;

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div
      id="account-profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="account-profile-container"
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-cyan-950/40 p-6 sm:p-8 relative overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{user.username}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-bold">
                  {user.role || 'Student'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">{user.email}</p>
            </div>
          </div>

          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Record Schema Card */}
        <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              DATABASE USER RECORD (PERSISTENT STORE)
            </span>
            <span className="text-[10px] font-mono text-slate-500">Node / Ingress Port 3000</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Unique ID (id)</span>
              <div className="flex items-center justify-between mt-0.5">
                <code className="text-cyan-300 font-mono text-[11px] truncate max-w-[160px]">{user.id}</code>
                <button
                  onClick={copyUserId}
                  className="text-[10px] text-slate-400 hover:text-cyan-400 font-mono"
                >
                  {copiedId ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Email (email)</span>
              <span className="text-slate-200 font-mono text-[11px] truncate block">{user.email}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Display Name (username)</span>
              <span className="text-slate-200 font-mono text-[11px]">{user.username}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-mono block">Created At (created_at)</span>
              <span className="text-slate-200 font-mono text-[11px]">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Session Information */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between text-xs mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-white font-medium block">Session Security Status</span>
              <span className="text-slate-400 text-[11px]">
                Authentication provider: <strong className="text-cyan-300 uppercase">{user.provider || 'Password'}</strong> • Zero secrets exposed to client
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            ACTIVE
          </span>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            id="open-review-testbench-from-profile-btn"
            onClick={() => {
              onClose();
              onOpenTestReviewer();
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-mono transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open Review Checklist Sandbox</span>
          </button>

          <button
            id="profile-logout-btn"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
