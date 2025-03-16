const fetch = require("node-fetch");
const redis = require("redis");

// Konfigurasi koneksi Redis
const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST, // Host Redis dari Redis Cloud
        port: process.env.REDIS_PORT, // Port Redis (15201 dalam kasus Anda)
    },
    password: process.env.REDIS_PASSWORD, // Password Redis
});

// Menghubungkan ke Redis
(async () => {
    try {
        await client.connect();
        console.log("✅ Redis connected successfully");
    } catch (error) {
        console.error("❌ Redis connection error:", error.message);
    }
})();

const LANGUAGE_MAP = {
    de: "de", en: "en", es: "es", fr: "fr", id: "id",
    jp: "ja", kr: "ko", pl: "pl", pt: "pt", ru: "ru", zh: "zh",
};

// Fungsi utama untuk memilih API berdasarkan bahasa
async function translate(text, sourceLang, targetLang) {
    sourceLang = LANGUAGE_MAP[sourceLang] || "en";
    targetLang = LANGUAGE_MAP[targetLang] || "en";

    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text;
    }

    // Cek apakah terjemahan sudah ada di Redis
    const redisKey = `${sourceLang}:${targetLang}:${text}`;
    const cachedTranslation = await client.get(redisKey);
    if (cachedTranslation) {
        console.log("♻️ Menggunakan terjemahan dari cache Redis");
        return cachedTranslation;
    }

    let translation;
    // Gunakan Google Translate API (via Google Apps Script) untuk en → pl
    if (sourceLang === "en" && targetLang === "pl") {
        translation = await translateGoogleTranslate(text, sourceLang, targetLang);
    }
    // Gunakan Hugging Face API untuk en → ru
    else if (sourceLang === "en" && targetLang === "ru") {
        translation = await translateHuggingFace(text, targetLang);
    }
    // Gunakan MyMemory API untuk bahasa lain
    else {
        translation = await translateMyMemory(text, sourceLang, targetLang);
    }

    // Simpan hasil terjemahan ke Redis
    if (translation) {
        await client.set(redisKey, translation, { EX: 3600 }); // TTL: 1 jam
        console.log("✅ Terjemahan disimpan ke cache Redis");
    }

    return translation || text;
}

// Fungsi untuk menerjemahkan menggunakan Google Apps Script
async function translateGoogleTranslate(text, sourceLang, targetLang) {
    const googleAppsScriptURL = "https://script.google.com/macros/s/AKfycbz72hUk_ZHt5G8Uxjusz5PogNY9YsYmJ2qOcQLesvspad9PDo9kQX4I_X8SF3zGsq7k/exec"; // Ganti dengan ID Anda

    try {
        console.log("🟢 Menggunakan Google Translate API (Google Apps Script)");
        const response = await fetch(`${googleAppsScriptURL}?text=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const translatedText = await response.text();
        return translatedText;
    } catch (error) {
        console.error("❌ Error Google Translate:", error.message);
        return text;
    }
}

// Fungsi untuk menerjemahkan menggunakan MyMemory API
async function translateMyMemory(text, sourceLang, targetLang) {
    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : "";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}&de=fatonyahmadfauzi@gmail.com`;

    try {
        console.log(`Menggunakan MyMemory API: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        return data.responseData?.translatedText || text;
    } catch (error) {
        console.error("Error saat menerjemahkan dengan MyMemory:", error.message);
        return text;
    }
}

// Fungsi untuk menerjemahkan menggunakan Hugging Face API
async function translateHuggingFace(text, targetLang) {
    const model = "Helsinki-NLP/opus-mt-en-ru"; // Model en → ru

    try {
        console.log(`Menggunakan Hugging Face API (${model}) untuk en → ${targetLang}`);
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        return data[0]?.translation_text || text;
    } catch (error) {
        console.error("Error saat menerjemahkan dengan Hugging Face:", error.message);
        return text;
    }
}

module.exports = { translate, client };
