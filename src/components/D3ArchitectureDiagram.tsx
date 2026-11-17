import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Check,
  AlertTriangle,
  XCircle,
  Activity,
  Filter,
  Radio,
} from 'lucide-react';
import { GeneratedSystemSpec, ArchitectureNode, ArchitectureLink } from '../types';

export interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'client' | 'gateway' | 'service' | 'database' | 'auth' | 'cache' | 'external';
  description: string;
  status: 'active' | 'missing' | 'insecure' | 'optimal';
  technologies: string[];
  subComponents?: string[];
  layerIndex: number;
  layerName: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
  protocol: string;
  description?: string;
}

interface D3ArchitectureDiagramProps {
  spec?: GeneratedSystemSpec | null;
  nodes?: ArchitectureNode[];
  links?: ArchitectureLink[];
  intentScore?: number;
  onNodeSelect?: (node: ArchitectureNode) => void;
  className?: string;
}

const LAYER_CONFIG = [
  { index: 0, name: 'Frontend Client', accent: '#000000', desc: 'UI Components & State' },
  { index: 1, name: 'Gateway & Ingress', accent: '#DC2626', desc: 'Routes, OAuth & Proxy' },
  { index: 2, name: 'Services & AI', accent: '#000000', desc: 'Logic & Gemini SDK' },
  { index: 3, name: 'Database & Storage', accent: '#4B5563', desc: 'Firestore, SQL & Cache' },
];

