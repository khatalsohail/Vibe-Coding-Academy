import React, { useState } from 'react';
import {
  Bot,
  X,
  ChevronRight,
  Shield,
  Terminal,
  Globe,
  Server,
  ArrowRight,
  BookOpen,
  Send,
  MessageSquare,
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
}

const TAB_CONTEXT_HINTS: Record<string, ContextualHint[]> = {
  dashboard: [
    {
      title: 'Deciphering the 4-Tier Architecture',
      category: 'architecture',
      summary: 'Modern full-stack apps divide responsibilities into 4 distinct layers.',
      beginnerMetaphor:
        'Think of a restaurant: The Frontend is the Dining Room (UI), the Ingress Gateway is the Host, the Services Tier is the Kitchen Chef (Gemini AI), and the Database is the Pantry (Firestore).',
      detail:
        'Each node in our diagrams belongs to Tier 1 (Client UI), Tier 2 (Ingress & Auth), Tier 3 (Microservices & Intelligence), or Tier 4 (Persistence & Storage). Never skip Tier 2 to ensure client-side safety.',
    },
    {
      title: 'The "Vibe Coding" Telemetry Formula',
      category: 'vibe_tip',
      summary: 'Prompting is directing architectural topology rather than typing boilerplate.',
      beginnerMetaphor:
        'Like giving blueprints to an architect rather than laying individual bricks yourself.',
      detail:
        'When you define explicit constraints (Role, DB schema, API routes), AI writes 95% fewer security vulnerabilities and generates deterministic apps.',
    },
  ],
  playground: [
    {
      title: 'Reading the D3 Node-Link Diagram',
      category: 'architecture',
      summary: 'Blocks represent services; edges represent communication protocols.',
      beginnerMetaphor:
        'A subway transit map: Each station is a microservice or database, and the tracks carry user data between tiers.',
      detail:
        'Tier 01 (Frontend): React 19 Client UI. Tier 02 (Gateway): Express & OAuth routes. Tier 03 (Services): Gemini SDK. Tier 04 (Persistence): Firestore & Drive.',
      actionableStep: 'Click any node in the D3 diagram or switch between Tier Flow and Force layouts.',
    },
    {
      title: 'Why Nodes Turn Red (Missing or Insecure)',
      category: 'security',
      summary: 'Your prompt determines the health of the generated system architecture.',
      beginnerMetaphor:
        'Ordering a house without asking for doors or locks builds an open frame. Specifying auth adds deadbolts.',
      detail:
        'Red dashed borders indicate missing persistence or omitted layers. Solid red indicates insecure boundaries such as client-exposed secrets.',
      actionableStep: 'Add explicit clauses like "store user records via server /api/ routes" into your prompt.',
    },
  ],
  context: [
    {
      title: 'Preventing Hallucinations with Guardrail Blocks',
      category: 'vibe_tip',
      summary: 'Constraints lock the AI model into a strict system contract.',
      beginnerMetaphor:
        'Like guardrails on a bowling alley: regardless of input phrasing, the output stays inside stack bounds.',
      detail:
        'Locking the Role, Framework, and Persistence layer prevents fabricated libraries.',
      actionableStep: 'Dock modular blocks from the left library to compile your system prompt.',
    },
  ],
  review: [
    {
      title: 'Spotting Exposed Secrets',
      category: 'security',
      summary: 'Unconstrained generation often places secret API keys inside client components.',
      beginnerMetaphor:
        'Writing your Wi-Fi password on a billboard: anyone inspecting DevTools can read it.',
      detail:
        'Verify that secrets reside in server-side process.env and route requests through /api/ proxies.',
      actionableStep: 'Write a remediation prompt that enforces server-side environment variables.',
    },
  ],
  deploy: [
    {
      title: '1-Click Container Deployment',
      category: 'architecture',
      summary: 'Code is packaged into an isolated container and hosted on Cloud Run.',
      beginnerMetaphor:
        'Shipping a sealed, reproducible runtime unit that boots identically in any region.',
      detail:
        'Cloud Run listens on Port 3000, runs your Express + Vite server bundle, and routes HTTPS traffic.',
    },
  ],
};

const ARCHITECTURE_FAQS = [
  {
    q: 'Why must React proxy through Express instead of calling secrets directly?',
    a: 'If the browser holds private API keys, any user can extract them from DevTools. Express /api/* routes act as a secure server boundary.',
    icon: Shield,
  },
  {
    q: 'What separates the Ingress Gateway from Microservices?',
    a: 'The Ingress Gateway (Port 3000) verifies authentication and routes requests; microservices execute compute-heavy logic such as AI synthesis.',
    icon: Server,
  },
  {
    q: 'How does Google Drive sync operate?',
    a: 'Client-side OAuth tokens authorize Drive v3 API requests scoped exclusively to the /vibe-coding-site workspace folder.',
    icon: Globe,
  },
  {
    q: 'How do I turn a vague prompt into a complete architecture?',
    a: 'Declare UI views, /api/ endpoints, database collections, and authentication boundaries explicitly.',
    icon: Terminal,
  },
];

