const fetch = require("node-fetch");

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz72hUk_ZHt5G8Uxjusz5PogNY9YsYmJ2qOcQLesvspad9PDo9kQX4I_X8SF3zGsq7k/exec";
const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;

// Mapping bahasa yang didukung (termasuk Rusia)
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'zh-CN': 'Chinese',
  'ja': 'Japanese',
  'pt-PT': 'Portuguese',
  'ru': 'Russian',  // Bahasa Rusia ditambahkan
  'ko': 'Korean',
  'id': 'Indonesian'
};

async function translate(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) return text;

    // Normalisasi kode bahasa
    const langMap = {
        'zh': 'zh-CN',
        'jp': 'ja',
        'kr': 'ko',
        'pt': 'pt-PT',
        'rus': 'ru'  // Alias untuk Rusia
    };
    
    sourceLang = langMap[sourceLang] || sourceLang;
    targetLang = langMap[targetLang] || targetLang;

    console.log(`🌐 Translate: [${sourceLang}] → [${targetLang}]`);
    console.log(`📝 Text: ${text.substring(0, 40)}${text.length > 40 ? '...' : ''}`);

    let translation;
    try {
        // Langkah 1: Coba MyMemory API
        translation = await translateMyMemory(text, sourceLang, targetLang);
        
        // Langkah 2: Fallback ke Google Apps Script
        if (!translation) {
            console.log('⏳ Fallback ke Google Apps Script...');
            translation = await translateGoogleAppsScript(text, sourceLang, targetLang);
        }

        // Langkah 3: Final fallback ke Google Gratis
        if (!translation) {
            console.log('⏳ Fallback ke Google Gratis...');
            translation = await translateGoogleFree(text, sourceLang, targetLang);
        }

        // Validasi karakter khusus untuk bahasa Asia
        if (translation) {
            const isInvalid = (
                (targetLang === 'zh-CN' && !/[\u4e00-\u9fff]/.test(translation)) ||
                (targetLang === 'ja' && !/[\u3040-\u309F\u30A0-\u30FF]/.test(translation)) ||
                (targetLang === 'ru' && !/[а-яА-ЯЁё]/.test(translation))  // Validasi Cyrillic
            );
            
            if (isInvalid) {
                console.warn('⚠️ Karakter tidak valid, tetap digunakan');
            }
        }

        return translation || text;
    } catch (error) {
        console.error(`❌ Translation failed: ${error.message}`);
        return text;
    }
}

// MyMemory Translator dengan validasi ekstra
async function translateMyMemory(text, sourceLang, targetLang) {
    if (!MYMEMORY_API_KEY) {
        console.warn('⚠️ MyMemory API key missing');
        return null;
    }

    try {
        const params = new URLSearchParams({
            q: text,
            langpair: `${sourceLang}|${targetLang}`,
            key: MYMEMORY_API_KEY,
            mt: '1',
            of: 'JSON'
        });

        const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
        const data = await response.json();
        
        console.log('📤 MyMemory Response:', {
            status: data.responseStatus,
            matches: data.matches?.length || 0
        });

        if (data.responseStatus === 403) throw new Error('Quota exceeded');
        if (data.responseStatus >= 400) throw new Error('API error');
        
        const bestMatch = data.matches?.find(m => m.similarity > 0.7);
        return bestMatch?.translation || data.responseData?.translatedText;
    } catch (error) {
        console.error(`❌ MyMemory Error: ${error.message}`);
        return null;
    }
}

// Google Apps Script Translator
async function translateGoogleAppsScript(text, sourceLang, targetLang) {
    try {
        const params = new URLSearchParams({
            text: text,
            source: sourceLang,
            target: targetLang,
            cache: new Date().getTime()
        });

        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params}`);
        return await response.text();
    } catch (error) {
        console.error(`❌ Google Apps Error: ${error.message}`);
        return null;
    }
}

// Google Translate Gratis
async function translateGoogleFree(text, sourceLang, targetLang) {
    try {
        const params = new URLSearchParams({
            text: text,
            from: sourceLang,
            to: targetLang
        });

        const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}&dt=t&client=gtx`);
        const data = await response.json();
        return data[0][0][0];
    } catch (error) {
        console.error("❌ Google Gratis Error:", error.message);
        return null;
    }
}

module.exports = { 
    translate,
    SUPPORTED_LANGUAGES  // Ekspor daftar bahasa yang didukung
};