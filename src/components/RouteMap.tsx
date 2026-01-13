import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DeliveryStep, DEPOT_LOCATION } from '@/lib/types';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom depot icon (blue)
const depotIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom delivery icon (red)
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RouteMapProps {
  sequence: DeliveryStep[];
}

// Component to fit map bounds to all markers
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(pos => L.latLng(pos[0], pos[1])));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  
  return null;
}

export function RouteMap({ sequence }: RouteMapProps) {
  // Create positions array starting from depot
  const positions: [number, number][] = [
    [DEPOT_LOCATION.latitude, DEPOT_LOCATION.longitude],
    ...sequence.map(step => [step.order.latitude, step.order.longitude] as [number, number])
  ];

  // Create polyline positions for the route
  const routePositions: [number, number][] = positions;

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={[DEPOT_LOCATION.latitude, DEPOT_LOCATION.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds positions={positions} />
        
        {/* Route polyline */}
        <Polyline
          positions={routePositions}
          color="#3b82f6"
          weight={3}
          opacity={0.8}
          dashArray="10, 5"
        />
        
        {/* Depot marker */}
        <Marker 
          position={[DEPOT_LOCATION.latitude, DEPOT_LOCATION.longitude]}
          icon={depotIcon}
        >
          <Popup>
            <div className="text-center">
              <strong className="text-blue-600">🏠 Depot</strong>
              <br />
              <span className="text-sm text-gray-600">Titik Awal Pengiriman</span>
              <br />
              <span className="text-xs text-gray-500">
                {DEPOT_LOCATION.latitude.toFixed(4)}, {DEPOT_LOCATION.longitude.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
        
        {/* Delivery markers */}
        {sequence.map((step, index) => (
          <Marker
            key={step.order.order_id}
            position={[step.order.latitude, step.order.longitude]}
            icon={deliveryIcon}
          >
            <Popup>
              <div className="text-center min-w-[150px]">
                <strong className="text-red-600">
                  📍 Pengiriman #{index + 1}
                </strong>
                <br />
                <span className="font-medium">{step.order.order_id}</span>
                <br />
                <span className="text-xs text-gray-500">
                  {step.order.latitude.toFixed(4)}, {step.order.longitude.toFixed(4)}
                </span>
                <hr className="my-1" />
                <div className="text-xs text-left">
                  <div>⏰ Tiba: {step.arrivalTime.toLocaleTimeString('id-ID')}</div>
                  <div>📏 Jarak: {step.distance.toFixed(2)} km</div>
                  <div>⏱️ Waktu: {(step.travelTime * 60).toFixed(0)} menit</div>
                  {step.delayPenalty > 0 && (
                    <div className="text-amber-600">⚠️ Keterlambatan: {(step.delayPenalty * 60).toFixed(0)} menit</div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div className="bg-muted/50 px-4 py-2 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Depot (Titik Awal)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Titik Pengiriman</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-blue-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #3b82f6 0, #3b82f6 10px, transparent 10px, transparent 15px)' }}></div>
          <span>Rute Optimal</span>
        </div>
      </div>
    </div>
  );
}
