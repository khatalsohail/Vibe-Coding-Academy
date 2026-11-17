import React, { useState } from 'react';
import {
  Rocket,
  ExternalLink,
  Terminal,
  Server,
  FolderGit2,
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
    <div id="deploy-sandbox-view" className="w-full">
      {/* Header Band */}
      <section className="swiss-grid swiss-grid--flush-top items-end">
        <div className="main space-y-2">
          <div className="eyebrow font-mono">Simulated 1-Click Hosting • Cloud Run Sandbox</div>
          <h1>Deployment &amp; Production Ingress</h1>
          <p className="lead max-w-2xl">
            Inspect how AI-generated prototypes transition into isolated, production-grade cloud containers with health checks and Drive manifests.
          </p>
        </div>

        <div className="aside flex flex-wrap sm:flex-nowrap items-center justify-start md:justify-end gap-2.5">
          <button
            type="button"
            onClick={handleSyncToDrive}
            className="button button--outline"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>{syncSaved ? 'Manifest Synced' : 'Sync Manifest'}</span>
          </button>

          <button
            id="trigger-redeploy-btn"
            type="button"
            onClick={handleTriggerDeploy}
            disabled={isDeploying}
            className="button"
          >
            <Rocket className="w-4 h-4" />
            <span>{isDeploying ? 'Building Container...' : 'Re-Deploy Container'}</span>
          </button>
        </div>
      </section>

      {/* Main 2-Column Deployment Grid */}
      <section className="swiss-grid">
        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (6 cols): Container State & Specs */}
          <div className="lg:col-span-6 bg-[var(--white)] border border-[var(--black)] p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[var(--black)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                  Container Instance State
                </span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 bg-[var(--black)] text-[var(--white)] font-semibold uppercase">
                {project.status}
              </span>
            </div>

            <div className="p-4 bg-[var(--gray)] border border-[var(--rule)] space-y-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                Live Service URL
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-[var(--black)] truncate">{project.liveUrl}</span>
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open live service URL in new tab"
                  className="p-1.5 bg-[var(--white)] hover:bg-[var(--black)] hover:text-[var(--white)] text-[var(--black)] border border-[var(--black)] transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 border border-[var(--rule)] bg-[var(--white)] font-mono text-xs tabular-nums">
              <div className="p-3 border-r border-[var(--rule)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase block mb-0.5">Region</span>
                <span className="font-bold text-[var(--black)]">asia-se1</span>
              </div>
              <div className="p-3 border-r border-[var(--rule)]">
                <span className="text-[var(--text-muted)] text-[10px] uppercase block mb-0.5">Memory</span>
                <span className="font-bold text-[var(--black)]">{project.memory}</span>
              </div>
              <div className="p-3">
                <span className="text-[var(--text-muted)] text-[10px] uppercase block mb-0.5">Compute</span>
                <span className="font-bold text-[var(--black)]">{project.cpu}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase font-bold text-[var(--text-muted)]">
                Injected Container Variables
              </div>
              <div className="border border-[var(--rule)] divide-y divide-[var(--rule)] font-mono text-xs">
                {project.environmentVariables.map((env, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 bg-[var(--gray)]"
                  >
                    <span className="text-[var(--text-muted)]">{env.key}</span>
                    <span className="text-[var(--black)] font-semibold">{env.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (6 cols): Live Build Stream */}
          <div className="lg:col-span-6 bg-[var(--white)] border border-[var(--black)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--rule)]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--red)]" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--black)]">
                  Live Container Build Logs
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">STDOUT / STDERR</span>
            </div>

            <div className="p-4 bg-[#000000] text-[#FFFFFF] border border-[var(--black)] font-mono text-xs h-[380px] overflow-y-auto space-y-2 leading-relaxed tabular-nums">
              <div className="text-[#9CA3AF]">=== Vibe Coding Container Pipeline Initialized ===</div>
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-[#9CA3AF] text-[10px] shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-bold shrink-0 text-[11px] ${
                      log.type === 'success' ? 'text-[#EF4444]' : 'text-[#FFFFFF]'
                    }`}
                  >
                    [{log.stage}]
                  </span>
                  <span className="text-[#F5F5F5]">{log.message}</span>
                </div>
              ))}
              {isDeploying && (
                <div className="flex items-center gap-2 text-[#EF4444]">
                  <span>&gt;</span>
                  <span>Compiling microservices and executing health checks...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
