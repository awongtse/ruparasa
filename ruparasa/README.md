# RUPARASA

Website portofolio & blog pribadi untuk memamerkan karya — tulisan, lagu, video, dan sketsa.
Berjalan sebagai server lokal di PC-mu sendiri (Node.js), dengan login sederhana khusus untuk kamu sebagai pemilik.

## Yang kamu butuhkan
- **Node.js** (versi 18 ke atas). Cek dengan `node -v` di terminal. Kalau belum ada, unduh di https://nodejs.org

## Cara menjalankan (pertama kali)

1. Buka terminal / command prompt, masuk ke folder ini:
   ```
   cd ruparasa
   ```

2. Install semua library yang dibutuhkan:
   ```
   npm install
   ```

3. Salin file `.env.example` menjadi `.env`:
   - Windows (Command Prompt): `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`

4. Buka file `.env` dengan text editor, lalu ganti:
   - `ADMIN_PASSWORD` → password rahasiamu sendiri untuk login upload
   - `SESSION_SECRET` → teks acak sembarang (semakin panjang & acak semakin aman), contoh: `x9k2m-lorem-random-string-apapun-2026`

5. Jalankan servernya:
   ```
   npm start
   ```

6. Buka browser, kunjungi:
   ```
   http://localhost:3000
   ```

Selesai! Website-mu sudah jalan. Setiap kali mau membukanya lagi, cukup ulangi langkah 5 & 6 (install di langkah 2 cukup sekali di awal).

## Cara pakai

- **Isi profil**: buka file `data/profile.json`, edit langsung nama, tagline, bio, visi, misi, dan tautan sosial media kamu. Simpan file, lalu refresh browser.
- **Login untuk upload**: klik tombol "Masuk" di pojok kanan atas, masukkan password yang kamu set di `.env`.
- **Unggah karya**: setelah login, klik "+ Unggah Karya" — isi judul, kategori (tulisan/lagu/video/sketsa), deskripsi, lalu pilih file dari PC-mu.
- **Views & Likes**: otomatis bertambah — views saat karya dibuka, likes saat tombol hati diklik pengunjung.
- **Hapus karya**: saat login, tombol "Hapus" muncul di tiap kartu karya.

## Tentang penyimpanan file

Semua file yang kamu unggah tersimpan asli di folder `uploads/`, dan datanya (judul, jumlah likes/views, dll) tersimpan di `data/works.json`. Karena ini server lokal:
- Selama PC kamu menyalakan servernya (`npm start` sedang berjalan), website bisa diakses dari perangkat lain yang terhubung ke WiFi rumah yang sama — buka `http://<IP-lokal-PC-kamu>:3000` dari HP/laptop lain.
- Kalau server dimatikan (menutup terminal / mematikan PC), website tidak bisa diakses sampai kamu jalankan lagi.
- Ini memang dirancang untuk pemakaian pribadi/lokal — kalau nanti kamu mau website ini bisa diakses publik dari internet 24/7, itu perlu langkah tambahan (hosting cloud), dan aku bisa bantu kalau saatnya tiba.

## Batasan ukuran file

Saat ini batas ukuran per file diset 1GB (cukup longgar untuk video). Kalau mau diubah, cari baris `fileSize` di `server.js` (satuannya byte).

## Struktur folder
```
ruparasa/
├── server.js          # server & API
├── data/
│   ├── works.json      # daftar karya (otomatis terisi)
│   └── profile.json    # data profil kamu (edit manual)
├── uploads/            # file karya yang diunggah tersimpan di sini
└── public/              # tampilan website (HTML/CSS/JS)
```
