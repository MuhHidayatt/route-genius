export interface Order {
  order_id: string;
  latitude: number;
  longitude: number;
  order_time: Date;
  due_time: Date;
}

export interface Parameters {
  averageSpeed: number; // km/h
  alpha: number; // distance weight
  beta: number; // travel time weight
  gamma: number; // delay penalty weight
}

export interface DeliveryStep {
  order: Order;
  arrivalTime: Date;
  distance: number;
  travelTime: number;
  delayPenalty: number;
  stepCost: number;
  // Educational: cost breakdown for this step
  costBreakdown: {
    distanceCost: number;
    timeCost: number;
    delayCost: number;
  };
}

// Represents a single memoized state for educational display
export interface MemoizedStateExample {
  stateKey: string;
  currentLocationDescription: string;
  remainingOrderIds: string[];
  currentTimeFormatted: string;
  optimalCost: number;
  bestNextOrder: string | null;
}

// DP Statistics for transparency
export interface DPStatistics {
  totalStatesEvaluated: number;
  totalMemoHits: number;
  uniqueStatesStored: number;
  maxRecursionDepth: number;
  memoizationExamples: MemoizedStateExample[];
  recursionTrace: RecursionStep[];
}

// Trace of recursion for educational purposes
export interface RecursionStep {
  depth: number;
  stateDescription: string;
  action: 'evaluate' | 'memo_hit' | 'memo_store';
  selectedOrder?: string;
  cost?: number;
}

export interface OptimizationResult {
  sequence: DeliveryStep[];
  totalDistance: number;
  totalTravelTime: number;
  totalDelayPenalty: number;
  totalCost: number;
  computationTime: number;
  // Educational: DP statistics
  dpStatistics: DPStatistics;
  // Educational: Cost contribution breakdown
  costContributions: {
    distanceContribution: number;
    timeContribution: number;
    delayContribution: number;
  };
  // Educational: Explanation of why this route is optimal
  explanation: RouteExplanation;
}

export interface RouteExplanation {
  summary: string;
  keyDecisions: DecisionExplanation[];
  tradeoffAnalysis: string;
}

export interface DecisionExplanation {
  step: number;
  orderId: string;
  reason: string;
  alternativesConsidered: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export const DEPOT_LOCATION: Location = {
  latitude: -0.0263, // Pontianak city center
  longitude: 109.3425,
};
