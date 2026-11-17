import React, { useState } from 'react';
import {
  ArrowRight,
  FolderGit2,
  Play,
  RotateCcw,
  Check,
  Terminal,
  ChevronRight,
  Database,
  Lock,
  Server,
  Compass,
  Layers,
} from 'lucide-react';
import { LearningTrack, TelemetryMetrics, UserProgress, DriveSyncedFile, AchievementBadge } from '../types';
import { LEARNING_TRACKS } from '../data/learningContent';
import { DriveAuthStatus } from '../services/driveService';
import { DailyMilestonesAndTasks } from './DailyMilestonesAndTasks';
import { AchievementBadgesShowcase } from './AchievementBadgesShowcase';
import { LearningRoadmapOverlay } from './LearningRoadmapOverlay';

interface DashboardViewProps {
  userProgress: UserProgress;
  telemetry: TelemetryMetrics;
  driveStatus: DriveAuthStatus;
  driveFiles: DriveSyncedFile[];
  badges?: AchievementBadge[];
  onSelectTrack: (track: LearningTrack) => void;
  onNavigate: (tab: 'playground' | 'context' | 'review' | 'deploy') => void;
  onOpenDriveModal: () => void;
  onCompleteTask?: (taskId: string, points: number, event?: React.MouseEvent) => void;
  onCompleteModule?: (moduleId: string, xpReward: number, event?: React.MouseEvent) => void;
  onUnlockBadge?: (badgeId: string, event?: React.MouseEvent) => void;
  onAwardXP?: (amount: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProgress,
  telemetry,
  driveStatus,
  driveFiles,
  badges = [],
  onSelectTrack,
  onNavigate,
  onOpenDriveModal,
  onCompleteTask = () => {},
  onCompleteModule = () => {},
  onUnlockBadge = () => {},
  onAwardXP = () => {},
}) => {
  const [isRoadmapOpen, setIsRoadmapOpen] = useState<boolean>(false);
  const currentTrack = LEARNING_TRACKS[userProgress.track];

  const telemetryBars = [
    { day: 'Mon', pct: 25, highlight: false },
    { day: 'Tue', pct: 45, highlight: false },
    { day: 'Wed', pct: 88, highlight: true },
    { day: 'Thu', pct: 35, highlight: false },
    { day: 'Fri', pct: 92, highlight: true },
    { day: 'Sat', pct: 50, highlight: false },
    { day: 'Sun', pct: 85, highlight: true },
  ];

  return (
    <div id="dashboard-view" className="w-full">
      {/* SECTION 01: ASYMMETRIC HERO & TELEMETRY LEDGER (12-COL SWISS GRID) */}
      <section className="swiss-grid swiss-grid--flush-top">
        {/* Main Column (8 cols) */}
        <div className="main flex flex-col justify-between gap-8">
          <div className="space-y-4">
            <div className="eyebrow font-mono">01 / Intent-Driven Architecture</div>
            <h1>Intent-Driven Architecture Dashboard</h1>
            <p className="lead max-w-2xl">
              Translate natural-language engineering intent into verifiable system topology, security boundaries, and cloud deployments.
            </p>

            {/* Primary Actions & Learning Track Selector */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('playground')}
                className="button"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Launch Playground</span>
              </button>

              <button
                id="open-roadmap-header-btn"
                type="button"
                onClick={() => setIsRoadmapOpen(true)}
                className="button button--outline"
              >
                <Compass className="w-4 h-4" />
                <span>Learning Roadmap</span>
              </button>
            </div>

            {/* Track Switcher Bar */}
            <div className="pt-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2 font-semibold">
                Active Curriculum Track
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 border border-[var(--black)]">
                {Object.values(LEARNING_TRACKS).map((track, idx) => {
                  const isActive = userProgress.track === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => onSelectTrack(track.id)}
                      className={`px-3 py-2.5 text-left text-xs transition-colors ${
                        idx > 0 ? 'border-t sm:border-t-0 sm:border-l border-[var(--black)]' : ''
                      } ${
                        isActive
                          ? 'bg-[var(--black)] text-[var(--white)] font-semibold'
                          : 'bg-[var(--white)] text-[var(--black)] hover:bg-[var(--gray)]'
                      }`}
                    >
                      <div className="font-mono text-[10px] uppercase opacity-75">
                        0{idx + 1}
                      </div>
                      <div className="truncate">{track.title.replace(' Track', '')}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Architectural Directive & 4-Stage Pipeline */}
          <div
            id="bento-playground-hero"
            className="bg-[var(--gray)] border border-[var(--black)] p-6 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--rule)]">
              <span className="eyebrow font-mono">Active Architectural Directive</span>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                VIBE_AGENT_V2.1
              </span>
            </div>

            <div
              onClick={() => onNavigate('playground')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onNavigate('playground');
              }}
              role="button"
              tabIndex={0}
              className="bg-[var(--white)] border border-[var(--rule)] hover:border-[var(--black)] p-5 cursor-pointer transition-colors"
            >
              <p className="text-base sm:text-lg leading-relaxed text-[var(--black)] font-medium">
                &ldquo;Build a real-time collaborative task manager with Google OAuth login, Firestore database persistence, and Google Drive vibe-coding-site sync...&rdquo;
              </p>
              <div className="mt-3 text-xs font-mono text-[var(--red)] font-semibold flex items-center gap-1">
                <span>Open in Playground</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* 4-Stage Architectural Pipeline */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-3">
                Intent-to-Architecture Pipeline
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-[var(--rule)] bg-[var(--white)]">
                <div className="p-3 border-b sm:border-b-0 border-r border-[var(--rule)] flex items-center gap-2.5">
                  <Terminal className="w-4 h-4 text-[var(--red)] shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">01</div>
                    <div className="text-xs font-mono font-semibold text-[var(--black)]">PROMPT</div>
                  </div>
                </div>
                <div className="p-3 border-b sm:border-b-0 sm:border-r border-[var(--rule)] flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-[var(--black)] shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">02</div>
                    <div className="text-xs font-mono font-semibold text-[var(--black)]">OAUTH</div>
                  </div>
                </div>
                <div className="p-3 border-r border-[var(--rule)] flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-[var(--black)] shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">03</div>
                    <div className="text-xs font-mono font-semibold text-[var(--black)]">FIRESTORE</div>
                  </div>
                </div>
                <div className="p-3 flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-[var(--black)] shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono text-[var(--text-muted)]">04</div>
                    <div className="text-xs font-mono font-semibold text-[var(--black)]">INGRESS API</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aside Column (4 cols): Swiss Telemetry & Quick Actions */}
        <aside className="aside flex flex-col justify-between gap-6 border-t-2 md:border-t-0 md:border-l border-[var(--rule)] pt-6 md:pt-0 md:pl-8">
          {/* Streak Block */}
          <div id="bento-streak-card" className="pb-5 border-b border-[var(--rule)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Daily Streak
              </span>
              <span className="text-[11px] font-mono font-semibold text-[var(--red)] tabular-nums">
                +{userProgress.streakDays} DAYS
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight text-[var(--black)] tabular-nums">
                {userProgress.streakDays}
              </span>
              <span className="text-xs text-[var(--text-muted)]">consecutive days</span>
            </div>

            {/* 7-Day Activity Matrix */}
            <div className="grid grid-cols-7 gap-1 mt-4" aria-label="7-day activity matrix">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const active = day <= userProgress.streakDays;
                return (
                  <div
                    key={day}
                    className={`h-5 ${active ? 'bg-[var(--black)]' : 'bg-[var(--rule)]'}`}
                    title={`Day ${day}: ${active ? 'Active' : 'Upcoming'}`}
                  />
                );
              })}
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
              <span>Next Goal: 14d</span>
              <span className="text-[var(--black)] font-semibold">+100 XP</span>
            </div>
          </div>

          {/* Learning Track Summary */}
          <div id="bento-curriculum-card" className="pb-5 border-b border-[var(--rule)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                Track Modules
              </span>
              <span className="text-[11px] font-mono font-semibold text-[var(--black)] tabular-nums">
                LVL {userProgress.level} • {userProgress.xp} XP
              </span>
            </div>

            <div className="space-y-2.5">
              {currentTrack.modules.slice(0, 3).map((mod, idx) => {
                const isCompleted = userProgress.completedLessons.includes(mod.id);
                const progressWidth = isCompleted ? '100%' : idx === 1 ? '65%' : '0%';
                return (
                  <div key={mod.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="font-medium text-[var(--black)] truncate">
                        0{idx + 1}. {mod.title}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0 tabular-nums">
                        {isCompleted ? 'DONE' : progressWidth}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[var(--rule)]">
                      <div
                        className={`h-full ${isCompleted ? 'bg-[var(--black)]' : 'bg-[var(--red)]'}`}
                        style={{ width: progressWidth }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('review')}
              className="w-full p-2.5 bg-[var(--gray)] border border-[var(--rule)] hover:border-[var(--black)] text-left transition-colors flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                  Next Milestone
                </div>
                <div className="text-xs font-semibold text-[var(--black)]">
                  Mastering &lsquo;The Diff&rsquo; (+200 XP)
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--black)] shrink-0" />
            </button>
          </div>

          {/* Platform Telemetry Equalizer */}
          <div id="bento-platform-analytics" className="pb-5 border-b border-[var(--rule)]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-3">
              Platform Telemetry
            </div>
            <div className="h-16 flex items-end gap-1.5 mb-2">
              {telemetryBars.map((bar) => (
                <div
                  key={bar.day}
                  className={`flex-1 ${bar.highlight ? 'bg-[var(--red)]' : 'bg-[var(--black)]'}`}
                  style={{ height: `${bar.pct}%` }}
                  title={`${bar.day}: ${bar.pct}%`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono tabular-nums">
              <span className="text-[var(--text-muted)]">
                Token Eff: {telemetry.tokenEfficiencyScore}%
              </span>
              <span className="text-[var(--black)] font-semibold">
                Precision: {telemetry.promptPrecisionScore}%
              </span>
            </div>
          </div>

          {/* Drive Sync & Deploy Sandbox */}
          <div className="space-y-3">
            <div
              id="bento-drive-sync-tile"
              className="p-3.5 bg-[var(--gray)] border border-[var(--rule)] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-[var(--black)]">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>Drive Sync</span>
                </span>
                <span className="text-[10px] font-mono text-[var(--red)] font-semibold uppercase">
                  {driveStatus.isConnected ? 'Connected' : 'Local'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)] tabular-nums">
                <span>/vibe-coding-site</span>
                <span className="text-[var(--black)] font-semibold">
                  {driveFiles.length} files
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenDriveModal}
                className="button button--outline w-full !py-2 !text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Manage Drive Repository</span>
              </button>
            </div>

            <button
              id="bento-deploy-tile"
              type="button"
              onClick={() => onNavigate('deploy')}
              className="w-full p-4 bg-[var(--black)] hover:bg-[var(--red)] text-[var(--white)] transition-colors text-left flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                  Cloud Run &amp; Ingress
                </div>
                <div className="text-base font-bold mt-0.5">Deploy Sandbox</div>
                <div className="text-xs opacity-85">Push project to web container</div>
              </div>
              <ArrowRight className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </aside>
      </section>

      {/* SECTION 02: CURRICULUM MODULES & DAILY BOUNTIES */}
      <section className="swiss-grid">
        <div className="col-span-12">
          <DailyMilestonesAndTasks
            completedLessons={userProgress.completedLessons}
            track={userProgress.track}
            dailyTasks={userProgress.dailyTasks || []}
            onCompleteTask={onCompleteTask}
            onCompleteModule={onCompleteModule}
            onNavigate={onNavigate}
          />
        </div>
      </section>

      {/* SECTION 03: SECURITY AUDIT & CONTEXT MODULES + ROADMAP PREVIEW */}
      <section className="swiss-grid">
        {/* Left (4 cols): Security Challenge */}
        <div
          id="bento-security-challenge"
          className="aside bg-[var(--gray)] border border-[var(--black)] p-6 flex flex-col justify-between gap-5"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="eyebrow font-mono">03 / Security Audit</span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[var(--red)] text-white">
                Critical
              </span>
            </div>
            <h2 className="text-lg font-bold text-[var(--black)]">
              &ldquo;Spot the Hallucination&rdquo;
            </h2>
            <pre className="bg-[#000000] text-[#FFFFFF] font-mono text-[11px] p-3.5 overflow-x-auto leading-relaxed border border-[var(--black)]">
{`const stripeKey = "sk_live_948...";
const user = req.body.id;
db.query(\`SELECT * FROM sec
  WHERE uid = \${user}\`);`}
            </pre>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('review')}
            className="button w-full"
          >
            <span>Fix Vulnerability</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right (8 cols): Context Builder Preview & Full-Stack Roadmap Banner */}
        <div className="main flex flex-col justify-between gap-6">
          {/* Context Builder Module Matrix */}
          <div
            id="bento-context-builder-preview"
            className="border border-[var(--rule)] bg-[var(--white)] p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="eyebrow font-mono">04 / Modular Constraints</div>
                <h2 className="text-lg font-bold text-[var(--black)] mt-0.5">
                  Context Builder Modules
                </h2>
              </div>
              <div className="flex gap-1.5 font-mono text-[10px] text-[var(--text-muted)]">
                <span className="px-2 py-1 border border-[var(--rule)] bg-[var(--gray)]">React 19</span>
                <span className="px-2 py-1 border border-[var(--rule)] bg-[var(--gray)]">OAuth 2.0</span>
                <span className="px-2 py-1 border border-[var(--black)] text-[var(--black)] font-semibold">
                  Drive Sync
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'DB SCHEMA', icon: <Database className="w-4 h-4" /> },
                { label: 'API LAYER', icon: <Server className="w-4 h-4 text-[var(--red)]" /> },
                { label: 'STYLING', icon: <Layers className="w-4 h-4" /> },
                { label: 'ADD BLOCK', icon: <span className="text-base font-bold leading-none">+</span> },
              ].map((slot) => (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => onNavigate('context')}
                  className="p-4 border border-dashed border-[var(--black)] bg-[var(--gray)] hover:bg-[var(--black)] hover:text-[var(--white)] transition-colors flex flex-col items-center justify-center gap-2 text-center"
                >
                  {slot.icon}
                  <span className="text-[10px] font-mono font-semibold">{slot.label}</span>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--rule)] flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-muted)]">5 Active Constraints Assembled</span>
              <button
                type="button"
                onClick={() => onNavigate('context')}
                className="font-semibold text-[var(--black)] hover:text-[var(--red)] transition-colors flex items-center gap-1"
              >
                <span>Open Context Builder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Architectural Learning Roadmap Preview Banner */}
          <div
            id="roadmap-preview-banner"
            className="border border-[var(--black)] bg-[var(--gray)] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="eyebrow font-mono">Interactive Curriculum Transit Map • 5 Cloud Tiers</div>
              <h3 className="text-lg font-bold text-[var(--black)]">
                Full-Stack Architectural Learning Roadmap
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xl">
                Visualize your progression across Client UI, Express Ingress (Port 3000), Google OAuth 2.0, Gemini 2.5 SDK, Firestore persistence, and Cloud Run containerization.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
                <span className="px-2 py-0.5 border border-[var(--black)] bg-[var(--white)] text-[var(--black)] flex items-center gap-1">
                  <Check className="w-3 h-3" /> UI Layer
                </span>
                <span className="px-2 py-0.5 border border-[var(--black)] bg-[var(--white)] text-[var(--black)] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Port 3000 Gateway
                </span>
                <span className="px-2 py-0.5 border border-[var(--red)] bg-[var(--red)] text-white font-semibold">
                  OAuth &amp; AI
                </span>
                <span className="px-2 py-0.5 border border-[var(--rule)] bg-[var(--white)] text-[var(--text-muted)]">
                  Firestore
                </span>
                <span className="px-2 py-0.5 border border-[var(--rule)] bg-[var(--white)] text-[var(--text-muted)]">
                  Cloud Run
                </span>
              </div>
            </div>

            <button
              id="open-roadmap-banner-btn"
              type="button"
              onClick={() => setIsRoadmapOpen(true)}
              className="button shrink-0 w-full sm:w-auto"
            >
              <Compass className="w-4 h-4" />
              <span>Open Roadmap Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 04: DIGITAL ACHIEVEMENT BADGES */}
      <section className="swiss-grid">
        <div className="col-span-12">
          <AchievementBadgesShowcase
            badges={badges}
            onUnlockBadge={onUnlockBadge}
            onNavigate={onNavigate}
          />
        </div>
      </section>

      {/* Interactive Learning Roadmap Modal Overlay */}
      <LearningRoadmapOverlay
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        onNavigateTab={onNavigate}
        onAwardXP={onAwardXP}
      />
    </div>
  );
};
