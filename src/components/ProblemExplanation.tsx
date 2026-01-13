/**
 * KOMPONEN PENJELASAN MASALAH
 * 
 * Menyediakan gambaran edukatif tentang masalah optimasi pengiriman
 * untuk pemahaman akademis.
 */

import { Truck, MapPin, Clock, Target, ArrowRight, Package } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function ProblemExplanation() {
  return (
    <div className="card-elevated p-6 animate-fade-in">
      <h2 className="section-header flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Penjelasan Masalah
      </h2>
      
      <div className="space-y-4 text-sm text-muted-foreground">
        <p className="leading-relaxed">
          Sistem ini mengoptimalkan rute pengiriman untuk <strong className="text-foreground">satu kurir</strong> yang 
          mengirimkan beberapa pesanan di Kota Pontianak. Tujuannya adalah menemukan <strong className="text-foreground">urutan pengiriman optimal</strong> yang 
          meminimalkan total biaya.
        </p>

        <Accordion type="single" collapsible className="w-full">
          {/* Masalah */}
          <AccordionItem value="problem">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Apa masalahnya?
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
                  <span>Seorang kurir berangkat dari <strong className="text-foreground">depot</strong> (lokasi awal tetap)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
                  <span>Beberapa <strong className="text-foreground">pesanan</strong> harus dikirim, masing-masing memiliki lokasi dan tenggat waktu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
                  <span>Kurir harus memutuskan <strong className="text-foreground">pesanan mana yang dikirim berikutnya</strong> di setiap langkah</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs shrink-0 mt-0.5">4</span>
                  <span>Pengiriman terlambat akan dikenakan <strong className="text-foreground">penalti</strong></span>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Proses Keputusan Multistage */}
          <AccordionItem value="stages">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Proses Keputusan Multistage
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                Ini adalah <strong className="text-foreground">masalah keputusan multistage</strong> di mana:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Setiap <strong className="text-foreground">tahap</strong> mewakili pengiriman satu pesanan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Di setiap tahap, kita <strong className="text-foreground">memutuskan</strong> pesanan mana yang dikirim berikutnya</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Sistem menggunakan <strong className="text-foreground">backward recursion</strong> — dimulai dari state akhir (semua pesanan terkirim) dan bekerja mundur</span>
                </li>
              </ul>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg font-mono text-xs">
                Tahap N → Tahap N-1 → ... → Tahap 1 → State Awal
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Variabel State */}
          <AccordionItem value="state">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Variabel State
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                Sebuah <strong className="text-foreground">state</strong> mencakup semua informasi yang dibutuhkan untuk mengambil keputusan optimal:
              </p>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-xs">lokasi_sekarang</p>
                    <p className="text-xs">Di mana kurir berada saat ini (lintang, bujur)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Package className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-xs">pesanan_tersisa</p>
                    <p className="text-xs">Pesanan mana yang belum dikirim</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground text-xs">waktu_sekarang</p>
                    <p className="text-xs">Waktu akumulasi sejak mulai pengiriman</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Fungsi Biaya */}
          <AccordionItem value="cost">
            <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                Fungsi Biaya
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3 pt-2">
              <p>
                Untuk setiap langkah pengiriman, biaya dihitung sebagai berikut:
              </p>
              <div className="p-3 bg-muted/50 rounded-lg font-mono text-center my-3">
                <span className="text-primary">biaya</span> = α × <span className="text-blue-500">jarak</span> + β × <span className="text-green-500">waktu_tempuh</span> + γ × <span className="text-orange-500">penalti_keterlambatan</span>
              </div>
              <ul className="space-y-1 text-xs">
                <li><strong className="text-blue-500">α (alpha)</strong>: Bobot untuk jarak dalam kilometer</li>
                <li><strong className="text-green-500">β (beta)</strong>: Bobot untuk waktu tempuh dalam menit</li>
                <li><strong className="text-orange-500">γ (gamma)</strong>: Bobot untuk penalti keterlambatan</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
