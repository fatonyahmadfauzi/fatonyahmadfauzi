const fetch = require("node-fetch");

const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;
const HF_API_KEY = process.env.HF_API_KEY; // Masukkan API Key Hugging Face

const LANGUAGE_MAP = {
    de: "de", en: "en", es: "es", fr: "fr", id: "id",
    jp: "ja", kr: "ko", pl: "pl", pt: "pt", ru: "ru", zh: "zh",
};

// Fungsi untuk memilih API berdasarkan bahasa
async function translate(text, sourceLang, targetLang) {
    sourceLang = LANGUAGE_MAP[sourceLang] || "en";
    targetLang = LANGUAGE_MAP[targetLang] || "en";

    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text;
    }

    // Jika target adalah Polandia atau Rusia, gunakan Hugging Face API
    if (targetLang === "pl" || targetLang === "ru") {
        return translateHuggingFace(text, sourceLang, targetLang);
    } else {
        return translateMyMemory(text, sourceLang, targetLang);
    }
}

// Fungsi untuk menerjemahkan menggunakan MyMemory API
async function translateMyMemory(text, sourceLang, targetLang) {
    const keyParam = MYMEMORY_API_KEY ? `&key=${MYMEMORY_API_KEY}` : "";
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}&de=fatonyahmadfauzi@gmail.com`;

    try {
        console.log(`Mengirim permintaan ke MyMemory API: ${url}`);
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Respons MyMemory API:", JSON.stringify(data, null, 2));

        if (data.responseData && data.responseData.translatedText) {
            return data.responseData.translatedText;
        } else {
            console.error("Error dalam data API:", data);
            throw new Error("Gagal mendapatkan terjemahan.");
        }
    } catch (error) {
        console.error("Error saat menerjemahkan:", error.message);
        return text;
    }
}

// Fungsi untuk menerjemahkan menggunakan Hugging Face API
async function translateHuggingFace(text, sourceLang, targetLang) {
    const model = targetLang === "pl"
        ? "allegro/translation-en-pl" // Model alternatif untuk en → pl
        : "Helsinki-NLP/opus-mt-en-ru"; // Model en → ru

    try {
        console.log(`Menggunakan Hugging Face API (${model}) untuk ${sourceLang} → ${targetLang}`);
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: text })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Respons Hugging Face API:", JSON.stringify(data, null, 2));

        return data[0]?.translation_text || text;
    } catch (error) {
        console.error("Error saat menerjemahkan dengan Hugging Face:", error.message);
        return text;
    }
}

module.exports = { translate };
