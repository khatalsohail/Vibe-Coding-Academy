import React, { useState, useMemo } from 'react';
import {
  X,
  Compass,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Bot,
  Layout,
  FolderGit2,
  CloudLightning,
  KeyRound,
  Info,
  Trophy,
  Filter,
  Play,
  RotateCcw,
  Zap,
  HelpCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { RoadmapNode, ConceptCategory } from '../types';
import { INITIAL_ROADMAP_NODES, ROADMAP_CONNECTIONS } from '../data/roadmapData';
import { fireMilestoneConfetti, fireTaskConfetti } from '../utils/confetti';

interface LearningRoadmapOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy') => void;
  onAwardXP?: (amount: number) => void;
}

export const LearningRoadmapOverlay: React.FC<LearningRoadmapOverlayProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onAwardXP = (_amount?: number) => {},
}) => {
  const [nodes, setNodes] = useState<RoadmapNode[]>(INITIAL_ROADMAP_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // Calculate Roadmap Progress
  const completedCount = useMemo(() => nodes.filter((n) => n.status === 'completed').length, [nodes]);
  const unlockedCount = useMemo(() => nodes.filter((n) => n.status !== 'locked').length, [nodes]);
  const totalCount = nodes.length;
  const progressPercent = Math.round((completedCount / Math.max(1, totalCount)) * 100);
  const totalEarnedXP = useMemo(
    () => nodes.filter((n) => n.status === 'completed').reduce((acc, n) => acc + n.xpReward, 0),
    [nodes]
  );

  // Filter nodes if needed
  const filteredNodes = useMemo(() => {
    if (categoryFilter === 'all') return nodes;
    return nodes.filter((n) => n.category === categoryFilter);
  }, [nodes, categoryFilter]);

  // Handle Complete Node & Unlock Successors
  const handleCompleteNode = (nodeId: string, event?: React.MouseEvent) => {
    let earnedXP = 0;

    setNodes((prevNodes) => {
      // 1. Mark target node as completed
      const updated = prevNodes.map((node) => {
        if (node.id === nodeId && node.status !== 'completed') {
          earnedXP = node.xpReward;
          return { ...node, status: 'completed' as const };
        }
        return node;
      });

      // 2. Check and unlock downstream nodes whose prerequisites are now all completed
      const completedIds = new Set(updated.filter((n) => n.status === 'completed').map((n) => n.id));

      return updated.map((node) => {
        if (node.status === 'locked') {
          const allPrereqsMet = node.prerequisites.every((prereqId) => completedIds.has(prereqId));
          if (allPrereqsMet) {
            return { ...node, status: 'unlocked' as const };
          }
        }
        return node;
      });
    });

    if (earnedXP > 0) {
      onAwardXP(earnedXP);
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

  const handleResetRoadmap = () => {
    setNodes(INITIAL_ROADMAP_NODES);
    setSelectedNodeId(null);
  };

  const getNodeIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Layout':
        return <Layout className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Server':
        return <Server className={className} />;
      case 'KeyRound':
        return <KeyRound className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Bot':
        return <Bot className={className} />;
      case 'Database':
        return <Database className={className} />;
      case 'FolderGit2':
        return <FolderGit2 className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'CloudLightning':
        return <CloudLightning className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  const getCategoryBadgeColor = (category: ConceptCategory) => {
    switch (category) {
      case 'ui':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'ingress':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'auth':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ai':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'database':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'security':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'deployment':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="learning-roadmap-modal-root"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-300"
    >
      <div
        id="roadmap-dialog-container"
        className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
      >
        {/* TOP ROADMAP HEADER */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                VIBE ARCHITECTURE CURRICULUM
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                Interactive Concept Roadmap
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-mono mt-1 flex items-center gap-2">
              Full-Stack Architectural Learning Roadmap
            </h2>
          </div>

          {/* Progress & Quick Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-right font-mono hidden md:block">
              <div className="text-[9px] uppercase text-slate-400">Mastery Progress</div>
              <div className="text-xs font-bold text-cyan-400">
                {completedCount}/{totalCount} Nodes ({progressPercent}%) • +{totalEarnedXP} XP
              </div>
            </div>

            <button
              onClick={handleResetRoadmap}
              title="Reset Sample Progress"
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition text-xs font-mono flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              id="close-roadmap-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUBHEADER: CATEGORY FILTER & LEGEND */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[10px] uppercase text-slate-400 font-bold mr-1 shrink-0">Filter:</span>
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'ui', label: 'Tier 1: UI' },
              { id: 'ingress', label: 'Tier 2: Ingress' },
              { id: 'auth', label: 'Auth & Identity' },
              { id: 'ai', label: 'Tier 3: Gemini AI' },
              { id: 'database', label: 'Tier 4: Persistence' },
              { id: 'security', label: 'Zero-Trust' },
              { id: 'deployment', label: 'Tier 5: Cloud Run' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-[10px] uppercase font-bold transition shrink-0 ${
                  categoryFilter === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Legend */}
          <div className="flex items-center gap-3 text-[10px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
              <span>Mastered</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Ready to Learn</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
              <span>Locked</span>
            </span>
          </div>
        </div>

        {/* MAIN BODY: 2-COLUMN LAYOUT (MAP CANVAS + INSPECTOR PANEL) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative min-h-[420px]">
          {/* LEFT: SVG CONNECTING LINE MAP CANVAS (7 cols on lg) */}
          <div className="lg:col-span-7 p-4 sm:p-6 overflow-auto bg-slate-950/40 relative flex flex-col justify-between">
            {/* SVG Connecting Map Stage */}
            <div className="relative min-w-[700px] h-[400px] select-none">
              {/* Interactive SVG Connector Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  {/* Linear Gradients for Active Lines */}
                  <linearGradient id="unlockedGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>

                  <linearGradient id="completedGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>

                  {/* Filter for glowing neon line effect */}
                  <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Render Connecting Orthogonal / Bezier Paths */}
                {ROADMAP_CONNECTIONS.map((conn, idx) => {
                  const source = nodes.find((n) => n.id === conn.from);
                  const target = nodes.find((n) => n.id === conn.to);
                  if (!source || !target) return null;

                  const isSourceDone = source.status === 'completed';
                  const isTargetActive = target.status !== 'locked';
                  const isPathActive = isSourceDone && isTargetActive;
                  const isHovered =
                    hoveredNodeId === source.id ||
                    hoveredNodeId === target.id ||
                    selectedNodeId === source.id ||
                    selectedNodeId === target.id;

                  // Compute Bezier Curve points (Center of nodes)
                  const startX = source.x + 85;
                  const startY = source.y + 40;
                  const endX = target.x + 85;
                  const endY = target.y + 40;
                  const midX = (startX + endX) / 2;

                  const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

                  return (
                    <g key={idx}>
                      {/* Background Shadow / Inactive Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isHovered ? '#0ea5e9' : isPathActive ? '#059669' : '#1e293b'}
                        strokeWidth={isHovered ? 4 : isPathActive ? 3 : 2}
                        strokeDasharray={isPathActive ? 'none' : '4 4'}
                        opacity={isPathActive ? 0.9 : 0.4}
                        filter={isPathActive ? 'url(#neonFilter)' : undefined}
                      />

                      {/* Animated Glow Flow Pulse along Completed Routes */}
                      {isPathActive && (
                        <circle r="3.5" fill="#38bdf8" className="animate-pulse">
                          <animateMotion path={pathD} dur="3s" repeatCount="indefinite" />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Render Interactive Roadmap Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isCompleted = node.status === 'completed';
                const isUnlocked = node.status === 'unlocked';
                const isLocked = node.status === 'locked';

                const isDimmed = categoryFilter !== 'all' && node.category !== categoryFilter;

                return (
                  <div
                    key={node.id}
                    id={`roadmap-node-${node.id}`}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={(e) => {
                      setSelectedNodeId(node.id);
                      if (isCompleted) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        fireTaskConfetti(
                          (rect.left + rect.width / 2) / window.innerWidth,
                          (rect.top + rect.height / 2) / window.innerHeight
                        );
                      }
                    }}
                    className={`absolute w-[170px] rounded-2xl p-3 border transition-all cursor-pointer z-10 select-none shadow-xl flex flex-col justify-between ${
                      isDimmed ? 'opacity-25 grayscale' : 'opacity-100'
                    } ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 scale-105 shadow-cyan-500/30'
                        : isHovered
                        ? 'scale-105'
                        : ''
                    } ${
                      isCompleted
                        ? 'bg-slate-900 border-emerald-500/60 text-slate-200 shadow-emerald-950/40'
                        : isUnlocked
                        ? 'bg-slate-900 border-cyan-500/60 text-white shadow-cyan-950/40 hover:border-cyan-400'
                        : 'bg-slate-950/90 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div>
                      {/* Top Header in Node Card */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${getCategoryBadgeColor(
                            node.category
                          )}`}
                        >
                          {node.category}
                        </span>

                        <span className="text-[9px] font-mono font-bold text-amber-400">
                          +{node.xpReward} XP
                        </span>
                      </div>

                      {/* Icon + Title */}
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center border shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : isUnlocked
                              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                              : 'bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            getNodeIcon(node.iconName, 'w-3.5 h-3.5')
                          )}
                        </div>

                        <h4
                          className={`text-[11px] font-bold font-mono leading-tight line-clamp-1 ${
                            isCompleted ? 'text-emerald-300' : isUnlocked ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {node.title}
                        </h4>
                      </div>

                      <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight">
                        {node.shortDesc}
                      </p>
                    </div>

                    {/* Status Pill on bottom of node */}
                    <div className="pt-1.5 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
                      {isCompleted ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mastered</span>
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-cyan-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Locked</span>
                        </span>
                      )}

                      <span className="text-slate-400 text-[8px]">T{node.tierLevel}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Map Canvas Guide */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Click any node to open architecture deconstruction & practice.</span>
              </div>
              <span className="text-cyan-400 font-bold">5 Progressive Cloud Tiers</span>
            </div>
          </div>

          {/* RIGHT: CONCEPT INSPECTOR & DECONSTRUCTION DRAWER (5 cols on lg) */}
          <div
            id="roadmap-node-inspector"
            className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900/90 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-4"
          >
            {selectedNode ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Header with Title and Tier */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[9px] font-mono uppercase px-2.5 py-0.5 rounded-full border font-bold ${getCategoryBadgeColor(
                        selectedNode.category
                      )}`}
                    >
                      {selectedNode.tierName} • {selectedNode.category.toUpperCase()}
                    </span>

                    <span className="text-xs font-mono font-bold text-amber-400">
                      +{selectedNode.xpReward} XP BOUNTY
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-1 flex items-center gap-2">
                    {selectedNode.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 font-sans">{selectedNode.shortDesc}</p>
                </div>

                {/* Beginner Metaphor Box */}
                <div className="p-3.5 bg-cyan-950/30 border border-cyan-800/50 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>💡 Beginner Metaphor</span>
                  </div>
                  <p className="text-xs text-cyan-200 leading-relaxed font-sans">
                    {selectedNode.beginnerMetaphor}
                  </p>
                </div>

                {/* Full-Stack Architectural Role */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-slate-300 font-mono font-bold text-xs">
                    <Server className="w-3.5 h-3.5 text-purple-400" />
                    <span>🏗️ Full-Stack System Architecture Role</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {selectedNode.architectureRole}
                  </p>
                </div>

                {/* Deep Dive Explanation */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Engineering Deep Dive
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                    {selectedNode.fullExplanation}
                  </p>
                </div>

                {/* Key Skills Tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Verifiable Skills Learned
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.keySkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  {selectedNode.status === 'completed' ? (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl flex items-center justify-between text-xs font-mono text-emerald-300">
                      <span className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Concept Mastered & Verified</span>
                      </span>
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          fireMilestoneConfetti(
                            (rect.left + rect.width / 2) / window.innerWidth,
                            (rect.top + rect.height / 2) / window.innerHeight
                          );
                        }}
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Sparkles className="w-3 h-3" />
                        Celebrate
                      </button>
                    </div>
                  ) : (
                    <button
                      id="master-node-btn"
                      onClick={(e) => handleCompleteNode(selectedNode.id, e)}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Mark Concept as Mastered (+{selectedNode.xpReward} XP)</span>
                    </button>
                  )}

                  {selectedNode.actionTab && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateTab(selectedNode.actionTab!);
                      }}
                      className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 font-mono font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                      <span>
                        Practice in {selectedNode.actionTab.toUpperCase()} Workspace
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Default Empty State when no node selected */
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <div className="w-14 h-14 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <Compass className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono">Select a Roadmap Node</h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Click any node on the connecting transit map to inspect its architectural purpose, beginner metaphor, and unlock downstream skills.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-1.5 max-w-xs">
                  {nodes.slice(0, 3).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNodeId(n.id)}
                      className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-[10px] font-mono text-cyan-300 rounded-lg border border-slate-800 transition"
                    >
                      {n.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
