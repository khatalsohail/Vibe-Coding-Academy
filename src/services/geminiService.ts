import { GeneratedSystemSpec, HallucinationChallenge } from '../types';

export interface GenerateCodeParams {
  prompt: string;
  contextBlocks?: string[];
  precisionLevel?: number;
  securityLevel?: number;
  techStack?: string;
}

export interface PromptDiffResponse {
  baseScore: number;
  refinedScore: number;
  scoreDiff: number;
  keyAdditions: string[];
  architecturalEvolution: string[];
  analysis: string;
}

export interface ReviewHallucinationResponse {
  isResolved: boolean;
  grade: 'Mastery' | 'Partial Credit' | 'Missed the Core Vulnerability';
  score: number;
  feedback: string;
  remediatedCode: string;
  architecturalTakeaway: string;
}

export interface ScaffoldGuardrailsResponse {
  questions: {
    dimension: string;
    question: string;
    options: string[];
  }[];
  suggestedPrompt: string;
}

export async function generateAIEngineCode(params: GenerateCodeParams): Promise<GeneratedSystemSpec> {
  const response = await fetch('/api/generate-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate application code');
  }

  return response.json();
}

export async function analyzePromptDiff(originalPrompt: string, refinedPrompt: string): Promise<PromptDiffResponse> {
  const response = await fetch('/api/analyze-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalPrompt, refinedPrompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze prompt evolution');
  }

  return response.json();
}

export async function reviewHallucinationSubmission(params: {
  challengeId: string;
  userPrompt: string;
  vulnerableCode: string;
  vulnerabilityType: string;
}): Promise<ReviewHallucinationResponse> {
  const response = await fetch('/api/review-hallucination', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to evaluate prompt remediation');
  }

  return response.json();
}

export async function scaffoldPromptGuardrails(rawIdea: string): Promise<ScaffoldGuardrailsResponse> {
  const response = await fetch('/api/scaffold-guardrails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawIdea }),
  });

  if (!response.ok) {
    throw new Error('Failed to scaffold architectural guardrails');
  }

  return response.json();
}
