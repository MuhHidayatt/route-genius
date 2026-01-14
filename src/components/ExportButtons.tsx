import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { OptimizationResult, Order } from '@/lib/types';
import { exportToPDF, exportToExcel } from '@/lib/export-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonsProps {
  result: OptimizationResult;
  orders: Order[];
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ result, orders }) => {
  const handleExportPDF = () => {
    exportToPDF(result, orders);
  };

  const handleExportExcel = () => {
    exportToExcel(result, orders);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Ekspor Laporan
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
            <FileText className="h-4 w-4 text-red-500" />
            <div className="flex flex-col">
              <span>Ekspor ke PDF</span>
              <span className="text-xs text-muted-foreground">Format dokumen</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="h-4 w-4 text-green-600" />
            <div className="flex flex-col">
              <span>Ekspor ke Excel</span>
              <span className="text-xs text-muted-foreground">Format spreadsheet</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
