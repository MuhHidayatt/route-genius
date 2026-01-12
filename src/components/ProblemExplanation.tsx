/**
 * PROBLEM EXPLANATION COMPONENT
 * 
 * Provides a clear, educational overview of the delivery optimization problem
 * for academic understanding.
 */

import { Truck, MapPin, Clock, Target, ArrowRight, Package } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function ProblemExplanation() {
  return (
    <div className="card-elevated p-6 animate-fade-in">
      <h2 className="section-header flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Problem Overview
      </h2>
      
      <div className="space-y-4 text-sm text-muted-foreground">
        <p className="leading-relaxed">
          This system optimizes delivery routes for a <strong className="text-foreground">single courier</strong> delivering 
          multiple orders in Pontianak City. The goal is to find the <strong className="text-foreground">optimal sequence</strong> of 
          deliveries that minimizes total cost.
        </p>

        <Accordion type="single" collapsible className="w-full">
          {/* The Problem */}
          <AccordionItem value="problem">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                What is the problem?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                  <span>A courier starts at a <strong className="text-foreground">depot</strong> (fixed starting location)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                  <span>Multiple <strong className="text-foreground">orders</strong> must be delivered, each with a location and deadline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                  <span>The courier must decide <strong className="text-foreground">which order to deliver next</strong> at each step</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                  <span>Late deliveries incur a <strong className="text-foreground">penalty</strong></span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Multistage Decision Process */}
          <AccordionItem value="stages">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Multistage Decision Process
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                This is a <strong className="text-foreground">multistage decision problem</strong> where:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Each <strong className="text-foreground">stage</strong> represents delivering one order</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>At each stage, we <strong className="text-foreground">decide</strong> which remaining order to deliver next</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>The system uses <strong className="text-foreground">backward recursion</strong> — starting from the final state (all orders delivered) and working backwards</span>
                </li>
              </ul>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg font-mono text-xs">
                Stage N → Stage N-1 → ... → Stage 1 → Initial State
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* State Variables */}
          <AccordionItem value="state">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                State Variables
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                A <strong className="text-foreground">state</strong> captures everything we need to make optimal decisions:
              </p>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-xs">current_location</p>
                    <p className="text-xs">Where the courier is right now (latitude, longitude)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Package className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-xs">remaining_orders</p>
                    <p className="text-xs">Which orders haven't been delivered yet</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-xs">current_time</p>
                    <p className="text-xs">The accumulated time since starting</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Cost Function */}
          <AccordionItem value="cost">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                Cost Function
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                For each delivery step, the cost is calculated as:
              </p>
              <div className="p-3 bg-muted/50 rounded-lg font-mono text-center my-3">
                <span className="text-primary">cost</span> = α × <span className="text-blue-500">distance</span> + β × <span className="text-green-500">travel_time</span> + γ × <span className="text-orange-500">delay_penalty</span>
              </div>
              <ul className="space-y-1 text-xs">
                <li><strong className="text-blue-500">α (alpha)</strong>: Weight for distance in kilometers</li>
                <li><strong className="text-green-500">β (beta)</strong>: Weight for travel time in minutes</li>
                <li><strong className="text-orange-500">γ (gamma)</strong>: Weight for late delivery penalty</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
