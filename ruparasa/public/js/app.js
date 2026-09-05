const state = { loggedIn: false, works: [], products: [], activeFilter: '', search: '', sort: 'newest' };

const el = (id) => document.getElementById(id);
const rupiah = (n) => 'Rp' + Number(n || 0).toLocaleString('id-ID');

const SOCIAL_ICONS = {
  instagram: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 0 1 1.15-1.77A4.9 4.9 0 0 1 5.59 1.8c.46-.16 1.26-.35 2.43-.4C9.29 1.34 9.67 1.33 12 1.33m0 1.8c-3.15 0-3.5.01-4.73.07-1.03.05-1.6.22-1.97.36-.5.19-.85.42-1.22.8-.38.37-.6.72-.8 1.22-.14.37-.3.94-.36 1.97C2.86 8.5 2.85 8.85 2.85 12s.01 3.5.07 4.73c.05 1.03.22 1.6.36 1.97.19.5.42.85.8 1.22.37.38.72.6 1.22.8.37.14.94.3 1.97.36 1.23.06 1.58.07 4.73.07s3.5-.01 4.73-.07c1.03-.05 1.6-.22 1.97-.36.5-.19.85-.42 1.22-.8.38-.37.6-.72.8-1.22.14-.37.3-.94.36-1.97.06-1.23.07-1.58.07-4.73s-.01-3.5-.07-4.73c-.05-1.03-.22-1.6-.36-1.97a3.1 3.1 0 0 0-.8-1.22 3.1 3.1 0 0 0-1.22-.8c-.37-.14-.94-.3-1.97-.36-1.23-.06-1.58-.07-4.73-.07M12 6.86A5.14 5.14 0 1 1 6.86 12 5.14 5.14 0 0 1 12 6.86m0 1.8a3.34 3.34 0 1 0 3.34 3.34A3.34 3.34 0 0 0 12 8.66m5.34-2a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M23.5 6.5s-.23-1.64-.94-2.36c-.9-.94-1.9-.95-2.36-1C16.9 2.8 12 2.8 12 2.8h-.01s-4.9 0-8.2.34c-.46.05-1.46.06-2.36 1C.72 4.86.5 6.5.5 6.5S.25 8.42.25 10.34v1.8c0 1.92.25 3.84.25 3.84s.23 1.64.94 2.36c.9.94 2.08.9 2.6 1 1.9.18 8.06.34 8.06.34s4.9-.01 8.2-.34c.46-.06 1.46-.06 2.36-1 .71-.72.94-2.36.94-2.36s.25-1.92.25-3.84v-1.8c0-1.92-.25-3.84-.25-3.84M9.6 14.9V7.9l6.4 3.5z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16.6 2h-3.2v13.6a2.8 2.8 0 1 1-2-2.68V9.6a5.9 5.9 0 1 0 5.2 5.86V8.4a7.9 7.9 0 0 0 4.7 1.5V6.7a4.7 4.7 0 0 1-4.7-4.7"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20.4 3H23l-6 6.9L24 21h-6.6l-5.1-6.7L6.4 21H3.8l6.4-7.4L2.4 3H9l4.6 6.1zM19.4 19h1.7L8.7 4.9H6.9z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4H15.1c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12"/></svg>',
  spotify: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m4.6 14.4a.6.6 0 0 1-.83.2c-2.27-1.4-5.13-1.7-8.5-.93a.62.62 0 1 1-.27-1.2c3.7-.84 6.86-.48 9.4 1.1a.6.6 0 0 1 .2.83m1.22-2.72a.75.75 0 0 1-1 .25c-2.6-1.6-6.56-2.06-9.63-1.13a.75.75 0 1 1-.44-1.44c3.53-1.07 7.9-.55 10.9 1.3a.75.75 0 0 1 .17 1.02m.1-2.83c-3.1-1.85-8.28-2-11.24-1.1a.9.9 0 1 1-.52-1.72c3.4-1.03 9.1-.84 12.7 1.28a.9.9 0 1 1-.94 1.54"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17.5 14.4c-.3-.15-1.74-.86-2-.96s-.46-.15-.65.15-.75.95-.92 1.15-.34.22-.63.07a8.2 8.2 0 0 1-2.4-1.5 9 9 0 0 1-1.66-2.06c-.17-.3 0-.46.13-.6.13-.14.3-.35.44-.53a2 2 0 0 0 .3-.5.55.55 0 0 0-.03-.52c-.07-.15-.65-1.57-.9-2.15s-.48-.5-.65-.5h-.56a1.07 1.07 0 0 0-.78.37 3.3 3.3 0 0 0-1 2.4 5.6 5.6 0 0 0 1.2 3c.15.2 2.06 3.15 5 4.4a17 17 0 0 0 1.68.62 4 4 0 0 0 1.85.12 3 3 0 0 0 2-1.4 2.5 2.5 0 0 0 .17-1.4c-.07-.13-.26-.2-.55-.36M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2"/></svg>',
  email: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M2 4h20v16H2zm2 2.2V18h16V6.2l-8 5.8z"/></svg>'
};
const GENERIC_ICON = '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M3.9 12a4 4 0 0 1 4-4h3v1.6h-3a2.4 2.4 0 0 0 0 4.8h3V16h-3a4 4 0 0 1-4-4m6.1.8h4v-1.6h-4zM16.1 8h-3v1.6h3a2.4 2.4 0 0 1 0 4.8h-3V16h3a4 4 0 0 0 0-8"/></svg>';

