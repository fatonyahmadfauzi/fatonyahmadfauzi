const fetch = require('node-fetch'); // Jika menggunakan 'node-fetch' untuk API request

exports.handler = async function(event, context) {
    const apiKey = process.env.GITHUB_TOKEN; // Mengambil API Key dari environment variables
    const apiUrl = `https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits?access_token=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const commits = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(commits)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching commits' })
        };
    }
};
