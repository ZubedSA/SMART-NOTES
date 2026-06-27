# Smart Notes Management System (Enterprise Grade)

Sistem manajemen catatan modern bergaya eksekutif yang tidak hanya menyimpan catatan, tetapi juga mengelola agenda rapat, tindak lanjut (action items), penugasan (tasks), dokumentasi, reminder, dan laporan. Dirancang dengan konsep **Mobile First** yang mulus di perangkat handphone serta tampil profesional di tablet dan desktop enterprise.

---

## 🎨 Arsitektur & Spesifikasi Teknologi

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui design tokens, Lucide Icons, Framer Motion, TanStack Query, React Hook Form, PWA ready.
- **Backend**: NestJS dengan Modular Clean Architecture, JWT Authentication, Role-Based Access Control (Admin, Manager, Staff, Viewer), Validation Pipe.
- **Database & Storage**: Google Spreadsheet (15 Sheet relasional) dan Google Drive via **Google Apps Script Bridge API** (`Code.gs`).

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Setup Database (Google Apps Script)
1. Buka folder `/google-apps-script` dan ikuti panduan di `README_GAS_SETUP.md`.
2. Salin kode `Code.gs` ke Apps Script Anda, deploy sebagai **Web App** (Anyone / Siapa saja).
3. Salin URL Web App yang dihasilkan.

### 2. Menjalankan Backend API (NestJS)
1. Masuk ke folder backend:
   ```bash
   cd backend
   npm install
   ```
2. Buat file `.env` atau edit yang ada, masukkan URL GAS Anda:
   ```env
   PORT=3001
   JWT_SECRET=super_secret_jwt_key_enterprise_grade_2026
   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
   ```
3. Jalankan server backend:
   ```bash
   npm run start:dev
   ```

### 3. Menjalankan Frontend Web (Next.js)
1. Masuk ke folder frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Pastikan file `.env.local` menunjuk ke URL backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
3. Jalankan aplikasi web:
   ```bash
   npm run dev
   ```
4. Buka browser di `http://localhost:3000`.

---

## 🔑 Akun Login Demo Enterprise
Sistem sudah dilengkapi dengan fallback data demo interaktif sehingga Anda dapat langsung mencoba seluruh fitur bahkan sebelum menghubungkan skrip Google Sheet:
- **Admin**: `admin@smart.id` / `password123`
- **Manager**: `manager@smart.id` / `password123`
- **Staff**: `staff@smart.id` / `password123`
