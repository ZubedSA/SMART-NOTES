# Panduan Setup Google Apps Script & Google Spreadsheet

Dokumen ini berisi langkah demi langkah untuk mengonfigurasi Google Spreadsheet sebagai database utama dan Google Apps Script sebagai REST API Bridge untuk aplikasi **Smart Notes Management System**.

---

## 1. Pembuatan Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com) dan buat Spreadsheet baru dengan nama **`Smart Notes Database`**.
2. Buat **15 Sheet (Tab)** dengan tepat menggunakan nama-nama berikut (Perhatikan huruf besar/kecil):
   - `Users`
   - `Roles`
   - `Notes`
   - `Categories`
   - `Labels`
   - `Meetings`
   - `MeetingMembers`
   - `MeetingTasks`
   - `MeetingAttachments`
   - `Agenda`
   - `Tasks`
   - `TaskComments`
   - `Notifications`
   - `Logs`
   - `Settings`

---

## 2. Struktur Kolom (Header Row 1)

Pada baris pertama (Row 1) di setiap sheet, ketikkan nama kolom berikut:

### Sheet: `Users`
| id | email | password_hash | name | role_id | phone | avatar | created_at | updated_at |

### Sheet: `Roles`
| id | name | permissions | description |

### Sheet: `Notes`
| id | title | category | content | date | time | location | label | status | priority | visibility | is_favorite | is_archived | created_by | created_at | updated_at |

### Sheet: `Categories`
| id | name | slug | type | color |

### Sheet: `Labels`
| id | name | color |

### Sheet: `Meetings`
| id | title | date | time | location | moderator | notulen | agenda | discussion | decision | conclusion | status | created_at | updated_at |

### Sheet: `MeetingMembers`
| id | meeting_id | name | position | institution | email | phone | attendance_status |

### Sheet: `MeetingTasks` (Action Items)
| id | meeting_id | title | description | pic | deadline | priority | status | progress | created_at | updated_at |

### Sheet: `MeetingAttachments`
| id | meeting_id | file_name | file_url | drive_file_id | type | created_at |

### Sheet: `Agenda`
| id | title | date | time | location | category | description | reminder | status | created_at | updated_at |

### Sheet: `Tasks`
| id | title | category | pic | deadline | priority | status | reminder | created_at | updated_at |

### Sheet: `TaskComments`
| id | task_id | user_id | comment | created_at |

### Sheet: `Notifications`
| id | user_id | title | message | type | is_read | created_at |

### Sheet: `Logs`
| id | user_id | action | timestamp | ip | device |

### Sheet: `Settings`
| key | value | description |

---

## 3. Data Awal (Seeding)

Tambahkan data default berikut pada sheet **`Roles`**:
```
id      | name    | permissions | description
ROLE-1  | Admin   | ALL         | Akses penuh ke seluruh fitur dan master data
ROLE-2  | Manager | MANAGER     | Akses manajemen rapat, task, dan laporan
ROLE-3  | Staff   | STAFF       | Akses CRUD catatan pribadi dan task asignee
ROLE-4  | Viewer  | READ_ONLY   | Hanya dapat melihat laporan dan data umum
```

Tambahkan data default pada sheet **`Users`** (Password hash untuk `password123`):
```
id     | email             | password_hash                                                | name          | role_id | phone        | avatar | created_at
USR-1  | admin@smart.id    | $2b$10$X7.1a01... (akan digenerate otomatis oleh backend)      | Administrator | ROLE-1  | 081234567890 |        | 2026-01-01T00:00:00Z
```

---

## 4. Cara Deploy Google Apps Script

1. Di dalam Google Spreadsheet Anda, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus seluruh kode default yang ada di `Code.gs`, lalu salin (copy-paste) seluruh isi dari file **`Code.gs`** yang telah disediakan di folder ini.
3. Klik tombol **Save project (Simpan proyek)** (Ikon disket).
4. Klik tombol biru **Deploy (Terapkan)** di pojok kanan atas > Pilih **New deployment (Deployment baru)**.
5. Pada **Select type (Pilih jenis)**, klik ikon gerigi > Pilih **Web app (Aplikasi web)**.
6. Isi konfigurasi deployment:
   - **Description**: Smart Notes GAS Bridge v1
   - **Execute as**: **Me (Diri saya sendiri)**
   - **Who has access**: **Anyone (Siapa saja)** *(Sangat penting agar NestJS dapat mengakses API tanpa login Google)*.
7. Klik **Deploy**. Jika diminta otorisasi akses (Authorize access), berikan izin ke akun Google Anda (Klik Advanced / Lanjutan -> Go to Smart Notes (unsafe) -> Allow).
8. Salin **Web app URL** yang dihasilkan (berakhiran `/exec`).
9. Simpan URL tersebut ke dalam file konfigurasi `.env` di folder `/backend` dengan variabel:
   ```env
   GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```
