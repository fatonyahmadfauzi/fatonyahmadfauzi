const fetch = require("node-fetch");

// Fungsi untuk translate menggunakan Google Translate Scraping
async function translateGoogleScrape(text, sourceLang, targetLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data[0][0][0];
}

// Handler Netlify Functions
exports.handler = async function(event, context) {
    const githubToken = process.env.GITHUB_TOKEN;
    const targetLang = event.queryStringParameters.lang || "en"; // Bahasa target default = Inggris
    const githubApiUrl = "https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits";

    const headers = {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
    };

    try {
        const response = await fetch(githubApiUrl, { headers });
        if (!response.ok) throw new Error("Gagal mengambil data commit");

        const commits = await response.json();
        
        // Ambil 5 commit terbaru dan translate pesan commit
        const translatedCommits = await Promise.all(commits.slice(0, 5).map(async (commit) => {
            const message = commit.commit.message;
            const translatedMessage = await translateGoogleScrape(message, "auto", targetLang); // Auto detect bahasa asal
            return {
                author: commit.commit.author.name,
                originalMessage: message,
                translatedMessage: translatedMessage,
                date: commit.commit.author.date,
            };
        }));

        return {
            statusCode: 200,
            body: JSON.stringify(translatedCommits),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error fetching or translating commits", error: error.toString() }),
        };
    }
};
