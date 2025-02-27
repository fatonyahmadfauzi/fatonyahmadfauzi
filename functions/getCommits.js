const fetch = require("node-fetch");
const { translateMyMemory } = require("./translate"); // Impor fungsi translate

/**
 * Fungsi handler untuk mendapatkan daftar commit dari GitHub dan menerjemahkannya
 * @param {object} event - Event request
 * @param {object} context - Context function
 * @returns {object} - Response berupa daftar commit
 */
exports.handler = async function (event, context) {
    const githubToken = process.env.GITHUB_TOKEN; // Ambil GitHub token dari environment variable
    const targetLang = event.queryStringParameters.lang || "en"; // Bahasa target (default: English)
    const githubApiUrl = "https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits";

    const headers = {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
    };

    try {
        console.log("Mengambil data commit dari GitHub...");
        const response = await fetch(githubApiUrl, { headers });
        if (!response.ok) throw new Error("Gagal mengambil data commit dari GitHub.");

        const commits = await response.json();
        console.log("Respons data commit:", commits);

        // Ambil 5 commit terakhir dan terjemahkan pesan commit
        const translatedCommits = await Promise.all(
            commits.slice(0, 5).map(async (commit) => {
                const message = commit.commit.message;
                console.log("Pesan asli:", message);

                // Terjemahkan pesan commit
                const translatedMessage = await translateMyMemory(message, "en", targetLang);
                console.log("Pesan terjemahan:", translatedMessage);

                return {
                    author: commit.commit.author.name,
                    originalMessage: message,
                    translatedMessage: translatedMessage,
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
