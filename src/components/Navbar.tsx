import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Zap,
  FolderGit2,
  Terminal,
  Layers,
  ShieldCheck,
  Rocket,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  User,
  Shield,
  KeyRound,
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
  const [showTrackDropdown, setShowTrackDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const activeTrack = LEARNING_TRACKS[userProgress.track];

  const handleNavClick = (tab: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy') => {
    if (!currentUser) {
      // Trigger Route Guard for Protected Dashboard & Platform Views
      onOpenAuthModal('login');
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo - Bento Grid Aesthetic */}
        <div className="flex items-center gap-3">
          <button
            id="brand-home-btn"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="bg-cyan-500 h-8 w-8 rounded-lg flex items-center justify-center font-bold text-slate-950 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white font-mono">
                  VIBE_CODE<span className="text-cyan-500">.edu</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  BENTO
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Navigation Tabs - Bento Grid Style */}
        <nav id="navbar-nav-links" className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            id="nav-tab-dashboard"
            onClick={() => handleNavClick('dashboard')}
            className={`transition-colors pb-1 flex items-center gap-1.5 ${
              currentTab === 'dashboard'
                ? 'text-white border-b-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Dashboard</span>
            {!currentUser && <Lock className="w-3 h-3 text-amber-400" />}
          </button>

          <button
            id="nav-tab-playground"
            onClick={() => handleNavClick('playground')}
            className={`transition-colors pb-1 ${
              currentTab === 'playground'
                ? 'text-white border-b-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Playground
          </button>

          <button
            id="nav-tab-context"
            onClick={() => handleNavClick('context')}
            className={`transition-colors pb-1 ${
              currentTab === 'context'
                ? 'text-white border-b-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Context Builder
          </button>

          <button
            id="nav-tab-review"
            onClick={() => handleNavClick('review')}
            className={`transition-colors pb-1 ${
              currentTab === 'review'
                ? 'text-white border-b-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Review Arena
          </button>

          <button
            id="nav-tab-deploy"
            onClick={() => handleNavClick('deploy')}
            className={`transition-colors pb-1 ${
              currentTab === 'deploy'
                ? 'text-white border-b-2 border-cyan-500 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deploy
          </button>
        </nav>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Review Phase Testbench Trigger Pill */}
          <button
            id="nav-review-testbench-btn"
            onClick={onOpenReviewTestModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded-full text-xs font-mono transition shadow-sm"
            title="Open Post-Generation Checklist / Auth Testbench"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auth Testbench</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* Active Track Switcher */}
          <div className="relative">
            <button
              id="track-switcher-btn"
              onClick={() => setShowTrackDropdown(!showTrackDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-full text-xs font-mono transition"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="hidden sm:inline">{activeTrack.title.replace(' Track', '')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTrackDropdown && (
              <div
                id="track-dropdown-menu"
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-widest font-mono">
                  Select Learning Track
                </div>
                {Object.values(LEARNING_TRACKS).map((track) => (
                  <button
                    key={track.id}
                    id={`track-option-${track.id}`}
                    onClick={() => {
                      onSelectTrack(track.id);
                      setShowTrackDropdown(false);
                    }}
                    className={`w-full flex items-start gap-2 p-2 rounded-xl text-left text-xs transition ${
                      userProgress.track === track.id ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="mt-0.5">
                      {userProgress.track === track.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700"></div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">{track.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{track.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Capsule or Sign In Buttons */}
          {currentUser ? (
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 py-1 px-3 rounded-full transition group"
              >
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-semibold text-white truncate max-w-[110px]">{currentUser.username}</span>
                  <span className="text-[9px] text-cyan-500 uppercase tracking-widest font-mono">
                    Lvl {userProgress.level} Architect
                  </span>
                </div>
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 overflow-hidden flex items-center justify-center border border-cyan-500/30">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-slate-950">{currentUser.username[0]}</span>
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition" />
              </button>

              {/* Profile & Account Dropdown Menu */}
              {showUserDropdown && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 space-y-1"
                >
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 mb-1">
                    <div className="text-xs font-bold text-white truncate">{currentUser.username}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>DB ID: {currentUser.id.slice(0, 12)}...</span>
                    </div>
                  </div>

                  <button
                    id="menu-open-profile-btn"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenProfileModal();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Account Profile & DB Record</span>
                  </button>

                  <button
                    id="menu-open-testbench-btn"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenReviewTestModal();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-cyan-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Review Phase Testbench</span>
                  </button>

                  <button
                    id="menu-toggle-theme-btn"
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-2">
                      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {theme}
                    </span>
                  </button>

                  <div className="border-t border-slate-800 my-1"></div>

                  <button
                    id="menu-logout-btn"
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/40 transition font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="nav-login-btn"
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full transition"
              >
                Log In
              </button>
              <button
                id="nav-signup-btn"
                onClick={() => onOpenAuthModal('signup')}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 rounded-full shadow-md shadow-cyan-500/20 transition"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Gamified Streak & XP Badges */}
          <div id="gamified-stats-pill" className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-xs font-mono">
            <div className="flex items-center gap-1 text-orange-400 font-bold" title="Daily Streak">
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-500" />
              <span>{userProgress.streakDays}d</span>
            </div>
            <div className="w-px h-3 bg-slate-800"></div>
            <div className="flex items-center gap-1 text-cyan-400 font-bold" title="Experience Points">
              <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              <span>{userProgress.xp} XP</span>
            </div>
          </div>

          {/* Google Drive Sync Pill */}
          <button
            id="google-drive-sync-btn"
            onClick={onOpenDriveModal}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border transition ${
              driveStatus.isConnected
                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/80 hover:bg-cyan-900/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
            title="Google Drive vibe-coding-site folder sync"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">vibe-coding-site</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          </button>

          {/* Theme Mode Switcher (Dark / High-Contrast Light) */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-full text-xs font-mono transition group"
            title={isDark ? 'Switch to High-Contrast Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme Mode"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 group-hover:rotate-45 transition-transform" />
                <span className="hidden sm:inline text-[11px] text-slate-300 font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500/20 group-hover:-rotate-12 transition-transform" />
                <span className="hidden sm:inline text-[11px] text-slate-700 font-medium">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile navigation tab bar */}
      <div className="md:hidden flex items-center justify-around bg-[#020617] border-t border-slate-800 px-2 py-2">
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded ${
            currentTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => handleNavClick('playground')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded ${
            currentTab === 'playground' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Playground
        </button>
        <button
          onClick={() => handleNavClick('context')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded ${
            currentTab === 'context' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          Context
        </button>
        <button
          onClick={() => handleNavClick('review')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded ${
            currentTab === 'review' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Review
        </button>
        <button
          onClick={() => handleNavClick('deploy')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded ${
            currentTab === 'deploy' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Rocket className="w-4 h-4" />
          Deploy
        </button>
      </div>
    </header>
  );
};
