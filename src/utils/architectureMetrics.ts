import { DailyTask } from '../types';

export function calculateLevelFromXP(xp: number): number {
  const safeXP = Math.max(0, Math.floor(xp));
  return Math.floor(safeXP / 300) + 1;
}

export function calculateTrackProgressPercent(
  completedLessonIds: string[],
  trackModuleIds: string[]
): number {
  if (trackModuleIds.length === 0) return 0;
  const completedSet = new Set(completedLessonIds);
  const completedCount = trackModuleIds.filter((id) => completedSet.has(id)).length;
  return Math.round((completedCount / trackModuleIds.length) * 100);
}

export function summarizeDailyTasks(tasks: DailyTask[]): {
  completedCount: number;
  totalCount: number;
  percent: number;
  earnedPoints: number;
  totalPoints: number;
} {
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const earnedPoints = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.points, 0);
  const totalPoints = tasks.reduce((sum, t) => sum + t.points, 0);

  return {
    completedCount,
    totalCount,
    percent,
    earnedPoints,
    totalPoints,
  };
}

export function evaluatePromptSpecificity(prompt: string, securityLevel: number): {
  score: number;
  quality: 'Vague & Ambiguous' | 'Basic & Incomplete' | 'Intermediate' | 'Architect-Grade';
  hasAuth: boolean;
  hasDatabase: boolean;
  isSecure: boolean;
} {
  const words = prompt.toLowerCase();
  const hasAuth =
    words.includes('auth') ||
    words.includes('login') ||
    words.includes('oauth') ||
    words.includes('user');
  const hasDatabase =
    words.includes('data') ||
    words.includes('store') ||
    words.includes('save') ||
    words.includes('database') ||
    words.includes('firestore') ||
    words.includes('sql');
  const isSecure =
    words.includes('secure') ||
    words.includes('jwt') ||
    words.includes('validate') ||
    securityLevel > 70;
  const isVague =
    prompt.trim().length < 25 ||
    (!words.includes('database') &&
      !words.includes('auth') &&
      !words.includes('secure') &&
      !words.includes('api') &&
      !hasDatabase);

  const score = isVague
    ? Math.min(48, Math.max(25, prompt.trim().length * 2))
    : Math.min(
        95,
        60 + (hasAuth ? 12 : 0) + (hasDatabase ? 12 : 0) + (isSecure ? 12 : 0)
      );

  const quality =
    score < 50
      ? 'Vague & Ambiguous'
      : score < 75
      ? 'Basic & Incomplete'
      : score < 90
      ? 'Intermediate'
      : 'Architect-Grade';

  return { score, quality, hasAuth, hasDatabase, isSecure };
}
