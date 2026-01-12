/**
 * ============================================
 * DYNAMIC PROGRAMMING SOLVER
 * Backward Recursion with Top-Down Memoization
 * ============================================
 * 
 * This module implements the core optimization algorithm using
 * deterministic Dynamic Programming to solve the delivery routing problem.
 * 
 * BELLMAN EQUATION:
 * f(state) = min over all feasible next orders j: { cost(state, j) + f(next_state) }
 * 
 * BASE CASE:
 * f(state) = 0 when remaining_orders is empty
 * 
 * The algorithm uses memoization to avoid recomputing overlapping subproblems.
 */

import { 
  Order, 
  Parameters, 
  Location, 
  DeliveryStep, 
  OptimizationResult, 
  DPStatistics,
  MemoizedStateExample,
  RecursionStep,
  RouteExplanation,
  DecisionExplanation,
  DEPOT_LOCATION 
} from './types';

// ============================================
// DISTANCE CALCULATION
// ============================================

/**
 * Computes the Haversine distance between two geographic coordinates.
 * This gives the "great-circle" distance accounting for Earth's curvature.
 * 
 * @param loc1 - First location (latitude, longitude)
 * @param loc2 - Second location (latitude, longitude)
 * @returns Distance in kilometers
 */
export function compute_distance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const lat1Rad = loc1.latitude * Math.PI / 180;
  const lat2Rad = loc2.latitude * Math.PI / 180;
  const deltaLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const deltaLng = (loc2.longitude - loc1.longitude) * Math.PI / 180;

  // Haversine formula
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

// ============================================
// TRAVEL TIME CALCULATION
// ============================================

/**
 * Computes travel time based on distance and courier speed.
 * Assumes constant speed (no traffic, no stops).
 * 
 * @param distance - Distance in kilometers
 * @param speedKmh - Courier speed in km/h
 * @returns Travel time in minutes
 */
export function compute_travel_time(distance: number, speedKmh: number): number {
  return (distance / speedKmh) * 60; // Convert hours to minutes
}

// ============================================
// DELAY PENALTY CALCULATION
// ============================================

/**
 * Computes the delay penalty when arriving after the due time.
 * Penalty is zero if courier arrives on time or early.
 * 
 * @param arrivalTime - When the courier arrives
 * @param dueTime - When the delivery was due
 * @returns Delay penalty in minutes (0 if on time)
 */
export function compute_delay_penalty(arrivalTime: Date, dueTime: Date): number {
  const delayMs = arrivalTime.getTime() - dueTime.getTime();
  return Math.max(0, delayMs / 60000); // Convert to minutes, minimum 0
}

// ============================================
// STEP COST CALCULATION
// ============================================

/**
 * Computes the weighted cost for a single delivery step.
 * 
 * Cost = α × distance + β × travel_time + γ × delay_penalty
 * 
 * @param distance - Distance traveled (km)
 * @param travelTime - Time taken (minutes)
 * @param delayPenalty - Late penalty (minutes)
 * @param params - Weight parameters (α, β, γ)
 * @returns Weighted step cost
 */
export function compute_step_cost(
  distance: number,
  travelTime: number,
  delayPenalty: number,
  params: Parameters
): { 
  totalCost: number; 
  distanceCost: number; 
  timeCost: number; 
  delayCost: number;
} {
  const distanceCost = params.alpha * distance;
  const timeCost = params.beta * travelTime;
  const delayCost = params.gamma * delayPenalty;
  
  return {
    totalCost: distanceCost + timeCost + delayCost,
    distanceCost,
    timeCost,
    delayCost,
  };
}

// ============================================
// STATE KEY GENERATION
// ============================================

/**
 * Creates a unique string key for memoization.
 * The key encodes the complete state: location, remaining orders, and time.
 * 
 * @param currentLocation - Current courier position
 * @param remainingOrderIds - Set of undelivered order IDs
 * @param currentTime - Current time in milliseconds
 * @returns Unique state key string
 */
function create_state_key(
  currentLocation: Location,
  remainingOrderIds: Set<string>,
  currentTime: number
): string {
  const orderedIds = Array.from(remainingOrderIds).sort().join(',');
  const latKey = currentLocation.latitude.toFixed(6);
  const lngKey = currentLocation.longitude.toFixed(6);
  const timeKey = Math.round(currentTime / 60000); // Round to minutes for key
  
  return `${latKey}_${lngKey}|${orderedIds}|${timeKey}`;
}

