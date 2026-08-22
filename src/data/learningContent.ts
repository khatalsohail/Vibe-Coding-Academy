import { ContextBlock, HallucinationChallenge, LearningTrack } from '../types';

export interface TrackInfo {
  id: LearningTrack;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  focus: string;
  modules: {
    id: string;
    title: string;
    description: string;
    xp: number;
    difficulty: 'Intro' | 'Core' | 'Advanced';
    category: 'architecture' | 'security' | 'prompting' | 'deployment';
  }[];
}

export const LEARNING_TRACKS: Record<LearningTrack, TrackInfo> = {
  cs_major: {
    id: 'cs_major',
    title: 'The CS Major Track',
    subtitle: 'From Syntax to System Architecture & Deterministic State',
    icon: 'GraduationCap',
    color: 'emerald',
    focus: 'Concurrency, Data Structures, DB Normalization, Distributed Systems',
    modules: [
      {
        id: 'mod-cs-1',
        title: 'Intent to Architecture: Deconstructing Natural Language',
        description: 'Learn how to translate user stories into strict microservice boundaries and state machines.',
        xp: 150,
        difficulty: 'Intro',
        category: 'architecture',
      },
      {
        id: 'mod-cs-2',
        title: 'Defensive Prompting: Preventing Race Conditions & Leaks',
        description: 'Force AI models to implement transactional isolation levels and idempotency keys.',
        xp: 200,
        difficulty: 'Core',
        category: 'security',
      },
      {
        id: 'mod-cs-3',
        title: 'Spot the Hallucination: Memory Leaks & Unbounded Renders',
        description: 'Audit AI-generated React hooks and Node streams for silent resource exhaustion.',
        xp: 300,
        difficulty: 'Advanced',
        category: 'security',
      },
      {
        id: 'mod-cs-4',
        title: 'Containerized Deployment & Production Ingress',
        description: 'Simulate orchestrating Docker containers, health checks, and Google Drive backups.',
        xp: 250,
        difficulty: 'Advanced',
        category: 'deployment',
      },
    ],
  },
  non_tech_founder: {
    id: 'non_tech_founder',
    title: 'The Non-Technical Founder Track',
    subtitle: 'Building Enterprise MVPs Without Writing a Single Semicolon',
    icon: 'Briefcase',
    color: 'indigo',
    focus: 'Product Scoping, Auth Flows, Stripe Billing, Database Security',
    modules: [
      {
        id: 'mod-found-1',
        title: 'The Product Requirement Prompt Blueprint',
        description: 'Convert messy pitch deck ideas into crystal-clear engineering specifications.',
        xp: 120,
        difficulty: 'Intro',
        category: 'prompting',
      },
      {
        id: 'mod-found-2',
        title: 'Building Customer Auth & Stripe Subscriptions Safely',
        description: 'Prevent client-side secret exposure and build verified webhook payment listeners.',
        xp: 220,
        difficulty: 'Core',
        category: 'security',
      },
      {
        id: 'mod-found-3',
        title: 'Data Privacy & GDPR: Where Does Customer Data Live?',
        description: 'Choose between Firestore, SQL, and Google Drive for compliance and speed.',
        xp: 180,
        difficulty: 'Core',
        category: 'architecture',
      },
      {
        id: 'mod-found-4',
        title: '1-Click Go-Live: Domain, SSL, and Telemetry',
        description: 'Deploy live cloud instances and monitor user retention telemetry in real-time.',
        xp: 280,
        difficulty: 'Advanced',
        category: 'deployment',
      },
    ],
  },
  ai_architect: {
    id: 'ai_architect',
    title: 'The AI Systems Architect Track',
    subtitle: 'Mastering LLM Context Windows, Multi-Agent Swarms & RAG',
    icon: 'Cpu',
    color: 'violet',
    focus: 'Token Optimization, Multi-Agent Orchestration, Vector DBs, Guardrails',
    modules: [
      {
        id: 'mod-arch-1',
        title: 'Context Window Engineering & System Prompts',
        description: 'Construct modular Scratch-style context blocks to maximize LLM reasoning precision.',
        xp: 160,
        difficulty: 'Intro',
        category: 'prompting',
      },
      {
        id: 'mod-arch-2',
        title: 'Multi-Tier RAG & Semantic Caching Architectures',
        description: 'Diagram vector indexing, embeddings, and sub-millisecond retrieval layers.',
        xp: 260,
        difficulty: 'Core',
        category: 'architecture',
      },
      {
        id: 'mod-arch-3',
        title: 'Adversarial Prompt Injections & Jailbreak Defense',
        description: 'Build automated input sanitizers and model boundary guardrails.',
        xp: 320,
        difficulty: 'Advanced',
        category: 'security',
      },
    ],
  },
};

