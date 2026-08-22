import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Copy,
  Check,
  Play,
  Sparkles,
  Shield,
  Server,
  Database,
  Lock,
  WifiOff,
  Layout,
  Activity,
  FolderSync,
  HelpCircle,
} from 'lucide-react';
import { ContextBlock } from '../types';
import { CONTEXT_BLOCKS_LIBRARY } from '../data/learningContent';

interface ContextBuilderViewProps {
  onSendToPlayground: (promptText: string) => void;
}

export const ContextBuilderView: React.FC<ContextBuilderViewProps> = ({ onSendToPlayground }) => {
  const [selectedBlocks, setSelectedBlocks] = useState<ContextBlock[]>([
    CONTEXT_BLOCKS_LIBRARY[0], // Principal Architect
    CONTEXT_BLOCKS_LIBRARY[2], // React 19 + Tailwind
    CONTEXT_BLOCKS_LIBRARY[3], // Express Backend
    CONTEXT_BLOCKS_LIBRARY[4], // Google Drive Sync
    CONTEXT_BLOCKS_LIBRARY[6], // Zero-Trust Client Boundary
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

  // Assembled Prompt String
  const assembledPrompt = `### SYSTEM ARCHITECTURE & INTENT SPECIFICATION

1. CORE OBJECTIVE:
${userCustomTask || 'Build the target application with production-grade engineering.'}

2. CONTEXT CONSTRAINTS & STACK:
${selectedBlocks.map((b, idx) => `[${b.category.toUpperCase()}] ${b.instructionText}`).join('\n')}

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
    <div id="context-builder-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-950 text-violet-300 border border-violet-800/80">
              MIT Scratch-Style Builder
            </span>
            <span className="text-xs text-slate-400 font-mono">Modular System Instruction Stacking</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">Context Block Assembler</h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Construct high-precision system instructions before typing freely. Drag and click modular blocks to enforce
            tech stack boundaries, zero-trust security rules, and data persistence models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setSelectedBlocks([
                CONTEXT_BLOCKS_LIBRARY[0],
                CONTEXT_BLOCKS_LIBRARY[2],
                CONTEXT_BLOCKS_LIBRARY[3],
                CONTEXT_BLOCKS_LIBRARY[4],
                CONTEXT_BLOCKS_LIBRARY[6],
              ])
            }
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            Reset Template
          </button>
        </div>
      </div>

      {/* Main 2-Column Scratch Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE (5 cols): Context Blocks Library */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Context Blocks Library</h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{filteredLibrary.length} blocks available</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pb-2">
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
                onClick={() => setActiveCategory(cat.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Available Blocks Grid */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredLibrary.map((block) => {
              const isAdded = selectedBlocks.some((b) => b.id === block.id);

              return (
                <div
                  key={block.id}
                  id={`block-${block.id}`}
                  onClick={() => handleAddBlock(block)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isAdded
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : 'bg-slate-950 border-slate-800 hover:border-emerald-500/80 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400">
                        {getBlockIcon(block.iconName)}
                      </div>
                      <span className="text-xs font-bold text-slate-100">{block.title}</span>
                    </div>

                    {isAdded ? (
                      <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-900">
                        ✓ Docked
                      </span>
                    ) : (
                      <button className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 hover:underline">
                        <Plus className="w-3 h-3" /> Dock
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{block.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE (7 cols): Active Dock & Assembled Prompt */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Canvas Puzzle Dock */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Active Instruction Dock ({selectedBlocks.length} Blocks Snapped)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Scratch Canvas</span>
            </div>

            {/* Custom Task Objective */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Application Objective
              </label>
              <textarea
                value={userCustomTask}
                onChange={(e) => setUserCustomTask(e.target.value)}
                rows={2}
                placeholder="What software do you want the AI to build?"
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl p-3 text-xs text-slate-100 outline-none resize-none"
              />
            </div>

            {/* Docked Blocks List */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Snapped Context Modules
              </div>

              {selectedBlocks.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs font-mono">
                  Click blocks on the left library to snap them into your prompt architecture.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedBlocks.map((block, idx) => (
                    <div
                      key={block.id}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 shadow"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400">
                          {idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                            <span>{block.title}</span>
                            <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border ${block.badgeColor}`}>
                              {block.category}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-md">
                            {block.instructionText}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveBlock(block.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                        title="Remove Block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assembled Output & Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Compiled System Instruction Prompt
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono flex items-center gap-1.5 transition"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                </button>

                <button
                  onClick={() => onSendToPlayground(assembledPrompt)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Test in Playground</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {assembledPrompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
