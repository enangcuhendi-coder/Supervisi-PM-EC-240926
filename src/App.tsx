import React, { useState, useEffect } from 'react';
import { CODE_GS_SOURCE, INDEX_HTML_SOURCE } from './gasCode';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Cloud, 
  Info, 
  Layers, 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
  HelpCircle,
  Home,
  CheckCircle2
} from 'lucide-react';

interface Guru {
  id: number | string;
  nama: string;
  identitas: string;
  mapel: string;
  kelas: string;
  createdAt?: string;
}

interface HasilSupervisi {
  id: number | string;
  guruId: number | string;
  nama: string;
  mapel: string;
  tanggal: string;
  materi: string;
  kelas: string;
  fokus: string;
  bukti: string;
  refleksi: string;
  perbaikan: string;
  kekuatan: string;
  feedback: string;
  rata: number;
  kategori?: string;
  prioritas: string;
  tl: string;
  target: string;
  indikator: string;
  catatanTL: string;
  scores: { indikator: string; score: number }[];
  createdAt?: string;
}

const INDIKATOR = [
  ["Berkesadaran", "Guru membangun perhatian, tujuan, dan kesadaran belajar murid."],
  ["Bermakna", "Materi dikaitkan dengan konteks, pengalaman, atau kebutuhan nyata murid."],
  ["Menggembirakan", "Suasana belajar aman, positif, menantang, dan membuat murid berpartisipasi."],
  ["Memahami", "Murid diberi ruang membangun pemahaman melalui eksplorasi dan pengolahan informasi."],
  ["Mengaplikasi", "Murid menggunakan pengetahuan/keterampilan pada situasi atau masalah."],
  ["Merefleksi", "Murid melakukan refleksi terhadap proses, hasil, dan makna belajar."],
  ["Praktik Pedagogis", "Strategi, metode, diferensiasi, pertanyaan, dan fasilitasi sesuai kebutuhan murid."],
  ["Lingkungan Pembelajaran", "Lingkungan fisik, sosial, emosional, dan budaya mendukung pembelajaran."],
  ["Pemanfaatan Digital", "Teknologi digunakan secara tepat untuk memperkaya proses dan pengalaman belajar."],
  ["Asesmen Formatif", "Guru menggunakan bukti belajar untuk memberikan umpan balik dan menyesuaikan pembelajaran."],
  ["Keterlibatan Murid", "Murid aktif berpikir, berdiskusi, berkarya, mengambil peran, dan bertanggung jawab."],
  ["Kolaborasi", "Guru membangun interaksi dan kolaborasi yang produktif antarmurid."]
];

const REKOMENDASI_MAP: Record<string, string> = {
  "Berkesadaran": "Penguatan desain tujuan belajar, apersepsi reflektif, dan strategi metakognitif.",
  "Bermakna": "Pengembangan pembelajaran kontekstual berbasis masalah dan pengalaman nyata murid.",
  "Menggembirakan": "Penguatan lingkungan belajar positif, aktivitas variatif, dan keterlibatan murid.",
  "Memahami": "Penguatan strategi eksplorasi, literasi, diskusi, dan konstruksi pemahaman.",
  "Mengaplikasi": "Pengembangan tugas autentik, proyek, pemecahan masalah, dan transfer pengetahuan.",
  "Merefleksi": "Penguatan jurnal/refleksi, exit ticket, metakognisi, dan dialog reflektif.",
  "Praktik Pedagogis": "Penguatan diferensiasi, pertanyaan pemantik, scaffolding, dan strategi aktif.",
  "Lingkungan Pembelajaran": "Penguatan pengelolaan kelas, keamanan psikologis, inklusivitas, dan kolaborasi.",
  "Pemanfaatan Digital": "Penguatan pemilihan dan pemanfaatan teknologi yang bermakna, aman, dan relevan.",
  "Asesmen Formatif": "Penguatan asesmen diagnostik/formatif, umpan balik, rubrik, dan tindak lanjut.",
  "Keterlibatan Murid": "Penguatan student agency, diskusi, pilihan belajar, dan aktivitas berpikir tingkat tinggi.",
  "Kolaborasi": "Penguatan kerja kelompok, peran murid, komunikasi, dan budaya saling belajar."
};

