/**
 * KOMPONEN TRANSPARANSI DP
 * 
 * Menampilkan output antara dari algoritma Dynamic Programming
 * untuk pemahaman edukatif tentang cara kerja memoization dan rekursi.
 */

import { DPStatistics } from '@/lib/types';
import { 
  Database, 
  Repeat, 
  Layers, 
  ArrowDown,
  CheckCircle,
  RotateCcw,
  Save,
  Info
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DPTransparencyProps {
  statistics: DPStatistics;
}

export function DPTransparency({ statistics }: DPTransparencyProps) {
  return (
    <div className="card-elevated p-6 animate-fade-in">
      <h3 className="section-header flex items-center gap-2">
        <Database className="w-5 h-5 text-primary" />
        Transparansi Dynamic Programming
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              Bagian ini menunjukkan cara kerja internal algoritma DP,
              termasuk statistik evaluasi state dan memoization.
            </p>
          </TooltipContent>
        </Tooltip>
      </h3>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatBox
          icon={<Layers className="w-4 h-4" />}
          label="State Dievaluasi"
          value={statistics.totalStatesEvaluated}
          tooltip="Jumlah state unik yang dihitung oleh algoritma DP"
        />
        <StatBox
          icon={<Repeat className="w-4 h-4" />}
          label="Memo Hit"
          value={statistics.totalMemoHits}
          tooltip="Berapa kali hasil cache digunakan kembali (menghindari perhitungan ulang)"
        />
        <StatBox
          icon={<Database className="w-4 h-4" />}
          label="State Tersimpan"
          value={statistics.uniqueStatesStored}
          tooltip="Total state yang tersimpan dalam cache memoization"
        />
        <StatBox
          icon={<ArrowDown className="w-4 h-4" />}
          label="Kedalaman Maks"
          value={statistics.maxRecursionDepth}
          tooltip="Kedalaman rekursi maksimum (sama dengan jumlah pesanan)"
        />
      </div>

      {/* Indikator Efisiensi */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-foreground">Efisiensi Memoization</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {statistics.totalMemoHits > 0 ? (
            <>
              Algoritma menghindari <strong className="text-foreground">{statistics.totalMemoHits}</strong> perhitungan 
              redundan dengan menggunakan kembali hasil cache. Ini menunjukkan bagaimana overlapping subproblems 
              ditangani secara efisien melalui memoization.
            </>
          ) : (
            <>
              Dengan dataset saat ini, setiap state bersifat unik (tidak terdeteksi overlapping subproblems).
              Ini bisa terjadi pada dataset kecil atau ketika diskretisasi waktu menghasilkan state yang berbeda.
            </>
          )}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {/* Contoh Memoization */}
        <AccordionItem value="memo-examples">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Contoh Memoization ({statistics.memoizationExamples.length} ditampilkan)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              Setiap state yang di-memo menyimpan biaya optimal ke depan (cost-to-go) dan pesanan terbaik berikutnya dari state tersebut.
            </p>
            <div className="space-y-2">
              {statistics.memoizationExamples.map((example, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-lg bg-muted/30 border border-border text-xs"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground">State #{index + 1}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div>
                      <span className="text-foreground/70">Lokasi:</span>{' '}
                      <span className="font-mono">{example.currentLocationDescription}</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Waktu:</span>{' '}
                      <span className="font-mono">{example.currentTimeFormatted}</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Tersisa:</span>{' '}
                      <span className="font-mono">
                        {example.remainingOrderIds.length > 0 
                          ? example.remainingOrderIds.slice(0, 3).join(', ')
                          : '(tidak ada)'}
                        {example.remainingOrderIds.length > 3 && '...'}
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Berikutnya:</span>{' '}
                      <span className="font-mono text-primary">
                        {example.bestNextOrder || 'Terminal'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border">
                    <span className="text-foreground/70">Biaya Optimal ke Depan:</span>{' '}
                    <span className="font-mono font-medium text-foreground">
                      {example.optimalCost.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Jejak Rekursi */}
        <AccordionItem value="recursion-trace">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-primary" />
              Jejak Rekursi ({Math.min(statistics.recursionTrace.length, 20)} langkah pertama)
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <p className="text-xs text-muted-foreground mb-3">
              Jejak ini menunjukkan bagaimana algoritma mengevaluasi state secara rekursif.
            </p>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {statistics.recursionTrace.slice(0, 20).map((step, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-2 text-xs py-1"
                  style={{ paddingLeft: `${step.depth * 12}px` }}
                >
                  <ActionIcon action={step.action} />
                  <div className="flex-1 min-w-0">
                    <span className="text-muted-foreground">
                      {step.stateDescription}
                    </span>
                    {step.selectedOrder && (
                      <span className="ml-2 text-primary font-mono">
                        → {step.selectedOrder}
                      </span>
                    )}
                    {step.cost !== undefined && (
                      <span className="ml-2 text-foreground font-mono">
                        (biaya: {step.cost.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Evaluasi
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Memo Hit
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500" /> Memo Store
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Persamaan Bellman */}
        <AccordionItem value="bellman">
          <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4 text-primary" />
              Penjelasan Persamaan Bellman
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 space-y-3">
            <p className="text-xs text-muted-foreground">
              Algoritma ini menggunakan <strong className="text-foreground">persamaan Bellman</strong> untuk 
              backward recursion:
            </p>
            <div className="p-4 bg-muted/50 rounded-lg font-mono text-sm text-center">
              <div className="text-foreground">
                f(state) = <span className="text-primary">min</span> <sub className="text-xs">j ∈ tersisa</sub> {'{'}
              </div>
              <div className="pl-8 text-foreground">
                biaya(state → j) + f(state_berikutnya)
              </div>
              <div className="text-foreground">{'}'}</div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                <strong className="text-foreground">f(state)</strong>: Biaya optimal ke depan dari state ini
              </li>
              <li>
                <strong className="text-foreground">min</strong>: Ambil nilai minimum dari semua pilihan
              </li>
              <li>
                <strong className="text-foreground">biaya(state → j)</strong>: Biaya langsung untuk mengirim pesanan j
              </li>
              <li>
                <strong className="text-foreground">f(state_berikutnya)</strong>: Biaya optimal dari state hasil transisi
              </li>
            </ul>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <strong className="text-primary">Base Case:</strong>{' '}
              <span className="text-muted-foreground">
                Ketika pesanan_tersisa kosong, f(state) = 0 (tidak ada biaya lagi)
              </span>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

interface StatBoxProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  tooltip: string;
}

function StatBox({ icon, label, value, tooltip }: StatBoxProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="p-3 rounded-lg bg-muted/30 border border-border cursor-help">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            {icon}
            <span className="text-xs">{label}</span>
          </div>
          <div className="text-lg font-bold text-foreground font-mono">
            {value.toLocaleString()}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ActionIcon({ action }: { action: 'evaluate' | 'memo_hit' | 'memo_store' }) {
  switch (action) {
    case 'evaluate':
      return <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />;
    case 'memo_hit':
      return <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1" />;
    case 'memo_store':
      return <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1" />;
  }
}
