const dateElement = document.querySelector('.date-message');
const timeElement = document.querySelector('.time-message');
let currentLanguage = 'en'; // Default language
let currentLang = {}; // Menyimpan teks terjemahan dari JSON

const languageOptions = {
    en: { locale: 'en-US', greetings: ["Good Morning", "Good Afternoon", "Good Evening", "Good Night"] },
    id: { locale: 'id-ID', greetings: ["Selamat Pagi", "Selamat Siang", "Selamat Sore", "Selamat Malam"] },
    pl: { locale: 'pl-PL', greetings: ["Dzień dobry", "Dobry wieczór", "Dobry wieczór", "Dobranoc"] },
    zh: { locale: 'zh-CN', greetings: ["早上好", "下午好", "晚上好", "晚安"] },
    jp: { locale: 'ja-JP', greetings: ["おはようございます", "こんにちは", "こんばんは", "おやすみなさい"] },
    de: { locale: 'de-DE', greetings: ["Guten Morgen", "Guten Tag", "Guten Abend", "Gute Nacht"] },
    fr: { locale: 'fr-FR', greetings: ["Bonjour", "Bon après-midi", "Bonsoir", "Bonne nuit"] },
    es: { locale: 'es-ES', greetings: ["Buenos días", "Buenas tardes", "Buenas noches", "Buenas noches"] },
    ru: { locale: 'ru-RU', greetings: ["Доброе утро", "Добрый день", "Добрый вечер", "Спокойной ночи"] },
    pt: { locale: 'pt-PT', greetings: ["Bom dia", "Boa tarde", "Boa noite", "Boa noite"] },
    kr: { locale: 'ko-KR', greetings: ["좋은 아침", "좋은 오후", "좋은 저녁", "잘 자요"] }
};

// Update waktu dan tanggal
function updateDateTime() {
    const now = new Date();
    const { locale, greetings } = languageOptions[currentLanguage];
    const hour = now.getHours();
    const greetingIndex = hour < 12 ? 0 : hour < 17 ? 1 : hour < 20 ? 2 : 3;
    
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString(locale, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    if (timeElement) {
        timeElement.textContent = `${greetings[greetingIndex]}, ${(hour % 12 || 12)}:${now.getMinutes().toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
    }
}

// Ganti bahasa
async function changeLanguage(lang) {
    currentLanguage = lang;
    try {
        const response = await fetch(`../lang/${lang}.json`);
        currentLang = await response.json();
        updateUI();
    } catch (error) {
        console.error("Error:", error);
    }
}

// Update antarmuka
function updateUI() {
    // Update navigasi
    const navElements = {
        nameHome: ['nameHome', 'menuHome'],
        nameProject: ['nameProject', 'menuProject'],
        nameAbout: ['nameAbout', 'menuAbout'],
        nameContact: ['nameContact', 'contactLink']
    };
    
    Object.entries(navElements).forEach(([key, ids]) => {
        ids.forEach(id => {
            const element = document.getElementById(id);
            if (element && currentLang[key]) {
                element.textContent = currentLang[key];
            }
        });
    });

    // Update konten dinamis
    const dynamicContent = {
        contactMeText: 'contactMeText',
        nameLabel: 'nameLabel',
        emailLabel: 'emailLabel',
        messageLabel: 'messageLabel',
        submitBtn: 'submitBtn',
        myLocationText: 'myLocationText',
        locationText: 'locationText',
        cookieNotice: 'cn-notice-text',
        videoFallback: 'backgroundVideo + p',
        myProjects: 'myProjectsText',
        languages: 'languagesText',
        footerAuthor: 'footer-name'
    };
    
    Object.entries(dynamicContent).forEach(([key, selector]) => {
        const element = selector.startsWith('#') ? 
            document.querySelector(selector) : 
            document.getElementById(selector);
            
        if (element && currentLang[key]) {
            element.textContent = currentLang[key];
        }
    });

    // Update footer
    const footerContent = {
        resourceHeading: 'resourceHeading',
        bootstrapLink: 'bootstrapLink',
        githubLink: 'githubLink',
        netlifyLink: 'netlifyLink',
        vscodeLink: 'vscodeLink',
        activityHeading: 'activityHeading',
        fullstackLink: 'fullstackLink',
        uiuxLink: 'uiuxLink',
        graphicDesignLink: 'graphicDesignLink',
        gamerLink: 'gamerLink',
        socialHeading: 'socialHeading',
        instagramLink: 'instagramLink',
        tiktokLink: 'tiktokLink',
        twitterLink: 'twitterLink',
        facebookLink: 'facebookLink'
    };
    
    Object.entries(footerContent).forEach(([key, id]) => {
        const element = document.getElementById(id);
        if (element && currentLang[key]) {
            element.textContent = currentLang[key];
        }
    });

    // Update bendera
    const flagElement = document.getElementById('languageFlag');
    if (flagElement && currentLang.flagClass) {
        flagElement.className = currentLang.flagClass;
    }

    // Update tahun
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    updateDateTime();
}

// Inisialisasi
window.addEventListener('DOMContentLoaded', () => {
    changeLanguage(currentLanguage);
    setInterval(updateDateTime, 1000); // Update per detik
});