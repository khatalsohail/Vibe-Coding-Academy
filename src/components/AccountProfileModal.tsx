import React, { useState, useEffect } from 'react';
import {
  Shield,
  LogOut,
  Database,
  X,
  Sparkles,
} from 'lucide-react';
import { UserAccount } from '../types';

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
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/auth/users')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.users) setAllUsers(data.users);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const copyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div
      id="account-profile-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={onClose}
    >
      <div
        id="account-profile-container"
        className="w-full max-w-xl bg-[var(--white)] border-2 border-[var(--black)] p-6 sm:p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--black)]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[var(--black)] text-[var(--white)] flex items-center justify-center font-mono font-bold text-lg shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="account-profile-title" className="text-lg font-bold text-[var(--black)]">
                  {user.username}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--red)] text-white uppercase font-bold">
                  {user.role || 'Student'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
            </div>
          </div>

          <button
            id="close-profile-modal-btn"
            type="button"
            onClick={onClose}
            aria-label="Close account profile"
            className="p-2 border border-[var(--rule)] text-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Database Record Schema */}
        <div className="my-6 p-4 bg-[var(--gray)] border border-[var(--rule)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow font-mono flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Database User Record</span>
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums">
              Port 3000 • {allUsers.length > 0 ? `${allUsers.length} records` : 'Persistent Store'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block">
                Unique ID
              </span>
              <div className="flex items-center justify-between mt-1 gap-2">
                <code className="text-[var(--black)] font-mono text-[11px] truncate">{user.id}</code>
                <button
                  type="button"
                  onClick={copyUserId}
                  className="text-[10px] font-mono font-semibold text-[var(--red)] hover:underline shrink-0"
                >
                  {copiedId ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block">
                Email
              </span>
              <span className="text-[var(--black)] font-mono text-[11px] truncate block mt-1">
                {user.email}
              </span>
            </div>

            <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block">
                Display Name
              </span>
              <span className="text-[var(--black)] font-mono text-[11px] block mt-1">
                {user.username}
              </span>
            </div>

            <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
              <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block">
                Created At
              </span>
              <span className="text-[var(--black)] font-mono text-[11px] block mt-1 tabular-nums">
                {new Date(user.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="p-3.5 bg-[var(--gray)] border border-[var(--black)] flex items-center justify-between gap-3 text-xs mb-6">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-[var(--black)] shrink-0" />
            <div>
              <span className="text-[var(--black)] font-semibold block">Session Security Status</span>
              <span className="text-[var(--text-muted)] text-[11px]">
                Provider: <strong className="uppercase">{user.provider || 'Password'}</strong> • Zero secrets exposed to client
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[var(--black)] text-[var(--white)] text-[10px] font-mono font-bold shrink-0">
            ACTIVE
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            id="open-review-testbench-from-profile-btn"
            type="button"
            onClick={() => {
              onClose();
              onOpenTestReviewer();
            }}
            className="button button--outline w-full sm:w-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Auth Testbench</span>
          </button>

          <button
            id="profile-logout-btn"
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="button w-full sm:w-auto !bg-[var(--red)] !border-[var(--red)]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
