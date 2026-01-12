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
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

function ParamField({ label, value, onChange, tooltip, unit, step = 0.1, min = 0, max }: ParamFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ParamField
        label="Average Speed"
        value={params.averageSpeed}
        onChange={(v) => updateParam('averageSpeed', v)}
        tooltip="Average courier speed in kilometers per hour"
        unit="km/h"
        step={1}
        min={5}
        max={100}
      />
      
      <div className="sm:col-span-2 pt-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          Cost Function Weights
        </p>
        <div className="grid grid-cols-3 gap-4">
          <ParamField
            label="α (Distance)"
            value={params.alpha}
            onChange={(v) => updateParam('alpha', v)}
            tooltip="Weight for distance cost (km)"
            step={0.1}
            min={0}
            max={10}
          />
          <ParamField
            label="β (Time)"
            value={params.beta}
            onChange={(v) => updateParam('beta', v)}
            tooltip="Weight for travel time cost (minutes)"
            step={0.1}
            min={0}
            max={10}
          />
          <ParamField
            label="γ (Delay)"
            value={params.gamma}
            onChange={(v) => updateParam('gamma', v)}
            tooltip="Weight for delay penalty (minutes late)"
            step={0.1}
            min={0}
            max={10}
          />
        </div>
      </div>
    </div>
  );
}
