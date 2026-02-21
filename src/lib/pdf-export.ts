import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { OptimizationResult, Parameters } from './types';

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours > 0) return `${hours}j ${mins}m`;
  return `${mins} menit`;
}

function formatDate(date: Date): string {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export async function exportToPDF(
  result: OptimizationResult,
  params: Parameters,
  sectionsToCapture: string[] // CSS selectors for visual sections
): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  let y = MARGIN;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // ===== COVER / TITLE =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text('Laporan Hasil Optimasi', PAGE_WIDTH / 2, y + 10, { align: 'center' });
  
  doc.setFontSize(13);
  doc.setTextColor(60, 60, 60);
  y += 20;
  doc.text('Rute dan Penjadwalan Pengiriman Last-Mile', PAGE_WIDTH / 2, y, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  y += 8;
  doc.text('Dynamic Programming — Backward Recursion', PAGE_WIDTH / 2, y, { align: 'center' });
  
  y += 6;
  doc.text(`Kelompok 03 Riset Operasi • TI22D • 2026`, PAGE_WIDTH / 2, y, { align: 'center' });

  y += 5;
  const now = new Date();
  doc.setFontSize(9);
  doc.text(
    `Diekspor pada: ${now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
    PAGE_WIDTH / 2,
    y,
    { align: 'center' }
  );

  // Divider
  y += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  // ===== PARAMETER SECTION =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('1. Parameter Optimasi', MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const paramRows = [
    ['Kecepatan Rata-rata Kurir', `${params.averageSpeed} km/jam`],
    ['Waktu Layanan per Pesanan', `${params.serviceTime} menit`],
    ['Bobot α (Jarak)', `${params.alpha}`],
    ['Bobot β (Waktu)', `${params.beta}`],
    ['Bobot γ (Keterlambatan)', `${params.gamma}`],
    ['Fungsi Biaya', `cost = ${params.alpha}×jarak + ${params.beta}×waktu + ${params.gamma}×keterlambatan`],
  ];

  paramRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(`${label}:`, MARGIN + 2, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, MARGIN + 70, y);
    y += 5;
  });

  y += 5;

  // ===== RINGKASAN HASIL =====
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('2. Ringkasan Hasil Optimasi', MARGIN, y);
  y += 7;

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const summaryRows = [
    ['Jumlah Pesanan', `${result.sequence.length}`],
    ['Total Jarak Tempuh', `${result.totalDistance.toFixed(2)} km`],
    ['Total Waktu Perjalanan', formatMinutes(result.totalTravelTime)],
    ['Total Penalti Keterlambatan', formatMinutes(result.totalDelayPenalty)],
    ['Total Biaya (Fungsi Objektif)', result.totalCost.toFixed(2)],
    ['Waktu Komputasi', `${result.computationTime.toFixed(0)} ms`],
  ];

  summaryRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(`${label}:`, MARGIN + 2, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, MARGIN + 70, y);
    y += 5;
  });

  y += 3;
  // Cost contributions
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const distPct = ((result.costContributions.distanceContribution / result.totalCost) * 100).toFixed(1);
  const timePct = ((result.costContributions.timeContribution / result.totalCost) * 100).toFixed(1);
  const delayPct = ((result.costContributions.delayContribution / result.totalCost) * 100).toFixed(1);
  doc.text(`Komposisi biaya: Jarak ${distPct}% | Waktu ${timePct}% | Keterlambatan ${delayPct}%`, MARGIN + 2, y);
  y += 8;

  // ===== URUTAN PENGIRIMAN =====
  addNewPageIfNeeded(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('3. Urutan Pengiriman Optimal', MARGIN, y);
  y += 7;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(MARGIN, y - 3, CONTENT_WIDTH, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);

  const colX = [MARGIN + 2, MARGIN + 14, MARGIN + 40, MARGIN + 62, MARGIN + 88, MARGIN + 118, MARGIN + 148];
  const headers = ['No.', 'ID Pesanan', 'Jarak (km)', 'Waktu Tiba', 'Batas Waktu', 'Keterlambatan', 'Biaya'];
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);

  result.sequence.forEach((step, i) => {
    addNewPageIfNeeded(6);
    if (i % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(MARGIN, y - 3, CONTENT_WIDTH, 5, 'F');
    }
    doc.text(`${i + 1}`, colX[0], y);
    doc.text(step.order.order_id, colX[1], y);
    doc.text(step.distance.toFixed(2), colX[2], y);
    doc.text(formatDate(step.arrivalTime), colX[3], y);
    doc.text(formatDate(step.order.due_time), colX[4], y);
    doc.text(step.delayPenalty > 0 ? formatMinutes(step.delayPenalty) : '—', colX[5], y);
    doc.text(step.stepCost.toFixed(2), colX[6], y);
    y += 5;
  });

  y += 5;

  // ===== STATISTIK DP =====
  addNewPageIfNeeded(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('4. Statistik Dynamic Programming', MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const dpRows = [
    ['Total State Dievaluasi', `${result.dpStatistics.totalStatesEvaluated}`],
    ['Memo Hit (State Digunakan Ulang)', `${result.dpStatistics.totalMemoHits}`],
    ['State Unik Tersimpan', `${result.dpStatistics.uniqueStatesStored}`],
    ['Kedalaman Rekursi Maksimum', `${result.dpStatistics.maxRecursionDepth}`],
  ];

  dpRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(`${label}:`, MARGIN + 2, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, MARGIN + 80, y);
    y += 5;
  });

  y += 5;

  // ===== INTERPRETASI =====
  addNewPageIfNeeded(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('5. Interpretasi & Analisis', MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(50, 50, 50);

  // Word-wrap the summary
  const summaryLines = doc.splitTextToSize(result.explanation.summary, CONTENT_WIDTH - 4);
  addNewPageIfNeeded(summaryLines.length * 4 + 5);
  doc.text(summaryLines, MARGIN + 2, y);
  y += summaryLines.length * 4 + 4;

  const tradeoffLines = doc.splitTextToSize(result.explanation.tradeoffAnalysis, CONTENT_WIDTH - 4);
  addNewPageIfNeeded(tradeoffLines.length * 4 + 5);
  doc.setFont('helvetica', 'italic');
  doc.text(tradeoffLines, MARGIN + 2, y);
  y += tradeoffLines.length * 4 + 6;

  // Key decisions
  if (result.explanation.keyDecisions.length > 0) {
    addNewPageIfNeeded(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Keputusan Utama:', MARGIN + 2, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    result.explanation.keyDecisions.forEach((dec) => {
      const decText = `Langkah ${dec.step} (${dec.orderId}): ${dec.reason}`;
      const decLines = doc.splitTextToSize(decText, CONTENT_WIDTH - 8);
      addNewPageIfNeeded(decLines.length * 3.5 + 3);
      doc.text(decLines, MARGIN + 4, y);
      y += decLines.length * 3.5 + 2;
    });
  }

  y += 5;

  // ===== CAPTURE VISUAL SECTIONS (Map, Graph) =====
  for (const selector of sectionsToCapture) {
    const el = document.querySelector(selector) as HTMLElement;
    if (!el) continue;

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = CONTENT_WIDTH;
      const imgHeight = (canvas.height / canvas.width) * imgWidth;

      addNewPageIfNeeded(imgHeight + 15);

      // Add section title based on selector
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      
      if (selector.includes('route-map')) {
        doc.text('6. Visualisasi Peta Rute', MARGIN, y);
      } else if (selector.includes('state-graph')) {
        doc.text('7. Graf Dependensi State DP', MARGIN, y);
      }
      y += 6;

      doc.addImage(imgData, 'PNG', MARGIN, y, imgWidth, imgHeight);
      y += imgHeight + 8;
    } catch (e) {
      console.warn(`Gagal menangkap elemen ${selector}:`, e);
    }
  }

  // ===== FOOTER on last page =====
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Dokumen ini dihasilkan secara otomatis oleh Sistem Optimasi Pengiriman Last-Mile',
    PAGE_WIDTH / 2,
    PAGE_HEIGHT - 8,
    { align: 'center' }
  );

  // Save
  const timestamp = now.toISOString().slice(0, 10);
  doc.save(`Laporan_Optimasi_${timestamp}.pdf`);
}
