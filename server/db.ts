import fs from 'fs';
import path from 'path';
import { Band, FestivalConfig, ScoreData, User, BandCumulativeResult, BestPlayerResult, RecapSummary } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'festival_data.json');

// Default initial seed data
const DEFAULT_CONFIG: FestivalConfig = {
  festivalName: 'Festival Band Pelajar SMA/SMK se-Derajat',
  edition: 'Grand Final 2026',
  location: 'Auditorium Graha Seni Budaya Pelajar',
  date: '18 September 2026',
  ketuaPanitia: 'Drs. H. Mulyadi, M.Pd.',
  bobotMusikalitas: 30,
  bobotTeknik: 30,
  bobotKekompakan: 20,
  bobotVokal: 20,
  juriNames: {
    juri_1: 'Indra Lesmana, M.Mus.',
    juri_2: 'Tohpati Ario, S.Sn.',
    juri_3: 'Kikan Namara',
  },
  juriTitles: {
    juri_1: 'Komponis & Penata Musik',
    juri_2: 'Gitaris & Produser Musik',
    juri_3: 'Vokalis & Praktisi Panggung',
  },
};

const DEFAULT_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'admin',
    role: 'admin',
    name: 'Administrator Panitia',
    title: 'Ketua Pelaksana Lomba',
  },
  {
    id: 'user_juri_1',
    username: 'juri1',
    role: 'juri_1',
    name: 'Indra Lesmana, M.Mus.',
    title: 'Dewan Juri 1 (Musikalitas & Harmoni)',
  },
  {
    id: 'user_juri_2',
    username: 'juri2',
    role: 'juri_2',
    name: 'Tohpati Ario, S.Sn.',
    title: 'Dewan Juri 2 (Teknik & Skill Instrumen)',
  },
  {
    id: 'user_juri_3',
    username: 'juri3',
    role: 'juri_3',
    name: 'Kikan Namara',
    title: 'Dewan Juri 3 (Performance & Vokal)',
  },
];

const USER_PINS: Record<string, string> = {
  admin: 'admin123',
  juri_1: '1111',
  juri_2: '2222',
  juri_3: '3333',
};

