# Task Management Application
Aplikasi Task Management berbasis mobile yang dibangun menggunakan:
- **Flutter** (Frontend)
- **Express.js** (Backend API)

Proyek ini dikembangkan dengan pendekatan contract-first, di mana API contract menjadi acuan utama sebelum implementasi backend dan frontend.

## 📂 Project Structure
```
task-management/
├── backend/        # API Express.js
├── frontend/       # Aplikasi mobile Flutter
├── docs/           # API contract & dokumentasi teknis
```

## 📜 API Contract
Seluruh endpoint API WAJIB mengikuti OpenAPI contract yang telah ditentukan:

📄 `docs/api-contract.yaml`

> ❗Dilarang mengubah perilaku API backend atau frontend tanpa memperbarui API contract terlebih dahulu.


## 🔀 Alur Kerja Git (Git Workflow)
- Branch `main` adalah protected branch
- Tidak diperbolehkan melakukan push langsung ke `main`
- Semua perubahan harus melalui Pull Request
- 1 fitur = 1 Pull Request

## 🚫 Aturan Pengembangan
- Tidak diperbolehkan melakukan coding langsung di server production
- Backend dan frontend harus mengikuti API contract
- File environment (.env) tidak boleh di-commit ke repository


## 🚀 Development Flow
1. Perbarui API contract (jika diperlukan)
2. Implementasi fitur di backend
3. Implementasi fitur di frontend
4. Review dan merge Pull Request