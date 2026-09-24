/**
 * SUPERVISI PEMBELAJARAN MENDALAM - GOOGLE APPS SCRIPT BACKEND
 * Author: Enang Cuhendi
 * Deskripsi: Skrip backend Google Apps Script untuk menyimpan data guru & hasil supervisi
 * langsung ke Google Sheets ("Data_Supervisi_App") di akun Google Drive masing-masing pengguna.
 */

// Nama file Google Sheets yang otomatis dibuat di Drive pengguna
const SPREADSHEET_NAME = 'Data_Supervisi_App';
const SHEET_GURU = 'Data_Guru';
const SHEET_HASIL = 'Hasil_Supervisi';

/**
 * Endpoint utama saat Web App diakses via browser
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Supervisi Pembelajaran Mendalam | By: Enang Cuhendi')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Mengecek apakah file spreadsheet "Data_Supervisi_App" sudah ada di Google Drive pengguna.
 * Jika belum ada, buat baru dan inisialisasi sheet & header kolom secara otomatis.
 */
function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  let ss;

  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    // Membuat file baru langsung di Google Drive milik pengguna yang sedang login
    ss = SpreadsheetApp.create(SPREADSHEET_NAME);
    initSpreadsheetStructure(ss);
  }

  // Pastikan kedua sheet selalu ada (antisipasi jika salah satu terhapus)
  ensureSheetExists(ss, SHEET_GURU, [
    'ID',
    'Nama Guru',
    'NIP/NUPTK',
    'Mata Pelajaran',
    'Kelas/Fase',
    'Dibuat Pada'
  ]);

  ensureSheetExists(ss, SHEET_HASIL, [
    'ID',
    'ID Guru',
    'Nama Guru',
    'Mata Pelajaran',
    'Tanggal Supervisi',
    'Materi/Topik',
    'Kelas/Fase',
    'Tujuan & Fokus Observasi',
    'Bukti Observasi',
    'Refleksi Guru (Berjalan Baik)',
    'Refleksi Guru (Perbaikan)',
    'Kekuatan Pembelajaran',
    'Umpan Balik Kepala Sekolah',
    'Rata-rata Skor',
    'Kategori',
    'Prioritas Pengembangan',
    'Bentuk Tindak Lanjut',
    'Target Waktu',
    'Indikator Keberhasilan',
    'Catatan Tindak Lanjut',
    'Detail Skor Indikator (JSON)',
    'Waktu Simpan'
  ]);

  return ss;
}

/**
 * Menyiapkan struktur sheet dan menghapus sheet default 'Sheet1'
 */
function initSpreadsheetStructure(ss) {
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheets()[0];

  // Buat sheet Data Guru
  const guruSheet = ss.insertSheet(SHEET_GURU);
  formatHeader(guruSheet, [
    'ID',
    'Nama Guru',
    'NIP/NUPTK',
    'Mata Pelajaran',
    'Kelas/Fase',
    'Dibuat Pada'
  ]);

  // Buat sheet Hasil Supervisi
  const hasilSheet = ss.insertSheet(SHEET_HASIL);
  formatHeader(hasilSheet, [
    'ID',
    'ID Guru',
    'Nama Guru',
    'Mata Pelajaran',
    'Tanggal Supervisi',
    'Materi/Topik',
    'Kelas/Fase',
    'Tujuan & Fokus Observasi',
    'Bukti Observasi',
    'Refleksi Guru (Berjalan Baik)',
    'Refleksi Guru (Perbaikan)',
    'Kekuatan Pembelajaran',
    'Umpan Balik Kepala Sekolah',
    'Rata-rata Skor',
    'Kategori',
    'Prioritas Pengembangan',
    'Bentuk Tindak Lanjut',
    'Target Waktu',
    'Indikator Keberhasilan',
    'Catatan Tindak Lanjut',
    'Detail Skor Indikator (JSON)',
    'Waktu Simpan'
  ]);

  // Hapus sheet default jika ada
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // Abaikan jika tidak dapat dihapus
    }
  }
}

/**
 * Memastikan sheet dan baris header tersedia
 */
function ensureSheetExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    formatHeader(sheet, headers);
  } else if (sheet.getLastRow() === 0) {
    formatHeader(sheet, headers);
  }
  return sheet;
}

/**
 * Memberikan format visual profesional pada baris header spreadsheet
 */
function formatHeader(sheet, headers) {
  sheet.appendRow(headers);
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#2563eb');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Mengambil informasi pengguna aktif & link spreadsheet di Google Drive
 */
function getUserInfo() {
  const ss = getOrCreateSpreadsheet();
  let userEmail = '';
  try {
    userEmail = Session.getActiveUser().getEmail() || 'Pengguna Google';
  } catch (e) {
    userEmail = 'Pengguna Google';
  }
  return {
    email: userEmail,
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId(),
    spreadsheetName: ss.getName()
  };
}

/**
 * Mengambil seluruh data awal (Guru + Hasil Supervisi + Info Akun)
 * Digunakan saat pertama kali aplikasi dibuka agar hanya 1 kali request ke server
 */
function getAppData() {
  try {
    const userInfo = getUserInfo();
    const gurus = getGuruList();
    const hasil = getHasilList();
    return {
      success: true,
      userInfo: userInfo,
      gurus: gurus,
      hasil: hasil
    };
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}

/* =========================================================================
 * 1. CRUD DATA GURU
 * ========================================================================= */

/**
 * Membaca semua data guru dari sheet "Data_Guru"
 */
function getGuruList() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_GURU);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  const list = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      list.push({
        id: row[0],
        nama: String(row[1] || ''),
        identitas: String(row[2] || ''),
        mapel: String(row[3] || ''),
        kelas: String(row[4] || ''),
        createdAt: row[5] ? Utilities.formatDate(new Date(row[5]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : ''
      });
    }
  }

  return list;
}