const DEFAULT_BANDS: Band[] = [
  {
    id: 'band-01',
    nomorUrut: 1,
    namaBand: 'The Highschool Grooves',
    asalSekolah: 'SMA Negeri 1 Garuda',
    laguWajib: 'Bendera - Cokelat',
    laguPilihan: 'Rumah Kita - God Bless',
    personel: {
      vokal: 'Rian Ardiansyah',
      gitar: 'Dimas Anggara',
      bass: 'Farhan Ramadhan',
      drum: 'Gilang Pratama',
      keyboard: 'Alifia Nurul',
    },
    status: 'selesai',
  },
  {
    id: 'band-02',
    nomorUrut: 2,
    namaBand: 'Neo Acoustic Vibes',
    asalSekolah: 'SMA Negeri 3 Cendekia',
    laguWajib: 'Kebyar-Kebyar - Gombloh',
    laguPilihan: 'Dan - Sheila on 7',
    personel: {
      vokal: 'Nadya Putri',
      gitar: 'Kevin Sanjaya',
      bass: 'Reza Kurnia',
      drum: 'Bagas Wicaksono',
      keyboard: 'Chelsea Olivia',
    },
    status: 'selesai',
  },
  {
    id: 'band-03',
    nomorUrut: 3,
    namaBand: 'Rock Harmony Society',
    asalSekolah: 'SMK Taruna Nusantara',
    laguWajib: 'Jadilah Legenda - SID',
    laguPilihan: 'Melompat Lebih Tinggi - SO7',
    personel: {
      vokal: 'Fajar Nugroho',
      gitar: 'Aditya Pratama',
      bass: 'Doni Setiawan',
      drum: 'Rizky Febrian',
      keyboard: 'Clarissa Tan',
    },
    status: 'tampil',
  },
  {
    id: 'band-04',
    nomorUrut: 4,
    namaBand: 'Symphony Muda Nusantara',
    asalSekolah: 'SMA Bina Bangsa Mandiri',
    laguWajib: 'Bendera - Cokelat',
    laguPilihan: 'Kemesraan - Iwan Fals',
    personel: {
      vokal: 'Syifa Azzahra',
      gitar: 'Rendy Pandugo',
      bass: 'Haikal Kamil',
      drum: 'Zulfikar Ali',
      keyboard: 'Vanessa Bella',
    },
    status: 'menunggu',
  },
  {
    id: 'band-05',
    nomorUrut: 5,
    namaBand: 'Electric Horizon Band',
    asalSekolah: 'SMA Negeri 5 Prestasi',
    laguWajib: 'Kebyar-Kebyar - Gombloh',
    laguPilihan: 'Beraksi - Kotak',
    personel: {
      vokal: 'Bima Sakti',
      gitar: 'Arya Wiguna',
      bass: 'Denny Sumargo',
      drum: 'Taufik Hidayat',
      keyboard: 'Zahra Amalia',
    },
    status: 'menunggu',
  },
  {
    id: 'band-06',
    nomorUrut: 6,
    namaBand: 'Rhythm of Youth',
    asalSekolah: 'SMK Grafika Kreatif',
    laguWajib: 'Jadilah Legenda - SID',
    laguPilihan: 'Sobat - Padi',
    personel: {
      vokal: 'Daffa Wardhana',
      gitar: 'Rafi Ahmad',
      bass: 'Aldi Taher',
      drum: 'Bimo Putro',
      keyboard: 'Tiara Andini',
    },
    status: 'menunggu',
  },
  {
    id: 'band-07',
    nomorUrut: 7,
    namaBand: 'Midnight Serenade',
    asalSekolah: 'SMA Katolik St. Antonius',
    laguWajib: 'Bendera - Cokelat',
    laguPilihan: 'Panggung Sandiwara - God Bless',
    personel: {
      vokal: 'Gaby Angelia',
      gitar: 'Nathaniel Joe',
      bass: 'Christian Sugiono',
      drum: 'Mario Ginanjar',
      keyboard: 'Audrey Tapiheru',
    },
    status: 'menunggu',
  },
  {
    id: 'band-08',
    nomorUrut: 8,
    namaBand: 'Overdrive Symphony',
    asalSekolah: 'SMA Negeri 8 Metro',
    laguWajib: 'Kebyar-Kebyar - Gombloh',
    laguPilihan: 'Hampa Musik - Gigi',
    personel: {
      vokal: 'Revi Mariska',
      gitar: 'Dicky Chandra',
      bass: 'Eko Patrio',
      drum: 'Sandy Pas Band',
      keyboard: 'Yovie Widianto Jr.',
    },
    status: 'menunggu',
  },
];