let currentModalWork = null;

init();

async function init() {
  await checkSession();
  await loadProfile();
  await loadWorks();
  await loadProducts();
  bindUI();
  showView('home');
  openSharedWorkFromURL();
}

async function openSharedWorkFromURL() {
  const params = new URLSearchParams(location.search);
  const id = params.get('work');
  if (!id) return;
  let w = state.works.find(x => x.id === id);
  if (!w) {
    try {
      const res = await fetch(`/api/works/${id}`);
      if (res.ok) {
        w = await res.json();
        state.works.push(w);
      }
    } catch {}
  }
  if (w) openWork(w.id);
}

async function checkSession() {
  const res = await fetch('/api/session');
  const data = await res.json();
  state.loggedIn = data.loggedIn;
  updateAuthUI();
}

function updateAuthUI() {
  el('loginBtn').classList.toggle('hidden', state.loggedIn);
  el('uploadBtn').classList.toggle('hidden', !state.loggedIn);
  el('logoutBtn').classList.toggle('hidden', !state.loggedIn);
  el('addProductBtn').classList.toggle('hidden', !state.loggedIn);
}

// ============ PROFIL ============
async function loadProfile() {
  const res = await fetch('/api/profile');
  const p = await res.json();
  el('heroName').textContent = p.name || 'Ruparasa';
  el('heroTagline').textContent = p.tagline || '';
  el('profileBio').textContent = p.bio || '';
  el('profileVision').textContent = p.vision || '';
  el('profileMission').textContent = p.mission || '';
  el('footerName').textContent = p.name || 'Ruparasa';
  el('exclusiveInfo').textContent = p.exclusiveInfo || 'Karya spesial yang cuma bisa dibuka lewat kode akses. Hubungi lewat sosial media di bawah buat dapetin aksesnya.';

  const socialEl = el('socialLinks');
  socialEl.innerHTML = '';
  if (p.social) {
    Object.entries(p.social).forEach(([key, val]) => {
      if (!val) return;
      const a = document.createElement('a');
      a.href = key === 'email' ? `mailto:${val}` : val;
      a.target = '_blank';
      a.rel = 'noopener';
      a.title = key.charAt(0).toUpperCase() + key.slice(1);
      a.className = 'social-icon';
      a.innerHTML = SOCIAL_ICONS[key.toLowerCase()] || GENERIC_ICON;
      socialEl.appendChild(a);
    });
  }
}

// ============ NAVIGASI ============
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  el('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
  window.scrollTo(0, 0);
  el('navWrap').classList.remove('open');
  el('hamburgerBtn').classList.remove('open');
  document.body.classList.remove('nav-open');
  if (name === 'guestbook') loadGuestbook();
}

