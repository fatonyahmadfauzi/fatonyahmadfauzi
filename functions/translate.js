const fetch = require("node-fetch");
const { TranslationServiceClient } = require('@google-cloud/translate').v3;

// ✅ Validasi credentials Google Cloud
if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
    throw new Error("GOOGLE_CREDENTIALS_BASE64 tidak ditemukan di .env");
}

// ✅ Validasi project ID Google Cloud
if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    throw new Error("GOOGLE_CLOUD_PROJECT_ID tidak ditemukan di .env");
}

// ✅ Validasi MyMemory API Key
if (!process.env.MYMEMORY_API_KEY) {
    console.warn("Peringatan: MYMEMORY_API_KEY tidak ada. Terjemahan mungkin terbatas.");
}

// Inisialisasi Google Cloud Translation Client
if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
    console.error("❌ GOOGLE_CREDENTIALS_BASE64 tidak terdefinisi!");
    throw new Error("Google Cloud credentials tidak valid");
}

const keyFile = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
const translationClient = new TranslationServiceClient({
    credentials: JSON.parse(keyFile)
});

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;

// Peta bahasa untuk validasi dan konversi
const LANGUAGE_MAP = {
    de: "de", en: "en", es: "es", fr: "fr", id: "id",
    jp: "ja", kr: "ko", pl: "pl", pt: "pt-PT", // Perbaikan untuk Portugis
    ru: "ru", zh: "zh-CN" // Perbaikan untuk China
};

// Daftar bahasa yang didukung Google Cloud
const SUPPORTED_GOOGLE_LANGS = ['zh-CN', 'ja', 'ru', 'pt-PT', 'de', 'en', 'es', 'fr', 'id', 'ko', 'pl'];

// Fungsi utama untuk memilih API berdasarkan bahasa
async function translate(text, sourceLang, targetLang) {
    sourceLang = LANGUAGE_MAP[sourceLang] || "en";
    targetLang = LANGUAGE_MAP[targetLang] || "en";

    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text;
    }

    console.log(`📥 Mengirim permintaan terjemahan: ${text} dari ${sourceLang} ke ${targetLang}`);
    let translation;

    try {
        if (sourceLang === "en" && targetLang === "pl") {
            translation = await translateGoogleAppsScript(text, sourceLang, targetLang);
        } else if (SUPPORTED_GOOGLE_LANGS.includes(targetLang)) {
            translation = await translateGoogleCloud(text, sourceLang, targetLang);
        }

        // Fallback ke MyMemory jika Google Cloud gagal atau tidak support
        if (!translation) {
            const myMemoryLang = {
                'zh-CN': 'zh',
                'ja': 'jp',
                'pt-PT': 'pt'
            }[targetLang] || targetLang;
            
            translation = await translateMyMemory(text, sourceLang, myMemoryLang);
        }
    } catch (error) {
        console.error("❌ Error saat menerjemahkan:", error.message);
    }

    return translation || text;
}

// Fungsi untuk Google Cloud Translation API (diperbarui)
async function translateGoogleCloud(text, sourceLang, targetLang) {
    try {
        console.log(`🌐 Menggunakan Google Cloud Translation (${sourceLang} → ${targetLang})`);
        
        const request = {
            parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/global`,
            contents: [text],
            mimeType: 'text/plain',
            sourceLanguageCode: sourceLang,
            targetLanguageCode: targetLang,
        };

        console.log("Request ke Google Cloud:", JSON.stringify(request, null, 2));
        
        const [response] = await translationClient.translateText(request);
        return response.translations[0].translatedText;
    } catch (error) {
        console.error("❌ Error Google Cloud Translation:", error.message);
        return null;
    }
}

// Fungsi untuk MyMemory API (diperbarui)
async function translateMyMemory(text, sourceLang, targetLang) {
    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : "";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}${keyParam}&of=json`;

    try {
        console.log(`🌐 Menggunakan MyMemory API (${sourceLang} → ${targetLang})`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Respons MyMemory:", JSON.stringify(data, null, 2));
        
        // Handle respons khusus untuk bahasa Asia
        if (['zh', 'ja', 'ko'].includes(targetLang)) {
            return data.responseData?.translatedText.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)) || text;
        }
        return data.responseData?.translatedText || text;
    } catch (error) {
        console.error("❌ Error MyMemory:", error.message);
        return null;
    }
}

// Fungsi untuk Google Apps Script (tidak berubah)
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

module.exports = { translate };