/**
 * Creates a human-readable description of a state for educational purposes.
 */
function describe_state(
  currentLocation: Location,
  remainingOrderIds: Set<string>,
  currentTime: number,
  orderMap: Map<string, Order>
): string {
  const locDesc = `(${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})`;
  const remaining = remainingOrderIds.size;
  const timeStr = new Date(currentTime).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  return `At ${locDesc}, ${remaining} orders remaining, time: ${timeStr}`;
}

// ============================================
// DP RESULT INTERFACE
// ============================================

interface DPResult {
  cost: number;
  nextOrderId: string | null;
}

// ============================================
// MAIN DP SOLVER
// ============================================

/**
 * Solves the delivery optimization problem using Backward Recursion
 * Dynamic Programming with Top-Down Memoization.
 * 
 * ALGORITHM OVERVIEW:
 * 1. Start from initial state (depot, all orders remaining)
 * 2. For each state, try all possible next deliveries
 * 3. Recursively solve for the remaining orders
 * 4. Use memoization to cache computed states
 * 5. Extract optimal policy by backtracking through memo
 * 
 * @param orders - List of orders to deliver
 * @param params - Optimization parameters
 * @returns Complete optimization result with statistics
 */
export function dp_solve(
  orders: Order[],
  params: Parameters
): OptimizationResult {
  const startTime = performance.now();
  
  // Create order lookup map
  const orderMap = new Map<string, Order>();
  orders.forEach(order => orderMap.set(order.order_id, order));
  
  // ========== MEMOIZATION CACHE ==========
  const memo = new Map<string, DPResult>();
  
  // ========== STATISTICS TRACKING ==========
  let statesEvaluated = 0;
  let memoHits = 0;
  let maxDepth = 0;
  const recursionTrace: RecursionStep[] = [];
  
  // Find the earliest order time as the starting time
  const startingTime = Math.min(...orders.map(o => o.order_time.getTime()));

  /**
   * ========================================
   * RECURSIVE DP FUNCTION (TOP-DOWN)
   * ========================================
   * 
   * This is the core of the backward recursion.
   * 
   * BASE CASE: 
   *   If no orders remain, cost = 0 (terminal state)
   * 
   * RECURSIVE CASE:
   *   f(state) = min over all j in remaining_orders:
   *     { cost(current → j) + f(state after delivering j) }
   */
  function dp_recursive(
    currentLocation: Location,
    remainingOrderIds: Set<string>,
    currentTime: number,
    depth: number = 0
  ): DPResult {
    maxDepth = Math.max(maxDepth, depth);
    
    // ===== BASE CASE =====
    // No more orders to deliver - terminal state with zero cost
    if (remainingOrderIds.size === 0) {
      return { cost: 0, nextOrderId: null };
    }

    // ===== CHECK MEMOIZATION CACHE =====
    const stateKey = create_state_key(currentLocation, remainingOrderIds, currentTime);
    
    if (memo.has(stateKey)) {
      memoHits++;
      
      // Track for educational purposes (limit trace size)
      if (recursionTrace.length < 50) {
        recursionTrace.push({
          depth,
          stateDescription: describe_state(currentLocation, remainingOrderIds, currentTime, orderMap),
          action: 'memo_hit',
        });
      }
      
      return memo.get(stateKey)!;
    }

    statesEvaluated++;
    
    // Track evaluation
    if (recursionTrace.length < 50) {
      recursionTrace.push({
        depth,
        stateDescription: describe_state(currentLocation, remainingOrderIds, currentTime, orderMap),
        action: 'evaluate',
      });
    }

    // ===== BELLMAN EQUATION: TRY ALL POSSIBLE NEXT ORDERS =====
    let minCost = Infinity;
    let bestNextOrder: string | null = null;

    for (const orderId of remainingOrderIds) {
      const order = orderMap.get(orderId)!;
      
      // ----- Calculate transition costs -----
      const orderLocation: Location = {
        latitude: order.latitude,
        longitude: order.longitude,
      };
      
      const distance = compute_distance(currentLocation, orderLocation);
      const travelTime = compute_travel_time(distance, params.averageSpeed);
      const arrivalTimeMs = currentTime + travelTime * 60000;
      const arrivalTime = new Date(arrivalTimeMs);
      const delayPenalty = compute_delay_penalty(arrivalTime, order.due_time);
      
      const { totalCost: stepCost } = compute_step_cost(
        distance, 
        travelTime, 
        delayPenalty, 
        params
      );

      // ----- Create next state (immutable) -----
      const newRemaining = new Set(remainingOrderIds);
      newRemaining.delete(orderId);

      // ----- Recursive call: solve subproblem -----
      const futureResult = dp_recursive(
        orderLocation,
        newRemaining,
        arrivalTimeMs,
        depth + 1
      );

      // ----- Apply Bellman equation: min(stepCost + futureCost) -----
      const totalCost = stepCost + futureResult.cost;

      if (totalCost < minCost) {
        minCost = totalCost;
        bestNextOrder = orderId;
      }
    }

    // ===== STORE IN MEMOIZATION CACHE =====
    const result: DPResult = { cost: minCost, nextOrderId: bestNextOrder };
    memo.set(stateKey, result);
    
    // Track storage
    if (recursionTrace.length < 50) {
      recursionTrace.push({
        depth,
        stateDescription: describe_state(currentLocation, remainingOrderIds, currentTime, orderMap),
        action: 'memo_store',
        selectedOrder: bestNextOrder || undefined,
        cost: minCost,
      });
    }
    
    return result;
  }

  // ========== RUN THE DP SOLVER ==========
  const allOrderIds = new Set(orders.map(o => o.order_id));
  dp_recursive(DEPOT_LOCATION, allOrderIds, startingTime, 0);

  // ========================================
  // POLICY EXTRACTION (extract_optimal_policy)
  // ========================================
  // Reconstruct the optimal sequence by following the memoized decisions
  
  const sequence: DeliveryStep[] = [];
  const keyDecisions: DecisionExplanation[] = [];
  let currentLoc = DEPOT_LOCATION;
  let currentTime = startingTime;
  let remainingIds = new Set(allOrderIds);
  
  // Accumulators
  let totalDistance = 0;
  let totalTravelTime = 0;
  let totalDelayPenalty = 0;
  let totalCost = 0;
  let totalDistanceCost = 0;
  let totalTimeCost = 0;
  let totalDelayCost = 0;

  let stepNumber = 1;
  
  while (remainingIds.size > 0) {
    const stateKey = create_state_key(currentLoc, remainingIds, currentTime);
    const result = memo.get(stateKey);
    
    if (!result || !result.nextOrderId) break;

    const order = orderMap.get(result.nextOrderId)!;
    const orderLocation: Location = {
      latitude: order.latitude,
      longitude: order.longitude,
    };
    
    const distance = compute_distance(currentLoc, orderLocation);
    const travelTime = compute_travel_time(distance, params.averageSpeed);
    const arrivalTimeMs = currentTime + travelTime * 60000;
    const arrivalTime = new Date(arrivalTimeMs);
    const delayPenalty = compute_delay_penalty(arrivalTime, order.due_time);
    
    const costBreakdown = compute_step_cost(distance, travelTime, delayPenalty, params);

    // Generate decision explanation
    const alternativesCount = remainingIds.size - 1;
    let reason = '';
    
    if (delayPenalty === 0 && alternativesCount > 0) {
      reason = `Selected because it can be reached on time (by ${formatMinutes(
        (order.due_time.getTime() - arrivalTimeMs) / 60000
      )} early) while being ${distance.toFixed(2)} km away.`;
    } else if (delayPenalty > 0) {
      reason = `Selected despite ${formatMinutes(delayPenalty)} delay because alternative routes would result in higher total cost.`;
    } else if (alternativesCount === 0) {
      reason = `Only remaining order to deliver.`;
    } else {
      reason = `Optimal choice among ${alternativesCount + 1} options based on weighted cost calculation.`;
    }
    
    keyDecisions.push({
      step: stepNumber,
      orderId: order.order_id,
      reason,
      alternativesConsidered: alternativesCount + 1,
    });

    sequence.push({
      order,
      arrivalTime,
      distance,
      travelTime,
      delayPenalty,
      stepCost: costBreakdown.totalCost,
      costBreakdown: {
        distanceCost: costBreakdown.distanceCost,
        timeCost: costBreakdown.timeCost,
        delayCost: costBreakdown.delayCost,
      },
    });

    totalDistance += distance;
    totalTravelTime += travelTime;
    totalDelayPenalty += delayPenalty;
    totalCost += costBreakdown.totalCost;
    totalDistanceCost += costBreakdown.distanceCost;
    totalTimeCost += costBreakdown.timeCost;
    totalDelayCost += costBreakdown.delayCost;

    currentLoc = orderLocation;
    currentTime = arrivalTimeMs;
    remainingIds.delete(result.nextOrderId);
    stepNumber++;
  }

  const endTime = performance.now();

  // ========================================
  // GENERATE MEMOIZATION EXAMPLES
  // ========================================
  const memoizationExamples: MemoizedStateExample[] = [];
  let exampleCount = 0;
  
  for (const [key, value] of memo.entries()) {
    if (exampleCount >= 5) break;
    
    const parts = key.split('|');
    const coordParts = parts[0].split('_');
    const orderIds = parts[1] ? parts[1].split(',').filter(id => id) : [];
    const timeMinutes = parseInt(parts[2] || '0');
    
    memoizationExamples.push({
      stateKey: key,
      currentLocationDescription: `(${coordParts[0]}, ${coordParts[1]})`,
      remainingOrderIds: orderIds,
      currentTimeFormatted: new Date(timeMinutes * 60000).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      optimalCost: value.cost,
      bestNextOrder: value.nextOrderId,
    });
    
    exampleCount++;
  }

  // ========================================
  // GENERATE EXPLANATION
  // ========================================
  const hasDelays = totalDelayPenalty > 0;
  const delayOrdersCount = sequence.filter(s => s.delayPenalty > 0).length;
  
  let summary = `The optimal route delivers ${orders.length} orders covering ${totalDistance.toFixed(2)} km `;
  summary += `in ${formatMinutes(totalTravelTime)} total travel time. `;
  
  if (hasDelays) {
    summary += `${delayOrdersCount} order(s) arrived late, incurring ${formatMinutes(totalDelayPenalty)} of delay penalties. `;
  } else {
    summary += `All orders were delivered on time. `;
  }
  
  summary += `The algorithm evaluated ${statesEvaluated} unique states and reused ${memoHits} cached results.`;

  // Tradeoff analysis
  let tradeoffAnalysis = `With the current weights (α=${params.alpha}, β=${params.beta}, γ=${params.gamma}), `;
  
  if (params.gamma > params.alpha && params.gamma > params.beta) {
    tradeoffAnalysis += `delay penalties are heavily weighted, so the algorithm prioritizes on-time delivery even if it means traveling longer distances. `;
  } else if (params.alpha > params.beta && params.alpha > params.gamma) {
    tradeoffAnalysis += `distance is the primary factor, so the algorithm minimizes total kilometers traveled. `;
  } else if (params.beta > params.alpha && params.beta > params.gamma) {
    tradeoffAnalysis += `travel time is prioritized, resulting in routes that minimize time spent on the road. `;
  } else {
    tradeoffAnalysis += `the weights are balanced, creating a compromise between distance, time, and on-time delivery. `;
  }
  
  tradeoffAnalysis += `Total weighted cost breakdown: `;
  tradeoffAnalysis += `${((totalDistanceCost / totalCost) * 100).toFixed(1)}% from distance, `;
  tradeoffAnalysis += `${((totalTimeCost / totalCost) * 100).toFixed(1)}% from travel time, `;
  tradeoffAnalysis += `${((totalDelayCost / totalCost) * 100).toFixed(1)}% from delay penalties.`;

  const explanation: RouteExplanation = {
    summary,
    keyDecisions,
    tradeoffAnalysis,
  };

  // ========================================
  // COMPILE STATISTICS
  // ========================================
  const dpStatistics: DPStatistics = {
    totalStatesEvaluated: statesEvaluated,
    totalMemoHits: memoHits,
    uniqueStatesStored: memo.size,
    maxRecursionDepth: maxDepth,
    memoizationExamples,
    recursionTrace: recursionTrace.slice(0, 30), // Limit for display
  };

  return {
    sequence,
    totalDistance,
    totalTravelTime,
    totalDelayPenalty,
    totalCost,
    computationTime: endTime - startTime,
    dpStatistics,
    costContributions: {
      distanceContribution: totalDistanceCost,
      timeContribution: totalTimeCost,
      delayContribution: totalDelayCost,
    },
    explanation,
  };
}

// Helper function for formatting minutes
function formatMinutes(minutes: number): string {
  if (minutes < 0) return `${Math.abs(minutes).toFixed(0)} min early`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} min`;
}

// Export the old function name for backward compatibility
export const solveDPWithMemoization = dp_solve;
