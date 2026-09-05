require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!ADMIN_PASSWORD || !SESSION_SECRET) {
  console.error('\n[RUPARASA] File .env belum ada atau belum lengkap.');
  console.error('Salin ".env.example" menjadi ".env" lalu isi ADMIN_PASSWORD dan SESSION_SECRET.\n');
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, 'data');
const WORKS_FILE = path.join(DATA_DIR, 'works.json');
const PROFILE_FILE = path.join(DATA_DIR, 'profile.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const GUESTBOOK_FILE = path.join(DATA_DIR, 'guestbook.json');
const NEWSLETTER_FILE = path.join(DATA_DIR, 'newsletter.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// --- Helper baca/tulis data (file JSON sebagai "database" sederhana) ---
function readJSON(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
if (!fs.existsSync(PRODUCTS_FILE)) writeJSON(PRODUCTS_FILE, []);
if (!fs.existsSync(COMMENTS_FILE)) writeJSON(COMMENTS_FILE, []);
if (!fs.existsSync(GUESTBOOK_FILE)) writeJSON(GUESTBOOK_FILE, []);
if (!fs.existsSync(NEWSLETTER_FILE)) writeJSON(NEWSLETTER_FILE, []);

// Hash password admin sekali di memori saat server nyala
const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 12 } // 12 jam
}));

// --- Identitas pengunjung anonim (dipakai buat like sekali & buka akses eksklusif) ---
app.use((req, res, next) => {
  let cid = req.cookies && req.cookies.rp_cid;
  if (!cid) {
    cid = crypto.randomBytes(16).toString('hex');
    res.cookie('rp_cid', cid, {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 3, // 3 tahun
      httpOnly: true,
      sameSite: 'lax'
    });
  }
  req.clientId = cid;
  next();
});

app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

// --- Middleware cek login ---
function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) return next();
  return res.status(401).json({ error: 'Belum login.' });
}

// --- Setup upload file (multer) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${unique}${ext}`);
  }
});

const ALLOWED_TYPES = {
  tulisan: ['.txt', '.md', '.pdf', '.doc', '.docx'],
  lagu: ['.mp3', '.wav', '.ogg', '.m4a', '.flac'],
  video: ['.mp4', '.mov', '.webm', '.mkv'],
  sketsa: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
};
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const workUpload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB per file
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'thumbnail') {
      if (IMAGE_EXT.includes(ext)) return cb(null, true);
      return cb(new Error('Thumbnail harus berupa gambar (jpg/png/webp/gif).'));
    }
    if (file.fieldname === 'file') {
      const type = req.body.type;
      if (ALLOWED_TYPES[type] && ALLOWED_TYPES[type].includes(ext)) return cb(null, true);
      return cb(new Error(`Tipe file .${ext.replace('.', '')} tidak didukung untuk kategori "${type}".`));
    }
    cb(new Error('Field file tidak dikenali.'));
  }
});

const productUpload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 20 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (IMAGE_EXT.includes(ext)) return cb(null, true);
    cb(new Error('Gambar produk harus jpg/png/webp/gif.'));
  }
});

// ============== AUTH ==============
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (!password || !bcrypt.compareSync(password, ADMIN_HASH)) {
    return res.status(401).json({ error: 'Password salah.' });
  }
  req.session.loggedIn = true;
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/session', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.loggedIn) });
});

// ============== PROFIL ==============
app.get('/api/profile', (req, res) => {
  res.json(readJSON(PROFILE_FILE, {}));
});

app.put('/api/profile', requireLogin, (req, res) => {
  const current = readJSON(PROFILE_FILE, {});
  const updated = { ...current, ...req.body };
  writeJSON(PROFILE_FILE, updated);
  res.json(updated);
});

