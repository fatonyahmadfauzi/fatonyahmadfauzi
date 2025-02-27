const fetch = require("node-fetch");

const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;

const LANGUAGE_MAP = {
    de: "de", en: "en", es: "es", fr: "fr", id: "id",
    jp: "ja", kr: "ko", pl: "pl", pt: "pt", ru: "ru", zh: "zh",
};

function mapLanguage(lang) {
    if (!LANGUAGE_MAP[lang]) {
        console.warn(`Bahasa tidak didukung: ${lang}. Default ke 'en'.`);
        return "en";
    }
    return LANGUAGE_MAP[lang];
}

async function translateMyMemory(text, sourceLang, targetLang) {
    sourceLang = mapLanguage(sourceLang);
    targetLang = mapLanguage(targetLang);

    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text;
    }

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

module.exports = { translateMyMemory };
