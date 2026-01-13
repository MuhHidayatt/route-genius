import { Parameters } from '@/lib/types';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ParameterInputsProps {
  params: Parameters;
  onChange: (params: Parameters) => void;
}

interface ParamFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip: string;
  description?: string;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

function ParamField({
  label,
  value,
  onChange,
  tooltip,
  description,
  unit,
  step = 0.1,
  min = 0,
  max,
}: ParamFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          step={step}
          min={min}
          max={max}
          className="input-field pr-12"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

export function ParameterInputs({ params, onChange }: ParameterInputsProps) {
  const updateParam = (key: keyof Parameters, value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* ===============================
          PARAMETER OPERASIONAL
      =============================== */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">
          Parameter Operasional
        </p>

        <ParamField
          label="Kecepatan Rata-rata Kurir"
          value={params.averageSpeed}
          onChange={(v) => updateParam('averageSpeed', v)}
          tooltip="Kecepatan rata-rata kurir selama pengiriman"
          description="Digunakan untuk menghitung waktu tempuh antar lokasi"
          unit="km/jam"
          step={1}
          min={5}
          max={100}
        />

        <ParamField
          label="Waktu Pelayanan per Order"
          value={params.serviceTime}
          onChange={(v) => updateParam('serviceTime', v)}
          tooltip="Waktu yang dibutuhkan untuk proses serah terima paket di lokasi pelanggan"
          description="Merepresentasikan waktu tunggu, konfirmasi, dan administrasi pengiriman"
          unit="menit"
          step={10}
          min={0}
          max={30}
        />
      </div>

      {/* ===============================
          BOBOT FUNGSI BIAYA
      =============================== */}
      <div className="space-y-3 pt-2">
        <p className="text-sm font-medium text-foreground">
          Bobot Fungsi Biaya
        </p>
        <p className="text-xs text-muted-foreground">
          Tentukan prioritas relatif antara jarak, waktu, dan keterlambatan
        </p>

        <div className="grid grid-cols-3 gap-3">
          <ParamField
            label="α (Jarak)"
            value={params.alpha}
            onChange={(v) => updateParam('alpha', v)}
            tooltip="Bobot untuk biaya jarak tempuh (km)"
            step={0.1}
            min={0}
            max={10}
          />

          <ParamField
            label="β (Waktu)"
            value={params.beta}
            onChange={(v) => updateParam('beta', v)}
            tooltip="Bobot untuk biaya waktu tempuh (menit)"
            step={0.1}
            min={0}
            max={10}
          />

          <ParamField
            label="γ (Keterlambatan)"
            value={params.gamma}
            onChange={(v) => updateParam('gamma', v)}
            tooltip="Bobot penalti keterlambatan pengiriman (menit)"
            step={0.1}
            min={0}
            max={10}
          />
        </div>
      </div>
    </div>
  );
}
