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
import { Truck, Play, RotateCcw, AlertCircle, BookOpen } from 'lucide-react';
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
      toast.success(`Loaded ${parsedOrders.length} orders`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse CSV';
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
      toast.error('Please upload orders first');
      return;
    }
    setIsOptimizing(true);
    setError(null);
    setTimeout(() => {
      try {
        const optimizationResult = dp_solve(orders, params);
        setResult(optimizationResult);
        toast.success('Optimization complete!');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Optimization failed';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Delivery Route Optimizer
              </h1>
              <p className="text-sm text-muted-foreground">
                Backward Recursion Dynamic Programming with Memoization
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Section: Input Data */}
            <div className="card-elevated p-6">
              <h2 className="section-header flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Input Data
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Upload a CSV file containing order details (order_id, latitude, longitude, order_time, due_time).
              </p>
              <FileUpload
                onFileContent={handleFileContent}
                fileName={fileName}
                onClear={handleClear}
              />
            </div>

            {/* Section: Optimization Parameters */}
            <div className="card-elevated p-6">
              <h2 className="section-header flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Optimization Parameters
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Configure courier speed and cost function weights. The algorithm minimizes: α×distance + β×time + γ×delay.
              </p>
              <ParameterInputs params={params} onChange={setParams} />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleOptimize}
                disabled={orders.length === 0 || isOptimizing}
                className="btn-primary flex-1 gap-2"
              >
                {isOptimizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Optimize Delivery
                  </>
                )}
              </button>
              <button onClick={handleReset} className="btn-secondary px-4" title="Reset parameters">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Problem Explanation (always visible) */}
            <ProblemExplanation />
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}

            {orders.length > 0 && !result && <OrdersPreview orders={orders} />}

            {result && (
              <>
                <ResultsPanel result={result} />
                <DPTransparency statistics={result.dpStatistics} />
                <ResultInterpretation result={result} />
              </>
            )}

            {orders.length === 0 && !error && (
              <div className="card-elevated p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No orders loaded</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Upload a CSV file with your delivery orders to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t mt-auto">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Last-Mile Delivery Optimization • Backward Recursion DP • Academic Implementation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
