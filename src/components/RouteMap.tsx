import { OptimizationResult, Order, DEPOT_LOCATION } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home, ArrowRight } from "lucide-react";

interface RouteMapProps {
  result: OptimizationResult;
  orders: Order[];
}

const RouteMap = ({ result, orders }: RouteMapProps) => {
  // Calculate bounds for the map
  const allPoints = [
    DEPOT_LOCATION,
    ...orders.map(o => ({ latitude: o.latitude, longitude: o.longitude }))
  ];
  
  const minLat = Math.min(...allPoints.map(p => p.latitude));
  const maxLat = Math.max(...allPoints.map(p => p.latitude));
  const minLng = Math.min(...allPoints.map(p => p.longitude));
  const maxLng = Math.max(...allPoints.map(p => p.longitude));
  
  // Add padding
  const padding = 0.02;
  const latRange = (maxLat - minLat) || 0.1;
  const lngRange = (maxLng - minLng) || 0.1;
  
  // SVG dimensions
  const width = 600;
  const height = 400;
  
  // Transform coordinates to SVG space
  const toSvgX = (lng: number) => {
    return ((lng - minLng + padding) / (lngRange + 2 * padding)) * width;
  };
  
  const toSvgY = (lat: number) => {
    // Invert Y axis for proper map orientation
    return height - ((lat - minLat + padding) / (latRange + 2 * padding)) * height;
  };
  
  // Build route path
  const routePoints: { x: number; y: number; label: string; isDepot: boolean; stepNumber: number }[] = [];
  
  // Start at depot
  routePoints.push({
    x: toSvgX(DEPOT_LOCATION.longitude),
    y: toSvgY(DEPOT_LOCATION.latitude),
    label: "Depot",
    isDepot: true,
    stepNumber: 0
  });
  
  // Add each delivery step
  result.sequence.forEach((step, index) => {
    routePoints.push({
      x: toSvgX(step.order.longitude),
      y: toSvgY(step.order.latitude),
      label: step.order.order_id,
      isDepot: false,
      stepNumber: index + 1
    });
  });

  // Generate path string for the route
  const pathD = routePoints
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Visualisasi Rute Pengiriman
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Peta menunjukkan urutan kunjungan dari depot ke setiap titik pengiriman
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative bg-muted/30 rounded-lg p-4 overflow-hidden">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-auto"
            style={{ maxHeight: '400px' }}
          >
            {/* Background grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/30" />
              </pattern>
              {/* Arrow marker for route direction */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" className="fill-primary" />
              </marker>
            </defs>
            <rect width={width} height={height} fill="url(#grid)" />
            
            {/* Route line with arrows */}
            <path
              d={pathD}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-md"
            />
            
            {/* Route segments with direction arrows */}
            {routePoints.slice(0, -1).map((point, i) => {
              const nextPoint = routePoints[i + 1];
              const midX = (point.x + nextPoint.x) / 2;
              const midY = (point.y + nextPoint.y) / 2;
              const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
              
              return (
                <g key={`arrow-${i}`}>
                  {/* Direction arrow at midpoint */}
                  <polygon
                    points="-6,-4 6,0 -6,4"
                    fill="hsl(var(--primary))"
                    transform={`translate(${midX}, ${midY}) rotate(${angle})`}
                    className="drop-shadow-sm"
                  />
                </g>
              );
            })}
            
            {/* Location markers */}
            {routePoints.map((point, index) => (
              <g key={index}>
                {point.isDepot ? (
                  // Depot marker
                  <>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="20"
                      className="fill-secondary stroke-secondary-foreground"
                      strokeWidth="2"
                    />
                    <text
                      x={point.x}
                      y={point.y + 5}
                      textAnchor="middle"
                      className="fill-secondary-foreground text-xs font-bold"
                    >
                      D
                    </text>
                  </>
                ) : (
                  // Delivery point marker
                  <>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="16"
                      className="fill-primary stroke-primary-foreground"
                      strokeWidth="2"
                    />
                    <text
                      x={point.x}
                      y={point.y + 5}
                      textAnchor="middle"
                      className="fill-primary-foreground text-xs font-bold"
                    >
                      {point.stepNumber}
                    </text>
                  </>
                )}
              </g>
            ))}
          </svg>
          
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs font-bold text-secondary-foreground">D</span>
              </div>
              <span className="text-muted-foreground">Depot (Titik Awal)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">1</span>
              </div>
              <span className="text-muted-foreground">Urutan Pengiriman</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Arah Perjalanan</span>
            </div>
          </div>
        </div>
        
        {/* Route summary */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Urutan Kunjungan:
          </h4>
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded font-medium">
              Depot
            </span>
            {result.sequence.map((step, index) => (
              <div key={index} className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="px-2 py-1 bg-primary/10 text-primary rounded font-medium">
                  {step.order.order_id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteMap;
