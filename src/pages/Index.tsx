import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ParameterInputs } from '@/components/ParameterInputs';
import { OrdersPreview } from '@/components/OrdersPreview';
import { ResultsPanel } from '@/components/ResultsPanel';
import { ProblemExplanation } from '@/components/ProblemExplanation';
import { DPTransparency } from '@/components/DPTransparency';
import { ResultInterpretation } from '@/components/ResultInterpretation';
import { parseCSV } from '@/lib/csv-parser';
import { dp_solve } from '@/lib/dp-solver';
import { Order, Parameters, OptimizationResult } from '@/lib/types';
import { Truck, Play, RotateCcw, AlertCircle, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

const defaultParams: Parameters = {
  averageSpeed: 30,
  alpha: 1.0,
  beta: 0.5,
  gamma: 2.0,
};

const Index = () => {
  const [fileName, setFileName] = useState<string>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [params, setParams] = useState<Parameters>(defaultParams);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleFileContent = (content: string, name: string) => {
    setError(null);
    setResult(null);
    try {
      const parsedOrders = parseCSV(content);
      setOrders(parsedOrders);
      setFileName(name);
      toast.success(`Berhasil memuat ${parsedOrders.length} pesanan`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal membaca file CSV';
      setError(message);
      toast.error(message);
    }
  };

  const handleClear = () => {
    setFileName(undefined);
    setOrders([]);
    setResult(null);
    setError(null);
  };

  const handleOptimize = async () => {
    if (orders.length === 0) {
      toast.error('Silakan unggah data pesanan terlebih dahulu');
      return;
    }
    setIsOptimizing(true);
    setError(null);
    setTimeout(() => {
      try {
        const optimizationResult = dp_solve(orders, params);
        setResult(optimizationResult);
        toast.success('Optimasi berhasil diselesaikan!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Optimasi gagal';
        setError(message);
        toast.error(message);
      } finally {
        setIsOptimizing(false);
      }
    }, 50);
  };

  const handleReset = () => {
    setParams(defaultParams);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Sistem Optimasi Rute dan Penjadwalan Pengiriman Last-Mile
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Menggunakan Dynamic Programming (Backward Recursion)
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 flex-1">
        <div className="space-y-8">
          
          {/* Section 1: Input Data & Parameter */}
          <section className="card-elevated p-6 md:p-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Data & Parameter Input</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 ml-11">
              Unggah dataset pesanan dan atur parameter optimasi untuk algoritma Dynamic Programming.
            </p>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Dataset Upload */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Unggah Dataset (CSV)</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  File harus berisi kolom: order_id, latitude, longitude, order_time, due_time
                </p>
                <FileUpload
                  onFileContent={handleFileContent}
                  fileName={fileName}
                  onClear={handleClear}
                />
              </div>

              {/* Parameters */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Parameter Optimasi</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Fungsi biaya: <span className="font-mono">cost = α×jarak + β×waktu + γ×keterlambatan</span>
                </p>
                <ParameterInputs params={params} onChange={setParams} />
              </div>
            </div>
          </section>

          {/* Section 2: Action Button */}
          <section className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleOptimize}
                disabled={orders.length === 0 || isOptimizing}
                className="btn-primary gap-3 text-base px-8 py-4 shadow-lg"
              >
                {isOptimizing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Memproses Optimasi...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Jalankan Optimasi Pengiriman
                  </>
                )}
              </button>
              <button 
                onClick={handleReset} 
                className="btn-secondary px-4 py-4" 
                title="Reset parameter ke nilai awal"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            {orders.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Silakan unggah file CSV untuk memulai optimasi
              </p>
            )}
          </section>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Terjadi Kesalahan</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Orders Preview */}
          {orders.length > 0 && !result && <OrdersPreview orders={orders} />}

          {/* Section 3: Results */}
          {result && (
            <>
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Hasil Optimasi</h2>
                </div>
                <ResultsPanel result={result} />
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Transparansi Algoritma DP</h2>
                </div>
                <DPTransparency statistics={result.dpStatistics} />
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Interpretasi Hasil</h2>
                </div>
                <ResultInterpretation result={result} />
              </section>
            </>
          )}

          {/* Empty State */}
          {orders.length === 0 && !error && (
            <section className="card-elevated p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Belum Ada Pesanan</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Unggah file CSV berisi data pesanan pengiriman untuk memulai proses optimasi rute.
              </p>
            </section>
          )}

          {/* Problem Explanation - Always at bottom */}
          <ProblemExplanation />
        </div>
      </main>

      <footer className="border-t mt-auto bg-card/50">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Optimasi Pengiriman Last-Mile • Backward Recursion Dynamic Programming • Implementasi Akademis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
