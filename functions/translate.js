const fetch = require("node-fetch");

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz72hUk_ZHt5G8Uxjusz5PogNY9YsYmJ2qOcQLesvspad9PDo9kQX4I_X8SF3zGsq7k/exec";
const HF_API_KEY = process.env.HF_API_KEY;
const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;

async function translate(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text;
    }

    console.log(`📥 Teks asli untuk terjemahan: ${text}`);
    let translation;

    try {
        if (sourceLang === "en" && targetLang === "pl") {
            translation = await translateGoogleAppsScript(text, sourceLang, targetLang);
        } else if (sourceLang === "en" && targetLang === "ru") {
            translation = await translateHuggingFace(text, targetLang);
        } else if (targetLang === "ja" || targetLang === "ko") {
            // Gunakan Google Apps Script untuk bahasa Jepang & Korea
            translation = await translateGoogleAppsScript(text, sourceLang, targetLang);
        } else {
            translation = await translateMyMemory(text, sourceLang, targetLang);
        }

        if (translation && translation !== text) {
            console.log(`✅ Terjemahan berhasil: ${translation}`);
        } else {
            console.warn("❌ Terjemahan tidak valid atau tidak berubah.");
        }
    } catch (error) {
        console.error("❌ Error saat menerjemahkan:", error.message);
    }

    return translation || text;
}

async function translateGoogleAppsScript(text, sourceLang, targetLang) {
    try {
        console.log("🌐 Menggunakan Google Apps Script");
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?text=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const translatedText = await response.text();
        console.log("✅ Respons Google Apps Script:", translatedText);
        return translatedText.trim();
    } catch (error) {
        console.error("❌ Error Google Apps Script:", error.message);
        return null;
    }
}

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
        const translation = data[0]?.translation_text || null;
        console.log("✅ Respons Hugging Face:", translation);
        return translation;
    } catch (error) {
        console.error("❌ Error Hugging Face:", error.message);
        return null;
    }
}

async function translateMyMemory(text, sourceLang, targetLang) {
    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : "";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}${keyParam}`;

    try {
        console.log("🌐 Menggunakan MyMemory API");
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const translation = data.responseData?.translatedText || null;
        
        // Pastikan hasil terjemahan tidak sama dengan input
        if (!translation || translation.toLowerCase() === text.toLowerCase()) {
            console.warn(`⚠️ MyMemory mungkin gagal menerjemahkan "${text}" ke ${targetLang}.`);
            return null;
        }

        console.log("✅ Respons MyMemory:", translation);
        return translation;
    } catch (error) {
        console.error("❌ Error MyMemory:", error.message);
        return null;
    }
}

module.exports = { translate };
