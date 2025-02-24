const fetch = require("node-fetch");
const { translateMyMemory } = require("../translate"); // Impor fungsi translate

exports.handler = async function(event, context) {
    const githubToken = process.env.GITHUB_TOKEN; // Ambil GitHub token dari Netlify
    const targetLang = event.queryStringParameters.lang || "en"; // Default English
    const githubApiUrl = "https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits";

    const headers = {
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
    };

    try {
        const response = await fetch(githubApiUrl, { headers });
        if (!response.ok) throw new Error("Gagal mengambil data commit");

        const commits = await response.json();
        const translatedCommits = await Promise.all(commits.slice(0, 5).map(async (commit) => {
            const message = commit.commit.message;
            // Di dalam Promise.all(...)
            const translatedMessage = await translateMyMemory(message, "en", targetLang);
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