export const D3ArchitectureDiagram: React.FC<D3ArchitectureDiagramProps> = ({
  spec,
  nodes: propNodes,
  links: propLinks,
  intentScore = spec?.score || 85,
  onNodeSelect,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [layoutMode, setLayoutMode] = useState<'layered' | 'force' | 'cluster'>('layered');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterLayer, setFilterLayer] = useState<number | 'all'>('all');
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [showProtocolLabels, setShowProtocolLabels] = useState<boolean>(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 480 });

  const rawNodes = useMemo(() => {
    if (spec?.architectureNodes && spec.architectureNodes.length > 0) return spec.architectureNodes;
    if (propNodes && propNodes.length > 0) return propNodes;
    return [
      {
        id: 'node-client',
        label: 'React 19 SPA Client',
        type: 'client' as const,
        description: 'Single-Page client rendering with Tailwind and interactive state',
        status: 'optimal' as const,
        technologies: ['React 19', 'Tailwind', 'Lucide'],
        subComponents: ['Dashboard', 'Playground', 'ReviewArena'],
      },
      {
        id: 'node-gateway',
        label: 'Express Ingress API',
        type: 'gateway' as const,
        description: 'Port 3000 reverse proxy routing and security middleware',
        status: 'optimal' as const,
        technologies: ['Express', 'TypeScript', 'esbuild'],
        subComponents: ['/api/health', '/api/sync', '/api/gemini'],
      },
      {
        id: 'node-auth',
        label: 'Google OAuth 2.0 Client',
        type: 'auth' as const,
        description: 'Client-side GSI OAuth popups and Drive authorization',
        status: 'active' as const,
        technologies: ['Google Identity', 'JWT'],
      },
      {
        id: 'node-gemini',
        label: 'Gemini 2.5 Logic Engine',
        type: 'service' as const,
        description: 'Server-side Generative AI spec synthesizer and code generator',
        status: 'optimal' as const,
        technologies: ['@google/genai', 'Node 22'],
      },
      {
        id: 'node-drive',
        label: 'Google Drive Sync Hook',
        type: 'external' as const,
        description: 'Isolated folder synchronization to /vibe-coding-site',
        status: 'active' as const,
        technologies: ['Drive API v3', 'REST'],
      },
      {
        id: 'node-firestore',
        label: 'Firestore Database',
        type: 'database' as const,
        description: 'Persistent cloud documents for telemetry and architecture manifests',
        status: 'active' as const,
        technologies: ['Firebase Firestore', 'NoSQL'],
      },
    ];
  }, [spec, propNodes]);

  const rawLinks = useMemo(() => {
    if (spec?.architectureLinks && spec.architectureLinks.length > 0) return spec.architectureLinks;
    if (propLinks && propLinks.length > 0) return propLinks;
    return [
      { source: 'node-client', target: 'node-gateway', protocol: 'HTTP/REST', description: 'API Requests' },
      { source: 'node-client', target: 'node-auth', protocol: 'OAuth 2.0', description: 'GSI Token Client' },
      { source: 'node-gateway', target: 'node-gemini', protocol: 'Server SDK', description: 'Prompt Compilation' },
      { source: 'node-gateway', target: 'node-firestore', protocol: 'Firestore SDK', description: 'Data Persistence' },
      { source: 'node-auth', target: 'node-drive', protocol: 'Bearer Token', description: 'Drive File Access' },
      { source: 'node-gateway', target: 'node-drive', protocol: 'Drive v3 API', description: 'Manifest Sync' },
    ];
  }, [spec, propLinks]);

  const getLayerForNodeType = (type: ArchitectureNode['type']): { index: number; name: string } => {
    switch (type) {
      case 'client':
        return { index: 0, name: LAYER_CONFIG[0].name };
      case 'gateway':
      case 'auth':
        return { index: 1, name: LAYER_CONFIG[1].name };
      case 'service':
      case 'external':
        return { index: 2, name: LAYER_CONFIG[2].name };
      case 'database':
      case 'cache':
      default:
        return { index: 3, name: LAYER_CONFIG[3].name };
    }
  };

  const d3Nodes: D3Node[] = useMemo(() => {
    return rawNodes.map((node) => {
      const layer = getLayerForNodeType(node.type);
      return { ...node, layerIndex: layer.index, layerName: layer.name };
    });
  }, [rawNodes]);

  const d3Links: D3Link[] = useMemo(() => {
    return rawLinks.map((link, idx) => ({
      id: `link-${idx}`,
      source: link.source,
      target: link.target,
      protocol: link.protocol,
      description: link.description,
    }));
  }, [rawLinks]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.max(460, Math.floor(height)) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const activeSelectedNode = useMemo(() => {
    if (!selectedNodeId) return d3Nodes[0] || null;
    return d3Nodes.find((n) => n.id === selectedNodeId) || d3Nodes[0] || null;
  }, [selectedNodeId, d3Nodes]);

  const connectedNodeIds = useMemo(() => {
    const focusId = hoveredNodeId || selectedNodeId;
    if (!focusId) return new Set<string>();
    const set = new Set<string>([focusId]);
    d3Links.forEach((link) => {
      const sId = typeof link.source === 'object' ? (link.source as D3Node).id : link.source;
      const tId = typeof link.target === 'object' ? (link.target as D3Node).id : link.target;
      if (sId === focusId && tId) set.add(tId);
      if (tId === focusId && sId) set.add(sId);
    });
    return set;
  }, [hoveredNodeId, selectedNodeId, d3Links]);

  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(350)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const isMobile = width < 640;

    const filteredNodes =
      filterLayer === 'all' ? [...d3Nodes] : d3Nodes.filter((n) => n.layerIndex === filterLayer);
    const validNodeIdSet = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = d3Links
      .filter((l) => {
        const sId = typeof l.source === 'object' ? (l.source as D3Node).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as D3Node).id : l.target;
        return validNodeIdSet.has(sId) && validNodeIdSet.has(tId);
      })
      .map((l) => ({ ...l }));

    const defs = svg.append('defs');

    defs
      .append('marker')
      .attr('id', 'swiss-arrow-black')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L9,0L0,4')
      .attr('fill', '#000000');

    defs
      .append('marker')
      .attr('id', 'swiss-arrow-red')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 26)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L9,0L0,4')
      .attr('fill', '#DC2626');

    const g = svg.append('g').attr('class', 'zoomable-container');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    if (layoutMode === 'layered' && filterLayer === 'all') {
      const layerG = g.append('g').attr('class', 'layer-backgrounds');
      const colWidth = (width - 64) / 4;

      LAYER_CONFIG.forEach((layer, i) => {
        const xPos = 32 + i * colWidth;
        const colGroup = layerG.append('g').attr('class', `layer-col-${i}`);

        colGroup
          .append('rect')
          .attr('x', xPos + 4)
          .attr('y', 16)
          .attr('width', colWidth - 8)
          .attr('height', height - 32)
          .attr('rx', 0)
          .attr('fill', '#F5F5F5')
          .attr('stroke', '#E5E7EB')
          .attr('stroke-width', 1);

        colGroup
          .append('text')
          .attr('x', xPos + 14)
          .attr('y', 38)
          .attr('fill', layer.index === 1 ? '#DC2626' : '#000000')
          .attr('font-size', isMobile ? '9px' : '10.5px')
          .attr('font-weight', '700')
          .attr('font-family', 'JetBrains Mono, monospace')
          .text(`0${i + 1} ${layer.name.toUpperCase()}`);

        colGroup
          .append('text')
          .attr('x', xPos + 14)
          .attr('y', 53)
          .attr('fill', '#4B5563')
          .attr('font-size', '9px')
          .attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
          .text(layer.desc);
      });
    }

    const linkGroup = g.append('g').attr('class', 'links-layer');
    const particleGroup = g.append('g').attr('class', 'particles-layer');
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');

    const simulation = d3
      .forceSimulation<D3Node>(filteredNodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(filteredLinks)
          .id((d) => d.id)
          .distance(layoutMode === 'layered' ? 115 : 155)
          .strength(layoutMode === 'layered' ? 0.3 : 0.7)
      )
      .force('charge', d3.forceManyBody().strength(layoutMode === 'layered' ? -340 : -580))
      .force('collision', d3.forceCollide().radius(48).strength(0.8));

    if (layoutMode === 'layered') {
      const colWidth = (width - 64) / 4;
      simulation
        .force(
          'x',
          d3.forceX<D3Node>((d) => 32 + d.layerIndex * colWidth + colWidth / 2).strength(0.85)
        )
        .force('y', d3.forceY<D3Node>(height / 2 + 12).strength(0.25));
    } else if (layoutMode === 'cluster') {
      const clusterCenters = [
        { x: width * 0.25, y: height * 0.3 },
        { x: width * 0.75, y: height * 0.3 },
        { x: width * 0.25, y: height * 0.7 },
        { x: width * 0.75, y: height * 0.7 },
      ];
      simulation
        .force('x', d3.forceX<D3Node>((d) => clusterCenters[d.layerIndex % 4].x).strength(0.6))
        .force('y', d3.forceY<D3Node>((d) => clusterCenters[d.layerIndex % 4].y).strength(0.6));
    } else {
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
    }

    const link = linkGroup
      .selectAll<SVGPathElement, D3Link>('path')
      .data(filteredLinks, (d) => d.id)
      .join('path')
      .attr('class', 'arch-link')
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as D3Node).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as D3Node).id : d.target;
        return connectedNodeIds.has(sId) && connectedNodeIds.has(tId) ? '#DC2626' : '#000000';
      })
      .attr('stroke-width', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as D3Node).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as D3Node).id : d.target;
        return connectedNodeIds.has(sId) && connectedNodeIds.has(tId) ? 2 : 1.25;
      })
      .attr('stroke-opacity', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as D3Node).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as D3Node).id : d.target;
        if (selectedNodeId || hoveredNodeId) {
          return connectedNodeIds.has(sId) && connectedNodeIds.has(tId) ? 1 : 0.2;
        }
        return 0.7;
      })
      .attr('marker-end', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as D3Node).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as D3Node).id : d.target;
        return connectedNodeIds.has(sId) && connectedNodeIds.has(tId)
          ? 'url(#swiss-arrow-red)'
          : 'url(#swiss-arrow-black)';
      });

    const linkLabels = showProtocolLabels
      ? linkGroup
          .selectAll<SVGGElement, D3Link>('g.link-badge')
          .data(filteredLinks, (d) => d.id)
          .join('g')
          .attr('class', 'link-badge')
          .attr('opacity', (d) => {
            const sId = typeof d.source === 'object' ? (d.source as D3Node).id : d.source;
            const tId = typeof d.target === 'object' ? (d.target as D3Node).id : d.target;
            if (selectedNodeId || hoveredNodeId) {
              return connectedNodeIds.has(sId) && connectedNodeIds.has(tId) ? 1 : 0.25;
            }
            return 1;
          })
      : null;

    if (linkLabels) {
      linkLabels
        .append('rect')
        .attr('rx', 0)
        .attr('ry', 0)
        .attr('fill', '#FFFFFF')
        .attr('stroke', '#000000')
        .attr('stroke-width', 0.8)
        .attr('height', 14);

      linkLabels
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 10.5)
        .attr('font-size', '8px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '600')
        .attr('fill', '#000000')
        .text((d) => d.protocol)
        .each(function () {
          const bbox = (this as SVGTextElement).getBBox();
          const parent = d3.select((this as SVGTextElement).parentNode as SVGGElement);
          parent
            .select('rect')
            .attr('x', bbox.x - 4)
            .attr('y', bbox.y - 1)
            .attr('width', bbox.width + 8)
            .attr('height', bbox.height + 2);
        });
    }

    let particleTimer: d3.Timer | null = null;
    if (showParticles && !prefersReducedMotion && filteredLinks.length > 0) {
      const particleSquares = particleGroup
        .selectAll<SVGRectElement, D3Link>('rect.flow-particle')
        .data(filteredLinks, (d) => d.id)
        .join('rect')
        .attr('class', 'flow-particle')
        .attr('width', 5)
        .attr('height', 5)
        .attr('fill', '#DC2626');

      let offset = 0;
      particleTimer = d3.timer(() => {
        offset = (offset + 0.005) % 1;
        link.each(function (_d, i) {
          const pathEl = this as SVGPathElement;
          try {
            const totalLen = pathEl.getTotalLength();
            if (totalLen > 0) {
              const point = pathEl.getPointAtLength((offset * totalLen) % totalLen);
              particleSquares
                .filter((_, idx) => idx === i)
                .attr('x', point.x - 2.5)
                .attr('y', point.y - 2.5);
            }
          } catch {
            // ignore
          }
        });
      });
    }

    const node = nodeGroup
      .selectAll<SVGGElement, D3Node>('g.arch-node')
      .data(filteredNodes, (d) => d.id)
      .join('g')
      .attr('class', 'arch-node')
      .attr('cursor', 'pointer')
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (layoutMode === 'layered') {
              d.fx = null;
              d.fy = null;
            }
          })
      );

    const cardWidth = 142;
    const cardHeight = 62;

    node
      .append('rect')
      .attr('class', 'node-card-body')
      .attr('x', -cardWidth / 2)
      .attr('y', -cardHeight / 2)
      .attr('width', cardWidth)
      .attr('height', cardHeight)
      .attr('rx', 0)
      .attr('fill', (d) => (d.id === selectedNodeId ? '#F5F5F5' : '#FFFFFF'))
      .attr('stroke', (d) => {
        if (d.id === selectedNodeId || d.status === 'missing' || d.status === 'insecure') return '#DC2626';
        return '#000000';
      })
      .attr('stroke-width', (d) => (d.id === selectedNodeId || d.id === hoveredNodeId ? 2 : 1))
      .attr('stroke-dasharray', (d) => (d.status === 'missing' ? '4,3' : 'none'));

    // Top-right crisp status square
    node
      .append('rect')
      .attr('x', cardWidth / 2 - 12)
      .attr('y', -cardHeight / 2 + 6)
      .attr('width', 6)
      .attr('height', 6)
      .attr('fill', (d) => {
        if (d.status === 'insecure' || d.status === 'missing') return '#DC2626';
        if (d.status === 'optimal') return '#000000';
        return '#4B5563';
      });

    // Node Label
    node
      .append('text')
      .attr('x', -cardWidth / 2 + 10)
      .attr('y', -cardHeight / 2 + 20)
      .attr('fill', '#000000')
      .attr('font-size', '10.5px')
      .attr('font-weight', '700')
      .attr('font-family', 'Helvetica Neue, Helvetica, Arial, sans-serif')
      .text((d) => (d.label.length > 17 ? `${d.label.slice(0, 16)}…` : d.label));

    // Tech Label
    node
      .append('text')
      .attr('x', -cardWidth / 2 + 10)
      .attr('y', cardHeight / 2 - 20)
      .attr('fill', '#DC2626')
      .attr('font-size', '8.5px')
      .attr('font-weight', '600')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => (d.technologies[0] ? d.technologies[0] : d.type.toUpperCase()));

    // Status Text
    node
      .append('text')
      .attr('x', -cardWidth / 2 + 10)
      .attr('y', cardHeight / 2 - 8)
      .attr('fill', '#4B5563')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => (d.subComponents?.length ? `${d.subComponents.length} routes` : d.status.toUpperCase()));

    node
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        onNodeSelect?.(d);
      })
      .on('mouseenter', (_, d) => setHoveredNodeId(d.id))
      .on('mouseleave', () => setHoveredNodeId(null));

    svg.on('click', () => setSelectedNodeId(null));

    simulation.on('tick', () => {
      link.attr('d', (d) => {
        const source = d.source as D3Node;
        const target = d.target as D3Node;
        if (!source.x || !source.y || !target.x || !target.y) return '';
        if (layoutMode === 'layered') {
          const midX = (source.x + target.x) / 2;
          return `M${source.x},${source.y} C${midX},${source.y} ${midX},${target.y} ${target.x},${target.y}`;
        }
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.1;
        return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
      });

      if (linkLabels) {
        linkLabels.attr('transform', (d) => {
          const source = d.source as D3Node;
          const target = d.target as D3Node;
          if (!source.x || !source.y || !target.x || !target.y) return '';
          return `translate(${(source.x + target.x) / 2}, ${(source.y + target.y) / 2})`;
        });
      }

      node.attr('transform', (d) => {
        d.x = Math.max(cardWidth / 2 + 10, Math.min(width - cardWidth / 2 - 10, d.x || width / 2));
        d.y = Math.max(cardHeight / 2 + 64, Math.min(height - cardHeight / 2 - 20, d.y || height / 2));
        return `translate(${d.x}, ${d.y})`;
      });
    });

    return () => {
      simulation.stop();
      if (particleTimer) particleTimer.stop();
    };
  }, [
    d3Nodes,
    d3Links,
    dimensions,
    layoutMode,
    filterLayer,
    selectedNodeId,
    hoveredNodeId,
    connectedNodeIds,
    showParticles,
    showProtocolLabels,
    onNodeSelect,
  ]);

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `architecture-graph-${spec?.title?.toLowerCase().replace(/\s+/g, '-') || 'system'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div
      id="d3-architecture-diagram-root"
      className={`bg-[var(--white)] border border-[var(--black)] p-5 space-y-4 ${className}`}
    >
      {/* Toolbar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[var(--rule)]">
        <div>
          <div className="eyebrow font-mono">D3.js Force Topology Engine</div>
          <h2 className="text-lg font-bold text-[var(--black)] mt-0.5">
            Intent-to-Service Architecture Graph
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Visual map linking Frontend UI, Express Ingress, Gemini SDK, and Database layers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center border border-[var(--black)]">
            {(['layered', 'force', 'cluster'] as const).map((mode, idx) => (
              <button
                key={mode}
                type="button"
                onClick={() => setLayoutMode(mode)}
                className={`px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${
                  idx > 0 ? 'border-l border-[var(--black)]' : ''
                } ${
                  layoutMode === mode
                    ? 'bg-[var(--black)] text-[var(--white)]'
                    : 'bg-[var(--white)] text-[var(--black)] hover:bg-[var(--gray)]'
                }`}
              >
                {mode === 'layered' ? 'Tier Flow' : mode}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowParticles(!showParticles)}
            className={`px-2.5 py-1 border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
              showParticles
                ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setShowProtocolLabels(!showProtocolLabels)}
            className={`px-2.5 py-1 border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
              showProtocolLabels
                ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)]'
                : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Protocols</span>
          </button>

          <div className="flex items-center border border-[var(--rule)] bg-[var(--gray)]">
            <button
              type="button"
              onClick={handleZoomIn}
              aria-label="Zoom in architecture graph"
              className="p-1.5 text-[var(--black)] hover:bg-[var(--black)] hover:text-[var(--white)] transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              aria-label="Zoom out architecture graph"
              className="p-1.5 text-[var(--black)] hover:bg-[var(--black)] hover:text-[var(--white)] border-l border-[var(--rule)] transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              aria-label="Reset architecture graph zoom"
              className="p-1.5 text-[var(--black)] hover:bg-[var(--black)] hover:text-[var(--white)] border-l border-[var(--rule)] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportSVG}
            aria-label="Export architecture graph as SVG"
            className="p-1.5 border border-[var(--black)] bg-[var(--white)] text-[var(--black)] hover:bg-[var(--red)] hover:text-white hover:border-[var(--red)] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tier Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Tier:
          </span>
          <button
            type="button"
            onClick={() => setFilterLayer('all')}
            className={`px-2.5 py-1 border text-[11px] shrink-0 transition-colors ${
              filterLayer === 'all'
                ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)] font-semibold'
                : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)] hover:text-[var(--black)]'
            }`}
          >
            All ({d3Nodes.length})
          </button>
          {LAYER_CONFIG.map((layer) => {
            const count = d3Nodes.filter((n) => n.layerIndex === layer.index).length;
            return (
              <button
                key={layer.index}
                type="button"
                onClick={() => setFilterLayer(layer.index)}
                className={`px-2.5 py-1 border text-[11px] shrink-0 transition-colors ${
                  filterLayer === layer.index
                    ? 'bg-[var(--black)] text-[var(--white)] border-[var(--black)] font-semibold'
                    : 'bg-[var(--white)] text-[var(--text-muted)] border-[var(--rule)] hover:text-[var(--black)]'
                }`}
              >
                {layer.name.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

        <div className="bg-[var(--gray)] px-2.5 py-1 border border-[var(--black)] flex items-center gap-1.5 text-[11px] font-mono tabular-nums shrink-0">
          <span className="text-[var(--text-muted)]">Completeness:</span>
          <span className="font-bold text-[var(--red)]">{intentScore}%</span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        id="d3-canvas-container"
        className="relative w-full h-[460px] bg-[#FFFFFF] border border-[var(--black)] overflow-hidden select-none"
      >
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

        <div className="absolute bottom-3 left-3 pointer-events-none bg-white px-3 py-1 border border-black text-[10px] font-mono text-black">
          Click node to inspect • Drag to position • Scroll to zoom
        </div>
      </div>

      {/* Selected Node Inspector */}
      {activeSelectedNode && (
        <div id="d3-node-inspector" className="bg-[var(--gray)] p-4 border border-[var(--black)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--rule)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[var(--black)] text-[var(--white)] flex items-center justify-center font-mono font-bold text-xs shrink-0">
                {activeSelectedNode.type.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--black)] font-mono">
                    {activeSelectedNode.label}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--white)] text-[var(--text-muted)] border border-[var(--rule)]">
                    {activeSelectedNode.layerName}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-mono">
                  ID: #{activeSelectedNode.id}
                </p>
              </div>
            </div>

            <div>
              {activeSelectedNode.status === 'optimal' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 bg-[var(--black)] text-[var(--white)] font-semibold">
                  <Check className="w-3 h-3" /> Optimal Spec
                </span>
              )}
              {activeSelectedNode.status === 'active' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 bg-[var(--white)] text-[var(--black)] border border-[var(--black)] font-semibold">
                  <Check className="w-3 h-3" /> Declared
                </span>
              )}
              {activeSelectedNode.status === 'insecure' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 bg-[var(--red)] text-white font-semibold">
                  <AlertTriangle className="w-3 h-3" /> Insecure Boundary
                </span>
              )}
              {activeSelectedNode.status === 'missing' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 bg-[var(--white)] text-[var(--red)] border border-[var(--red)] font-semibold">
                  <XCircle className="w-3 h-3" /> Missing from Prompt
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-[var(--black)] leading-relaxed">
            {activeSelectedNode.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1.5 font-mono">
                Tech Bindings
              </span>
              <div className="flex flex-wrap gap-1">
                {activeSelectedNode.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[var(--gray)] text-[var(--black)] font-mono text-[10px] border border-[var(--rule)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1.5 font-mono">
                Connected Protocols
              </span>
              <div className="space-y-1 font-mono text-[10px] text-[var(--black)]">
                {d3Links
                  .filter((l) => {
                    const sId = typeof l.source === 'object' ? (l.source as D3Node).id : l.source;
                    const tId = typeof l.target === 'object' ? (l.target as D3Node).id : l.target;
                    return sId === activeSelectedNode.id || tId === activeSelectedNode.id;
                  })
                  .map((l, idx) => {
                    const sId = typeof l.source === 'object' ? (l.source as D3Node).id : l.source;
                    const tId = typeof l.target === 'object' ? (l.target as D3Node).id : l.target;
                    const isOut = sId === activeSelectedNode.id;
                    return (
                      <div key={idx} className="flex items-center gap-1 truncate">
                        <span className={isOut ? 'text-[var(--red)] font-bold' : 'text-[var(--black)] font-bold'}>
                          {isOut ? 'OUT:' : 'IN:'}
                        </span>
                        <span className="font-semibold">{l.protocol}</span>
                        <span className="text-[var(--text-muted)]">
                          ({isOut ? tId.replace('node-', '') : sId.replace('node-', '')})
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="p-3 bg-[var(--white)] border border-[var(--rule)]">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1.5 font-mono">
                Directive Guidance
              </span>
              <p className="text-[11px] text-[var(--black)] leading-snug">
                {activeSelectedNode.status === 'missing'
                  ? 'Add explicit clauses for database schemas or state hooks to enforce deterministic code generation.'
                  : activeSelectedNode.status === 'insecure'
                  ? 'Instruct AI to keep secrets in server-side process.env and proxy requests through /api/ routes.'
                  : 'High architectural precision detected. Preserves single-responsibility principles in full-stack code.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
