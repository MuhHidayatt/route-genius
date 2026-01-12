import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Download } from 'lucide-react';
import { generateSampleCSV } from '@/lib/csv-parser';

interface FileUploadProps {
  onFileContent: (content: string, fileName: string) => void;
  fileName?: string;
  onClear: () => void;
}

export function FileUpload({ onFileContent, fileName, onClear }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      readFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  }, []);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileContent(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (fileName) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20">
        <FileText className="w-5 h-5 text-success" />
        <span className="flex-1 font-medium text-foreground">{fileName}</span>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`upload-zone ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="font-medium text-foreground mb-1">
          Drop your CSV file here
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      <button
        onClick={handleDownloadSample}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download sample CSV
      </button>
    </div>
  );
}
