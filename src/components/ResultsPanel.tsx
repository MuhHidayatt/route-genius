import { OptimizationResult } from '@/lib/types';
import { 
  Route, 
  Clock, 
  AlertTriangle, 
  Calculator, 
  Zap,
  MapPin 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ResultsPanelProps {
  result: OptimizationResult;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  tooltip?: string;
}

function StatCard({ icon, label, value, subValue, tooltip }: StatCardProps) {
  const content = (
    <div className="stat-card">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="stat-value">{value}</div>
      {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent><p className="text-sm">{tooltip}</p></TooltipContent>
      </Tooltip>
    );
  }
  return content;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<Route className="w-4 h-4" />}
          label="Total Distance"
          value={`${result.totalDistance.toFixed(2)} km`}
        />
        <StatCard
          icon={<Clock className="w-4 h-4" />}
          label="Total Time"
          value={formatTime(result.totalTravelTime)}
        />
        <StatCard
          icon={<AlertTriangle className="w-4 h-4" />}
          label="Total Delay"
          value={formatTime(result.totalDelayPenalty)}
          subValue={result.totalDelayPenalty > 0 ? 'Penalty incurred' : 'No delays'}
        />
        <StatCard
          icon={<Calculator className="w-4 h-4" />}
          label="Total Cost"
          value={result.totalCost.toFixed(2)}
          subValue="Weighted sum"
        />
        <StatCard
          icon={<Zap className="w-4 h-4" />}
          label="Computation"
          value={`${result.computationTime.toFixed(0)}ms`}
        />
      </div>

      {/* Optimal Sequence */}
      <div className="card-elevated p-6">
        <h3 className="section-header flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Optimal Delivery Sequence
        </h3>
        
        <div className="space-y-3">
          {/* Depot Start */}
          <div className="sequence-step opacity-60">
            <div className="sequence-number bg-muted text-muted-foreground">
              D
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Depot</p>
              <p className="text-sm text-muted-foreground">Starting point</p>
            </div>
          </div>
          
          {result.sequence.map((step, index) => (
            <div key={step.order.order_id} className="sequence-step">
              <div className="sequence-number">{index + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground">
                    {step.order.order_id}
                  </p>
                  {step.delayPenalty > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
                      <AlertTriangle className="w-3 h-3" />
                      {formatTime(step.delayPenalty)} late
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>Arrive: {formatDateTime(step.arrivalTime)}</span>
                  <span>Due: {formatDateTime(step.order.due_time)}</span>
                  <span>{step.distance.toFixed(2)} km</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-mono text-foreground">
                  +{step.stepCost.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">cost</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card-elevated overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="section-header mb-0">Delivery Schedule Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>#</th>
                <th>Order ID</th>
                <th>Location</th>
                <th>Arrival</th>
                <th>Due Time</th>
                <th>Distance</th>
                <th>Travel Time</th>
                <th>Delay</th>
                <th>Step Cost</th>
              </tr>
            </thead>
            <tbody>
              {result.sequence.map((step, index) => (
                <tr key={step.order.order_id}>
                  <td className="font-medium">{index + 1}</td>
                  <td className="font-mono text-primary">{step.order.order_id}</td>
                  <td className="font-mono text-xs">
                    {step.order.latitude.toFixed(4)}, {step.order.longitude.toFixed(4)}
                  </td>
                  <td>{formatDateTime(step.arrivalTime)}</td>
                  <td>{formatDateTime(step.order.due_time)}</td>
                  <td>{step.distance.toFixed(2)} km</td>
                  <td>{formatTime(step.travelTime)}</td>
                  <td className={step.delayPenalty > 0 ? 'text-warning font-medium' : ''}>
                    {formatTime(step.delayPenalty)}
                  </td>
                  <td className="font-mono">{step.stepCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-semibold">
                <td colSpan={5} className="text-right">Totals:</td>
                <td>{result.totalDistance.toFixed(2)} km</td>
                <td>{formatTime(result.totalTravelTime)}</td>
                <td>{formatTime(result.totalDelayPenalty)}</td>
                <td className="font-mono">{result.totalCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
