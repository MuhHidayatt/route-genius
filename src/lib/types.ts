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
}

export interface OptimizationResult {
  sequence: DeliveryStep[];
  totalDistance: number;
  totalTravelTime: number;
  totalDelayPenalty: number;
  totalCost: number;
  computationTime: number;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export const DEPOT_LOCATION: Location = {
  latitude: -0.0263, // Pontianak city center
  longitude: 109.3425,
};
