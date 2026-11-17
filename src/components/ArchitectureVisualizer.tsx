import React, { useState } from 'react';
import {
  Server,
  Database,
  Shield,
  Globe,
  HardDrive,
  Cpu,
  AlertTriangle,
  Check,
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
        return <Globe className="w-4 h-4 text-[var(--black)]" />;
      case 'gateway':
        return <Server className="w-4 h-4 text-[var(--black)]" />;
      case 'auth':
        return <Shield className="w-4 h-4 text-[var(--red)]" />;
      case 'database':
        return <Database className="w-4 h-4 text-[var(--black)]" />;
      case 'cache':
        return <Cpu className="w-4 h-4 text-[var(--black)]" />;
      case 'external':
      default:
        return <HardDrive className="w-4 h-4 text-[var(--black)]" />;
    }
  };

  const getStatusBadge = (status: ArchitectureNode['status']) => {
    switch (status) {
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-[var(--black)] text-[var(--white)] font-semibold">
            <Check className="w-3 h-3" /> OPTIMAL
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-[var(--gray)] text-[var(--black)] border border-[var(--black)] font-semibold">
            <Check className="w-3 h-3" /> DECLARED
          </span>
        );
      case 'insecure':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-[var(--red)] text-white font-semibold">
            <AlertTriangle className="w-3 h-3" /> INSECURE
          </span>
        );
      case 'missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 border border-[var(--red)] text-[var(--red)] bg-[var(--white)] font-semibold">
            <XCircle className="w-3 h-3" /> MISSING
          </span>
        );
    }
  };

  return (
    <div id="architecture-visualizer-container" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--gray)] border border-[var(--black)] p-2 px-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--black)]">
          Architecture Topology Inspector
        </span>

        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => setViewFormat('d3')}
            className={`px-3 py-1 border transition-colors flex items-center gap-1.5 font-semibold text-xs ${
              viewFormat === 'd3'
                ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)] hover:text-[var(--black)]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>D3 Node-Link</span>
          </button>
          <button
            type="button"
            onClick={() => setViewFormat('grid')}
            className={`px-3 py-1 border transition-colors flex items-center gap-1.5 font-semibold text-xs ${
              viewFormat === 'grid'
                ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)] hover:text-[var(--black)]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Matrix Grid</span>
          </button>
        </div>
      </div>

      {viewFormat === 'd3' ? (
        <D3ArchitectureDiagram
          spec={spec}
          nodes={nodes}
          links={links}
          intentScore={intentScore}
          onNodeSelect={onNodeClick}
        />
      ) : (
        <div className="bg-[var(--white)] border border-[var(--black)] p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--rule)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--black)] uppercase tracking-wider font-mono">
                Intent-to-Architecture Matrix
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Auto-diagrammed backend topology implied by your natural language prompt.
              </p>
            </div>

            <div className="flex items-center gap-3 font-mono tabular-nums">
              <div className="text-right">
                <div className="text-[10px] uppercase text-[var(--text-muted)]">Completeness</div>
                <div className="text-sm font-bold text-[var(--red)]">{intentScore}% Declared</div>
              </div>
              <div className="w-11 h-11 bg-[var(--black)] text-[var(--white)] flex items-center justify-center font-bold text-sm">
                {intentScore}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isMissing = node.status === 'missing';
              const isInsecure = node.status === 'insecure';

              return (
                <button
                  key={node.id}
                  id={`arch-node-${node.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedNode(node);
                    onNodeClick?.(node);
                  }}
                  className={`p-4 transition-colors border text-left ${
                    isSelected
                      ? 'bg-[var(--gray)] border-2 border-[var(--red)]'
                      : isMissing || isInsecure
                      ? 'bg-[var(--white)] border-[var(--red)]'
                      : 'bg-[var(--white)] border-[var(--rule)] hover:border-[var(--black)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="w-7 h-7 bg-[var(--gray)] border border-[var(--rule)] flex items-center justify-center">
                      {getNodeIcon(node.type)}
                    </div>
                    {getStatusBadge(node.status)}
                  </div>

                  <h4 className="font-bold text-xs text-[var(--black)] mb-1 font-mono">{node.label}</h4>
                  <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-3">
                    {node.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {node.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-1.5 py-0.5 bg-[var(--gray)] text-[var(--black)] border border-[var(--rule)]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {links.length > 0 && (
            <div className="bg-[var(--gray)] p-4 border border-[var(--rule)] space-y-2">
              <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider font-mono">
                Protocol Linkages &amp; Data Flow
              </div>
              <div className="flex flex-wrap gap-2">
                {links.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs bg-[var(--white)] border border-[var(--rule)] px-2.5 py-1 text-[var(--black)] font-mono"
                  >
                    <span className="text-[var(--text-muted)]">{link.source.replace('node-', '')}</span>
                    <ArrowRight className="w-3 h-3 text-[var(--red)]" />
                    <span className="font-semibold">{link.protocol}</span>
                    <ArrowRight className="w-3 h-3 text-[var(--red)]" />
                    <span className="text-[var(--text-muted)]">{link.target.replace('node-', '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNode && (
            <div id="node-inspector-panel" className="bg-[var(--gray)] p-4 border border-[var(--black)] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[var(--red)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--black)] font-mono">
                    Breakdown: {selectedNode.label}
                  </span>
                </div>
                {getStatusBadge(selectedNode.status)}
              </div>

              <p className="text-xs text-[var(--black)] leading-relaxed">{selectedNode.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1 font-mono">
                    Impact of Vague Prompts
                  </span>
                  <p className="text-[var(--black)] text-[11px] leading-relaxed">
                    {selectedNode.status === 'missing'
                      ? 'Because the prompt did not specify persistence or routing, the AI will omit this node entirely, leading to in-memory loss on refresh.'
                      : selectedNode.status === 'insecure'
                      ? 'Without specifying security guardrails, AI often places API secrets directly inside the client component.'
                      : 'Explicitly declared in prompt constraints, ensuring reliable data contracts and deterministic execution.'}
                  </p>
                </div>

                <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1 font-mono">
                    Recommended Tech Binding
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[var(--gray)] text-[var(--black)] font-mono text-[10px] border border-[var(--rule)]"
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
