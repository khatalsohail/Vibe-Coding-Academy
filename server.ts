import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

import crypto from 'crypto';

app.use(express.json({ limit: '10mb' }));

// In-Memory & Persistent User Database
interface StoredUser {
  id: string;
  email: string;
  username: string;
  passwordHash?: string;
  salt?: string;
  created_at: string;
  avatar: string;
  role: 'student' | 'educator' | 'admin';
  provider: 'password' | 'google';
  last_login: string;
  stats: {
    xp: number;
    level: number;
    challengesResolved: number;
  };
}

// Pre-seeded Demo Students for instant testing
const userDatabase = new Map<string, StoredUser>();

function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Seed default accounts
const seedSalt = crypto.randomBytes(16).toString('hex');
const defaultUser: StoredUser = {
  id: 'usr_student_demo_01',
  email: 'student@vibecode.edu',
  username: 'Alex Chen',
  salt: seedSalt,
  passwordHash: hashPassword('password123', seedSalt),
  created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  role: 'student',
  provider: 'password',
  last_login: new Date().toISOString(),
  stats: {
    xp: 420,
    level: 2,
    challengesResolved: 3,
  },
};
userDatabase.set(defaultUser.email.toLowerCase(), defaultUser);

// Helper to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Auth API Endpoints

// 1. Register new user
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, username, password, role = 'student' } = req.body;

    // Bad Data Validation - Email missing '@' or malformed
    if (!email || typeof email !== 'string' || !email.includes('@') || !isValidEmail(email.trim())) {
      return res.status(400).json({
        error: 'Please enter a valid email address with an "@" symbol.',
        field: 'email',
      });
    }

    // Bad Data Validation - Password length < 6 characters
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.',
        field: 'password',
      });
    }

    // Bad Data Validation - Username required
    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return res.status(400).json({
        error: 'Username must be at least 2 characters long.',
        field: 'username',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Duplicate Check
    if (userDatabase.has(normalizedEmail)) {
      return res.status(409).json({
        error: 'An account with this email already exists. Please log in instead.',
        field: 'email',
      });
    }

    // Create user record with id, email, username, created_at
    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const createdAt = new Date().toISOString();

    const newUser: StoredUser = {
      id: userId,
      email: normalizedEmail,
      username: username.trim(),
      salt,
      passwordHash,
      created_at: createdAt,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`,
      role: role === 'educator' ? 'educator' : 'student',
      provider: 'password',
      last_login: createdAt,
      stats: {
        xp: 100,
        level: 1,
        challengesResolved: 0,
      },
    };

    userDatabase.set(normalizedEmail, newUser);

    const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
    const { passwordHash: _, salt: __, ...sanitizedUser } = newUser;

    console.log(`[AUTH] Registered new student: ${sanitizedUser.email} (ID: ${sanitizedUser.id})`);

    return res.status(201).json({
      message: 'Account created successfully!',
      user: sanitizedUser,
      token,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error?.message || 'Server failed to process registration.' });
  }
});

// 2. Login with email & password
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.includes('@') || !isValidEmail(email.trim())) {
      return res.status(400).json({
        error: 'Please enter a valid email address with an "@" symbol.',
        field: 'email',
      });
    }

    if (!password || password.length < 1) {
      return res.status(400).json({
        error: 'Password is required.',
        field: 'password',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = userDatabase.get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        error: 'No account found with this email address. Please check your spelling or sign up.',
        field: 'email',
      });
    }

    if (user.provider === 'google' && !user.passwordHash) {
      return res.status(400).json({
        error: 'This account was created with Google. Please use "Continue with Google" to sign in.',
        field: 'email',
      });
    }

    const calculatedHash = hashPassword(password, user.salt || '');
    if (calculatedHash !== user.passwordHash) {
      return res.status(401).json({
        error: 'Invalid password. Please verify your credentials and try again.',
        field: 'password',
      });
    }

    user.last_login = new Date().toISOString();
    const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
    const { passwordHash: _, salt: __, ...sanitizedUser } = user;

    console.log(`[AUTH] Logged in student: ${sanitizedUser.email} (ID: ${sanitizedUser.id})`);

    return res.json({
      message: 'Authentication successful',
      user: sanitizedUser,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error?.message || 'Server error during login.' });
  }
});

// 3. Google OAuth Sign-In / Register
app.post('/api/auth/google', (req, res) => {
  try {
    const { email, name, avatar, googleId } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid Google email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = userDatabase.get(normalizedEmail);

    if (!user) {
      // Create new Google-authenticated user in database
      const userId = `usr_g_${crypto.randomBytes(8).toString('hex')}`;
      const createdAt = new Date().toISOString();

      user = {
        id: userId,
        email: normalizedEmail,
        username: name || email.split('@')[0],
        created_at: createdAt,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`,
        role: 'student',
        provider: 'google',
        last_login: createdAt,
        stats: {
          xp: 150,
          level: 1,
          challengesResolved: 0,
        },
      };

      userDatabase.set(normalizedEmail, user);
      console.log(`[AUTH] Registered new Google student: ${normalizedEmail}`);
    } else {
      user.last_login = new Date().toISOString();
      if (avatar) user.avatar = avatar;
      console.log(`[AUTH] Authenticated existing Google student: ${normalizedEmail}`);
    }

    const token = `tok_g_${crypto.randomBytes(24).toString('hex')}`;
    const { passwordHash: _, salt: __, ...sanitizedUser } = user;

    return res.json({
      message: 'Google authentication successful',
      user: sanitizedUser,
      token,
    });
  } catch (error: any) {
    console.error('Google Auth error:', error);
    return res.status(500).json({ error: error?.message || 'Google Auth failed.' });
  }
});