// ============ KARYA / GALERI ============
async function loadWorks() {
  const res = await fetch('/api/works');
  state.works = await res.json();
  renderGrid();
  renderHeroCollage();
  renderExclusive();
  renderSongList();
}

async function loadProducts() {
  const res = await fetch('/api/products');
  state.products = await res.json();
  renderShop();
}

function filteredHomeWorks() {
  let list = state.works;
  if (state.activeFilter) list = list.filter(w => w.type === state.activeFilter);
  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    list = list.filter(w => w.title.toLowerCase().includes(q) || (w.description || '').toLowerCase().includes(q));
  }
  list = [...list];
  if (state.sort === 'popular') list.sort((a, b) => b.views - a.views);
  else if (state.sort === 'liked') list.sort((a, b) => b.likes - a.likes);
  else list.sort((a, b) => b.createdAt - a.createdAt);
  return list;
}

function renderGrid() {
  const grid = el('worksGrid');
  const list = filteredHomeWorks();
  grid.innerHTML = '';
  const emptyEl = el('emptyState');
  emptyEl.classList.toggle('hidden', list.length > 0);
  emptyEl.textContent = state.search.trim()
    ? `Nggak ada karya yang cocok dengan "${state.search.trim()}".`
    : 'Belum ada karya di kategori ini. Unggah karya pertamamu.';
  list.forEach(w => grid.appendChild(makeCard(w)));
  bindCardActions(grid);
}

function makeCard(w) {
  const card = document.createElement('div');
  card.className = 'card';
  const locked = w.exclusive && !w.unlocked;
  const isDraft = w.status === 'draft';
  card.innerHTML = `
    <div class="tape"></div>
    ${thumbHTML(w)}
    ${w.exclusive ? `<span class="lock-badge">${locked ? '&#128274; ' + rupiah(w.price) : '&#10003; Terbuka'}</span>` : ''}
    ${isDraft ? `<span class="draft-badge">Draft</span>` : ''}
    <span class="card-type">${w.type.toUpperCase()}</span>
    <h4>${escapeHTML(w.title)}</h4>
    <p>${escapeHTML(w.description || '')}</p>
    <div class="card-meta">
      <span>&#128065; ${w.views}</span>
      <button class="like-btn ${w.liked ? 'liked' : ''}" data-id="${w.id}">${w.liked ? '&#9829;' : '&#9825;'} <span>${w.likes}</span></button>
      ${state.loggedIn ? `<button class="publish-toggle-btn" data-id="${w.id}" data-status="${w.status || 'published'}">${isDraft ? 'Publish' : 'Jadikan Draft'}</button>` : ''}
      ${state.loggedIn ? `<button class="del-btn" data-id="${w.id}">Hapus</button>` : ''}
    </div>
  `;
  card.addEventListener('click', (e) => {
    if (e.target.closest('.like-btn') || e.target.closest('.del-btn') || e.target.closest('.publish-toggle-btn')) return;
    openWork(w.id);
  });
  return card;
}

function bindCardActions(scope) {
  scope.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const res = await fetch(`/api/works/${id}/like`, { method: 'POST' });
      const data = await res.json();
      const w = state.works.find(x => x.id === id);
      if (w) { w.likes = data.likes; w.liked = data.liked; }
      btn.classList.toggle('liked', data.liked);
      btn.innerHTML = `${data.liked ? '&#9829;' : '&#9825;'} <span>${data.likes}</span>`;
    });
  });
  scope.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Hapus karya ini?')) return;
      await fetch(`/api/works/${btn.dataset.id}`, { method: 'DELETE' });
      loadWorks();
    });
  });
  scope.querySelectorAll('.publish-toggle-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const newStatus = btn.dataset.status === 'draft' ? 'published' : 'draft';
      const body = new URLSearchParams({ status: newStatus });
      await fetch(`/api/works/${btn.dataset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      loadWorks();
      showToast(newStatus === 'published' ? 'Karya dipublish.' : 'Karya dijadikan draft.');
    });
  });
}

function thumbHTML(w) {
  if (w.type === 'sketsa' && w.filename) {
    return `<img class="card-thumb" src="/uploads/${w.filename}" alt="${escapeHTML(w.title)}">`;
  }
  if (w.thumbnail) {
    return `<img class="card-thumb" src="/uploads/${w.thumbnail}" alt="${escapeHTML(w.title)}">`;
  }
  if (w.exclusive && !w.unlocked) {
    return `<div class="card-thumb locked-thumb">&#128274;</div>`;
  }
  const label = { tulisan: 'Naskah', lagu: 'Rekaman Audio', video: 'Rekaman Video' }[w.type] || 'Karya';
  return `<div class="card-thumb">${label}</div>`;
}