export const CONTEXT_BLOCKS_LIBRARY: ContextBlock[] = [
  // Roles
  {
    id: 'ctx-role-principal',
    category: 'role',
    title: 'Principal Systems Architect',
    description: 'Instructs AI to design for fault tolerance, high concurrency, and clean boundaries.',
    instructionText: 'Act as a Principal Systems Architect. Enforce modular separation of concerns, defensive typing, and comprehensive error handling.',
    badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
    iconName: 'Shield',
  },
  {
    id: 'ctx-role-secops',
    category: 'role',
    title: 'Senior SecOps Auditor',
    description: 'Ensures zero hardcoded secrets, input sanitization, and OWASP compliance.',
    instructionText: 'Act as a Senior SecOps Auditor. Strictly reject client-side secrets, unvalidated SQL/queries, and missing CORS protections.',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    iconName: 'Lock',
  },

  // Tech Stacks
  {
    id: 'ctx-stack-react-tailwind',
    category: 'tech_stack',
    title: 'React 19 + Tailwind CSS + Vite',
    description: 'Modern component-driven UI with responsive utility styling and zero build overhead.',
    instructionText: 'Tech Stack: Modern React 19 functional components with TypeScript, Tailwind CSS utility styling, and Lucide icons.',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-800',
    iconName: 'Layers',
  },
  {
    id: 'ctx-stack-express-node',
    category: 'tech_stack',
    title: 'Express.js Backend + Node Runtime',
    description: 'RESTful API gateway with JSON middleware and structured HTTP status codes.',
    instructionText: 'Backend: Express.js server on Node.js runtime, exposing secure /api/* endpoints with typed request validation.',
    badgeColor: 'bg-green-950 text-green-300 border-green-800',
    iconName: 'Server',
  },

  // State & Database
  {
    id: 'ctx-db-gdrive-sync',
    category: 'state_db',
    title: 'Google Drive Sync ("vibe-coding-site")',
    description: 'Persists telemetry, prompt diffs, and generated files to user Google Drive folder.',
    instructionText: 'Persistence: Integrate with Google Drive folder "vibe-coding-site" for durable document backup and telemetry tracking.',
    badgeColor: 'bg-blue-950 text-blue-300 border-blue-800',
    iconName: 'FolderSync',
  },
  {
    id: 'ctx-db-postgres-drizzle',
    category: 'state_db',
    title: 'PostgreSQL + Drizzle ORM',
    description: 'Type-safe relational schema with foreign keys and ACID transactions.',
    instructionText: 'Database: PostgreSQL relational schema managed via Drizzle ORM with strict foreign keys and prepared statements.',
    badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
    iconName: 'Database',
  },

  // Security & Guardrails
  {
    id: 'ctx-sec-zero-trust',
    category: 'security',
    title: 'Zero-Trust Client Boundary',
    description: 'All sensitive operations proxy through server routes; never trust browser inputs.',
    instructionText: 'Security Boundary: Treat all client payloads as untrusted. Validate with schema checkers (e.g. Zod) and verify auth headers on every mutation.',
    badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    iconName: 'ShieldAlert',
  },
  {
    id: 'ctx-sec-offline-first',
    category: 'security',
    title: 'Defensive Offline Recovery',
    description: 'Gracefully fall back when network disconnects with optimistic UI and retry queues.',
    instructionText: 'Resilience: Implement optimistic UI updates with automatic retry queues and non-blocking toast notifications during disconnects.',
    badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
    iconName: 'WifiOff',
  },

  // Constraints & Output Format
  {
    id: 'ctx-fmt-clean-single-screen',
    category: 'output_format',
    title: 'Focused Single-View Layout',
    description: 'Prevents unnecessary multi-tab bloat and keeps interaction immediate and clear.',
    instructionText: 'UI Constraint: Keep entire interface accessible in a cohesive, distraction-free view with clear visual hierarchy.',
    badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
    iconName: 'Layout',
  },
  {
    id: 'ctx-fmt-telemetry-ready',
    category: 'output_format',
    title: 'Real-Time Telemetry Logging',
    description: 'Logs user interactions and performance metrics into telemetry.json.',
    instructionText: 'Telemetry: Emit structured JSON execution events to telemetry stream for real-time dashboard analytics.',
    badgeColor: 'bg-violet-950 text-violet-300 border-violet-800',
    iconName: 'Activity',
  },
];

