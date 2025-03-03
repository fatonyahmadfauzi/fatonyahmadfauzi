document.getElementById('contactForm').addEventListener('submit', function (event) {
    let isValid = true;

    // Clear previous error messages
    document.getElementById('nameError').textContent = '';
    document.getElementById('emailError').textContent = '';
    document.getElementById('messageError').textContent = '';

    // Name validation
    const nameInput = document.getElementById('name');
    if (nameInput.value.trim() === '') {
        document.getElementById('nameError').textContent = currentLang.nameRequired || '* Name is required';
        isValid = false;
    }

    // Email validation
    const emailInput = document.getElementById('email');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput.value.trim() === '') {
        document.getElementById('emailError').textContent = currentLang.emailRequired || '* Email is required';
        isValid = false;
    } else if (!emailPattern.test(emailInput.value.trim())) {
        document.getElementById('emailError').textContent = currentLang.invalidEmail || '* Invalid email format';
        isValid = false;
    }

    // Message validation
    const messageInput = document.getElementById('message');
    if (messageInput.value.trim() === '') {
        document.getElementById('messageError').textContent = currentLang.messageRequired || '* Message is required';
        isValid = false;
    }

    // Prevent form submission if validation fails
    if (!isValid) {
        event.preventDefault();
    }
});

const dateElement = document.querySelector('.date-message');
const timeElement = document.querySelector('.time-message');
let currentLanguage = localStorage.getItem('selectedLang') || 'en';
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

// Fungsi untuk mengganti bahasa
async function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('selectedLang', lang); // Simpan ke localStorage
    try {
        const response = await fetch(`/lang/${lang}.json`);
        if (!response.ok) throw new Error(`Gagal memuat ${lang}.json`);
        currentLang = await response.json();
        updateUI();
    } catch (error) {
        console.error("Error memuat bahasa:", error);
    }
}

// Fungsi untuk mengambil commit dari Netlify Functions
async function fetchCommits() {
    document.getElementById('commitList').innerHTML = currentLang.loading || "Loading...";
    try {
        // Tambahkan parameter lang pada URL
        const response = await fetch(`/.netlify/functions/getCommits?lang=${currentLanguage}`);
        if (!response.ok) throw new Error("Gagal mengambil data commit");
        const data = await response.json();

        const commitList = document.getElementById('commitList');
        // Di dalam fetchCommits(), setelah const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            const latestCommit = data[0];
            const date = new Date(latestCommit.date).toLocaleDateString();
            commitList.innerHTML = `
                <p><strong>${latestCommit.author}</strong> - ${latestCommit.translatedMessage} (${date})</p>
            `;
        } else {
            commitList.innerHTML = currentLang.noCommits || "No commits found";
        }
    } catch (error) {
        console.error("Error fetching commits:", error);
        document.getElementById('commitList').innerHTML = currentLang.fetchError || "Error fetching commits";
    }
}

// Fungsi untuk memperbarui UI setelah bahasa diganti
function updateUI() {
    // Update teks commit
    fetchCommits();

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

    // Update footer dan elemen lainnya
    const elements = {
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
        footerAuthor: 'footer-name',
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

    Object.entries(elements).forEach(([key, id]) => {
        const element = document.getElementById(id);
        if (element && currentLang[key]) {
            element.textContent = currentLang[key];
        }
    });

    // Update ikon bendera bahasa
    const flagElement = document.getElementById('languageFlag');
    if (flagElement) {
        flagElement.className = currentLang.flagClass || "";
    }

    // Perbarui pesan error dengan bahasa baru
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    if (nameError && nameError.textContent) {
        nameError.textContent = currentLang.nameRequired || '* Name is required';
    }
    if (emailError && emailError.textContent) {
        emailError.textContent = currentLang.emailRequired || '* Email is required';
    }
    if (messageError && messageError.textContent) {
        messageError.textContent = currentLang.messageRequired || '* Message is required';
    }

    // Update waktu dan tanggal
    updateDateTime();
}

// Inisialisasi
window.addEventListener('DOMContentLoaded', async () => {
    await changeLanguage(currentLanguage);
    setInterval(updateDateTime, 1000); // Update per detik
});
