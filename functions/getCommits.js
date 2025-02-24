const fetch = require('node-fetch'); // Menggunakan fetch untuk API call

exports.handler = async function(event, context) {
    const apiKey = process.env.GITHUB_TOKEN; // Mengambil token dari environment variables
    const apiUrl = `https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits`;

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/vnd.github.v3+json",
    };

    try {
        const response = await fetch(apiUrl, { headers });
        const commits = await response.json();
        if (response.ok) {
            return {
                statusCode: 200,
                body: JSON.stringify(commits),
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error fetching commits' }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching commits' }),
        };
    }
};
