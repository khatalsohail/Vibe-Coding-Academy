import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Server,
  Layers,
  Lock,
  CloudLightning,
  Terminal,
  Cpu,
  FolderGit2,
  Sparkles,
  Check,
  LockKeyhole,
  X,
  Trophy,
} from 'lucide-react';
import { AchievementBadge } from '../types';
import { fireMilestoneConfetti } from '../utils/confetti';

interface AchievementBadgesShowcaseProps {
  badges: AchievementBadge[];
  onUnlockBadge?: (badgeId: string, event?: React.MouseEvent) => void;
  onNavigate?: (tab: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy') => void;
}

export const AchievementBadgesShowcase: React.FC<AchievementBadgesShowcaseProps> = ({
  badges,
  onUnlockBadge = (_badgeId: string, _event?: React.MouseEvent) => {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBadge, setActiveBadge] = useState<AchievementBadge | null>(null);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalBadges = badges.length;
  const totalEarnedXP = badges
    .filter((b) => b.unlocked)
    .reduce((acc, b) => acc + b.xpReward, 0);

  const filteredBadges =
    selectedCategory === 'all'
      ? badges
      : badges.filter((b) => b.category === selectedCategory);

  const getBadgeIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Server':
        return <Server className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Lock':
        return <Lock className={className} />;
      case 'CloudLightning':
        return <CloudLightning className={className} />;
      case 'Terminal':
        return <Terminal className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'FolderGit2':
        return <FolderGit2 className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const handleCardClick = (badge: AchievementBadge, e: React.MouseEvent) => {
    setActiveBadge(badge);
    if (badge.unlocked) {
      const rect = e.currentTarget.getBoundingClientRect();
      fireMilestoneConfetti(
        (rect.left + rect.width / 2) / window.innerWidth,
        (rect.top + rect.height / 2) / window.innerHeight
      );
    }
  };

  return (
    <div id="achievement-badges-section" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[var(--black)]">
        <div>
          <div className="eyebrow font-mono">05 / Verifiable Credentials</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--black)] mt-1">
            Architectural Mastery &amp; Engineering Badges
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Earn credentials by hitting milestones in API design, security audits, and cloud persistence.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
          <div className="bg-[var(--gray)] px-3 py-2 border border-[var(--rule)] text-right">
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Unlocked</div>
            <div className="text-sm font-bold text-[var(--black)]">
              {unlockedCount} / {totalBadges}
            </div>
          </div>
          <div className="bg-[var(--gray)] px-3 py-2 border border-[var(--rule)] text-right">
            <div className="text-[10px] uppercase text-[var(--text-muted)]">Badge XP</div>
            <div className="text-sm font-bold text-[var(--red)]">+{totalEarnedXP} XP</div>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'architecture', 'security', 'prompting', 'deployment', 'persistence'].map(
            (cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 border uppercase text-[10px] font-semibold transition-colors ${
                    active
                      ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                      : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)] hover:border-[var(--black)] hover:text-[var(--black)]'
                  }`}
                >
                  {cat}
                </button>
              );
            }
          )}
        </div>
        <span className="text-[10px] text-[var(--text-muted)] hidden md:inline">
          Select any badge to inspect criteria
        </span>
      </div>

      {/* Badges 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const progressPercent = Math.round((badge.progress.current / badge.progress.max) * 100);
          return (
            <button
              key={badge.id}
              id={`achievement-badge-${badge.id}`}
              type="button"
              onClick={(e) => handleCardClick(badge, e)}
              className={`p-4 border text-left transition-colors flex flex-col justify-between ${
                badge.unlocked
                  ? 'bg-[var(--white)] border-[var(--black)] hover:bg-[var(--gray)]'
                  : 'bg-[var(--gray)] border-[var(--rule)] opacity-75 hover:opacity-100 hover:border-[var(--black)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 font-mono text-[10px]">
                  <span
                    className={`uppercase px-2 py-0.5 border font-semibold ${
                      badge.unlocked
                        ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                        : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)]'
                    }`}
                  >
                    {badge.tier}
                  </span>
                  <span className="font-bold text-[var(--red)] tabular-nums">
                    +{badge.xpReward} XP
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className={`w-10 h-10 border flex items-center justify-center shrink-0 ${
                      badge.unlocked
                        ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                        : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)]'
                    }`}
                  >
                    {badge.unlocked ? (
                      getBadgeIcon(badge.iconName)
                    ) : (
                      <LockKeyhole className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--black)] truncate leading-tight">
                      {badge.title}
                    </h3>
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                      {badge.category}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-snug line-clamp-2 mb-3">
                  {badge.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--rule)] w-full">
                {badge.unlocked ? (
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="flex items-center gap-1 font-bold text-[var(--black)]">
                      <Check className="w-3.5 h-3.5 text-[var(--red)]" />
                      <span>UNLOCKED</span>
                    </span>
                    <span className="text-[var(--text-muted)]">{badge.unlockedAt || 'Earned'}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] tabular-nums">
                      <span>Progress</span>
                      <span className="text-[var(--black)] font-bold">
                        {badge.progress.current}/{badge.progress.max} {badge.progress.unit}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--rule)]">
                      <div
                        className="h-full bg-[var(--black)]"
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* BADGE INSPECTION MODAL */}
      {activeBadge && (
        <div
          id="badge-inspection-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="badge-modal-title"
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setActiveBadge(null)}
        >
          <div
            className="bg-[var(--white)] border border-[var(--black)] p-6 sm:p-7 max-w-md w-full relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveBadge(null)}
              aria-label="Close badge details"
              className="absolute top-4 right-4 p-2 border border-[var(--rule)] text-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase">
                <span className="px-2 py-0.5 bg-[var(--black)] text-[var(--white)] font-bold">
                  {activeBadge.tier} TIER
                </span>
                <span className="text-[var(--text-muted)]">{activeBadge.category}</span>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 border flex items-center justify-center shrink-0 ${
                    activeBadge.unlocked
                      ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                      : 'bg-[var(--gray)] text-[var(--text-muted)] border-[var(--rule)]'
                  }`}
                >
                  {getBadgeIcon(activeBadge.iconName, 'w-7 h-7')}
                </div>
                <div>
                  <h3 id="badge-modal-title" className="text-xl font-bold text-[var(--black)]">
                    {activeBadge.title}
                  </h3>
                  <div className="text-xs font-mono text-[var(--red)] font-semibold">
                    {activeBadge.unlocked ? 'Verified Unlocked' : 'Locked Credential'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--gray)] p-4 border border-[var(--rule)] space-y-2 text-xs">
              <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">
                Milestone Criteria
              </div>
              <p className="text-[var(--black)] leading-relaxed">{activeBadge.criteria}</p>
              <div className="pt-2 border-t border-[var(--rule)] flex justify-between items-center font-mono text-[11px] tabular-nums">
                <span className="text-[var(--text-muted)]">XP Bounty:</span>
                <span className="text-[var(--red)] font-bold">+{activeBadge.xpReward} XP</span>
              </div>
            </div>

            <div className="text-xs text-[var(--text-muted)] leading-relaxed">
              <span className="text-[var(--black)] font-mono font-bold block mb-1 uppercase text-[10px]">
                Engineering Significance
              </span>
              {activeBadge.description}
            </div>

            <div className="pt-1">
              {activeBadge.unlocked ? (
                <button
                  type="button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    fireMilestoneConfetti(
                      (rect.left + rect.width / 2) / window.innerWidth,
                      (rect.top + rect.height / 2) / window.innerHeight
                    );
                  }}
                  className="button w-full"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Trigger Celebration Confetti</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    onUnlockBadge(activeBadge.id, e);
                    setActiveBadge((prev) =>
                      prev ? { ...prev, unlocked: true, unlockedAt: 'Just Now' } : null
                    );
                  }}
                  className="button w-full"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Simulate Unlock (+{activeBadge.xpReward} XP)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
