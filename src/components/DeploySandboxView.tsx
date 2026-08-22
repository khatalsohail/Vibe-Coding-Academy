import React, { useState } from 'react';
import {
  Rocket,
  Play,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Server,
  ShieldCheck,
  FolderGit2,
  Check,
  HardDrive,
  Activity,
  Cpu,
} from 'lucide-react';
import { DeploymentLog, DeploymentProject, GeneratedSystemSpec } from '../types';
import { DriveService } from '../services/driveService';

interface DeploySandboxViewProps {
  currentSpec?: GeneratedSystemSpec | null;
  onDriveSyncSuccess?: () => void;
}

export const DeploySandboxView: React.FC<DeploySandboxViewProps> = ({
  currentSpec,
  onDriveSyncSuccess,
}) => {
  const [project, setProject] = useState<DeploymentProject>({
    id: 'proj-1',
    name: currentSpec?.title || 'vibe-production-app',
    status: 'Live',
    subdomain: 'ais-pre-vibe-app',
    liveUrl: 'https://ais-pre-em2l52w3hh4squp46asm4q-878185073534.asia-southeast1.run.app',
    region: 'asia-southeast1 (Cloud Run)',
    memory: '512 MB',
    cpu: '1.0 vCPU',
    environmentVariables: [
      { key: 'NODE_ENV', value: 'production' },
      { key: 'PORT', value: '3000' },
      { key: 'DRIVE_FOLDER', value: 'vibe-coding-site' },
      { key: 'ENABLE_TELEMETRY', value: 'true' },
    ],
    deployedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'env'>('overview');
  const [logs, setLogs] = useState<DeploymentLog[]>([
    { id: '1', timestamp: '21:58:01', stage: 'Initiated', message: 'Pulling base image node:22-alpine...', type: 'info' },
    { id: '2', timestamp: '21:58:04', stage: 'Compiling', message: 'Vite build completed (0.8s). Generated static bundle.', type: 'info' },
    { id: '3', timestamp: '21:58:08', stage: 'Containerizing', message: 'Express server bundled into dist/server.cjs via esbuild.', type: 'info' },
    { id: '4', timestamp: '21:58:12', stage: 'HealthCheck', message: 'Ingress routing verified on port 3000. GET /api/health -> 200 OK', type: 'success' },
    { id: '5', timestamp: '21:58:15', stage: 'Deployed', message: 'Container live and listening at https://ais-pre-...run.app', type: 'success' },
  ]);
  const [syncSaved, setSyncSaved] = useState<boolean>(false);

  const handleTriggerDeploy = () => {
    setIsDeploying(true);
    setLogs([]);
    const stepLogs: DeploymentLog[] = [
      { id: '1', timestamp: new Date().toLocaleTimeString(), stage: 'Initiated', message: 'Triggered 1-click cloud container build from Vibe spec...', type: 'info' },
      { id: '2', timestamp: new Date().toLocaleTimeString(), stage: 'Compiling', message: 'Synthesizing TypeScript modules and Tailwind styles...', type: 'info' },
      { id: '3', timestamp: new Date().toLocaleTimeString(), stage: 'Containerizing', message: 'Optimizing container image layers with zero memory leaks...', type: 'info' },
      { id: '4', timestamp: new Date().toLocaleTimeString(), stage: 'HealthCheck', message: 'Passing zero-trust TLS handshake and Google Drive sync hooks...', type: 'success' },
      { id: '5', timestamp: new Date().toLocaleTimeString(), stage: 'Deployed', message: 'Container successfully deployed and healthy!', type: 'success' },
    ];

    stepLogs.forEach((logItem, idx) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, logItem]);
        if (idx === stepLogs.length - 1) {
          setIsDeploying(false);
          setProject((prev) => ({
            ...prev,
            status: 'Live',
            deployedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
        }
      }, (idx + 1) * 700);
    });
  };

  const handleSyncToDrive = async () => {
    try {
      await DriveService.syncFile(
        'deployment-manifest.json',
        JSON.stringify(
          {
            project: project.name,
            subdomain: project.subdomain,
            url: project.liveUrl,
            deployedAt: project.deployedAt,
            envVars: project.environmentVariables,
          },
          null,
          2
        ),
        'application/json'
      );
      setSyncSaved(true);
      onDriveSyncSuccess?.();
      setTimeout(() => setSyncSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="deploy-sandbox-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
              Simulated 1-Click Hosting
            </span>
            <span className="text-xs text-slate-400 font-mono">Cloud Run & Vercel Sandbox</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
            Deployment & Production Ingress
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Experience how AI-generated prototypes transition into isolated, production-grade cloud containers.
            Monitor health checks, inspect build logs, and export deployment manifests to Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncToDrive}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
              syncSaved
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                : 'bg-slate-950 text-blue-300 border-blue-900/60 hover:bg-slate-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
            <span>{syncSaved ? 'Manifest Synced to Drive' : 'Sync Manifest to Drive'}</span>
          </button>

          <button
            id="trigger-redeploy-btn"
            onClick={handleTriggerDeploy}
            disabled={isDeploying}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            {isDeploying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Building Container...</span>
              </>
            ) : (
              <>
                <Rocket className="w-3.5 h-3.5" />
                <span>Re-Deploy Container</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Container State & Live Endpoint (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Container Instance State
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {project.status}
              </span>
            </div>

            {/* Live Domain Card */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Live Service URL</span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-emerald-400 truncate">{project.liveUrl}</span>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs flex items-center gap-1 border border-slate-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Container Specs */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block mb-0.5">Region</span>
                <span className="font-semibold text-slate-200 truncate block">asia-se1</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block mb-0.5">Memory</span>
                <span className="font-semibold text-slate-200">{project.memory}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block mb-0.5">Compute</span>
                <span className="font-semibold text-slate-200">{project.cpu}</span>
              </div>
            </div>

            {/* Environment Variables Table */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">Injected Container Variables</div>
              <div className="space-y-1">
                {project.environmentVariables.map((env, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950 font-mono text-[11px] border border-slate-800/80"
                  >
                    <span className="text-slate-400">{env.key}</span>
                    <span className="text-emerald-300">{env.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Terminal Stream (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Container Build Logs
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">STDOUT / STDERR</span>
            </div>

            {/* Terminal Window */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 h-[380px] overflow-y-auto space-y-2 leading-relaxed">
              <div className="text-slate-500">=== Vibe Coding Container Pipeline Initialized ===</div>
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-500 text-[10px] shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-semibold shrink-0 text-[11px] ${
                      log.type === 'success' ? 'text-emerald-400' : 'text-cyan-400'
                    }`}
                  >
                    [{log.stage}]
                  </span>
                  <span className={log.type === 'success' ? 'text-emerald-300' : 'text-slate-300'}>
                    {log.message}
                  </span>
                </div>
              ))}
              {isDeploying && (
                <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                  <span>→</span> <span>Compiling microservices and executing health checks...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
