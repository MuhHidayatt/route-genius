import { 
  Order, 
  Parameters, 
  Location, 
  DeliveryStep, 
  OptimizationResult, 
  DEPOT_LOCATION 
} from './types';

// Haversine distance in kilometers
function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371; // Earth's radius in km
  const lat1 = loc1.latitude * Math.PI / 180;
  const lat2 = loc2.latitude * Math.PI / 180;
  const deltaLat = (loc2.latitude - loc1.latitude) * Math.PI / 180;
  const deltaLng = (loc2.longitude - loc1.longitude) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Travel time in minutes
function calculateTravelTime(distance: number, speedKmh: number): number {
  return (distance / speedKmh) * 60;
}

// Delay penalty in minutes
function calculateDelayPenalty(arrivalTime: Date, dueTime: Date): number {
  const delayMs = arrivalTime.getTime() - dueTime.getTime();
  return Math.max(0, delayMs / 60000); // Convert to minutes
}

// Calculate step cost
function calculateStepCost(
  distance: number,
  travelTime: number,
  delayPenalty: number,
  params: Parameters
): number {
  return (
    params.alpha * distance +
    params.beta * travelTime +
    params.gamma * delayPenalty
  );
}

// Create state key for memoization
function createStateKey(
  currentLocation: Location,
  remainingOrderIds: Set<string>,
  currentTime: number
): string {
  const orderedIds = Array.from(remainingOrderIds).sort().join(',');
  return `${currentLocation.latitude.toFixed(6)}_${currentLocation.longitude.toFixed(6)}_${orderedIds}_${currentTime}`;
}

interface DPResult {
  cost: number;
  nextOrderId: string | null;
}

/**
 * Dynamic Programming Solver using Backward Recursion with Memoization
 * 
 * This implements the Bellman equation:
 * f(state) = min over all feasible next orders j: cost(state, j) + f(next_state)
 * 
 * Base case: f(state) = 0 when remaining_orders is empty
 */
export function solveDPWithMemoization(
  orders: Order[],
  params: Parameters
): OptimizationResult {
  const startTime = performance.now();
  
  const orderMap = new Map<string, Order>();
  orders.forEach(order => orderMap.set(order.order_id, order));
  
  // Memoization cache
  const memo = new Map<string, DPResult>();
  
  // Find the earliest order time as the starting time
  const startingTime = Math.min(...orders.map(o => o.order_time.getTime()));

  /**
   * Recursive DP function with memoization (Top-Down approach)
   */
  function dp(
    currentLocation: Location,
    remainingOrderIds: Set<string>,
    currentTime: number
  ): DPResult {
    // Base case: no more orders to deliver
    if (remainingOrderIds.size === 0) {
      return { cost: 0, nextOrderId: null };
    }

    // Check memoization cache
    const stateKey = createStateKey(currentLocation, remainingOrderIds, currentTime);
    if (memo.has(stateKey)) {
      return memo.get(stateKey)!;
    }

    let minCost = Infinity;
    let bestNextOrder: string | null = null;

    // Try each remaining order as the next delivery
    for (const orderId of remainingOrderIds) {
      const order = orderMap.get(orderId)!;
      
      // Calculate transition costs
      const distance = calculateDistance(currentLocation, {
        latitude: order.latitude,
        longitude: order.longitude,
      });
      
      const travelTime = calculateTravelTime(distance, params.averageSpeed);
      const arrivalTimeMs = currentTime + travelTime * 60000;
      const arrivalTime = new Date(arrivalTimeMs);
      
      const delayPenalty = calculateDelayPenalty(arrivalTime, order.due_time);
      const stepCost = calculateStepCost(distance, travelTime, delayPenalty, params);

      // Create new remaining orders set (immutable approach)
      const newRemaining = new Set(remainingOrderIds);
      newRemaining.delete(orderId);

      // Recursive call for next state
      const futureResult = dp(
        { latitude: order.latitude, longitude: order.longitude },
        newRemaining,
        arrivalTimeMs
      );

      const totalCost = stepCost + futureResult.cost;

      if (totalCost < minCost) {
        minCost = totalCost;
        bestNextOrder = orderId;
      }
    }

    const result: DPResult = { cost: minCost, nextOrderId: bestNextOrder };
    memo.set(stateKey, result);
    return result;
  }

  // Initial state: at depot, all orders remaining, starting time
  const allOrderIds = new Set(orders.map(o => o.order_id));
  
  // Run the DP solver
  dp(DEPOT_LOCATION, allOrderIds, startingTime);

  // Policy extraction: reconstruct the optimal sequence
  const sequence: DeliveryStep[] = [];
  let currentLoc = DEPOT_LOCATION;
  let currentTime = startingTime;
  let remainingIds = new Set(allOrderIds);
  let totalDistance = 0;
  let totalTravelTime = 0;
  let totalDelayPenalty = 0;
  let totalCost = 0;

  while (remainingIds.size > 0) {
    const stateKey = createStateKey(currentLoc, remainingIds, currentTime);
    const result = memo.get(stateKey);
    
    if (!result || !result.nextOrderId) break;

    const order = orderMap.get(result.nextOrderId)!;
    
    const distance = calculateDistance(currentLoc, {
      latitude: order.latitude,
      longitude: order.longitude,
    });
    
    const travelTime = calculateTravelTime(distance, params.averageSpeed);
    const arrivalTimeMs = currentTime + travelTime * 60000;
    const arrivalTime = new Date(arrivalTimeMs);
    const delayPenalty = calculateDelayPenalty(arrivalTime, order.due_time);
    const stepCost = calculateStepCost(distance, travelTime, delayPenalty, params);

    sequence.push({
      order,
      arrivalTime,
      distance,
      travelTime,
      delayPenalty,
      stepCost,
    });

    totalDistance += distance;
    totalTravelTime += travelTime;
    totalDelayPenalty += delayPenalty;
    totalCost += stepCost;

    currentLoc = { latitude: order.latitude, longitude: order.longitude };
    currentTime = arrivalTimeMs;
    remainingIds.delete(result.nextOrderId);
  }

  const endTime = performance.now();

  return {
    sequence,
    totalDistance,
    totalTravelTime,
    totalDelayPenalty,
    totalCost,
    computationTime: endTime - startTime,
  };
}
