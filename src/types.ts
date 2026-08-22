export type LearningTrack = 'cs_major' | 'non_tech_founder' | 'ai_architect';

export type ConceptCategory = 'ui' | 'ingress' | 'auth' | 'ai' | 'database' | 'security' | 'deployment';

export interface RoadmapNode {
  id: string;
  title: string;
  category: ConceptCategory;
  tierLevel: number;
  tierName: string;
  shortDesc: string;
  fullExplanation: string;
  beginnerMetaphor: string;
  architectureRole: string;
  xpReward: number;
  status: 'completed' | 'unlocked' | 'locked';
  prerequisites: string[];
  iconName: string;
  x: number;
  y: number;
  actionTab?: 'playground' | 'context' | 'review' | 'deploy';
  actionPrompt?: string;
  keySkills: string[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'architecture' | 'security' | 'prompting' | 'deployment' | 'persistence';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  iconName: string;
  description: string;
  criteria: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress: {
    current: number;
    max: number;
    unit: string;
  };
}

export interface DailyTask {
  id: string;
  title: string;
  category: 'architecture' | 'prompting' | 'security' | 'deployment';
  points: number;
  completed: boolean;
  actionTab?: 'playground' | 'context' | 'review' | 'deploy';
  hint: string;
}

export interface LearningMilestone {
  id: string;
  title: string;
  requiredModuleCount: number;
  xpReward: number;
  badgeName: string;
  unlocked: boolean;
}

export interface UserProgress {
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessons: string[];
  track: LearningTrack;
  challengesCompleted: number;
  promptsRefined: number;
  driveSyncEnabled: boolean;
  lastDriveSyncTime?: string;
  dailyTasks?: DailyTask[];
  unlockedBadgeIds?: string[];
}

export interface TelemetryMetrics {
  promptPrecisionScore: number; // 0 - 100
  architecturalClarityIndex: number; // 0 - 100
  tokenEfficiencyScore: number; // 0 - 100
  codeReviewSuccessRate: number; // 0 - 100
  hallucinationCatchRate: number; // 0 - 100
  totalGenerations: number;
  weeklyTrend: { day: string; score: number; prompts: number }[];
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'client' | 'gateway' | 'service' | 'database' | 'auth' | 'cache' | 'external';
  description: string;
  status: 'active' | 'missing' | 'insecure' | 'optimal';
  technologies: string[];
  subComponents?: string[];
}

export interface ArchitectureLink {
  source: string;
  target: string;
  protocol: string; // 'HTTP/REST', 'WebSocket', 'gRPC', 'SQL', 'JWT'
  description?: string;
}

export interface GeneratedSystemSpec {
  title: string;
  summary: string;
  intentQuality: 'Vague & Ambiguous' | 'Basic & Incomplete' | 'Intermediate' | 'Architect-Grade';
  score: number; // 0 - 100
  codeSnippet: string;
  htmlPreview: string;
  componentTree: {
    name: string;
    type: 'layout' | 'component' | 'hook' | 'service';
    children?: string[];
    description: string;
  }[];
  architectureNodes: ArchitectureNode[];
  architectureLinks: ArchitectureLink[];
  guardrailInsights: string[];
  potentialFlaws: string[];
  suggestedPromptFollowup: string;
}

export interface PromptDiffRecord {
  id: string;
  timestamp: string;
  originalPrompt: string;
  refinedPrompt: string;
  addedContexts: string[];
  scoreDiff: number;
  architecturalAdditions: string[];
}

export interface ContextBlock {
  id: string;
  category: 'role' | 'tech_stack' | 'state_db' | 'security' | 'constraint' | 'output_format';
  title: string;
  description: string;
  instructionText: string;
  badgeColor: string;
  iconName: string;
}

export interface HallucinationChallenge {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Security Vulnerability' | 'Infinite State Loop' | 'Leaked Secrets' | 'Race Condition' | 'Missing Auth Guard';
  vulnerabilityType?: string;
  flawedCode: string;
  flawExplanation: string;
  codeContext: string;
  expectedResolution: string;
  sampleWinningPrompts: string[];
  hints: string[];
  xpReward: number;
}

export interface DriveSyncedFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  updatedAt: string;
  contentSnippet: string;
  isFolder?: boolean;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  stage: 'Initiated' | 'Compiling' | 'Containerizing' | 'HealthCheck' | 'Deployed' | 'Failed';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface DeploymentProject {
  id: string;
  name: string;
  status: 'Ready' | 'Building' | 'Live' | 'Failed';
  subdomain: string;
  liveUrl: string;
  region: string;
  memory: string;
  cpu: string;
  environmentVariables: { key: string; value: string }[];
  deployedAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  created_at: string;
  avatar?: string;
  role?: 'student' | 'educator' | 'admin';
  provider?: 'password' | 'google';
  last_login?: string;
  stats?: {
    xp: number;
    level: number;
    challengesResolved: number;
  };
}

export interface AuthSession {
  user: UserAccount | null;
  token: string | null;
  isAuthenticated: boolean;
  expiresAt?: string;
}

export interface ReviewPhaseTestResult {
  testId: 'bad_data' | 'refresh' | 'bounce';
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  log: string[];
  timestamp?: string;
}

export type ThemeMode = 'dark' | 'light';

export interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  isLight: boolean;
}
