import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Activity,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  FolderGit2,
  Play,
  RotateCcw,
  CheckCircle2,
  Terminal,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  Server,
  Globe,
  Compass,
  MapPin,
  GitBranch,
} from 'lucide-react';
import { LearningTrack, TelemetryMetrics, UserProgress, DriveSyncedFile, DailyTask, AchievementBadge } from '../types';
import { LEARNING_TRACKS, HALLUCINATION_CHALLENGES } from '../data/learningContent';
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
  const spotlightChallenge = HALLUCINATION_CHALLENGES[0];

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Bento Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
              BENTO WORKSPACE • VIBE_SYS_V2.1
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono mt-1">
            Intent-Driven Architecture Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="open-roadmap-header-btn"
            onClick={() => setIsRoadmapOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/10 group"
          >
            <Compass className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <span>Learning Roadmap</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </button>

          <button
            onClick={() => onNavigate('playground')}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>Launch Playground</span>
          </button>
        </div>
      </div>

      {/* NEW: Daily Milestone Confetti Progress & Daily Goals / Tasks Bounties */}
      <DailyMilestonesAndTasks
        completedLessons={userProgress.completedLessons}
        track={userProgress.track}
        dailyTasks={userProgress.dailyTasks || []}
        onCompleteTask={onCompleteTask}
        onCompleteModule={onCompleteModule}
        onNavigate={onNavigate}
      />

      {/* Main 12-Column Bento Grid Structure */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
        {/* Bento Cell 1: Daily Streak Card (3 cols) */}
        <div
          id="bento-streak-card"
          className="col-span-1 md:col-span-3 lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
        >
          <div className="flex justify-between items-start">
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold font-mono">Daily Streak</h3>
            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-orange-500/30">
              +{userProgress.streakDays} Days
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white tracking-tight">{userProgress.streakDays}</span>
              <span className="text-slate-500 text-xs">consecutive days vibe coding</span>
            </div>

            {/* 7-Day Visual Activity Bars */}
            <div className="grid grid-cols-7 gap-1 mt-4">
              <div className="h-6 bg-cyan-500 rounded-md shadow-sm shadow-cyan-500/20" title="Day 1"></div>
              <div className="h-6 bg-cyan-500 rounded-md shadow-sm shadow-cyan-500/20" title="Day 2"></div>
              <div className="h-6 bg-cyan-500 rounded-md shadow-sm shadow-cyan-500/20" title="Day 3"></div>
              <div className="h-6 bg-cyan-500 rounded-md shadow-sm shadow-cyan-500/20" title="Day 4"></div>
              <div className="h-6 bg-cyan-500 rounded-md shadow-sm shadow-cyan-500/20" title="Day 5"></div>
              <div className="h-6 bg-slate-800/80 rounded-md" title="Day 6 (Upcoming)"></div>
              <div className="h-6 bg-slate-800/80 rounded-md" title="Day 7 (Upcoming)"></div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60 font-mono">
            <span>Next Streak Goal: 14d</span>
            <span className="text-cyan-400">+100 XP</span>
          </div>
        </div>

        {/* Bento Cell 2: The Playground & Active Intent Spec (6 cols) */}
        <div
          id="bento-playground-hero"
          className="col-span-1 md:col-span-6 lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-4">
            <span className="text-[10px] bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-full text-cyan-400 font-mono font-semibold">
              VIBE_AGENT_V2.1
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-0.5 flex items-center gap-2">
              <span>The Intent Playground</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Translate intent into production-grade architecture.</p>

            {/* Active Prompt Bento Box */}
            <div
              onClick={() => onNavigate('playground')}
              className="bg-slate-950 rounded-2xl border border-slate-800 p-4 cursor-pointer hover:border-cyan-500/50 transition group"
            >
              <div className="flex gap-2 items-center text-[11px] text-slate-500 mb-2 uppercase tracking-wider font-mono">
                <span className="text-cyan-500">●</span> Active Architectural Directive
              </div>
              <p className="text-slate-300 font-serif italic text-base sm:text-lg leading-relaxed group-hover:text-white transition">
                "Build a real-time collaborative task manager with Google OAuth login, Firestore database persistence, and Google Drive vibe-coding-site sync..."
              </p>
            </div>
          </div>

          {/* Intent-to-Architecture Visualizer Pipeline */}
          <div className="mt-5 border-t border-slate-800/80 pt-4">
            <h4 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 font-bold font-mono">
              Intent-to-Architecture Pipeline
            </h4>
            <div className="flex justify-between items-center px-1">
              {/* Node 1: Prompt */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">PROMPT</span>
              </div>

              <div className="h-px flex-1 max-w-[32px] bg-slate-800"></div>

              {/* Node 2: Auth */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-11 w-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-200">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">AUTH (OAUTH)</span>
              </div>

              <div className="h-px flex-1 max-w-[32px] bg-slate-800"></div>

              {/* Node 3: Storage */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-11 w-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-200">
                  <Database className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">FIRESTORE</span>
              </div>

              <div className="h-px flex-1 max-w-[32px] bg-slate-800"></div>

              {/* Node 4: API & Container */}
              <div className="flex flex-col items-center gap-1.5 relative">
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-cyan-500 rounded-full border-2 border-slate-900 animate-ping"></div>
                <div className="h-11 w-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-200">
                  <Server className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">INGRESS API</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Cell 3: Learning Track & Curriculum Roadmap (3 cols) */}
        <div
          id="bento-curriculum-card"
          className="col-span-1 md:col-span-3 lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold font-mono">Learning Track</h3>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800">
                {currentTrack.title.replace(' Track', '')}
              </span>
            </div>

            <div className="space-y-3.5">
              {currentTrack.modules.slice(0, 3).map((mod, idx) => {
                const isCompleted = userProgress.completedLessons.includes(mod.id);
                const progressWidth = isCompleted ? '100%' : idx === 1 ? '65%' : '0%';

                return (
                  <div key={mod.id} className={`flex items-center gap-3 ${idx === 2 ? 'opacity-50' : ''}`}>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isCompleted
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      0{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-white truncate">{mod.title}</div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-cyan-500 h-full rounded-full transition-all"
                          style={{ width: progressWidth }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/60">
            <div className="text-[10px] text-slate-500 uppercase mb-1.5 font-bold font-mono">Next Milestone</div>
            <div
              onClick={() => onNavigate('review')}
              className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            >
              <div className="text-xs text-white font-medium flex items-center justify-between">
                <span>Mastering 'The Diff'</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">Unlock 200XP & Custom Context Blocks</div>
            </div>
          </div>
        </div>

        {/* Bento Cell 4: Deploy Sandbox 1-Click Launcher (3 cols) */}
        <div
          id="bento-deploy-tile"
          onClick={() => onNavigate('deploy')}
          className="col-span-1 md:col-span-3 lg:col-span-3 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-5 flex items-center justify-between cursor-pointer shadow-xl hover:scale-[1.01] transition group"
        >
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-cyan-100/80 font-bold mb-1">
              Cloud Run & Ingress
            </div>
            <h4 className="text-white font-black text-lg tracking-tight">Deploy Sandbox</h4>
            <p className="text-xs text-white/80 mt-0.5">Push current project to web container</p>
          </div>
          <div className="h-10 w-10 bg-white/20 rounded-2xl flex items-center justify-center text-white group-hover:bg-white group-hover:text-cyan-700 transition">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Bento Cell 5: Security Challenge "Spot the Hallucination" (3 cols) */}
        <div
          id="bento-security-challenge"
          className="col-span-1 md:col-span-3 lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                Security Audit
              </h3>
              <span className="text-rose-400 text-[10px] font-mono font-bold bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-800">
                CRITICAL
              </span>
            </div>

            <p className="text-xs text-white font-semibold mb-2">"Spot the Hallucination"</p>

            {/* Vulnerability Code Snippet */}
            <div className="bg-slate-950 font-mono text-[10px] p-2.5 rounded-xl border border-slate-800 text-slate-400 mb-3 space-y-0.5 leading-tight">
              <div>
                <span className="text-purple-400">const</span> stripeKey = <span className="text-rose-400">"sk_live_948..."</span>;
              </div>
              <div>
                <span className="text-purple-400">const</span> user = <span className="text-cyan-400">req.body.id</span>;
              </div>
              <div>
                <span className="text-purple-400">db.query</span>(<span className="text-emerald-400">`SELECT * FROM sec WHERE uid = ${'{user}'}`</span>);
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('review')}
            className="w-full py-2 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-white text-[11px] font-mono font-bold rounded-xl transition"
          >
            FIX VULNERABILITY →
          </button>
        </div>

        {/* Bento Cell 6: Context Builder Module Preview (6 cols) */}
        <div
          id="bento-context-builder-preview"
          className="col-span-1 md:col-span-6 lg:col-span-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold font-mono">
                Context Builder Modules
              </h3>
              <div className="flex gap-1.5 font-mono text-[10px]">
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">React 19</span>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">OAuth 2.0</span>
                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md">
                  Drive Sync
                </span>
              </div>
            </div>

            {/* Modular Dashed Slots */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                onClick={() => onNavigate('context')}
                className="aspect-square border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-950/40 transition group"
              >
                <div className="h-7 w-7 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono font-semibold text-slate-400 group-hover:text-white">DB SCHEMA</span>
              </div>

              <div
                onClick={() => onNavigate('context')}
                className="aspect-square border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-800/30 transition group"
              >
                <div className="h-7 w-7 bg-cyan-500/40 text-cyan-300 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <Server className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono font-semibold text-cyan-300">API LAYER</span>
              </div>

              <div
                onClick={() => onNavigate('context')}
                className="aspect-square border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-950/40 transition group"
              >
                <div className="h-7 w-7 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono font-semibold text-slate-400 group-hover:text-white">STYLING</span>
              </div>

              <div
                onClick={() => onNavigate('context')}
                className="aspect-square border-2 border-dashed border-slate-800/60 hover:border-cyan-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-slate-950/20 opacity-70 hover:opacity-100 transition group"
              >
                <div className="h-7 w-7 bg-slate-800/80 text-slate-400 rounded-lg flex items-center justify-center group-hover:text-cyan-400 transition">
                  +
                </div>
                <span className="text-[9px] font-mono font-semibold text-slate-500 group-hover:text-white">ADD BLOCK</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-between font-mono">
            <span>5 Active Constraints Assembled</span>
            <button
              onClick={() => onNavigate('context')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Open Context Builder →
            </button>
          </div>
        </div>

        {/* Bento Cell 7: Platform Analytics Equalizer (3 cols) */}
        <div
          id="bento-platform-analytics"
          className="col-span-1 md:col-span-3 lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
        >
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 font-mono">
              Platform Telemetry
            </h3>

            {/* Visualizer Equalizer Bars */}
            <div className="h-20 flex items-end gap-1.5 mb-2">
              <div className="flex-1 bg-slate-800 h-[25%] rounded-t-sm" title="Mon: 25%"></div>
              <div className="flex-1 bg-slate-800 h-[45%] rounded-t-sm" title="Tue: 45%"></div>
              <div className="flex-1 bg-cyan-500 h-[88%] rounded-t-sm shadow-sm shadow-cyan-500/30" title="Wed: 88%"></div>
              <div className="flex-1 bg-slate-800 h-[35%] rounded-t-sm" title="Thu: 35%"></div>
              <div className="flex-1 bg-cyan-500 h-[92%] rounded-t-sm shadow-sm shadow-cyan-500/30" title="Fri: 92%"></div>
              <div className="flex-1 bg-slate-800 h-[50%] rounded-t-sm" title="Sat: 50%"></div>
              <div className="flex-1 bg-cyan-400 h-[85%] rounded-t-sm shadow-sm shadow-cyan-400/30" title="Sun: 85%"></div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-400">Token Eff: {telemetry.tokenEfficiencyScore}%</span>
            <span className="text-cyan-400 font-bold">Intention: {telemetry.promptPrecisionScore}%</span>
          </div>
        </div>

        {/* Bento Cell 8: Google Drive Sync Hub Bento Tile (3 cols) */}
        <div
          id="bento-drive-sync-tile"
          className="col-span-1 md:col-span-3 lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold font-mono">Drive Sync</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Connected
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div className="text-slate-400 text-[10px]">DIR: /vibe-coding-site</div>
              <div className="text-white font-semibold flex items-center justify-between">
                <span>Synced Manifests</span>
                <span className="text-cyan-400 font-bold">{driveFiles.length} files</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenDriveModal}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-[11px] font-mono font-semibold transition flex items-center justify-center gap-1.5 border border-slate-700 mt-3"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>Manage Drive Repository</span>
          </button>
        </div>
      </div>

      {/* Architectural Learning Roadmap Interactive Preview Banner */}
      <div
        id="roadmap-preview-banner"
        className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              INTERACTIVE CURRICULUM TRANSIT MAP
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
              5 Cloud Tiers
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
            Full-Stack Architectural Learning Roadmap
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Visualize your journey across the 5 core cloud layers: Client UI, Express Ingress (Port 3000), Google Identity OAuth 2.0, Gemini 2.5 SDK, Firestore NoSQL, and Cloud Run Containerization.
          </p>

          {/* Mini Flow Nodes Preview */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] font-mono">
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>UI Layer</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Port 3000 Gateway</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>OAuth & AI</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-1 rounded-lg bg-slate-950 text-slate-500 border border-slate-800 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Firestore</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-1 rounded-lg bg-slate-950 text-slate-500 border border-slate-800 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Cloud Run</span>
            </span>
          </div>
        </div>

        {/* Action Button to Open Interactive Overlay */}
        <div className="shrink-0 w-full md:w-auto">
          <button
            id="open-roadmap-banner-btn"
            onClick={() => setIsRoadmapOpen(true)}
            className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-2xl shadow-xl shadow-cyan-500/20 transition flex items-center justify-center gap-2 group font-mono"
          >
            <Compass className="w-4 h-4 text-slate-950 group-hover:rotate-90 transition-transform" />
            <span>Open Interactive Roadmap Map</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Digital Achievement Badges Showcase Section */}
      <AchievementBadgesShowcase
        badges={badges}
        onUnlockBadge={onUnlockBadge}
        onNavigate={onNavigate}
      />

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

