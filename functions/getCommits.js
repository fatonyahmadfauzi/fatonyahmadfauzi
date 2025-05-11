const fetch = require("node-fetch");
const { translate } = require("./translate");

exports.handler = async function (event, context) {
    const githubToken = process.env.GITHUB_TOKEN;
    const targetLang = event.queryStringParameters.lang || "en";
    const githubApiUrl = "https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits";

    if (!githubToken) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Missing GitHub token" })
        };
    }

    const headers = {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
    };

    try {
        console.log("Fetching commits...");
        const response = await fetch(githubApiUrl, { headers });
        const text = await response.text();

        console.log("GitHub API response:", text);

        if (!response.ok) throw new Error("GitHub API error");

        const commits = JSON.parse(text);

        if (!Array.isArray(commits)) throw new Error("Invalid commit format");

        const translatedCommits = await Promise.all(
            commits.slice(0, 5).map(async (commit) => {
                const message = commit.commit.message;
                console.log("Original message:", message);

                let translatedMessage = message;
                
                // Langsung terjemahkan ke targetLang (asumsi bahasa sumber adalah Inggris)
                try {
                    translatedMessage = await translate(message, 'en', targetLang);
                    console.log("Translation result:", translatedMessage);
                } catch (err) {
                    console.warn("Translation failed:", err.message);
                }

                return {
                    author: commit.commit.author.name,
                    originalMessage: message,
                    translatedMessage: translatedMessage || message,
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
            body: JSON.stringify({ 
                message: "Error fetching or translating commits", 
                error: error.toString() 
            }),
        };
    }
};