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

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz72hUk_ZHt5G8Uxjusz5PogNY9YsYmJ2qOcQLesvspad9PDo9kQX4I_X8SF3zGsq7k/exec";
const HF_API_KEY = process.env.HF_API_KEY; // API Key Hugging Face
const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY; // API Key MyMemory (opsional)

// Peta bahasa untuk validasi
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

    const redisKey = `${sourceLang}:${targetLang}:${text}`;
    const cachedTranslation = await client.get(redisKey);

    if (cachedTranslation) {
        console.log("♻️ Menggunakan cache Redis");
        return cachedTranslation;
    }

    console.log(`📥 Mengirim permintaan terjemahan: ${text} dari ${sourceLang} ke ${targetLang}`);
    let translation;

    try {
        if (sourceLang === "en" && targetLang === "pl") {
            // Gunakan Google Apps Script untuk en → pl
            translation = await translateGoogleAppsScript(text, sourceLang, targetLang);
        } else if (sourceLang === "en" && targetLang === "ru") {
            // Gunakan Hugging Face untuk en → ru
            translation = await translateHuggingFace(text, targetLang);
        } else {
            // Gunakan MyMemory untuk pasangan bahasa lainnya
            translation = await translateMyMemory(text, sourceLang, targetLang);
        }

        if (translation) {
            await client.set(redisKey, translation, { EX: 3600 }); // Cache 1 jam
            console.log("✅ Terjemahan disimpan ke cache Redis");
        }
    } catch (error) {
        console.error("❌ Error saat menerjemahkan:", error.message);
    }

    return translation || text; // Kembalikan teks asli jika gagal
}

// Fungsi untuk Google Apps Script (en → pl)
async function translateGoogleAppsScript(text, sourceLang, targetLang) {
    try {
        console.log("🌐 Menggunakan Google Apps Script (en → pl)");
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?text=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const translatedText = await response.text();
        console.log("✅ Respons Google Apps Script:", translatedText);
        return translatedText;
    } catch (error) {
        console.error("❌ Error Google Apps Script:", error.message);
        return null;
    }
}

// Fungsi untuk Hugging Face API (en → ru)
async function translateHuggingFace(text, targetLang) {
    const model = "Helsinki-NLP/opus-mt-en-ru";

    try {
        console.log(`🌐 Menggunakan Hugging Face API (en → ${targetLang})`);
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
        console.log("✅ Respons Hugging Face:", JSON.stringify(data, null, 2));
        return data[0]?.translation_text || text;
    } catch (error) {
        console.error("❌ Error Hugging Face:", error.message);
        return null;
    }
}

// Fungsi untuk MyMemory API
async function translateMyMemory(text, sourceLang, targetLang) {
    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : "";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}${keyParam}`;

    try {
        console.log("🌐 Menggunakan MyMemory API");
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Respons MyMemory:", JSON.stringify(data, null, 2));
        return data.responseData?.translatedText || text;
    } catch (error) {
        console.error("❌ Error MyMemory:", error.message);
        return null;
    }
}

module.exports = { translate, client };
