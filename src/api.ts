import { Band, FestivalConfig, RecapSummary, ScoreData, User } from './types';

const API_BASE = '/api';

export async function loginUser(role: string, pin: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, pin }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login gagal' };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Koneksi ke server gagal' };
  }
}

export async function fetchBands(): Promise<Band[]> {
  const res = await fetch(`${API_BASE}/bands`);
  if (!res.ok) throw new Error('Gagal mengambil data band');
  return res.json();
}

export async function fetchScores(): Promise<ScoreData[]> {
  const res = await fetch(`${API_BASE}/scores`);
  if (!res.ok) throw new Error('Gagal mengambil data nilai');
  return res.json();
}

export async function fetchRecap(): Promise<RecapSummary> {
  const res = await fetch(`${API_BASE}/scores/rekap`);
  if (!res.ok) throw new Error('Gagal mengambil data rekapitulasi');
  return res.json();
}

export async function fetchConfig(): Promise<FestivalConfig> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('Gagal mengambil konfigurasi festival');
  return res.json();
}

export async function updateConfig(config: Partial<FestivalConfig>): Promise<FestivalConfig> {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Gagal memperbarui konfigurasi');
  return res.json();
}

export async function submitScore(scoreInput: {
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
}): Promise<{ success: boolean; score: ScoreData }> {
  const res = await fetch(`${API_BASE}/scores/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scoreInput),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Gagal menyimpan nilai');
  }
  return res.json();
}

export async function saveBand(band: Partial<Band>, isEdit: boolean): Promise<Band> {
  const url = isEdit ? `${API_BASE}/bands/${band.id}` : `${API_BASE}/bands`;
  const method = isEdit ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(band),
  });
  if (!res.ok) throw new Error('Gagal menyimpan data band');
  return res.json();
}

export async function updateBandStatus(id: string, status: Band['status']): Promise<Band> {
  const res = await fetch(`${API_BASE}/bands/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui status band');
  return res.json();
}

export async function deleteBand(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/bands/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus band');
  return true;
}

export async function resetDatabase(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/db/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Gagal mereset database');
  return true;
}

export function exportExcelUrl(): string {
  return `${API_BASE}/export/excel`;
}

export function exportSqlDumpUrl(): string {
  return `${API_BASE}/db/export-sql`;
}

export function viewSchemaSqlUrl(): string {
  return `${API_BASE}/db/schema-sql`;
}

export function downloadXamppVhostUrl(): string {
  return `${API_BASE}/db/xampp-vhost`;
}

export interface ServerInfo {
  port: number;
  localIps: string[];
  primaryUrl: string;
  mysql: {
    configured: boolean;
    host: string;
    port: number;
    user: string;
    database: string;
  };
}

export async function fetchServerInfo(): Promise<ServerInfo> {
  const res = await fetch(`${API_BASE}/server-info`);
  if (!res.ok) throw new Error('Gagal mengambil info server');
  return res.json();
}
