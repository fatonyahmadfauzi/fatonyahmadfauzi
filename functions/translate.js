const fetch = require("node-fetch");

const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY; // API Key dari environment variables

// Peta kode bahasa yang diterima dari pengguna ke format ISO 639-1 yang diharapkan oleh MyMemory
const LANGUAGE_MAP = {
    de: "de", en: "en", es: "es", fr: "fr", id: "id",
    jp: "ja", kr: "ko", pl: "pl", pt: "pt", ru: "ru", zh: "zh",
};

/**
 * Validasi dan ubah kode bahasa ke format yang sesuai dengan MyMemory
 * @param {string} lang - Kode bahasa dari input pengguna
 * @returns {string} - Kode bahasa yang valid untuk MyMemory
 */
function mapLanguage(lang) {
    if (!LANGUAGE_MAP[lang]) {
        console.warn(`Bahasa tidak didukung: ${lang}. Default ke 'en'.`);
        return "en"; // Default ke English jika bahasa tidak valid
    }
    return LANGUAGE_MAP[lang];
}

/**
 * Fungsi untuk menerjemahkan teks menggunakan MyMemory API
 * @param {string} text - Teks yang akan diterjemahkan
 * @param {string} sourceLang - Kode bahasa sumber (format input pengguna)
 * @param {string} targetLang - Kode bahasa target (format input pengguna)
 * @returns {Promise<string>} - Teks yang sudah diterjemahkan
 */
async function translateMyMemory(text, sourceLang, targetLang) {
    // Ubah kode bahasa menggunakan LANGUAGE_MAP
    sourceLang = mapLanguage(sourceLang);
    targetLang = mapLanguage(targetLang);

    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text; // Jika bahasa sama, kembalikan teks asli
    }

    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : ""; // Tambahkan API key jika tersedia
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}${keyParam}`;

    try {
        console.log(`Mengirim permintaan ke MyMemory API: ${url}`);
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Respons MyMemory API:", data);

        // Periksa respons API dan ambil teks terjemahan
        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            console.error("Error dalam data API:", data);
            throw new Error("Gagal mendapatkan terjemahan.");
        }
    } catch (error) {
        console.error("Error saat menerjemahkan:", error.message);
        return text; // Jika gagal, kembalikan teks asli
    }
}

module.exports = { translateMyMemory };