// Ubah data karya (works) jadi respons publik: sembunyikan accessCode & daftar id pengunjung,
// ganti jadi status turunan (unlocked/liked) relatif ke pengunjung yang minta.
function publicWork(w, req, isAdmin) {
  const unlocked = !w.exclusive || isAdmin || (w.unlockedBy || []).includes(req.clientId);
  const liked = (w.likedBy || []).includes(req.clientId);
  return {
    id: w.id,
    title: w.title,
    type: w.type,
    description: w.description,
    filename: unlocked ? w.filename : null,
    originalName: unlocked ? w.originalName : null,
    thumbnail: w.thumbnail || null,
    exclusive: !!w.exclusive,
    price: w.price || null,
    unlocked,
    status: w.status || 'published',
    views: w.views,
    likes: w.likes,
    liked,
    createdAt: w.createdAt
  };
}

// ============== KARYA ==============
app.get('/api/works', (req, res) => {
  const works = readJSON(WORKS_FILE, []);
  const { type, exclusive } = req.query;
  const isAdmin = !!(req.session && req.session.loggedIn);
  let filtered = works;
  if (!isAdmin) filtered = filtered.filter(w => (w.status || 'published') === 'published');
  if (type) filtered = filtered.filter(w => w.type === type);
  if (exclusive === '1') filtered = filtered.filter(w => w.exclusive);
  filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
  res.json(filtered.map(w => publicWork(w, req, isAdmin)));
});

// Karya tunggal (dipakai buat share link, biar tetap kebuka walau statusnya draft dan diakses admin)
app.get('/api/works/:id', (req, res) => {
  const works = readJSON(WORKS_FILE, []);
  const work = works.find(w => w.id === req.params.id);
  const isAdmin = !!(req.session && req.session.loggedIn);
  if (!work) return res.status(404).json({ error: 'Karya tidak ditemukan.' });
  if ((work.status || 'published') !== 'published' && !isAdmin) {
    return res.status(404).json({ error: 'Karya tidak ditemukan.' });
  }
  res.json(publicWork(work, req, isAdmin));
});

app.post('/api/works', requireLogin, workUpload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), (req, res) => {
  const { title, type, description, exclusive, price, accessCode, status } = req.body;
  const fileArr = req.files && req.files.file;
  const thumbArr = req.files && req.files.thumbnail;
  if (!title || !type || !fileArr || !fileArr[0]) {
    return res.status(400).json({ error: 'Judul, tipe, dan file wajib diisi.' });
  }
  const isExclusive = exclusive === 'true' || exclusive === 'on' || exclusive === '1';
  if (isExclusive && !accessCode) {
    return res.status(400).json({ error: 'Karya eksklusif wajib punya kode akses.' });
  }
  const works = readJSON(WORKS_FILE, []);
  const newWork = {
    id: crypto.randomUUID(),
    title,
    type,
    description: description || '',
    filename: fileArr[0].filename,
    originalName: fileArr[0].originalname,
    thumbnail: thumbArr && thumbArr[0] ? thumbArr[0].filename : null,
    exclusive: isExclusive,
    price: isExclusive && price ? Number(price) : null,
    accessCode: isExclusive ? accessCode : null,
    unlockedBy: [],
    status: status === 'draft' ? 'draft' : 'published',
    views: 0,
    likes: 0,
    likedBy: [],
    createdAt: Date.now()
  };
  works.push(newWork);
  writeJSON(WORKS_FILE, works);
  res.json(publicWork(newWork, req, true));
});

app.patch('/api/works/:id', requireLogin, (req, res) => {
  const works = readJSON(WORKS_FILE, []);
  const work = works.find(w => w.id === req.params.id);
  if (!work) return res.status(404).json({ error: 'Karya tidak ditemukan.' });
  const { title, description, exclusive, price, accessCode, status } = req.body;
  if (title !== undefined) work.title = title;
  if (description !== undefined) work.description = description;
  if (exclusive !== undefined) work.exclusive = (exclusive === 'true' || exclusive === true);
  if (price !== undefined) work.price = price ? Number(price) : null;
  if (accessCode !== undefined && accessCode) work.accessCode = accessCode;
  if (status !== undefined && (status === 'draft' || status === 'published')) work.status = status;
  writeJSON(WORKS_FILE, works);
  res.json(publicWork(work, req, true));
});