function renderHeroCollage() {
  const wrap = el('heroCollage');
  wrap.innerHTML = '';
  const withImg = state.works.filter(w => w.type === 'sketsa' && w.filename || w.thumbnail).slice(0, 6);
  if (withImg.length === 0) return;

  const positions = [
    { top: '8%', left: '6%', w: 190, rot: -6 },
    { top: '55%', left: '3%', w: 150, rot: 4 },
    { top: '15%', left: '78%', w: 170, rot: 5 },
    { top: '60%', left: '80%', w: 200, rot: -4 },
    { top: '4%', left: '42%', w: 130, rot: -2 },
    { top: '70%', left: '45%', w: 150, rot: 3 }
  ];

  withImg.forEach((s, i) => {
    const pos = positions[i % positions.length];
    const src = s.type === 'sketsa' ? s.filename : s.thumbnail;
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.style.top = pos.top;
    tile.style.left = pos.left;
    tile.style.width = pos.w + 'px';
    tile.style.height = (pos.w * 0.75) + 'px';
    tile.style.transform = `rotate(${pos.rot}deg)`;
    tile.style.backgroundImage = `url(/uploads/${src})`;
    wrap.appendChild(tile);
  });
}

// ============ EKSKLUSIF ============
function renderExclusive() {
  const grid = el('exclusiveGrid');
  const list = state.works.filter(w => w.exclusive);
  grid.innerHTML = '';
  el('exclusiveEmpty').classList.toggle('hidden', list.length > 0);
  list.forEach(w => grid.appendChild(makeCard(w)));
  bindCardActions(grid);
}

// ============ SONG LIST ============
function renderSongList() {
  const wrap = el('songList');
  const list = state.works.filter(w => w.type === 'lagu');
  wrap.innerHTML = '';
  el('songEmpty').classList.toggle('hidden', list.length > 0);
  list.forEach((w, i) => {
    const row = document.createElement('div');
    row.className = 'song-row';
    const locked = w.exclusive && !w.unlocked;
    row.innerHTML = `
      <span class="song-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="song-thumb">${w.thumbnail ? `<img src="/uploads/${w.thumbnail}" alt="">` : '&#9834;'}</div>
      <div class="song-info">
        <h4>${escapeHTML(w.title)}${w.exclusive ? (locked ? ' &#128274;' : ' &#10003;') : ''}</h4>
        <p>${escapeHTML(w.description || '')}</p>
      </div>
      <div class="song-meta">
        <span>&#128065; ${w.views}</span>
        <button class="like-btn ${w.liked ? 'liked' : ''}" data-id="${w.id}">${w.liked ? '&#9829;' : '&#9825;'} <span>${w.likes}</span></button>
      </div>
    `;
    row.addEventListener('click', (e) => {
      if (e.target.closest('.like-btn')) return;
      openWork(w.id);
    });
    wrap.appendChild(row);
  });
  bindCardActions(wrap);
}

