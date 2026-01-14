import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { OptimizationResult, Order } from './types';

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}j ${mins}m`;
};

const formatTimeFromDate = (date: Date): string => {
  const hours = date.getHours();
  const mins = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const exportToPDF = (result: OptimizationResult, orders: Order[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Laporan Hasil Optimasi Pengiriman', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistem Optimasi Rute dan Penjadwalan Pengiriman Last-Mile', pageWidth / 2, 28, { align: 'center' });
  doc.text('Menggunakan Dynamic Programming (Backward Recursion)', pageWidth / 2, 34, { align: 'center' });
  
  // Date
  doc.setFontSize(9);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, 14, 44);
  
  // Summary Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan Hasil Optimasi', 14, 54);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Total Jarak', `${result.totalDistance.toFixed(2)} km`],
    ['Total Waktu Tempuh', formatTime(result.totalTravelTime)],
    ['Total Keterlambatan', `${result.totalDelayPenalty.toFixed(0)} menit`],
    ['Total Biaya (Fungsi Objektif)', result.totalCost.toFixed(4)],
    ['Jumlah Pesanan', `${result.sequence.length} pesanan`],
    ['Waktu Komputasi', `${result.computationTime.toFixed(2)} ms`],
  ];
  
  autoTable(doc, {
    startY: 58,
    head: [['Metrik', 'Nilai']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });
  
  // DP Statistics
  if (result.dpStatistics) {
    const finalY = (doc as any).lastAutoTable.finalY || 90;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistik Dynamic Programming', 14, finalY + 12);
    
    const dpData = [
      ['State Dievaluasi', result.dpStatistics.totalStatesEvaluated.toString()],
      ['Memo Hit (Penggunaan Ulang)', result.dpStatistics.totalMemoHits.toString()],
      ['State Tersimpan di Memo', result.dpStatistics.uniqueStatesStored.toString()],
      ['Kedalaman Rekursi Maksimum', result.dpStatistics.maxRecursionDepth.toString()],
    ];
    
    autoTable(doc, {
      startY: finalY + 16,
      head: [['Parameter', 'Nilai']],
      body: dpData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
    });
  }
  
  // Delivery Sequence Table
  const tableY = (doc as any).lastAutoTable.finalY || 120;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Urutan Pengiriman Optimal', 14, tableY + 12);
  
  const sequenceData = result.sequence.map((step, index) => {
    return [
      `${index + 1}. Pesanan ${step.order.order_id}`,
      `(${step.order.latitude.toFixed(4)}, ${step.order.longitude.toFixed(4)})`,
      formatTimeFromDate(step.arrivalTime),
      formatTimeFromDate(step.order.due_time),
      `${step.distance.toFixed(2)} km`,
      step.delayPenalty > 0 ? `${step.delayPenalty.toFixed(0)} menit` : '-'
    ];
  });
  
  autoTable(doc, {
    startY: tableY + 16,
    head: [['Lokasi', 'Koordinat', 'Waktu Tiba', 'Tenggat', 'Jarak', 'Keterlambatan']],
    body: sequenceData,
    theme: 'grid',
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    styles: { fontSize: 8, cellPadding: 2 },
  });
  
  // Explanation
  if (result.explanation) {
    const explainY = (doc as any).lastAutoTable.finalY || 180;
    
    // Check if we need a new page
    if (explainY > 240) {
      doc.addPage();
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Penjelasan Hasil', 14, 20);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(result.explanation.summary, pageWidth - 28);
      doc.text(lines, 14, 28);
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Penjelasan Hasil', 14, explainY + 12);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(result.explanation.summary, pageWidth - 28);
      doc.text(lines, 14, explainY + 20);
    }
  }
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Halaman ${i} dari ${pageCount} | Sistem Optimasi Pengiriman Last-Mile`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`laporan-optimasi-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (result: OptimizationResult, orders: Order[]) => {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: Ringkasan
  const summaryData = [
    ['LAPORAN HASIL OPTIMASI PENGIRIMAN'],
    ['Sistem Optimasi Rute dan Penjadwalan Pengiriman Last-Mile'],
    ['Menggunakan Dynamic Programming (Backward Recursion)'],
    [''],
    ['Tanggal Laporan', new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })],
    [''],
    ['RINGKASAN HASIL OPTIMASI'],
    ['Metrik', 'Nilai'],
    ['Total Jarak', `${result.totalDistance.toFixed(2)} km`],
    ['Total Waktu Tempuh', formatTime(result.totalTravelTime)],
    ['Total Keterlambatan', `${result.totalDelayPenalty.toFixed(0)} menit`],
    ['Total Biaya (Fungsi Objektif)', result.totalCost.toFixed(4)],
    ['Jumlah Pesanan', `${result.sequence.length} pesanan`],
    ['Waktu Komputasi', `${result.computationTime.toFixed(2)} ms`],
  ];
  
  if (result.dpStatistics) {
    summaryData.push(
      [''],
      ['STATISTIK DYNAMIC PROGRAMMING'],
      ['Parameter', 'Nilai'],
      ['State Dievaluasi', result.dpStatistics.totalStatesEvaluated.toString()],
      ['Memo Hit (Penggunaan Ulang)', result.dpStatistics.totalMemoHits.toString()],
      ['State Tersimpan di Memo', result.dpStatistics.uniqueStatesStored.toString()],
      ['Kedalaman Rekursi Maksimum', result.dpStatistics.maxRecursionDepth.toString()],
    );
  }
  
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1['!cols'] = [{ wch: 35 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');
  
  // Sheet 2: Urutan Pengiriman
  const sequenceHeaders = ['No', 'ID Pesanan', 'Latitude', 'Longitude', 'Waktu Tiba', 'Tenggat Waktu', 'Jarak (km)', 'Waktu Tempuh (menit)', 'Keterlambatan (menit)', 'Biaya Langkah'];
  const sequenceRows = result.sequence.map((step, index) => [
    (index + 1).toString(),
    step.order.order_id,
    step.order.latitude.toFixed(6),
    step.order.longitude.toFixed(6),
    formatTimeFromDate(step.arrivalTime),
    formatTimeFromDate(step.order.due_time),
    step.distance.toFixed(2),
    step.travelTime.toFixed(0),
    step.delayPenalty > 0 ? step.delayPenalty.toFixed(0) : '0',
    step.stepCost.toFixed(4)
  ]);
  
  const sequenceData = [
    ['URUTAN PENGIRIMAN OPTIMAL'],
    [''],
    sequenceHeaders,
    ...sequenceRows,
    [''],
    ['', 'TOTAL', '', '', '', '', result.totalDistance.toFixed(2), result.totalTravelTime.toFixed(0), result.totalDelayPenalty.toFixed(0), result.totalCost.toFixed(4)]
  ];
  
  const ws2 = XLSX.utils.aoa_to_sheet(sequenceData);
  ws2['!cols'] = [
    { wch: 5 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, 
    { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Urutan Pengiriman');
  
  // Sheet 3: Data Pesanan
  const ordersHeaders = ['ID Pesanan', 'Latitude', 'Longitude', 'Waktu Order', 'Tenggat Waktu'];
  const ordersRows = orders.map(order => [
    order.order_id,
    order.latitude.toFixed(6),
    order.longitude.toFixed(6),
    formatTimeFromDate(order.order_time),
    formatTimeFromDate(order.due_time)
  ]);
  
  const ordersData = [
    ['DATA PESANAN'],
    [''],
    ordersHeaders,
    ...ordersRows
  ];
  
  const ws3 = XLSX.utils.aoa_to_sheet(ordersData);
  ws3['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Data Pesanan');
  
  // Sheet 4: Penjelasan (if available)
  if (result.explanation && result.costContributions) {
    const totalContribution = result.costContributions.distanceContribution + 
                              result.costContributions.timeContribution + 
                              result.costContributions.delayContribution;
    
    const distancePercent = totalContribution > 0 ? (result.costContributions.distanceContribution / totalContribution * 100) : 0;
    const timePercent = totalContribution > 0 ? (result.costContributions.timeContribution / totalContribution * 100) : 0;
    const delayPercent = totalContribution > 0 ? (result.costContributions.delayContribution / totalContribution * 100) : 0;
    
    const explainData: (string | number)[][] = [
      ['PENJELASAN HASIL OPTIMASI'],
      [''],
      ['Ringkasan'],
      [result.explanation.summary],
      [''],
      ['Analisis Trade-off'],
      [result.explanation.tradeoffAnalysis],
      [''],
      ['Kontribusi Biaya'],
      ['Komponen', 'Persentase', 'Nilai'],
      ['Jarak', `${distancePercent.toFixed(1)}%`, result.costContributions.distanceContribution.toFixed(4)],
      ['Waktu', `${timePercent.toFixed(1)}%`, result.costContributions.timeContribution.toFixed(4)],
      ['Keterlambatan', `${delayPercent.toFixed(1)}%`, result.costContributions.delayContribution.toFixed(4)],
    ];
    
    if (result.explanation.keyDecisions.length > 0) {
      explainData.push([''], ['KEPUTUSAN KUNCI']);
      result.explanation.keyDecisions.forEach((decision, idx) => {
        explainData.push([`${idx + 1}. Pesanan ${decision.orderId} (Langkah ${decision.step})`], [decision.reason]);
      });
    }
    
    const ws4 = XLSX.utils.aoa_to_sheet(explainData);
    ws4['!cols'] = [{ wch: 50 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws4, 'Penjelasan');
  }
  
  XLSX.writeFile(wb, `laporan-optimasi-${new Date().toISOString().split('T')[0]}.xlsx`);
};
