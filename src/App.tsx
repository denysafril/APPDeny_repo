import React, { useState, useEffect, useCallback } from 'react';
import { Band, FestivalConfig, RecapSummary, ScoreData, User, UserRole } from './types';
import { fetchBands, fetchConfig, fetchRecap, fetchScores, exportExcelUrl } from './api';
import { Header } from './components/Header';
import { JuriView } from './components/JuriView';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginModal } from './components/LoginModal';
import { OfficialReportModal } from './components/OfficialReportModal';
import { LanGuideModal } from './components/LanGuideModal';
import { Shield, Award, Users, RefreshCw, Radio, CheckCircle } from 'lucide-react';

const DEFAULT_USER: User = {
  id: 'user_juri_1',
  username: 'juri1',
  role: 'juri_1',
  name: 'Indra Lesmana, M.Mus.',
  title: 'Dewan Juri 1 (Musikalitas & Harmoni)',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('festival_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [bands, setBands] = useState<Band[]>([]);
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [config, setConfig] = useState<FestivalConfig | null>(null);
  const [recap, setRecap] = useState<RecapSummary | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLanGuideOpen, setIsLanGuideOpen] = useState(false);

  // Mode override for judges wishing to view admin leaderboard, or admins wishing to view jury panel
  const [viewModeOverride, setViewModeOverride] = useState<'juri' | 'admin' | null>(null);

  // Load all initial data
  const loadData = useCallback(async () => {
    try {
      const [bandsData, scoresData, configData, recapData] = await Promise.all([
        fetchBands(),
        fetchScores(),
        fetchConfig(),
        fetchRecap(),
      ]);
      setBands(bandsData);
      setScores(scoresData);
      setConfig(configData);
      setRecap(recapData);
    } catch (err) {
      console.error('Error loading festival data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time SSE Connection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/events');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.addEventListener('scores_updated', (e) => {
          try {
            const data = JSON.parse(e.data);
            setRecap(data);
            // Refresh scores list
            fetchScores().then(setScores).catch(console.error);
          } catch (err) {
            console.error('Error parsing scores_updated:', err);
          }
        });

        eventSource.addEventListener('bands_updated', (e) => {
          try {
            const data = JSON.parse(e.data);
            setBands(data);
            fetchRecap().then(setRecap).catch(console.error);
          } catch (err) {
            console.error('Error parsing bands_updated:', err);
          }
        });

        eventSource.addEventListener('config_updated', (e) => {
          try {
            const data = JSON.parse(e.data);
            setConfig(data);
          } catch (err) {
            console.error('Error parsing config_updated:', err);
          }
        });

        eventSource.addEventListener('data_reset', () => {
          loadData();
        });

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Auto reconnect after 3 seconds
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
        reconnectTimeout = setTimeout(connectSSE, 3000);
      }
    };

    connectSSE();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [loadData]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('festival_user', JSON.stringify(user));
    } catch (e) {}
    setIsLoginModalOpen(false);
    setViewModeOverride(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('festival_user');
    } catch (e) {}
    setIsLoginModalOpen(true);
  };

  const handleExportExcel = () => {
    window.location.href = exportExcelUrl();
  };

  const currentRole = currentUser?.role || 'admin';
  const isJuri = currentRole.startsWith('juri_');
  const activeView = viewModeOverride || (isJuri ? 'juri' : 'admin');

  if (isLoading || !config || !recap) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center animate-bounce mb-4">
          <Radio className="w-6 h-6 text-slate-950" />
        </div>
        <h2 className="text-lg font-bold">Memuat Sistem Penjurian Festival Band...</h2>
        <p className="text-xs text-slate-400 mt-1">Menghubungkan ke server database lokal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Header */}
      <Header
        user={currentUser}
        config={config}
        isConnected={isConnected}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenLanGuide={() => setIsLanGuideOpen(true)}
        onExportExcel={handleExportExcel}
      />

      {/* Sub-bar / Quick View Switcher */}
      <div className="no-print bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Tampilan Saat Ini:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                onClick={() => setViewModeOverride('juri')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  activeView === 'juri'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Form Penjurian (Dewan Juri)
              </button>
              <button
                onClick={() => setViewModeOverride('admin')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                  activeView === 'admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monitor & Rekapitulasi (Admin)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden sm:inline">
              Juara Utama:{' '}
              <strong className="text-slate-900">
                {recap.juaraUtama.juara1 ? recap.juaraUtama.juara1.band.namaBand : 'Menunggu skor'}
              </strong>
            </span>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium"
              title="Perbarui data manual"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeView === 'juri' && currentUser && isJuri ? (
          <JuriView
            user={currentUser}
            bands={bands}
            scores={scores}
            config={config}
            onScoreSaved={loadData}
          />
        ) : activeView === 'juri' && (!currentUser || !isJuri) ? (
          <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-slate-200 shadow-md text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Masuk Sebagai Dewan Juri</h3>
              <p className="text-xs text-slate-500 mt-1">
                Anda saat ini login sebagai Admin. Silakan pilih akun Juri 1, 2, atau 3 untuk mengakses formulir penilaian.
              </p>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm transition"
            >
              Pilih Akun Dewan Juri
            </button>
          </div>
        ) : (
          <AdminDashboard
            bands={bands}
            scores={scores}
            config={config}
            recap={recap}
            onRefresh={loadData}
            onOpenReport={() => setIsReportModalOpen(true)}
            onOpenLanGuide={() => setIsLanGuideOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            &copy; 2026 {config.festivalName} &bull; Sistem Penjurian Festival Band Pelajar
          </div>
          <div className="flex items-center gap-3">
            <span>MySQL Database Ready</span>
            <span>&bull;</span>
            <span>Real-Time SSE Sync</span>
            <span>&bull;</span>
            <button
              onClick={() => setIsLanGuideOpen(true)}
              className="text-indigo-600 hover:underline font-medium"
            >
              Panduan WiFi LAN
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {isReportModalOpen && (
        <OfficialReportModal
          config={config}
          recap={recap}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {isLanGuideOpen && (
        <LanGuideModal onClose={() => setIsLanGuideOpen(false)} />
      )}
    </div>
  );
}