// ============ SHOP ============
function renderShop() {
  const grid = el('shopGrid');
  grid.innerHTML = '';
  el('shopEmpty').classList.toggle('hidden', state.products.length > 0);
  state.products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      ${p.image ? `<img class="product-thumb" src="/uploads/${p.image}" alt="${escapeHTML(p.name)}">` : `<div class="product-thumb placeholder">Produk</div>`}
      <h4>${escapeHTML(p.name)}</h4>
      <p class="product-price">${rupiah(p.price)}</p>
      <p class="product-desc">${escapeHTML(p.description || '')}</p>
      <div class="product-actions">
        ${p.link ? `<a class="solid-btn" href="${p.link}" target="_blank" rel="noopener">Beli</a>` : ''}
        ${state.loggedIn ? `<button class="del-btn" data-id="${p.id}">Hapus</button>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });
  grid.querySelectorAll('.del-btn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Hapus produk ini?')) return;
      await fetch(`/api/products/${btn.dataset.id}`, { method: 'DELETE' });
      loadProducts();
    };
  });
}

// ============ LIHAT KARYA (fullscreen) ============
async function openWork(id) {
  let w = state.works.find(x => x.id === id);
  if (!w) return;
  currentModalWork = w;

  fetch(`/api/works/${id}/view`, { method: 'POST' }).then(async (res) => {
    const data = await res.json();
    w.views = data.views;
    document.querySelectorAll(`[data-id="${id}"]`).forEach(b => {});
  });

  renderModal(w);
  el('viewModal').classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function renderModal(w) {
  el('viewType').textContent = w.type.toUpperCase();
  const mediaWrap = el('viewMediaWrap');
  const bottom = el('viewBottom');
  const locked = w.exclusive && !w.unlocked;

  if (locked) {
    mediaWrap.innerHTML = `
      <div class="lock-pane">
        <div class="lock-icon">&#128274;</div>
        <p>Karya ini eksklusif. Harga: <strong>${rupiah(w.price)}</strong></p>
        <p class="lock-hint">Hubungi lewat sosial media di footer buat cara pembayaran, lalu masukkan kode akses yang dikasih di bawah ini.</p>
        <div class="unlock-form">
          <input type="text" id="unlockCodeInput" placeholder="Masukkan kode akses">
          <button class="solid-btn" id="unlockSubmitBtn">Buka</button>
        </div>
        <p class="error-text hidden" id="unlockError"></p>
      </div>
    `;
    el('unlockSubmitBtn').onclick = () => doUnlock(w.id);
    el('unlockCodeInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') doUnlock(w.id); });
  } else {
    mediaWrap.innerHTML = mediaHTMLFor(w);
    if (w.type === 'tulisan') loadTextInto(mediaWrap, w);
  }

  bottom.innerHTML = `
    <h2 class="view-title">${escapeHTML(w.title)}</h2>
    <p class="view-desc">${escapeHTML(w.description || '')}</p>
    <div class="card-meta">
      <span>&#128065; ${w.views}</span>
      <button class="like-btn ${w.liked ? 'liked' : ''}" data-id="${w.id}">${w.liked ? '&#9829;' : '&#9825;'} <span>${w.likes}</span></button>
      <button class="share-btn" id="shareBtn">&#128279; Salin Link</button>
    </div>
    <div class="related-wrap" id="relatedWrap"></div>
    <div class="comments-wrap">
      <h4 class="comments-title">Komentar</h4>
      <div class="comment-form">
        <input type="text" id="commentName" placeholder="Nama kamu (boleh kosong)">
        <textarea id="commentMessage" placeholder="Tulis komentar..." rows="2"></textarea>
        <button class="solid-btn" id="commentSubmitBtn">Kirim Komentar</button>
        <p class="error-text hidden" id="commentError"></p>
      </div>
      <div class="comments-list" id="commentsList"></div>
    </div>
  `;
  bindCardActions(bottom);
  el('shareBtn').addEventListener('click', () => shareWork(w.id));
  el('commentSubmitBtn').addEventListener('click', () => submitComment(w.id));
  loadComments(w.id);
  loadRelated(w.id);
}

async function loadComments(workId) {
  const listEl = el('commentsList');
  listEl.innerHTML = '<p class="muted-text">Memuat komentar...</p>';
  const res = await fetch(`/api/works/${workId}/comments`);
  const comments = await res.json();
  if (comments.length === 0) {
    listEl.innerHTML = '<p class="muted-text">Belum ada komentar. Jadilah yang pertama.</p>';
    return;
  }
  listEl.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-head">
        <strong>${escapeHTML(c.name)}</strong>
        <span class="comment-date">${timeAgo(c.createdAt)}</span>
        ${state.loggedIn ? `<button class="del-comment-btn" data-id="${c.id}">Hapus</button>` : ''}
      </div>
      <p>${escapeHTML(c.message)}</p>
    </div>
  `).join('');
  listEl.querySelectorAll('.del-comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/comments/${btn.dataset.id}`, { method: 'DELETE' });
      loadComments(workId);
    });
  });
}

