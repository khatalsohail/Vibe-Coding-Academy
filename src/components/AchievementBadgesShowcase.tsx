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
  CheckCircle2,
  LockKeyhole,
  ChevronRight,
  X,
  Zap,
  Info,
  Trophy,
  Filter,
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
  onUnlockBadge = (_badgeId?: string, _event?: React.MouseEvent) => {},
  onNavigate = (_tab?: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy') => {},
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

  const getBadgeIcon = (iconName: string, className: string = 'w-6 h-6') => {
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

  const getTierStyles = (tier: AchievementBadge['tier'], unlocked: boolean) => {
    if (!unlocked) {
      return {
        cardBg: 'bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-100',
        iconBg: 'bg-slate-900 border-slate-800 text-slate-500',
        badgePill: 'bg-slate-900 text-slate-500 border-slate-800',
        glow: '',
      };
    }

    switch (tier) {
      case 'platinum':
        return {
          cardBg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 border-cyan-500/50 hover:border-cyan-400',
          iconBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/20',
          badgePill: 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold',
          glow: 'after:absolute after:inset-0 after:rounded-2xl after:bg-cyan-500/5 after:pointer-events-none',
        };
      case 'gold':
        return {
          cardBg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-amber-500/50 hover:border-amber-400',
          iconBg: 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/20',
          badgePill: 'bg-amber-950 text-amber-300 border-amber-700 font-bold',
          glow: 'after:absolute after:inset-0 after:rounded-2xl after:bg-amber-500/5 after:pointer-events-none',
        };
      case 'silver':
        return {
          cardBg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/30 border-blue-500/40 hover:border-blue-400',
          iconBg: 'bg-blue-500/20 border-blue-500/40 text-blue-300 shadow-md shadow-blue-500/20',
          badgePill: 'bg-blue-950 text-blue-300 border-blue-800 font-bold',
          glow: '',
        };
      case 'bronze':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950/30 border-orange-500/40 hover:border-orange-400',
          iconBg: 'bg-orange-500/20 border-orange-500/40 text-orange-300 shadow-md shadow-orange-500/20',
          badgePill: 'bg-orange-950 text-orange-300 border-orange-800 font-bold',
          glow: '',
        };
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
    <div id="achievement-badges-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header with Title and Statistics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              DIGITAL ACHIEVEMENT BADGES
            </span>
          </div>
          <h3 className="text-lg font-bold text-white font-mono mt-0.5">
            Architectural Mastery & Engineering Badges
          </h3>
          <p className="text-xs text-slate-400">
            Earn verifiable badges by hitting key milestones in API design, security audits, and cloud persistence.
          </p>
        </div>

        {/* Aggregate Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 text-right font-mono">
            <div className="text-[10px] uppercase text-slate-500">Unlocked</div>
            <div className="text-sm font-bold text-amber-400">
              {unlockedCount} / {totalBadges} Badges
            </div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 text-right font-mono">
            <div className="text-[10px] uppercase text-slate-500">Badge XP Earned</div>
            <div className="text-sm font-bold text-emerald-400">
              +{totalEarnedXP} XP
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-[10px] uppercase text-slate-500 mr-1 font-bold shrink-0">Filter:</span>
          {['all', 'architecture', 'security', 'prompting', 'deployment', 'persistence'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl uppercase text-[10px] font-bold transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
          Click any badge to inspect criteria
        </span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredBadges.map((badge) => {
          const styles = getTierStyles(badge.tier, badge.unlocked);
          const progressPercent = Math.round((badge.progress.current / badge.progress.max) * 100);

          return (
            <div
              key={badge.id}
              id={`achievement-badge-${badge.id}`}
              onClick={(e) => handleCardClick(badge, e)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${styles.cardBg} ${styles.glow} hover:scale-[1.02] active:scale-[0.98] shadow-lg`}
            >
              <div>
                {/* Top Badge Header: Tier Pill + XP Reward */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border ${styles.badgePill}`}
                  >
                    {badge.tier}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400">
                    +{badge.xpReward} XP
                  </span>
                </div>

                {/* Badge Emblem & Title */}
                <div className="flex items-center gap-3 mb-2.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:rotate-6 ${styles.iconBg}`}
                  >
                    {badge.unlocked ? (
                      getBadgeIcon(badge.iconName)
                    ) : (
                      <LockKeyhole className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-bold font-mono truncate leading-tight ${
                        badge.unlocked ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </h4>
                    <span className="text-[10px] font-mono uppercase text-slate-500">
                      {badge.category}
                    </span>
                  </div>
                </div>

                {/* Badge Description */}
                <p className="text-xs text-slate-400 leading-snug line-clamp-2 mb-3 font-sans">
                  {badge.description}
                </p>
              </div>

              {/* Bottom Progress or Unlocked Timestamp */}
              <div className="pt-3 border-t border-slate-800/80">
                {badge.unlocked ? (
                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                    <span className="text-slate-400">{badge.unlockedAt || 'Earned'}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Milestone Progress</span>
                      <span className="text-white font-bold">
                        {badge.progress.current}/{badge.progress.max} {badge.progress.unit}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{ width: `${Math.max(5, progressPercent)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BADGE INSPECTION & CELEBRATION MODAL */}
      {activeBadge && (
        <div
          id="badge-inspection-modal"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveBadge(null)}
        >
          <div
            className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveBadge(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge Large Insignia */}
            <div className="text-center space-y-2 pt-2">
              <div className="relative inline-block">
                <div
                  className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border-2 shadow-2xl ${
                    activeBadge.unlocked
                      ? activeBadge.tier === 'platinum'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-500/30'
                        : activeBadge.tier === 'gold'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-amber-500/30'
                        : 'bg-blue-500/20 border-blue-400 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  {getBadgeIcon(activeBadge.iconName, 'w-10 h-10')}
                </div>
                {activeBadge.unlocked && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1 rounded-full border-2 border-slate-900">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-950 text-amber-400 border border-amber-800 font-bold">
                    {activeBadge.tier.toUpperCase()} TIER
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {activeBadge.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-mono mt-1">
                  {activeBadge.title}
                </h3>
              </div>
            </div>

            {/* Criteria Box */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
              <div className="text-[10px] uppercase text-slate-500 font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Architectural Milestone Criteria</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans">
                {activeBadge.criteria}
              </p>
              <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Milestone XP Bounty:</span>
                <span className="text-amber-400 font-bold">+{activeBadge.xpReward} XP</span>
              </div>
            </div>

            {/* Explanation & Learning Takeaway */}
            <div className="text-xs text-slate-300 leading-relaxed font-sans">
              <span className="text-cyan-400 font-bold font-mono block mb-1">
                Engineering Significance:
              </span>
              {activeBadge.description}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              {activeBadge.unlocked ? (
                <button
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    fireMilestoneConfetti(
                      (rect.left + rect.width / 2) / window.innerWidth,
                      (rect.top + rect.height / 2) / window.innerHeight
                    );
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Trigger Celebration Confetti</span>
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    onUnlockBadge(activeBadge.id, e);
                    setActiveBadge((prev) => (prev ? { ...prev, unlocked: true, unlockedAt: 'Just Now' } : null));
                  }}
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
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
