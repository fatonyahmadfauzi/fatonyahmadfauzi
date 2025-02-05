const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const apiUrl = 'https://api.github.com/repos/fatonyahmadfauzi/Kianoland-Group/commits';

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
