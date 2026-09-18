import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { generateFestivalExcelWorkbook } from './server/excel';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // API Routes
  // -------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Festival Band Pelajar Penjurian API',
      timestamp: new Date().toISOString(),
    });
  });

  // Server Info & LAN IPs for Judges
  app.get('/api/server-info', (req, res) => {
    const interfaces = os.networkInterfaces();
    const localIps: string[] = [];

    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          localIps.push(net.address);
        }
      }
    }

    const mysqlConfigured = Boolean(process.env.MYSQL_HOST && process.env.MYSQL_DATABASE);

    res.json({
      port: PORT,
      localIps,
      primaryUrl: localIps.length > 0 ? `http://${localIps[0]}:${PORT}` : `http://localhost:${PORT}`,
      mysql: {
        configured: mysqlConfigured,
        host: process.env.MYSQL_HOST || 'localhost',
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER || 'root',
        database: process.env.MYSQL_DATABASE || 'festival_band_db',
      },
    });
  });

  // Real-time Server-Sent Events (SSE)
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial handshake
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to Real-time Judge Stream' })}\n\n`);

    db.registerClient(res);
  });

  // Auth: Login with PIN
  app.post('/api/auth/login', (req, res) => {
    const { role, pin } = req.body;
    if (!role || !pin) {
      return res.status(400).json({ error: 'Role dan PIN wajib diisi' });
    }
    const result = db.verifyPin(role, pin);
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }
    res.json({
      success: true,
      user: result.user,
      token: `token_${role}_${Date.now()}`,
    });
  });

  // Auth: Get Users List
  app.get('/api/auth/users', (req, res) => {
    res.json(db.getUsers());
  });

  // Auth: Update User Profile
  app.put('/api/auth/user', (req, res) => {
    const { role, name, title, newPin } = req.body;
    if (!role || !name) {
      return res.status(400).json({ error: 'Role dan nama harus diisi' });
    }
    const updated = db.updateUser(role, name, title, newPin);
    res.json({ success: true, user: updated });
  });

  // Config: Get Festival Settings
  app.get('/api/config', (req, res) => {
    res.json(db.getConfig());
  });

  // Config: Update Festival Settings
  app.put('/api/config', (req, res) => {
    const updated = db.updateConfig(req.body);
    res.json(updated);
  });

  // Bands: List All
  app.get('/api/bands', (req, res) => {
    res.json(db.getBands());
  });

  // Bands: Add New
  app.post('/api/bands', (req, res) => {
    const { nomorUrut, namaBand, asalSekolah, laguWajib, laguPilihan, personel } = req.body;
    if (!namaBand || !asalSekolah) {
      return res.status(400).json({ error: 'Nama band dan asal sekolah wajib diisi' });
    }
    const band = db.addBand({
      nomorUrut: Number(nomorUrut) || db.getBands().length + 1,
      namaBand,
      asalSekolah,
      laguWajib: laguWajib || '-',
      laguPilihan: laguPilihan || '-',
      personel: personel || { vokal: '', gitar: '', bass: '', drum: '', keyboard: '' },
      status: 'menunggu',
    });
    res.json(band);
  });

  // Bands: Update
  app.put('/api/bands/:id', (req, res) => {
    const updated = db.updateBand(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Peserta band tidak ditemukan' });
    }
    res.json(updated);
  });

  // Bands: Update Status (menunggu, tampil, selesai)
  app.put('/api/bands/:id/status', (req, res) => {
    const { status } = req.body;
    const updated = db.updateBandStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Peserta band tidak ditemukan' });
    }
    res.json(updated);
  });

  // Bands: Delete
  app.delete('/api/bands/:id', (req, res) => {
    const success = db.deleteBand(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Peserta band tidak ditemukan' });
    }
    res.json({ success: true });
  });

  // Scores: List All
  app.get('/api/scores', (req, res) => {
    res.json(db.getScores());
  });

  // Scores: Submit / Save Score
  app.post('/api/scores/submit', (req, res) => {
    const {
      bandId,
      juriId,
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
      isLocked,
    } = req.body;

    if (!bandId || !juriId) {
      return res.status(400).json({ error: 'Data bandId dan juriId wajib diisi' });
    }

    const saved = db.saveScore({
      bandId,
      juriId,
      musikalitas: Math.max(10, Math.min(100, Number(musikalitas) || 0)),
      teknik: Math.max(10, Math.min(100, Number(teknik) || 0)),
      kekompakan: Math.max(10, Math.min(100, Number(kekompakan) || 0)),
      vokal: Math.max(10, Math.min(100, Number(vokal) || 0)),
      scoreGitar: Math.max(10, Math.min(100, Number(scoreGitar) || 0)),
      scoreBass: Math.max(10, Math.min(100, Number(scoreBass) || 0)),
      scoreDrum: Math.max(10, Math.min(100, Number(scoreDrum) || 0)),
      scoreKeyboard: Math.max(10, Math.min(100, Number(scoreKeyboard) || 0)),
      scoreVokal: Math.max(10, Math.min(100, Number(scoreVokal) || 0)),
      catatan: catatan || '',
      isLocked: Boolean(isLocked),
    });

    res.json({ success: true, score: saved });
  });

  // Scores: Recapitulation, Juara 1-5, and Best Players
  app.get('/api/scores/rekap', (req, res) => {
    const recap = db.calculateRecap();
    res.json(recap);
  });

  // Export: Excel (.xlsx) Download
  app.get('/api/export/excel', (req, res) => {
    try {
      const buffer = generateFestivalExcelWorkbook();
      const config = db.getConfig();
      const safeName = config.festivalName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Rekapitulasi_${safeName}_${Date.now()}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err: any) {
      console.error('Error exporting Excel:', err);
      res.status(500).json({ error: 'Gagal membuat file Excel: ' + err.message });
    }
  });

  // Export: MySQL SQL Dump Download
  app.get('/api/db/export-sql', (req, res) => {
    try {
      const sql = db.generateSqlDump();
      const filename = `festival_band_dump_${Date.now()}.sql`;
      res.setHeader('Content-Type', 'application/sql');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(sql);
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal membuat SQL dump' });
    }
  });

  // Database: View Schema SQL
  app.get('/api/db/schema-sql', (req, res) => {
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      res.sendFile(schemaPath);
    } else {
      res.status(404).send('-- Schema file not found');
    }
  });

  // XAMPP: Download Virtual Host Config (Port 80 -> Port 3000)
  app.get('/api/db/xampp-vhost', (req, res) => {
    const vhostPath = path.join(process.cwd(), 'xampp_vhost.conf');
    if (fs.existsSync(vhostPath)) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="xampp_vhost.conf"');
      res.sendFile(vhostPath);
    } else {
      res.status(404).send('# Virtual host config not found');
    }
  });

  // Database: Reset to default demo data
  app.post('/api/db/reset', (req, res) => {
    db.resetToDefault();
    res.json({ success: true, message: 'Data berhasil di-reset ke data bawaan festival.' });
  });

  // -------------------------------------------------------------
  // Vite Integration (Dev) / Static Asset Serving (Prod)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Festival Band App] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
