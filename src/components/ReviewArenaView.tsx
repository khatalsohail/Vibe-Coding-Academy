import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Send,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Code2,
  ArrowRight,
  Award,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HallucinationChallenge } from '../types';
import { HALLUCINATION_CHALLENGES } from '../data/learningContent';
import { reviewHallucinationSubmission } from '../services/geminiService';

interface ReviewArenaViewProps {
  onAddXP: (xp: number) => void;
}

export const ReviewArenaView: React.FC<ReviewArenaViewProps> = ({ onAddXP }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<HallucinationChallenge>(HALLUCINATION_CHALLENGES[0]);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [completedChallengeIds, setCompletedChallengeIds] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleSubmitReview = async () => {
    if (!userPrompt.trim()) return;
    setIsEvaluating(true);
    try {
      const result = await reviewHallucinationSubmission({
        challengeId: selectedChallenge.id,
        userPrompt,
        vulnerableCode: selectedChallenge.flawedCode,
        vulnerabilityType: selectedChallenge.category,
      });

      setEvaluationResult(result);

      if (result.isResolved) {
        if (!completedChallengeIds.includes(selectedChallenge.id)) {
          setCompletedChallengeIds([...completedChallengeIds, selectedChallenge.id]);
          onAddXP(selectedChallenge.xpReward);
        }
        // Launch confetti celebratory burst
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSelectChallenge = (chal: HallucinationChallenge) => {
    setSelectedChallenge(chal);
    setUserPrompt('');
    setEvaluationResult(null);
    setShowHint(false);
  };

  return (
    <div id="review-arena-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800/80">
              LeetCode-Style Code Review Arena
            </span>
            <span className="text-xs text-slate-400 font-mono">Spot the AI Hallucination & Security Flaw</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Prompt Remediation & Code Audit Arena
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            AI agents routinely generate flawed, unauthenticated, or resource-draining code. Master the exact follow-up
            prompts needed to guide the AI to repair the architectural defect.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <Award className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <div className="text-slate-400">Challenges Solved</div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              {completedChallengeIds.length} / {HALLUCINATION_CHALLENGES.length}
            </div>
          </div>
        </div>
      </div>

      {/* Arena 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Challenge Selector & Vulnerable Code (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Challenge Selector Pills */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Challenge</div>
            <div className="space-y-1.5">
              {HALLUCINATION_CHALLENGES.map((chal, idx) => {
                const isSelected = selectedChallenge.id === chal.id;
                const isDone = completedChallengeIds.includes(chal.id);

                return (
                  <button
                    key={chal.id}
                    id={`chal-item-${chal.id}`}
                    onClick={() => handleSelectChallenge(chal)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500/80 text-white shadow'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono text-slate-400">
                          {idx + 1}
                        </div>
                      )}
                      <span className="font-semibold truncate">{chal.title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-amber-400 font-bold">+{chal.xpReward} XP</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {chal.difficulty}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vulnerable Code Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Flawed AI Generation
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-900">
                {selectedChallenge.category}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{selectedChallenge.codeContext}</p>

            <div className="space-y-1">
              <pre className="p-3.5 bg-slate-950 rounded-xl border border-rose-900/40 text-xs font-mono text-rose-200 overflow-x-auto max-h-72 leading-relaxed">
                <code>{selectedChallenge.flawedCode}</code>
              </pre>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-amber-400">Vulnerability Root Cause</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{selectedChallenge.flawExplanation}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Prompt Remediation Editor & Result (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Prompt Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Write Remediation Prompt
                </span>
              </div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            </div>

            {showHint && (
              <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-800/60 text-xs space-y-1 animate-in fade-in">
                <div className="font-bold text-amber-300">Architectural Hint:</div>
                <ul className="list-disc list-inside text-amber-200/90 text-[11px] space-y-0.5">
                  {selectedChallenge.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Follow-up Prompt to AI Agent:
              </label>
              <textarea
                id="review-user-prompt-input"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                rows={4}
                placeholder="Instruct the AI model on how to remediate the vulnerability, specifying server routes, parameters, or bounds..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-4 text-xs font-mono text-slate-100 outline-none leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500 font-mono">
                Award: +{selectedChallenge.xpReward} XP upon resolution
              </span>

              <button
                id="submit-review-prompt-btn"
                onClick={handleSubmitReview}
                disabled={isEvaluating || !userPrompt.trim()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                {isEvaluating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Auditing Prompt...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Remediation Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-time Grader & Evaluator Result */}
          {evaluationResult && (
            <div
              className={`bg-slate-900 border rounded-3xl p-5 space-y-4 shadow-xl animate-in zoom-in-95 ${
                evaluationResult.isResolved ? 'border-emerald-500/80' : 'border-rose-800'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {evaluationResult.isResolved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                  <span className="text-sm font-bold text-white">Evaluation: {evaluationResult.grade}</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">{evaluationResult.score}/100</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{evaluationResult.feedback}</p>

              {/* Remediated Code Comparison */}
              {evaluationResult.remediatedCode && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-emerald-400">Secure Architecture Output</div>
                  <pre className="p-3.5 bg-slate-950 rounded-xl border border-emerald-900/40 text-xs font-mono text-emerald-300 overflow-x-auto max-h-56">
                    <code>{evaluationResult.remediatedCode}</code>
                  </pre>
                </div>
              )}

              {/* Key Takeaway */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Software Architecture Takeaway</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {evaluationResult.architecturalTakeaway}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
