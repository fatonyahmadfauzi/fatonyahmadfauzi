const { promisify } = require("util");
const redis = require("redis");
const fetch = require("node-fetch");
const { translate } = require("./translate");
require("dotenv").config();

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => console.log("Terhubung ke Redis Cloud"));
redisClient.on("error", (err) => console.error("Redis error:", err));

const setAsync = promisify(redisClient.set).bind(redisClient);
const getAsync = promisify(redisClient.get).bind(redisClient);

const ALLOWED_LANGUAGES = ["de", "en", "es", "fr", "id", "ja", "ko", "pl", "pt", "ru", "zh"];

exports.handler = async function (event, context) {
    const githubToken = process.env.GITHUB_TOKEN;
    const targetLang = event.queryStringParameters.lang || "en";

    if (!ALLOWED_LANGUAGES.includes(targetLang)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Bahasa ${targetLang} tidak didukung.` }),
        };
    }

    const githubApiUrl = "https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits";

    const headers = {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
    };

    try {
        const response = await fetch(githubApiUrl, { headers });
        const responseBody = await response.text();
        console.log("GitHub API Response:", responseBody);

        if (!response.ok) throw new Error("Gagal mengambil data commit");

        const commits = JSON.parse(responseBody);
        if (commits.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Tidak ada commit ditemukan" }),
            };
        }

        const latestCommit = commits[0];
        const message = latestCommit.commit.message;

        const redisKey = `commit:${message}:${targetLang}`;
        const cachedData = await getAsync(redisKey);

        if (cachedData) {
            console.log("Terjemahan ditemukan di Redis, mengembalikan data dari cache.");
            return {
                statusCode: 200,
                body: cachedData,
            };
        }

        const translatedMessage = await translate(message, "en", targetLang);

        await setAsync(
            redisKey,
            JSON.stringify({
                author: latestCommit.commit.author.name,
                originalMessage: message,
                translatedMessage,
                date: latestCommit.commit.author.date,
            }),
            "EX",
            3600
        );

        console.log("Hasil terjemahan disimpan ke Redis dengan key:", redisKey);

        return {
            statusCode: 200,
            body: JSON.stringify({
                author: latestCommit.commit.author.name,
                originalMessage: message,
                translatedMessage,
                date: latestCommit.commit.author.date,
            }),
        };
    } catch (error) {
        console.error("Error fetching commits:", error.message);
        return {
            statusCode: 502,
            body: JSON.stringify({ message: "Gagal mengambil data commit", error: error.toString() }),
        };
    }
};
