import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { StateGraphData, StateNode, StateEdge } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StateGraphProps {
  graphData: StateGraphData;
}

interface LayoutNode extends StateNode {
  x: number;
  y: number;
}

const NODE_RADIUS = 28;
const LEVEL_HEIGHT = 110;
const NODE_SPACING = 90;

export default function StateGraph({ graphData }: StateGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Layout nodes by depth (level)
  const { layoutNodes, layoutEdges, svgWidth, svgHeight } = useMemo(() => {
    const { nodes, edges } = graphData;
    if (nodes.length === 0) return { layoutNodes: [], layoutEdges: edges, svgWidth: 400, svgHeight: 200 };

    // Group nodes by depth
    const depthGroups = new Map<number, StateNode[]>();
    nodes.forEach(n => {
      const group = depthGroups.get(n.depth) || [];
      group.push(n);
      depthGroups.set(n.depth, group);
    });

    const maxDepth = Math.max(...Array.from(depthGroups.keys()));
    const positioned: LayoutNode[] = [];

    depthGroups.forEach((group, depth) => {
      const totalWidth = group.length * NODE_SPACING;
      const startX = -totalWidth / 2 + NODE_SPACING / 2;
      group.forEach((node, i) => {
        positioned.push({
          ...node,
          x: startX + i * NODE_SPACING,
          y: depth * LEVEL_HEIGHT + 60,
        });
      });
    });

    // Calculate bounds
    const xs = positioned.map(n => n.x);
    const ys = positioned.map(n => n.y);
    const padding = 80;
    const w = Math.max(400, (Math.max(...xs) - Math.min(...xs)) + padding * 2);
    const h = (maxDepth + 1) * LEVEL_HEIGHT + padding * 2;

    // Center
    const offsetX = w / 2;
    positioned.forEach(n => { n.x += offsetX; });

    return { layoutNodes: positioned, layoutEdges: edges, svgWidth: w, svgHeight: h };
  }, [graphData]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, LayoutNode>();
    layoutNodes.forEach(n => m.set(n.id, n));
    return m;
  }, [layoutNodes]);

  // Pan/zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.3, Math.min(2.5, z + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); setSelectedNode(null); };

  const getNodeColor = (node: LayoutNode) => {
    if (node.isInitial) return 'hsl(var(--primary))';
    if (node.isTerminal) return 'hsl(var(--chart-2))';
    if (graphData.optimalPath.includes(node.id)) return 'hsl(var(--chart-1))';
    return 'hsl(var(--muted-foreground) / 0.4)';
  };

  const getNodeFill = (node: LayoutNode) => {
    if (node.isInitial) return 'hsl(var(--primary) / 0.15)';
    if (node.isTerminal) return 'hsl(var(--chart-2) / 0.15)';
    if (graphData.optimalPath.includes(node.id)) return 'hsl(var(--chart-1) / 0.15)';
    return 'hsl(var(--muted) / 0.5)';
  };

  if (graphData.nodes.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Graf Dependensi State (Backward Recursion)</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(z => Math.min(2.5, z + 0.2))} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={resetView} className="p-1.5 rounded-md hover:bg-muted transition-colors">
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        <CardDescription>
          Visualisasi alur perhitungan dari terminal state (biaya = 0) menuju state awal melalui backward recursion.
          Garis tebal menunjukkan jalur optimal.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 px-6 pb-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: 'hsl(var(--primary))', background: 'hsl(var(--primary) / 0.15)' }} />
            State Awal (Depot)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: 'hsl(var(--chart-2))', background: 'hsl(var(--chart-2) / 0.15)' }} />
            Terminal State
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: 'hsl(var(--chart-1))', background: 'hsl(var(--chart-1) / 0.15)' }} />
            Jalur Optimal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: 'hsl(var(--muted-foreground) / 0.4)', background: 'hsl(var(--muted) / 0.5)' }} />
            State Lainnya
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 border-t-2 border-dashed" style={{ borderColor: 'hsl(var(--muted-foreground) / 0.3)' }} />
            Transisi Non-optimal
          </span>
        </div>

        <div
          ref={containerRef}
          className="relative overflow-hidden bg-muted/20 border-t cursor-grab active:cursor-grabbing"
          style={{ height: Math.min(500, svgHeight * zoom + 40) }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top left',
              transition: isPanning ? 'none' : 'transform 0.15s ease',
            }}
          >
            <defs>
              <marker id="arrow-optimal" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(var(--chart-1))" />
              </marker>
              <marker id="arrow-normal" viewBox="0 0 10 6" refX="10" refY="3" markerWidth="6" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 3 L 0 6 z" fill="hsl(var(--muted-foreground) / 0.3)" />
              </marker>
            </defs>

            {/* Depth labels */}
            {Array.from(new Set(layoutNodes.map(n => n.depth))).sort((a, b) => a - b).map(depth => (
              <text
                key={`depth-${depth}`}
                x={14}
                y={depth * LEVEL_HEIGHT + 64}
                className="text-[10px] fill-muted-foreground/60"
                fontFamily="monospace"
              >
                d={depth}
              </text>
            ))}

            {/* Edges */}
            {layoutEdges.map((edge, i) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;

              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist === 0) return null;
              const nx = dx / dist;
              const ny = dy / dist;

              const x1 = from.x + nx * NODE_RADIUS;
              const y1 = from.y + ny * NODE_RADIUS;
              const x2 = to.x - nx * NODE_RADIUS;
              const y2 = to.y - ny * NODE_RADIUS;

              // Slight curve for non-optimal edges
              const midX = (x1 + x2) / 2 + (edge.isOptimal ? 0 : (i % 2 === 0 ? 12 : -12));
              const midY = (y1 + y2) / 2;

              return (
                <g key={`edge-${i}`}>
                  <path
                    d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
                    fill="none"
                    stroke={edge.isOptimal ? 'hsl(var(--chart-1))' : 'hsl(var(--muted-foreground) / 0.2)'}
                    strokeWidth={edge.isOptimal ? 2.5 : 1}
                    strokeDasharray={edge.isOptimal ? undefined : '4 3'}
                    markerEnd={edge.isOptimal ? 'url(#arrow-optimal)' : 'url(#arrow-normal)'}
                  />
                  {/* Edge label (order ID) */}
                  <text
                    x={midX + (edge.isOptimal ? 0 : 4)}
                    y={midY - 6}
                    textAnchor="middle"
                    className="text-[9px]"
                    fill={edge.isOptimal ? 'hsl(var(--chart-1))' : 'hsl(var(--muted-foreground) / 0.5)'}
                    fontFamily="monospace"
                    fontWeight={edge.isOptimal ? 600 : 400}
                  >
                    {edge.orderId}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {layoutNodes.map(node => {
              const isSelected = selectedNode === node.id;
              const color = getNodeColor(node);
              const fill = getNodeFill(node);
              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  className="cursor-pointer"
                >
                  {/* Glow for optimal path */}
                  {graphData.optimalPath.includes(node.id) && (
                    <circle cx={node.x} cy={node.y} r={NODE_RADIUS + 4} fill="none" stroke={color} strokeWidth={1} opacity={0.3} />
                  )}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={NODE_RADIUS}
                    fill={fill}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    className="text-[9px] font-semibold"
                    fill="hsl(var(--foreground))"
                  >
                    {node.isInitial ? 'Depot' : node.isTerminal ? '∅' : `S${node.depth}`}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 8}
                    textAnchor="middle"
                    className="text-[7px]"
                    fill="hsl(var(--muted-foreground))"
                    fontFamily="monospace"
                  >
                    {node.isTerminal ? 'f=0' : node.cost !== null ? `f=${node.cost.toFixed(1)}` : ''}
                  </text>
                  {/* Remaining count badge */}
                  {!node.isTerminal && (
                    <>
                      <circle cx={node.x + NODE_RADIUS * 0.7} cy={node.y - NODE_RADIUS * 0.7} r={8} fill="hsl(var(--background))" stroke={color} strokeWidth={1} />
                      <text x={node.x + NODE_RADIUS * 0.7} y={node.y - NODE_RADIUS * 0.7 + 3} textAnchor="middle" className="text-[7px] font-bold" fill={color}>
                        {node.remainingCount}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected node details */}
        {selectedNode && (() => {
          const node = nodeMap.get(selectedNode);
          if (!node) return null;
          return (
            <div className="px-6 py-3 border-t bg-muted/30 text-xs space-y-1">
              <div className="font-medium text-foreground">{node.label}</div>
              <div className="flex gap-3 text-muted-foreground">
                <span>Kedalaman: {node.depth}</span>
                <span>Sisa pesanan: {node.remainingCount}</span>
                {node.cost !== null && <span>Biaya optimal: {node.cost.toFixed(2)}</span>}
              </div>
              {graphData.optimalPath.includes(node.id) && (
                <Badge variant="secondary" className="text-[10px]">Bagian dari jalur optimal</Badge>
              )}
            </div>
          );
        })()}

        {/* Info */}
        <div className="px-6 py-3 border-t flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            Graf ini menunjukkan struktur dependensi antar state dalam proses backward recursion.
            Setiap node merepresentasikan state (lokasi saat ini, sisa pesanan, waktu).
            Angka pada badge menunjukkan jumlah pesanan tersisa.
            Perhitungan dimulai dari terminal state (∅, biaya = 0) dan bergerak mundur hingga state awal (Depot).
            Gunakan scroll untuk zoom dan drag untuk geser.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
