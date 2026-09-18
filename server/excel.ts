import * as XLSX from 'xlsx';
import { db } from './db';

export function generateFestivalExcelWorkbook(): Buffer {
  const recap = db.calculateRecap();
  const config = db.getConfig();
  const bands = db.getBands();
  const scores = db.getScores();

  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // Sheet 1: JUARA_DAN_BEST_PLAYER
  // -------------------------------------------------------------
  const sheet1Data: (string | number)[][] = [
    ['HASIL AKHIR & REKAPITULASI JUARA'],
    [config.festivalName.toUpperCase()],
    [`Edisi: ${config.edition} | Tanggal: ${config.date} | Tempat: ${config.location}`],
    [],
    ['=== JUARA FESTIVAL BAND (PERINGKAT 1 - 5 BERDASARKAN SKOR TERTINGGI) ==='],
    ['Peringkat', 'Predikat Juara', 'No. Undian', 'Nama Band', 'Asal Sekolah', 'Lagu Wajib', 'Lagu Pilihan', 'Total Skor Kumulatif', 'Rata-Rata'],
  ];

  const winnersLabels = [
    'JUARA I (Pertama)',
    'JUARA II (Kedua)',
    'JUARA III (Ketiga)',
    'JUARA IV (Harapan I)',
    'JUARA V (Harapan II)',
  ];

  for (let i = 0; i < 5; i++) {
    const item = recap.rankings[i];
    if (item) {
      sheet1Data.push([
        i + 1,
        winnersLabels[i],
        item.band.nomorUrut,
        item.band.namaBand,
        item.band.asalSekolah,
        item.band.laguWajib,
        item.band.laguPilihan,
        item.totalScore,
        item.averageScore,
      ]);
    } else {
      sheet1Data.push([i + 1, winnersLabels[i], '-', '-', '-', '-', '-', 0, 0]);
    }
  }

  sheet1Data.push([]);
  sheet1Data.push(['=== JUARA KATEGORI BEST PLAYER INSTRUMEN & VOKAL ===']);
  sheet1Data.push(['Kategori Best Player', 'Nama Musisi / Siswa', 'Nama Band', 'Asal Sekolah', 'Skor Juri 1', 'Skor Juri 2', 'Skor Juri 3', 'Total Skor']);

  const bpCategories: Array<{ title: string; res?: any }> = [
    { title: 'Best Guitarist (Gitar)', res: recap.bestPlayers.gitar },
    { title: 'Best Bassist (Bass)', res: recap.bestPlayers.bass },
    { title: 'Best Drummer (Drum)', res: recap.bestPlayers.drum },
    { title: 'Best Keyboardist (Keyboard)', res: recap.bestPlayers.keyboard },
    { title: 'Best Vocalist (Vokal)', res: recap.bestPlayers.vokal },
  ];

  for (const cat of bpCategories) {
    if (cat.res) {
      sheet1Data.push([
        cat.title,
        cat.res.playerName,
        cat.res.bandName,
        cat.res.asalSekolah,
        cat.res.breakdown.juri_1,
        cat.res.breakdown.juri_2,
        cat.res.breakdown.juri_3,
        cat.res.totalScore,
      ]);
    }
  }

  sheet1Data.push([]);
  sheet1Data.push(['DEWAN JURI:']);
  sheet1Data.push([`1. ${config.juriNames.juri_1} (${config.juriTitles.juri_1})`]);
  sheet1Data.push([`2. ${config.juriNames.juri_2} (${config.juriTitles.juri_2})`]);
  sheet1Data.push([`3. ${config.juriNames.juri_3} (${config.juriTitles.juri_3})`]);
  sheet1Data.push([`Ketua Panitia Pelaksana: ${config.ketuaPanitia}`]);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  ws1['!cols'] = [
    { wch: 12 },
    { wch: 24 },
    { wch: 12 },
    { wch: 28 },
    { wch: 30 },
    { wch: 26 },
    { wch: 26 },
    { wch: 20 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'JUARA & BEST PLAYER');

  // -------------------------------------------------------------
  // Sheet 2: REKAPITULASI_KUMULATIF
  // -------------------------------------------------------------
  const sheet2Data: (string | number)[][] = [
    ['REKAPITULASI NILAI KUMULATIF SELURUH PESERTA BAND'],
    [config.festivalName],
    [],
    [
      'Ranking',
      'No. Undian',
      'Nama Band',
      'Asal Sekolah',
      `Juri 1: ${config.juriNames.juri_1}`,
      `Juri 2: ${config.juriNames.juri_2}`,
      `Juri 3: ${config.juriNames.juri_3}`,
      'Total Kumulatif',
      'Rata-Rata',
      'Kelengkapan Penjurian',
    ],
  ];

  for (const r of recap.rankings) {
    sheet2Data.push([
      r.rank,
      r.band.nomorUrut,
      r.band.namaBand,
      r.band.asalSekolah,
      r.juri1Score > 0 ? r.juri1Score : '-',
      r.juri2Score > 0 ? r.juri2Score : '-',
      r.juri3Score > 0 ? r.juri3Score : '-',
      r.totalScore,
      r.averageScore,
      r.isAllCompleted ? 'Lengkap (3 Juri)' : `${r.completedJudgesCount} dari 3 Juri`,
    ]);
  }

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  ws2['!cols'] = [
    { wch: 10 },
    { wch: 12 },
    { wch: 28 },
    { wch: 30 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 15 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'REKAPITULASI LENGKAP');

  // -------------------------------------------------------------
  // Sheet 3: RINCIAN_NILAI_KRITERIA
  // -------------------------------------------------------------
  const sheet3Data: (string | number)[][] = [
    ['RINCIAN PENILAIAN PER KRITERIA & CATATAN DEWAN JURI'],
    [`Bobot Penilaian: Musikalitas (${config.bobotMusikalitas}%), Teknik (${config.bobotTeknik}%), Kekompakan (${config.bobotKekompakan}%), Vokal (${config.bobotVokal}%)`],
    [],
    [
      'No. Undian',
      'Nama Band',
      'Asal Sekolah',
      'Dewan Juri',
      'Musikalitas',
      'Teknik',
      'Kekompakan',
      'Vokal',
      'Total Terbobot',
      'Status Kunci',
      'Catatan & Evaluasi Juri',
    ],
  ];

  for (const band of bands) {
    for (const juriKey of ['juri_1', 'juri_2', 'juri_3'] as const) {
      const s = scores.find((sc) => sc.bandId === band.id && sc.juriId === juriKey);
      const juriName = config.juriNames[juriKey];
      sheet3Data.push([
        band.nomorUrut,
        band.namaBand,
        band.asalSekolah,
        `${juriKey.toUpperCase()} - ${juriName}`,
        s ? s.musikalitas : '-',
        s ? s.teknik : '-',
        s ? s.kekompakan : '-',
        s ? s.vokal : '-',
        s ? s.totalBand : '-',
        s ? (s.isLocked ? 'Terkunci (Final)' : 'Draft') : 'Belum Menilai',
        s ? s.catatan || '-' : '-',
      ]);
    }
  }

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  ws3['!cols'] = [
    { wch: 12 },
    { wch: 26 },
    { wch: 28 },
    { wch: 28 },
    { wch: 14 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 45 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'RINCIAN KRITERIA & CATATAN');

  // -------------------------------------------------------------
  // Sheet 4: PERINGKAT_BEST_PLAYERS_DETAIL
  // -------------------------------------------------------------
  const sheet4Data: (string | number)[][] = [
    ['PERINGKAT LENGKAP PENILAIAN BEST PLAYER SEMUA INSTRUMEN'],
    [],
  ];

  const categories = [
    { key: 'gitar' as const, name: 'GITARIS (BEST GUITARIST)' },
    { key: 'bass' as const, name: 'BASSIST (BEST BASSIST)' },
    { key: 'drum' as const, name: 'DRUMMER (BEST DRUMMER)' },
    { key: 'keyboard' as const, name: 'KEYBOARDIST (BEST KEYBOARDIST)' },
    { key: 'vokal' as const, name: 'VOKALIS (BEST VOCALIST)' },
  ];

  for (const cat of categories) {
    sheet4Data.push([`=== ${cat.name} ===`]);
    sheet4Data.push(['Rank', 'Nama Pemain', 'Band', 'Asal Sekolah', 'Juri 1', 'Juri 2', 'Juri 3', 'Total Nilai', 'Rata-Rata']);
    const list = recap.allBestPlayersRanked[cat.key];
    for (const p of list) {
      sheet4Data.push([
        p.rank,
        p.playerName,
        p.bandName,
        p.asalSekolah,
        p.breakdown.juri_1,
        p.breakdown.juri_2,
        p.breakdown.juri_3,
        p.totalScore,
        p.averageScore,
      ]);
    }
    sheet4Data.push([]);
  }

  const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
  ws4['!cols'] = [
    { wch: 8 },
    { wch: 24 },
    { wch: 26 },
    { wch: 28 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws4, 'DETAIL BEST PLAYERS');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  return excelBuffer;
}
