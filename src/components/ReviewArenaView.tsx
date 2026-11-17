import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Send,
  Check,
  XCircle,
  HelpCircle,
  Award,
} from 'lucide-react';
import { HallucinationChallenge } from '../types';
import { HALLUCINATION_CHALLENGES } from '../data/learningContent';
import { reviewHallucinationSubmission } from '../services/geminiService';
import { fireMilestoneConfetti } from '../utils/confetti';

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
        fireMilestoneConfetti(0.5, 0.55);
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
    <div id="review-arena-view" className="w-full">
      {/* Header Band */}
      <section className="swiss-grid swiss-grid--flush-top items-end">
        <div className="main space-y-2">
          <div className="eyebrow font-mono">Code Review Arena • Spot the Hallucination</div>
          <h1>Prompt Remediation &amp; Code Audit</h1>
          <p className="lead max-w-2xl">
            AI agents routinely generate flawed, unauthenticated, or resource-draining code. Master the exact follow-up prompts needed to repair the architectural defect.
          </p>
        </div>

        <div className="aside flex items-center justify-start md:justify-end">
          <div className="flex items-center gap-3 bg-[var(--gray)] p-4 border border-[var(--black)] font-mono tabular-nums">
            <Award className="w-5 h-5 text-[var(--red)] shrink-0" />
            <div>
              <div className="text-[10px] uppercase text-[var(--text-muted)]">Challenges Solved</div>
              <div className="text-base font-bold text-[var(--black)]">
                {completedChallengeIds.length} / {HALLUCINATION_CHALLENGES.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Arena */}
      <section className="swiss-grid">
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Challenge Selector & Flawed Code */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[var(--gray)] border border-[var(--black)] p-4 space-y-3">
              <div className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Select Audit Challenge
              </div>
              <div className="space-y-2">
                {HALLUCINATION_CHALLENGES.map((chal, idx) => {
                  const isSelected = selectedChallenge.id === chal.id;
                  const isDone = completedChallengeIds.includes(chal.id);

                  return (
                    <button
                      key={chal.id}
                      id={`chal-item-${chal.id}`}
                      type="button"
                      onClick={() => handleSelectChallenge(chal)}
                      className={`w-full p-3 border text-left text-xs transition-colors flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                          : 'bg-[var(--white)] text-[var(--black)] border-[var(--rule)] hover:border-[var(--black)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isDone ? (
                          <Check className="w-4 h-4 text-[var(--red)] shrink-0" />
                        ) : (
                          <span className="w-5 h-5 border border-current flex items-center justify-center text-[10px] font-mono shrink-0">
                            0{idx + 1}
                          </span>
                        )}
                        <span className="font-semibold truncate">{chal.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums">
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-[#EF4444]' : 'text-[var(--red)]'}`}>
                          +{chal.xpReward} XP
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 border border-current opacity-80">
                          {chal.difficulty}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vulnerable Code Inspector */}
            <div className="bg-[var(--white)] border border-[var(--black)] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[var(--red)]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--red)]">
                    Flawed AI Generation
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--red)] text-white font-semibold uppercase">
                  {selectedChallenge.category}
                </span>
              </div>

              <p className="text-xs text-[var(--black)] leading-relaxed">
                {selectedChallenge.codeContext}
              </p>

              <pre className="p-4 bg-[#000000] text-[#FFFFFF] border border-[var(--black)] text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
                <code>{selectedChallenge.flawedCode}</code>
              </pre>

              <div className="p-3.5 bg-[var(--gray)] border border-[var(--rule)] text-xs space-y-1">
                <div className="text-[10px] font-mono uppercase font-bold text-[var(--red)]">
                  Vulnerability Root Cause
                </div>
                <p className="text-[var(--black)] text-[11px] leading-relaxed">
                  {selectedChallenge.flawExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Remediation Prompt Editor & Grader */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-[var(--white)] border border-[var(--black)] p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--black)]" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                    Write Remediation Prompt
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-mono font-semibold text-[var(--red)] hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
                </button>
              </div>

              {showHint && (
                <div className="p-3.5 bg-[var(--gray)] border border-[var(--black)] text-xs space-y-1.5">
                  <div className="font-mono font-bold text-[var(--red)] text-[10px] uppercase">
                    Architectural Hint
                  </div>
                  <ul className="list-disc list-inside text-[var(--black)] text-xs space-y-1">
                    {selectedChallenge.hints.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="review-user-prompt-input"
                  className="text-[11px] font-mono font-bold text-[var(--black)] uppercase tracking-wider block"
                >
                  Follow-up Prompt to AI Agent
                </label>
                <textarea
                  id="review-user-prompt-input"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  rows={5}
                  placeholder="Instruct the AI model on how to remediate the vulnerability, specifying server routes, parameters, or bounds..."
                  className="w-full bg-[var(--gray)] border border-[var(--black)] p-4 text-xs font-mono text-[var(--black)] leading-relaxed resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
                  Award: +{selectedChallenge.xpReward} XP upon resolution
                </span>

                <button
                  id="submit-review-prompt-btn"
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={isEvaluating || !userPrompt.trim()}
                  className="button"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEvaluating ? 'Auditing Prompt...' : 'Submit Remediation Prompt'}</span>
                </button>
              </div>
            </div>

            {evaluationResult && (
              <div
                className={`bg-[var(--white)] border-2 p-5 space-y-4 ${
                  evaluationResult.isResolved ? 'border-[var(--black)]' : 'border-[var(--red)]'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
                  <div className="flex items-center gap-2">
                    {evaluationResult.isResolved ? (
                      <Check className="w-5 h-5 text-[var(--black)]" />
                    ) : (
                      <XCircle className="w-5 h-5 text-[var(--red)]" />
                    )}
                    <span className="text-sm font-bold text-[var(--black)]">
                      Evaluation: {evaluationResult.grade}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 tabular-nums ${
                      evaluationResult.isResolved
                        ? 'bg-[var(--black)] text-[var(--white)]'
                        : 'bg-[var(--red)] text-white'
                    }`}
                  >
                    {evaluationResult.score}/100
                  </span>
                </div>

                <p className="text-xs text-[var(--black)] leading-relaxed">
                  {evaluationResult.feedback}
                </p>

                {evaluationResult.remediatedCode && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase font-bold text-[var(--black)]">
                      Secure Architecture Output
                    </div>
                    <pre className="p-3.5 bg-[#000000] text-[#FFFFFF] border border-[var(--black)] text-xs font-mono overflow-x-auto max-h-56">
                      <code>{evaluationResult.remediatedCode}</code>
                    </pre>
                  </div>
                )}

                <div className="p-3.5 bg-[var(--gray)] border border-[var(--rule)] text-xs space-y-1">
                  <div className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)]">
                    Software Architecture Takeaway
                  </div>
                  <p className="text-[var(--black)] text-[11px] leading-relaxed">
                    {evaluationResult.architecturalTakeaway}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