export const HALLUCINATION_CHALLENGES: HallucinationChallenge[] = [
  {
    id: 'chal-1',
    title: 'The Leaked Stripe Secret Key',
    difficulty: 'Beginner',
    category: 'Leaked Secrets',
    vulnerabilityType: 'Leaked Secrets',
    codeContext: 'A developer asked an AI to "Create a quick Stripe payment checkout button". The AI generated the following component:',
    flawedCode: `// ❌ Flawed AI-Generated Payment Button
import React from 'react';
import Stripe from 'stripe';

export function CheckoutButton({ amount }: { amount: number }) {
  // CRITICAL VULNERABILITY: Secret key embedded directly in client-side bundle!
  const stripe = new Stripe('sk_live_51M0...SECRET_KEY_EXPOSED_IN_BROWSER');

  const handlePay = async () => {
    const charge = await stripe.charges.create({
      amount: amount * 100,
      currency: 'usd',
      source: 'tok_visa',
    });
    alert('Payment successful: ' + charge.id);
  };

  return <button onClick={handlePay} className="btn-pay">Pay \${amount}</button>;
}`,
    flawExplanation: 'The AI initialized the private Stripe secret key (`sk_live_...`) directly in a client React component. Any user opening Browser DevTools can copy the secret key and drain your bank account or execute refunds.',
    expectedResolution: 'Move Stripe charges strictly to a backend `/api/checkout` route. Pass only the public publishable key or return a signed Stripe Checkout Session URL.',
    sampleWinningPrompts: [
      'Refactor this checkout component so the Stripe secret key remains strictly server-side in process.env. Create a POST /api/create-checkout-session endpoint and use client-side Stripe Elements.',
      'Fix security vulnerability: Move Stripe SDK initialization to an Express backend route and return a client session ID to prevent secret key leakage.',
    ],
    hints: [
      'Where does React code execute? In the user\'s browser!',
      'Secret API keys must never exist in files bundled with Vite/Webpack.',
      'Tell the AI to create a server proxy route like /api/create-payment-intent.',
    ],
    xpReward: 200,
  },
  {
    id: 'chal-2',
    title: 'The SQL Injection Doorway',
    difficulty: 'Intermediate',
    category: 'Security Vulnerability',
    vulnerabilityType: 'Security Vulnerability',
    codeContext: 'A student prompted an AI to "Add user search by username to our backend". The AI produced:',
    flawedCode: `// ❌ Flawed AI-Generated Search Endpoint
app.get('/api/users/search', async (req, res) => {
  const { username } = req.query;

  // CRITICAL VULNERABILITY: Raw string interpolation in database query!
  const query = "SELECT id, email, role, password_hash FROM users WHERE username = '" + username + "'";
  
  const result = await db.rawQuery(query);
  res.json({ users: result.rows });
});`,
    flawExplanation: 'String concatenating user input directly into SQL queries allows attackers to supply payloads like `\' OR \'1\'=\'1` or `\'; DROP TABLE users; --` to dump the entire database or delete tables.',
    expectedResolution: 'Use parameterized queries, prepared statements, or an ORM like Drizzle/Prisma to sanitize input and prevent SQL injection.',
    sampleWinningPrompts: [
      'Rewrite the search endpoint using parameterized SQL queries with placeholders ($1) and Drizzle ORM to prevent SQL injection vulnerabilities.',
      'Sanitize the username query parameter using prepared statements and exclude password_hash from the returned JSON payload.',
    ],
    hints: [
      'Never concatenate raw user strings into SQL queries.',
      'Instruct the AI to use parameterized bindings (`$1` or ORM `eq(users.username, query)`).',
      'Bonus: Notice how password_hash was also mistakenly leaked to the client!',
    ],
    xpReward: 250,
  },
  {
    id: 'chal-3',
    title: 'The Infinite Fetch Loop',
    difficulty: 'Beginner',
    category: 'Infinite State Loop',
    vulnerabilityType: 'Infinite State Loop',
    codeContext: 'A student asked an AI to "Fetch profile data on page load and update the component". The AI gave:',
    flawedCode: `// ❌ Flawed AI-Generated Data Fetcher
import React, { useState, useEffect } from 'react';

export function UserDashboard() {
  const [profile, setProfile] = useState<{ name: string; score: number } | null>(null);

  // CRITICAL VULNERABILITY: Missing dependency array causing infinite re-render loop!
  useEffect(() => {
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => setProfile(data));
  }); // <-- Notice no [] here!

  return <div>Welcome {profile?.name} (Score: {profile?.score})</div>;
}`,
    flawExplanation: 'Without a dependency array `[]`, `useEffect` executes after every single render. When `setProfile` triggers a re-render, `useEffect` runs again, causing an infinite HTTP request loop that DDoS-es your server and freezes the browser tab.',
    expectedResolution: 'Add a stable dependency array `[]` (or include primitive query IDs) to `useEffect`, and implement an AbortController for cleanup on unmount.',
    sampleWinningPrompts: [
      'Fix the infinite re-render loop by adding an empty dependency array to useEffect and add an AbortController for clean component unmounting.',
      'Add [] to useEffect to execute the profile fetch once on component mount, and include loading and error states.',
    ],
    hints: [
      'What happens when useEffect has no second argument?',
      'Every setProfile triggers a render -> which triggers useEffect -> infinite loop.',
    ],
    xpReward: 150,
  },
  {
    id: 'chal-4',
    title: 'Insecure Direct Object Reference (IDOR)',
    difficulty: 'Advanced',
    category: 'Missing Auth Guard',
    vulnerabilityType: 'Missing Auth Guard',
    codeContext: 'An AI was asked to "Let users download their medical lab PDF report by ID":',
    flawedCode: `// ❌ Flawed AI-Generated Report Endpoint
app.get('/api/reports/:reportId', async (req, res) => {
  const { reportId } = req.params;

  // CRITICAL VULNERABILITY: Fetches document without verifying caller identity or ownership!
  const report = await db.reports.findUnique({
    where: { id: reportId }
  });

  if (!report) return res.status(404).send('Report not found');
  res.sendFile(report.filePath);
});`,
    flawExplanation: 'The endpoint takes any `reportId` from the URL parameter and delivers the file without verifying if the authenticated user is the owner or doctor of that report. Any user can simply increment numbers in the URL to read everyone’s private files.',
    expectedResolution: 'Extract authenticated user identity from the verified session token (e.g. `req.user.id`) and ensure `where: { id: reportId, ownerId: req.user.id }`.',
    sampleWinningPrompts: [
      'Add authentication middleware to /api/reports/:reportId and verify that req.user.id matches report.ownerId or has medical admin role before returning the file.',
      'Prevent IDOR by requiring a verified JWT session and enforcing row-level access control on report ownership.',
    ],
    hints: [
      'Anyone can change reportId in the URL.',
      'You must extract the user ID from the authenticated session (not the request parameters) and check ownership in the database query.',
    ],
    xpReward: 350,
  },
];

