import React, { useState, useEffect } from 'react';
import { Band, FestivalConfig, RecapSummary, ScoreData } from '../types';
import {
  Trophy,
  Award,
  Users,
  Sliders,
  Database,
  Printer,
  FileSpreadsheet,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Mic,
  Music,
  Play,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Server,
  Wifi,
  Terminal,
  Copy,
} from 'lucide-react';
import {
  exportExcelUrl,
  exportSqlDumpUrl,
  viewSchemaSqlUrl,
  saveBand,
  deleteBand,
  updateBandStatus,
  updateConfig,
  resetDatabase,
  fetchServerInfo,
  ServerInfo,
} from '../api';

interface AdminDashboardProps {
  bands: Band[];
  scores: ScoreData[];
  config: FestivalConfig;
  recap: RecapSummary;
  onRefresh: () => void;
  onOpenReport: () => void;
  onOpenLanGuide: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  bands,
  scores,
  config,
  recap,
  onRefresh,
  onOpenReport,
  onOpenLanGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'juara' | 'bands' | 'config' | 'db'>('leaderboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBand, setEditingBand] = useState<Band | null>(null);
  const [isAddingBand, setIsAddingBand] = useState(false);

  // Band form state
  const [bandForm, setBandForm] = useState({
    nomorUrut: 1,
    namaBand: '',
    asalSekolah: '',
    laguWajib: '',
    laguPilihan: '',
    vokal: '',
    gitar: '',
    bass: '',
    drum: '',
    keyboard: '',
  });

  // Config form state
  const [configForm, setConfigForm] = useState<FestivalConfig>(config);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Server Info & Network State
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [isLoadingServerInfo, setIsLoadingServerInfo] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'db') {
      setIsLoadingServerInfo(true);
      fetchServerInfo()
        .then((info) => setServerInfo(info))
        .catch((err) => console.warn('Gagal memuat info server:', err))
        .finally(() => setIsLoadingServerInfo(false));
    }
  }, [activeTab]);

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Filtered leaderboard
  const filteredRankings = recap.rankings.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.band.namaBand.toLowerCase().includes(q) ||
      r.band.asalSekolah.toLowerCase().includes(q) ||
      String(r.band.nomorUrut).includes(q)
    );
  });

  const handleOpenAddBand = () => {
    setBandForm({
      nomorUrut: bands.length + 1,
      namaBand: '',
      asalSekolah: '',
      laguWajib: 'Bendera - Cokelat',
      laguPilihan: '',
      vokal: '',
      gitar: '',
      bass: '',
      drum: '',
      keyboard: '',
    });
    setEditingBand(null);
    setIsAddingBand(true);
  };

  const handleOpenEditBand = (b: Band) => {
    setEditingBand(b);
    setBandForm({
      nomorUrut: b.nomorUrut,
      namaBand: b.namaBand,
      asalSekolah: b.asalSekolah,
      laguWajib: b.laguWajib,
      laguPilihan: b.laguPilihan,
      vokal: b.personel.vokal,
      gitar: b.personel.gitar,
      bass: b.personel.bass,
      drum: b.personel.drum,
      keyboard: b.personel.keyboard,
    });
    setIsAddingBand(true);
  };

  const handleSaveBandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Band> = {
        nomorUrut: Number(bandForm.nomorUrut),
        namaBand: bandForm.namaBand,
        asalSekolah: bandForm.asalSekolah,
        laguWajib: bandForm.laguWajib,
        laguPilihan: bandForm.laguPilihan,
        personel: {
          vokal: bandForm.vokal,
          gitar: bandForm.gitar,
          bass: bandForm.bass,
          drum: bandForm.drum,
          keyboard: bandForm.keyboard,
        },
      };

      if (editingBand) {
        payload.id = editingBand.id;
        await saveBand(payload, true);
      } else {
        await saveBand(payload, false);
      }
      setIsAddingBand(false);
      setEditingBand(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data band');
    }
  };

  const handleDeleteBand = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus peserta band "${name}" beserta seluruh nilai yang sudah masuk?`)) {
      try {
        await deleteBand(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Gagal menghapus');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: Band['status']) => {
    try {
      await updateBandStatus(id, newStatus);
      onRefresh();
    } catch (err: any) {
      alert('Gagal update status');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigSuccess(false);
    try {
      await updateConfig(configForm);
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      alert('Gagal update konfigurasi: ' + err.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('PERINGATAN: Reset data akan mengembalikan seluruh data peserta dan skor ke data default awal festival. Lanjutkan?')) {
      await resetDatabase();
      onRefresh();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Rekapitulasi Real-Time</span>
          </button>
          <button
            onClick={() => setActiveTab('juara')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'juara'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Juara 1-5 & Best Players</span>
          </button>
          <button
            onClick={() => setActiveTab('bands')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'bands'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kelola Peserta Band</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Bobot & Pengaturan</span>
          </button>
          <button
            onClick={() => setActiveTab('db')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'db'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database & Ekspor</span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white shadow-sm transition"
            title="Lihat & Cetak Berita Acara Resmi"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Berita Acara</span>
          </button>
          <a
            href={exportExcelUrl()}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            title="Unduh Lembar Excel Lengkap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* Progress & Live Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block">Total Peserta Band</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{bands.length} Band</div>
          <span className="text-[11px] text-slate-400">Tingkat SMA/SMK</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block">Penjurian Selesai Penuh</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {recap.completedBandsCount} / {bands.length}
          </div>
          <span className="text-[11px] text-slate-400">3 Juri telah mengunci nilai</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block">Dewan Juri Terdaftar</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">3 Orang</div>
          <span className="text-[11px] text-slate-400">Juri 1, Juri 2, Juri 3</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-medium text-slate-500 block">Status Leaderboard</span>
          <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1">
            <span>Real-Time</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span className="text-[11px] text-slate-400">Sinkronisasi instan otomatis</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: REKAPITULASI REAL-TIME (LEADERBOARD) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {/* Top Bar with Search & Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Cari nama band, sekolah, nomor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm pl-3 pr-8 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-auto">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Terkunci
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Draf
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Belum
              </span>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 text-center">Rank</th>
                    <th className="py-3.5 px-3 text-center">No.</th>
                    <th className="py-3.5 px-4">Nama Band & Sekolah</th>
                    <th className="py-3.5 px-3 text-center">
                      Juri 1
                      <span className="block text-[9px] text-slate-400 font-normal">
                        {config.juriNames.juri_1.split(',')[0]}
                      </span>
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      Juri 2
                      <span className="block text-[9px] text-slate-400 font-normal">
                        {config.juriNames.juri_2.split(',')[0]}
                      </span>
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      Juri 3
                      <span className="block text-[9px] text-slate-400 font-normal">
                        {config.juriNames.juri_3.split(',')[0]}
                      </span>
                    </th>
                    <th className="py-3.5 px-4 text-center bg-slate-800 text-amber-300">
                      Total Kumulatif
                    </th>
                    <th className="py-3.5 px-3 text-center">Rata-Rata</th>
                    <th className="py-3.5 px-3 text-center">Status Panggung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRankings.map((r) => {
                    const isJuaraTop5 = r.rank <= 5 && r.totalScore > 0;
                    return (
                      <tr
                        key={r.band.id}
                        className={`hover:bg-slate-50/80 transition ${
                          r.rank === 1 && r.totalScore > 0
                            ? 'bg-amber-50/40 font-semibold'
                            : isJuaraTop5
                            ? 'bg-indigo-50/20'
                            : ''
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                              r.rank === 1
                                ? 'bg-amber-400 text-slate-950 shadow-sm'
                                : r.rank === 2
                                ? 'bg-slate-300 text-slate-900'
                                : r.rank === 3
                                ? 'bg-amber-700/80 text-white'
                                : r.rank <= 5
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {r.rank}
                          </span>
                        </td>

                        {/* Nomor Undian */}
                        <td className="py-3 px-3 text-center font-bold text-slate-600">
                          #{r.band.nomorUrut}
                        </td>

                        {/* Band Details */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{r.band.namaBand}</div>
                          <div className="text-xs text-slate-500">{r.band.asalSekolah}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Wajib: <span className="text-slate-600">{r.band.laguWajib}</span> |
                            Pilihan: <span className="text-slate-600">{r.band.laguPilihan}</span>
                          </div>
                        </td>

                        {/* Skor Juri 1 */}
                        <td className="py-3 px-3 text-center">
                          {r.scores.juri_1 ? (
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                r.scores.juri_1.isLocked
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.scores.juri_1.totalBand}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Skor Juri 2 */}
                        <td className="py-3 px-3 text-center">
                          {r.scores.juri_2 ? (
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                r.scores.juri_2.isLocked
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.scores.juri_2.totalBand}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Skor Juri 3 */}
                        <td className="py-3 px-3 text-center">
                          {r.scores.juri_3 ? (
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                r.scores.juri_3.isLocked
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {r.scores.juri_3.totalBand}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Total Kumulatif */}
                        <td className="py-3 px-4 text-center bg-slate-50 font-black text-sm text-indigo-900">
                          {r.totalScore > 0 ? r.totalScore : '-'}
                        </td>

                        {/* Rata-Rata */}
                        <td className="py-3 px-3 text-center font-bold text-slate-700">
                          {r.averageScore > 0 ? r.averageScore : '-'}
                        </td>

                        {/* Status Panggung */}
                        <td className="py-3 px-3 text-center">
                          <select
                            value={r.band.status}
                            onChange={(e) =>
                              handleStatusChange(r.band.id, e.target.value as Band['status'])
                            }
                            className={`text-xs px-2.5 py-1 rounded-lg font-semibold border focus:outline-none ${
                              r.band.status === 'selesai'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : r.band.status === 'tampil'
                                ? 'bg-blue-50 text-blue-700 border-blue-300 animate-pulse'
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            <option value="menunggu">Menunggu</option>
                            <option value="tampil">Tampil</option>
                            <option value="selesai">Selesai</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PANGGUNG JUARA (JUARA 1-5 & BEST PLAYERS) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'juara' && (
        <div className="space-y-6">
          {/* Juara 1-5 Cards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">
                Juara Festival Band Pelajar (Peringkat 1 s/d 5)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Pemenang ditentukan berdasarkan jumlah skor kumulatif tertinggi dari ketiga dewan juri.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[
                { title: 'JUARA I', badge: 'bg-amber-400 text-slate-950', border: 'border-amber-400', res: recap.juaraUtama.juara1 },
                { title: 'JUARA II', badge: 'bg-slate-300 text-slate-900', border: 'border-slate-300', res: recap.juaraUtama.juara2 },
                { title: 'JUARA III', badge: 'bg-amber-700 text-white', border: 'border-amber-700', res: recap.juaraUtama.juara3 },
                { title: 'JUARA IV (Harapan 1)', badge: 'bg-indigo-100 text-indigo-900', border: 'border-indigo-200', res: recap.juaraUtama.juara4 },
                { title: 'JUARA V (Harapan 2)', badge: 'bg-slate-100 text-slate-800', border: 'border-slate-200', res: recap.juaraUtama.juara5 },
              ].map((j, idx) => (
                <div
                  key={j.title}
                  className={`bg-white rounded-2xl p-4 border-2 ${j.border} shadow-sm flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-black uppercase ${j.badge}`}>
                        {j.title}
                      </span>
                      <Trophy className="w-4 h-4 text-amber-500" />
                    </div>

                    {j.res ? (
                      <div className="space-y-1 mt-2">
                        <div className="text-xs text-slate-400 font-semibold">
                          No. Undian #{j.res.band.nomorUrut}
                        </div>
                        <h4 className="font-bold text-slate-900 text-base leading-tight">
                          {j.res.band.namaBand}
                        </h4>
                        <p className="text-xs text-slate-500">{j.res.band.asalSekolah}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic mt-3">Belum ada data</p>
                    )}
                  </div>

                  {j.res && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Skor Kumulatif:</span>
                        <span className="text-base font-black text-indigo-700">
                          {j.res.totalScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                        <span>Rata-Rata:</span>
                        <span>{j.res.averageScore}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Best Players Section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">
                Juara Kategori Best Player (Instrumen & Vokal)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Penghargaan individu terbaik untuk pemain Gitar, Bass, Drum, Keyboard, dan Vokal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: 'Best Guitarist', key: 'gitar', icon: Music, res: recap.bestPlayers.gitar, color: 'text-amber-600 bg-amber-50' },
                { title: 'Best Bassist', key: 'bass', icon: Sliders, res: recap.bestPlayers.bass, color: 'text-blue-600 bg-blue-50' },
                { title: 'Best Drummer', key: 'drum', icon: Sparkles, res: recap.bestPlayers.drum, color: 'text-red-600 bg-red-50' },
                { title: 'Best Keyboardist', key: 'keyboard', icon: Award, res: recap.bestPlayers.keyboard, color: 'text-emerald-600 bg-emerald-50' },
                { title: 'Best Vocalist', key: 'vokal', icon: Mic, res: recap.bestPlayers.vokal, color: 'text-purple-600 bg-purple-50' },
              ].map((bp) => (
                <div key={bp.title} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-lg ${bp.color}`}>
                        {bp.title}
                      </span>
                      <bp.icon className="w-4 h-4 text-slate-400" />
                    </div>

                    {bp.res ? (
                      <div className="space-y-1 mt-2">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {bp.res.playerName || '(Nama belum diisi)'}
                        </h4>
                        <p className="text-xs font-medium text-slate-600">{bp.res.bandName}</p>
                        <p className="text-[11px] text-slate-400">{bp.res.asalSekolah}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic mt-3">Belum ada penilaian</p>
                    )}
                  </div>

                  {bp.res && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Total Skor Juri:</span>
                        <span className="text-sm font-black text-slate-900">{bp.res.totalScore}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>J1: {bp.res.breakdown.juri_1}</span>
                        <span>J2: {bp.res.breakdown.juri_2}</span>
                        <span>J3: {bp.res.breakdown.juri_3}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: KELOLA PESERTA BAND */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bands' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Daftar Peserta Festival Band ({bands.length} Band)
            </h3>
            <button
              onClick={handleOpenAddBand}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Peserta Band</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-center">No.</th>
                    <th className="py-3 px-4">Nama Band & Asal Sekolah</th>
                    <th className="py-3 px-4">Lagu Wajib & Pilihan</th>
                    <th className="py-3 px-4">Nama Personel</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bands.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 text-center font-bold text-slate-900">#{b.nomorUrut}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{b.namaBand}</div>
                        <div className="text-xs text-slate-500">{b.asalSekolah}</div>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div>Wajib: <span className="font-medium text-slate-700">{b.laguWajib}</span></div>
                        <div>Pilihan: <span className="font-medium text-slate-700">{b.laguPilihan}</span></div>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        <div>Voc: {b.personel.vokal || '-'} | Gtr: {b.personel.gitar || '-'}</div>
                        <div>Bass: {b.personel.bass || '-'} | Drm: {b.personel.drum || '-'} | Key: {b.personel.keyboard || '-'}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditBand(b)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Ubah data"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBand(b.id, b.namaBand)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus band"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: BOBOT & PENGATURAN */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Konfigurasi Festival & Bobot Penilaian</h3>
              <p className="text-xs text-slate-500">Atur parameter lomba, dewan juri, dan pembobotan kriteria.</p>
            </div>
            {configSuccess && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                Tersimpan!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Festival:</label>
              <input
                type="text"
                value={configForm.festivalName}
                onChange={(e) => setConfigForm({ ...configForm, festivalName: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Edisi / Subtitle:</label>
              <input
                type="text"
                value={configForm.edition}
                onChange={(e) => setConfigForm({ ...configForm, edition: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Festival:</label>
              <input
                type="text"
                value={configForm.location}
                onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Acara:</label>
              <input
                type="text"
                value={configForm.date}
                onChange={(e) => setConfigForm({ ...configForm, date: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ketua Panitia Pelaksana:</label>
              <input
                type="text"
                value={configForm.ketuaPanitia}
                onChange={(e) => setConfigForm({ ...configForm, ketuaPanitia: e.target.value })}
                className="w-full text-xs sm:text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Bobot Penilaian Kriteria Band (%):</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Musikalitas (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={configForm.bobotMusikalitas}
                  onChange={(e) => setConfigForm({ ...configForm, bobotMusikalitas: Number(e.target.value) })}
                  className="w-full text-sm p-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Teknik (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={configForm.bobotTeknik}
                  onChange={(e) => setConfigForm({ ...configForm, bobotTeknik: Number(e.target.value) })}
                  className="w-full text-sm p-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Kekompakan (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={configForm.bobotKekompakan}
                  onChange={(e) => setConfigForm({ ...configForm, bobotKekompakan: Number(e.target.value) })}
                  className="w-full text-sm p-2 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Vokal (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={configForm.bobotVokal}
                  onChange={(e) => setConfigForm({ ...configForm, bobotVokal: Number(e.target.value) })}
                  className="w-full text-sm p-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Total Bobot saat ini:{' '}
              <strong className="text-slate-800">
                {configForm.bobotMusikalitas + configForm.bobotTeknik + configForm.bobotKekompakan + configForm.bobotVokal}%
              </strong>{' '}
              (disarankan berjumlah pas 100%)
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Identitas 3 Dewan Juri (Untuk Berita Acara & SK):</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-indigo-700">Dewan Juri 1:</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap Juri 1"
                  value={configForm.juriNames.juri_1}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      juriNames: { ...configForm.juriNames, juri_1: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Keahlian / Gelar Juri 1"
                  value={configForm.juriTitles.juri_1}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      juriTitles: { ...configForm.juriTitles, juri_1: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-indigo-700">Dewan Juri 2:</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap Juri 2"
                  value={configForm.juriNames.juri_2}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      juriNames: { ...configForm.juriNames, juri_2: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Keahlian / Gelar Juri 2"
                  value={configForm.juriTitles.juri_2}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      juriTitles: { ...configForm.juriTitles, juri_2: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-indigo-700">Dewan Juri 3:</span>
                <input
                  type="text"
                  placeholder="Nama Lengkap Juri 3"
                  value={configForm.juriNames.juri_3}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      juriNames: { ...configForm.juriNames, juri_3: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                />
                <input
                  type="text"
                  placeholder="Keahlian / Gelar Juri 3"
                  value={configForm.juriTitles.juri_3}
                  onChange={(e) =>
                    setConfigForm({
                      ...configForm,
                      juriTitles: { ...configForm.juriTitles, juri_3: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
            >
              {isSavingConfig ? 'Menyimpan...' : 'Simpan Perubahan Konfigurasi'}
            </button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: DATABASE MYSQL & PENGATURAN SERVER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'db' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Web Server & Database MySQL
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Status operasional server lokal, alamat akses tablet dewan juri, dan integrasi database MySQL.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Web Server Port 3000 Aktif
              </span>
            </div>
          </div>

          {/* Live LAN Access Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Alamat Akses Jaringan Lokal (LAN / Wi-Fi)</h4>
                  <p className="text-xs text-slate-300">
                    Buka alamat ini di browser Chrome/Safari pada tablet atau HP masing-masing Dewan Juri:
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {serverInfo?.localIps && serverInfo.localIps.length > 0 ? (
                serverInfo.localIps.map((ip) => {
                  const url = `http://${ip}:${serverInfo.port}`;
                  const isCopied = copiedUrl === url;
                  return (
                    <div
                      key={ip}
                      className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                          URL Tablet Juri (Wi-Fi)
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 truncate block">
                          {url}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(url)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                      Akses Komputer Lokal (Localhost)
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400">
                      http://localhost:3000
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('http://localhost:3000')}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Salin</span>
                  </button>
                </div>
              )}

              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                    Mode Pengikatan (Binding)
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold text-slate-300">
                    Host 0.0.0.0:3000 (Semua Perangkat LAN)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Unduh Skema MySQL (DDL)</h4>
                </div>
                <p className="text-xs text-slate-500">
                  File <code>schema.sql</code> lengkap berisi tabel <code>bands</code>, <code>scores</code>, <code>users</code>, dan relasi foreign key untuk diimpor ke MySQL/phpMyAdmin.
                </p>
              </div>
              <a
                href={viewSchemaSqlUrl()}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat & Unduh schema.sql</span>
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Unduh SQL Dump Data Live</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Ekspor instan seluruh data peserta, konfigurasi lomba, dan nilai juri saat ini dalam format query SQL <code>INSERT INTO</code>.
                </p>
              </div>
              <a
                href={exportSqlDumpUrl()}
                download
                className="mt-4 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Unduh festival_band_dump.sql</span>
              </a>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Reset Data Festival</h4>
                </div>
                <p className="text-xs text-slate-500">
                  Kembalikan sistem ke data demo 8 band sekolah dengan contoh penilaian dewan juri untuk simulasi pengujian.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="mt-4 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset ke Data Awal</span>
              </button>
            </div>
          </div>

          {/* MySQL Configuration Tutorial */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl text-xs space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>Panduan Lengkap Menjalankan Web Server & Database MySQL:</span>
              </div>
              <span className="text-[11px] text-slate-400">Node.js + Express + MySQL</span>
            </div>

            <div className="space-y-3 text-slate-300">
              <div>
                <div className="text-indigo-400 font-bold mb-1">1. Menyiapkan Database di MySQL (XAMPP / Laragon / Linux):</div>
                <p className="text-slate-400 mb-1">
                  Buka phpMyAdmin di browser (<code>http://localhost/phpmyadmin</code>) atau terminal MySQL, lalu buat database:
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg text-emerald-400 select-all">
                  CREATE DATABASE festival_band_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
                </div>
                <p className="text-slate-400 mt-1">
                  Lalu impor file <code className="text-amber-300">schema.sql</code> (lewat tab Import di phpMyAdmin atau via CLI):
                </p>
                <div className="bg-slate-950 p-2.5 rounded-lg text-emerald-400 select-all">
                  mysql -u root -p festival_band_db &lt; schema.sql
                </div>
              </div>

              <div>
                <div className="text-indigo-400 font-bold mb-1">2. Konfigurasi File .env:</div>
                <p className="text-slate-400 mb-1">Pastikan kredensial di file <code>.env</code> sudah sesuai dengan server MySQL Anda:</p>
                <div className="bg-slate-950 p-2.5 rounded-lg text-amber-300 select-all leading-relaxed">
                  MYSQL_HOST=localhost<br />
                  MYSQL_PORT=3306<br />
                  MYSQL_USER=root<br />
                  MYSQL_PASSWORD=1234<br />
                  MYSQL_DATABASE=festival_band_db
                </div>
              </div>

              <div>
                <div className="text-indigo-400 font-bold mb-1">3. Cara Menjalankan Web Server:</div>
                <p className="text-slate-400 mb-1">Buka Terminal / Command Prompt pada folder aplikasi, lalu jalankan:</p>
                <div className="bg-slate-950 p-2.5 rounded-lg text-emerald-400 select-all space-y-1">
                  <div><span className="text-slate-500"># Mode Pengembangan (Otomatis reload):</span><br />npm run dev</div>
                  <div className="pt-2"><span className="text-slate-500"># Mode Produksi (Sangat Cepat & Stabil saat Acara):</span><br />npm run build<br />npm run start</div>
                </div>
              </div>

              <div>
                <div className="text-indigo-400 font-bold mb-1">4. Menghubungkan Tablet / HP Dewan Juri:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Sambungkan laptop server dan 3 tablet juri ke Wi-Fi / Hotspot yang sama (tanpa perlu internet).</li>
                  <li>Buka browser (Chrome/Safari) di tablet juri, ketik alamat IP server pada Port 3000 (misal: <code className="text-emerald-400">{serverInfo?.primaryUrl || 'http://192.168.1.15:3000'}</code>).</li>
                  <li>Jika tablet tidak bisa mengakses, pastikan <strong>Windows Defender Firewall</strong> mengizinkan koneksi Inbound pada Port 3000.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Band */}
      {isAddingBand && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {editingBand ? 'Ubah Data Peserta Band' : 'Tambah Peserta Band Baru'}
              </h3>
              <button
                onClick={() => setIsAddingBand(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBandSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. Undian:</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bandForm.nomorUrut}
                    onChange={(e) => setBandForm({ ...bandForm, nomorUrut: Number(e.target.value) })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Band:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: The Groovy Kids"
                    value={bandForm.namaBand}
                    onChange={(e) => setBandForm({ ...bandForm, namaBand: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asal Sekolah:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMA Negeri 1 Garuda"
                  value={bandForm.asalSekolah}
                  onChange={(e) => setBandForm({ ...bandForm, asalSekolah: e.target.value })}
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lagu Wajib:</label>
                  <input
                    type="text"
                    required
                    value={bandForm.laguWajib}
                    onChange={(e) => setBandForm({ ...bandForm, laguWajib: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lagu Pilihan:</label>
                  <input
                    type="text"
                    required
                    value={bandForm.laguPilihan}
                    onChange={(e) => setBandForm({ ...bandForm, laguPilihan: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Nama Anggota / Personel (Penting untuk Penilaian Best Player):
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Vokalis:</span>
                    <input
                      type="text"
                      placeholder="Nama Vokalis"
                      value={bandForm.vokal}
                      onChange={(e) => setBandForm({ ...bandForm, vokal: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Gitaris:</span>
                    <input
                      type="text"
                      placeholder="Nama Gitaris"
                      value={bandForm.gitar}
                      onChange={(e) => setBandForm({ ...bandForm, gitar: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Bassist:</span>
                    <input
                      type="text"
                      placeholder="Nama Bassist"
                      value={bandForm.bass}
                      onChange={(e) => setBandForm({ ...bandForm, bass: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Drummer:</span>
                    <input
                      type="text"
                      placeholder="Nama Drummer"
                      value={bandForm.drum}
                      onChange={(e) => setBandForm({ ...bandForm, drum: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block mb-0.5">Keyboardist:</span>
                    <input
                      type="text"
                      placeholder="Nama Keyboardist"
                      value={bandForm.keyboard}
                      onChange={(e) => setBandForm({ ...bandForm, keyboard: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingBand(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-sm"
                >
                  Simpan Peserta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
