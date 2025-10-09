# Portofolio Pribadi - Fatony Ahmad Fauzi

Ini adalah repositori untuk situs web portofolio pribadi saya, yang menampilkan proyek-proyek, keahlian, dan informasi kontak saya. Situs ini dirancang untuk menjadi dinamis, responsif, dan multibahasa.

**[Kunjungi Situs Langsung](https://fatonyahmadfauzi.me/)**

## ✨ Fitur Utama

- **🌐 Dukungan Multibahasa**: Diterjemahkan ke dalam 11 bahasa menggunakan Netlify Functions dan API terjemahan eksternal.
- **🌓 Mode Terang & Gelap**: Tema berubah secara otomatis berdasarkan waktu atau dapat diubah secara manual oleh pengguna.
- **🚀 Backend Serverless**: Menggunakan Netlify Functions untuk mengambil commit terbaru dari GitHub dan menangani logika terjemahan.
- **📱 Desain Responsif**: Tampilan yang dioptimalkan untuk berbagai ukuran layar, dari ponsel hingga desktop.
- **📝 Formulir Kontak**: Formulir kontak yang berfungsi penuh dan terintegrasi dengan layanan backend untuk mengirim email.
- **SEO & Performa**: Dioptimalkan untuk mesin pencari dengan tag meta yang relevan, `sitemap.xml`, `robots.txt`, dan header keamanan yang ketat.
- **♿ Aksesibilitas**: Menyediakan fallback untuk pengguna yang menonaktifkan JavaScript.

## 🛠️ Teknologi yang Digunakan

- **Frontend**:

  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - [Bootstrap 5](https://getbootstrap.com/)
  - [Bootstrap Icons](https://icons.getbootstrap.com/)
  - [Flag Icon CSS](https://github.com/lipis/flag-icon-css)

- **Backend (Serverless)**:

  - [Netlify Functions](https://www.netlify.com/products/functions/)
  - [Node.js](https://nodejs.org/)
  - [node-fetch](https://www.npmjs.com/package/node-fetch) untuk permintaan API.

- **Platform & Layanan**:
  - **Hosting**: [Netlify](https://www.netlify.com/)
  - **Version Control**: [GitHub](https://github.com/)
  - **API**:
    - GitHub API (untuk mengambil commit)
    - MyMemory API, Google Apps Script, Hugging Face API (untuk terjemahan)

## 📂 Struktur Proyek

Struktur folder proyek diatur untuk memisahkan antara _konfigurasi_, _kode sisi server_, dan _aset publik_.

```bash
/
├── .github/            # Konfigurasi GitHub Actions (jika ada)
├── .gitignore          # File yang diabaikan oleh Git
├── .htaccess           # Konfigurasi server Apache
├── .nvmrc              # Versi Node.js yang direkomendasikan
├── functions/          # Kode backend (Netlify Functions)
│ ├── getCommits.js     # Fungsi untuk mengambil commit dari GitHub
│ └── translate.js      # Fungsi untuk menangani terjemahan
├── netlify.toml        # Konfigurasi Netlify
├── node_modules/       # Dependensi Node.js
├── package.json        # Informasi proyek dan dependensi
├── package-lock.json   # Versi dependensi yang terkunci
├── public/             # Folder utama untuk aset frontend
│ ├── assets/           # Gambar, ikon, dan video
│ ├── css/              # File CSS
│ ├── js/               # File JavaScript
│ ├── lang/             # File terjemahan JSON
│ ├── js-function/      # Halaman fallback jika JavaScript dinonaktifkan
│ ├── index.html        # Halaman utama
│ └── ...
└── README.md           # Dokumentasi ini
```

## 🚀 Instalasi dan Menjalankan Secara Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

1.  **Clone Repositori**

    ```bash
    git clone [https://github.com/nama-pengguna-anda/nama-repositori-anda.git](https://github.com/nama-pengguna-anda/nama-repositori-anda.git)
    cd nama-repositori-anda
    ```

2.  **Gunakan Versi Node.js yang Tepat**
    Jika Anda menggunakan `nvm` (Node Version Manager), jalankan:

    ```bash
    nvm use
    ```

    Jika tidak, pastikan Anda menggunakan Node.js versi 22.2.0 atau lebih tinggi.

3.  **Instal Dependensi**
    Proyek ini menggunakan `npm` untuk manajemen paket.

    ```bash
    npm install
    ```

4.  **Konfigurasi Variabel Lingkungan**
    Buat file `.env` di direktori root dan tambahkan kunci API yang diperlukan. Lihat `.gitignore` untuk daftar variabel yang dikecualikan.

    ```
    GITHUB_TOKEN=token_github_anda
    HF_API_KEY=kunci_api_huggingface_anda
    MYMEMORY_API_KEY=kunci_api_mymemory_anda
    ```

5.  **Jalankan Server Pengembangan Lokal**
    Gunakan Netlify CLI untuk menjalankan server lokal yang juga akan menjalankan fungsi serverless.
    ```bash
    netlify dev
    ```
    Situs akan tersedia di `http://localhost:8888`.

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file `LICENSE.md` untuk detail lebih lanjut.
