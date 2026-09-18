export type UserRole = 'admin' | 'juri_1' | 'juri_2' | 'juri_3';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  title: string;
}

export interface BandPersonel {
  vokal: string;
  gitar: string;
  bass: string;
  drum: string;
  keyboard: string;
}

export type BandStatus = 'menunggu' | 'tampil' | 'selesai';

export interface Band {
  id: string;
  nomorUrut: number;
  namaBand: string;
  asalSekolah: string;
  laguWajib: string;
  laguPilihan: string;
  personel: BandPersonel;
  status: BandStatus;
  fotoUrl?: string;
}

export interface ScoreData {
  id: string;
  bandId: string;
  juriId: 'juri_1' | 'juri_2' | 'juri_3';
  musikalitas: number; // 10 - 100
  teknik: number; // 10 - 100
  kekompakan: number; // 10 - 100
  vokal: number; // 10 - 100
  totalBand: number; // calculated based on weights or sum
  scoreGitar: number; // 10 - 100
  scoreBass: number; // 10 - 100
  scoreDrum: number; // 10 - 100
  scoreKeyboard: number; // 10 - 100
  scoreVokal: number; // 10 - 100
  catatan: string;
  isLocked: boolean;
  updatedAt: string;
}

export interface FestivalConfig {
  festivalName: string;
  edition: string;
  location: string;
  date: string;
  ketuaPanitia: string;
  bobotMusikalitas: number; // e.g. 30
  bobotTeknik: number; // e.g. 30
  bobotKekompakan: number; // e.g. 20
  bobotVokal: number; // e.g. 20
  juriNames: {
    juri_1: string;
    juri_2: string;
    juri_3: string;
  };
  juriTitles: {
    juri_1: string;
    juri_2: string;
    juri_3: string;
  };
}

export interface BandCumulativeResult {
  band: Band;
  scores: {
    juri_1?: ScoreData;
    juri_2?: ScoreData;
    juri_3?: ScoreData;
  };
  juri1Score: number;
  juri2Score: number;
  juri3Score: number;
  totalScore: number; // sum of juri1 + juri2 + juri3
  averageScore: number;
  completedJudgesCount: number; // 0 to 3
  isAllCompleted: boolean;
  rank: number;
}

export interface BestPlayerResult {
  category: 'Gitar' | 'Bass' | 'Drum' | 'Keyboard' | 'Vokal';
  categoryKey: 'gitar' | 'bass' | 'drum' | 'keyboard' | 'vokal';
  playerName: string;
  bandName: string;
  asalSekolah: string;
  bandId: string;
  totalScore: number;
  averageScore: number;
  breakdown: {
    juri_1: number;
    juri_2: number;
    juri_3: number;
  };
  rank: number;
}

export interface RecapSummary {
  rankings: BandCumulativeResult[];
  juaraUtama: {
    juara1?: BandCumulativeResult;
    juara2?: BandCumulativeResult;
    juara3?: BandCumulativeResult;
    juara4?: BandCumulativeResult;
    juara5?: BandCumulativeResult;
  };
  bestPlayers: {
    gitar?: BestPlayerResult;
    bass?: BestPlayerResult;
    drum?: BestPlayerResult;
    keyboard?: BestPlayerResult;
    vokal?: BestPlayerResult;
  };
  allBestPlayersRanked: {
    gitar: BestPlayerResult[];
    bass: BestPlayerResult[];
    drum: BestPlayerResult[];
    keyboard: BestPlayerResult[];
    vokal: BestPlayerResult[];
  };
  totalBands: number;
  completedBandsCount: number;
}
