import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { PlaygroundView } from './components/PlaygroundView';
import { ContextBuilderView } from './components/ContextBuilderView';
import { ReviewArenaView } from './components/ReviewArenaView';
import { DeploySandboxView } from './components/DeploySandboxView';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { AITutorModal } from './components/AITutorModal';
import { AuthModal } from './components/AuthModal';
import { AccountProfileModal } from './components/AccountProfileModal';
import { AuthReviewTestingModal } from './components/AuthReviewTestingModal';
import { LearningTrack, TelemetryMetrics, UserProgress, GeneratedSystemSpec, DriveSyncedFile, DailyTask, AchievementBadge, UserAccount, AuthSession } from './types';
import { DriveService, DriveAuthStatus } from './services/driveService';
import { authService } from './services/authService';
import { INITIAL_DAILY_TASKS, LEARNING_TRACKS } from './data/learningContent';
import { INITIAL_ACHIEVEMENT_BADGES } from './data/achievementBadges';
import { fireMilestoneConfetti, fireTaskConfetti } from './utils/confetti';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'playground' | 'context' | 'review' | 'deploy'>('dashboard');

  // Authentication State & Session Persistence
  const [authSession, setAuthSession] = useState<AuthSession>(authService.getSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isProtectedRedirect, setIsProtectedRedirect] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isReviewTestModalOpen, setIsReviewTestModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = authService.subscribe((session) => {
      setAuthSession(session);
    });
    return () => unsubscribe();
  }, []);

  const currentUser = authSession.user;

  // Protected Route Guard Enforcement:
  // If user is not logged in and tries to access 'dashboard', bounce to login
  useEffect(() => {
    if (!currentUser && currentTab === 'dashboard') {
      setIsProtectedRedirect(true);
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
  }, [currentUser, currentTab]);

  // Achievement Badges State
  const [badges, setBadges] = useState<AchievementBadge[]>(INITIAL_ACHIEVEMENT_BADGES);

  // User Progression State
  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: currentUser?.stats?.xp || 450,
    level: currentUser?.stats?.level || 2,
    streakDays: 5,
    lastActiveDate: new Date().toISOString(),
    completedLessons: ['mod-cs-1'],
    track: 'cs_major',
    challengesCompleted: currentUser?.stats?.challengesResolved || 1,
    promptsRefined: 4,
    driveSyncEnabled: true,
    lastDriveSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dailyTasks: INITIAL_DAILY_TASKS,
    unlockedBadgeIds: ['api-architect', 'secure-coder', 'prompt-craftsman', 'drive-archivist'],
  });

  // Real-time Telemetry State
  const [telemetry, setTelemetry] = useState<TelemetryMetrics>({
    promptPrecisionScore: 88,
    architecturalClarityIndex: 92,
    tokenEfficiencyScore: 84,
    codeReviewSuccessRate: 90,
    hallucinationCatchRate: 85,
    totalGenerations: 12,
    weeklyTrend: [
      { day: 'Mon', score: 65, prompts: 2 },
      { day: 'Tue', score: 72, prompts: 4 },
      { day: 'Wed', score: 80, prompts: 3 },
      { day: 'Thu', score: 85, prompts: 5 },
      { day: 'Fri', score: 88, prompts: 6 },
    ],
  });

  // Google Drive State
  const [driveStatus, setDriveStatus] = useState<DriveAuthStatus>(DriveService.getAuthStatus());
  const [driveFiles, setDriveFiles] = useState<DriveSyncedFile[]>(DriveService.getFiles());
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);

  // Active spec generated in playground for 1-click deploy
  const [activeSpec, setActiveSpec] = useState<GeneratedSystemSpec | null>(null);

  // Refresh files helper
  const handleRefreshDriveFiles = () => {
    setDriveFiles(DriveService.getFiles());
    setDriveStatus(DriveService.getAuthStatus());
  };

  const handleOpenAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsProtectedRedirect(false);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: UserAccount) => {
    setIsAuthModalOpen(false);
    setIsProtectedRedirect(false);
    setUserProgress((prev) => ({
      ...prev,
      xp: authenticatedUser.stats?.xp || prev.xp,
      level: authenticatedUser.stats?.level || prev.level,
    }));
    setCurrentTab('dashboard');
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsProtectedRedirect(true);
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSimulateBounce = () => {
    setIsProtectedRedirect(true);
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSimulateBadData = () => {
    setAuthModalMode('signup');
    setIsProtectedRedirect(false);
    setIsAuthModalOpen(true);
  };

  const handleAddXP = (amount: number) => {
    setUserProgress((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 300) + 1;
      const newCount = prev.challengesCompleted + 1;
      authService.updateLocalUserStats({ xp: newXP, level: newLevel, challengesResolved: newCount });
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        challengesCompleted: newCount,
      };
    });

    setTelemetry((prev) => ({
      ...prev,
      hallucinationCatchRate: Math.min(99, prev.hallucinationCatchRate + 3),
      codeReviewSuccessRate: Math.min(99, prev.codeReviewSuccessRate + 2),
    }));

    // Auto check 'secure-coder' badge milestone
    setBadges((prevBadges) =>
      prevBadges.map((badge) => {
        if (badge.id === 'secure-coder' && !badge.unlocked) {
          return {
            ...badge,
            unlocked: true,
            unlockedAt: 'Just Now',
            progress: { ...badge.progress, current: badge.progress.max },
          };
        }
        return badge;
      })
    );
  };

  const handleUnlockBadge = (badgeId: string, event?: React.MouseEvent) => {
    let rewardedXP = 0;
    setBadges((prevBadges) =>
      prevBadges.map((b) => {
        if (b.id === badgeId) {
          rewardedXP = b.xpReward;
          return {
            ...b,
            unlocked: true,
            unlockedAt: 'Just Now',
            progress: { ...b.progress, current: b.progress.max },
          };
        }
        return b;
      })
    );

    if (rewardedXP > 0) {
      setUserProgress((prev) => {
        const newXP = prev.xp + rewardedXP;
        const newLevel = Math.floor(newXP / 300) + 1;
        const unlockedIds = prev.unlockedBadgeIds || [];
        authService.updateLocalUserStats({ xp: newXP, level: newLevel });
        return {
          ...prev,
          xp: newXP,
          level: newLevel,
          unlockedBadgeIds: unlockedIds.includes(badgeId) ? unlockedIds : [...unlockedIds, badgeId],
        };
      });
    }

    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      fireMilestoneConfetti(
        (rect.left + rect.width / 2) / window.innerWidth,
        (rect.top + rect.height / 2) / window.innerHeight
      );
    } else {
      fireMilestoneConfetti();
    }
  };

  const handleCompleteTask = (taskId: string, points: number, event?: React.MouseEvent) => {
    let nowCompleted = false;
    setUserProgress((prev) => {
      const currentTasks = prev.dailyTasks || INITIAL_DAILY_TASKS;
      const updatedTasks = currentTasks.map((task) => {
        if (task.id === taskId) {
          nowCompleted = !task.completed;
          return { ...task, completed: !task.completed };
        }
        return task;
      });

      const newXP = nowCompleted ? prev.xp + points : Math.max(0, prev.xp - points);
      const newLevel = Math.floor(newXP / 300) + 1;
      authService.updateLocalUserStats({ xp: newXP, level: newLevel });

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        dailyTasks: updatedTasks,
      };
    });

    if (nowCompleted) {
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect();
        fireTaskConfetti(
          (rect.left + rect.width / 2) / window.innerWidth,
          (rect.top + rect.height / 2) / window.innerHeight
        );
      } else {
        fireTaskConfetti();
      }
    }
  };

  const handleCompleteModule = (moduleId: string, xpReward: number, event?: React.MouseEvent) => {
    let justCompleted = false;
    setUserProgress((prev) => {
      const alreadyCompleted = prev.completedLessons.includes(moduleId);
      const updatedLessons = alreadyCompleted
        ? prev.completedLessons.filter((id) => id !== moduleId)
        : [...prev.completedLessons, moduleId];

      justCompleted = !alreadyCompleted;
      const newXP = justCompleted ? prev.xp + xpReward : Math.max(0, prev.xp - xpReward);
      const newLevel = Math.floor(newXP / 300) + 1;
      authService.updateLocalUserStats({ xp: newXP, level: newLevel });

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        completedLessons: updatedLessons,
      };
    });

    if (justCompleted) {
      if (event) {
        const rect = event.currentTarget.getBoundingClientRect();
        fireMilestoneConfetti(
          (rect.left + rect.width / 2) / window.innerWidth,
          (rect.top + rect.height / 2) / window.innerHeight
        );
      } else {
        fireMilestoneConfetti();
      }
    }
  };

  const handleAwardXP = (amount: number) => {
    setUserProgress((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 300) + 1;
      authService.updateLocalUserStats({ xp: newXP, level: newLevel });
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  };

  const handleSelectTrack = (track: LearningTrack) => {
    setUserProgress((prev) => ({ ...prev, track }));
  };

  const handleSendToPlayground = (_promptText: string) => {
    setCurrentTab('playground');
  };

  const handleDeployRequest = (spec: GeneratedSystemSpec) => {
    setActiveSpec(spec);
    setCurrentTab('deploy');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProgress={userProgress}
        driveStatus={driveStatus}
        currentUser={currentUser}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
        onSelectTrack={handleSelectTrack}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        onOpenReviewTestModal={() => setIsReviewTestModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full"
          >
            {currentTab === 'dashboard' && (
              <DashboardView
                userProgress={userProgress}
                telemetry={telemetry}
                driveStatus={driveStatus}
                driveFiles={driveFiles}
                badges={badges}
                onSelectTrack={handleSelectTrack}
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenDriveModal={() => setIsDriveModalOpen(true)}
                onCompleteTask={handleCompleteTask}
                onCompleteModule={handleCompleteModule}
                onUnlockBadge={handleUnlockBadge}
                onAwardXP={handleAwardXP}
              />
            )}

            {currentTab === 'playground' && (
              <PlaygroundView
                onDeployRequest={handleDeployRequest}
                onDriveSyncSuccess={handleRefreshDriveFiles}
              />
            )}

            {currentTab === 'context' && (
              <ContextBuilderView onSendToPlayground={handleSendToPlayground} />
            )}

            {currentTab === 'review' && (
              <ReviewArenaView onAddXP={handleAddXP} />
            )}

            {currentTab === 'deploy' && (
              <DeploySandboxView
                currentSpec={activeSpec}
                onDriveSyncSuccess={handleRefreshDriveFiles}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Vibe Coding Academy • Powered by Intent & System Design</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Database: Persistent NoSQL User Records</span>
            <span>Session: Secure Local + Bearer Token</span>
            <span>Gemini AI 2.5: Active</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Sign Up & Log In) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (currentUser) {
            setIsAuthModalOpen(false);
          }
        }}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        isProtectedRedirect={isProtectedRedirect}
        onRunTestSandbox={(testType) => {
          if (testType === 'refresh') {
            setIsReviewTestModalOpen(true);
          } else if (testType === 'bounce') {
            setIsReviewTestModalOpen(true);
          }
        }}
      />

      {/* Account Profile Modal */}
      <AccountProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        onOpenTestReviewer={() => setIsReviewTestModalOpen(true)}
      />

      {/* Review Phase Testing Modal (The 3 Tests) */}
      <AuthReviewTestingModal
        isOpen={isReviewTestModalOpen}
        onClose={() => setIsReviewTestModalOpen(false)}
        currentUser={currentUser}
        onSimulateBounce={handleSimulateBounce}
        onSimulateBadData={handleSimulateBadData}
      />

      {/* Google Drive Synchronization Modal */}
      <GoogleDriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        driveStatus={driveStatus}
        files={driveFiles}
        onRefreshFiles={handleRefreshDriveFiles}
      />

      {/* Floating AI Architecture Tutor */}
      <AITutorModal
        currentTab={currentTab}
        track={userProgress.track}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />
    </div>
  );
}
