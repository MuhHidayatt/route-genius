import { useEffect, useRef } from "react";
import { OptimizationResult, Order, DEPOT_LOCATION } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Home, ArrowRight } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
  result: OptimizationResult;
  orders: Order[];
}

const RouteMap = ({ result, orders }: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Calculate bounds
    const allPoints: [number, number][] = [
      [DEPOT_LOCATION.latitude, DEPOT_LOCATION.longitude],
      ...orders.map(o => [o.latitude, o.longitude] as [number, number]),
    ];
    const bounds = L.latLngBounds(allPoints);

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.fitBounds(bounds.pad(0.15));

    // Depot marker
    const depotIcon = L.divIcon({
      html: `<div style="background:#f59e0b;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);">D</div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([DEPOT_LOCATION.latitude, DEPOT_LOCATION.longitude], { icon: depotIcon })
      .addTo(map)
      .bindPopup("<b>Depot</b><br/>Titik awal pengiriman");

    // Build route coordinates
    const routeCoords: [number, number][] = [
      [DEPOT_LOCATION.latitude, DEPOT_LOCATION.longitude],
    ];

    result.sequence.forEach((step, index) => {
      const pos: [number, number] = [step.order.latitude, step.order.longitude];
      routeCoords.push(pos);

      const icon = L.divIcon({
        html: `<div style="background:hsl(221,83%,53%);color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${index + 1}</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const arrival = step.arrivalTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const due = step.order.due_time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

      L.marker(pos, { icon })
        .addTo(map)
        .bindPopup(
          `<b>Pengiriman #${index + 1}</b><br/>` +
          `Order: ${step.order.order_id}<br/>` +
          `Jarak: ${step.distance.toFixed(2)} km<br/>` +
          `Tiba: ${arrival}<br/>` +
          `Tenggat: ${due}<br/>` +
          `Penalti: ${step.delayPenalty.toFixed(1)} menit`
        );
    });

    // Route polyline
    L.polyline(routeCoords, {
      color: "hsl(221,83%,53%)",
      weight: 4,
      opacity: 0.8,
      dashArray: "8, 6",
    }).addTo(map);

    // Direction arrows using triangle markers at midpoints
    for (let i = 0; i < routeCoords.length - 1; i++) {
      const from = L.latLng(routeCoords[i]);
      const to = L.latLng(routeCoords[i + 1]);
      const mid = L.latLng(
        (from.lat + to.lat) / 2,
        (from.lng + to.lng) / 2,
      );
      const angle = Math.atan2(to.lng - from.lng, to.lat - from.lat) * (180 / Math.PI);

      const arrowIcon = L.divIcon({
        html: `<div style="transform:rotate(${angle - 90}deg);color:hsl(221,83%,53%);font-size:18px;line-height:1;">▶</div>`,
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker(mid, { icon: arrowIcon, interactive: false }).addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [result, orders]);

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Visualisasi Peta Rute Pengiriman
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Peta interaktif — gunakan scroll untuk zoom, klik dan seret untuk geser peta. Klik marker untuk detail.
        </p>
      </CardHeader>
      <CardContent>
        <div
          ref={mapRef}
          className="w-full rounded-lg border border-border overflow-hidden"
          style={{ height: "450px" }}
        />

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">D</span>
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
