import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Check,
  Play,
  Shield,
  Server,
  Database,
  Lock,
  WifiOff,
  Layout,
  Activity,
  FolderSync,
} from 'lucide-react';
import { ContextBlock } from '../types';
import { CONTEXT_BLOCKS_LIBRARY } from '../data/learningContent';

interface ContextBuilderViewProps {
  onSendToPlayground: (promptText: string) => void;
}

export const ContextBuilderView: React.FC<ContextBuilderViewProps> = ({ onSendToPlayground }) => {
  const [selectedBlocks, setSelectedBlocks] = useState<ContextBlock[]>([
    CONTEXT_BLOCKS_LIBRARY[0],
    CONTEXT_BLOCKS_LIBRARY[2],
    CONTEXT_BLOCKS_LIBRARY[3],
    CONTEXT_BLOCKS_LIBRARY[4],
    CONTEXT_BLOCKS_LIBRARY[6],
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [userCustomTask, setUserCustomTask] = useState<string>(
    'Create an e-commerce inventory dashboard that tracks stock levels, alerts low inventory, and backs up reports to Google Drive.'
  );
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const getBlockIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield':
        return <Shield className="w-4 h-4" />;
      case 'Lock':
        return <Lock className="w-4 h-4" />;
      case 'Layers':
        return <Layers className="w-4 h-4" />;
      case 'Server':
        return <Server className="w-4 h-4" />;
      case 'FolderSync':
        return <FolderSync className="w-4 h-4" />;
      case 'Database':
        return <Database className="w-4 h-4" />;
      case 'WifiOff':
        return <WifiOff className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'Layout':
      default:
        return <Layout className="w-4 h-4" />;
    }
  };

  const handleAddBlock = (block: ContextBlock) => {
    if (!selectedBlocks.some((b) => b.id === block.id)) {
      setSelectedBlocks([...selectedBlocks, block]);
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    setSelectedBlocks(selectedBlocks.filter((b) => b.id !== blockId));
  };

  const assembledPrompt = `### SYSTEM ARCHITECTURE & INTENT SPECIFICATION

1. CORE OBJECTIVE:
${userCustomTask || 'Build the target application with production-grade engineering.'}

2. CONTEXT CONSTRAINTS & STACK:
${selectedBlocks.map((b) => `[${b.category.toUpperCase()}] ${b.instructionText}`).join('\n')}

3. EXECUTION DIRECTIVE:
Generate complete, type-safe TypeScript/React code with defensive error boundaries and zero exposed secrets.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(assembledPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const filteredLibrary =
    activeCategory === 'all'
      ? CONTEXT_BLOCKS_LIBRARY
      : CONTEXT_BLOCKS_LIBRARY.filter((b) => b.category === activeCategory);

  return (
    <div id="context-builder-view" className="w-full">
      {/* Header Band */}
      <section className="swiss-grid swiss-grid--flush-top items-end">
        <div className="main space-y-2">
          <div className="eyebrow font-mono">Modular System Instruction Stacking</div>
          <h1>Context Block Assembler</h1>
          <p className="lead max-w-2xl">
            Construct high-precision system instructions before typing freely. Snap modular blocks to enforce tech stack boundaries, zero-trust security rules, and persistence models.
          </p>
        </div>

        <div className="aside flex items-center justify-start md:justify-end">
          <button
            type="button"
            onClick={() =>
              setSelectedBlocks([
                CONTEXT_BLOCKS_LIBRARY[0],
                CONTEXT_BLOCKS_LIBRARY[2],
                CONTEXT_BLOCKS_LIBRARY[3],
                CONTEXT_BLOCKS_LIBRARY[4],
                CONTEXT_BLOCKS_LIBRARY[6],
              ])
            }
            className="button button--outline"
          >
            Reset Template
          </button>
        </div>
      </section>

      {/* Main 2-Column Workspace */}
      <section className="swiss-grid">
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANE (5 cols): Context Blocks Library */}
          <div className="lg:col-span-5 bg-[var(--gray)] border border-[var(--black)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--red)]" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                  Context Blocks Library
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
                {filteredLibrary.length} blocks
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'role', label: 'Roles' },
                { id: 'tech_stack', label: 'Stack' },
                { id: 'state_db', label: 'Persistence' },
                { id: 'security', label: 'Security' },
                { id: 'output_format', label: 'Format' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-[11px] font-mono px-2.5 py-1 border font-semibold transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                      : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)] hover:border-[var(--black)] hover:text-[var(--black)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredLibrary.map((block) => {
                const isAdded = selectedBlocks.some((b) => b.id === block.id);

                return (
                  <button
                    key={block.id}
                    id={`block-${block.id}`}
                    type="button"
                    onClick={() => handleAddBlock(block)}
                    disabled={isAdded}
                    className={`w-full p-3.5 border transition-colors text-left ${
                      isAdded
                        ? 'bg-[var(--white)] border-[var(--rule)] opacity-60 cursor-default'
                        : 'bg-[var(--white)] border-[var(--black)] hover:bg-[var(--black)] hover:text-[var(--white)] group'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0">{getBlockIcon(block.iconName)}</span>
                        <span className="text-xs font-bold truncate">{block.title}</span>
                      </div>

                      {isAdded ? (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[var(--gray)] text-[var(--black)] border border-[var(--rule)] shrink-0">
                          DOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-[var(--red)] group-hover:text-white flex items-center gap-1 shrink-0">
                          <Plus className="w-3 h-3" /> DOCK
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed">{block.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANE (7 cols): Active Dock & Assembled Prompt */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[var(--white)] border border-[var(--black)] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                  Active Instruction Dock ({selectedBlocks.length} Snapped)
                </h2>
                <span className="text-[10px] font-mono uppercase text-[var(--red)] font-semibold">
                  Constraint Stack
                </span>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="context-custom-task"
                  className="text-[11px] font-mono font-bold text-[var(--black)] uppercase tracking-wider block"
                >
                  Application Objective
                </label>
                <textarea
                  id="context-custom-task"
                  value={userCustomTask}
                  onChange={(e) => setUserCustomTask(e.target.value)}
                  rows={2}
                  placeholder="What software do you want the AI to build?"
                  className="w-full bg-[var(--gray)] border border-[var(--black)] p-3 text-xs text-[var(--black)] resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Snapped Context Modules
                </div>

                {selectedBlocks.length === 0 ? (
                  <div className="p-8 border border-dashed border-[var(--black)] bg-[var(--gray)] text-center text-[var(--text-muted)] text-xs font-mono">
                    Select blocks on the left library to snap them into your prompt architecture.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedBlocks.map((block, idx) => (
                      <div
                        key={block.id}
                        className="p-3 bg-[var(--gray)] border border-[var(--rule)] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 bg-[var(--black)] text-[var(--white)] flex items-center justify-center font-mono text-[10px] font-bold shrink-0 tabular-nums">
                            0{idx + 1}
                          </span>
                          <div className="space-y-0.5 min-w-0">
                            <div className="text-xs font-bold text-[var(--black)] flex flex-wrap items-center gap-2">
                              <span>{block.title}</span>
                              <span
                                className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border font-semibold ${
                                  block.category === 'security'
                                    ? 'bg-[var(--red)] text-white border-[var(--red)]'
                                    : 'bg-[var(--white)] text-[var(--black)] border-[var(--black)]'
                                }`}
                              >
                                {block.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] font-mono truncate max-w-md">
                              {block.instructionText}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveBlock(block.id)}
                          aria-label={`Remove ${block.title} block`}
                          className="p-1.5 border border-[var(--rule)] bg-[var(--white)] text-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Assembled Output */}
            <div className="bg-[var(--white)] border border-[var(--black)] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--rule)]">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                  Compiled System Instruction Prompt
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="button button--outline !py-1.5 !px-3 !text-xs"
                  >
                    {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[var(--red)]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSendToPlayground(assembledPrompt)}
                    className="button !py-1.5 !px-4 !text-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Test in Playground</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-[#000000] text-[#FFFFFF] border border-[var(--black)] text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {assembledPrompt}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
