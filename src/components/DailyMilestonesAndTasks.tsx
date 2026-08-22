import React, { useState } from 'react';
import {
  CheckCircle2,
  Trophy,
  Sparkles,
  ArrowRight,
  Target,
  Flame,
  Zap,
  Shield,
  Layers,
  Terminal,
  Server,
  Award,
  ChevronRight,
  Star,
} from 'lucide-react';
import { DailyTask, LearningMilestone, LearningTrack } from '../types';
import { LEARNING_TRACKS, LEARNING_MILESTONES } from '../data/learningContent';
import { fireMilestoneConfetti, fireTaskConfetti } from '../utils/confetti';

interface DailyMilestonesAndTasksProps {
  completedLessons: string[];
  track: LearningTrack;
  dailyTasks: DailyTask[];
  onCompleteTask: (taskId: string, points: number, event?: React.MouseEvent) => void;
  onCompleteModule: (moduleId: string, xpReward: number, event?: React.MouseEvent) => void;
  onNavigate: (tab: 'playground' | 'context' | 'review' | 'deploy') => void;
}

export const DailyMilestonesAndTasks: React.FC<DailyMilestonesAndTasksProps> = ({
  completedLessons,
  track,
  dailyTasks,
  onCompleteTask,
  onCompleteModule,
  onNavigate,
}) => {
  const currentTrack = LEARNING_TRACKS[track];
  const totalModulesInTrack = currentTrack.modules.length;
  const completedModulesCount = currentTrack.modules.filter((m) =>
    completedLessons.includes(m.id)
  ).length;

  const trackProgressPercent = Math.round(
    (completedModulesCount / Math.max(1, totalModulesInTrack)) * 100
  );

  // Daily Tasks stats
  const completedTasksCount = dailyTasks.filter((t) => t.completed).length;
  const totalTasksCount = dailyTasks.length;
  const dailyTasksPercent = Math.round(
    (completedTasksCount / Math.max(1, totalTasksCount)) * 100
  );

  // Total daily points available & earned
  const earnedDailyPoints = dailyTasks
    .filter((t) => t.completed)
    .reduce((acc, t) => acc + t.points, 0);
  const totalDailyPoints = dailyTasks.reduce((acc, t) => acc + t.points, 0);

  // Milestone Celebration banner state
  const [celebratedMilestone, setCelebratedMilestone] = useState<string | null>(null);

  // Handle milestone manual trigger celebration
  const handleTriggerMilestoneConfetti = (e: React.MouseEvent, title: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    fireMilestoneConfetti(x, y);
    setCelebratedMilestone(title);
    setTimeout(() => setCelebratedMilestone(null), 4000);
  };

  const getCategoryIcon = (category: DailyTask['category']) => {
    switch (category) {
      case 'architecture':
        return <Layers className="w-3.5 h-3.5 text-cyan-400" />;
      case 'security':
        return <Shield className="w-3.5 h-3.5 text-amber-400" />;
      case 'prompting':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'deployment':
        return <Server className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Target className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div id="daily-milestones-tasks-root" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* LEFT BENTO (7 cols): Architecture Learning Modules Progress & Milestones */}
      <div
        id="bento-architecture-milestones"
        className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-5 relative overflow-hidden"
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/10 blur-3xl pointer-events-none -mr-16 -mt-16 rounded-full"></div>

        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  ARCHITECTURE CURRICULUM & MILESTONES
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                {currentTrack.title}
              </h3>
              <p className="text-xs text-slate-400">{currentTrack.subtitle}</p>
            </div>

            {/* Overall Track Progress Ring / Badge */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-slate-400">Track Mastery</div>
                <div className="text-sm font-bold font-mono text-cyan-400">
                  {completedModulesCount}/{totalModulesInTrack} Modules ({trackProgressPercent}%)
                </div>
              </div>
              <button
                id="confetti-milestone-btn"
                onClick={(e) =>
                  handleTriggerMilestoneConfetti(
                    e,
                    `${completedModulesCount} Modules Completed!`
                  )
                }
                title="Celebrate Progress with Confetti"
                className="p-2.5 bg-slate-950 hover:bg-cyan-950 text-cyan-400 border border-cyan-800/80 rounded-2xl transition hover:scale-105 active:scale-95 shadow-md shadow-cyan-950 flex items-center justify-center gap-1.5 text-xs font-mono"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Celebrate</span>
              </button>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="my-4 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Curriculum Completion</span>
              </span>
              <span className="font-bold text-white">{trackProgressPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/30"
                style={{ width: `${Math.max(4, trackProgressPercent)}%` }}
              ></div>
            </div>
          </div>

          {/* Individual Modules List with Interactive Completion */}
          <div className="space-y-2.5 mt-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Core Architecture Modules (Click to Finish & Earn XP)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentTrack.modules.map((mod, idx) => {
                const isCompleted = completedLessons.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    id={`module-card-${mod.id}`}
                    className={`rounded-2xl p-3 border transition-all relative flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-slate-950/80 border-cyan-500/40 text-slate-300'
                        : 'bg-slate-950/40 border-slate-800/90 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                          0{idx + 1} • {mod.difficulty.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          +{mod.xp} XP
                        </span>
                      </div>
                      <h4
                        className={`text-xs font-bold font-mono line-clamp-1 ${
                          isCompleted ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {mod.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-slate-900 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        {isCompleted ? 'Status: Completed' : 'Pending Verification'}
                      </span>
                      <button
                        onClick={(e) => onCompleteModule(mod.id, mod.xp, e)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1.5 ${
                          isCompleted
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900'
                            : 'bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            <span>Done (+XP)</span>
                          </>
                        ) : (
                          <>
                            <span>Mark Done</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestone Badges Strip */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
              Milestone Badges & Rank Unlocks
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {completedModulesCount >= 4 ? 'All Badges Unlocked' : 'Next Rank in Progress'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEARNING_MILESTONES.map((milestone) => {
              const isUnlocked = completedModulesCount >= milestone.requiredModuleCount;
              return (
                <div
                  key={milestone.id}
                  onClick={(e) => {
                    if (isUnlocked) {
                      handleTriggerMilestoneConfetti(e, milestone.title);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-center font-mono cursor-pointer transition ${
                    isUnlocked
                      ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300 hover:scale-105'
                      : 'bg-slate-950 border-slate-800/60 opacity-40 hover:opacity-60 text-slate-500'
                  }`}
                >
                  <div className="text-base mb-0.5">{isUnlocked ? '🏆' : '🔒'}</div>
                  <div className="text-[10px] font-bold truncate text-white">
                    {milestone.badgeName}
                  </div>
                  <div className="text-[9px] text-slate-400">
                    {milestone.requiredModuleCount} Mod. • +{milestone.xpReward} XP
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT BENTO (5 cols): Daily Goals & Tasks to Finish for Points */}
      <div
        id="bento-daily-tasks"
        className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between space-y-4"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  DAILY GOALS & BOUNTIES
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-mono mt-0.5">
                Earn Daily XP & Mastery
              </h3>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400">
                {earnedDailyPoints} / {totalDailyPoints} PTS
              </span>
              <div className="text-[10px] font-mono text-slate-500">
                {completedTasksCount}/{totalTasksCount} Finished
              </div>
            </div>
          </div>

          {/* Daily Progress Bar */}
          <div className="my-3 space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Daily Goal Completion</span>
              <span className="text-emerald-400 font-bold">{dailyTasksPercent}%</span>
            </div>
            <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, dailyTasksPercent)}%` }}
              ></div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5 mt-3">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                id={`daily-task-${task.id}`}
                className={`p-3 rounded-2xl border transition-all ${
                  task.completed
                    ? 'bg-slate-950/90 border-emerald-500/40 text-slate-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      id={`task-toggle-${task.id}`}
                      onClick={(e) => onCompleteTask(task.id, task.points, e)}
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition shrink-0 ${
                        task.completed
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                          : 'bg-slate-900 border-slate-700 hover:border-emerald-400 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(task.category)}
                        <span
                          className={`text-xs font-mono font-bold leading-tight line-clamp-1 ${
                            task.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {task.hint}
                      </p>
                    </div>
                  </div>

                  {/* Task Bounty Points Badge */}
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        task.completed
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      +{task.points} PTS
                    </span>
                    {task.actionTab && !task.completed && (
                      <button
                        onClick={() => onNavigate(task.actionTab!)}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 mt-1 flex items-center gap-0.5"
                      >
                        <span>Start</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bonus Daily Multiplier Notice */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            <div>
              <div className="text-white font-bold text-[11px]">Daily 1.5x Streak Bonus</div>
              <div className="text-[10px] text-slate-400">
                Finish all tasks to sustain consecutive daily multiplier.
              </div>
            </div>
          </div>
          {dailyTasksPercent === 100 ? (
            <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl text-[10px] font-bold">
              ✓ All Done!
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-bold">
              {totalTasksCount - completedTasksCount} Left
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