const DEFAULT_SCORES: ScoreData[] = [
  // Band 1:
  {
    id: 'sc_b1_j1',
    bandId: 'band-01',
    juriId: 'juri_1',
    musikalitas: 88,
    teknik: 87,
    kekompakan: 89,
    vokal: 86,
    totalBand: 87.5,
    scoreGitar: 89,
    scoreBass: 86,
    scoreDrum: 88,
    scoreKeyboard: 87,
    scoreVokal: 88,
    catatan: 'Aransemen sangat rapi, transisi dinamika lagu wajib sangat dinamis.',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_b1_j2',
    bandId: 'band-01',
    juriId: 'juri_2',
    musikalitas: 86,
    teknik: 88,
    kekompakan: 87,
    vokal: 85,
    totalBand: 86.7,
    scoreGitar: 91,
    scoreBass: 85,
    scoreDrum: 89,
    scoreKeyboard: 86,
    scoreVokal: 87,
    catatan: 'Solo melodi gitar luar biasa bersih dan ekspresif. Tempo drum sangat stabil.',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_b1_j3',
    bandId: 'band-01',
    juriId: 'juri_3',
    musikalitas: 90,
    teknik: 86,
    kekompakan: 92,
    vokal: 88,
    totalBand: 88.8,
    scoreGitar: 88,
    scoreBass: 87,
    scoreDrum: 87,
    scoreKeyboard: 88,
    scoreVokal: 90,
    catatan: 'Penguasaan panggung mengagumkan! Komunikasi dengan penonton hidup.',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  },

  // Band 2:
  {
    id: 'sc_b2_j1',
    bandId: 'band-02',
    juriId: 'juri_1',
    musikalitas: 92,
    teknik: 90,
    kekompakan: 88,
    vokal: 91,
    totalBand: 90.4,
    scoreGitar: 88,
    scoreBass: 90,
    scoreDrum: 86,
    scoreKeyboard: 93,
    scoreVokal: 92,
    catatan: 'Sentuhan keyboard dan harmonisasi akor sangat mewah. Nuansa akustiknya hidup.',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_b2_j2',
    bandId: 'band-02',
    juriId: 'juri_2',
    musikalitas: 90,
    teknik: 92,
    kekompakan: 89,
    vokal: 90,
    totalBand: 90.4,
    scoreGitar: 89,
    scoreBass: 92,
    scoreDrum: 87,
    scoreKeyboard: 94,
    scoreVokal: 91,
    catatan: 'Bassis memiliki groove yang matang. Keyboardist luar biasa dalam voicing.',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_b2_j3',
    bandId: 'band-02',
    juriId: 'juri_3',
    musikalitas: 89,
    teknik: 89,
    kekompakan: 90,
    vokal: 94,
    totalBand: 90.2,
    scoreGitar: 87,
    scoreBass: 89,
    scoreDrum: 88,
    scoreKeyboard: 92,
    scoreVokal: 95,
    catatan: 'Artikulasi vokal jernih, penghayatan lirik sangat menyentuh hati juri.',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  },

  // Band 3 (InProgress: Juri 1 & 2 locked, Juri 3 draft):
  {
    id: 'sc_b3_j1',
    bandId: 'band-03',
    juriId: 'juri_1',
    musikalitas: 84,
    teknik: 85,
    kekompakan: 86,
    vokal: 83,
    totalBand: 84.5,
    scoreGitar: 85,
    scoreBass: 84,
    scoreDrum: 92,
    scoreKeyboard: 82,
    scoreVokal: 84,
    catatan: 'Pukulan drum enerjik dan bertenaga rock sejati.',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_b3_j2',
    bandId: 'band-03',
    juriId: 'juri_2',
    musikalitas: 85,
    teknik: 86,
    kekompakan: 88,
    vokal: 84,
    totalBand: 85.7,
    scoreGitar: 86,
    scoreBass: 85,
    scoreDrum: 94,
    scoreKeyboard: 83,
    scoreVokal: 85,
    catatan: 'Drummer memiliki stamina dan teknik fills yang sangat rapi.',
    isLocked: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sc_b3_j3',
    bandId: 'band-03',
    juriId: 'juri_3',
    musikalitas: 86,
    teknik: 85,
    kekompakan: 87,
    vokal: 85,
    totalBand: 85.7,
    scoreGitar: 85,
    scoreBass: 85,
    scoreDrum: 91,
    scoreKeyboard: 84,
    scoreVokal: 86,
    catatan: 'Aksi panggung rock yang solid dan penuh semangat!',
    isLocked: false,
    updatedAt: new Date().toISOString(),
  },
];

export interface AppDatabase {
  config: FestivalConfig;
  users: User[];
  bands: Band[];
  scores: ScoreData[];
  userPins: Record<string, string>;
}

class DatabaseManager {
  private data: AppDatabase = {
    config: DEFAULT_CONFIG,
    users: DEFAULT_USERS,
    bands: DEFAULT_BANDS,
    scores: DEFAULT_SCORES,
    userPins: USER_PINS,
  };

