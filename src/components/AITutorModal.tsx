import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  X,
  ChevronRight,
  HelpCircle,
  Layers,
  Shield,
  Zap,
  Terminal,
  Database,
  Globe,
  Server,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  Send,
  RefreshCw,
  MessageSquare,
  Cpu,
  Minimize2,
} from 'lucide-react';
import { LearningTrack } from '../types';

interface AITutorModalProps {
  currentTab: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy';
  track: LearningTrack;
  onNavigateTab?: (tab: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy') => void;
}

interface ContextualHint {
  title: string;
  category: 'architecture' | 'protocol' | 'security' | 'vibe_tip';
  summary: string;
  detail: string;
  beginnerMetaphor: string;
  actionableStep?: string;
  targetTab?: 'dashboard' | 'playground' | 'context' | 'review' | 'deploy';
}

const TAB_CONTEXT_HINTS: Record<string, ContextualHint[]> = {
  dashboard: [
    {
      title: 'Deciphering the 4-Tier Architecture',
      category: 'architecture',
      summary: 'Modern full-stack apps divide responsibilities into 4 distinct layers.',
      beginnerMetaphor:
        'Think of a restaurant: The Frontend is the Dining Room (UI), the Ingress Gateway is the Host/Waiter, the Services Tier is the Kitchen Chef (Gemini AI), and the Database is the Pantry/Freezer (Firestore).',
      detail:
        'Each node in our diagrams belongs to Tier 1 (Client UI), Tier 2 (Ingress & Auth), Tier 3 (Microservices & Intelligence), or Tier 4 (Persistence & Storage). Never skip Tier 2 to ensure client-side safety.',
    },
    {
      title: 'The "Vibe Coding" Telemetry Formula',
      category: 'vibe_tip',
      summary: 'Prompting is not just typing code; it is directing architectural topology.',
      beginnerMetaphor:
        'Like giving blueprints to an architect rather than laying individual bricks yourself.',
      detail:
        'When you define explicit constraints (Role, DB schema, API routes), AI writes 95% fewer security vulnerabilities and generates deterministic, robust apps.',
    },
  ],
  playground: [
    {
      title: 'How to Read the D3 Node-Link Architecture Diagram',
      category: 'architecture',
      summary: 'Circles & Cards are Services; Glowing Lines are Communication Protocols.',
      beginnerMetaphor:
        'The diagram is a subway transit map: Each station is a microservice or database, and the glowing colored tracks show the trains carrying user data back and forth.',
      detail:
        '• Left Tier (Cyan): React 19 Client UI where buttons and forms live.\n• Middle Tier (Green/Purple): Express Gateway & Gemini AI Engine handling backend logic.\n• Right Tier (Blue): Cloud Firestore & Google Drive saving state permanently.',
      actionableStep: 'Click any node in the D3 diagram or toggle between "Tier Flow" and "Force" layout modes to inspect.',
    },
    {
      title: 'Why Nodes Turn Red (Missing) or Amber (Insecure)',
      category: 'security',
      summary: 'Your prompt determines the health of the generated system architecture.',
      beginnerMetaphor:
        'If you order a house without asking for doors or locks, the AI builds an open frame. Specifying "secure auth" adds the deadbolts.',
      detail:
        '• Red Dashed (Missing): You didn’t mention database persistence, so data resets on reload.\n• Amber Ring (Insecure): API keys or database credentials might be exposed on the browser instead of server-side process.env.\n• Green Ring (Optimal): Clean separation of concerns with full-stack API proxying.',
      actionableStep: 'Add phrases like "store user records in Firestore via server /api/ routes" into your prompt.',
    },
    {
      title: 'Understanding Protocol Arrows & Data Flow',
      category: 'protocol',
      summary: 'Colored badges (HTTP/REST, OAuth 2.0, Firestore SDK) explain how parts talk.',
      beginnerMetaphor:
        'Different languages: The browser speaks HTTP to Express, Express speaks SDK to Firestore, and Google Identity speaks OAuth popups.',
      detail:
        'Data flows left to right on user action, and returns right to left with saved responses. Animated glowing dots show live data packet circulation.',
    },
  ],
  context: [
    {
      title: 'Preventing AI Hallucinations with Guardrail Blocks',
      category: 'vibe_tip',
      summary: 'Slots and constraints lock the AI model into a strict system contract.',
      beginnerMetaphor:
        'Like guardrails on a bowling alley: no matter how wild the prompt is, the ball always hits the pins.',
      detail:
        'By locking down the Role (Senior Systems Engineer), Framework (React + Tailwind), and Persistence (Firestore NoSQL), the model cannot wander into creating broken mock libraries.',
      actionableStep: 'Click the "+" button on context blocks to inject them into the Playground prompt.',
    },
  ],
  review: [
    {
      title: 'Spotting the #1 AI Flaw: Exposed Secrets',
      category: 'security',
      summary: 'AI loves putting secret API keys directly inside React components.',
      beginnerMetaphor:
        'Writing your home Wi-Fi password on a billboard on the highway. Anyone inspecting browser DevTools can steal it.',
      detail:
        'Always check if code uses process.env on the backend server.ts or exposes VITE_ keys containing private service secrets.',
      actionableStep: 'Review the challenge code and click the vulnerable line to earn security XP.',
    },
  ],
  deploy: [
    {
      title: 'What Happens During 1-Click Container Deployment?',
      category: 'architecture',
      summary: 'Code is packaged into an isolated Linux OCI container and hosted on Google Cloud Run.',
      beginnerMetaphor:
        'Shipping a self-contained tiny computer in a sealed container that boots in 2 seconds anywhere in the world.',
      detail:
        'Cloud Run listens on Port 3000, runs your Express + Vite server bundle, and automatically routes incoming HTTPS traffic.',
    },
  ],
};

const ARCHITECTURE_FAQS = [
  {
    q: 'Why can’t my React app talk directly to Firestore or Gemini?',
    a: 'Security! If the browser talks directly with private API keys, any user can open DevTools and steal your credentials. An Express API route (/api/*) acts as a secure middleman.',
    icon: Shield,
    color: 'text-amber-400',
  },
  {
    q: 'What is the difference between Ingress Gateway and Microservices?',
    a: 'The Ingress Gateway is the front door (Port 3000) that verifies authentication and routes requests. Microservices are individual workers (like Gemini AI synthesis or PDF generation) doing heavy compute.',
    icon: Server,
    color: 'text-emerald-400',
  },
  {
    q: 'How does Google Drive sync work in this app?',
    a: 'It uses client-side Google Identity Services (GSI) to open a secure consent popup. The OAuth token is sent to the Drive v3 API to create and manage the /vibe-coding-site workspace folder.',
    icon: Globe,
    color: 'text-cyan-400',
  },
  {
    q: 'How do I turn a vague prompt into a 100% complete architecture?',
    a: 'Explicitly declare: 1) What UI views are needed, 2) Which /api/ endpoints handle data, 3) What database schema/collections are stored, and 4) What security checks apply.',
    icon: Terminal,
    color: 'text-purple-400',
  },
];

export const AITutorModal: React.FC<AITutorModalProps> = ({
  currentTab,
  track,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<'beginner' | 'expert'>('beginner');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [chatLog, setChatLog] = useState<
    Array<{ sender: 'user' | 'tutor'; text: string; time: string; metaphor?: string }>
  >([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const currentHints = TAB_CONTEXT_HINTS[currentTab] || TAB_CONTEXT_HINTS.playground;

  // Pulse animation for button when tab changes to draw gentle attention
  const [hasUnreadHint, setHasUnreadHint] = useState<boolean>(true);

  useEffect(() => {
    setHasUnreadHint(true);
  }, [currentTab]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnreadHint(false);
  };

  const handleAskTutor = (queryText?: string) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = [...chatLog, { sender: 'user' as const, text: q, time }];
    setChatLog(newLog);
    setUserQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = '';
      let responseMetaphor = '';

      const lower = q.toLowerCase();
      if (lower.includes('d3') || lower.includes('diagram') || lower.includes('node') || lower.includes('link')) {
        responseText =
          'In the D3 Architecture Diagram, nodes represent isolated runtime containers or services. Frontend sits on Tier 1 (Cyan), Express routes on Tier 2 (Green), Gemini on Tier 3 (Purple), and Firestore on Tier 4 (Blue). Connected lines with glowing dots show active protocol data highways.';
        responseMetaphor =
          'Think of the diagram as an electrical circuit: If a wire is missing (red dashed), the lightbulb (your app feature) won’t get power.';
      } else if (lower.includes('missing') || lower.includes('red') || lower.includes('status')) {
        responseText =
          'Red/dashed nodes occur when your prompt forgot to specify a persistence layer or backend contract. To fix it, add explicit requirements like "persist records in Firestore" to your prompt in the Playground.';
        responseMetaphor = 'Like ordering a car and forgetting to ask for an engine.';
      } else if (lower.includes('gateway') || lower.includes('express') || lower.includes('api')) {
        responseText =
          'The Express Ingress Gateway listens on port 3000, proxies requests to internal microservices, and hides secret API keys so malicious users cannot extract them in browser DevTools.';
        responseMetaphor = 'The security guard and receptionist at the entrance of a corporate building.';
      } else if (lower.includes('drive') || lower.includes('save') || lower.includes('sync')) {
        responseText =
          'Google Drive Sync hooks connect your browser directly to your personal Google Drive account using OAuth 2.0 tokens, storing generated architecture specs in the /vibe-coding-site folder.';
        responseMetaphor = 'A dedicated physical filing cabinet in your personal office.';
      } else {
        responseText = `Regarding "${q}": In the ${currentTab.toUpperCase()} context, the primary goal is creating clear boundaries between Client state, Server logic, and Persistent storage. Always ask yourself: Where does this data live? Who is authorized to change it?`;
        responseMetaphor =
          'Good system architecture is like clean room organization: every tool has a labeled drawer.';
      }

      setChatLog((prev) => [
        ...prev,
        {
          sender: 'tutor' as const,
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metaphor: mode === 'beginner' ? responseMetaphor : undefined,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* FLOATING CORNER TRIGGER BUTTON */}
      <div
        id="ai-tutor-floating-root"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group"
      >
        {!isOpen && hasUnreadHint && (
          <div
            onClick={handleOpen}
            className="cursor-pointer hidden sm:flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md text-cyan-300 border border-cyan-500/40 px-3 py-1.5 rounded-full text-xs font-mono shadow-xl shadow-cyan-950/40 animate-bounce duration-1000"
          >
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
            <span>Architecture Hint for {currentTab.toUpperCase()}</span>
          </div>
        )}

        <button
          id="ai-tutor-trigger-btn"
          onClick={() => (isOpen ? setIsOpen(false) : handleOpen())}
          className={`relative p-3.5 sm:px-4 sm:py-3.5 rounded-2xl sm:rounded-full font-mono text-xs font-bold transition-all shadow-2xl flex items-center gap-2.5 ${
            isOpen
              ? 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
              : 'bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 text-slate-950 hover:scale-105 active:scale-95 shadow-cyan-500/30'
          }`}
          title="AI Architecture Tutor & Diagram Explainer"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <div className="relative">
                <Bot className="w-5 h-5 fill-slate-950" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
              </div>
              <span className="hidden sm:inline font-bold tracking-tight">AI TUTOR</span>
              <span className="hidden md:inline text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono uppercase">
                {currentTab}
              </span>
            </>
          )}
        </button>
      </div>

      {/* EXPANDED AI TUTOR DRAWER / MODAL */}
      {isOpen && (
        <div
          id="ai-tutor-drawer"
          className="fixed bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[460px] max-h-[82vh] bg-slate-900 border border-cyan-500/40 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans"
        >
          {/* Top Tutor Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-mono">Vibe Architecture Tutor</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Live Guidance for <span className="text-cyan-400 font-bold">{currentTab.toUpperCase()}</span> tab
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Beginner / Senior toggle */}
              <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setMode('beginner')}
                  className={`px-2 py-0.5 rounded-lg transition font-semibold ${
                    mode === 'beginner' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Plain English Metaphors"
                >
                  Beginner
                </button>
                <button
                  onClick={() => setMode('expert')}
                  className={`px-2 py-0.5 rounded-lg transition font-semibold ${
                    mode === 'expert' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Technical Deep Dives"
                >
                  Technical
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Tutor Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Section 1: Real-time Contextual Hints for Current Tab */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  Real-Time Contextual Hints
                </span>
                <span>Active: {currentTab}</span>
              </div>

              {currentHints.map((hint, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/90 border border-slate-800 hover:border-cyan-500/30 rounded-2xl p-3.5 space-y-2 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white font-mono text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      {hint.title}
                    </h4>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-800 uppercase">
                      {hint.category}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">{hint.summary}</p>

                  {/* Metaphor Pill (Beginner mode) */}
                  {mode === 'beginner' && hint.beginnerMetaphor && (
                    <div className="p-2.5 bg-cyan-950/30 border border-cyan-800/50 rounded-xl text-cyan-200 text-[11px] leading-snug">
                      <span className="font-bold text-cyan-300 block mb-0.5 font-mono">
                        💡 Beginner Metaphor:
                      </span>
                      {hint.beginnerMetaphor}
                    </div>
                  )}

                  {/* Technical Detail (Technical mode or expanded) */}
                  {mode === 'expert' && (
                    <p className="text-slate-400 text-[11px] font-mono leading-relaxed whitespace-pre-line bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      {hint.detail}
                    </p>
                  )}

                  {/* Actionable button if present */}
                  {hint.actionableStep && (
                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                      <span>✓ {hint.actionableStep}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Section 2: Beginner Architecture Cheat Sheet & FAQs */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Architecture Diagram Explainer Q&A</span>
              </div>

              <div className="space-y-2">
                {ARCHITECTURE_FAQS.map((faq, idx) => {
                  const isExpanded = activeFaqIndex === idx;
                  const Icon = faq.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden transition"
                    >
                      <button
                        onClick={() => setActiveFaqIndex(isExpanded ? null : idx)}
                        className="w-full p-2.5 text-left flex items-center justify-between gap-2 hover:bg-slate-900/60 transition text-xs font-semibold text-slate-200"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${faq.color}`} />
                          <span className="line-clamp-1">{faq.q}</span>
                        </div>
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                            isExpanded ? 'rotate-90 text-cyan-400' : ''
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="p-3 pt-1 border-t border-slate-900 text-[11px] text-slate-300 leading-relaxed bg-slate-900/30 font-sans">
                          {faq.a}
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => handleAskTutor(`Explain more about: ${faq.q}`)}
                              className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                            >
                              <span>Ask for deeper example</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Interactive Chat Log */}
            {chatLog.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-slate-800 font-sans">
                <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive Tutor Conversation</span>
                </div>

                <div className="space-y-2">
                  {chatLog.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.sender === 'user'
                          ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-800/40 ml-4'
                          : 'bg-slate-950 text-slate-200 border border-slate-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                        <span className="font-bold">{msg.sender === 'user' ? 'YOU' : 'AI TUTOR'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                      {msg.metaphor && (
                        <div className="mt-2 p-2 bg-cyan-950/50 rounded-xl text-cyan-300 text-[11px]">
                          💡 <span className="font-semibold">Metaphor:</span> {msg.metaphor}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-mono text-[11px]">Tutor is analyzing architecture...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Ask Suggestion Chips */}
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
            <span className="text-slate-500 uppercase font-bold shrink-0">Ask:</span>
            <button
              onClick={() => handleAskTutor('How do I read the D3 graph?')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg border border-slate-800 shrink-0"
            >
              How do I read the D3 graph?
            </button>
            <button
              onClick={() => handleAskTutor('What makes a node red?')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg border border-slate-800 shrink-0"
            >
              What makes a node red?
            </button>
            <button
              onClick={() => handleAskTutor('Why use Express API routes?')}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-300 rounded-lg border border-slate-800 shrink-0"
            >
              Why use Express routes?
            </button>
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              id="ai-tutor-input"
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskTutor();
              }}
              placeholder={`Ask anything about ${currentTab} architecture...`}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              id="ai-tutor-send-btn"
              onClick={() => handleAskTutor()}
              disabled={!userQuery.trim() || isTyping}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 rounded-xl transition font-bold"
              title="Send to AI Tutor"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
