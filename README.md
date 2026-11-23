# Portofolio Kalingga Arundaya Priatna

Situs portofolio pribadi untuk menampilkan profil, pendekatan dalam membangun software, fokus pembelajaran, dan proyek-proyek yang telah dibuat. Situs ini dibuat dengan HTML, CSS, dan JavaScript tanpa framework atau proses build.

## Fitur

- Tampilan responsif untuk desktop dan perangkat mobile.
- Objek 3D interaktif berbasis Three.js dengan gyroscope, shell wireframe, cincin orbit, dan partikel.
- Daftar proyek dengan preview gambar yang mengikuti rasio asli gambar.
- Preview gambar dapat dibuka dalam ukuran besar dan diperbesar dengan kontrol zoom.
- Tautan menuju repositori GitHub pada setiap proyek.
- Animasi antarmuka yang menghormati preferensi reduced motion.

## Teknologi

- HTML
- CSS
- JavaScript
- Three.js 0.180.0 dan WebGL 2
- Google Fonts: Geist dan Geist Mono

Tidak ada instalasi npm atau langkah build yang diperlukan. Three.js dimuat dari jsDelivr; koneksi internet dibutuhkan untuk menampilkan scene 3D.

## Struktur Direktori

```text
.
├── assets/                 # Gambar preview proyek
├── code/
│   ├── main.js             # Data dan interaksi antarmuka
│   ├── module.js           # Scene 3D interaktif berbasis Three.js
│   ├── portofolio.html     # Halaman utama
│   └── style.css           # Gaya dan layout responsif
└── README.md
```

## Menjalankan Secara Lokal

1. Clone repositori:

   ```bash
   git clone https://github.com/arundaya24/portofolio.git
   cd portofolio
   ```

2. Jalankan server statis dari direktori repositori:

   ```bash
   python -m http.server 8000
   ```

3. Buka [http://localhost:8000/code/portofolio.html](http://localhost:8000/code/portofolio.html) di browser.

## Proyek

- [Website Pelaporan Kerusakan Jalan](https://github.com/arundaya24/aspara) — Website Laravel untuk melaporkan kerusakan jalan.
- [Website Penyampaian Aspirasi Masyarakat](https://github.com/arundaya24/titikkritis) — Website Laravel untuk menyampaikan aspirasi masyarakat.
- [AI Pengenal Gambar Berbasis Deep Learning](https://github.com/arundaya24/arun-d) — AI berbasis Python untuk mengenali gambar melalui website.
- [Website sablon](https://github.com/arundaya24/inkra) — Website menggunakan PHP Native untuk sablon pakaian.
- [Nigas](https://github.com/arundaya24/nigas) — Aplikasi Flutter untuk mencatat tugas sekolah.
- [DayMark](https://github.com/arundaya24/DayMark) — Jurnal harian Flutter dengan pencatatan mood, heatmap konsistensi, dan ekspor PDF.
- [Mimo: Virtual Pet Interaktif](https://github.com/arundaya24/mimo) — Virtual pet berbasis web dengan kepribadian dan perilaku interaktif.

## Kontak

- GitHub: [arundaya24](https://github.com/arundaya24)
- Email: [kalinggaarundayapriatna1@gmail.com](mailto:kalinggaarundayapriatna1@gmail.com)
