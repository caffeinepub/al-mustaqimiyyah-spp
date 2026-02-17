# Specification

## Summary
**Goal:** Ubah aplikasi menjadi full Bahasa Indonesia dan perbaiki dropdown Lembaga (SMP/SMA) agar selalu terisi dan tidak pernah kosong/silent, termasuk saat user belum punya profil.

**Planned changes:**
- Perbaiki backend listInstitutions() agar tidak gagal saat user terautentikasi belum memiliki user profile, dan selalu mengembalikan 2 lembaga predefined.
- Tambahkan/aktifkan logika backend agar bila store lembaga kosong, otomatis menyediakan: “SMP IT TAHFIDHIL QUR'AN AL-MUSTAQIMIYYAH” dan “SMA TAHFIDHIL QUR'AN AL-MUSTAQIMIYYAH”.
- Update validasi saveCallerUserProfile agar institutionId tervalidasi terhadap lembaga predefined tersebut dan tetap sesuai scoping berbasis role untuk user yang sudah punya profil.
- Lokalisasi seluruh UI frontend ke Bahasa Indonesia: navigasi, judul halaman, label/placeholder form, tombol, header tabel, badge, dialog, toast, empty/loading state, serta pesan validasi (hapus sisa teks Inggris).
- Lokalisasi format tanggal dan nominal: gunakan locale Indonesia (id-ID) untuk tanggal, dan format mata uang IDR secara konsisten (Rp, pemisah ribuan Indonesia).
- Pastikan semua dropdown/filter Lembaga di frontend (termasuk ProfileSetupModal dan form tambah/ubah siswa) selalu memuat opsi lembaga; tampilkan state “memuat” dan “error” dalam Bahasa Indonesia, dan bila data kosong tampilkan penjelasan dalam Bahasa Indonesia (bukan dropdown kosong tanpa konteks).

**User-visible outcome:** Aplikasi tampil full Bahasa Indonesia; dropdown Lembaga menampilkan opsi SMP & SMA secara andal di semua form/filter (dengan status memuat/error yang jelas), dan format tanggal serta rupiah mengikuti standar Indonesia.
