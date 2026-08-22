import React, { useState } from 'react';
import {
  Server,
  Database,
  Shield,
  Layers,
  Globe,
  HardDrive,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info,
  Network,
  LayoutGrid,
} from 'lucide-react';
import { ArchitectureLink, ArchitectureNode, GeneratedSystemSpec } from '../types';
import { D3ArchitectureDiagram } from './D3ArchitectureDiagram';

interface ArchitectureVisualizerProps {
  nodes: ArchitectureNode[];
  links: ArchitectureLink[];
  intentScore: number;
  spec?: GeneratedSystemSpec | null;
  onNodeClick?: (node: ArchitectureNode) => void;
}

export const ArchitectureVisualizer: React.FC<ArchitectureVisualizerProps> = ({
  nodes,
  links,
  intentScore,
  spec,
  onNodeClick,
}) => {
  const [viewFormat, setViewFormat] = useState<'d3' | 'grid'>('d3');
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(nodes[0] || null);

  React.useEffect(() => {
    if (nodes.length > 0 && !selectedNode) {
      setSelectedNode(nodes[0]);
    }
  }, [nodes, selectedNode]);

  const getNodeIcon = (type: ArchitectureNode['type']) => {
    switch (type) {
      case 'client':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'gateway':
        return <Server className="w-4 h-4 text-emerald-400" />;
      case 'auth':
        return <Shield className="w-4 h-4 text-amber-400" />;
      case 'database':
        return <Database className="w-4 h-4 text-indigo-400" />;
      case 'cache':
        return <Cpu className="w-4 h-4 text-violet-400" />;
      case 'external':
      default:
        return <HardDrive className="w-4 h-4 text-blue-400" />;
    }
  };

  const getStatusBadge = (status: ArchitectureNode['status']) => {
    switch (status) {
      case 'optimal':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Optimal Spec
          </span>
        );
      case 'active':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800">
            <CheckCircle2 className="w-3 h-3 text-blue-400" /> Declared
          </span>
        );
      case 'insecure':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Insecure / Untrusted
          </span>
        );
      case 'missing':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800">
            <XCircle className="w-3 h-3 text-rose-400" /> Missing from Prompt
          </span>
        );
    }
  };

  return (
    <div id="architecture-visualizer-container" className="space-y-4">
      {/* Top Visualizer View Switcher Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-2 px-3">
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span className="font-semibold text-slate-200">Architecture Topology Inspector</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setViewFormat('d3')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 font-semibold text-xs ${
              viewFormat === 'd3'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>D3 Node-Link Diagram</span>
          </button>
          <button
            onClick={() => setViewFormat('grid')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 font-semibold text-xs ${
              viewFormat === 'grid'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Matrix Grid View</span>
          </button>
        </div>
      </div>

      {/* Primary D3 Interactive Diagram */}
      {viewFormat === 'd3' ? (
        <D3ArchitectureDiagram
          spec={spec}
          nodes={nodes}
          links={links}
          intentScore={intentScore}
          onNodeSelect={onNodeClick}
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-xl">
          {/* Visualizer Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Intent-to-Architecture Matrix
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Auto-diagrammed backend topology implied by your natural language prompt.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">Architectural Completeness</div>
                <div className="text-sm font-bold font-mono text-cyan-400">{intentScore}% Declared</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-sm text-cyan-400 shadow-inner">
                {intentScore}
              </div>
            </div>
          </div>

          {/* Interactive Topology Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isMissing = node.status === 'missing';
              const isInsecure = node.status === 'insecure';

              return (
                <div
                  key={node.id}
                  id={`arch-node-${node.id}`}
                  onClick={() => {
                    setSelectedNode(node);
                    onNodeClick?.(node);
                  }}
                  className={`cursor-pointer rounded-2xl p-4 transition-all border relative text-left ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                      : isMissing
                      ? 'bg-slate-950/60 border-rose-900/50 hover:border-rose-700/80 opacity-70'
                      : isInsecure
                      ? 'bg-slate-950/80 border-amber-900/50 hover:border-amber-700/80'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                      {getNodeIcon(node.type)}
                    </div>
                    {getStatusBadge(node.status)}
                  </div>

                  <h4 className="font-semibold text-xs text-slate-100 mb-1 font-mono">{node.label}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">{node.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {node.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-500 rotate-45"></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Protocol Links Highway */}
          {links.length > 0 && (
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                Protocol Linkages & Data Flow
              </div>
              <div className="flex flex-wrap gap-2">
                {links.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl text-slate-300 font-mono"
                  >
                    <span className="text-slate-400 font-sans">{link.source.replace('node-', '')}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-semibold">{link.protocol}</span>
                    <ArrowRight className="w-3 h-3 text-cyan-400" />
                    <span className="text-slate-400 font-sans">{link.target.replace('node-', '')}</span>
                    {link.description && <span className="text-[10px] text-slate-500">({link.description})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Node Inspector Detail Panel */}
          {selectedNode && (
            <div id="node-inspector-panel" className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                    Architectural Breakdown: {selectedNode.label}
                  </span>
                </div>
                {getStatusBadge(selectedNode.status)}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">
                    Impact of Vague Prompts
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    {selectedNode.status === 'missing'
                      ? 'Because the prompt did not specify persistence or routing, the AI will omit this node entirely, leading to in-memory loss on page refresh.'
                      : selectedNode.status === 'insecure'
                      ? 'Without specifying security guardrails, AI often places API secrets directly inside the client component.'
                      : 'Explicitly declared in prompt constraints, ensuring reliable data contracts and deterministic execution.'}
                  </p>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">
                    Recommended Tech Binding
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-950 text-cyan-300 rounded font-mono text-[10px] border border-cyan-900/50"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
