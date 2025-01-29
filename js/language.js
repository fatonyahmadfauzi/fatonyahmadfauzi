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

// Fungsi memperbarui waktu & salam
function updateDateTime() {
    const now = new Date();
    const { locale, greetings } = languageOptions[currentLanguage];

    // Format tanggal
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    if (dateElement) dateElement.textContent = now.toLocaleDateString(locale, options);

    // Format waktu & salam
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;

    let greeting = greetings[hours < 12 ? 0 : hours < 17 ? 1 : hours < 20 ? 2 : 3];

    if (timeElement) timeElement.textContent = `${greeting}, ${formattedHours}:${minutes} ${ampm}`;
}

// 🔹 **FETCH JSON SESUAI BAHASA YANG DIPILIH**
async function changeLanguage(lang) {
    currentLanguage = lang;

    try {
        const response = await fetch(`../lang/${lang}.json`); // ✅ PERBAIKAN PATH FETCH
        if (!response.ok) throw new Error('Gagal mengambil data bahasa');

        currentLang = await response.json();
        updateUI(); // Perbarui tampilan dengan teks dari JSON
    } catch (error) {
        console.error("Error:", error);
    }
}

// 🔹 **PERBARUI TEKS BERDASARKAN JSON**
function updateUI() {
    ['nameHome', 'nameProject', 'nameAbout', 'nameContact'].forEach(id => {
        const element = document.getElementById(id);
        if (element && currentLang[id]) element.textContent = currentLang[id];
    });

    // Update menu items with the existing keys
    const menuItems = [
        { id: 'menuHome', key: 'nameHome' },
        { id: 'menuProject', key: 'nameProject' },
        { id: 'menuAbout', key: 'nameAbout' },
        { id: 'contactLink', key: 'nameContact' }
    ];

    menuItems.forEach(item => {
        const element = document.getElementById(item.id);
        if (element && currentLang[item.key]) {
            element.textContent = currentLang[item.key];
        }
    });

    // Update ikon bendera bahasa
    const flagElement = document.getElementById('languageFlag');
    if (flagElement) {
        flagElement.className = currentLang.flagClass || "";
    }

    // Memperbarui teks di form kontak
    const contactElements = ['contactMeText', 'nameLabel', 'emailLabel', 'messageLabel', 'submitBtn', 'myLocationText'];
    contactElements.forEach(id => {
        const element = document.getElementById(id);
        if (element && currentLang[id]) {
            element.textContent = currentLang[id];
        }
    });

    // Memperbarui teks pemberitahuan cookie
    const cookieNoticeElement = document.getElementById('cn-notice-text');
    if (cookieNoticeElement && currentLang.cookieNotice) {
        cookieNoticeElement.textContent = currentLang.cookieNotice;
    }

    // Memperbarui fallback teks video
    const videoFallbackElement = document.querySelector('#backgroundVideo + p');
    if (videoFallbackElement && currentLang.videoFallback) {
        videoFallbackElement.textContent = currentLang.videoFallback;
    }

    // Memperbarui teks "My Projects" dan "Languages"
    const myProjectsElement = document.getElementById('myProjectsText');
    if (myProjectsElement && currentLang.myProjects) {
        myProjectsElement.textContent = currentLang.myProjects;
    }

    const languagesElement = document.getElementById('languagesText');
    if (languagesElement && currentLang.languages) {
        languagesElement.textContent = currentLang.languages;
    }


    // **FOOTER UPDATES**
    // Update Resource Section
    const resourceHeading = document.getElementById('resourceHeading');
    const bootstrapLink = document.getElementById('bootstrapLink');
    const githubLink = document.getElementById('githubLink');
    const netlifyLink = document.getElementById('netlifyLink');
    const vscodeLink = document.getElementById('vscodeLink');

    if (resourceHeading && currentLang.resourceHeading) resourceHeading.textContent = currentLang.resourceHeading;
    if (bootstrapLink && currentLang.bootstrapLink) bootstrapLink.textContent = currentLang.bootstrapLink;
    if (githubLink && currentLang.githubLink) githubLink.textContent = currentLang.githubLink;
    if (netlifyLink && currentLang.netlifyLink) netlifyLink.textContent = currentLang.netlifyLink;
    if (vscodeLink && currentLang.vscodeLink) vscodeLink.textContent = currentLang.vscodeLink;

    // Update Activity Section
    const activityHeading = document.getElementById('activityHeading');
    const fullstackLink = document.getElementById('fullstackLink');
    const uiuxLink = document.getElementById('uiuxLink');
    const graphicDesignLink = document.getElementById('graphicDesignLink');
    const gamerLink = document.getElementById('gamerLink');

    if (activityHeading && currentLang.activityHeading) activityHeading.textContent = currentLang.activityHeading;
    if (fullstackLink && currentLang.fullstackLink) fullstackLink.textContent = currentLang.fullstackLink;
    if (uiuxLink && currentLang.uiuxLink) uiuxLink.textContent = currentLang.uiuxLink;
    if (graphicDesignLink && currentLang.graphicDesignLink) graphicDesignLink.textContent = currentLang.graphicDesignLink;
    if (gamerLink && currentLang.gamerLink) gamerLink.textContent = currentLang.gamerLink;

    // Update Social Section
    const socialHeading = document.getElementById('socialHeading');
    const instagramLink = document.getElementById('instagramLink');
    const tiktokLink = document.getElementById('tiktokLink');
    const twitterLink = document.getElementById('twitterLink');
    const facebookLink = document.getElementById('facebookLink');

    if (socialHeading && currentLang.socialHeading) socialHeading.textContent = currentLang.socialHeading;
    if (instagramLink && currentLang.instagramLink) instagramLink.textContent = currentLang.instagramLink;
    if (tiktokLink && currentLang.tiktokLink) tiktokLink.textContent = currentLang.tiktokLink;
    if (twitterLink && currentLang.twitterLink) twitterLink.textContent = currentLang.twitterLink;
    if (facebookLink && currentLang.facebookLink) facebookLink.textContent = currentLang.facebookLink;

    // Update Year and Footer Author
    const yearElement = document.getElementById('year');
    const footerName = document.getElementById('footer-name');

    if (yearElement) yearElement.textContent = new Date().getFullYear();
    if (footerName && currentLang.footerAuthor) footerName.textContent = currentLang.footerAuthor;

    updateDateTime();
}

// **LOAD BAHASA SAAT HALAMAN DIMUAT**
window.addEventListener('DOMContentLoaded', () => {
    changeLanguage(currentLanguage);
    setInterval(updateDateTime, 60000);
});