app.delete('/api/works/:id', requireLogin, (req, res) => {
  const works = readJSON(WORKS_FILE, []);
  const work = works.find(w => w.id === req.params.id);
  if (!work) return res.status(404).json({ error: 'Karya tidak ditemukan.' });

  const filePath = path.join(UPLOAD_DIR, work.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  if (work.thumbnail) {
    const thumbPath = path.join(UPLOAD_DIR, work.thumbnail);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  }

  writeJSON(WORKS_FILE, works.filter(w => w.id !== req.params.id));
  res.json({ ok: true });
});

app.post('/api/works/:id/view', (req, res) => {
  const works = readJSON(WORKS_FILE, []);
  const work = works.find(w => w.id === req.params.id);
  if (!work) return res.status(404).json({ error: 'Karya tidak ditemukan.' });
  work.views += 1;
  writeJSON(WORKS_FILE, works);
  res.json({ views: work.views });
});

// Like: satu pengunjung (rp_cid) cuma bisa like sekali. Klik lagi = unlike (toggle).
app.post('/api/works/:id/like', (req, res) => {
  const works = readJSON(WORKS_FILE, []);
  const work = works.find(w => w.id === req.params.id);
  if (!work) return res.status(404).json({ error: 'Karya tidak ditemukan.' });
  work.likedBy = work.likedBy || [];
  const idx = work.likedBy.indexOf(req.clientId);
  let liked;
  if (idx === -1) {
    work.likedBy.push(req.clientId);
    work.likes += 1;
    liked = true;
  } else {
    work.likedBy.splice(idx, 1);
    work.likes = Math.max(0, work.likes - 1);
    liked = false;
  }
  writeJSON(WORKS_FILE, works);
  res.json({ likes: work.likes, liked });
});

// Buka akses karya eksklusif pakai kode yang dikasih admin
app.post('/api/works/:id/unlock', (req, res) => {
  const { code } = req.body;
  const works = readJSON(WORKS_FILE, []);
  const work = works.find(w => w.id === req.params.id);
  if (!work) return res.status(404).json({ error: 'Karya tidak ditemukan.' });
  if (!work.exclusive) return res.json(publicWork(work, req, false));
  if (!code || code !== work.accessCode) {
    return res.status(401).json({ error: 'Kode akses salah.' });
  }
  work.unlockedBy = work.unlockedBy || [];
  if (!work.unlockedBy.includes(req.clientId)) work.unlockedBy.push(req.clientId);
  writeJSON(WORKS_FILE, works);
  res.json(publicWork(work, req, false));
});

// ============== SHOP (produk) ==============
app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  res.json(products.sort((a, b) => b.createdAt - a.createdAt));
});

app.post('/api/products', requireLogin, productUpload.single('image'), (req, res) => {
  const { name, description, price, link } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Nama dan harga produk wajib diisi.' });
  const products = readJSON(PRODUCTS_FILE, []);
  const newProduct = {
    id: crypto.randomUUID(),
    name,
    description: description || '',
    price: Number(price),
    image: req.file ? req.file.filename : null,
    link: link || '',
    createdAt: Date.now()
  };
  products.push(newProduct);
  writeJSON(PRODUCTS_FILE, products);
  res.json(newProduct);
});

