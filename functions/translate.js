const { promisify } = require("util");
const redis = require("redis");
const fetch = require("node-fetch");
const { translate } = require("./translate");
require("dotenv").config(); // Memuat variabel lingkungan dari .env

// Konfigurasi Redis Client menggunakan variabel lingkungan
const redisClient = redis.createClient({
    url: process.env.REDIS_URL, // URL Redis dari .env
    password: process.env.REDIS_PASSWORD, // Password Redis dari .env
});

redisClient.on("connect", () => {
    console.log("Terhubung ke Redis Cloud");
});

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

// Promisify metode Redis untuk mendukung async/await
const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

// Daftar bahasa yang diizinkan
const ALLOWED_LANGUAGES = ["de", "en", "es", "fr", "id", "ja", "ko", "pl", "pt", "ru", "zh"];

exports.handler = async function (event, context) {
    const githubToken = process.env.GITHUB_TOKEN; // Token GitHub dari .env
    const targetLang = event.queryStringParameters.lang || "en";
    const githubApiUrl = "https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits";

    // Validasi bahasa target
    if (!ALLOWED_LANGUAGES.includes(targetLang)) {
        console.warn(`Bahasa ${targetLang} tidak didukung.`);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Bahasa ${targetLang} tidak didukung.` }),
        };
    }

    const headers = {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
    };

    try {
        const response = await fetch(githubApiUrl, { headers });
        if (!response.ok) throw new Error("Gagal mengambil data commit");

        const commits = await response.json();
        if (commits.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Tidak ada commit ditemukan" }),
            };
        }

        // Ambil commit terbaru
        const latestCommit = commits[0];
        const message = latestCommit.commit.message;

        console.log("Pesan asli commit terbaru:", message);

        // Cek apakah sudah ada di Redis
        const redisKey = `latest_commit_${targetLang}`;
        const cachedData = await getAsync(redisKey);

        if (cachedData) {
            console.log("Commit terbaru ditemukan di Redis, mengembalikan data dari cache.");
            return {
                statusCode: 200,
                body: cachedData,
            };
        }

        // Terjemahkan commit
        const translatedMessage = await translate(message, "en", targetLang);

        // Simpan commit terbaru ke Redis
        const commitData = {
            author: latestCommit.commit.author.name,
            originalMessage: message,
            translatedMessage,
            date: latestCommit.commit.author.date,
        };

        await setAsync(redisKey, JSON.stringify(commitData), "EX", 3600); // TTL: 1 jam

        console.log("Commit terbaru disimpan ke Redis dengan key:", redisKey);

        return {
            statusCode: 200,
            body: JSON.stringify(commitData),
        };
    } catch (error) {
        console.error("Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error fetching or translating commits", error: error.toString() }),
        };
    }
};
