import { OptimizationResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

interface ResultsChartsProps {
  result: OptimizationResult;
}

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(40, 96%, 53%)",
  "hsl(0, 84%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(280, 67%, 55%)",
  "hsl(190, 90%, 50%)",
];

export function ResultsCharts({ result }: ResultsChartsProps) {
  // Data: cost breakdown per step
  const stepData = result.sequence.map((step, i) => ({
    name: `#${i + 1}`,
    orderId: step.order.order_id,
    jarak: parseFloat(step.costBreakdown.distanceCost.toFixed(2)),
    waktu: parseFloat(step.costBreakdown.timeCost.toFixed(2)),
    keterlambatan: parseFloat(step.costBreakdown.delayCost.toFixed(2)),
    totalBiaya: parseFloat(step.stepCost.toFixed(2)),
  }));

  // Data: cumulative cost
  let cumulative = 0;
  const cumulativeData = result.sequence.map((step, i) => {
    cumulative += step.stepCost;
    return {
      name: `#${i + 1}`,
      orderId: step.order.order_id,
      biayaKumulatif: parseFloat(cumulative.toFixed(2)),
    };
  });

  // Data: distance per step
  const distanceData = result.sequence.map((step, i) => ({
    name: `#${i + 1}`,
    orderId: step.order.order_id,
    jarak: parseFloat(step.distance.toFixed(2)),
  }));

  // Data: pie chart total cost composition
  const totalDistCost = result.sequence.reduce((s, st) => s + st.costBreakdown.distanceCost, 0);
  const totalTimeCost = result.sequence.reduce((s, st) => s + st.costBreakdown.timeCost, 0);
  const totalDelayCost = result.sequence.reduce((s, st) => s + st.costBreakdown.delayCost, 0);

  const pieData = [
    { name: "Biaya Jarak", value: parseFloat(totalDistCost.toFixed(2)) },
    { name: "Biaya Waktu", value: parseFloat(totalTimeCost.toFixed(2)) },
    { name: "Biaya Keterlambatan", value: parseFloat(totalDelayCost.toFixed(2)) },
  ].filter(d => d.value > 0);

  const PIE_COLORS = [COLORS[0], COLORS[3], COLORS[2]];

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Grafik Hasil Perhitungan
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualisasi komponen biaya, jarak, dan akumulasi biaya per langkah pengiriman
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Chart 1: Stacked bar - cost breakdown per step */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">
            Rincian Biaya per Langkah Pengiriman
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Komponen biaya jarak (α), waktu (β), dan keterlambatan (γ) di setiap langkah
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stepData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    jarak: "Biaya Jarak (α)",
                    waktu: "Biaya Waktu (β)",
                    keterlambatan: "Biaya Keterlambatan (γ)",
                  };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(label) => {
                  const item = stepData.find(d => d.name === label);
                  return item ? `Langkah ${label} — ${item.orderId}` : label;
                }}
              />
              <Legend
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    jarak: "Jarak (α)",
                    waktu: "Waktu (β)",
                    keterlambatan: "Keterlambatan (γ)",
                  };
                  return labels[value] || value;
                }}
              />
              <Bar dataKey="jarak" stackId="cost" fill={COLORS[0]} radius={[0, 0, 0, 0]} />
              <Bar dataKey="waktu" stackId="cost" fill={COLORS[3]} radius={[0, 0, 0, 0]} />
              <Bar dataKey="keterlambatan" stackId="cost" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Chart 2: Line - cumulative cost */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Akumulasi Biaya
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Total biaya kumulatif setelah setiap langkah pengiriman
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [value, "Biaya Kumulatif"]}
                  labelFormatter={(label) => {
                    const item = cumulativeData.find(d => d.name === label);
                    return item ? `Langkah ${label} — ${item.orderId}` : label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="biayaKumulatif"
                  stroke={COLORS[0]}
                  strokeWidth={3}
                  dot={{ fill: COLORS[0], r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Pie - total cost composition */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Komposisi Total Biaya
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Proporsi kontribusi jarak, waktu, dan keterlambatan
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name.replace("Biaya ", "")} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ strokeWidth: 1 }}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [value.toFixed(2), "Nilai"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Bar - distance per step */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">
            Jarak Tempuh per Langkah
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            Jarak (km) yang ditempuh kurir dari lokasi sebelumnya ke titik pengiriman berikutnya
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distanceData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit=" km" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [`${value} km`, "Jarak"]}
                labelFormatter={(label) => {
                  const item = distanceData.find(d => d.name === label);
                  return item ? `Langkah ${label} — ${item.orderId}` : label;
                }}
              />
              <Bar dataKey="jarak" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
