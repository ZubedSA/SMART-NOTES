# Smart Notes Backend API (NestJS)

Backend API bertaraf enterprise untuk **Smart Notes Management System** menggunakan arsitektur modular NestJS dan terhubung ke Google Spreadsheet serta Google Drive via Google Apps Script Bridge.

## Fitur Utama
- **Autentikasi JWT & Refresh Token**: Login dengan peran (Role Permission: Admin, Manager, Staff, Viewer).
- **REST API Lengkap**: Mengcover seluruh endpoint yang dibutuhkan frontend (`/auth`, `/users`, `/dashboard`, `/notes`, `/categories`, `/labels`, `/meeting`, `/meeting-members`, `/meeting-task`, `/task`, `/agenda`, `/calendar`, `/search`, `/upload`, `/report`, `/logs`, `/settings`).
- **Google Bridge Service**: Berkomunikasi langsung dengan Web App URL dari Google Apps Script untuk menyimpan data di Google Sheet & berkas di Google Drive. Punya mekanisme Fallback In-Memory siap pakai untuk uji coba tanpa koneksi internet.

## Cara Menjalankan

1. Buka terminal di folder ini (`d:\WEB\SMART-NOTES\backend`).
2. Install dependensi:
   ```bash
   npm install
   ```
3. Sesuaikan file `.env` dengan Web App URL dari Google Apps Script Anda (jika sudah di-deploy).
4. Jalankan mode pengembangan:
   ```bash
   npm run start:dev
   ```
   API akan berjalan di port `3001` (misal: `http://localhost:3001`).