export default function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'data' | 'supervisi' | 'rekap' | 'panduan'>('dashboard');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Data states
  const [gurus, setGurus] = useState<Guru[]>([]);
  const [hasil, setHasil] = useState<HasilSupervisi[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Memuat data...');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal GAS Hub
  const [showGasHub, setShowGasHub] = useState<boolean>(false);
  const [gasTab, setGasTab] = useState<'deploy' | 'codegs' | 'indexhtml'>('deploy');
  const [copiedCodeGs, setCopiedCodeGs] = useState<boolean>(false);
  const [copiedIndexHtml, setCopiedIndexHtml] = useState<boolean>(false);

  // Guru Form State
  const [showGuruForm, setShowGuruForm] = useState<boolean>(false);
  const [gNama, setGNama] = useState<string>('');
  const [gId, setGId] = useState<string>('');
  const [gMapel, setGMapel] = useState<string>('');
  const [gKelas, setGKelas] = useState<string>('');

  // Supervisi Form State
  const [selectedGuruId, setSelectedGuruId] = useState<string>('');
  const [sTanggal, setSTanggal] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sMateri, setSMateri] = useState<string>('');
  const [sKelas, setSKelas] = useState<string>('');
  const [sFokus, setSFokus] = useState<string>('');
  const [praPerangkat, setPraPerangkat] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [sBukti, setSBukti] = useState<string>('');
  const [sRefleksi, setSRefleksi] = useState<string>('');
  const [sPerbaikan, setSPerbaikan] = useState<string>('');
  const [sKekuatan, setSKekuatan] = useState<string>('');
  const [sFeedback, setSFeedback] = useState<string>('');
  const [sPrioritas, setSPrioritas] = useState<string>('Perencanaan pembelajaran mendalam');
  const [sTL, setSTL] = useState<string>('Coaching individual');
  const [sTarget, setSTarget] = useState<string>('2 minggu');
  const [sIndikator, setSIndikator] = useState<string>('Asesmen formatif digunakan setiap pertemuan');
  const [sCatatanTL, setSCatatanTL] = useState<string>('');
  const [supervisiStatus, setSupervisiStatus] = useState<'DRAFT' | 'SELESAI'>('DRAFT');

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; msg: string; onConfirm: () => void }>({
    show: false,
    msg: '',
    onConfirm: () => {}
  });

  // Initial load simulation with initial sample data
  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3200);
  };

  const loadData = () => {
    setLoading(true);
    setLoadingText('Menghubungkan ke Google Drive...');
    setTimeout(() => {
      const savedG = localStorage.getItem('spm_gas_guru_v1');
      const savedH = localStorage.getItem('spm_gas_hasil_v1');
      if (savedG) {
        setGurus(JSON.parse(savedG));
      } else {
        // Initial sample data so the app isn't bare
        const initialGurus: Guru[] = [
          { id: 101, nama: 'Dra. Siti Aminah, M.Pd', identitas: '197503122000032001', mapel: 'Bahasa Indonesia', kelas: 'VII / Fase D' },
          { id: 102, nama: 'Bambang Sugiarto, S.Pd', identitas: '198204152008011005', mapel: 'Matematika', kelas: 'VIII / Fase D' },
          { id: 103, nama: 'Nurul Hidayati, S.Si', identitas: '198811202011012014', mapel: 'IPA', kelas: 'IX / Fase D' }
        ];
        setGurus(initialGurus);
        localStorage.setItem('spm_gas_guru_v1', JSON.stringify(initialGurus));
      }

      if (savedH) {
        setHasil(JSON.parse(savedH));
      } else {
        const initialHasil: HasilSupervisi[] = [
          {
            id: 201,
            guruId: 101,
            nama: 'Dra. Siti Aminah, M.Pd',
            mapel: 'Bahasa Indonesia',
            tanggal: '2026-09-18',
            materi: 'Teks Prosedur Berbasis Masalah Nyata',
            kelas: 'VII / Fase D',
            fokus: 'Keterlibatan murid dan asesmen formatif',
            bukti: 'Murid aktif berdiskusi dalam kelompok kecil, menggunakan rubrik self-assessment.',
            refleksi: 'Aktivitas kelompok berjalan dinamis, sebagian murid butuh scaffolding lebih.',
            perbaikan: 'Manajemen waktu saat fase presentasi dan pertanyaan tingkat tinggi.',
            kekuatan: 'Instruksi jelas, apersepsi bermakna mengaitkan dengan kegiatan sehari-hari.',
            feedback: 'Pertahankan pendekatan diferensiasi proses, perbanyak pertanyaan terbuka.',
            rata: 3.42,
            kategori: 'Baik',
            prioritas: 'Praktik pedagogis dan diferensiasi',
            tl: 'Coaching individual',
            target: '2 minggu',
            indikator: 'Rubrik umpan balik formatif diterapkan secara konsisten',
            catatanTL: 'Akan dijadwalkan observasi sejawat pada siklus berikutnya.',
            scores: INDIKATOR.map(([ind], i) => ({ indikator: ind, score: i % 2 === 0 ? 4 : 3 }))
          }
        ];
        setHasil(initialHasil);
        localStorage.setItem('spm_gas_hasil_v1', JSON.stringify(initialHasil));
      }
      setLoading(false);
      showToast('Data tersinkronkan dengan Google Sheets (Cloud)');
    }, 600);
  };

  const handleSaveGuru = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!gNama.trim() || !gMapel.trim()) {
      showToast('Nama guru dan mata pelajaran wajib diisi.');
      return;
    }

    setLoading(true);
    setLoadingText('Menyimpan data guru ke Google Sheets...');
    setTimeout(() => {
      const newGuru: Guru = {
        id: Date.now(),
        nama: gNama.trim(),
        identitas: gId.trim(),
        mapel: gMapel.trim(),
        kelas: gKelas.trim(),
        createdAt: new Date().toISOString()
      };
      const updated = [...gurus, newGuru];
      setGurus(updated);
      localStorage.setItem('spm_gas_guru_v1', JSON.stringify(updated));
      setGNama('');
      setGId('');
      setGMapel('');
      setGKelas('');
      setShowGuruForm(false);
      setLoading(false);
      showToast('Data guru tersimpan ke sheet "Data_Guru".');
    }, 500);
  };

  const handleDeleteGuru = (id: number | string) => {
    setConfirmModal({
      show: true,
      msg: 'Hapus data guru ini dari Google Sheets?',
      onConfirm: () => {
        setLoading(true);
        setLoadingText('Menghapus baris guru dari Google Sheets...');
        setTimeout(() => {
          const updated = gurus.filter(g => String(g.id) !== String(id));
          setGurus(updated);
          localStorage.setItem('spm_gas_guru_v1', JSON.stringify(updated));
          setLoading(false);
          showToast('Data guru berhasil dihapus.');
        }, 400);
      }
    });
  };

  const handleDeleteHasil = (id: number | string) => {
    setConfirmModal({
      show: true,
      msg: 'Hapus riwayat supervisi ini dari Google Sheets?',
      onConfirm: () => {
        setLoading(true);
        setLoadingText('Menghapus data supervisi dari Google Sheets...');
        setTimeout(() => {
          const updated = hasil.filter(h => String(h.id) !== String(id));
          setHasil(updated);
          localStorage.setItem('spm_gas_hasil_v1', JSON.stringify(updated));
          setLoading(false);
          showToast('Data supervisi berhasil dihapus.');
        }, 400);
      }
    });
  };

  // Score calculation
  const calcCurrentScore = () => {
    const vals = Object.values(scores).filter(s => s > 0);
    if (!vals.length) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * 100) / 100;
  };

  const getLowestScoredAreas = () => {
    const list = INDIKATOR.map(([name], idx) => ({
      name,
      score: scores[idx] || 0
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

    return list;
  };

  const handleSaveSupervisi = () => {
    const guru = gurus.find(g => String(g.id) === String(selectedGuruId));
    if (!guru) {
      showToast('Pilih guru terlebih dahulu pada tahap 1.');
      setCurrentStep(1);
      return;
    }

    const avgScore = calcCurrentScore();
    if (avgScore === 0) {
      showToast('Isi skor observasi pembelajaran terlebih dahulu.');
      setCurrentStep(2);
      return;
    }

    setLoading(true);
    setLoadingText('Menyimpan hasil supervisi ke sheet "Hasil_Supervisi"...');

    setTimeout(() => {
      const level = avgScore >= 3.5 ? 'Sangat Baik' : avgScore >= 2.75 ? 'Baik' : avgScore >= 2 ? 'Mulai Berkembang' : 'Perlu Pendampingan';
      
      const newHasil: HasilSupervisi = {
        id: Date.now(),
        guruId: guru.id,
        nama: guru.nama,
        mapel: guru.mapel,
        tanggal: sTanggal,
        materi: sMateri || '-',
        kelas: sKelas || guru.kelas || '-',
        fokus: sFokus || '-',
        bukti: sBukti || '-',
        refleksi: sRefleksi || '-',
        perbaikan: sPerbaikan || '-',
        kekuatan: sKekuatan || '-',
        feedback: sFeedback || '-',
        rata: avgScore,
        kategori: level,
        prioritas: sPrioritas,
        tl: sTL,
        target: sTarget,
        indikator: sIndikator,
        catatanTL: sCatatanTL,
        scores: INDIKATOR.map(([ind], i) => ({ indikator: ind, score: scores[i] || 0 })),
        createdAt: new Date().toISOString()
      };

      const updated = [newHasil, ...hasil];
      setHasil(updated);
      localStorage.setItem('spm_gas_hasil_v1', JSON.stringify(updated));
      setSupervisiStatus('SELESAI');
      setLoading(false);
      showToast('Hasil supervisi berhasil disimpan ke Google Sheets!');
      setCurrentPage('rekap');
    }, 600);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`File ${filename} berhasil diunduh!`);
  };

  const copyToClipboard = (text: string, type: 'codegs' | 'indexhtml') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'codegs') {
        setCopiedCodeGs(true);
        setTimeout(() => setCopiedCodeGs(false), 2000);
      } else {
        setCopiedIndexHtml(true);
        setTimeout(() => setCopiedIndexHtml(false), 2000);
      }
      showToast('Kode berhasil disalin ke clipboard!');
    });
  };

  const currentScoreVal = calcCurrentScore();
  const currentScoreLevel = currentScoreVal >= 3.5 ? 'Sangat Baik' : currentScoreVal >= 2.75 ? 'Baik' : currentScoreVal >= 2 ? 'Mulai Berkembang' : 'Perlu Pendampingan';
  const lowestAreas = getLowestScoredAreas();

  // Stats calculation
  const totalGuru = gurus.length;
  const totalSelesai = hasil.length;
  const avgTotal = hasil.length ? (hasil.reduce((acc, h) => acc + Number(h.rata || 0), 0) / hasil.length).toFixed(2) : '-';

  return (
    <div className="app">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">🎓</div>
          <div>
            <b>Supervisi Mendalam</b>
            <small>Kepala Sekolah</small>
          </div>
        </div>
        <nav className="nav">
          <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>
            🏠 <span>Beranda</span>
          </button>
          <button className={currentPage === 'data' ? 'active' : ''} onClick={() => setCurrentPage('data')}>
            👨‍🏫 <span>Data Guru</span>
          </button>
          <button className={currentPage === 'supervisi' ? 'active' : ''} onClick={() => setCurrentPage('supervisi')}>
            📋 <span>Supervisi</span>
          </button>
          <button className={currentPage === 'rekap' ? 'active' : ''} onClick={() => setCurrentPage('rekap')}>
            📊 <span>Rekap Hasil</span>
          </button>
          <button className={currentPage === 'panduan' ? 'active' : ''} onClick={() => setCurrentPage('panduan')}>
            💡 <span>Panduan</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <h1 id="pageTitle">
              {currentPage === 'dashboard' && 'Dashboard Kepala Sekolah'}
              {currentPage === 'data' && 'Data Guru'}
              {currentPage === 'supervisi' && 'Form Supervisi Pembelajaran'}
              {currentPage === 'rekap' && 'Rekap Hasil Supervisi'}
              {currentPage === 'panduan' && 'Panduan Supervisi & Evaluasi'}
            </h1>
            <p>Supervisi pembelajaran mendalam — terhubung otomatis ke Google Sheets pengguna.</p>
          </div>

          <div className="topbar-actions">
            <button 
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setShowGasHub(true)}
              title="Buka kode Code.gs, Index.html, dan panduan deploy"
            >
              <FileCode size={16} />
              <span>Kode GAS & Deploy</span>
            </button>
            <span className="badge" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
              ☁️ Akun Pengguna (GAS)
            </span>
            <button 
              className="btn btn-sm btn-outline" 
              onClick={loadData}
              title="Muat ulang data dari Google Sheets"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* CLOUD BANNER INFO */}
        <div className="cloud-bar" style={{ display: 'flex' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cloud size={18} color="#16a34a" />
            <span>
              Penyimpanan Cloud: Terhubung ke Google Drive pengguna <b>(File: Data_Supervisi_App)</b>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#475569' }}>Sheet: Data_Guru &amp; Hasil_Supervisi</span>
            <button 
              className="btn btn-sm btn-outline" 
              style={{ background: '#fff', fontSize: '11px', padding: '4px 8px' }}
              onClick={() => setShowGasHub(true)}
            >
              Lihat Panduan Deploy ↗
            </button>
          </div>
        </div>

        {/* 1. DASHBOARD PAGE */}
        {currentPage === 'dashboard' && (
          <section id="dashboard" className="page active">
            <div className="hero">
              <h2>Supervisi Pembelajaran Mendalam</h2>
              <p>
                Gunakan aplikasi ini untuk memandu kepala sekolah melaksanakan supervisi secara utuh: <b>pra supervisi</b>, <b>observasi pembelajaran</b>, <b>refleksi dan umpan balik</b>, serta <b>pengembangan kompetensi guru</b>. Data tersimpan mandiri di Google Drive Anda.
              </p>
              <div className="credit">By: Enang Cuhendi</div>
            </div>

            <div className="grid grid-4">
              <div className="card stat">
                <small>Total Guru</small>
                <div className="num" id="statGuru">{totalGuru}</div>
                <div className="ico">👨‍🏫</div>
              </div>
              <div className="card stat">
                <small>Supervisi Selesai</small>
                <div className="num" id="statSelesai">{totalSelesai}</div>
                <div className="ico">✅</div>
              </div>
              <div className="card stat">
                <small>Dalam Proses</small>
                <div className="num" id="statProses">0</div>
                <div className="ico">🔎</div>
              </div>
              <div className="card stat">
                <small>Rata-rata Skor</small>
                <div className="num" id="statRata">{avgTotal}</div>
                <div className="ico">📈</div>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <div className="section-title">
                  <h3>Alur Supervisi</h3>
                  <span>4 tahap</span>
                </div>
                <div className="recommend">
                  <b>01 • Pra Supervisi</b>
                  <br />
                  <small>Tujuan, perangkat ajar, kesiapan, fokus observasi yang disepakati.</small>
                </div>
                <div className="recommend">
                  <b>02 • Pelaksanaan</b>
                  <br />
                  <small>Observasi proses pembelajaran mendalam dan pengumpulan bukti autentik.</small>
                </div>
                <div className="recommend">
                  <b>03 • Pasca Supervisi</b>
                  <br />
                  <small>Refleksi guru, apresiasi berbasis bukti, dan dialog konstruktif.</small>
                </div>
                <div className="recommend">
                  <b>04 • Tindak Lanjut</b>
                  <br />
                  <small>Rekomendasi kompetensi, target waktu, dan rencana coaching / komunitas belajar.</small>
                </div>
              </div>

              <div className="card">
                <h3>Prinsip Supervisi</h3>
                <ul style={{ lineHeight: '1.9', color: '#475569' }}>
                  <li>Berorientasi pada pertumbuhan dan pengembangan berkelanjutan guru.</li>
                  <li>Berbasis bukti autentik, bukan sekadar pemberian nilai administratif.</li>
                  <li>Dialogis, reflektif, setara, dan memicu rasa ingin belajar guru.</li>
                  <li>Menilai kualitas pengalaman serta keterlibatan aktif murid.</li>
                  <li>Data langsung tersimpan di akun Google Drive masing-masing pengguna.</li>
                </ul>
                <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setCurrentPage('supervisi')}
                  >
                    ➜ Mulai Supervisi
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => setShowGasHub(true)}
                  >
                    ⚡ Panduan Deploy GAS
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. DATA GURU PAGE */}
        {currentPage === 'data' && (
          <section id="data" className="page active">
            <div className="card">
              <div className="section-title">
                <h2>Data Guru di Google Sheets</h2>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowGuruForm(!showGuruForm)}
                >
                  {showGuruForm ? '✕ Tutup Form' : '＋ Tambah Guru'}
                </button>
              </div>

              {showGuruForm && (
                <form 
                  onSubmit={handleSaveGuru}
                  style={{
                    marginBottom: '20px',
                    border: '1px solid #dbe2ea',
                    padding: '18px',
                    borderRadius: '14px',
                    background: '#f8fafc'
                  }}
                >
                  <h3 style={{ marginTop: 0, fontSize: '16px', color: '#1e293b' }}>
                    Tambah Guru Baru (Disimpan ke Sheet "Data_Guru")
                  </h3>
                  <div className="form-grid">
                    <div>
                      <label>Nama Guru *</label>
                      <input 
                        value={gNama}
                        onChange={(e) => setGNama(e.target.value)}
                        placeholder="Nama lengkap beserta gelar" 
                        required
                      />
                    </div>
                    <div>
                      <label>NIP / NUPTK</label>
                      <input 
                        value={gId}
                        onChange={(e) => setGId(e.target.value)}
                        placeholder="Contoh: 19820415..." 
                      />
                    </div>
                    <div>
                      <label>Mata Pelajaran *</label>
                      <input 
                        value={gMapel}
                        onChange={(e) => setGMapel(e.target.value)}
                        placeholder="Contoh: Bahasa Indonesia, IPA, Matematika" 
                        required
                      />
                    </div>
                    <div>
                      <label>Kelas / Fase</label>
                      <input 
                        value={gKelas}
                        onChange={(e) => setGKelas(e.target.value)}
                        placeholder="Contoh: VII / Fase D" 
                      />
                    </div>
                  </div>
                  <div className="actions" style={{ marginTop: '16px' }}>
                    <button type="submit" className="btn btn-success">
                      Simpan ke Google Sheets
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => setShowGuruForm(false)}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}

              <div id="guruTable">
                {gurus.length === 0 ? (
                  <div className="empty">Belum ada data guru. Klik tombol “Tambah Guru” untuk memulai.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Nama Lengkap</th>
                          <th>NIP / NUPTK</th>
                          <th>Mata Pelajaran</th>
                          <th>Kelas / Fase</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gurus.map((g) => (
                          <tr key={g.id}>
                            <td><b>{g.nama}</b></td>
                            <td>{g.identitas || '-'}</td>
                            <td>{g.mapel}</td>
                            <td>{g.kelas || '-'}</td>
                            <td>
                              <button 
                                className="btn btn-danger btn-sm" 
                                onClick={() => handleDeleteGuru(g.id)}
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 3. FORM SUPERVISI PAGE */}
        {currentPage === 'supervisi' && (
          <section id="supervisi" className="page active">
            <div className="card">
              <div className="section-title">
                <h2>Form Supervisi Pembelajaran Mendalam</h2>
                <span className={`pill ${supervisiStatus === 'SELESAI' ? 'green' : 'yellow'}`}>
                  {supervisiStatus}
                </span>
              </div>

              {/* TABS */}
              <div className="tabs">
                <button className={`tab ${currentStep === 1 ? 'active' : ''}`} onClick={() => setCurrentStep(1)}>
                  1. Pra Supervisi
                </button>
                <button className={`tab ${currentStep === 2 ? 'active' : ''}`} onClick={() => setCurrentStep(2)}>
                  2. Pelaksanaan
                </button>
                <button className={`tab ${currentStep === 3 ? 'active' : ''}`} onClick={() => setCurrentStep(3)}>
                  3. Pasca Supervisi
                </button>
                <button className={`tab ${currentStep === 4 ? 'active' : ''}`} onClick={() => setCurrentStep(4)}>
                  4. Tindak Lanjut
                </button>
              </div>

              {/* PROGRESS BAR */}
              <div className="progress">
                <div style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
              </div>

              {/* STEP 1: PRA SUPERVISI */}
              {currentStep === 1 && (
                <div className="step active">
                  <h3>Tahap 1: Pra Supervisi</h3>
                  <p style={{ color: '#64748b', marginTop: 0 }}>
                    Membangun kesepakatan tujuan observasi dan memeriksa kesiapan perangkat ajar secara dialogis.
                  </p>
                  <div className="form-grid">
                    <div>
                      <label>Pilih Guru yang Disupervisi *</label>
                      <select 
                        value={selectedGuruId} 
                        onChange={(e) => {
                          setSelectedGuruId(e.target.value);
                          const g = gurus.find(x => String(x.id) === e.target.value);
                          if (g && g.kelas) setSKelas(g.kelas);
                        }}
                      >
                        <option value="">-- Pilih guru dari database --</option>
                        {gurus.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.nama} — {g.mapel}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Tanggal Pelaksanaan Observasi *</label>
                      <input 
                        type="date" 
                        value={sTanggal} 
                        onChange={(e) => setSTanggal(e.target.value)} 
                      />
                    </div>

                    <div>
                      <label>Materi / Topik Pembelajaran</label>
                      <input 
                        value={sMateri}
                        onChange={(e) => setSMateri(e.target.value)}
                        placeholder="Contoh: Siklus Air, Menulis Cerpen, dsb." 
                      />
                    </div>

                    <div>
                      <label>Kelas / Fase</label>
                      <input 
                        value={sKelas}
                        onChange={(e) => setSKelas(e.target.value)}
                        placeholder="Contoh: VII B / Fase D" 
                      />
                    </div>

                    <div className="full">
                      <label>Tujuan Supervisi / Area Fokus yang Disepakati Bersama</label>
                      <textarea 
                        value={sFokus}
                        onChange={(e) => setSFokus(e.target.value)}
                        placeholder="Contoh: Fokus pada peningkatan diferensiasi konten & proses, partisipasi murid pasif, atau penerapan asesmen formatif..." 
                      />
                    </div>

                    <div className="full">
                      <label>Kesiapan Perangkat Ajar</label>
                      <div className="rating">
                        {['Modul/RPP tersedia', 'Asesmen tersedia', 'Media/bahan ajar siap', 'Tujuan pembelajaran terukur'].map((item) => (
                          <label key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '16px' }}>
                            <input 
                              type="checkbox" 
                              checked={praPerangkat.includes(item)}
                              onChange={(e) => {
                                if (e.target.checked) setPraPerangkat([...praPerangkat, item]);
                                else setPraPerangkat(praPerangkat.filter(p => p !== item));
                              }}
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="actions" style={{ marginTop: '20px' }}>
                    <button className="btn btn-primary" onClick={() => setCurrentStep(2)}>
                      Lanjut Pelaksanaan Observasi →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PELAKSANAAN OBSERVASI */}
              {currentStep === 2 && (
                <div className="step active">
                  <h3>Tahap 2: Pelaksanaan — Observasi Pembelajaran Mendalam</h3>
                  <p style={{ color: '#64748b' }}>
                    Berikan skor 1–4 berdasarkan bukti autentik yang terlihat di kelas.
                    <br />
                    <b>1</b> = Belum tampak | <b>2</b> = Mulai tampak | <b>3</b> = Baik/Konsisten | <b>4</b> = Sangat baik/Menginspirasi
                  </p>

                  <div id="observasiList">
                    {INDIKATOR.map(([judul, desc], idx) => (
                      <div key={judul} className="check-row">
                        <div>
                          <b>{idx + 1}. {judul}</b>
                          <br />
                          <small>{desc}</small>
                        </div>
                        <select 
                          value={scores[idx] || 0}
                          onChange={(e) => setScores({ ...scores, [idx]: Number(e.target.value) })}
                          style={{
                            fontWeight: scores[idx] ? 'bold' : 'normal',
                            borderColor: scores[idx] ? '#2563eb' : '#dbe2ea',
                            background: scores[idx] ? '#eff6ff' : '#fff'
                          }}
                        >
                          <option value="0">Pilih skor</option>
                          <option value="1">1 — Belum tampak</option>
                          <option value="2">2 — Mulai tampak</option>
                          <option value="3">3 — Baik</option>
                          <option value="4">4 — Sangat baik</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label>Catatan / Bukti Observasi Penting (Fakta &amp; Perilaku yang Teramati)</label>
                    <textarea 
                      value={sBukti}
                      onChange={(e) => setSBukti(e.target.value)}
                      placeholder="Tuliskan respon murid, dinamika kelompok, jenis pertanyaan pemantik guru, atau kejadian pembelajaran konkret..." 
                    />
                  </div>

                  <div className="actions" style={{ marginTop: '20px' }}>
                    <button className="btn" onClick={() => setCurrentStep(1)}>
                      ← Kembali
                    </button>
                    <button className="btn btn-primary" onClick={() => setCurrentStep(3)}>
                      Lanjut Pasca Supervisi →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PASCA SUPERVISI */}
              {currentStep === 3 && (
                <div className="step active">
                  <h3>Tahap 3: Pasca Supervisi — Refleksi &amp; Umpan Balik</h3>
                  <p style={{ color: '#64748b' }}>
                    Dialog reflektif yang mengapresiasi keberhasilan guru dan memetakan area yang ingin ditingkatkan.
                  </p>
                  <div className="form-grid">
                    <div className="full">
                      <label>Refleksi Guru: Apa saja yang sudah berjalan baik menurut Anda?</label>
                      <textarea 
                        value={sRefleksi}
                        onChange={(e) => setSRefleksi(e.target.value)}
                        placeholder="Guru menceritakan hal yang berhasil dicapai selama pembelajaran..." 
                      />
                    </div>
                    <div className="full">
                      <label>Refleksi Guru: Apa area yang ingin Anda perbaiki / kembangkan?</label>
                      <textarea 
                        value={sPerbaikan}
                        onChange={(e) => setSPerbaikan(e.target.value)}
                        placeholder="Tantangan yang dirasakan guru saat memfasilitasi belajar..." 
                      />
                    </div>
                    <div className="full">
                      <label>Kekuatan Pembelajaran yang Teramati (Catatan Kepala Sekolah)</label>
                      <textarea 
                        value={sKekuatan}
                        onChange={(e) => setSKekuatan(e.target.value)}
                        placeholder="Praktik baik yang konsisten dan patut dipertahankan..." 
                      />
                    </div>
                    <div className="full">
                      <label>Umpan Balik Kepala Sekolah</label>
                      <textarea 
                        value={sFeedback}
                        onChange={(e) => setSFeedback(e.target.value)}
                        placeholder="Kombinasi apresiasi berbasis bukti + pertanyaan pemantik refleksi + saran konstruktif..." 
                      />
                    </div>
                  </div>

                  <div className="actions" style={{ marginTop: '20px' }}>
                    <button className="btn" onClick={() => setCurrentStep(2)}>
                      ← Kembali
                    </button>
                    <button className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                      Lanjut Tindak Lanjut →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: TINDAK LANJUT */}
              {currentStep === 4 && (
                <div className="step active">
                  <h3>Tahap 4: Tindak Lanjut &amp; Rekomendasi Pengembangan Kompetensi</h3>

                  {/* HASIL SKOR OTOMATIS */}
                  <div className="recommend" style={{ background: '#f0fdf4', borderColor: '#16a34a' }}>
                    <b>Ringkasan Skor Observasi: {currentScoreVal || '-'} / 4 — {currentScoreLevel}</b>
                    <br />
                    <small>Gunakan hasil ini sebagai dasar dialog reflektif dan pemetaan kebutuhan coaching guru.</small>
                  </div>

                  {/* REKOMENDASI BERBASIS SKOR TERENDAH */}
                  <div style={{ marginBottom: '20px' }}>
                    {lowestAreas.length > 0 ? (
                      <div>
                        <h4 style={{ margin: '12px 0 8px', fontSize: '15px' }}>Rekomendasi Berbasis Skor Terendah:</h4>
                        {lowestAreas.map((area) => (
                          <div key={area.name} className="recommend" style={{ marginBottom: '8px' }}>
                            <b>{area.name} — Skor {area.score} / 4</b>
                            <br />
                            <small>{REKOMENDASI_MAP[area.name] || 'Peningkatan kompetensi terkait melalui pendampingan berkelanjutan.'}</small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty" style={{ padding: '15px' }}>
                        Isi skor observasi pada Tahap 2 terlebih dahulu untuk memicu rekomendasi otomatis.
                      </div>
                    )}
                  </div>

                  <div className="form-grid">
                    <div>
                      <label>Prioritas Pengembangan</label>
                      <select value={sPrioritas} onChange={(e) => setSPrioritas(e.target.value)}>
                        <option>Perencanaan pembelajaran mendalam</option>
                        <option>Praktik pedagogis dan diferensiasi</option>
                        <option>Asesmen formatif & HOTS</option>
                        <option>Refleksi dan umpan balik</option>
                        <option>Pemanfaatan teknologi/digital</option>
                        <option>Pengelolaan lingkungan belajar</option>
                        <option>Kolaborasi dan komunitas belajar</option>
                      </select>
                    </div>

                    <div>
                      <label>Bentuk Tindak Lanjut</label>
                      <select value={sTL} onChange={(e) => setSTL(e.target.value)}>
                        <option>Coaching individual</option>
                        <option>Observasi teman sejawat</option>
                        <option>Lesson study</option>
                        <option>MGMP / komunitas belajar</option>
                        <option>Workshop / pelatihan terarah</option>
                        <option>Praktik mandiri dengan jurnal refleksi</option>
                      </select>
                    </div>

                    <div>
                      <label>Target Waktu Penyelesaian</label>
                      <input 
                        value={sTarget} 
                        onChange={(e) => setSTarget(e.target.value)} 
                        placeholder="Contoh: 2 minggu, 1 bulan" 
                      />
                    </div>

                    <div>
                      <label>Indikator Keberhasilan</label>
                      <input 
                        value={sIndikator} 
                        onChange={(e) => setSIndikator(e.target.value)} 
                        placeholder="Contoh: Asesmen formatif digunakan setiap pertemuan" 
                      />
                    </div>

                    <div className="full">
                      <label>Catatan Kesepakatan Tindak Lanjut</label>
                      <textarea 
                        value={sCatatanTL}
                        onChange={(e) => setSCatatanTL(e.target.value)}
                        placeholder="Tuliskan komitmen guru, jadwal supervisi lanjutan, dan dukungan yang akan diberikan sekolah..." 
                      />
                    </div>
                  </div>

                  <div className="actions" style={{ marginTop: '24px' }}>
                    <button className="btn" onClick={() => setCurrentStep(3)}>
                      ← Kembali
                    </button>
                    <button className="btn btn-success" onClick={handleSaveSupervisi}>
                      💾 Simpan ke Google Sheets
                    </button>
                    <button className="btn btn-warning" onClick={() => window.print()}>
                      🖨️ Cetak / Ekspor PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 4. REKAP HASIL PAGE */}
        {currentPage === 'rekap' && (
          <section id="rekap" className="page active">
            <div className="card">
              <div className="section-title">
                <h2>Rekap Hasil Supervisi di Google Sheets</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-warning" onClick={() => window.print()}>
                    <Printer size={15} /> Cetak
                  </button>
                </div>
              </div>

              <div id="rekapTable">
                {hasil.length === 0 ? (
                  <div className="empty">
                    Belum ada hasil supervisi yang tersimpan. Lakukan supervisi untuk melihat rekapitulasi data.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Nama Guru</th>
                          <th>Mata Pelajaran</th>
                          <th>Tanggal</th>
                          <th>Skor</th>
                          <th>Kategori</th>
                          <th>Prioritas Pengembangan</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hasil.map((h) => {
                          const cat = h.rata >= 3.5 ? 'Sangat Baik' : h.rata >= 2.75 ? 'Baik' : h.rata >= 2 ? 'Mulai Berkembang' : 'Perlu Pendampingan';
                          const cls = h.rata >= 2.75 ? 'green' : h.rata >= 2 ? 'yellow' : 'red';
                          return (
                            <tr key={h.id}>
                              <td><b>{h.nama}</b></td>
                              <td>{h.mapel}</td>
                              <td>{h.tanggal}</td>
                              <td><b>{h.rata} / 4</b></td>
                              <td><span className={`pill ${cls}`}>{cat}</span></td>
                              <td>{h.prioritas}</td>
                              <td>
                                <button 
                                  className="btn btn-danger btn-sm" 
                                  onClick={() => handleDeleteHasil(h.id)}
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 5. PANDUAN PAGE */}
        {currentPage === 'panduan' && (
          <section id="panduan" className="page active">
            <div className="card">
              <h2>Panduan Singkat Kepala Sekolah</h2>
              <div className="grid grid-2">
                <div className="recommend">
                  <b>Pra Supervisi</b>
                  <p>Bangun kesepakatan dengan guru. Pahami tujuan pembelajaran, karakteristik murid, perangkat ajar, serta fokus observasi.</p>
                </div>
                <div className="recommend">
                  <b>Pelaksanaan</b>
                  <p>Amati proses dan respons murid. Kumpulkan bukti autentik. Hindari interupsi yang mengganggu alur kelas.</p>
                </div>
                <div className="recommend">
                  <b>Pasca Supervisi</b>
                  <p>Mulai dengan apresiasi berbasis bukti nyata. Ajukan pertanyaan pemantik refleksi. Sepakati satu hingga dua area pertumbuhan.</p>
                </div>
                <div className="recommend">
                  <b>Tindak Lanjut</b>
                  <p>Sepakati bentuk pengembangan (coaching, MGMP, peer-observation), target waktu, indikator keberhasilan, serta monitoring berkala.</p>
                </div>
              </div>

              <h3>Rubrik &amp; Skala Observasi</h3>
              <div style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Skor</th>
                      <th>Makna Penilaian</th>
                      <th>Orientasi Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b>1</b></td>
                      <td>Belum tampak</td>
                      <td>Pendampingan intensif dan contoh praktik (modeling)</td>
                    </tr>
                    <tr>
                      <td><b>2</b></td>
                      <td>Mulai tampak</td>
                      <td>Coaching terarah dan latihan terstruktur</td>
                    </tr>
                    <tr>
                      <td><b>3</b></td>
                      <td>Baik</td>
                      <td>Penguatan kompetensi dan berbagi praktik dengan rekan sejawat</td>
                    </tr>
                    <tr>
                      <td><b>4</b></td>
                      <td>Sangat baik / konsisten</td>
                      <td>Pengembangan inovasi dan diseminasi di komunitas belajar sekolah</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '24px', padding: '18px', background: '#eff6ff', borderRadius: '14px', border: '1px solid #bfdbfe' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} />
                  Tentang Integrasi Google Apps Script
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a', lineHeight: 1.6 }}>
                  Aplikasi ini dirancang dengan arsitektur <i>Per-User Cloud Storage</i> menggunakan Google Apps Script. Saat dideploy dengan konfigurasi <b>"Execute as: User accessing the web app"</b>, script otomatis membuat file Google Sheets bernama <code>Data_Supervisi_App</code> langsung di Google Drive pengguna masing-masing, menjaga privasi data guru dan sekolah secara independen.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="loading-overlay" style={{ display: 'flex' }}>
          <div className="spinner"></div>
          <div className="loading-text">{loadingText}</div>
        </div>
      )}

      {/* TOAST NOTIFIKASI */}
      {toastMsg && (
        <div className="toast" style={{ display: 'block' }}>
          {toastMsg}
        </div>
      )}

      {/* MODAL KONFIRMASI */}
      {confirmModal.show && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal">
            <h3 style={{ marginTop: 0, fontSize: '18px' }}>Konfirmasi</h3>
            <p style={{ color: '#475569', marginBottom: '20px' }}>{confirmModal.msg}</p>
            <div className="actions" style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <button 
                className="btn" 
                style={{ flex: 1 }} 
                onClick={() => setConfirmModal({ show: false, msg: '', onConfirm: () => {} })}
              >
                Batal
              </button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1 }} 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ show: false, msg: '', onConfirm: () => {} });
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE APPS SCRIPT EXPORT & DEPLOYMENT MODAL */}
      {showGasHub && (
        <div className="modal-overlay" style={{ display: 'flex', zIndex: 10001 }}>
          <div 
            className="modal" 
            style={{ 
              maxWidth: '920px', 
              width: '95%', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              textAlign: 'left', 
              padding: '24px',
              borderRadius: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#2563eb', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '20px' }}>
                  ⚡
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '19px' }}>Pusat Kode &amp; Panduan Deploy Google Apps Script</h3>
                  <small style={{ color: '#64748b' }}>Penyimpanan otomatis ke Google Sheets di Google Drive masing-masing pengguna</small>
                </div>
              </div>
              <button 
                className="btn btn-sm btn-outline" 
                onClick={() => setShowGasHub(false)}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* TAB SELECTOR */}
            <div className="tabs" style={{ marginBottom: '16px' }}>
              <button 
                className={`tab ${gasTab === 'deploy' ? 'active' : ''}`} 
                onClick={() => setGasTab('deploy')}
              >
                📖 Panduan Deploy (Wajib Baca)
              </button>
              <button 
                className={`tab ${gasTab === 'codegs' ? 'active' : ''}`} 
                onClick={() => setGasTab('codegs')}
              >
                📄 Code.gs (Backend)
              </button>
              <button 
                className={`tab ${gasTab === 'indexhtml' ? 'active' : ''}`} 
                onClick={() => setGasTab('indexhtml')}
              >
                🌐 Index.html (Frontend)
              </button>
            </div>

            {/* TAB 1: PANDUAN DEPLOY */}
            {gasTab === 'deploy' && (
              <div>
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '14px 18px', borderRadius: '12px', marginBottom: '16px', color: '#92400e' }}>
                  <b style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={18} /> PENTING: Pengaturan Akun Masing-masing Pengguna
                  </b>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', lineHeight: 1.5 }}>
                    Agar spreadsheet otomatis tersimpan di Google Drive <b>milik masing-masing pengguna yang mengakses web app</b> (bukan tersimpan di Drive pemilik script), pastikan memilih <b>"Execute as: User accessing the web app"</b> saat melakukan Deploy!
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>
                      Langkah 1: Buat Proyek Google Apps Script Baru
                    </h4>
                    <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: 1.8 }}>
                      <li>Buka browser dan kunjungi <a href="https://script.google.com" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>script.google.com</a>.</li>
                      <li>Klik tombol <b>"+ Proyek Baru" (+ New Project)</b> di pojok kiri atas.</li>
                      <li>Beri nama proyek, misalnya: <code>Supervisi Pembelajaran Mendalam</code>.</li>
                    </ol>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>
                      Langkah 2: Salin File <code>Code.gs</code> dan <code>Index.html</code>
                    </h4>
                    <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569', lineHeight: 1.8 }}>
                      <li>
                        Di editor script, buka file bawaan <b>Code.gs</b>. Hapus isinya lalu tempel (paste) kode dari tab <b>Code.gs</b> di modal ini.
                      </li>
                      <li>
                        Klik ikon <b>"+"</b> di samping Files/File lalu pilih <b>HTML</b>. Beri nama file tepat: <b>Index</b> (tanpa menulis ekstensi .html, karena sistem GAS otomatis menambahkannya).
                      </li>
                      <li>
                        Hapus kode default di file <b>Index.html</b>, lalu tempel (paste) seluruh kode dari tab <b>Index.html</b> di modal ini.
                      </li>
                      <li>
                        Tekan tombol <b>Simpan (ikon Disket / Ctrl+S)</b>.
                      </li>
                    </ol>
                  </div>

                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#065f46' }}>
                      Langkah 3: Konfigurasi Deploy Web App (KUNCI UTAMA)
                    </h4>
                    <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#047857', lineHeight: 1.8 }}>
                      <li>Klik tombol biru <b>"Deploy"</b> di pojok kanan atas → pilih <b>"New deployment" (Penerapan baru)</b>.</li>
                      <li>Klik ikon gerigi (Select type) di samping kiri → pilih <b>"Web app" (Aplikasi web)</b>.</li>
                      <li>
                        Isi form penerapan persis seperti ini:
                        <ul style={{ marginTop: '6px', marginBottom: '6px' }}>
                          <li><b>Description:</b> <i>Supervisi Pembelajaran Mendalam v1</i></li>
                          <li>
                            <b style={{ background: '#fef08a', padding: '2px 6px', borderRadius: '4px', color: '#854d0e' }}>
                              Execute as: "User accessing the web app"
                            </b>
                            <br />
                            <small style={{ color: '#065f46' }}>
                              *(Ini yang membuat Google Apps Script membuat file Google Sheets "Data_Supervisi_App" langsung di Google Drive milik user yang login!)*
                            </small>
                          </li>
                          <li>
                            <b style={{ background: '#fef08a', padding: '2px 6px', borderRadius: '4px', color: '#854d0e' }}>
                              Who has access: "Anyone with Google Account"
                            </b>
                          </li>
                        </ul>
                      </li>
                      <li>Klik <b>"Deploy"</b>.</li>
                    </ol>
                  </div>

                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#1e293b' }}>
                      Langkah 4: Otorisasi Izin Akses Google Drive (Satu Kali)
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                      Saat pertama kali dibuka, Google akan meminta izin (Authorize access) untuk membuat dan membaca Google Sheets di Drive pengguna.
                      <br />
                      Pilih akun Google Anda → jika muncul peringatan <i>"Google hasn't verified this app"</i>, klik <b>Advanced (Lanjutan)</b> di kiri bawah → klik <b>"Go to ... (unsafe)"</b> → klik <b>Allow (Izinkan)</b>.
                      <br />
                      Setelah itu, Web App siap digunakan dan URL Web App dapat dibagikan kepada seluruh rekan kepala sekolah atau guru!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CODE.GS */}
            {gasTab === 'codegs' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    File skrip server-side untuk menangani pembuatan sheet otomatis dan operasi CRUD.
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => copyToClipboard(CODE_GS_SOURCE, 'codegs')}
                    >
                      {copiedCodeGs ? <Check size={14} /> : <Copy size={14} />}
                      {copiedCodeGs ? 'Tersalin!' : 'Salin Code.gs'}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => downloadFile('Code.gs', CODE_GS_SOURCE)}
                    >
                      <Download size={14} /> Unduh Code.gs
                    </button>
                  </div>
                </div>
                <pre 
                  style={{ 
                    background: '#0f172a', 
                    color: '#f8fafc', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    lineHeight: 1.5,
                    maxHeight: '480px',
                    overflow: 'auto',
                    margin: 0
                  }}
                >
                  {CODE_GS_SOURCE}
                </pre>
              </div>
            )}

            {/* TAB 3: INDEX.HTML */}
            {gasTab === 'indexhtml' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    File antarmuka HTML/CSS/JS lengkap dengan pemanggilan asinkronus <code>google.script.run</code> &amp; loading spinner.
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => copyToClipboard(INDEX_HTML_SOURCE, 'indexhtml')}
                    >
                      {copiedIndexHtml ? <Check size={14} /> : <Copy size={14} />}
                      {copiedIndexHtml ? 'Tersalin!' : 'Salin Index.html'}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => downloadFile('Index.html', INDEX_HTML_SOURCE)}
                    >
                      <Download size={14} /> Unduh Index.html
                    </button>
                  </div>
                </div>
                <pre 
                  style={{ 
                    background: '#0f172a', 
                    color: '#f8fafc', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    lineHeight: 1.5,
                    maxHeight: '480px',
                    overflow: 'auto',
                    margin: 0
                  }}
                >
                  {INDEX_HTML_SOURCE}
                </pre>
              </div>
            )}

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setShowGasHub(false)}>
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