  private sseClients: any[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.bands && parsed.scores && parsed.config) {
          this.data = {
            ...this.data,
            ...parsed,
            // Ensure pin preservation
            userPins: { ...USER_PINS, ...(parsed.userPins || {}) },
          };
          console.log(`[DB] Loaded ${this.data.bands.length} bands, ${this.data.scores.length} scores from file.`);
          return;
        }
      }
      this.saveToFile();
    } catch (e) {
      console.warn('[DB] Init error, using in-memory state:', e);
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[DB] Failed to save to file:', e);
    }
  }

  // Real-time SSE broadcaster
  public registerClient(res: any) {
    this.sseClients.push(res);
    res.on('close', () => {
      this.sseClients = this.sseClients.filter((c) => c !== res);
    });
  }

  public broadcast(event: string, payload: any) {
    const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(data);
      } catch (err) {
        // silently remove closed socket
      }
    }
  }

  // Auth
  public verifyPin(role: string, pin: string): { success: boolean; user?: User; error?: string } {
    const validPin = this.data.userPins[role];
    if (!validPin || validPin !== pin) {
      return { success: false, error: 'PIN tidak sesuai. Silakan coba lagi.' };
    }
    const user = this.data.users.find((u) => u.role === role);
    return { success: true, user };
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public updateUser(role: string, name: string, title: string, newPin?: string) {
    const user = this.data.users.find((u) => u.role === role);
    if (user) {
      user.name = name;
      user.title = title;
    }
    if (newPin && newPin.trim()) {
      this.data.userPins[role] = newPin.trim();
    }
    this.saveToFile();
    return user;
  }

  // Config
  public getConfig(): FestivalConfig {
    return this.data.config;
  }

  public updateConfig(config: Partial<FestivalConfig>): FestivalConfig {
    this.data.config = { ...this.data.config, ...config };
    this.saveToFile();
    this.broadcast('config_updated', this.data.config);
    return this.data.config;
  }

  // Bands
  public getBands(): Band[] {
    return [...this.data.bands].sort((a, b) => a.nomorUrut - b.nomorUrut);
  }

  public getBandById(id: string): Band | undefined {
    return this.data.bands.find((b) => b.id === id);
  }

  public addBand(band: Omit<Band, 'id'>): Band {
    const id = `band-${Date.now().toString().slice(-6)}`;
    const newBand: Band = { ...band, id };
    this.data.bands.push(newBand);
    this.saveToFile();
    this.broadcast('bands_updated', this.getBands());
    return newBand;
  }

  public updateBand(id: string, updates: Partial<Band>): Band | undefined {
    const index = this.data.bands.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    this.data.bands[index] = { ...this.data.bands[index], ...updates };
    this.saveToFile();
    this.broadcast('bands_updated', this.getBands());
    return this.data.bands[index];
  }

  public deleteBand(id: string): boolean {
    const initialLen = this.data.bands.length;
    this.data.bands = this.data.bands.filter((b) => b.id !== id);
    this.data.scores = this.data.scores.filter((s) => s.bandId !== id);
    if (this.data.bands.length !== initialLen) {
      this.saveToFile();
      this.broadcast('bands_updated', this.getBands());
      this.broadcast('scores_updated', this.calculateRecap());
      return true;
    }
    return false;
  }

  public updateBandStatus(id: string, status: Band['status']): Band | undefined {
    return this.updateBand(id, { status });
  }

  // Scores
  public getScores(): ScoreData[] {
    return this.data.scores;
  }

  public getScore(bandId: string, juriId: 'juri_1' | 'juri_2' | 'juri_3'): ScoreData | undefined {
    return this.data.scores.find((s) => s.bandId === bandId && s.juriId === juriId);
  }

  public calculateTotalBandScore(
    musikalitas: number,
    teknik: number,
    kekompakan: number,
    vokal: number,
    config: FestivalConfig
  ): number {
    const wM = (config.bobotMusikalitas || 30) / 100;
    const wT = (config.bobotTeknik || 30) / 100;
    const wK = (config.bobotKekompakan || 20) / 100;
    const wV = (config.bobotVokal || 20) / 100;
    const total = musikalitas * wM + teknik * wT + kekompakan * wK + vokal * wV;
    return Number(total.toFixed(2));
  }

  public saveScore(scoreInput: {
    bandId: string;
    juriId: 'juri_1' | 'juri_2' | 'juri_3';
    musikalitas: number;
    teknik: number;
    kekompakan: number;
    vokal: number;
    scoreGitar: number;
    scoreBass: number;
    scoreDrum: number;
    scoreKeyboard: number;
    scoreVokal: number;
    catatan: string;
    isLocked: boolean;
  }): ScoreData {
    const totalBand = this.calculateTotalBandScore(
      scoreInput.musikalitas,
      scoreInput.teknik,
      scoreInput.kekompakan,
      scoreInput.vokal,
      this.data.config
    );

    const existingIndex = this.data.scores.findIndex(
      (s) => s.bandId === scoreInput.bandId && s.juriId === scoreInput.juriId
    );

    const now = new Date().toISOString();
    let savedScore: ScoreData;

    if (existingIndex >= 0) {
      savedScore = {
        ...this.data.scores[existingIndex],
        ...scoreInput,
        totalBand,
        updatedAt: now,
      };
      this.data.scores[existingIndex] = savedScore;
    } else {
      savedScore = {
        id: `sc_${scoreInput.bandId}_${scoreInput.juriId}`,
        ...scoreInput,
        totalBand,
        updatedAt: now,
      };
      this.data.scores.push(savedScore);
    }

    // Auto-update band status to 'selesai' if all 3 judges have locked
    const bandScores = this.data.scores.filter((s) => s.bandId === scoreInput.bandId);
    const lockedCount = bandScores.filter((s) => s.isLocked).length;
    if (lockedCount === 3) {
      const band = this.data.bands.find((b) => b.id === scoreInput.bandId);
      if (band && band.status !== 'selesai') {
        band.status = 'selesai';
      }
    } else if (lockedCount > 0) {
      const band = this.data.bands.find((b) => b.id === scoreInput.bandId);
      if (band && band.status === 'menunggu') {
        band.status = 'tampil';
      }
    }

    this.saveToFile();
    const recap = this.calculateRecap();
    this.broadcast('scores_updated', recap);
    return savedScore;
  }

  // Recapitulation & Winner Computation
  public calculateRecap(): RecapSummary {
    const bands = this.getBands();
    const rankings: BandCumulativeResult[] = [];

    for (const band of bands) {
      const s1 = this.data.scores.find((s) => s.bandId === band.id && s.juriId === 'juri_1');
      const s2 = this.data.scores.find((s) => s.bandId === band.id && s.juriId === 'juri_2');
      const s3 = this.data.scores.find((s) => s.bandId === band.id && s.juriId === 'juri_3');

      const juri1Score = s1 ? s1.totalBand : 0;
      const juri2Score = s2 ? s2.totalBand : 0;
      const juri3Score = s3 ? s3.totalBand : 0;

      let completedJudgesCount = 0;
      if (s1?.isLocked) completedJudgesCount++;
      if (s2?.isLocked) completedJudgesCount++;
      if (s3?.isLocked) completedJudgesCount++;

      const scoresEntered = [s1, s2, s3].filter((s) => s !== undefined) as ScoreData[];
      const totalScore = Number((juri1Score + juri2Score + juri3Score).toFixed(2));
      const count = scoresEntered.length || 1;
      const averageScore = Number((totalScore / (completedJudgesCount || count)).toFixed(2));

      rankings.push({
        band,
        scores: { juri_1: s1, juri_2: s2, juri_3: s3 },
        juri1Score,
        juri2Score,
        juri3Score,
        totalScore,
        averageScore,
        completedJudgesCount,
        isAllCompleted: completedJudgesCount === 3,
        rank: 0,
      });
    }

    // Sort rankings:
    // Highest total score first. If tied, sort by completedJudgesCount or band number
    rankings.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.band.nomorUrut - b.band.nomorUrut;
    });

    // Assign rank 1, 2, 3...
    rankings.forEach((r, idx) => {
      r.rank = idx + 1;
    });

    // Winners 1 - 5
    const juaraUtama = {
      juara1: rankings[0],
      juara2: rankings[1],
      juara3: rankings[2],
      juara4: rankings[3],
      juara5: rankings[4],
    };

    // Best Players Ranking
    const calcBest = (
      categoryKey: 'gitar' | 'bass' | 'drum' | 'keyboard' | 'vokal',
      categoryTitle: 'Gitar' | 'Bass' | 'Drum' | 'Keyboard' | 'Vokal'
    ): BestPlayerResult[] => {
      const list: BestPlayerResult[] = [];
      for (const band of bands) {
        const s1 = this.data.scores.find((s) => s.bandId === band.id && s.juriId === 'juri_1');
        const s2 = this.data.scores.find((s) => s.bandId === band.id && s.juriId === 'juri_2');
        const s3 = this.data.scores.find((s) => s.bandId === band.id && s.juriId === 'juri_3');

        const scoreKey = `score${categoryTitle}` as keyof ScoreData;
        const v1 = (s1 ? (s1[scoreKey] as number) : 0) || 0;
        const v2 = (s2 ? (s2[scoreKey] as number) : 0) || 0;
        const v3 = (s3 ? (s3[scoreKey] as number) : 0) || 0;

        const totalScore = Number((v1 + v2 + v3).toFixed(2));
        const activeCount = (v1 > 0 ? 1 : 0) + (v2 > 0 ? 1 : 0) + (v3 > 0 ? 1 : 0);
        const avg = activeCount > 0 ? Number((totalScore / activeCount).toFixed(2)) : 0;

        list.push({
          category: categoryTitle,
          categoryKey,
          playerName: band.personel[categoryKey] || 'Nama belum diisi',
          bandName: band.namaBand,
          asalSekolah: band.asalSekolah,
          bandId: band.id,
          totalScore,
          averageScore: avg,
          breakdown: { juri_1: v1, juri_2: v2, juri_3: v3 },
          rank: 0,
        });
      }

      list.sort((a, b) => b.totalScore - a.totalScore);
      list.forEach((item, i) => {
        item.rank = i + 1;
      });
      return list;
    };

    const bestGitarList = calcBest('gitar', 'Gitar');
    const bestBassList = calcBest('bass', 'Bass');
    const bestDrumList = calcBest('drum', 'Drum');
    const bestKeyboardList = calcBest('keyboard', 'Keyboard');
    const bestVokalList = calcBest('vokal', 'Vokal');

    const completedBandsCount = rankings.filter((r) => r.isAllCompleted).length;

    return {
      rankings,
      juaraUtama,
      bestPlayers: {
        gitar: bestGitarList[0],
        bass: bestBassList[0],
        drum: bestDrumList[0],
        keyboard: bestKeyboardList[0],
        vokal: bestVokalList[0],
      },
      allBestPlayersRanked: {
        gitar: bestGitarList,
        bass: bestBassList,
        drum: bestDrumList,
        keyboard: bestKeyboardList,
        vokal: bestVokalList,
      },
      totalBands: bands.length,
      completedBandsCount,
    };
  }

  // Reset to default seed
  public resetToDefault() {
    this.data = {
      config: { ...DEFAULT_CONFIG },
      users: [...DEFAULT_USERS],
      bands: JSON.parse(JSON.stringify(DEFAULT_BANDS)),
      scores: JSON.parse(JSON.stringify(DEFAULT_SCORES)),
      userPins: { ...USER_PINS },
    };
    this.saveToFile();
    this.broadcast('data_reset', { ok: true });
    this.broadcast('scores_updated', this.calculateRecap());
  }

  // Export SQL dump for MySQL
  public generateSqlDump(): string {
    const cfg = this.data.config;
    let sql = `-- ==========================================================\n`;
    sql += `-- SQL DUMP: FESTIVAL BAND PELAJAR\n`;
    sql += `-- Diekspor otomatis pada: ${new Date().toLocaleString('id-ID')}\n`;
    sql += `-- ==========================================================\n\n`;
    sql += `USE \`festival_band_db\`;\n\n`;

    // Config
    sql += `-- Konfigurasi Festival\n`;
    sql += `DELETE FROM \`festival_config\` WHERE id = 1;\n`;
    sql += `INSERT INTO \`festival_config\` (\`id\`, \`festival_name\`, \`edition\`, \`location\`, \`event_date\`, \`ketua_panitia\`, \`bobot_musikalitas\`, \`bobot_teknik\`, \`bobot_kekompakan\`, \`bobot_vokal\`, \`juri_1_name\`, \`juri_2_name\`, \`juri_3_name\`) VALUES (`;
    sql += `1, '${cfg.festivalName.replace(/'/g, "\\'")}', '${cfg.edition.replace(/'/g, "\\'")}', '${cfg.location.replace(/'/g, "\\'")}', '${cfg.date.replace(/'/g, "\\'")}', '${cfg.ketuaPanitia.replace(/'/g, "\\'")}', `;
    sql += `${cfg.bobotMusikalitas}, ${cfg.bobotTeknik}, ${cfg.bobotKekompakan}, ${cfg.bobotVokal}, '${cfg.juriNames.juri_1.replace(/'/g, "\\'")}', '${cfg.juriNames.juri_2.replace(/'/g, "\\'")}', '${cfg.juriNames.juri_3.replace(/'/g, "\\'")}');\n\n`;

    // Bands & Personel
    sql += `-- Data Peserta Band & Personel\n`;
    for (const b of this.data.bands) {
      sql += `INSERT INTO \`bands\` (\`id\`, \`nomor_urut\`, \`nama_band\`, \`asal_sekolah\`, \`lagu_wajib\`, \`lagu_pilihan\`, \`status\`) VALUES ('${b.id}', ${b.nomorUrut}, '${b.namaBand.replace(/'/g, "\\'")}', '${b.asalSekolah.replace(/'/g, "\\'")}', '${b.laguWajib.replace(/'/g, "\\'")}', '${b.laguPilihan.replace(/'/g, "\\'")}', '${b.status}') ON DUPLICATE KEY UPDATE \`nama_band\` = VALUES(\`nama_band\`);\n`;
      sql += `INSERT INTO \`personel\` (\`band_id\`, \`vokal\`, \`gitar\`, \`bass\`, \`drum\`, \`keyboard\`) VALUES ('${b.id}', '${b.personel.vokal.replace(/'/g, "\\'")}', '${b.personel.gitar.replace(/'/g, "\\'")}', '${b.personel.bass.replace(/'/g, "\\'")}', '${b.personel.drum.replace(/'/g, "\\'")}', '${b.personel.keyboard.replace(/'/g, "\\'")}') ON DUPLICATE KEY UPDATE \`vokal\` = VALUES(\`vokal\`);\n`;
    }
    sql += `\n`;

    // Scores
    sql += `-- Data Penilaian Dewan Juri\n`;
    for (const s of this.data.scores) {
      const cat = (s.catatan || '').replace(/'/g, "\\'");
      sql += `INSERT INTO \`scores\` (\`id\`, \`band_id\`, \`juri_id\`, \`musikalitas\`, \`teknik\`, \`kekompakan\`, \`vokal\`, \`total_band\`, \`score_gitar\`, \`score_bass\`, \`score_drum\`, \`score_keyboard\`, \`score_vokal\`, \`catatan\`, \`is_locked\`) VALUES `;
      sql += `('${s.id}', '${s.bandId}', '${s.juriId}', ${s.musikalitas}, ${s.teknik}, ${s.kekompakan}, ${s.vokal}, ${s.totalBand}, ${s.scoreGitar}, ${s.scoreBass}, ${s.scoreDrum}, ${s.scoreKeyboard}, ${s.scoreVokal}, '${cat}', ${s.isLocked ? 1 : 0}) ON DUPLICATE KEY UPDATE \`total_band\` = VALUES(\`total_band\`);\n`;
    }

    return sql;
  }
}

export const db = new DatabaseManager();
