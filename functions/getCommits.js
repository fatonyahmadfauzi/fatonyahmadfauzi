const fetch = require("node-fetch");
const { translate, client } = require("./translate");

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

        // Ambil commit pertama dari daftar
        const firstCommit = commits[0];
        const message = firstCommit.commit.message;

        // Log for debugging
        console.log("Pesan asli commit pertama:", message);

        // Cek apakah sudah ada di Redis
        const redisKey = `commit:${targetLang}:first-message`;
        let translatedMessage = await client.get(redisKey);

        if (!translatedMessage) {
            // Jika belum ada di Redis, terjemahkan dan simpan hasilnya
            translatedMessage = await translate(message, "en", targetLang);
            console.log(`Terjemahan commit pertama (${targetLang}):`, translatedMessage);

            await client.set(redisKey, translatedMessage, { EX: 3600 }); // Cache 1 jam
            console.log(`✅ Terjemahan commit pertama disimpan ke Redis dengan key: ${redisKey}`);
        } else {
            console.log(`♻️ Terjemahan commit pertama ditemukan di Redis dengan key: ${redisKey}`);
        }

        // Translate commit messages (tanpa menyimpan ke Redis)
        const translatedCommits = await Promise.all(
            commits.slice(0, 5).map(async (commit) => {
                const message = commit.commit.message;

                // Translate commit message
                const translatedMessage = await translate(message, "en", targetLang);

                return {
                    author: commit.commit.author.name,
                    originalMessage: message,
                    translatedMessage,
                    date: commit.commit.author.date,
                };
            })
        );

        // Tambahkan hasil Redis ke response
        translatedCommits[0].cachedTranslatedMessage = translatedMessage;

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
