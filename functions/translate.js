const fetch = require("node-fetch");

const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY; // Ambil API Key dari environment variable

/**
 * Fungsi untuk menerjemahkan teks menggunakan MyMemory API
 * @param {string} text - Teks yang akan diterjemahkan
 * @param {string} sourceLang - Kode bahasa sumber (ISO 639-1)
 * @param {string} targetLang - Kode bahasa target (ISO 639-1)
 * @returns {Promise<string>} - Teks yang sudah diterjemahkan
 */
async function translateMyMemory(text, sourceLang, targetLang) {
    // Validasi bahasa sumber dan target
    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text; // Tidak perlu menerjemahkan
    }

    // Build URL untuk MyMemory API
    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : ""; // Tambahkan API key jika tersedia
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}${keyParam}`;

    try {
        console.log("Mengirim permintaan ke MyMemory API:", url);
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
