import React from 'react';
import { FestivalConfig, RecapSummary } from '../types';
import { Printer, X, Download, FileSpreadsheet } from 'lucide-react';
import { exportExcelUrl } from '../api';

interface OfficialReportModalProps {
  config: FestivalConfig;
  recap: RecapSummary;
  onClose: () => void;
}

export const OfficialReportModal: React.FC<OfficialReportModalProps> = ({
  config,
  recap,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Container */}
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm sm:text-base">
              Berita Acara & Lembar Keputusan Resmi Dewan Juri
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={exportExcelUrl()}
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </a>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen (A4 / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 text-slate-900 text-xs sm:text-sm font-serif space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header Kop */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h2 className="text-lg sm:text-xl font-bold tracking-wide uppercase">
              BERITA ACARA HASIL PENJURIAN AKHIR
            </h2>
            <h3 className="text-base sm:text-lg font-black tracking-normal uppercase text-indigo-950">
              {config.festivalName}
            </h3>
            <p className="text-xs italic text-slate-600">
              Edisi: {config.edition} | Tempat: {config.location} | Waktu Pelaksanaan: {config.date}
            </p>
          </div>

          {/* Pengantar */}
          <div className="text-justify leading-relaxed">
            <p>
              Pada hari ini, bertempat di <strong>{config.location}</strong>, Dewan Juri yang ditugaskan dalam rangka{' '}
              <strong>{config.festivalName} ({config.edition})</strong> telah melaksanakan penilaian secara independen, objektif,
              dan transparan terhadap seluruh peserta band pelajar. Berdasarkan akumulasi nilai kumulatif murni dari ketiga anggota Dewan Juri, dengan ini diputuskan penetapan juara sebagai berikut:
            </p>
          </div>

          {/* Tabel Juara 1 - 5 */}
          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-xs border-b border-slate-300 pb-1">
              I. DAFTAR JUARA FESTIVAL BAND (PERINGKAT 1 S/D 5 SKOR TERTINGGI):
            </h4>
            <table className="w-full border-collapse border border-slate-400 text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="border border-slate-400 p-2 text-center w-12">Peringkat</th>
                  <th className="border border-slate-400 p-2 text-center w-20">Predikat</th>
                  <th className="border border-slate-400 p-2">Nama Band</th>
                  <th className="border border-slate-400 p-2">Asal Sekolah</th>
                  <th className="border border-slate-400 p-2 text-center w-24">Skor Kumulatif</th>
                  <th className="border border-slate-400 p-2 text-center w-20">Rata-Rata</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'JUARA I', item: recap.juaraUtama.juara1, rank: 1 },
                  { label: 'JUARA II', item: recap.juaraUtama.juara2, rank: 2 },
                  { label: 'JUARA III', item: recap.juaraUtama.juara3, rank: 3 },
                  { label: 'JUARA IV', item: recap.juaraUtama.juara4, rank: 4 },
                  { label: 'JUARA V', item: recap.juaraUtama.juara5, rank: 5 },
                ].map((row) => (
                  <tr key={row.label} className="border-b border-slate-300">
                    <td className="border border-slate-400 p-2 text-center font-bold">{row.rank}</td>
                    <td className="border border-slate-400 p-2 text-center font-bold text-indigo-900">
                      {row.label}
                    </td>
                    <td className="border border-slate-400 p-2 font-semibold">
                      {row.item?.band.namaBand || '-'}
                    </td>
                    <td className="border border-slate-400 p-2">{row.item?.band.asalSekolah || '-'}</td>
                    <td className="border border-slate-400 p-2 text-center font-bold">
                      {row.item?.totalScore || '-'}
                    </td>
                    <td className="border border-slate-400 p-2 text-center font-medium">
                      {row.item?.averageScore || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabel Best Players */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold uppercase tracking-wider text-xs border-b border-slate-300 pb-1">
              II. DAFTAR JUARA KATEGORI BEST PLAYER (INDIVIDU):
            </h4>
            <table className="w-full border-collapse border border-slate-400 text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold">
                  <th className="border border-slate-400 p-2 w-36">Kategori</th>
                  <th className="border border-slate-400 p-2">Nama Siswa / Musisi</th>
                  <th className="border border-slate-400 p-2">Grup Band</th>
                  <th className="border border-slate-400 p-2">Asal Sekolah</th>
                  <th className="border border-slate-400 p-2 text-center w-24">Total Nilai</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Best Guitarist (Gitar)', res: recap.bestPlayers.gitar },
                  { cat: 'Best Bassist (Bass)', res: recap.bestPlayers.bass },
                  { cat: 'Best Drummer (Drum)', res: recap.bestPlayers.drum },
                  { cat: 'Best Keyboardist (Keyboard)', res: recap.bestPlayers.keyboard },
                  { cat: 'Best Vocalist (Vokal)', res: recap.bestPlayers.vokal },
                ].map((row) => (
                  <tr key={row.cat} className="border-b border-slate-300">
                    <td className="border border-slate-400 p-2 font-bold text-slate-800">{row.cat}</td>
                    <td className="border border-slate-400 p-2 font-semibold">
                      {row.res?.playerName || '-'}
                    </td>
                    <td className="border border-slate-400 p-2">{row.res?.bandName || '-'}</td>
                    <td className="border border-slate-400 p-2">{row.res?.asalSekolah || '-'}</td>
                    <td className="border border-slate-400 p-2 text-center font-bold">
                      {row.res?.totalScore || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan Keputusan */}
          <div className="text-xs text-slate-600 italic">
            Keputusan Dewan Juri ini bersifat mutlak, sah, mengikat, dan tidak dapat diganggu gugat oleh pihak manapun.
          </div>

          {/* Kolom Tanda Tangan */}
          <div className="pt-6 page-break-inside-avoid">
            <div className="text-right text-xs mb-4">
              Ditetapkan di: {config.location}
              <br />
              Pada tanggal: {config.date}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div className="space-y-12">
                <div>Dewan Juri 1,</div>
                <div>
                  <strong className="underline block">{config.juriNames.juri_1}</strong>
                  <span className="text-[11px] text-slate-500 block">{config.juriTitles.juri_1}</span>
                </div>
              </div>

              <div className="space-y-12">
                <div>Dewan Juri 2,</div>
                <div>
                  <strong className="underline block">{config.juriNames.juri_2}</strong>
                  <span className="text-[11px] text-slate-500 block">{config.juriTitles.juri_2}</span>
                </div>
              </div>

              <div className="space-y-12">
                <div>Dewan Juri 3,</div>
                <div>
                  <strong className="underline block">{config.juriNames.juri_3}</strong>
                  <span className="text-[11px] text-slate-500 block">{config.juriTitles.juri_3}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-xs space-y-12 max-w-xs mx-auto">
              <div>Mengetahui,<br />Ketua Panitia Pelaksana:</div>
              <div>
                <strong className="underline block">{config.ketuaPanitia}</strong>
                <span className="text-[11px] text-slate-500 block">Panitia Festival Band Pelajar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
