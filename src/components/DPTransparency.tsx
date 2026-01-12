/**
 * DP TRANSPARENCY COMPONENT
 * 
 * Shows intermediate outputs from the Dynamic Programming algorithm
 * for educational understanding of how memoization and recursion work.
 */

import { DPStatistics } from '@/lib/types';
import { 
  Database, 
  Repeat, 
  Layers, 
  ArrowDown,
  CheckCircle,
  RotateCcw,
  Save,
  Info
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DPTransparencyProps {
  statistics: DPStatistics;
}

export function DPTransparency({ statistics }: DPTransparencyProps) {
  return (
    <div className="card-elevated p-6 animate-fade-in">
      <h3 className="section-header flex items-center gap-2">
        <Database className="w-5 h-5 text-primary" />
        Dynamic Programming Transparency
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              This section shows how the DP algorithm works internally,
              including state evaluation and memoization statistics.
            </p>
          </TooltipContent>
        </Tooltip>
      </h3>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatBox
          icon={<Layers className="w-4 h-4" />}
          label="States Evaluated"
          value={statistics.totalStatesEvaluated}
          tooltip="Number of unique states computed by the DP algorithm"
        />
        <StatBox
          icon={<Repeat className="w-4 h-4" />}
          label="Memo Hits"
          value={statistics.totalMemoHits}
          tooltip="Times a cached result was reused (avoiding recomputation)"
        />
        <StatBox
          icon={<Database className="w-4 h-4" />}
          label="States Cached"
          value={statistics.uniqueStatesStored}
          tooltip="Total states stored in memoization cache"
        />
        <StatBox
          icon={<ArrowDown className="w-4 h-4" />}
          label="Max Depth"
          value={statistics.maxRecursionDepth}
          tooltip="Maximum recursion depth (equals number of orders)"
        />
      </div>

      {/* Efficiency Indicator */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-foreground">Memoization Efficiency</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {statistics.totalMemoHits > 0 ? (
            <>
              The algorithm avoided <strong className="text-foreground">{statistics.totalMemoHits}</strong> redundant 
              calculations by reusing cached results. This demonstrates how overlapping subproblems 
              are efficiently handled through memoization.
            </>
          ) : (
            <>
              With the current dataset, each state was unique (no overlapping subproblems detected).
              This can happen with small datasets or when time discretization creates distinct states.
            </>
          )}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* Memoization Examples */}
        <AccordionItem value="memo-examples">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Memoization Examples ({statistics.memoizationExamples.length} shown)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              Each memoized state stores the optimal cost-to-go and best next order from that state.
            </p>
            <div className="space-y-2">
              {statistics.memoizationExamples.map((example, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg bg-muted/30 border border-border text-xs"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">State #{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>
                      <span className="text-foreground/70">Location:</span>{' '}
                      <span className="font-mono">{example.currentLocationDescription}</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Time:</span>{' '}
                      <span className="font-mono">{example.currentTimeFormatted}</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Remaining:</span>{' '}
                      <span className="font-mono">
                        {example.remainingOrderIds.length > 0 
                          ? example.remainingOrderIds.slice(0, 3).join(', ')
                          : '(none)'}
                        {example.remainingOrderIds.length > 3 && '...'}
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Best Next:</span>{' '}
                      <span className="font-mono text-primary">
                        {example.bestNextOrder || 'Terminal'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <span className="text-foreground/70">Optimal Cost-to-Go:</span>{' '}
                    <span className="font-mono font-medium text-foreground">
                      {example.optimalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Recursion Trace */}
        <AccordionItem value="recursion-trace">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-primary" />
              Recursion Trace (first {Math.min(statistics.recursionTrace.length, 20)} steps)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              This trace shows how the algorithm evaluates states recursively.
            </p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {statistics.recursionTrace.slice(0, 20).map((step, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-2 text-xs py-1"
                  style={{ paddingLeft: `${step.depth * 12}px` }}
                >
                  <ActionIcon action={step.action} />
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">
                      {step.stateDescription}
                    </span>
                    {step.selectedOrder && (
                      <span className="ml-2 text-primary font-mono">
                        → {step.selectedOrder}
                      </span>
                    )}
                    {step.cost !== undefined && (
                      <span className="ml-2 text-foreground font-mono">
                        (cost: {step.cost.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Evaluate
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Memo Hit
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Memo Store
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Bellman Equation */}
        <AccordionItem value="bellman">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4 text-primary" />
              Bellman Equation Explained
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-3">
            <p className="text-xs text-muted-foreground">
              The algorithm uses the <strong className="text-foreground">Bellman equation</strong> for 
              backward recursion:
            </p>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm text-center">
              <div className="text-foreground">
                f(state) = <span className="text-primary">min</span> <sub className="text-xs">j ∈ remaining</sub> {'{'}
              </div>
              <div className="pl-8 text-foreground">
                cost(state → j) + f(next_state)
              </div>
              <div className="text-foreground">{'}'}</div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                <strong className="text-foreground">f(state)</strong>: Optimal cost-to-go from this state
              </li>
              <li>
                <strong className="text-foreground">min</strong>: Take the minimum over all choices
              </li>
              <li>
                <strong className="text-foreground">cost(state → j)</strong>: Immediate cost of delivering order j
              </li>
              <li>
                <strong className="text-foreground">f(next_state)</strong>: Optimal cost from the resulting state
              </li>
            </ul>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <strong className="text-primary">Base Case:</strong>{' '}
              <span className="text-muted-foreground">
                When remaining_orders is empty, f(state) = 0 (no more cost to incur)
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tooltip: string;
}

function StatBox({ icon, label, value, tooltip }: StatBoxProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="p-3 rounded-lg bg-muted/30 border border-border cursor-help">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            {icon}
            <span className="text-xs">{label}</span>
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {value.toLocaleString()}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ActionIcon({ action }: { action: 'evaluate' | 'memo_hit' | 'memo_store' }) {
  switch (action) {
    case 'evaluate':
      return <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />;
    case 'memo_hit':
      return <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1" />;
    case 'memo_store':
      return <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1" />;
  }
}
