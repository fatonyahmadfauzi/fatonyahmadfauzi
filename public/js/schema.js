// schema.js
const schemaData = [
    {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Fatony Ahmad Fauzi",
        "alternateName": "fatonyahmadfauzi",
        "url": "https://fatonyahmadfauzi.me/",
        "sameAs": [
            "https://www.linkedin.com/in/fatonyahmadfauzi",
            "https://github.com/fatonyahmadfauzi",
            "https://www.instagram.com/fatonyahmadfauzi",
            "https://www.tiktok.com/@fatonyahmadfauzi",
            "https://twitter.com/fatonyahmad89",
            "https://facebook.com/fatonyahmadfauzi",
            "https://www.youtube.com/@fatonyahmadfauzi",
            "https://www.twitch.tv/fatonyahmadfauzi",
            "https://www.threads.net/@fatonyahmadfauzi",
            "https://shopee.co.id/fatonyahmad88",
            "https://wa.me/6289638230725",
            "https://t.me/fatonyahmadfauzi",
            "https://www.scribd.com/document/Fatony-Ahmad-Fauzi",
            "https://discord.com/users/554284939055726603",
            "https://steamcommunity.com/id/fatonyahmadfauzi"
        ],
        "jobTitle": "Web Developer",
        "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Cikahuripan, Kabupaten Bogor",
            "addressRegion": "Jawa Barat",
            "postalCode": "16710",
            "addressCountry": "ID"
        },
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "telephone": "+6289638230725",
                "contactType": "Pribadi",
                "contactOption": "WhatsApp",
                "email": "fatonyahmadfauzi@gmail.com",
                "areaServed": "Indonesia",
                "availableLanguage": ["Bahasa Indonesia", "English"]
            }
        ]
    },
    {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "Video Hero - Light and Dark Mode",
        "description": "A dynamic hero section video that changes based on the time of day.",
        "thumbnailUrl": "https://og-media-worker.fatonyahmadfauzi.workers.dev/image",
        "uploadDate": "2025-02-17T12:00:00Z",
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