export const INITIAL_DAILY_TASKS = [
  {
    id: 'task-1',
    title: 'Audit Insecure Prompt in Code Review Arena',
    category: 'security' as const,
    points: 75,
    completed: false,
    actionTab: 'review' as const,
    hint: 'Solve any security challenge in the Review Arena to catch AI hallucinated bugs.',
  },
  {
    id: 'task-2',
    title: 'Deconstruct Architecture in Playground',
    category: 'architecture' as const,
    points: 100,
    completed: false,
    actionTab: 'playground' as const,
    hint: 'Enter a prompt and generate an Intent-to-Architecture Node-Link map.',
  },
  {
    id: 'task-3',
    title: 'Assemble 3 Context Guardrail Blocks',
    category: 'prompting' as const,
    points: 50,
    completed: false,
    actionTab: 'context' as const,
    hint: 'Combine Role, Tech Stack, and Database constraints in the Context Builder.',
  },
  {
    id: 'task-4',
    title: 'Simulate 1-Click Cloud Run Deployment',
    category: 'deployment' as const,
    points: 125,
    completed: false,
    actionTab: 'deploy' as const,
    hint: 'Initiate a container build in the Deploy Sandbox.',
  },
];

export const LEARNING_MILESTONES = [
  {
    id: 'milestone-bronze',
    title: 'Architecture Apprentice',
    requiredModuleCount: 1,
    xpReward: 150,
    badgeName: 'Apprentice Node',
    unlocked: false,
  },
  {
    id: 'milestone-silver',
    title: 'Distributed Systems Adept',
    requiredModuleCount: 2,
    xpReward: 300,
    badgeName: 'Gateway Master',
    unlocked: false,
  },
  {
    id: 'milestone-gold',
    title: 'Full-Stack Vibe Architect',
    requiredModuleCount: 3,
    xpReward: 500,
    badgeName: 'Cloud Titan',
    unlocked: false,
  },
  {
    id: 'milestone-platinum',
    title: 'Zero-Trust Principal Engineer',
    requiredModuleCount: 4,
    xpReward: 1000,
    badgeName: 'Grandmaster Spec',
    unlocked: false,
  },
];

