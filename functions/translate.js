const fetch = require("node-fetch");
const { TranslationServiceClient } = require('@google-cloud/translate').v3;

// Inisialisasi Google Cloud Translation Client
if (!process.env.GOOGLE_CREDENTIALS_BASE64) {
    console.error("❌ GOOGLE_CREDENTIALS_BASE64 tidak terdefinisi!");
    throw new Error("Google Cloud credentials tidak valid");
}

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz72hUk_ZHt5G8Uxjusz5PogNY9YsYmJ2qOcQLesvspad9PDo9kQX4I_X8SF3zGsq7k/exec";
const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;

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

    console.log(`📥 Mengirim permintaan terjemahan: ${text} dari ${sourceLang} ke ${targetLang}`);
    let translation;

    try {
        if (sourceLang === "en" && targetLang === "pl") {
            // Gunakan Google Apps Script untuk en → pl
            translation = await translateGoogleAppsScript(text, sourceLang, targetLang);
        } else {
            // Gunakan Google Cloud Translation untuk bahasa lainnya
            translation = await translateGoogleCloud(text, sourceLang, targetLang);
            
            // Fallback ke MyMemory jika Google Cloud gagal
            if (!translation) {
                translation = await translateMyMemory(text, sourceLang, targetLang);
            }
        }
    } catch (error) {
        console.error("❌ Error saat menerjemahkan:", error.message);
    }

    return translation || text; // Kembalikan teks asli jika gagal
}

// Fungsi untuk Google Cloud Translation API
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

        const [response] = await translationClient.translateText(request);
        return response.translations[0].translatedText;
    } catch (error) {
        console.error("❌ Error Google Cloud Translation:", error.message);
        return null;
    }
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

// Fungsi untuk MyMemory API (fallback)
async function translateMyMemory(text, sourceLang, targetLang) {
    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : "";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}${keyParam}`;

    try {
        console.log("🌐 Menggunakan MyMemory API (fallback)");
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

module.exports = { translate };