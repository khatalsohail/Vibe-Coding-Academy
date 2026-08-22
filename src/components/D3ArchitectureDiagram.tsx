import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Shield,
  Database,
  Server,
  Globe,
  Cpu,
  HardDrive,
  Info,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Sliders,
  Filter,
  ArrowRight,
  Eye,
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
  layerIndex: number; // 0: Frontend, 1: Ingress/Gateway, 2: Microservices/API, 3: Database & Persistence
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
  { index: 0, name: 'Frontend Client Tier', color: '#06b6d4', icon: 'Globe', desc: 'UI Components, State & Client Routing' },
  { index: 1, name: 'API Gateway & Ingress Tier', color: '#10b981', icon: 'Server', desc: 'Route Handlers, OAuth & Reverse Proxy' },
  { index: 2, name: 'Services & Intelligence Tier', color: '#8b5cf6', icon: 'Cpu', desc: 'Business Logic, Gemini AI & Sync Hooks' },
  { index: 3, name: 'Database & Persistence Tier', color: '#3b82f6', icon: 'Database', desc: 'Firestore, Cloud SQL, Cache & Storage' },
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

  // Layout & display states
  const [layoutMode, setLayoutMode] = useState<'layered' | 'force' | 'cluster'>('layered');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterLayer, setFilterLayer] = useState<number | 'all'>('all');
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [showProtocolLabels, setShowProtocolLabels] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 500 });

  // Extract raw nodes & links either from spec or props
  const rawNodes = useMemo(() => {
    if (spec?.architectureNodes && spec.architectureNodes.length > 0) {
      return spec.architectureNodes;
    }
    if (propNodes && propNodes.length > 0) {
      return propNodes;
    }
    // Default fallback graph if none provided
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
    if (spec?.architectureLinks && spec.architectureLinks.length > 0) {
      return spec.architectureLinks;
    }
    if (propLinks && propLinks.length > 0) {
      return propLinks;
    }
    return [
      { source: 'node-client', target: 'node-gateway', protocol: 'HTTP/REST', description: 'API Requests' },
      { source: 'node-client', target: 'node-auth', protocol: 'OAuth 2.0', description: 'GSI Token Client' },
      { source: 'node-gateway', target: 'node-gemini', protocol: 'Server SDK', description: 'Prompt Compilation' },
      { source: 'node-gateway', target: 'node-firestore', protocol: 'Firestore SDK', description: 'Data Persistence' },
      { source: 'node-auth', target: 'node-drive', protocol: 'Bearer Token', description: 'Drive File Access' },
      { source: 'node-gateway', target: 'node-drive', protocol: 'Drive v3 API', description: 'Manifest Sync' },
    ];
  }, [spec, propLinks]);

  // Map to layer indices
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

  // Convert raw nodes into D3 nodes with layer assignments
  const d3Nodes: D3Node[] = useMemo(() => {
    return rawNodes.map((node) => {
      const layer = getLayerForNodeType(node.type);
      return {
        ...node,
        layerIndex: layer.index,
        layerName: layer.name,
      };
    });
  }, [rawNodes]);

  // Convert raw links
  const d3Links: D3Link[] = useMemo(() => {
    return rawLinks.map((link, idx) => ({
      id: `link-${idx}`,
      source: link.source,
      target: link.target,
      protocol: link.protocol,
      description: link.description,
    }));
  }, [rawLinks]);

  // Observe container size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.max(480, Math.floor(height)) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Selected node object
  const activeSelectedNode = useMemo(() => {
    if (!selectedNodeId) return d3Nodes[0] || null;
    return d3Nodes.find((n) => n.id === selectedNodeId) || d3Nodes[0] || null;
  }, [selectedNodeId, d3Nodes]);

  // Connected nodes map for hover/focus highlighting
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

  // Zoom control handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  };

  // Main D3 Rendering Engine
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const { width, height } = dimensions;
    const isMobile = width < 640;

    // Filter nodes if user selected specific layer
    const filteredNodes = filterLayer === 'all'
      ? [...d3Nodes]
      : d3Nodes.filter((n) => n.layerIndex === filterLayer);

    const validNodeIdSet = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = d3Links
      .filter((l) => {
        const sId = typeof l.source === 'object' ? (l.source as D3Node).id : l.source;
        const tId = typeof l.target === 'object' ? (l.target as D3Node).id : l.target;
        return validNodeIdSet.has(sId) && validNodeIdSet.has(tId);
      })
      .map((l) => ({ ...l })); // Clone for d3 simulation

    // Append Defs (Gradients, Markers, Glow Filters)
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter').attr('id', 'neon-glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Marker Arrowheads
    const protocols = ['HTTP/REST', 'OAuth 2.0', 'Firestore SDK', 'Drive v3 API', 'Server SDK', 'SQL', 'JWT', 'default'];
    const colors = {
      'HTTP/REST': '#06b6d4',
      'OAuth 2.0': '#f59e0b',
      'Firestore SDK': '#3b82f6',
      'Drive v3 API': '#10b981',
      'Server SDK': '#8b5cf6',
      'SQL': '#ec4899',
      'JWT': '#f97316',
      default: '#94a3b8',
    };

    protocols.forEach((proto) => {
      const color = colors[proto as keyof typeof colors] || colors.default;
      defs
        .append('marker')
        .attr('id', `arrowhead-${proto.replace(/[\s/.]/g, '-')}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 28)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-4L9,0L0,4')
        .attr('fill', color);
    });

    // Background Container for Zoom/Pan
    const g = svg.append('g').attr('class', 'zoomable-container');

    // Setup Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Draw Layer Bounding Bento Columns (if in layered or cluster mode)
    if (layoutMode === 'layered' && filterLayer === 'all') {
      const layerG = g.append('g').attr('class', 'layer-backgrounds');
      const colWidth = (width - 80) / 4;

      LAYER_CONFIG.forEach((layer, i) => {
        const xPos = 40 + i * colWidth;
        const colGroup = layerG.append('g').attr('class', `layer-col-${i}`);

        // Column background rect
        colGroup
          .append('rect')
          .attr('x', xPos + 6)
          .attr('y', 20)
          .attr('width', colWidth - 12)
          .attr('height', height - 40)
          .attr('rx', 20)
          .attr('fill', '#020617')
          .attr('fill-opacity', 0.6)
          .attr('stroke', layer.color)
          .attr('stroke-opacity', 0.15)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '4,4');

        // Column header label
        colGroup
          .append('text')
          .attr('x', xPos + 18)
          .attr('y', 45)
          .attr('fill', layer.color)
          .attr('font-size', isMobile ? '9px' : '11px')
          .attr('font-weight', '700')
          .attr('font-family', 'JetBrains Mono, monospace')
          .attr('letter-spacing', '1px')
          .text(`TIER 0${i + 1} • ${layer.name.toUpperCase()}`);

        colGroup
          .append('text')
          .attr('x', xPos + 18)
          .attr('y', 60)
          .attr('fill', '#64748b')
          .attr('font-size', '9px')
          .attr('font-family', 'sans-serif')
          .text(layer.desc);
      });
    }

    // Links container
    const linkGroup = g.append('g').attr('class', 'links-layer');
    // Particles container
    const particleGroup = g.append('g').attr('class', 'particles-layer');
    // Nodes container
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');

    // Create D3 Force Simulation
    const simulation = d3
      .forceSimulation<D3Node>(filteredNodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(filteredLinks)
          .id((d) => d.id)
          .distance(layoutMode === 'layered' ? 120 : 160)
          .strength(layoutMode === 'layered' ? 0.3 : 0.7)
      )
      .force('charge', d3.forceManyBody().strength(layoutMode === 'layered' ? -350 : -600))
      .force('collision', d3.forceCollide().radius(48).strength(0.8));

    // Mode-specific positioning forces
    if (layoutMode === 'layered') {
      const colWidth = (width - 80) / 4;
      simulation
        .force(
          'x',
          d3.forceX<D3Node>((d) => 40 + d.layerIndex * colWidth + colWidth / 2).strength(0.85)
        )
        .force('y', d3.forceY<D3Node>(height / 2).strength(0.25));
    } else if (layoutMode === 'cluster') {
      const clusterCenters = [
        { x: width * 0.25, y: height * 0.3 },
        { x: width * 0.75, y: height * 0.3 },
        { x: width * 0.25, y: height * 0.7 },
        { x: width * 0.75, y: height * 0.7 },
      ];
      simulation
        .force(
          'x',
          d3.forceX<D3Node>((d) => clusterCenters[d.layerIndex % 4].x).strength(0.6)
        )
        .force(
          'y',
          d3.forceY<D3Node>((d) => clusterCenters[d.layerIndex % 4].y).strength(0.6)
        );
    } else {
      simulation.force('center', d3.forceCenter(width / 2, height / 2));
    }

    // Render Links
    const link = linkGroup
      .selectAll<SVGPathElement, D3Link>('path')
      .data(filteredLinks, (d) => d.id)
      .join('path')
      .attr('class', 'arch-link')
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const protoKey = d.protocol as keyof typeof colors;
        return colors[protoKey] || colors.default;
      })
      .attr('stroke-width', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as D3Node).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as D3Node).id : d.target;
        return connectedNodeIds.has(sId) && connectedNodeIds.has(tId) ? 2.5 : 1.5;
      })
      .attr('stroke-opacity', (d) => {
        const sId = typeof d.source === 'object' ? (d.source as D3Node).id : d.source;
        const tId = typeof d.target === 'object' ? (d.target as D3Node).id : d.target;
        if (selectedNodeId || hoveredNodeId) {
          return connectedNodeIds.has(sId) && connectedNodeIds.has(tId) ? 0.9 : 0.15;
        }
        return 0.55;
      })
      .attr('marker-end', (d) => {
        const key = d.protocol.replace(/[\s/.]/g, '-');
        return `url(#arrowhead-${key})`;
      });

    // Link Protocol Badges
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
              return connectedNodeIds.has(sId) && connectedNodeIds.has(tId) ? 1 : 0.2;
            }
            return 0.85;
          })
      : null;

    if (linkLabels) {
      linkLabels
        .append('rect')
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('fill', '#020617')
        .attr('stroke', (d) => {
          const protoKey = d.protocol as keyof typeof colors;
          return colors[protoKey] || colors.default;
        })
        .attr('stroke-width', 0.8)
        .attr('height', 14);

      linkLabels
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', 10.5)
        .attr('font-size', '8px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-weight', '600')
        .attr('fill', (d) => {
          const protoKey = d.protocol as keyof typeof colors;
          return colors[protoKey] || '#e2e8f0';
        })
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

    // Render Animated Data Flow Particles
    let particleTimer: d3.Timer | null = null;
    if (showParticles && filteredLinks.length > 0) {
      const particleCircles = particleGroup
        .selectAll<SVGCircleElement, D3Link>('circle.flow-particle')
        .data(filteredLinks, (d) => d.id)
        .join('circle')
        .attr('class', 'flow-particle')
        .attr('r', 3)
        .attr('fill', (d) => {
          const protoKey = d.protocol as keyof typeof colors;
          return colors[protoKey] || '#38bdf8';
        })
        .attr('filter', 'url(#neon-glow)');

      let offset = 0;
      particleTimer = d3.timer(() => {
        offset = (offset + 0.006) % 1;
        link.each(function (d, i) {
          const pathEl = this as SVGPathElement;
          try {
            const totalLen = pathEl.getTotalLength();
            if (totalLen > 0) {
              const point = pathEl.getPointAtLength((offset * totalLen) % totalLen);
              particleCircles
                .filter((_, idx) => idx === i)
                .attr('cx', point.x)
                .attr('cy', point.y);
            }
          } catch {
            // ignore layout shift edge cases
          }
        });
      });
    }

    // Render Nodes (Bento Cards / Visual Badges)
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

    // Node Card Width & Height
    const cardWidth = 140;
    const cardHeight = 64;

    // Node Outer Glow & Selection Ring
    node
      .append('rect')
      .attr('class', 'node-glow-ring')
      .attr('x', -cardWidth / 2 - 2)
      .attr('y', -cardHeight / 2 - 2)
      .attr('width', cardWidth + 4)
      .attr('height', cardHeight + 4)
      .attr('rx', 14)
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        if (d.id === selectedNodeId) return '#06b6d4';
        if (d.status === 'optimal') return '#10b981';
        if (d.status === 'insecure') return '#f59e0b';
        if (d.status === 'missing') return '#f43f5e';
        return '#06b6d4';
      })
      .attr('stroke-width', (d) => (d.id === selectedNodeId || d.id === hoveredNodeId ? 2.5 : 1))
      .attr('stroke-opacity', (d) => {
        if (d.id === selectedNodeId) return 1;
        if (d.id === hoveredNodeId) return 0.9;
        if (connectedNodeIds.has(d.id)) return 0.7;
        return selectedNodeId || hoveredNodeId ? 0.15 : 0.4;
      })
      .attr('stroke-dasharray', (d) => (d.status === 'missing' ? '4,4' : 'none'))
      .attr('filter', (d) => (d.id === selectedNodeId ? 'url(#neon-glow)' : 'none'));

    // Node Card Body
    node
      .append('rect')
      .attr('class', 'node-card-body')
      .attr('x', -cardWidth / 2)
      .attr('y', -cardHeight / 2)
      .attr('width', cardWidth)
      .attr('height', cardHeight)
      .attr('rx', 12)
      .attr('fill', (d) => {
        if (d.id === selectedNodeId) return '#0f172a';
        return '#090d16';
      })
      .attr('fill-opacity', 0.94)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1);

    // Node Type Icon Indicator Circle
    const iconGroup = node.append('g').attr('transform', `translate(${-cardWidth / 2 + 16}, ${-cardHeight / 2 + 16})`);

    iconGroup
      .append('circle')
      .attr('r', 10)
      .attr('fill', (d) => {
        const layer = LAYER_CONFIG[d.layerIndex] || LAYER_CONFIG[0];
        return `${layer.color}20`;
      })
      .attr('stroke', (d) => {
        const layer = LAYER_CONFIG[d.layerIndex] || LAYER_CONFIG[0];
        return layer.color;
      })
      .attr('stroke-width', 1);

    // Status dot
    node
      .append('circle')
      .attr('cx', cardWidth / 2 - 12)
      .attr('cy', -cardHeight / 2 + 12)
      .attr('r', 3.5)
      .attr('fill', (d) => {
        if (d.status === 'optimal') return '#10b981';
        if (d.status === 'insecure') return '#f59e0b';
        if (d.status === 'missing') return '#f43f5e';
        return '#06b6d4';
      });

    // Node Label
    node
      .append('text')
      .attr('x', -cardWidth / 2 + 32)
      .attr('y', -cardHeight / 2 + 18)
      .attr('fill', '#ffffff')
      .attr('font-size', '10.5px')
      .attr('font-weight', '700')
      .attr('font-family', 'sans-serif')
      .text((d) => (d.label.length > 15 ? `${d.label.slice(0, 14)}…` : d.label));

    // Node Tech Badge
    node
      .append('text')
      .attr('x', -cardWidth / 2 + 12)
      .attr('y', cardHeight / 2 - 20)
      .attr('fill', '#94a3b8')
      .attr('font-size', '8.5px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => (d.technologies[0] ? `⚡ ${d.technologies[0]}` : d.type.toUpperCase()));

    // Node Subcomponents count badge
    node
      .append('text')
      .attr('x', -cardWidth / 2 + 12)
      .attr('y', cardHeight / 2 - 8)
      .attr('fill', '#64748b')
      .attr('font-size', '8px')
      .attr('font-family', 'JetBrains Mono, monospace')
      .text((d) => (d.subComponents?.length ? `${d.subComponents.length} sub-routes` : d.status.toUpperCase()));

    // Node Click & Hover Interactions
    node
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        onNodeSelect?.(d);
      })
      .on('mouseenter', (_, d) => {
        setHoveredNodeId(d.id);
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
      });

    // SVG background click clears selection
    svg.on('click', () => {
      setSelectedNodeId(null);
    });

    // Simulation Tick Update
    simulation.on('tick', () => {
      // Calculate curved paths
      link.attr('d', (d) => {
        const source = d.source as D3Node;
        const target = d.target as D3Node;
        if (!source.x || !source.y || !target.x || !target.y) return '';

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.1;

        if (layoutMode === 'layered') {
          // Smooth horizontal bezier curve between layers
          const midX = (source.x + target.x) / 2;
          return `M${source.x},${source.y} C${midX},${source.y} ${midX},${target.y} ${target.x},${target.y}`;
        }

        // Standard arc
        return `M${source.x},${source.y}A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
      });

      // Update link labels position
      if (linkLabels) {
        linkLabels.attr('transform', (d) => {
          const source = d.source as D3Node;
          const target = d.target as D3Node;
          if (!source.x || !source.y || !target.x || !target.y) return '';
          const x = (source.x + target.x) / 2;
          const y = (source.y + target.y) / 2;
          return `translate(${x}, ${y})`;
        });
      }

      // Update node positions with bounded box
      node.attr('transform', (d) => {
        d.x = Math.max(cardWidth / 2 + 10, Math.min(width - cardWidth / 2 - 10, d.x || width / 2));
        d.y = Math.max(cardHeight / 2 + 20, Math.min(height - cardHeight / 2 - 20, d.y || height / 2));
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

  // Export as SVG
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
      className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl ${className}`}
    >
      {/* Top Header & Interactive Graph Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              D3.JS FORCE TOPOLOGY ENGINE
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
              Interactive Node-Link
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight font-mono mt-1">
            Intent-to-Service Architecture Graph
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time visual map linking Frontend UI, Express API Gateways, Gemini Intelligence, and Database layers.
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Layout Mode Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setLayoutMode('layered')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold ${
                layoutMode === 'layered' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Hierarchical Tier Flow"
            >
              Tier Flow
            </button>
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold ${
                layoutMode === 'force' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Organic Force Simulation"
            >
              Force
            </button>
            <button
              onClick={() => setLayoutMode('cluster')}
              className={`px-2.5 py-1 rounded-lg transition text-[11px] font-semibold ${
                layoutMode === 'cluster' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
              title="Bento Cluster Layout"
            >
              Cluster
            </button>
          </div>

          {/* Toggle Flow Particles */}
          <button
            onClick={() => setShowParticles(!showParticles)}
            className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
              showParticles
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Toggle Animated Data Flow Particles"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Flow</span>
          </button>

          {/* Toggle Protocol Labels */}
          <button
            onClick={() => setShowProtocolLabels(!showProtocolLabels)}
            className={`px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
              showProtocolLabels
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
            title="Toggle Protocol Link Labels"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Protocols</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export SVG */}
          <button
            onClick={handleExportSVG}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition"
            title="Export Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 shrink-0">
          <Filter className="w-3 h-3" /> Filter Tier:
        </span>
        <button
          onClick={() => setFilterLayer('all')}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            filterLayer === 'all'
              ? 'bg-slate-800 text-white font-semibold border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({d3Nodes.length})
        </button>
        {LAYER_CONFIG.map((layer) => {
          const count = d3Nodes.filter((n) => n.layerIndex === layer.index).length;
          return (
            <button
              key={layer.index}
              onClick={() => setFilterLayer(layer.index)}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1.5 ${
                filterLayer === layer.index
                  ? 'bg-slate-800 text-white font-semibold border'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{
                borderColor: filterLayer === layer.index ? layer.color : 'transparent',
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: layer.color }}></span>
              <span>{layer.name.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-500">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Interactive D3 Canvas Container */}
      <div
        ref={containerRef}
        id="d3-canvas-container"
        className="relative w-full h-[460px] bg-[#020617] rounded-2xl border border-slate-800/90 overflow-hidden shadow-inner select-none"
      >
        <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing block"></svg>

        {/* Floating Quick Hint */}
        <div className="absolute bottom-3 left-3 pointer-events-none bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Click node to inspect • Drag to re-position • Scroll to zoom</span>
        </div>

        {/* Score Stamp Badge */}
        <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Arch Completeness:</span>
          <span className="font-bold text-cyan-400">{intentScore}%</span>
        </div>
      </div>

      {/* Active Node Deep-Dive Inspector Panel */}
      {activeSelectedNode && (
        <div
          id="d3-node-inspector"
          className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                style={{
                  backgroundColor: `${LAYER_CONFIG[activeSelectedNode.layerIndex]?.color || '#06b6d4'}20`,
                  color: LAYER_CONFIG[activeSelectedNode.layerIndex]?.color || '#06b6d4',
                  border: `1px solid ${LAYER_CONFIG[activeSelectedNode.layerIndex]?.color || '#06b6d4'}40`,
                }}
              >
                {activeSelectedNode.type.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-mono">{activeSelectedNode.label}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-slate-800">
                    {activeSelectedNode.layerName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">ID: #{activeSelectedNode.id}</p>
              </div>
            </div>

            {/* Status pill */}
            <div>
              {activeSelectedNode.status === 'optimal' && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Optimal Specification
                </span>
              )}
              {activeSelectedNode.status === 'active' && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" /> Declared in Prompt
                </span>
              )}
              {activeSelectedNode.status === 'insecure' && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  <AlertTriangle className="w-3 h-3 text-amber-400" /> Insecure Boundary
                </span>
              )}
              {activeSelectedNode.status === 'missing' && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                  <XCircle className="w-3 h-3 text-rose-400" /> Missing from Prompt
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{activeSelectedNode.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Tech Stack Bindings */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">
                Tech Bindings
              </span>
              <div className="flex flex-wrap gap-1">
                {activeSelectedNode.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-950 text-cyan-300 rounded font-mono text-[10px] border border-cyan-900/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Ingress / Egress Protocols */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">
                Connected Protocols
              </span>
              <div className="space-y-1 font-mono text-[10px] text-slate-300">
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
                        <span className={isOut ? 'text-cyan-400' : 'text-emerald-400'}>
                          {isOut ? '→ OUT:' : '← IN:'}
                        </span>
                        <span className="font-semibold text-white">{l.protocol}</span>
                        <span className="text-slate-500">({isOut ? tId.replace('node-', '') : sId.replace('node-', '')})</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Vibe Coding Architectural Tip */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">
                Prompt Directive Guidance
              </span>
              <p className="text-[11px] text-slate-300 leading-snug">
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