export const STARTER_PLAYGROUND_PROMPTS = [
  {
    title: 'SaaS Customer Onboarding with Google Drive Backup',
    prompt: 'Build a modern 3-step SaaS customer onboarding flow in React 19. It should capture company name and team size, securely validate inputs, persist user profile to the vibe-coding-site Google Drive folder, and display a real-time completion score.',
    stack: 'React + Tailwind + Google Drive Sync',
  },
  {
    title: 'Real-Time Telemetry & Prompt Precision Monitor',
    prompt: 'Create a developer telemetry dashboard with real-time prompt precision graphs, token efficiency gauges, and an interactive log inspector that synchronizes with telemetry.json in Google Drive.',
    stack: 'React + Chart Visualizer + Express API',
  },
  {
    title: 'Collaborative Kanban Task Engine with Role Guardrails',
    prompt: 'Design a drag-and-drop Kanban board with columns (Backlog, In Progress, Code Review, Deployed). Include role badges (Student, Mentor, Admin) and simulate server-side authorization checks for card deletion.',
    stack: 'React 19 + State Engine + Zero-Trust RBAC',
  },
  {
    title: 'Smart Hallucination Bug Hunter Playground',
    prompt: 'Build an interactive code review challenge where users analyze flawed code snippets, type natural language prompts to fix vulnerabilities, and earn XP with real-time confetti celebration.',
    stack: 'React + LeetCode Arena + Gemini AI Grader',
  },
];
