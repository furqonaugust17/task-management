# Backend API — Task Management

Backend API untuk aplikasi **Task Management**, dibangun menggunakan **Express.js** dan dikembangkan dengan pendekatan **contract-first**.

Backend ini berfungsi sebagai penyedia API untuk aplikasi mobile Flutter.

## 🎯 Tujuan Backend
- Menyediakan API yang konsisten dan terstruktur
- Mengimplementasikan API sesuai dengan OpenAPI contract
- Menjadi fondasi untuk fitur Task Management, Authentication, dan fitur lanjutan

## 📜 API Contract (WAJIB DIIKUTI)
Seluruh endpoint backend **HARUS** mengikuti OpenAPI contract berikut:

📄 `../docs/api-contract.yaml`

> ❗ Dilarang mengubah endpoint, request, atau response tanpa memperbarui API contract terlebih dahulu.


## 📂 Struktur Folder
```
backend/
├── src/
│ ├── app.js # Konfigurasi express & middleware
│ ├── server.js # Entry point server
│ ├── controllers/ # HTTP layer (request & response)
│ ├── services/ # Business logic
│ ├── repositories/ # Database access layer
│ ├── routes/ # Route definitions
│ ├── models/ # ORM / database models
│ ├── middlewares/ # Auth, validation, error handler
│ └── utils/ # Helper functions
│
├── package.json
└── README.md
```

📌 **Prinsip penting:**
- `controllers` → tidak berisi logic bisnis
- `services` → berisi logic utama
- `repositories` → hanya query database

## 🚀 Menjalankan Backend (Local)

### Install dependencies
```
npm install
```
### Jalankan server
```
npm run dev
```
Server akan berjalan di:
http://localhost:5000


### Health Check Endpoint
Endpoint ini digunakan untuk memastikan server berjalan dengan baik.
```
GET /health
```

Response:
```
{
  "status": "ok"
}
```
📌 **Endpoint ini:**
- Tidak menggunakan auth
- Tidak mengakses database
- Digunakan untuk Docker, CI, dan monitoring

## 🔀 Alur Pengembangan Backend
1. Update API contract (jika ada perubahan)
2. Implementasi fitur backend sesuai contract
3. Testing endpoint
4. Buat Pull Request
5. Review & merge ke main

## 🚫 Aturan Pengembangan
- Tidak diperbolehkan push langsung ke branch main
- Tidak boleh menambahkan fitur tanpa API contract
- File .env tidak boleh di-commit
- Jangan melakukan coding langsung di server production

## 📌 Catatan Lead
- Backend ini dibangun bertahap.
- Fokus pada stabilitas fondasi sebelum menambahkan fitur.