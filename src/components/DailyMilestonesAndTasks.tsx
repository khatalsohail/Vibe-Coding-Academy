import React, { useState } from 'react';
import {
  Check,
  Trophy,
  Sparkles,
  ArrowRight,
  Target,
  Shield,
  Layers,
  Terminal,
  Server,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { DailyTask, LearningTrack } from '../types';
import { LEARNING_TRACKS, LEARNING_MILESTONES } from '../data/learningContent';
import { fireMilestoneConfetti } from '../utils/confetti';
import { calculateTrackProgressPercent, summarizeDailyTasks } from '../utils/architectureMetrics';

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
  const trackModuleIds = currentTrack.modules.map((m) => m.id);
  const completedModulesCount = currentTrack.modules.filter((m) =>
    completedLessons.includes(m.id)
  ).length;
  const trackProgressPercent = calculateTrackProgressPercent(completedLessons, trackModuleIds);

  const {
    completedCount: completedTasksCount,
    totalCount: totalTasksCount,
    percent: dailyTasksPercent,
    earnedPoints: earnedDailyPoints,
    totalPoints: totalDailyPoints,
  } = summarizeDailyTasks(dailyTasks);

  const [celebratedMilestone, setCelebratedMilestone] = useState<string | null>(null);

  const handleTriggerMilestoneConfetti = (e: React.MouseEvent, title: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    fireMilestoneConfetti(x, y);
    setCelebratedMilestone(title);
    setTimeout(() => setCelebratedMilestone(null), 3500);
  };

  const getCategoryIcon = (category: DailyTask['category']) => {
    switch (category) {
      case 'architecture':
        return <Layers className="w-3.5 h-3.5 text-[var(--black)] shrink-0" />;
      case 'security':
        return <Shield className="w-3.5 h-3.5 text-[var(--red)] shrink-0" />;
      case 'prompting':
        return <Terminal className="w-3.5 h-3.5 text-[var(--black)] shrink-0" />;
      case 'deployment':
        return <Server className="w-3.5 h-3.5 text-[var(--black)] shrink-0" />;
      default:
        return <Target className="w-3.5 h-3.5 text-[var(--black)] shrink-0" />;
    }
  };

  return (
    <div id="daily-milestones-tasks-root" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT (7 cols): Architecture Learning Modules & Milestones */}
      <div
        id="bento-architecture-milestones"
        className="lg:col-span-7 flex flex-col justify-between space-y-6"
      >
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--black)]">
            <div>
              <div className="eyebrow font-mono">02 / Curriculum &amp; Milestones</div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--black)] mt-1">
                {currentTrack.title}
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{currentTrack.subtitle}</p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right tabular-nums">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                  Track Mastery
                </div>
                <div className="text-sm font-bold font-mono text-[var(--black)]">
                  {completedModulesCount}/{currentTrack.modules.length} ({trackProgressPercent}%)
                </div>
              </div>
              <button
                id="confetti-milestone-btn"
                type="button"
                onClick={(e) =>
                  handleTriggerMilestoneConfetti(
                    e,
                    `${completedModulesCount} Modules Completed`
                  )
                }
                title="Celebrate Progress"
                className="button button--outline !py-2 !px-3 !text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Celebrate</span>
              </button>
            </div>
          </div>

          {celebratedMilestone && (
            <div className="mt-3 p-2.5 bg-[var(--gray)] border border-[var(--red)] text-xs font-mono text-[var(--black)]">
              Milestone verified: {celebratedMilestone}
            </div>
          )}

          {/* Progress Bar */}
          <div className="my-4 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-[var(--text-muted)] tabular-nums">
              <span>Curriculum Completion</span>
              <span className="font-bold text-[var(--black)]">{trackProgressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--rule)]">
              <div
                className="h-full bg-[var(--black)] transition-all duration-300"
                style={{ width: `${Math.max(4, trackProgressPercent)}%` }}
              />
            </div>
          </div>

          {/* Modules Grid */}
          <div className="space-y-2.5 mt-5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Core Architecture Modules
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentTrack.modules.map((mod, idx) => {
                const isCompleted = completedLessons.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    id={`module-card-${mod.id}`}
                    className={`p-4 border flex flex-col justify-between transition-colors ${
                      isCompleted
                        ? 'bg-[var(--gray)] border-[var(--black)]'
                        : 'bg-[var(--white)] border-[var(--rule)] hover:border-[var(--black)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2 font-mono text-[10px]">
                        <span className="font-semibold text-[var(--text-muted)]">
                          0{idx + 1} • {mod.difficulty.toUpperCase()}
                        </span>
                        <span className="font-bold text-[var(--red)] tabular-nums">
                          +{mod.xp} XP
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--black)] leading-snug">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[var(--rule)] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {isCompleted ? 'Completed' : 'Pending'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => onCompleteModule(mod.id, mod.xp, e)}
                        className={`px-2.5 py-1 border text-[11px] font-mono font-semibold transition-colors flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)] hover:bg-[var(--red)] hover:border-[var(--red)]'
                            : 'bg-[var(--white)] text-[var(--black)] border-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)]'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Done</span>
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

        {/* Milestone Ranks Strip */}
        <div className="pt-4 border-t border-[var(--rule)]">
          <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-wider">
            <span className="text-[var(--text-muted)] font-semibold">Milestone Ranks</span>
            <span className="text-[var(--black)] font-semibold">
              {completedModulesCount >= 4 ? 'All Ranks Unlocked' : 'In Progress'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {LEARNING_MILESTONES.map((milestone) => {
              const isUnlocked = completedModulesCount >= milestone.requiredModuleCount;
              return (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={(e) => {
                    if (isUnlocked) {
                      handleTriggerMilestoneConfetti(e, milestone.title);
                    }
                  }}
                  className={`p-3 border text-left font-mono transition-colors ${
                    isUnlocked
                      ? 'bg-[var(--gray)] border-[var(--black)] text-[var(--black)] hover:border-[var(--red)]'
                      : 'bg-[var(--white)] border-[var(--rule)] text-[var(--text-muted)] opacity-60 cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {isUnlocked ? (
                      <Trophy className="w-3.5 h-3.5 text-[var(--red)]" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    )}
                    <span className="text-[10px] tabular-nums">+{milestone.xpReward} XP</span>
                  </div>
                  <div className="text-[11px] font-bold truncate text-[var(--black)]">
                    {milestone.badgeName}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] tabular-nums">
                    {milestone.requiredModuleCount} Modules
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT (5 cols): Daily Goals & Tasks */}
      <div
        id="bento-daily-tasks"
        className="lg:col-span-5 border-t-2 lg:border-t-0 lg:border-l border-[var(--rule)] pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between space-y-5"
      >
        <div>
          <div className="flex items-end justify-between pb-4 border-b border-[var(--black)]">
            <div>
              <div className="eyebrow font-mono">Daily Bounties</div>
              <h3 className="text-lg font-bold text-[var(--black)] mt-1">
                Daily Goals &amp; Mastery
              </h3>
            </div>

            <div className="text-right font-mono tabular-nums">
              <div className="text-xs font-bold text-[var(--red)]">
                {earnedDailyPoints} / {totalDailyPoints} PTS
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                {completedTasksCount}/{totalTasksCount} Finished
              </div>
            </div>
          </div>

          <div className="my-4 space-y-1.5">
            <div className="flex justify-between text-xs font-mono text-[var(--text-muted)] tabular-nums">
              <span>Daily Completion</span>
              <span className="font-bold text-[var(--black)]">{dailyTasksPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--rule)]">
              <div
                className="h-full bg-[var(--red)] transition-all duration-300"
                style={{ width: `${Math.max(4, dailyTasksPercent)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                id={`daily-task-${task.id}`}
                className={`p-3.5 border transition-colors ${
                  task.completed
                    ? 'bg-[var(--gray)] border-[var(--black)]'
                    : 'bg-[var(--white)] border-[var(--rule)] hover:border-[var(--black)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      id={`task-toggle-${task.id}`}
                      type="button"
                      aria-label={`Toggle completion for ${task.title}`}
                      aria-pressed={task.completed}
                      onClick={(e) => onCompleteTask(task.id, task.points, e)}
                      className={`w-5 h-5 border mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                          : 'bg-[var(--white)] border-[var(--black)] text-transparent hover:border-[var(--red)]'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {getCategoryIcon(task.category)}
                        <span
                          className={`text-xs font-semibold leading-tight truncate ${
                            task.completed
                              ? 'line-through text-[var(--text-muted)]'
                              : 'text-[var(--black)]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
                        {task.hint}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 font-mono tabular-nums">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 border ${
                        task.completed
                          ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                          : 'bg-[var(--gray)] text-[var(--black)] border-[var(--rule)]'
                      }`}
                    >
                      +{task.points} PTS
                    </span>
                    {task.actionTab && !task.completed && (
                      <button
                        type="button"
                        onClick={() => onNavigate(task.actionTab!)}
                        className="text-[10px] font-semibold text-[var(--red)] hover:underline mt-1.5 flex items-center gap-0.5"
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

        {/* Streak Multiplier Notice */}
        <div className="p-3.5 bg-[var(--gray)] border border-[var(--rule)] flex items-center justify-between gap-3 text-xs font-mono">
          <div>
            <div className="font-bold text-[var(--black)]">Daily 1.5x Streak Bonus</div>
            <div className="text-[11px] text-[var(--text-muted)] font-sans mt-0.5">
              Finish all tasks to sustain your consecutive daily multiplier.
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-1 border shrink-0 tabular-nums ${
              dailyTasksPercent === 100
                ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                : 'bg-[var(--white)] text-[var(--red)] border-[var(--red)]'
            }`}
          >
            {dailyTasksPercent === 100
              ? 'COMPLETE'
              : `${totalTasksCount - completedTasksCount} LEFT`}
          </span>
        </div>
      </div>
    </div>
  );
};