async function submitComment(workId) {
  const name = el('commentName').value.trim();
  const message = el('commentMessage').value.trim();
  const errorEl = el('commentError');
  if (!message) {
    errorEl.textContent = 'Komentar nggak boleh kosong.';
    errorEl.classList.remove('hidden');
    return;
  }
  const res = await fetch(`/api/works/${workId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message })
  });
  if (!res.ok) {
    const data = await res.json();
    errorEl.textContent = data.error || 'Gagal mengirim komentar.';
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');
  el('commentMessage').value = '';
  loadComments(workId);
}

async function loadRelated(workId) {
  const wrap = el('relatedWrap');
  const res = await fetch(`/api/works/${workId}/related`);
  const related = await res.json();
  if (related.length === 0) {
    wrap.innerHTML = '';
    return;
  }
  wrap.innerHTML = `
    <h4 class="related-title">Karya lain yang mungkin kamu suka</h4>
    <div class="related-list">
      ${related.map(w => `
        <div class="related-item" data-id="${w.id}">
          ${thumbHTML(w)}
          <span class="related-item-title">${escapeHTML(w.title)}</span>
        </div>
      `).join('')}
    </div>
  `;
  wrap.querySelectorAll('.related-item').forEach(item => {
    item.addEventListener('click', () => openWork(item.dataset.id));
  });
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return new Date(ts).toLocaleDateString('id-ID');
}

async function shareWork(id) {
  const url = `${location.origin}${location.pathname}?work=${id}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link karya disalin ke clipboard!');
  } catch {
    showToast(url);
  }
}

function showToast(msg) {
  const t = el('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 300);
  }, 2600);
}

function mediaHTMLFor(w) {
  const src = `/uploads/${w.filename}`;
  if (w.type === 'sketsa') return `<img class="view-media view-media-img" src="${src}">`;
  if (w.type === 'lagu') return `
    <div class="audio-pane">
      ${w.thumbnail ? `<img class="audio-art" src="/uploads/${w.thumbnail}">` : `<div class="audio-art placeholder">&#9834;</div>`}
      <audio class="view-media" controls src="${src}"></audio>
    </div>`;
  if (w.type === 'video') return `<video class="view-media view-media-video" controls src="${src}"></video>`;
  return `<div class="read-pane" id="readPane">Memuat naskah...</div>`;
}

async function loadTextInto(mediaWrap, w) {
  const ext = (w.originalName || '').split('.').pop().toLowerCase();
  const pane = mediaWrap.querySelector('#readPane');
  if (!pane) return;
  if (ext === 'txt' || ext === 'md') {
    try {
      const res = await fetch(`/uploads/${w.filename}`);
      const text = await res.text();
      pane.textContent = text;
    } catch {
      pane.textContent = 'Gagal memuat naskah.';
    }
  } else {
    pane.innerHTML = `<p>Format file ini (.${ext}) belum bisa ditampilkan langsung.</p><a class="solid-btn" href="/uploads/${w.filename}" download>Unduh Naskah</a>`;
  }
}

async function doUnlock(id) {
  const code = el('unlockCodeInput').value.trim();
  const errorEl = el('unlockError');
  if (!code) return;
  const res = await fetch(`/api/works/${id}/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  const data = await res.json();
  if (!res.ok) {
    errorEl.textContent = data.error || 'Kode salah.';
    errorEl.classList.remove('hidden');
    return;
  }
  const idx = state.works.findIndex(x => x.id === id);
  if (idx !== -1) state.works[idx] = data;
  currentModalWork = data;
  renderModal(data);
  renderGrid();
  renderExclusive();
  renderSongList();
}

function closeModal() {
  el('viewModal').classList.add('hidden');
  document.body.classList.remove('modal-open');
  currentModalWork = null;
}

