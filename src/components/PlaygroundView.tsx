import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Sliders,
  Layers,
  Copy,
  Check,
  FolderGit2,
  Rocket,
  Smartphone,
  Monitor,
  AlertCircle,
  HelpCircle,
  History,
  Code2,
  X,
} from 'lucide-react';
import { GeneratedSystemSpec, PromptDiffRecord } from '../types';
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

  const [spec, setSpec] = useState<GeneratedSystemSpec | null>(null);
  const [promptHistory, setPromptHistory] = useState<PromptDiffRecord[]>([]);

  const [showGuardrailsModal, setShowGuardrailsModal] = useState<boolean>(false);
  const [guardrailQuestions, setGuardrailQuestions] = useState<any[]>([]);
  const [suggestedPrompt, setSuggestedPrompt] = useState<string>('');
  const [isScaffolding, setIsScaffolding] = useState<boolean>(false);

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
        } catch {
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
    } catch (err) {
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
    <div id="playground-workspace" className="w-full">
      {/* Header Band */}
      <section className="swiss-grid swiss-grid--flush-top items-end">
        <div className="main space-y-2">
          <div className="eyebrow font-mono">Interactive Simulator</div>
          <h1>Intent-to-Architecture Split-Pane</h1>
          <p className="lead max-w-2xl">
            Test how natural language prompt phrasing transforms system topology, components, and runtime code.
          </p>
        </div>

        <div className="aside flex flex-wrap sm:flex-nowrap items-center justify-start md:justify-end gap-2.5">
          <button
            id="playground-save-drive-btn"
            type="button"
            onClick={handleSaveToDrive}
            className="button button--outline"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-[var(--red)]" /> : <FolderGit2 className="w-4 h-4" />}
            <span>{saveSuccess ? 'Saved to Drive' : 'Save to Drive'}</span>
          </button>

          {spec && (
            <button
              id="playground-deploy-btn"
              type="button"
              onClick={() => onDeployRequest?.(spec)}
              className="button"
            >
              <Rocket className="w-4 h-4" />
              <span>1-Click Deploy</span>
            </button>
          )}
        </div>
      </section>

      {/* Split-Pane Simulator Section */}
      <section className="swiss-grid">
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT PANE (5 cols): Intent Editor & Sliders */}
          <div className="lg:col-span-5 bg-[var(--gray)] border border-[var(--black)] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--red)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                  Natural Language Intent
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenGuardrails}
                className="text-xs font-mono font-semibold text-[var(--red)] hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Guided Guardrails</span>
              </button>
            </div>

            <textarea
              id="playground-prompt-input"
              aria-label="Natural language architectural prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe your desired software in natural language..."
              className="w-full bg-[var(--white)] border border-[var(--black)] p-3.5 text-sm text-[var(--black)] placeholder:text-[var(--text-muted)] leading-relaxed resize-none"
            />

            {/* Starter Blueprints */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase font-semibold text-[var(--text-muted)]">
                Starter Blueprints
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PLAYGROUND_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(p.prompt);
                      setTechStack(p.stack);
                    }}
                    className="text-[11px] px-2.5 py-1 bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] text-[var(--black)] border border-[var(--rule)] hover:border-[var(--black)] transition-colors text-left"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Precision Sliders */}
            <div className="pt-4 border-t border-[var(--rule)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[var(--black)]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                    Precision Sliders
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">Intent Rigor</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs tabular-nums">
                  <label htmlFor="slider-precision" className="font-medium text-[var(--black)]">
                    Prompt Precision &amp; Clarity
                  </label>
                  <span className="font-mono font-bold text-[var(--red)]">{precisionLevel}%</span>
                </div>
                <input
                  id="slider-precision"
                  type="range"
                  min="10"
                  max="100"
                  value={precisionLevel}
                  onChange={(e) => setPrecisionLevel(Number(e.target.value))}
                  className="w-full accent-[#DC2626] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>Vague</span>
                  <span>Architect-Grade</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs tabular-nums">
                  <label htmlFor="slider-depth" className="font-medium text-[var(--black)]">
                    Architectural Scoping
                  </label>
                  <span className="font-mono font-bold text-[var(--black)]">{architectureDepth}%</span>
                </div>
                <input
                  id="slider-depth"
                  type="range"
                  min="10"
                  max="100"
                  value={architectureDepth}
                  onChange={(e) => setArchitectureDepth(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>In-Memory</span>
                  <span>Full-Stack</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs tabular-nums">
                  <label htmlFor="slider-security" className="font-medium text-[var(--black)]">
                    Security Guardrails &amp; Zero-Trust
                  </label>
                  <span className="font-mono font-bold text-[var(--black)]">{securityLevel}%</span>
                </div>
                <input
                  id="slider-security"
                  type="range"
                  min="10"
                  max="100"
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(Number(e.target.value))}
                  className="w-full accent-black cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>Unchecked</span>
                  <span>Zero-Trust Proxies</span>
                </div>
              </div>
            </div>

            <button
              id="playground-generate-btn"
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="button w-full"
            >
              {isLoading ? (
                <span>Deconstructing Architecture...</span>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Generate System Spec &amp; Code</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT PANE (7 cols): Live Sandbox & Architecture Output */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tabs Bar */}
            <div className="border border-[var(--black)] bg-[var(--white)] p-1.5 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 font-mono shrink-0">
                {[
                  { id: 'preview' as const, label: 'Live Preview', icon: null },
                  { id: 'architecture' as const, label: 'Architecture Graph', icon: <Layers className="w-3.5 h-3.5" /> },
                  { id: 'code' as const, label: 'Component Code', icon: <Code2 className="w-3.5 h-3.5" /> },
                  { id: 'diff' as const, label: 'Prompt Diff', icon: <History className="w-3.5 h-3.5" /> },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-${tab.id}`}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                        active
                          ? 'bg-[var(--black)] text-[var(--white)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--black)] hover:bg-[var(--gray)]'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: Live App Preview */}
            {activeTab === 'preview' && (
              <div className="border border-[var(--black)] bg-[var(--white)] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-3 border-b border-[var(--rule)]">
                  <span className="font-mono font-bold text-[var(--black)] truncate">
                    {spec?.title || 'Interactive Sandbox'}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] px-2 py-0.5 border border-[var(--black)] bg-[var(--gray)] text-[var(--black)] font-semibold">
                      {spec?.intentQuality || 'Active'}
                    </span>
                    <div className="flex items-center gap-0.5 border border-[var(--rule)] bg-[var(--gray)] p-0.5">
                      <button
                        type="button"
                        onClick={() => setViewportMode('desktop')}
                        aria-label="Desktop preview viewport"
                        aria-pressed={viewportMode === 'desktop'}
                        className={`p-1 transition-colors ${
                          viewportMode === 'desktop'
                            ? 'bg-[var(--black)] text-[var(--white)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--black)]'
                        }`}
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewportMode('mobile')}
                        aria-label="Mobile preview viewport"
                        aria-pressed={viewportMode === 'mobile'}
                        className={`p-1 transition-colors ${
                          viewportMode === 'mobile'
                            ? 'bg-[var(--black)] text-[var(--white)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--black)]'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={`mx-auto bg-[#000000] border border-[var(--black)] overflow-hidden ${
                    viewportMode === 'mobile' ? 'max-w-sm h-[520px]' : 'w-full h-[520px]'
                  }`}
                >
                  {spec?.htmlPreview ? (
                    <iframe
                      title="Live Vibe Preview"
                      srcDoc={spec.htmlPreview}
                      className="w-full h-full border-0 bg-[#0A0A0A]"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-white text-xs font-mono">
                      Awaiting generation...
                    </div>
                  )}
                </div>

                {spec?.guardrailInsights && spec.guardrailInsights.length > 0 && (
                  <div className="p-3.5 bg-[var(--gray)] border border-[var(--rule)] space-y-1">
                    <div className="text-[10px] font-mono uppercase font-bold text-[var(--red)] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Architectural Observation</span>
                    </div>
                    <p className="text-xs text-[var(--black)]">{spec.guardrailInsights[0]}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Architecture Graph */}
            {activeTab === 'architecture' && spec && (
              <ArchitectureVisualizer
                spec={spec}
                nodes={spec.architectureNodes || []}
                links={spec.architectureLinks || []}
                intentScore={spec.score || 80}
              />
            )}

            {/* TAB 3: Component Tree & Code */}
            {activeTab === 'code' && spec && (
              <div className="border border-[var(--black)] bg-[var(--white)] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                    Component Tree Hierarchy
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="button button--outline !py-1.5 !px-3 !text-xs"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-[var(--red)]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {spec.componentTree?.map((comp, idx) => (
                    <div key={idx} className="p-3.5 bg-[var(--gray)] border border-[var(--rule)] text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-[var(--black)]">{`<${comp.name} />`}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 bg-[var(--white)] text-[var(--text-muted)] border border-[var(--rule)]">
                          {comp.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{comp.description}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)]">
                    Production TypeScript Architecture
                  </div>
                  <pre className="p-4 bg-[#000000] text-[#FFFFFF] border border-[var(--black)] text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
                    <code>{spec.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 4: Prompt Diffing History */}
            {activeTab === 'diff' && (
              <div className="border border-[var(--black)] bg-[var(--white)] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[var(--black)]" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                      Prompt-Diffing &amp; Evolution Log
                    </h3>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    Intent Version History
                  </span>
                </div>

                <div className="space-y-3">
                  {promptHistory.map((item) => (
                    <div key={item.id} className="bg-[var(--gray)] p-4 border border-[var(--rule)] space-y-3 text-xs">
                      <div className="flex items-center justify-between font-mono tabular-nums">
                        <span className="text-[var(--text-muted)] text-[11px]">{item.timestamp}</span>
                        <span className="px-2 py-0.5 bg-[var(--white)] border border-[var(--black)] text-[var(--red)] font-bold text-[10px]">
                          +{item.scoreDiff}% Precision Lift
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
                          <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block mb-1">
                            Intent Prompt
                          </span>
                          <p className="text-[var(--black)] text-xs font-mono leading-relaxed line-clamp-3">
                            &ldquo;{item.refinedPrompt}&rdquo;
                          </p>
                        </div>
                        <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
                          <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block mb-1">
                            Architectural Upgrades
                          </span>
                          <ul className="text-[var(--black)] text-[11px] space-y-1">
                            {item.architecturalAdditions.map((add, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-[var(--red)] inline-block shrink-0"></span>
                                <span>{add}</span>
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
      </section>

      {/* Guided Guardrails Modal */}
      {showGuardrailsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guardrails-modal-title"
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowGuardrailsModal(false)}
        >
          <div
            className="bg-[var(--white)] border border-[var(--black)] p-6 max-w-xl w-full space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--red)]" />
                <h3 id="guardrails-modal-title" className="text-base font-bold text-[var(--black)]">
                  Guided Guardrails Assistant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuardrailsModal(false)}
                aria-label="Close guardrails assistant"
                className="p-1.5 border border-[var(--rule)] text-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Transform vague ideas into production development specifications by pinning these architectural decisions:
            </p>

            {isScaffolding ? (
              <div className="p-6 text-center text-xs font-mono text-[var(--text-muted)]">
                Analyzing prompt constraints...
              </div>
            ) : (
              <div className="space-y-3">
                {guardrailQuestions.map((q, idx) => (
                  <div key={idx} className="p-3.5 bg-[var(--gray)] border border-[var(--rule)] text-xs space-y-2">
                    <div className="font-semibold text-[var(--black)]">{q.question}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {q.options.map((opt: string, optIdx: number) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => {
                            setPrompt((prev) => `${prev} (${q.dimension}: ${opt})`);
                          }}
                          className="text-[11px] px-2.5 py-1 bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] border border-[var(--black)] text-[var(--black)] transition-colors"
                        >
                          + {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {suggestedPrompt && (
              <div className="p-4 bg-[var(--gray)] border border-[var(--black)] space-y-3">
                <span className="eyebrow font-mono block">Recommended Scoped Prompt</span>
                <p className="text-xs text-[var(--black)] font-mono leading-relaxed whitespace-pre-line">
                  {suggestedPrompt}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPrompt(suggestedPrompt);
                    setShowGuardrailsModal(false);
                  }}
                  className="button w-full"
                >
                  Apply Scoped Prompt &amp; Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
