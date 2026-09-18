import React, { useState, useEffect, useMemo } from 'react';
import { Band, FestivalConfig, ScoreData, User } from '../types';
import { submitScore } from '../api';
import {
  Music,
  CheckCircle2,
  Lock,
  Unlock,
  Save,
  AlertCircle,
  Award,
  Mic2,
  Disc,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
} from 'lucide-react';

interface JuriViewProps {
  user: User;
  bands: Band[];
  scores: ScoreData[];
  config: FestivalConfig;
  onScoreSaved: () => void;
}

export const JuriView: React.FC<JuriViewProps> = ({
  user,
  bands,
  scores,
  config,
  onScoreSaved,
}) => {
  const juriRole = user.role as 'juri_1' | 'juri_2' | 'juri_3';
  const [selectedBandId, setSelectedBandId] = useState<string>(bands[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'kriteria' | 'best_player'>('kriteria');

  // Form State
  const [musikalitas, setMusikalitas] = useState<number>(75);
  const [teknik, setTeknik] = useState<number>(75);
  const [kekompakan, setKekompakan] = useState<number>(75);
  const [vokal, setVokal] = useState<number>(75);

  const [scoreGitar, setScoreGitar] = useState<number>(75);
  const [scoreBass, setScoreBass] = useState<number>(75);
  const [scoreDrum, setScoreDrum] = useState<number>(75);
  const [scoreKeyboard, setScoreKeyboard] = useState<number>(75);
  const [scoreVokal, setScoreVokal] = useState<number>(75);

  const [catatan, setCatatan] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentBand = useMemo(() => {
    return bands.find((b) => b.id === selectedBandId) || bands[0];
  }, [bands, selectedBandId]);

  // Load existing score when selectedBandId changes
  useEffect(() => {
    if (!currentBand) return;
    const existing = scores.find((s) => s.bandId === currentBand.id && s.juriId === juriRole);
    if (existing) {
      setMusikalitas(existing.musikalitas);
      setTeknik(existing.teknik);
      setKekompakan(existing.kekompakan);
      setVokal(existing.vokal);
      setScoreGitar(existing.scoreGitar || 75);
      setScoreBass(existing.scoreBass || 75);
      setScoreDrum(existing.scoreDrum || 75);
      setScoreKeyboard(existing.scoreKeyboard || 75);
      setScoreVokal(existing.scoreVokal || 75);
      setCatatan(existing.catatan || '');
      setIsLocked(existing.isLocked);
    } else {
      // Default initial values
      setMusikalitas(75);
      setTeknik(75);
      setKekompakan(75);
      setVokal(75);
      setScoreGitar(75);
      setScoreBass(75);
      setScoreDrum(75);
      setScoreKeyboard(75);
      setScoreVokal(75);
      setCatatan('');
      setIsLocked(false);
    }
    setSaveMessage(null);
  }, [currentBand, juriRole, scores]);

  // Calculate live weighted score
  const liveTotalScore = useMemo(() => {
    const wM = (config.bobotMusikalitas || 30) / 100;
    const wT = (config.bobotTeknik || 30) / 100;
    const wK = (config.bobotKekompakan || 20) / 100;
    const wV = (config.bobotVokal || 20) / 100;
    const res = musikalitas * wM + teknik * wT + kekompakan * wK + vokal * wV;
    return Number(res.toFixed(2));
  }, [musikalitas, teknik, kekompakan, vokal, config]);

  const handleSave = async (lock: boolean) => {
    if (!currentBand) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await submitScore({
        bandId: currentBand.id,
        juriId: juriRole,
        musikalitas,
        teknik,
        kekompakan,
        vokal,
        scoreGitar,
        scoreBass,
        scoreDrum,
        scoreKeyboard,
        scoreVokal,
        catatan,
        isLocked: lock,
      });
      setIsLocked(lock);
      setSaveMessage({
        type: 'success',
        text: lock
          ? `Nilai untuk ${currentBand.namaBand} BERHASIL DIKUNCI (Final).`
          : `Draf nilai untuk ${currentBand.namaBand} berhasil disimpan.`,
      });
      onScoreSaved();
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Gagal menyimpan nilai' });
    } finally {
      setIsSaving(false);
    }
  };

  // Stepper helper
  const adjustScore = (
    currentVal: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    delta: number
  ) => {
    if (isLocked) return;
    setter((prev) => Math.max(10, Math.min(100, prev + delta)));
  };

  const renderScoreControl = (
    label: string,
    description: string,
    bobot: number,
    value: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    id: string
  ) => {
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition hover:border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">{label}</h4>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Bobot {bobot}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-2xl sm:text-3xl font-black text-indigo-700 tracking-tight">
              {value}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-3">
          <input
            id={id}
            type="range"
            min="10"
            max="100"
            step="1"
            value={value}
            disabled={isLocked}
            onChange={(e) => setter(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
          />

          {/* Quick buttons */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={isLocked || value <= 10}
                onClick={() => adjustScore(value, setter, -5)}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                -5
              </button>
              <button
                type="button"
                disabled={isLocked || value <= 10}
                onClick={() => adjustScore(value, setter, -1)}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                -1
              </button>
              <button
                type="button"
                disabled={isLocked || value >= 100}
                onClick={() => adjustScore(value, setter, 1)}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                +1
              </button>
              <button
                type="button"
                disabled={isLocked || value >= 100}
                onClick={() => adjustScore(value, setter, 5)}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                +5
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center space-x-1">
              {[70, 75, 80, 85, 90, 95].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setter(preset)}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                    value === preset
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInstrumentControl = (
    roleName: string,
    musicianName: string,
    value: number,
    setter: React.Dispatch<React.SetStateAction<number>>,
    id: string
  ) => {
    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition hover:border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-amber-100 text-amber-900 border border-amber-300">
                {roleName}
              </span>
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                {musicianName || '(Nama Personel Belum Diisi)'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Penilaian teknik instrumen, akurasi, dinamika, dan kontribusi musikal
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {value}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
        </div>

        <div className="space-y-3">
          <input
            id={id}
            type="range"
            min="10"
            max="100"
            step="1"
            value={value}
            disabled={isLocked}
            onChange={(e) => setter(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600 disabled:opacity-50"
          />

          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={isLocked || value <= 10}
                onClick={() => adjustScore(value, setter, -5)}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                -5
              </button>
              <button
                type="button"
                disabled={isLocked || value <= 10}
                onClick={() => adjustScore(value, setter, -1)}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                -1
              </button>
              <button
                type="button"
                disabled={isLocked || value >= 100}
                onClick={() => adjustScore(value, setter, 1)}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                +1
              </button>
              <button
                type="button"
                disabled={isLocked || value >= 100}
                onClick={() => adjustScore(value, setter, 5)}
                className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 transition"
              >
                +5
              </button>
            </div>

            <div className="flex items-center space-x-1">
              {[70, 75, 80, 85, 90, 95].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setter(preset)}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                    value === preset
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Status for other judges on current band
  const otherJudgesStatus = useMemo(() => {
    if (!currentBand) return [];
    const roles: Array<'juri_1' | 'juri_2' | 'juri_3'> = ['juri_1', 'juri_2', 'juri_3'];
    return roles.map((r) => {
      const sc = scores.find((s) => s.bandId === currentBand.id && s.juriId === r);
      return {
        role: r,
        name: config.juriNames[r],
        isCurrent: r === juriRole,
        isLocked: sc?.isLocked || false,
        hasScore: Boolean(sc),
        total: sc?.totalBand || 0,
      };
    });
  }, [currentBand, scores, juriRole, config]);

  if (!currentBand) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Music className="w-12 h-12 mx-auto text-slate-400 mb-2" />
        <p>Belum ada data peserta band.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Judge Info & Band Carousel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-800">
                PORTAL PENILAIAN JURI
              </span>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{user.title}</p>
          </div>

          {/* Quick status counters */}
          <div className="flex items-center gap-2">
            <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600">
              Total Band: <strong className="text-slate-900">{bands.length}</strong>
            </div>
            <div className="text-xs bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-700">
              Terkunci:{' '}
              <strong className="text-emerald-900">
                {scores.filter((s) => s.juriId === juriRole && s.isLocked).length}
              </strong>
            </div>
          </div>
        </div>

        {/* Band Selector Tabs / Pills */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Pilih Peserta Band yang Dinilai:
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {bands.map((b) => {
              const myScore = scores.find((s) => s.bandId === b.id && s.juriId === juriRole);
              const isSelected = b.id === currentBand.id;
              const isFinished = myScore?.isLocked;
              const isDraft = myScore && !myScore.isLocked;

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBandId(b.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-left border shrink-0 transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : isFinished
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 hover:bg-emerald-100/60'
                      : isDraft
                      ? 'bg-amber-50/70 border-amber-300 text-amber-900 hover:bg-amber-100/60'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isFinished
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {b.nomorUrut}
                  </span>
                  <div className="min-w-0 max-w-[130px] sm:max-w-[170px]">
                    <div className="font-semibold text-xs truncate">{b.namaBand}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-indigo-100' : 'text-slate-500'
                      }`}
                    >
                      {b.asalSekolah}
                    </div>
                  </div>
                  {isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Band Details Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                NO. UNDIAN #{currentBand.nomorUrut}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                  currentBand.status === 'selesai'
                    ? 'bg-emerald-500/30 text-emerald-300'
                    : currentBand.status === 'tampil'
                    ? 'bg-blue-500/30 text-blue-300 animate-pulse'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                Status: {currentBand.status.toUpperCase()}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{currentBand.namaBand}</h3>
            <p className="text-slate-300 text-sm font-medium">{currentBand.asalSekolah}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-slate-300">
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-amber-400 font-semibold block mb-0.5">Lagu Wajib:</span>
                {currentBand.laguWajib}
              </div>
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <span className="text-amber-400 font-semibold block mb-0.5">Lagu Pilihan:</span>
                {currentBand.laguPilihan}
              </div>
            </div>
          </div>

          {/* Right Live Score Summary */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 lg:min-w-[240px] text-center shrink-0">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Skor Terbobot Anda:
            </span>
            <div className="text-4xl sm:text-5xl font-black text-amber-400 my-1">
              {liveTotalScore}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-center gap-1">
              {isLocked ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <Lock className="w-3.5 h-3.5" /> Nilai Terkunci
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                  <Unlock className="w-3.5 h-3.5" /> Draf Terbuka
                </span>
              )}
            </div>

            {/* Other Judges indicator */}
            <div className="mt-3 pt-3 border-t border-slate-700/60 text-left">
              <div className="text-[11px] text-slate-400 mb-1 font-medium">Status 3 Dewan Juri:</div>
              <div className="space-y-1">
                {otherJudgesStatus.map((j) => (
                  <div key={j.role} className="flex items-center justify-between text-xs">
                    <span className={j.isCurrent ? 'font-bold text-amber-300' : 'text-slate-300'}>
                      {j.role.toUpperCase()}:
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        j.isLocked
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : j.hasScore
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {j.isLocked ? `Selesai (${j.total})` : j.hasScore ? 'Draf' : 'Belum'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Kriteria Band vs Best Player */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('kriteria')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition ${
            activeTab === 'kriteria'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Nilai Kriteria Penjurian Band</span>
        </button>
        <button
          onClick={() => setActiveTab('best_player')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-bold border-b-2 transition ${
            activeTab === 'best_player'
              ? 'border-amber-600 text-amber-600 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Nilai Kategori Best Player (Personel)</span>
        </button>
      </div>

      {/* Feedback Message */}
      {saveMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-red-50 border border-red-300 text-red-800'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Tab 1: Kriteria Band */}
      {activeTab === 'kriteria' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Penilaian band mencakup 4 aspek berbobot: Musikalitas ({config.bobotMusikalitas}%),
              Teknik ({config.bobotTeknik}%), Kekompakan ({config.bobotKekompakan}%), dan Vokal (
              {config.bobotVokal}%). Rentang skor: <strong>10 s/d 100</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderScoreControl(
              'Musikalitas & Aransemen',
              'Harmonisasi, dinamika, kreativitas aransemen, balancing instrumen & tone.',
              config.bobotMusikalitas || 30,
              musikalitas,
              setMusikalitas,
              'input_musikalitas'
            )}
            {renderScoreControl(
              'Teknik & Keterampilan Instrumen',
              'Ketepatan tempo, ketukan/rhythm, fingering, intonasi, skill & penguasaan instrumen.',
              config.bobotTeknik || 30,
              teknik,
              setTeknik,
              'input_teknik'
            )}
            {renderScoreControl(
              'Kekompakan & Stage Performance',
              'Aksi panggung, chemistry antar anggota, kostum, etika, dan komunikasi audiens.',
              config.bobotKekompakan || 20,
              kekompakan,
              setKekompakan,
              'input_kekompakan'
            )}
            {renderScoreControl(
              'Vokal & Artikulasi',
              'Pitch kontrol, intonasi, penghayatan, kejelasan lirik, dan kestabilan nafas.',
              config.bobotVokal || 20,
              vokal,
              setVokal,
              'input_vokal'
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Best Player */}
      {activeTab === 'best_player' && (
        <div className="space-y-4">
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Berikan penilaian untuk masing-masing personel band dalam 5 kategori instrumen:{' '}
              <strong>Gitar, Bass, Drum, Keyboard, dan Vokal</strong>. Skor ini akan dikumulasikan
              secara otomatis dari ketiga juri untuk menentukan Best Player lomba!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderInstrumentControl(
              'Best Guitarist',
              currentBand.personel.gitar,
              scoreGitar,
              setScoreGitar,
              'input_gitar'
            )}
            {renderInstrumentControl(
              'Best Bassist',
              currentBand.personel.bass,
              scoreBass,
              setScoreBass,
              'input_bass'
            )}
            {renderInstrumentControl(
              'Best Drummer',
              currentBand.personel.drum,
              scoreDrum,
              setScoreDrum,
              'input_drum'
            )}
            {renderInstrumentControl(
              'Best Keyboardist',
              currentBand.personel.keyboard,
              scoreKeyboard,
              setScoreKeyboard,
              'input_keyboard'
            )}
            {renderInstrumentControl(
              'Best Vocalist',
              currentBand.personel.vokal,
              scoreVokal,
              setScoreVokal,
              'input_vokal_player'
            )}
          </div>
        </div>
      )}

      {/* Catatan Dewan Juri */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
        <label className="block text-sm font-bold text-slate-800">
          Catatan & Evaluasi Dewan Juri untuk {currentBand.namaBand}:
        </label>
        <textarea
          rows={3}
          value={catatan}
          disabled={isLocked}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Contoh: Aransemen sangat dinamis, namun perhatikan kestabilan tempo pada perpindahan reff..."
          className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
        />
      </div>

      {/* Submit / Lock Actions Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          {isLocked ? (
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <Lock className="w-4 h-4" />
              Nilai telah dikunci dan sah.
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <Unlock className="w-4 h-4" />
              Nilai masih berstatus draf. Kunci nilai untuk verifikasi akhir.
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isLocked ? (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => {
                if (window.confirm('Buka kembali kunci nilai untuk melakukan revisi?')) {
                  handleSave(false);
                }
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Kunci untuk Koreksi</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSave(false)}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Draf</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  if (
                    window.confirm(
                      `Kunci nilai untuk "${currentBand.namaBand}" dengan total skor ${liveTotalScore}? Nilai akan langsung masuk ke rekapitulasi real-time panitia.`
                    )
                  ) {
                    handleSave(true);
                  }
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Kunci & Submit Final</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
