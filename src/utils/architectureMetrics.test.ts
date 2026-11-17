import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLevelFromXP,
  calculateTrackProgressPercent,
  summarizeDailyTasks,
  evaluatePromptSpecificity,
} from './architectureMetrics';
import type { DailyTask } from '../types';

test('calculateLevelFromXP maps XP thresholds to levels', () => {
  assert.equal(calculateLevelFromXP(0), 1);
  assert.equal(calculateLevelFromXP(299), 1);
  assert.equal(calculateLevelFromXP(300), 2);
  assert.equal(calculateLevelFromXP(450), 2);
  assert.equal(calculateLevelFromXP(600), 3);
  assert.equal(calculateLevelFromXP(-50), 1);
});

test('calculateTrackProgressPercent computes completion accurately', () => {
  assert.equal(calculateTrackProgressPercent(['mod-1'], ['mod-1', 'mod-2', 'mod-3', 'mod-4']), 25);
  assert.equal(calculateTrackProgressPercent(['mod-1', 'mod-2'], ['mod-1', 'mod-2', 'mod-3', 'mod-4']), 50);
  assert.equal(calculateTrackProgressPercent(['other'], ['mod-1', 'mod-2']), 0);
  assert.equal(calculateTrackProgressPercent([], []), 0);
});

test('summarizeDailyTasks totals completed counts and points', () => {
  const tasks: DailyTask[] = [
    { id: 't1', title: 'Task 1', category: 'security', points: 75, completed: true, hint: 'h1' },
    { id: 't2', title: 'Task 2', category: 'architecture', points: 100, completed: false, hint: 'h2' },
    { id: 't3', title: 'Task 3', category: 'prompting', points: 50, completed: true, hint: 'h3' },
  ];
  const summary = summarizeDailyTasks(tasks);
  assert.equal(summary.completedCount, 2);
  assert.equal(summary.totalCount, 3);
  assert.equal(summary.percent, 67);
  assert.equal(summary.earnedPoints, 125);
  assert.equal(summary.totalPoints, 225);
});

test('evaluatePromptSpecificity distinguishes vague vs architect-grade prompts', () => {
  const vague = evaluatePromptSpecificity('make an app', 40);
  assert.equal(vague.quality, 'Vague & Ambiguous');
  assert.ok(vague.score < 50);

  const detailed = evaluatePromptSpecificity(
    'Build a task manager with OAuth login, PostgreSQL database, and secure /api/ routes.',
    90
  );
  assert.equal(detailed.quality, 'Architect-Grade');
  assert.equal(detailed.hasAuth, true);
  assert.equal(detailed.hasDatabase, true);
  assert.equal(detailed.isSecure, true);
  assert.ok(detailed.score >= 90);
});
