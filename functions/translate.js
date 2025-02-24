const fetch = require("node-fetch");

const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY; // Ambil API Key dari Netlify Environment Variables

async function translateMyMemory(text, sourceLang, targetLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}&key=${MYMEMORY_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            throw new Error("Terjemahan gagal");
        }
    } catch (error) {
        console.error("Error saat menerjemahkan:", error);
        return text; // Jika gagal, kembalikan teks asli
    }
}

module.exports = { translateMyMemory };
