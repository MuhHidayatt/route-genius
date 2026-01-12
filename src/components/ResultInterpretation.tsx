/**
 * RESULT INTERPRETATION COMPONENT
 * 
 * Provides human-readable explanations of why the optimal route was chosen
 * and how different factors influenced the decision.
 */

import { RouteExplanation, OptimizationResult } from '@/lib/types';
import { 
  Lightbulb, 
  TrendingUp, 
  Scale, 
  CheckCircle2,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ResultInterpretationProps {
  result: OptimizationResult;
}

export function ResultInterpretation({ result }: ResultInterpretationProps) {
  const { explanation, costContributions, totalCost } = result;

  // Calculate percentages
  const distancePct = (costContributions.distanceContribution / totalCost) * 100;
  const timePct = (costContributions.timeContribution / totalCost) * 100;
  const delayPct = (costContributions.delayContribution / totalCost) * 100;

  return (
    <div className="card-elevated p-6 animate-fade-in">
      <h3 className="section-header flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        Result Interpretation
      </h3>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground leading-relaxed">
            {explanation.summary}
          </p>
        </div>
      </div>

      {/* Cost Breakdown Visualization */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          Cost Contribution Breakdown
        </h4>
        
        {/* Stacked Bar */}
        <div className="h-8 rounded-lg overflow-hidden flex mb-2">
          <div 
            className="bg-blue-500 flex items-center justify-center text-xs font-medium text-white"
            style={{ width: `${distancePct}%` }}
          >
            {distancePct > 10 && `${distancePct.toFixed(0)}%`}
          </div>
          <div 
            className="bg-green-500 flex items-center justify-center text-xs font-medium text-white"
            style={{ width: `${timePct}%` }}
          >
            {timePct > 10 && `${timePct.toFixed(0)}%`}
          </div>
          <div 
            className="bg-orange-500 flex items-center justify-center text-xs font-medium text-white"
            style={{ width: `${delayPct}%` }}
          >
            {delayPct > 10 && `${delayPct.toFixed(0)}%`}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500" />
            <span>Distance: {costContributions.distanceContribution.toFixed(2)} ({distancePct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-500" />
            <span>Time: {costContributions.timeContribution.toFixed(2)} ({timePct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-orange-500" />
            <span>Delay: {costContributions.delayContribution.toFixed(2)} ({delayPct.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Tradeoff Analysis */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Tradeoff Analysis</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {explanation.tradeoffAnalysis}
        </p>
      </div>

      {/* Key Decisions */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="decisions">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Key Decisions Explained ({explanation.keyDecisions.length} steps)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              Each step shows why a particular order was chosen over alternatives.
            </p>
            <div className="space-y-2">
              {explanation.keyDecisions.slice(0, 10).map((decision, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">
                    {decision.step}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground text-sm">
                        {decision.orderId}
                      </span>
                      <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {decision.alternativesConsidered} option{decision.alternativesConsidered !== 1 ? 's' : ''} considered
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {decision.reason}
                    </p>
                  </div>
                </div>
              ))}
              {explanation.keyDecisions.length > 10 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  ... and {explanation.keyDecisions.length - 10} more decisions
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Academic Note */}
      <div className="mt-6 p-3 rounded-lg border border-dashed border-border">
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-foreground">Academic Note:</strong> This solution was obtained using 
          <strong className="text-primary"> Backward Recursion Dynamic Programming</strong> with 
          top-down memoization, following the Bellman optimality principle.
          No greedy shortcuts or external solvers were used.
        </p>
      </div>
    </div>
  );
}