// ============ UI BINDING ============
function bindUI() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.nav));
  });

  el('hamburgerBtn').onclick = () => {
    el('navWrap').classList.toggle('open');
    el('hamburgerBtn').classList.toggle('open');
    document.body.classList.toggle('nav-open');
  };
  document.addEventListener('click', (e) => {
    const navWrap = el('navWrap');
    if (!navWrap.classList.contains('open')) return;
    if (navWrap.contains(e.target) || el('hamburgerBtn').contains(e.target)) return;
    navWrap.classList.remove('open');
    el('hamburgerBtn').classList.remove('open');
    document.body.classList.remove('nav-open');
  });

  el('loginBtn').onclick = () => el('loginModal').classList.remove('hidden');
  el('cancelLogin').onclick = () => el('loginModal').classList.add('hidden');
  el('cancelLogin2').onclick = () => el('loginModal').classList.add('hidden');
  el('submitLogin').onclick = doLogin;
  el('passwordInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

  el('logoutBtn').onclick = async () => {
    await fetch('/api/logout', { method: 'POST' });
    state.loggedIn = false;
    updateAuthUI();
    loadWorks();
    loadProducts();
  };

  el('uploadBtn').onclick = () => el('uploadModal').classList.remove('hidden');
  el('cancelUpload').onclick = () => el('uploadModal').classList.add('hidden');
  el('cancelUpload2').onclick = () => el('uploadModal').classList.add('hidden');
  el('submitUpload').onclick = doUpload;
  el('workExclusive').addEventListener('change', (e) => {
    el('exclusiveFields').classList.toggle('hidden', !e.target.checked);
  });

  el('addProductBtn').onclick = () => el('productModal').classList.remove('hidden');
  el('cancelProduct').onclick = () => el('productModal').classList.add('hidden');
  el('cancelProduct2').onclick = () => el('productModal').classList.add('hidden');
  el('submitProduct').onclick = doAddProduct;

  el('closeView').onclick = closeModal;
  el('viewModal').addEventListener('click', (e) => { if (e.target.id === 'viewModal') closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.dataset.type;
      renderGrid();
    });
  });

  let searchDebounce;
  el('searchInput').addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.search = e.target.value;
      renderGrid();
    }, 200);
  });
  el('sortSelect').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderGrid();
  });

  el('guestSubmitBtn').addEventListener('click', submitGuestbook);
  el('newsletterForm').addEventListener('submit', submitNewsletter);
}

async function doLogin() {
  const password = el('passwordInput').value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if (!res.ok) {
    const data = await res.json();
    el('loginError').textContent = data.error;
    el('loginError').classList.remove('hidden');
    return;
  }
  el('loginModal').classList.add('hidden');
  el('passwordInput').value = '';
  el('loginError').classList.add('hidden');
  state.loggedIn = true;
  updateAuthUI();
  loadWorks();
  loadProducts();
}

