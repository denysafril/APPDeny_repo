import React from 'react';
import { Network, Wifi, Laptop, Tablet, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface LanGuideModalProps {
  onClose: () => void;
}

export const LanGuideModal: React.FC<LanGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Panduan Akses Jaringan Lokal (WiFi / LAN)
              </h3>
              <p className="text-xs text-slate-400">
                Menghubungkan Tablet Dewan Juri ke Server Panitia
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-indigo-600" />
              <span>Koneksi Satu Jaringan (Satu Hotspot / Router WiFi)</span>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              Pastikan laptop panitia (server) dan ketiga perangkat tablet/ponsel dewan juri
              terhubung ke nama Wi-Fi atau Hotspot lokal yang sama di lokasi panggung festival.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Langkah Menghubungkan Dewan Juri:
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-800 block">Cek Alamat IP Laptop Server</strong>
                  <span className="text-slate-500">
                    Buka Command Prompt (Windows) ketik <code>ipconfig</code>, atau Terminal (Mac/Linux) ketik <code>ifconfig</code>. Temukan IPv4 (contoh: <code>192.168.1.15</code>).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-800 block">Buka Browser di Tablet/HP Juri</strong>
                  <span className="text-slate-500">
                    Ketik alamat IP server diikuti port 3000 pada browser Chrome/Safari di tablet juri:
                    <br />
                    <code className="text-indigo-600 font-bold bg-white px-2 py-0.5 rounded border border-indigo-200 inline-block mt-1">
                      http://192.168.x.x:3000
                    </code>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-800 block">Login Sesuai Juri Masing-masing</strong>
                  <span className="text-slate-500">
                    Juri 1 masuk dengan PIN <code>1111</code>, Juri 2 dengan PIN <code>2222</code>, dan Juri 3 dengan PIN <code>3333</code>.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time Sync Tanpa Kuota Internet:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Sistem berjalan penuh menggunakan koneksi lokal. Penilaian yang diinput ketiga juri
              akan langsung tersinkronisasi ke monitor admin secara real-time via Server-Sent Events (SSE).
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
