const fetch = require("node-fetch");

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz72hUk_ZHt5G8Uxjusz5PogNY9YsYmJ2qOcQLesvspad9PDo9kQX4I_X8SF3zGsq7k/exec";
const HF_API_KEY = process.env.HF_API_KEY;
const MYMEMORY_API_KEY = process.env.MYMEMORY_API_KEY;

// Mapping model Hugging Face untuk bahasa target
const HF_MODELS = {
    "zh-CN": {
        "en": "Helsinki-NLP/opus-mt-en-zh",
        "zh": "Helsinki-NLP/opus-mt-zh-en" // Model dua arah
    },
    "ja": {
        "en": "Helsinki-NLP/opus-mt-en-jap",
        "ja": "Helsinki-NLP/opus-mt-jap-en"
    },
    "pt-PT": {
        "en": "Helsinki-NLP/opus-mt-en-pt",
        "pt": "Helsinki-NLP/opus-mt-pt-en"
    }
};

async function translate(text, sourceLang, targetLang) {
    if (sourceLang === targetLang) return text;

    // Normalisasi kode bahasa
    const langMap = {
        'zh': 'zh-CN',
        'jp': 'ja',
        'kr': 'ko',
        'pt': 'pt-PT'
    };
    
    sourceLang = langMap[sourceLang] || sourceLang;
    targetLang = langMap[targetLang] || targetLang;

    console.log(`🌐 Translate: [${sourceLang}] → [${targetLang}]`);
    console.log(`📝 Text: ${text.substring(0, 40)}${text.length > 40 ? '...' : ''}`);

    let translation;
    try {
        // Langkah 1: Coba MyMemory API
        translation = await translateMyMemory(text, sourceLang, targetLang);
        
        // Langkah 2: Fallback ke Hugging Face untuk 3 bahasa spesifik
        if (!translation && HF_MODELS[targetLang]) {
            console.log('⏳ Fallback ke Hugging Face...');
            translation = await translateHuggingFace(text, sourceLang, targetLang);
        }

        // Langkah 3: Final fallback ke Google Apps Script
        if (!translation) {
            console.log('⏳ Fallback ke Google Apps Script...');
            translation = await translateGoogleAppsScript(text, sourceLang, targetLang);
        }

        // Validasi karakter khusus
        if (translation) {
            const isInvalid = (
                (targetLang === 'zh-CN' && !/[\u4e00-\u9fff]/.test(translation)) ||
                (targetLang === 'ja' && !/[\u3040-\u309F\u30A0-\u30FF\u4e00-\u9fff]/.test(translation))
            );
            
            if (isInvalid) {
                console.warn('⚠️ Karakter tidak valid, tetapi tetap diterima');
            }
        }

        return translation || text;
    } catch (error) {
        console.error(`❌ Translation failed: ${error.message}`);
        return text;
    }
}

// Fungsi baru untuk Hugging Face
async function translateHuggingFace(text, sourceLang, targetLang) {
    if (!HF_API_KEY) return null;

    // Ambil model berdasarkan pasangan bahasa
    const modelPair = HF_MODELS[targetLang];
    const model = modelPair?.[sourceLang] || modelPair?.en;

    if (!model) {
        console.warn("Model tidak tersedia untuk pasangan ini");
        return null;
    }

    try {
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ inputs: text })
            }
        );

        const data = await response.json();
        return data[0]?.translation_text;
    } catch (error) {
        console.error(`❌ Hugging Face Error: ${error.message}`);
        return null;
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
        
        // Debugging response
        console.log('📤 MyMemory Response:', {
            status: data.responseStatus,
            matches: data.matches?.length || 0
        });

        // Handle error codes
        if (data.responseStatus === 403) throw new Error('Quota exceeded');
        if (data.responseStatus >= 400) throw new Error('API error');
        
        // Ambil terjemahan terbaik dengan similarity tinggi
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
            cache: new Date().getTime() // Prevent caching
        });

        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params}`);
        return await response.text();
    } catch (error) {
        console.error(`❌ Google Apps Error: ${error.message}`);
        return null;
    }
}

module.exports = { translate };