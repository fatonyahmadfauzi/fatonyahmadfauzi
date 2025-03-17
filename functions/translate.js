const fetch = require("node-fetch");

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY";

async function translate(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) {
        console.warn("Bahasa sumber dan target sama. Tidak perlu menerjemahkan.");
        return text;
    }

    console.log(`📥 Teks asli untuk terjemahan: ${text}`);

    try {
        const translation = await translateGoogle(text, sourceLang, targetLang);

        if (translation && translation !== text) {
            console.log(`✅ Terjemahan berhasil: ${translation}`);
            return translation;
        } else {
            console.warn("❌ Terjemahan tidak valid atau tidak berubah.");
        }
    } catch (error) {
        console.error("❌ Error saat menerjemahkan:", error.message);
    }

    return text; // Fallback ke teks asli jika terjadi error
}

async function translateGoogle(text, sourceLang, targetLang) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;

    try {
        console.log("🌐 Menggunakan Google Translate API");
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,
                source: sourceLang,
                target: targetLang,
                format: "text",
            }),
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        const translatedText = data.data.translations[0].translatedText;
        console.log("✅ Respons Google Translate:", translatedText);
        return translatedText;
    } catch (error) {
        console.error("❌ Error Google Translate:", error.message);
        return null;
    }
}

module.exports = { translate };