export const AITutorModal: React.FC<AITutorModalProps> = ({ currentTab }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<'beginner' | 'expert'>('beginner');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [chatLog, setChatLog] = useState<
    Array<{ sender: 'user' | 'tutor'; text: string; time: string; metaphor?: string }>
  >([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const currentHints = TAB_CONTEXT_HINTS[currentTab] || TAB_CONTEXT_HINTS.playground;

  const handleAskTutor = (queryText?: string) => {
    const q = queryText || userQuery;
    if (!q.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog((prev) => [...prev, { sender: 'user', text: q, time }]);
    setUserQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = '';
      let responseMetaphor = '';

      const lower = q.toLowerCase();
      if (lower.includes('d3') || lower.includes('diagram') || lower.includes('node') || lower.includes('link')) {
        responseText =
          'In the D3 Architecture Diagram, nodes represent runtime tiers: Tier 01 Frontend Client, Tier 02 Express Ingress & OAuth, Tier 03 Gemini Services, and Tier 04 Persistence.';
        responseMetaphor =
          'Think of the diagram as an electrical circuit: missing edges mean unpowered features.';
      } else if (lower.includes('missing') || lower.includes('red') || lower.includes('status')) {
        responseText =
          'Red borders appear when your prompt omits persistence or introduces an insecure secret boundary. Add explicit database and /api/ proxy constraints.';
        responseMetaphor = 'Like ordering a vehicle without specifying an engine.';
      } else if (lower.includes('gateway') || lower.includes('express') || lower.includes('api')) {
        responseText =
          'The Express Ingress Gateway listens on port 3000, validates requests, and keeps private credentials off the client bundle.';
        responseMetaphor = 'The security desk at the entrance of a building.';
      } else {
        responseText = `In the ${currentTab.toUpperCase()} workspace, enforce clear separation between Client state, Server API routes, and Persistent storage.`;
        responseMetaphor = 'Every tool in a labeled drawer.';
      }

      setChatLog((prev) => [
        ...prev,
        {
          sender: 'tutor',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metaphor: mode === 'beginner' ? responseMetaphor : undefined,
        },
      ]);
      setIsTyping(false);
    }, 350);
  };

  return (
    <>
      {/* BOTTOM-DOCKED CORNER TRIGGER */}
      <div id="ai-tutor-floating-root" className="fixed bottom-0 right-4 sm:right-8 z-40">
        <button
          id="ai-tutor-trigger-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close Architecture Tutor' : 'Open Architecture Tutor'}
          className="button !border-b-0 !py-1.5 !px-3.5 !text-xs"
        >
          {isOpen ? (
            <>
              <X className="w-3.5 h-3.5" />
              <span>Close</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5" />
              <span className="font-mono">AI TUTOR</span>
              <span className="hidden md:inline text-[10px] font-mono uppercase opacity-75">
                [{currentTab}]
              </span>
            </>
          )}
        </button>
      </div>

      {/* EXPANDED TUTOR DRAWER */}
      {isOpen && (
        <div
          id="ai-tutor-drawer"
          role="dialog"
          aria-label="Vibe Architecture Tutor"
          className="fixed bottom-11 right-4 sm:right-8 w-[94vw] sm:w-[440px] max-h-[80vh] bg-[var(--white)] border-2 border-[var(--black)] z-50 flex flex-col overflow-hidden"
        >
          <div className="p-4 bg-[var(--white)] border-b border-[var(--black)] flex items-center justify-between gap-2">
            <div>
              <div className="eyebrow font-mono">Contextual Guidance</div>
              <h3 className="text-sm font-bold text-[var(--black)]">
                Vibe Architecture Tutor ({currentTab.toUpperCase()})
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center border border-[var(--black)] text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => setMode('beginner')}
                  className={`px-2 py-1 font-semibold transition-colors ${
                    mode === 'beginner'
                      ? 'bg-[var(--black)] text-[var(--white)]'
                      : 'bg-[var(--white)] text-[var(--black)] hover:bg-[var(--gray)]'
                  }`}
                >
                  Beginner
                </button>
                <button
                  type="button"
                  onClick={() => setMode('expert')}
                  className={`px-2 py-1 font-semibold border-l border-[var(--black)] transition-colors ${
                    mode === 'expert'
                      ? 'bg-[var(--black)] text-[var(--white)]'
                      : 'bg-[var(--white)] text-[var(--black)] hover:bg-[var(--gray)]'
                  }`}
                >
                  Technical
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize AI Tutor"
                className="p-1.5 border border-[var(--rule)] text-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            <div className="space-y-2.5">
              <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">
                Contextual Hints • {currentTab}
              </div>

              {currentHints.map((hint, idx) => (
                <div key={idx} className="bg-[var(--gray)] border border-[var(--rule)] p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-[var(--black)] text-xs">{hint.title}</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[var(--white)] text-[var(--red)] border border-[var(--rule)] uppercase shrink-0">
                      {hint.category}
                    </span>
                  </div>

                  <p className="text-[var(--black)] leading-relaxed">{hint.summary}</p>

                  {mode === 'beginner' && hint.beginnerMetaphor && (
                    <div className="p-2.5 bg-[var(--white)] border border-[var(--black)] text-[var(--black)] text-[11px] leading-snug">
                      <span className="font-mono font-bold text-[var(--red)] block mb-0.5 uppercase text-[10px]">
                        Metaphor
                      </span>
                      {hint.beginnerMetaphor}
                    </div>
                  )}

                  {mode === 'expert' && (
                    <p className="text-[var(--black)] text-[11px] font-mono leading-relaxed whitespace-pre-line bg-[var(--white)] p-2.5 border border-[var(--rule)]">
                      {hint.detail}
                    </p>
                  )}

                  {hint.actionableStep && (
                    <div className="text-[11px] font-mono text-[var(--red)] font-semibold">
                      &rarr; {hint.actionableStep}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-3 border-t border-[var(--rule)]">
              <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Architecture Q&amp;A</span>
              </div>

              <div className="space-y-1.5">
                {ARCHITECTURE_FAQS.map((faq, idx) => {
                  const isExpanded = activeFaqIndex === idx;
                  const Icon = faq.icon;
                  return (
                    <div key={idx} className="bg-[var(--white)] border border-[var(--rule)]">
                      <button
                        type="button"
                        onClick={() => setActiveFaqIndex(isExpanded ? null : idx)}
                        className="w-full p-2.5 text-left flex items-center justify-between gap-2 hover:bg-[var(--gray)] transition-colors text-xs font-semibold text-[var(--black)]"
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <Icon className="w-3.5 h-3.5 text-[var(--red)] shrink-0" />
                          <span className="truncate">{faq.q}</span>
                        </span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                            isExpanded ? 'rotate-90 text-[var(--red)]' : 'text-[var(--text-muted)]'
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="p-3 border-t border-[var(--rule)] text-[11px] text-[var(--black)] leading-relaxed bg-[var(--gray)]">
                          <p>{faq.a}</p>
                          <button
                            type="button"
                            onClick={() => handleAskTutor(`Explain more about: ${faq.q}`)}
                            className="mt-2 text-[10px] font-mono font-semibold text-[var(--red)] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Ask for deeper example</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {chatLog.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-[var(--rule)]">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Conversation</span>
                </div>

                <div className="space-y-2">
                  {chatLog.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 border text-xs space-y-1 ${
                        msg.sender === 'user'
                          ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)] ml-6'
                          : 'bg-[var(--gray)] text-[var(--black)] border-[var(--rule)] mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono opacity-75">
                        <span className="font-bold">{msg.sender === 'user' ? 'YOU' : 'TUTOR'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                      {msg.metaphor && (
                        <div className="mt-1.5 p-2 bg-[var(--white)] text-[var(--black)] border border-[var(--rule)] text-[11px]">
                          <strong>Metaphor:</strong> {msg.metaphor}
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="p-2.5 bg-[var(--gray)] border border-[var(--rule)] text-[11px] font-mono text-[var(--text-muted)]">
                      Analyzing architecture...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-[var(--gray)] border-t border-[var(--rule)] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
            <span className="text-[var(--text-muted)] uppercase font-bold shrink-0">Ask:</span>
            <button
              type="button"
              onClick={() => handleAskTutor('How do I read the D3 graph?')}
              className="px-2 py-1 bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] text-[var(--black)] border border-[var(--rule)] shrink-0 transition-colors"
            >
              Read D3 graph?
            </button>
            <button
              type="button"
              onClick={() => handleAskTutor('What makes a node red?')}
              className="px-2 py-1 bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] text-[var(--black)] border border-[var(--rule)] shrink-0 transition-colors"
            >
              Red nodes?
            </button>
            <button
              type="button"
              onClick={() => handleAskTutor('Why use Express API routes?')}
              className="px-2 py-1 bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] text-[var(--black)] border border-[var(--rule)] shrink-0 transition-colors"
            >
              Express proxy?
            </button>
          </div>

          <div className="p-3 bg-[var(--white)] border-t border-[var(--black)] flex items-center gap-2">
            <input
              id="ai-tutor-input"
              type="text"
              aria-label="Ask the Architecture Tutor a question"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskTutor();
              }}
              placeholder={`Ask about ${currentTab} architecture...`}
              className="flex-1 bg-[var(--gray)] border border-[var(--black)] px-3 py-2 text-xs text-[var(--black)] placeholder:text-[var(--text-muted)] font-mono"
            />
            <button
              id="ai-tutor-send-btn"
              type="button"
              onClick={() => handleAskTutor()}
              disabled={!userQuery.trim() || isTyping}
              aria-label="Send question to Architecture Tutor"
              className="button !p-2.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
