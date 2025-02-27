const fetch = require("node-fetch");

const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY; // Ambil API Key dari environment

async function translateMyMemory(text, sourceLang, targetLang) {
    // Jika API key tersedia, tambahkan ke URL
    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : "";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}${keyParam}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            console.error("Error dalam data API:", data);
            throw new Error("Gagal mendapatkan terjemahan.");
        }
    } catch (error) {
        console.error("Error saat menerjemahkan:", error.message);
        return text; // Kembalikan teks asli jika terjadi error
    }
}

module.exports = { translateMyMemory };
