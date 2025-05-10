const fetch = require("node-fetch");
const { translate } = require("./translate");

const HF_LANG_DETECT_MODEL = "papluca/xlm-roberta-base-language-detection";
const HF_API_KEY = process.env.HF_API_KEY;

// File: getCommits.js
async function detectLanguage(text) {
    // [BARU] Prioritas deteksi untuk commit teknis
    const isTechnical = /(merge|fix|feat|refactor|chore|docs|style|test)/i.test(text);
    if (isTechnical) {
        console.log("🔍 Deteksi teknis: default ke en");
        return "en";
    }

    // [ASLI] Deteksi bahasa menggunakan Hugging Face
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_LANG_DETECT_MODEL}`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
    });
    const result = await response.json();
    return result[0]?.[0]?.label || "en";
}

exports.handler = async function (event, context) {
    const githubToken = process.env.GITHUB_TOKEN;
    const targetLang = event.queryStringParameters.lang || "en";
    const githubApiUrl = "https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits";

    if (!githubToken || !HF_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Missing API keys" })
        };
    }

    const headers = {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
    };

    try {
        console.log("Fetching commits...");
        const response = await fetch(githubApiUrl, { headers });
        const text = await response.text(); // Ambil isi mentah dulu

        console.log("GitHub API response:", text); // Tampilkan untuk debug

        if (!response.ok) throw new Error("GitHub API error");

        const commits = JSON.parse(text); // Parsing JSON

        if (!Array.isArray(commits)) throw new Error("Invalid commit format");

        // Di dalam exports.handler -> Promise.all(commits.map(...))
        const translatedCommits = await Promise.all(
            commits.slice(0, 5).map(async (commit) => {
                const message = commit.commit.message;
                console.log("Pesan asli:", message);

                let detectedLang = "en";
                try {
                    detectedLang = await detectLanguage(message);
                    console.log(`Detected language: ${detectedLang}`);
                } catch (err) {
                    console.warn("Gagal deteksi bahasa:", err.message);
                }

                let translatedMessage = message;
                try {
                    // [BARU] Tambahkan logging di sini
                    const result = await translate(message, detectedLang, targetLang);
                    translatedMessage = result || message;
                    
                    // --- LOGGING HASIL TERJEMAHAN ---
                    console.log("Hasil Terjemahan:", {
                        asli: message,
                        terjemahan: translatedMessage, // Gunakan translatedMessage
                        sumber: detectedLang,
                        target: targetLang
                    });
                    
                } catch (err) {
                    console.warn("Gagal menerjemahkan:", err.message);
                }

                return {
                    author: commit.commit.author.name,
                    originalMessage: message,
                    detectedLanguage: detectedLang,
                    translatedMessage, // <-- Data yang sudah di-log
                    date: commit.commit.author.date
                };
            })
        );
        return {
            statusCode: 200,
            body: JSON.stringify(translatedCommits),
        };
    } catch (error) {
        console.error("Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error fetching or translating commits", error: error.toString() }),
        };
    }
};
