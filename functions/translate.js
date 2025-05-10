const fetch = require("node-fetch");

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz72hUk_ZHt5G8Uxjusz5PogNY9YsYmJ2qOcQLesvspad9PDo9kQX4I_X8SF3zGsq7k/exec";
const HF_API_KEY = process.env.HF_API_KEY;
const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;

async function translate(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text;
    }

    console.log(`📥 Terjemahan: ${sourceLang} → ${targetLang}`);
    console.log(`Teks: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);

    // Mapping kode bahasa untuk MyMemory
    const langMapping = {
        "jp": "ja",
        "kr": "ko",
        "zh": "zh-CN",
        "pt": "pt-PT"
    };

    // Normalisasi kode bahasa untuk sumber dan target
    sourceLang = langMapping[sourceLang] || sourceLang;
    targetLang = langMapping[targetLang] || targetLang;

    let translation;
    try {
        // Prioritaskan MyMemory untuk bahasa Asia dan Eropa
        if (["zh-CN", "ja", "pt-PT", "id", "de", "fr", "es", "ko"].includes(targetLang)) {
            translation = await translateMyMemory(text, sourceLang, targetLang);
        }
        // Fallback ke Google Apps Script untuk Polandia
        else if (targetLang === "pl") {
            translation = await translateGoogleAppsScript(text, sourceLang, targetLang);
        }
        // Fallback ke Hugging Face untuk Rusia
        else if (targetLang === "ru") {
            translation = await translateHuggingFace(text, targetLang);
        }
        
        // Jika terjemahan gagal, kembalikan teks asli
        if (!translation || translation.toLowerCase() === text.toLowerCase()) {
            console.warn("⏩ Menggunakan teks asli karena terjemahan gagal");
            return text;
        }

        console.log(`✅ Hasil: ${translation.substring(0, 50)}${translation.length > 50 ? '...' : ''}`);
        return translation;
    } catch (error) {
        console.error("❌ Error utama:", error.message);
        return text;
    }
}

async function translateGoogleAppsScript(text, sourceLang, targetLang) {
    try {
        console.log("🌐 Menggunakan Google Apps Script");
        const params = new URLSearchParams({
            text: text,
            source: sourceLang,
            target: targetLang
        });
        
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        return await response.text();
    } catch (error) {
        console.error("❌ Google Apps Script Error:", error.message);
        return null;
    }
}

async function translateHuggingFace(text, targetLang) {
    const models = {
        "ru": "Helsinki-NLP/opus-mt-en-ru"
    };

    try {
        console.log("🌐 Menggunakan Hugging Face");
        const response = await fetch(`https://api-inference.huggingface.co/models/${models[targetLang]}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: text }),
        });

        const data = await response.json();
        return data[0]?.translation_text;
    } catch (error) {
        console.error("❌ Hugging Face Error:", error.message);
        return null;
    }
}

async function translateMyMemory(text, sourceLang, targetLang) {
    if (!MYMEMORY_API_KEY) {
        console.warn("⚠️ MyMemory API Key tidak tersedia");
        return null;
    }

    try {
        console.log(`🌐 MyMemory: ${sourceLang} → ${targetLang}`);
        const params = new URLSearchParams({
            q: text,
            langpair: `${sourceLang}|${targetLang}`,
            key: MYMEMORY_API_KEY,
            mt: "1" // Aktifkan terjemahan mesin
        });

        const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
        const data = await response.json();
        
        // Handle respons khusus untuk bahasa Asia
        if (targetLang === "zh-CN" && data.responseData?.translatedText.match(/[\u4e00-\u9fff]/)) {
            return data.responseData.translatedText;
        }
        
        return data.responseData?.translatedText || null;
    } catch (error) {
        console.error("❌ MyMemory Error:", error.message);
        return null;
    }
}

module.exports = { translate };