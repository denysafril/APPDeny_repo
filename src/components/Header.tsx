import React from 'react';
import { User, FestivalConfig } from '../types';
import { Radio, Wifi, UserCheck, LogOut, FileSpreadsheet, Network } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  config: FestivalConfig | null;
  isConnected: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenLanGuide: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  config,
  isConnected,
  onOpenLogin,
  onLogout,
  onOpenLanGuide,
  onExportExcel,
}) => {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">Admin Panitia</span>;
      case 'juri_1':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-300">Dewan Juri 1</span>;
      case 'juri_2':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">Dewan Juri 2</span>;
      case 'juri_3':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-300">Dewan Juri 3</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">Tamu</span>;
    }
  };

  return (
    <header className="no-print bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {config?.festivalName || 'Festival Band Pelajar'}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {config?.edition || '2026'}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">
                Sistem Penjurian Real-Time & Rekapitulasi Otomatis (3 Dewan Juri)
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Live SSE Status */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
              }`}
              title={isConnected ? 'Terhubung dengan streaming real-time' : 'Menghubungkan kembali...'}
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-[11px]">{isConnected ? 'Live Sync' : 'Menghubungkan'}</span>
            </div>

            {/* LAN Info Button */}
            <button
              onClick={onOpenLanGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Akses Jaringan Lokal (WiFi / LAN)"
            >
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Akses Jaringan LAN</span>
            </button>

            {/* Excel Quick Export */}
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
              title="Unduh Rekapitulasi Lengkap Format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Ekspor Excel</span>
            </button>

            {/* User Profile / Switch */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-slate-400">{user.title}</span>
                </div>
                {getRoleBadge(user.role)}
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Ganti Pengguna / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Masuk Juri / Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