// 4. Session Verification Endpoint
app.get('/api/auth/session', (req, res) => {
  const authHeader = req.headers.authorization;
  const emailQuery = req.query.email as string;

  if (emailQuery && userDatabase.has(emailQuery.toLowerCase())) {
    const user = userDatabase.get(emailQuery.toLowerCase())!;
    const { passwordHash: _, salt: __, ...sanitizedUser } = user;
    return res.json({ authenticated: true, user: sanitizedUser });
  }

  // If authorization bearer is sent
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Return default or matched session
    const firstUser = userDatabase.values().next().value;
    if (firstUser) {
      const { passwordHash: _, salt: __, ...sanitizedUser } = firstUser;
      return res.json({ authenticated: true, user: sanitizedUser });
    }
  }

  return res.status(401).json({ authenticated: false, message: 'No active session' });
});

// 5. Query Registered Student Users (for Admin / Platform Transparency)
app.get('/api/auth/users', (req, res) => {
  const users = Array.from(userDatabase.values()).map(({ passwordHash, salt, ...user }) => user);
  return res.json({
    total: users.length,
    users,
  });
});

// 6. Logout
app.post('/api/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Lazy Google GenAI Client
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAI;
}

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: AI Code Generator & Architecture Analyzer
app.post('/api/generate-code', async (req, res) => {
  try {
    const { prompt, contextBlocks = [], precisionLevel = 50, securityLevel = 50, techStack = 'React + Tailwind + Node.js' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const aiClient = getGeminiClient();
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `You are the chief educator and software architect at Vibe Coding Academy.
Your job is to analyze natural language programming prompts, evaluate their architectural completeness, and produce:
1. An intent score (0-100) and intent quality label ('Vague & Ambiguous' | 'Basic & Incomplete' | 'Intermediate' | 'Architect-Grade').
2. An interactive, standalone HTML/CSS/JS preview (rich, styled with modern Tailwind CSS CDN, fully working UI elements with responsive interaction).
3. A clean React / TypeScript code snippet showing production structure.
4. Component hierarchy tree.
5. System Architecture Nodes (Client, API Gateway, Microservices, Database, Cache, Auth, External APIs) with status ('optimal', 'active', 'missing', 'insecure') showing what systems were explicitly requested vs what would be missing if the prompt is vague.
6. Guardrail insights and potential vulnerability warnings.
7. A recommended follow-up prompt to level-up their vibe coding skills.

CRITICAL: Return ONLY a valid JSON object without any Markdown formatting or code block fences. The JSON schema:
{
  "title": "Application title",
  "summary": "Concise architectural assessment",
  "intentQuality": "Vague & Ambiguous" | "Basic & Incomplete" | "Intermediate" | "Architect-Grade",
  "score": number,
  "codeSnippet": "TypeScript / React code string",
  "htmlPreview": "Full HTML document with embedded CSS and JavaScript that runs directly in an iframe",
  "componentTree": [
    { "name": "string", "type": "layout"|"component"|"hook"|"service", "description": "string" }
  ],
  "architectureNodes": [
    { "id": "string", "label": "string", "type": "client"|"gateway"|"service"|"database"|"auth"|"cache"|"external", "description": "string", "status": "active"|"missing"|"insecure"|"optimal", "technologies": ["string"] }
  ],
  "architectureLinks": [
    { "source": "nodeId1", "target": "nodeId2", "protocol": "REST / WebSocket / SQL", "description": "string" }
  ],
  "guardrailInsights": ["string"],
  "potentialFlaws": ["string"],
  "suggestedPromptFollowup": "string"
}`;

        const promptPayload = `User Prompt: "${prompt}"
Active Context Blocks: ${JSON.stringify(contextBlocks)}
Precision Tuning: ${precisionLevel}/100
Security Constraints: ${securityLevel}/100
Target Tech Stack: ${techStack}

Analyze the user's intent and generate the comprehensive educational response.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptPayload,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText);
        return res.json(parsed);
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, using intelligent deterministic educational fallback:', geminiErr?.message);
      }
    }

    // Educational Fallback Engine (when API Key is absent or during rate limit)
    const words = prompt.toLowerCase();
    const isVague = prompt.length < 25 || (!words.includes('database') && !words.includes('auth') && !words.includes('secure') && !words.includes('api'));
    const isSecure = words.includes('secure') || words.includes('jwt') || words.includes('validate') || securityLevel > 70;
    const hasAuth = words.includes('auth') || words.includes('login') || words.includes('user') || words.includes('profile');
    const hasDatabase = words.includes('data') || words.includes('store') || words.includes('save') || words.includes('database') || words.includes('sql');

    const score = isVague
      ? Math.min(48, Math.max(25, prompt.length * 2))
      : Math.min(95, 60 + (hasAuth ? 12 : 0) + (hasDatabase ? 12 : 0) + (isSecure ? 12 : 0));

    const intentQuality = score < 50 ? 'Vague & Ambiguous' : score < 75 ? 'Basic & Incomplete' : score < 90 ? 'Intermediate' : 'Architect-Grade';

    const cleanTitle = prompt.split(' ').slice(0, 4).join(' ').replace(/[^a-zA-Z0-9 ]/g, '') || 'Interactive Application';

    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .animate-pulse-slow { animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col p-6 font-sans antialiased">
  <div class="max-w-xl mx-auto w-full space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400">Generated Vibe App</span>
        <h1 class="text-2xl font-bold text-white tracking-tight">${cleanTitle}</h1>
      </div>
      <span class="px-2.5 py-1 text-xs font-mono rounded-full ${score > 70 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
        ${score}/100 Match
      </span>
    </div>

    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
        <span class="text-sm font-medium text-slate-300">Live Client State Container</span>
      </div>

      <div class="space-y-3">
        <label class="block text-xs font-medium text-slate-400">Prompt Intent Test Console</label>
        <div class="flex gap-2">
          <input id="actionInput" type="text" placeholder="Trigger a client-side action..." class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500">
          <button onclick="handleExecute()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow">
            Dispatch
          </button>
        </div>
      </div>

      <div id="eventLog" class="bg-slate-950 rounded-lg p-3 border border-slate-800/80 font-mono text-xs text-slate-400 max-h-36 overflow-y-auto space-y-1">
        <div class="text-emerald-400">✓ System initialized for: "${prompt.slice(0, 40)}${prompt.length > 40 ? '...' : ''}"</div>
        <div class="text-slate-500">→ Client layer bound to simulated API endpoint</div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3 text-xs">
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <span class="text-slate-500 block mb-1">State Paradigm</span>
        <span class="font-semibold text-slate-200">${techStack}</span>
      </div>
      <div class="p-3 bg-slate-900 border border-slate-800 rounded-lg">
        <span class="text-slate-500 block mb-1">Security Posture</span>
        <span class="font-semibold ${isSecure ? 'text-emerald-400' : 'text-amber-400'}">${isSecure ? 'Strict Guardrails' : 'Implicit Defaults (Review Needed)'}</span>
      </div>
    </div>
  </div>

  <script>
    function handleExecute() {
      const input = document.getElementById('actionInput');
      const log = document.getElementById('eventLog');
      if (!input.value.trim()) return;
      
      const item = document.createElement('div');
      item.className = 'text-slate-300';
      item.innerHTML = '<span class="text-emerald-400">[' + new Date().toLocaleTimeString() + ']</span> Dispatched: ' + input.value;
      log.prepend(item);
      input.value = '';
    }
  </script>
</body>
</html>`;

    const fallbackCode = `import React, { useState } from 'react';

// Vibe Coding Academy Generated Module: ${cleanTitle}
export const App: React.FC = () => {
  const [data, setData] = useState<string[]>(['Initial state ready']);
  const [input, setInput] = useState('');

  const handleDispatch = () => {
    if (!input.trim()) return;
    setData(prev => [...prev, input]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">${cleanTitle}</h1>
        <p className="text-sm text-slate-400 mt-1">Generated via Vibe Coding Intent Parser</p>
      </header>

      <main className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex gap-3 mb-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type intent payload..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500 outline-none text-slate-100"
          />
          <button
            onClick={handleDispatch}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-xl transition"
          >
            Dispatch
          </button>
        </div>

        <ul className="space-y-2">
          {data.map((item, idx) => (
            <li key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-sm font-mono text-slate-300">
              {item}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};`;

    return res.json({
      title: cleanTitle,
      summary: isVague
        ? 'Prompt lacks concrete persistence, authentication, and error boundary specifications. AI defaulted to a barebones client memory container.'
        : 'Solid intent foundation with clear domain nouns. Recommended adding explicit rate limiting, role-based access control, and schema validation.',
      intentQuality,
      score,
      codeSnippet: fallbackCode,
      htmlPreview: fallbackHtml,
      componentTree: [
        { name: 'AppRoot', type: 'layout', description: 'Top-level responsive container and theme provider' },
        { name: 'IntentActionConsole', type: 'component', description: 'Handles state dispatch and user interactions' },
        { name: 'useRealtimeState', type: 'hook', description: 'Synchronizes local state with simulated cloud storage' },
        { name: 'TelemetryLogger', type: 'service', description: 'Emits audit logs to vibe-coding-site directory' },
      ],
      architectureNodes: [
        {
          id: 'node-client',
          label: 'Client UI Application',
          type: 'client',
          description: 'React SPA handling DOM state & optimistic updates',
          status: 'optimal',
          technologies: ['React 19', 'Tailwind CSS', 'Vite'],
        },
        {
          id: 'node-gateway',
          label: 'API Gateway & Routing',
          type: 'gateway',
          description: isVague ? 'Implicit / Missing: No route schemas or middleware declared' : 'Express / Cloud Run REST Gateway',
          status: isVague ? 'missing' : 'active',
          technologies: ['Express', 'Node.js'],
        },
        {
          id: 'node-auth',
          label: 'Auth & Session Vault',
          type: 'auth',
          description: hasAuth ? 'JWT / OAuth 2.0 Identity Manager' : 'Missing: No authentication guard specified in prompt',
          status: hasAuth ? 'optimal' : 'insecure',
          technologies: ['Google OAuth', 'JWT / Bearer'],
        },
        {
          id: 'node-db',
          label: 'Persistence Layer',
          type: 'database',
          description: hasDatabase ? 'Firestore / PostgreSQL with Row-Level Security' : 'Missing: Data will not persist beyond browser refresh',
          status: hasDatabase ? 'optimal' : 'missing',
          technologies: ['Firestore', 'Google Drive sync'],
        },
      ],
      architectureLinks: [
        { source: 'node-client', target: 'node-gateway', protocol: 'HTTPS / JSON', description: 'Client actions proxy' },
        { source: 'node-gateway', target: 'node-auth', protocol: 'Bearer Verification', description: 'Session validation' },
        { source: 'node-gateway', target: 'node-db', protocol: 'Drizzle / SDK', description: 'CRUD queries' },
      ],
      guardrailInsights: isVague
        ? [
            'Notice how asking just for a UI resulted in NO persistent database being generated.',
            'Without specifying error handling, network disconnections will crash the client.',
            'Add explicit constraints: "Include input sanitization and rate limiting".',
          ]
        : [
            'Good inclusion of domain requirements!',
            'Consider pinning data validation rules (e.g., Zod schema) to prevent malicious payloads.',
          ],
      potentialFlaws: isVague
        ? [
            'Data disappears on tab close (in-memory only)',
            'No authorization checks on state mutations',
            'Unbounded array growth causing potential memory leaks',
          ]
        : [
            'Needs defensive offline retry queue',
            'Consider adding distributed caching for high concurrency',
          ],
      suggestedPromptFollowup: isVague
        ? `Refine prompt to: "Build a ${cleanTitle} with a secure Express API, Google OAuth session auth, PostgreSQL persistence, and defensive client-side validation."`
        : `Refine prompt to: "Add Redis caching for query optimization and Google Drive automatic telemetry backup."`,
    });
  } catch (error: any) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Endpoint: Real-time Prompt Diffing & Intent Scoring
app.post('/api/analyze-prompt', async (req, res) => {
  try {
    const { originalPrompt = '', refinedPrompt = '' } = req.body;

    const basePrompt = originalPrompt || 'make a dashboard';
    const targetPrompt = refinedPrompt || basePrompt;

    const aiClient = getGeminiClient();
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Compare these two natural language prompts from a software engineering perspective:
Base Prompt: "${basePrompt}"
Refined Prompt: "${targetPrompt}"

Evaluate how the additions alter the software architecture, precision, and security.
Return JSON with:
{
  "baseScore": number (0-100),
  "refinedScore": number (0-100),
  "scoreDiff": number,
  "keyAdditions": ["string"],
  "architecturalEvolution": ["string"],
  "analysis": "Short 2-sentence summary of the engineering impact"
}`,
          config: { responseMimeType: 'application/json', temperature: 0.2 },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err) {
        console.warn('Gemini diff call failed, using fallback diff logic');
      }
    }

    const baseScore = Math.min(85, Math.max(30, basePrompt.length * 1.5));
    const refinedScore = Math.min(98, Math.max(baseScore, baseScore + (targetPrompt.length - basePrompt.length) * 0.8 + 15));
    const scoreDiff = refinedScore - baseScore;

    return res.json({
      baseScore,
      refinedScore,
      scoreDiff,
      keyAdditions: [
        'Added explicit architectural domain constraints',
        'Specified persistence and schema requirements',
        'Defined security & authorization boundaries',
      ],
      architecturalEvolution: [
        'Evolved from client-only memory to full-stack persistent topology',
        'Introduced deterministic data contracts and error boundaries',
      ],
      analysis: `Adding technical constraints increased the engineering precision score by +${scoreDiff.toFixed(0)} points, transforming a prototype into production-ready specifications.`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to analyze prompt' });
  }
});

// Endpoint: Spot the Hallucination Review Evaluator
app.post('/api/review-hallucination', async (req, res) => {
  try {
    const { challengeId, userPrompt, vulnerableCode, vulnerabilityType } = req.body;

    const aiClient = getGeminiClient();
    if (aiClient && process.env.GEMINI_API_KEY) {
      try {
        const response = await aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `A computer science student is solving a "Spot the Hallucination" code security challenge.
Vulnerability Category: ${vulnerabilityType}
Flawed Code:
\`\`\`
${vulnerableCode}
\`\`\`
Student's Prompt to fix the issue:
"${userPrompt}"

Evaluate if the student's prompt successfully identifies and instructs the AI to fix the specific vulnerability.
Return JSON:
{
  "isResolved": boolean,
  "grade": "Mastery" | "Partial Credit" | "Missed the Core Vulnerability",
  "score": number (0-100),
  "feedback": "Concise feedback on their prompt precision",
  "remediatedCode": "Corrected secure code snippet",
  "architecturalTakeaway": "Key software architecture lesson"
}`,
          config: { responseMimeType: 'application/json', temperature: 0.2 },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json(parsed);
      } catch (err) {
        console.warn('Gemini review call failed, using fallback review grader');
      }
    }

    // Deterministic Review Grader Fallback
    const lower = (userPrompt || '').toLowerCase();
    const keywords = ['param', 'sanitize', 'jwt', 'auth', 'secret', 'env', 'cleanup', 'dependency', 'mount', 'token', 'server', 'role', 'header'];
    const matches = keywords.filter(k => lower.includes(k));
    const isResolved = matches.length >= 1 || userPrompt.length > 30;
    const score = isResolved ? 90 : 45;

    return res.json({
      isResolved,
      grade: isResolved ? 'Mastery' : 'Missed the Core Vulnerability',
      score,
      feedback: isResolved
        ? 'Excellent prompt engineering! You directly instructed the AI to isolate the vulnerability and replace it with secure primitives.'
        : 'Your prompt was too vague. Specify exact architectural remediation (e.g. "Move Stripe secret keys to server-side process.env and proxy through /api/checkout").',
      remediatedCode: `// Remediated Secure Pattern\n// 1. Secrets kept strictly server-side\n// 2. Client queries protected with JWT Bearer auth\n// 3. Inputs validated via Zod schema before DB write`,
      architecturalTakeaway: 'In AI code generation, the agent will take the path of least resistance unless you explicitly pin security constraints in your prompt.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to review hallucination' });
  }
});

// Endpoint: Guided Guardrails Scaffolder
app.post('/api/scaffold-guardrails', async (req, res) => {
  try {
    const { rawIdea = '' } = req.body;

    const questions = [
      {
        dimension: 'Persistence & Scale',
        question: 'Where should user data live across sessions?',
        options: ['Local In-Browser (localStorage)', 'Cloud Firestore / Realtime DB', 'PostgreSQL with Drizzle ORM', 'Google Drive Sync'],
      },
      {
        dimension: 'Authentication & Access',
        question: 'How do users authenticate and protect their data?',
        options: ['Public / Anonymous Session', 'Google OAuth 2.0 Sign-In', 'Role-Based Access (Admin vs User)', 'API Key Header'],
      },
      {
        dimension: 'Deployment & Runtime',
        question: 'What is the runtime execution model?',
        options: ['Client-Side SPA (Vite/React)', 'Server-Side API (Express/Node)', 'Serverless Edge Functions', 'Dockerized Cloud Container'],
      },
    ];

    const generatedPrompt = `Build a high-performance ${rawIdea || 'application'} featuring:
- Framework: React 19 + Tailwind CSS for responsive UI
- Backend: Express REST API with server-side validation
- Persistence: Google Drive 'vibe-coding-site' folder sync + local caching
- Security: Strict input sanitization, zero leaked client secrets, defensive error boundaries
- Telemetry: Real-time event logging and prompt precision tracking`;

    res.json({
      questions,
      suggestedPrompt: generatedPrompt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Failed to scaffold guardrails' });
  }
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vibe Coding Academy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
