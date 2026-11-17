import React, { useState, useMemo } from 'react';
import {
  X,
  Compass,
  Check,
  Lock,
  Sparkles,
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
  Play,
  RotateCcw,
} from 'lucide-react';
import { RoadmapNode } from '../types';
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
  onAwardXP = (_amount: number) => {},
}) => {
  const [nodes, setNodes] = useState<RoadmapNode[]>(INITIAL_ROADMAP_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const completedCount = useMemo(
    () => nodes.filter((n) => n.status === 'completed').length,
    [nodes]
  );
  const totalCount = nodes.length;
  const progressPercent = Math.round((completedCount / Math.max(1, totalCount)) * 100);
  const totalEarnedXP = useMemo(
    () =>
      nodes
        .filter((n) => n.status === 'completed')
        .reduce((acc, n) => acc + n.xpReward, 0),
    [nodes]
  );

  const handleCompleteNode = (nodeId: string, event?: React.MouseEvent) => {
    let earnedXP = 0;

    setNodes((prevNodes) => {
      const updated = prevNodes.map((node) => {
        if (node.id === nodeId && node.status !== 'completed') {
          earnedXP = node.xpReward;
          return { ...node, status: 'completed' as const };
        }
        return node;
      });

      const completedIds = new Set(
        updated.filter((n) => n.status === 'completed').map((n) => n.id)
      );

      return updated.map((node) => {
        if (node.status === 'locked') {
          const allPrereqsMet = node.prerequisites.every((prereqId) =>
            completedIds.has(prereqId)
          );
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

  const getNodeIcon = (iconName: string, className: string = 'w-4 h-4') => {
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

  if (!isOpen) return null;

  return (
    <div
      id="learning-roadmap-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-dialog-title"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        id="roadmap-dialog-container"
        className="bg-[var(--white)] border border-[var(--black)] w-full max-w-7xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP HEADER */}
        <div className="p-4 sm:p-5 bg-[var(--white)] border-b border-[var(--black)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="eyebrow font-mono">Vibe Architecture Curriculum</div>
            <h2 id="roadmap-dialog-title" className="text-lg sm:text-xl font-bold text-[var(--black)] mt-0.5">
              Full-Stack Architectural Learning Roadmap
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[var(--gray)] px-3 py-1.5 border border-[var(--rule)] text-right font-mono hidden md:block tabular-nums">
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Mastery Progress</div>
              <div className="text-xs font-bold text-[var(--black)]">
                {completedCount}/{totalCount} Nodes ({progressPercent}%) • +{totalEarnedXP} XP
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetRoadmap}
              className="button button--outline !py-2 !px-3 !text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              id="close-roadmap-btn"
              type="button"
              onClick={onClose}
              aria-label="Close roadmap modal"
              className="p-2 border border-[var(--black)] bg-[var(--white)] text-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FILTER & LEGEND STRIP */}
        <div className="px-4 py-2.5 bg-[var(--gray)] border-b border-[var(--rule)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'ui', label: 'Tier 1: UI' },
              { id: 'ingress', label: 'Tier 2: Ingress' },
              { id: 'auth', label: 'Auth' },
              { id: 'ai', label: 'Tier 3: AI' },
              { id: 'database', label: 'Tier 4: DB' },
              { id: 'security', label: 'Zero-Trust' },
              { id: 'deployment', label: 'Tier 5: Cloud Run' },
            ].map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`px-2.5 py-1 border text-[10px] uppercase font-semibold transition-colors shrink-0 ${
                    active
                      ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                      : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)] hover:border-[var(--black)] hover:text-[var(--black)]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[var(--black)] inline-block"></span>
              <span>Mastered</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[var(--red)] inline-block"></span>
              <span>Ready</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[var(--rule)] border border-[var(--text-muted)] inline-block"></span>
              <span>Locked</span>
            </span>
          </div>
        </div>

        {/* MAIN 2-COLUMN CANVAS + INSPECTOR */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
          {/* LEFT (8 cols): Interactive Node Map */}
          <div className="lg:col-span-8 p-4 sm:p-5 overflow-auto bg-[var(--white)] flex flex-col justify-between">
            <div className="relative min-w-[796px] h-[380px] select-none">
              {/* Tier Column Headers */}
              <div className="grid grid-cols-5 gap-2 px-3 pt-1 pb-2 border-b border-[var(--rule)] text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                <div>01 / Client UI</div>
                <div>02 / Ingress &amp; Auth</div>
                <div>03 / Gemini AI</div>
                <div>04 / Data &amp; Drive</div>
                <div>05 / Cloud Run</div>
              </div>

              {/* Orthogonal / Bezier SVG Paths */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
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

                  const sX = (source.tierLevel - 1) * 158 + 12;
                  const sY = source.y < 200 ? 48 : 206;
                  const tX = (target.tierLevel - 1) * 158 + 12;
                  const tY = target.y < 200 ? 48 : 206;

                  const startX = sX + 73;
                  const startY = sY + 58;
                  const endX = tX + 73;
                  const endY = tY + 58;
                  const midX = (startX + endX) / 2;
                  const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

                  return (
                    <path
                      key={idx}
                      d={pathD}
                      fill="none"
                      stroke={
                        isHovered
                          ? '#DC2626'
                          : isPathActive
                          ? '#000000'
                          : '#D1D5DB'
                      }
                      strokeWidth={isHovered ? 2.5 : isPathActive ? 2 : 1.5}
                      strokeDasharray={isPathActive ? 'none' : '4 4'}
                    />
                  );
                })}
              </svg>

              {/* Node Cards */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isCompleted = node.status === 'completed';
                const isUnlocked = node.status === 'unlocked';
                const isLocked = node.status === 'locked';
                const isDimmed = categoryFilter !== 'all' && node.category !== categoryFilter;
                const mappedLeft = (node.tierLevel - 1) * 158 + 12;
                const mappedTop = node.y < 200 ? 48 : 206;

                return (
                  <div
                    key={node.id}
                    id={`roadmap-node-${node.id}`}
                    style={{ left: `${mappedLeft}px`, top: `${mappedTop}px` }}
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
                    className={`absolute w-[146px] p-2.5 border transition-colors cursor-pointer z-10 select-none flex flex-col justify-between ${
                      isDimmed ? 'opacity-25' : 'opacity-100'
                    } ${
                      isSelected
                        ? 'border-2 border-[var(--red)] bg-[var(--gray)]'
                        : isCompleted
                        ? 'bg-[var(--white)] border-[var(--black)]'
                        : isUnlocked
                        ? 'bg-[var(--gray)] border-[var(--black)] hover:border-[var(--red)]'
                        : 'bg-[var(--white)] border-[var(--rule)] text-[var(--text-muted)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5 font-mono text-[9px]">
                        <span className="uppercase font-bold text-[var(--text-muted)]">
                          {node.category}
                        </span>
                        <span className="font-bold text-[var(--red)] tabular-nums">
                          +{node.xpReward} XP
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className={`w-5 h-5 border flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                              : isUnlocked
                              ? 'bg-[var(--red)] text-white border-[var(--red)]'
                              : 'bg-[var(--gray)] text-[var(--text-muted)] border-[var(--rule)]'
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="w-2.5 h-2.5" />
                          ) : (
                            getNodeIcon(node.iconName, 'w-2.5 h-2.5')
                          )}
                        </div>
                        <h4 className="text-[11px] font-bold text-[var(--black)] leading-tight line-clamp-1">
                          {node.title}
                        </h4>
                      </div>

                      <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-tight">
                        {node.shortDesc}
                      </p>
                    </div>

                    <div className="pt-1.5 mt-1.5 border-t border-[var(--rule)] flex items-center justify-between text-[9px] font-mono">
                      {isCompleted ? (
                        <span className="text-[var(--black)] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-[var(--red)]" />
                          <span>MASTERED</span>
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-[var(--red)] font-bold">READY</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">LOCKED</span>
                      )}
                      <span className="text-[var(--text-muted)]">T{node.tierLevel}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--black)]" />
                <span>Click any node to inspect architecture and unlock downstream layers.</span>
              </div>
              <span className="text-[var(--black)] font-semibold">5 Cloud Tiers</span>
            </div>
          </div>

          {/* RIGHT (4 cols): Concept Inspector Drawer */}
          <div
            id="roadmap-node-inspector"
            className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[var(--black)] bg-[var(--gray)] p-5 overflow-y-auto flex flex-col justify-between space-y-4"
          >
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 bg-[var(--black)] text-[var(--white)] uppercase font-bold">
                      {selectedNode.tierName} • {selectedNode.category}
                    </span>
                    <span className="font-bold text-[var(--red)] tabular-nums">
                      +{selectedNode.xpReward} XP
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--black)] mt-1">
                    {selectedNode.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{selectedNode.shortDesc}</p>
                </div>

                <div className="p-3.5 bg-[var(--white)] border border-[var(--black)] space-y-1">
                  <div className="eyebrow font-mono">Beginner Metaphor</div>
                  <p className="text-xs text-[var(--black)] leading-relaxed">
                    {selectedNode.beginnerMetaphor}
                  </p>
                </div>

                <div className="p-3.5 bg-[var(--white)] border border-[var(--rule)] space-y-1">
                  <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">
                    Full-Stack System Architecture Role
                  </div>
                  <p className="text-xs text-[var(--black)] leading-relaxed">
                    {selectedNode.architectureRole}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                    Engineering Deep Dive
                  </span>
                  <p className="text-xs text-[var(--black)] leading-relaxed bg-[var(--white)] p-3 border border-[var(--rule)]">
                    {selectedNode.fullExplanation}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold block">
                    Verifiable Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.keySkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-[var(--white)] text-[var(--black)] border border-[var(--rule)] text-[10px] font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--rule)] space-y-2">
                  {selectedNode.status === 'completed' ? (
                    <div className="p-3 bg-[var(--white)] border border-[var(--black)] flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 font-bold text-[var(--black)]">
                        <Check className="w-4 h-4 text-[var(--red)]" />
                        <span>Concept Mastered</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          fireMilestoneConfetti(
                            (rect.left + rect.width / 2) / window.innerWidth,
                            (rect.top + rect.height / 2) / window.innerHeight
                          );
                        }}
                        className="text-[11px] text-[var(--red)] hover:underline font-bold"
                      >
                        Celebrate
                      </button>
                    </div>
                  ) : (
                    <button
                      id="master-node-btn"
                      type="button"
                      onClick={(e) => handleCompleteNode(selectedNode.id, e)}
                      className="button w-full"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Mark Concept Mastered (+{selectedNode.xpReward} XP)</span>
                    </button>
                  )}

                  {selectedNode.actionTab && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab(selectedNode.actionTab!);
                      }}
                      className="button button--outline w-full"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Practice in {selectedNode.actionTab.toUpperCase()}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 border border-[var(--black)] bg-[var(--white)] flex items-center justify-center text-[var(--black)]">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--black)]">Select a Roadmap Node</h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1">
                    Click any node on the transit map to inspect its architectural purpose and unlock downstream layers.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
                  {nodes.slice(0, 3).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setSelectedNodeId(n.id)}
                      className="px-2.5 py-1 bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] text-[10px] font-mono text-[var(--black)] border border-[var(--black)] transition-colors"
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