app.delete('/api/products/:id', requireLogin, (req, res) => {
  const products = readJSON(PRODUCTS_FILE, []);
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan.' });
  if (product.image) {
    const imgPath = path.join(UPLOAD_DIR, product.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  writeJSON(PRODUCTS_FILE, products.filter(p => p.id !== req.params.id));
  res.json({ ok: true });
});

// ===== Karya terkait =====
app.get('/api/works/:id/related', (req, res) => {
  const works = readJSON(WORKS_FILE, []);
  const isAdmin = !!(req.session && req.session.loggedIn);
  const current = works.find(w => w.id === req.params.id);
  if (!current) return res.json([]);
  let pool = works.filter(w =>
    w.id !== current.id &&
    (w.status || 'published') === 'published' &&
    w.type === current.type
  );
  if (pool.length < 3) {
    const others = works.filter(w =>
      w.id !== current.id &&
      (w.status || 'published') === 'published' &&
      w.type !== current.type &&
      !pool.includes(w)
    );
    pool = pool.concat(others);
  }
  const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  res.json(shuffled.map(w => publicWork(w, req, isAdmin)));
});

// ===== Komentar per karya =====
function sanitizeText(str, max) {
  return String(str || '').trim().slice(0, max);
}

app.get('/api/works/:id/comments', (req, res) => {
  const comments = readJSON(COMMENTS_FILE, []);
  const list = comments.filter(c => c.workId === req.params.id).sort((a, b) => b.createdAt - a.createdAt);
  res.json(list);
});

app.post('/api/works/:id/comments', (req, res) => {
  const works = readJSON(WORKS_FILE, []);
  const work = works.find(w => w.id === req.params.id);
  if (!work) return res.status(404).json({ error: 'Karya tidak ditemukan.' });
  const name = sanitizeText(req.body.name, 60) || 'Anonim';
  const message = sanitizeText(req.body.message, 500);
  if (!message) return res.status(400).json({ error: 'Komentar tidak boleh kosong.' });
  const comments = readJSON(COMMENTS_FILE, []);
  const comment = {
    id: crypto.randomUUID(),
    workId: req.params.id,
    name,
    message,
    createdAt: Date.now()
  };
  comments.push(comment);
  writeJSON(COMMENTS_FILE, comments);
  res.json(comment);
});

app.delete('/api/comments/:id', requireLogin, (req, res) => {
  const comments = readJSON(COMMENTS_FILE, []);
  writeJSON(COMMENTS_FILE, comments.filter(c => c.id !== req.params.id));
  res.json({ ok: true });
});

// ===== Buku tamu =====
app.get('/api/guestbook', (req, res) => {
  const list = readJSON(GUESTBOOK_FILE, []).sort((a, b) => b.createdAt - a.createdAt);
  res.json(list);
});

app.post('/api/guestbook', (req, res) => {
  const name = sanitizeText(req.body.name, 60) || 'Anonim';
  const message = sanitizeText(req.body.message, 500);
  if (!message) return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
  const entries = readJSON(GUESTBOOK_FILE, []);
  const entry = { id: crypto.randomUUID(), name, message, createdAt: Date.now() };
  entries.push(entry);
  writeJSON(GUESTBOOK_FILE, entries);
  res.json(entry);
});

app.delete('/api/guestbook/:id', requireLogin, (req, res) => {
  const entries = readJSON(GUESTBOOK_FILE, []);
  writeJSON(GUESTBOOK_FILE, entries.filter(e => e.id !== req.params.id));
  res.json({ ok: true });
});

// ===== Newsletter =====
app.post('/api/newsletter', (req, res) => {
  const email = sanitizeText(req.body.email, 120).toLowerCase();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!validEmail) return res.status(400).json({ error: 'Email tidak valid.' });
  const subs = readJSON(NEWSLETTER_FILE, []);
  if (subs.some(s => s.email === email)) {
    return res.json({ ok: true, alreadySubscribed: true });
  }
  subs.push({ email, createdAt: Date.now() });
  writeJSON(NEWSLETTER_FILE, subs);
  res.json({ ok: true });
});

app.get('/api/newsletter', requireLogin, (req, res) => {
  res.json(readJSON(NEWSLETTER_FILE, []));
});

// Tangani error dari multer (misal file kegedean / tipe salah)
app.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

app.listen(PORT, () => {
  console.log(`\nRUPARASA berjalan di http://localhost:${PORT}\n`);
});
