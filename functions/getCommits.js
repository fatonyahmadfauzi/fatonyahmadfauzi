const fetch = require("node-fetch");
const { translate } = require("./translate");
const redis = require("redis");

const HF_LANG_DETECT_MODEL = "papluca/xlm-roberta-base-language-detection";
const HF_API_KEY = process.env.HF_API_KEY;

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
    password: process.env.REDIS_PASSWORD
});

client.connect().catch(console.error);

async function detectLanguage(text) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_LANG_DETECT_MODEL}`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: text })
    });
    const result = await response.json();
    return result[0]?.[0]?.label || "en"; // Default ke "en" jika gagal
}

exports.handler = async function (event, context) {
    const githubToken = process.env.GITHUB_TOKEN;
    const targetLang = event.queryStringParameters.lang || "en";
    const githubApiUrl = "https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits";

    const headers = {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
    };

    try {
        // Fetch commits from GitHub API
        const response = await fetch(githubApiUrl, { headers });
        if (!response.ok) throw new Error("Gagal mengambil data commit");

        const commits = await response.json();

        // Check Redis Cache for first commit
        const firstCommit = commits[0]?.commit.message;
        const cacheKey = `commit:${firstCommit}:${targetLang}`;
        let firstCommitTranslation = await client.get(cacheKey);

        if (!firstCommitTranslation) {
            const detectedLang = await detectLanguage(firstCommit);
            firstCommitTranslation = await translate(firstCommit, detectedLang, targetLang);
            await client.set(cacheKey, firstCommitTranslation);
        }

        // Translate commit messages with language detection
        const translatedCommits = await Promise.all(
            commits.slice(0, 5).map(async (commit, index) => {
                const message = commit.commit.message;
                console.log("Pesan asli:", message);

                if (index === 0) {
                    return {
                        author: commit.commit.author.name,
                        originalMessage: message,
                        detectedLanguage: await detectLanguage(message),
                        translatedMessage: firstCommitTranslation,
                        date: commit.commit.author.date,
                    };
                }

                const detectedLang = await detectLanguage(message);
                console.log(`Detected language: ${detectedLang}`);

                const translatedMessage = await translate(message, detectedLang, targetLang);
                console.log(`Terjemahan (${targetLang}):`, translatedMessage);

                return {
                    author: commit.commit.author.name,
                    originalMessage: message,
                    detectedLanguage: detectedLang,
                    translatedMessage,
                    date: commit.commit.author.date,
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
