import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Layers,
  ShieldCheck,
  HardDrive,
  Copy,
  Check,
  FolderGit2,
  Rocket,
  Maximize2,
  Smartphone,
  Monitor,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  History,
  Code2,
  CheckCircle2,
} from 'lucide-react';
import { GeneratedSystemSpec, PromptDiffRecord, ContextBlock } from '../types';
import { ArchitectureVisualizer } from './ArchitectureVisualizer';
import { STARTER_PLAYGROUND_PROMPTS } from '../data/learningContent';
import { generateAIEngineCode, analyzePromptDiff, scaffoldPromptGuardrails } from '../services/geminiService';
import { DriveService } from '../services/driveService';

interface PlaygroundViewProps {
  onDeployRequest?: (spec: GeneratedSystemSpec) => void;
  onDriveSyncSuccess?: () => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  onDeployRequest,
  onDriveSyncSuccess,
}) => {
  // Playground state
  const [prompt, setPrompt] = useState<string>(
    'Build a real-time collaborative task manager with Google OAuth login, Firestore database persistence, and Google Drive vibe-coding-site sync.'
  );
  const [precisionLevel, setPrecisionLevel] = useState<number>(85);
  const [architectureDepth, setArchitectureDepth] = useState<number>(80);
  const [securityLevel, setSecurityLevel] = useState<number>(90);
  const [techStack, setTechStack] = useState<string>('React 19 + Express + PostgreSQL');

  const [activeTab, setActiveTab] = useState<'preview' | 'architecture' | 'code' | 'audit' | 'diff'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Generated Spec Data
  const [spec, setSpec] = useState<GeneratedSystemSpec | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptDiffRecord[]>([]);

  // Guided Guardrails Modal
  const [showGuardrailsModal, setShowGuardrailsModal] = useState<boolean>(false);
  const [guardrailQuestions, setGuardrailQuestions] = useState<any[]>([]);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string>('');
  const [isScaffolding, setIsScaffolding] = useState<boolean>(false);

  // Run initial generation on mount if empty
  React.useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    try {
      const generatedSpec = await generateAIEngineCode({
        prompt,
        precisionLevel,
        securityLevel,
        techStack,
      });

      setSpec(generatedSpec);

      // Record prompt diff if previous exists
      if (promptHistory.length > 0) {
        const lastRecord = promptHistory[0];
        try {
          const diffAnalysis = await analyzePromptDiff(lastRecord.originalPrompt, prompt);
          const newRecord: PromptDiffRecord = {
            id: 'diff-' + Date.now(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            originalPrompt: lastRecord.originalPrompt,
            refinedPrompt: prompt,
            addedContexts: diffAnalysis.keyAdditions || [],
            scoreDiff: diffAnalysis.scoreDiff || 0,
            architecturalAdditions: diffAnalysis.architecturalEvolution || [],
          };
          setPromptHistory((prev) => [newRecord, ...prev.slice(0, 9)]);
        } catch (e) {
          // ignore diff err
        }
      } else {
        setPromptHistory([
          {
            id: 'diff-' + Date.now(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            originalPrompt: prompt,
            refinedPrompt: prompt,
            addedContexts: ['Initial intent baseline'],
            scoreDiff: 0,
            architecturalAdditions: ['Base topology instantiated'],
          },
        ]);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!spec) return;
    try {
      await DriveService.syncCodeProject(
        spec.title || 'vibe-app',
        spec.htmlPreview,
        spec.codeSnippet,
        spec.architectureNodes
      );
      setSaveSuccess(true);
      onDriveSyncSuccess?.();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed saving to Drive', e);
    }
  };

  const handleOpenGuardrails = async () => {
    setIsScaffolding(true);
    setShowGuardrailsModal(true);
    try {
      const res = await scaffoldPromptGuardrails(prompt);
      setGuardrailQuestions(res.questions);
      setSuggestedPrompt(res.suggestedPrompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScaffolding(false);
    }
  };

  const handleCopyCode = () => {
    if (!spec) return;
    navigator.clipboard.writeText(spec.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div id="playground-workspace" className="space-y-6 animate-in fade-in duration-300">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">INTERACTIVE SIMULATOR</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight font-mono mt-0.5">
            Intent-to-Architecture Split-Pane
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test how natural language prompt phrasing transforms system topology, components, and runtime code.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="playground-save-drive-btn"
            onClick={handleSaveToDrive}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition font-mono ${
              saveSuccess
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                : 'bg-slate-950 hover:bg-slate-800 text-cyan-400 border-slate-800'
            }`}
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4 text-cyan-400" /> : <FolderGit2 className="w-4 h-4 text-cyan-400" />}
            <span>{saveSuccess ? 'Saved to vibe-coding-site' : 'Save to Google Drive'}</span>
          </button>

          {spec && (
            <button
              id="playground-deploy-btn"
              onClick={() => onDeployRequest?.(spec)}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md shadow-cyan-500/20 font-mono"
            >
              <Rocket className="w-4 h-4 fill-slate-950" />
              <span>1-Click Deploy</span>
            </button>
          )}
        </div>
      </div>

      {/* Split Pane Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE (5 cols): Intent Input & Interactive Sliders */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt Editor Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Natural Language Intent</span>
              </div>
              <button
                onClick={handleOpenGuardrails}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Guided Guardrails
              </button>
            </div>

            <textarea
              id="playground-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe your desired software in natural language..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition leading-relaxed resize-none font-sans"
            />

            {/* Quick Preset Prompts */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Quick Starter Blueprints</div>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PLAYGROUND_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p.prompt);
                      setTechStack(p.stack);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition truncate max-w-full text-left"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Vibe Coding Precision Sliders */}
            <div className="pt-3 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Interactive Precision Sliders</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Simulate Intent Rigor</span>
              </div>

              {/* Slider 1: Prompt Precision */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Prompt Precision & Clarity</span>
                  <span className="font-mono text-emerald-400 font-bold">{precisionLevel}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={precisionLevel}
                  onChange={(e) => setPrecisionLevel(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Vague / "Make a game"</span>
                  <span>Architect-Grade Spec</span>
                </div>
              </div>

              {/* Slider 2: Architectural Depth */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Architectural Scoping</span>
                  <span className="font-mono text-cyan-400 font-bold">{architectureDepth}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={architectureDepth}
                  onChange={(e) => setArchitectureDepth(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>In-Memory Scratchpad</span>
                  <span>Full-Stack Microservices</span>
                </div>
              </div>

              {/* Slider 3: Security Guardrails */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Security Guardrails & Zero-Trust</span>
                  <span className="font-mono text-amber-400 font-bold">{securityLevel}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Implicit / Unchecked</span>
                  <span>Zero-Trust + Server Proxies</span>
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              id="playground-generate-btn"
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs font-mono rounded-2xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                  <span>Deconstructing Architecture...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>GENERATE SYSTEM SPEC & CODE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANE (7 cols): Live Sandbox & System Architecture Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 font-mono">
              <button
                id="tab-preview"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'preview' ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Live App Preview
              </button>

              <button
                id="tab-architecture"
                onClick={() => setActiveTab('architecture')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'architecture' ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Architecture Graph
              </button>

              <button
                id="tab-code"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'code' ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Component Tree & Code
              </button>

              <button
                id="tab-diff"
                onClick={() => setActiveTab('diff')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'diff' ? 'bg-slate-800 text-cyan-400 shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Prompt Diff
              </button>
            </div>

            {/* Viewport switcher for preview tab */}
            {activeTab === 'preview' && (
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1 rounded-lg ${viewportMode === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1 rounded-lg ${viewportMode === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: Live Sandbox Preview */}
          {activeTab === 'preview' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-mono text-slate-300 font-semibold">{spec?.title || 'Interactive Sandbox'}</span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-900/50">
                  {spec?.intentQuality || 'Active'}
                </span>
              </div>

              {/* Sandboxed IFrame */}
              <div
                className={`mx-auto bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300 ${
                  viewportMode === 'mobile' ? 'max-w-sm h-[520px] shadow-2xl' : 'w-full h-[520px]'
                }`}
              >
                {spec?.htmlPreview ? (
                  <iframe
                    title="Live Vibe Preview"
                    srcDoc={spec.htmlPreview}
                    className="w-full h-full border-0 bg-slate-950"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                    Awaiting generation...
                  </div>
                )}
              </div>

              {/* Guardrails Insight Pill */}
              {spec?.guardrailInsights && spec.guardrailInsights.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" />
                    Architectural Observation
                  </div>
                  <p className="text-xs text-slate-300">{spec.guardrailInsights[0]}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Intent-to-Architecture Graph */}
          {activeTab === 'architecture' && spec && (
            <ArchitectureVisualizer
              spec={spec}
              nodes={spec.architectureNodes || []}
              links={spec.architectureLinks || []}
              intentScore={spec.score || 80}
            />
          )}

          {/* TAB 3: Code & Component Hierarchy */}
          {activeTab === 'code' && spec && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Component Tree Hierarchy
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {/* Component Nodes */}
              <div className="grid grid-cols-2 gap-2.5">
                {spec.componentTree?.map((comp, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-300">{`<${comp.name} />`}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {comp.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{comp.description}</p>
                  </div>
                ))}
              </div>

              {/* Code Snippet */}
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">Production TypeScript Architecture</div>
                <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-72 leading-relaxed">
                  <code>{spec.codeSnippet}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: Prompt Diffing History */}
          {activeTab === 'diff' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Prompt-Diffing & Evolution Log
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">Git for Natural Language Intent</span>
              </div>

              <div className="space-y-3">
                {promptHistory.map((item) => (
                  <div key={item.id} className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-500 text-[11px]">{item.timestamp}</span>
                      <span className="px-2 py-0.5 rounded font-mono text-emerald-300 bg-emerald-950 border border-emerald-800 text-[10px]">
                        +{item.scoreDiff}% Precision Lift
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Intent Prompt</span>
                        <p className="text-slate-300 text-xs font-mono leading-relaxed line-clamp-3">
                          "{item.refinedPrompt}"
                        </p>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Architectural Upgrades</span>
                        <ul className="text-slate-300 text-[11px] space-y-1">
                          {item.architecturalAdditions.map((add, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {add}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guided Guardrails Modal */}
      {showGuardrailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Guided Guardrails Assistant</h3>
              </div>
              <button
                onClick={() => setShowGuardrailsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Transform vague ideas into production development specifications by pinning these architectural decisions:
            </p>

            <div className="space-y-3">
              {guardrailQuestions.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-200">{q.question}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {q.options.map((opt: string, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => {
                          setPrompt((prev) => `${prev} (${q.dimension}: ${opt})`);
                        }}
                        className="text-[11px] px-2 py-1 bg-slate-900 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-800 hover:border-emerald-800 rounded-lg text-slate-300 transition"
                      >
                        + {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {suggestedPrompt && (
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Recommended Scoped Prompt</span>
                <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-line">{suggestedPrompt}</p>
                <button
                  onClick={() => {
                    setPrompt(suggestedPrompt);
                    setShowGuardrailsModal(false);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Apply Scoped Prompt & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
