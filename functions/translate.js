const fetch = require("node-fetch");
const redis = require("redis");

const client = redis.createClient();
client.connect(); // Koneksi ke Redis

const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY;

const LANGUAGE_MAP = {
    de: "de", en: "en", es: "es", fr: "fr", id: "id",
    jp: "ja", kr: "ko", pl: "pl", pt: "pt", ru: "ru", zh: "zh",
};

// Fungsi utama dengan cache
async function translateWithCache(text, sourceLang, targetLang) {
    const cacheKey = `${sourceLang}-${targetLang}-${text}`;

    // Cek apakah terjemahan sudah ada di Redis
    const cachedTranslation = await client.get(cacheKey);
    if (cachedTranslation) {
        console.log("✅ Menggunakan hasil dari cache:", cachedTranslation);
        return cachedTranslation;
    }

    // Jika belum ada di cache, lanjutkan ke API
    const translation = await translate(text, sourceLang, targetLang);

    // Simpan hasil ke cache selama 1 hari (86400 detik)
    await client.setEx(cacheKey, 86400, translation);

    return translation;
}

// Fungsi untuk memilih API berdasarkan bahasa
async function translate(text, sourceLang, targetLang) {
    sourceLang = LANGUAGE_MAP[sourceLang] || "en";
    targetLang = LANGUAGE_MAP[targetLang] || "en";

    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text;
    }

    // Gunakan Google Translate untuk en → pl
    if (sourceLang === "en" && targetLang === "pl") {
        return translateGoogleTranslate(text, sourceLang, targetLang);
    }

    // Gunakan Hugging Face API untuk en → ru
    if (sourceLang === "en" && targetLang === "ru") {
        return translateHuggingFace(text, sourceLang, targetLang);
    }

    // Gunakan MyMemory API untuk bahasa lainnya
    return translateMyMemory(text, sourceLang, targetLang);
}

// 1️⃣ Fungsi Terjemahan dengan MyMemory API
async function translateMyMemory(text, sourceLang, targetLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}&de=fatonyahmadfauzi@gmail.com`;

    try {
        console.log(`🔵 Menggunakan MyMemory API: ${url}`);
        const response = await fetch(url);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            throw new Error("Gagal mendapatkan terjemahan.");
        }
    } catch (error) {
        console.error("❌ Error MyMemory:", error.message);
        return text;
    }
}

// 2️⃣ Fungsi Terjemahan dengan Hugging Face API (en → ru)
async function translateHuggingFace(text, sourceLang, targetLang) {
    const model = "Helsinki-NLP/opus-mt-en-ru"; // Model en → ru

    try {
        console.log(`🟠 Menggunakan Hugging Face API (${model})`);
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: text })
        });

        const data = await response.json();
        return data[0]?.translation_text || text;
    } catch (error) {
        console.error("❌ Error Hugging Face:", error.message);
        return text;
    }
}

// 3️⃣ Fungsi Terjemahan dengan Google Translate API (via Google Apps Script)
async function translateGoogleTranslate(text, sourceLang, targetLang) {
    const googleAppsScriptURL = "https://script.google.com/macros/s/AKfycbz72hUk_ZHt5G8Uxjusz5PogNY9YsYmJ2qOcQLesvspad9PDo9kQX4I_X8SF3zGsq7k/exec"; // Ganti dengan ID Anda

    try {
        console.log("🟢 Menggunakan Google Translate API (Google Apps Script)");
        const response = await fetch(`${googleAppsScriptURL}?text=${encodeURIComponent(text)}`);
        const translatedText = await response.text();
        return translatedText;
    } catch (error) {
        console.error("❌ Error Google Translate:", error.message);
        return text;
    }
}

// Ekspor fungsi utama
module.exports = { translateWithCache };
