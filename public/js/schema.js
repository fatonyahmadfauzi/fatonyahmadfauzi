// schema.js
const schemaData = [
    {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Fatony Ahmad Fauzi",
        "url": "https://fatonyahmadfauzi.me/",
        "sameAs": [
            "https://www.linkedin.com/in/fatonyahmadfauzi",
            "https://github.com/fatonyahmadfauzi",
            "https://www.instagram.com/fatonyahmadfauzi",
            "https://www.tiktok.com/@fatonyahmadfauzi",
            "https://twitter.com/fatonyahmad89",
            "https://facebook.com/fatonyahmadfauzi"
        ],
        "jobTitle": "Web Developer",
        "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
        }
    },
    {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "Video Hero - Light and Dark Mode",
        "description": "A dynamic hero section video that changes based on the time of day.",
        "thumbnailUrl": "https://og-media-worker.fatonyahmadfauzi.workers.dev/image",
        "uploadDate": "2025-02-17",
        "contentUrl": "https://og-media-worker.fatonyahmadfauzi.workers.dev/video",
        "embedUrl": "https://fatonyahmadfauzi.me/",
        "duration": "PT1M",
        "author": {
            "@type": "Person",
            "name": "Fatony Ahmad Fauzi",
            "url": "https://fatonyahmadfauzi.me/"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Fatony Ahmad Fauzi"
        },
        "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/WatchAction",
            "userInteractionCount": 1000
        }
    }
];

document.addEventListener('DOMContentLoaded', function() {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData, null, 2); // Formatting untuk debugging
    document.head.appendChild(script);
});