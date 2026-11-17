import React, { useState, useRef, useEffect } from 'react';
import {
  FolderGit2,
  Terminal,
  Layers,
  ShieldCheck,
  Rocket,
  Check,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { LearningTrack, UserProgress, UserAccount } from '../types';
import { LEARNING_TRACKS } from '../data/learningContent';
import { DriveAuthStatus } from '../services/driveService';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentTab: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy';
  setCurrentTab: (tab: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy') => void;
  userProgress: UserProgress;
  driveStatus: DriveAuthStatus;
  currentUser: UserAccount | null;
  onOpenDriveModal: () => void;
  onSelectTrack: (track: LearningTrack) => void;
  onOpenAuthModal: (mode?: 'login' | 'signup') => void;
  onOpenProfileModal: () => void;
  onLogout: () => void;
  onOpenReviewTestModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userProgress,
  driveStatus,
  currentUser,
  onOpenDriveModal,
  onSelectTrack,
  onOpenAuthModal,
  onOpenProfileModal,
  onLogout,
  onOpenReviewTestModal,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNavClick = (tab: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy') => {
    if (!currentUser) {
      onOpenAuthModal('login');
      return;
    }
    setCurrentTab(tab);
  };

  const navItems: {
    id: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy';
    label: string;
    mobileLabel: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', mobileLabel: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'playground', label: 'Playground', mobileLabel: 'Playground', icon: <Terminal className="w-4 h-4" /> },
    { id: 'context', label: 'Context Builder', mobileLabel: 'Context', icon: <Layers className="w-4 h-4" /> },
    { id: 'review', label: 'Review Arena', mobileLabel: 'Review', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'deploy', label: 'Deploy', mobileLabel: 'Deploy', icon: <Rocket className="w-4 h-4" /> },
  ];

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 bg-[var(--white)] border-b border-[var(--black)]"
    >
      <div className="max-w-[72rem] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          id="brand-home-btn"
          type="button"
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 text-left shrink-0 whitespace-nowrap group"
        >
          <span className="h-7 w-7 bg-[var(--black)] text-[var(--white)] group-hover:bg-[var(--red)] transition-colors flex items-center justify-center font-bold text-sm tracking-tighter">
            V
          </span>
          <span className="text-base font-bold tracking-tight text-[var(--black)] font-mono">
            VIBE_CODE<span className="text-[var(--red)]">.edu</span>
          </span>
        </button>

        {/* Zone 2: Primary Single-Line Navigation */}
        <nav
          id="navbar-nav-links"
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium h-full"
        >
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`h-full flex items-center gap-1.5 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  isActive
                    ? 'border-[var(--red)] text-[var(--black)] font-semibold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--black)]'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'dashboard' && !currentUser && (
                  <Lock className="w-3.5 h-3.5 text-[var(--red)]" aria-label="Protected" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action / Account Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                id="user-profile-menu-btn"
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                aria-expanded={showUserDropdown}
                aria-haspopup="menu"
                className="flex items-center gap-2.5 border border-[var(--black)] bg-[var(--white)] hover:bg-[var(--gray)] px-3 py-1.5 transition-colors whitespace-nowrap"
              >
                <div className="h-6 w-6 bg-[var(--black)] text-[var(--white)] flex items-center justify-center text-xs font-bold font-mono shrink-0">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start text-left leading-none">
                  <span className="text-xs font-semibold text-[var(--black)] truncate max-w-[110px]">
                    {currentUser.username}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums mt-0.5">
                    LVL {userProgress.level} • {userProgress.xp} XP
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </button>

              {showUserDropdown && (
                <div
                  id="user-profile-dropdown"
                  role="menu"
                  className="absolute right-0 mt-2 w-72 bg-[var(--white)] border border-[var(--black)] p-3 z-50 space-y-2"
                >
                  {/* Identity Summary */}
                  <div className="p-2.5 bg-[var(--gray)] border border-[var(--rule)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[var(--black)] truncate">
                        {currentUser.username}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--red)] font-semibold tabular-nums">
                        {userProgress.streakDays}D STREAK
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                      {currentUser.email}
                    </div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1 tabular-nums">
                      ID: {currentUser.id.slice(0, 12)}
                    </div>
                  </div>

                  {/* Track Switcher Section */}
                  <div className="pt-1 border-t border-[var(--rule)]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold px-1 py-1">
                      Learning Track
                    </div>
                    <div className="space-y-1">
                      {Object.values(LEARNING_TRACKS).map((track) => {
                        const selected = userProgress.track === track.id;
                        return (
                          <button
                            key={track.id}
                            id={`track-option-${track.id}`}
                            type="button"
                            onClick={() => {
                              onSelectTrack(track.id);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 text-left text-xs border transition-colors ${
                              selected
                                ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)] font-semibold'
                                : 'bg-[var(--white)] text-[var(--black)] border-transparent hover:bg-[var(--gray)]'
                            }`}
                          >
                            <span className="truncate">{track.title.replace(' Track', '')}</span>
                            {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Account & System Tools */}
                  <div className="pt-2 border-t border-[var(--rule)] space-y-1">
                    <button
                      id="menu-open-profile-btn"
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfileModal();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--black)] hover:bg-[var(--gray)] transition-colors text-left"
                    >
                      <User className="w-3.5 h-3.5 text-[var(--red)] shrink-0" />
                      <span>Account Profile &amp; DB Record</span>
                    </button>

                    <button
                      id="google-drive-sync-btn"
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenDriveModal();
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-[var(--black)] hover:bg-[var(--gray)] transition-colors text-left"
                    >
                      <span className="flex items-center gap-2">
                        <FolderGit2 className="w-3.5 h-3.5 text-[var(--black)] shrink-0" />
                        <span>Drive: /vibe-coding-site</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                        {driveStatus.isConnected ? 'Synced' : 'Local'}
                      </span>
                    </button>

                    <button
                      id="menu-open-testbench-btn"
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenReviewTestModal();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--black)] hover:bg-[var(--gray)] transition-colors text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--black)] shrink-0" />
                      <span>Auth Review Testbench</span>
                    </button>

                    <button
                      id="menu-toggle-theme-btn"
                      type="button"
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-[var(--black)] hover:bg-[var(--gray)] transition-colors text-left"
                    >
                      <span className="flex items-center gap-2">
                        {isDark ? (
                          <Sun className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{isDark ? 'Swiss Light Mode' : 'Inverse Dark Mode'}</span>
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                        {theme}
                      </span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="pt-2 border-t border-[var(--rule)]">
                    <button
                      id="menu-logout-btn"
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-[var(--red)] hover:bg-[var(--red)] hover:text-white transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-login-btn"
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="button button--outline !py-1.5 !px-3.5 !text-xs"
              >
                Log In
              </button>
              <button
                id="nav-signup-btn"
                type="button"
                onClick={() => onOpenAuthModal('signup')}
                className="button !py-1.5 !px-3.5 !text-xs"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar (Compact 5-column Grid) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden grid grid-cols-5 border-t border-[var(--rule)] bg-[var(--white)]"
      >
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium border-t-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[var(--red)] text-[var(--black)] font-semibold bg-[var(--gray)]'
                  : 'border-transparent text-[var(--text-muted)]'
              }`}
            >
              {item.icon}
              <span>{item.mobileLabel}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
