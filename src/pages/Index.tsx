import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ParameterInputs } from '@/components/ParameterInputs';
import { OrdersPreview } from '@/components/OrdersPreview';
import { ResultsPanel } from '@/components/ResultsPanel';
import { parseCSV } from '@/lib/csv-parser';
import { solveDPWithMemoization } from '@/lib/dp-solver';
import { Order, Parameters, OptimizationResult } from '@/lib/types';
import { Truck, Play, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const defaultParams: Parameters = {
  averageSpeed: 30, // km/h
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

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      try {
        const optimizationResult = solveDPWithMemoization(orders, params);
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
                Dynamic Programming with Backward Recursion
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <div className="card-elevated p-6">
              <h2 className="section-header">Order Data</h2>
              <FileUpload
                onFileContent={handleFileContent}
                fileName={fileName}
                onClear={handleClear}
              />
            </div>

            {/* Parameters Section */}
            <div className="card-elevated p-6">
              <h2 className="section-header">Parameters</h2>
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
              <button
                onClick={handleReset}
                className="btn-secondary px-4"
                title="Reset parameters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Algorithm Info */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <h3 className="font-medium text-foreground mb-2 text-sm">
                Algorithm Details
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Uses top-down dynamic programming with memoization to solve the 
                Traveling Salesman Problem variant. The Bellman equation minimizes 
                weighted cost across all delivery sequences.
              </p>
            </div>
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

            {orders.length > 0 && !result && (
              <OrdersPreview orders={orders} />
            )}

            {result && <ResultsPanel result={result} />}

            {orders.length === 0 && !error && (
              <div className="card-elevated p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No orders loaded
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Upload a CSV file with your delivery orders to get started. 
                  You can download a sample file to see the required format.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <p className="text-sm text-muted-foreground text-center">
            Last-Mile Delivery Optimization • Pontianak City • Harbolnas 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