/**
 * Menambahkan data guru baru ke sheet "Data_Guru"
 */
function saveGuru(guruData) {
  try {
    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_GURU);

    const id = guruData.id || Date.now();
    const row = [
      id,
      guruData.nama || '',
      guruData.identitas || '',
      guruData.mapel || '',
      guruData.kelas || '',
      new Date()
    ];

    sheet.appendRow(row);

    return {
      success: true,
      guru: {
        id: id,
        nama: guruData.nama,
        identitas: guruData.identitas,
        mapel: guruData.mapel,
        kelas: guruData.kelas
      }
    };
  } catch (error) {
    throw new Error('Gagal menyimpan data guru: ' + error.message);
  }
}

/**
 * Menghapus data guru berdasarkan ID dari sheet "Data_Guru"
 */
function deleteGuru(id) {
  try {
    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_GURU);
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) return { success: false, message: 'Data kosong' };

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const targetIdStr = String(id);

    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === targetIdStr) {
        sheet.deleteRow(i + 2);
        return { success: true, id: id };
      }
    }

    return { success: false, message: 'ID Guru tidak ditemukan' };
  } catch (error) {
    throw new Error('Gagal menghapus data guru: ' + error.message);
  }
}

/* =========================================================================
 * 2. CRUD HASIL SUPERVISI
 * ========================================================================= */

/**
 * Membaca semua data hasil supervisi dari sheet "Hasil_Supervisi"
 */
function getHasilList() {
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_HASIL);
  const lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return [];
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 22).getValues();
  const list = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      let parsedScores = [];
      try {
        parsedScores = row[20] ? JSON.parse(row[20]) : [];
      } catch (e) {
        parsedScores = [];
      }

      list.push({
        id: row[0],
        guruId: row[1],
        nama: String(row[2] || ''),
        mapel: String(row[3] || ''),
        tanggal: row[4] ? (row[4] instanceof Date ? Utilities.formatDate(row[4], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(row[4])) : '',
        materi: String(row[5] || ''),
        kelas: String(row[6] || ''),
        fokus: String(row[7] || ''),
        bukti: String(row[8] || ''),
        refleksi: String(row[9] || ''),
        perbaikan: String(row[10] || ''),
        kekuatan: String(row[11] || ''),
        feedback: String(row[12] || ''),
        rata: Number(row[13] || 0),
        kategori: String(row[14] || ''),
        prioritas: String(row[15] || ''),
        tl: String(row[16] || ''),
        target: String(row[17] || ''),
        indikator: String(row[18] || ''),
        catatanTL: String(row[19] || ''),
        scores: parsedScores,
        createdAt: row[21] ? Utilities.formatDate(new Date(row[21]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : ''
      });
    }
  }

  return list;
}

/**
 * Menyimpan data hasil supervisi baru ke sheet "Hasil_Supervisi"
 */
function saveHasilSupervisi(hasilData) {
  try {
    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_HASIL);

    const id = hasilData.id || Date.now();
    const scoresJson = JSON.stringify(hasilData.scores || []);
    
    // Tentukan kategori dari skor rata-rata
    const score = Number(hasilData.rata || 0);
    const level = score >= 3.5 ? 'Sangat Baik' : score >= 2.75 ? 'Baik' : score >= 2 ? 'Mulai Berkembang' : 'Perlu Pendampingan';

    const row = [
      id,
      hasilData.guruId || '',
      hasilData.nama || '',
      hasilData.mapel || '',
      hasilData.tanggal || '',
      hasilData.materi || '',
      hasilData.kelas || '',
      hasilData.fokus || '',
      hasilData.bukti || '',
      hasilData.refleksi || '',
      hasilData.perbaikan || '',
      hasilData.kekuatan || '',
      hasilData.feedback || '',
      score,
      level,
      hasilData.prioritas || '',
      hasilData.tl || '',
      hasilData.target || '',
      hasilData.indikator || '',
      hasilData.catatanTL || '',
      scoresJson,
      new Date()
    ];

    sheet.appendRow(row);

    return {
      success: true,
      data: Object.assign({}, hasilData, { id: id, kategori: level })
    };
  } catch (error) {
    throw new Error('Gagal menyimpan hasil supervisi: ' + error.message);
  }
}

/**
 * Menghapus data hasil supervisi berdasarkan ID dari sheet "Hasil_Supervisi"
 */
function deleteHasilSupervisi(id) {
  try {
    const ss = getOrCreateSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_HASIL);
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) return { success: false, message: 'Data kosong' };

    const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    const targetIdStr = String(id);

    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === targetIdStr) {
        sheet.deleteRow(i + 2);
        return { success: true, id: id };
      }
    }

    return { success: false, message: 'ID Hasil Supervisi tidak ditemukan' };
  } catch (error) {
    throw new Error('Gagal menghapus hasil supervisi: ' + error.message);
  }
}