async function doUpload() {
  const title = el('workTitle').value.trim();
  const type = el('workType').value;
  const description = el('workDescription').value.trim();
  const fileInput = el('workFile');
  const thumbInput = el('workThumbnail');
  const isExclusive = el('workExclusive').checked;
  const price = el('workPrice').value;
  const accessCode = el('workAccessCode').value.trim();
  const isDraft = el('workDraft').checked;
  const errorEl = el('uploadError');

  if (!title || !fileInput.files[0]) {
    errorEl.textContent = 'Judul dan file wajib diisi.';
    errorEl.classList.remove('hidden');
    return;
  }
  if (isExclusive && !accessCode) {
    errorEl.textContent = 'Karya eksklusif wajib punya kode akses.';
    errorEl.classList.remove('hidden');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('type', type);
  formData.append('description', description);
  formData.append('file', fileInput.files[0]);
  if (thumbInput.files[0]) formData.append('thumbnail', thumbInput.files[0]);
  if (isExclusive) {
    formData.append('exclusive', 'true');
    formData.append('price', price);
    formData.append('accessCode', accessCode);
  }
  formData.append('status', isDraft ? 'draft' : 'published');

  const res = await fetch('/api/works', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json();
    errorEl.textContent = data.error || 'Gagal mengunggah karya.';
    errorEl.classList.remove('hidden');
    return;
  }

  el('uploadModal').classList.add('hidden');
  errorEl.classList.add('hidden');
  el('workTitle').value = '';
  el('workDescription').value = '';
  fileInput.value = '';
  thumbInput.value = '';
  el('workExclusive').checked = false;
  el('exclusiveFields').classList.add('hidden');
  el('workPrice').value = '';
  el('workAccessCode').value = '';
  el('workDraft').checked = false;
  loadWorks();
}

async function doAddProduct() {
  const name = el('productName').value.trim();
  const price = el('productPrice').value;
  const description = el('productDescription').value.trim();
  const link = el('productLink').value.trim();
  const imageInput = el('productImage');
  const errorEl = el('productError');

  if (!name || !price) {
    errorEl.textContent = 'Nama dan harga produk wajib diisi.';
    errorEl.classList.remove('hidden');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  formData.append('description', description);
  formData.append('link', link);
  if (imageInput.files[0]) formData.append('image', imageInput.files[0]);

  const res = await fetch('/api/products', { method: 'POST', body: formData });
  if (!res.ok) {
    const data = await res.json();
    errorEl.textContent = data.error || 'Gagal menambah produk.';
    errorEl.classList.remove('hidden');
    return;
  }

  el('productModal').classList.add('hidden');
  errorEl.classList.add('hidden');
  el('productName').value = '';
  el('productPrice').value = '';
  el('productDescription').value = '';
  el('productLink').value = '';
  imageInput.value = '';
  loadProducts();
}

// ============ BUKU TAMU ============
async function loadGuestbook() {
  const listEl = el('guestbookList');
  listEl.innerHTML = '<p class="muted-text">Memuat pesan...</p>';
  const res = await fetch('/api/guestbook');
  const entries = await res.json();
  el('guestbookEmpty').classList.toggle('hidden', entries.length > 0);
  listEl.innerHTML = entries.map(g => `
    <div class="comment-item">
      <div class="comment-head">
        <strong>${escapeHTML(g.name)}</strong>
        <span class="comment-date">${timeAgo(g.createdAt)}</span>
        ${state.loggedIn ? `<button class="del-comment-btn" data-id="${g.id}">Hapus</button>` : ''}
      </div>
      <p>${escapeHTML(g.message)}</p>
    </div>
  `).join('');
  listEl.querySelectorAll('.del-comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await fetch(`/api/guestbook/${btn.dataset.id}`, { method: 'DELETE' });
      loadGuestbook();
    });
  });
}

async function submitGuestbook() {
  const name = el('guestName').value.trim();
  const message = el('guestMessage').value.trim();
  const errorEl = el('guestError');
  if (!message) {
    errorEl.textContent = 'Pesan nggak boleh kosong.';
    errorEl.classList.remove('hidden');
    return;
  }
  const res = await fetch('/api/guestbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, message })
  });
  if (!res.ok) {
    const data = await res.json();
    errorEl.textContent = data.error || 'Gagal mengirim pesan.';
    errorEl.classList.remove('hidden');
    return;
  }
  errorEl.classList.add('hidden');
  el('guestName').value = '';
  el('guestMessage').value = '';
  loadGuestbook();
  showToast('Pesan terkirim, makasih ya!');
}

// ============ NEWSLETTER ============
async function submitNewsletter(e) {
  e.preventDefault();
  const emailInput = el('newsletterEmail');
  const msgEl = el('newsletterMsg');
  const res = await fetch('/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: emailInput.value.trim() })
  });
  const data = await res.json();
  msgEl.classList.remove('hidden');
  if (!res.ok) {
    msgEl.textContent = data.error || 'Gagal mendaftar.';
    msgEl.classList.add('error-text');
    return;
  }
  msgEl.classList.remove('error-text');
  msgEl.textContent = data.alreadySubscribed ? 'Email ini udah terdaftar.' : 'Terima kasih! Kamu bakal dikabarin kalau ada karya baru.';
  emailInput.value = '';
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
