// Definisikan fungsi async fetchData()
async function fetchData() {
    try {
        // Ganti '/some-data' dengan endpoint yang valid
        const response = await fetch('/some-data');

        // Cek jika respons tidak OK (misalnya 404, 500, dll.)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Cek jika respons adalah JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new TypeError("Respons bukan JSON!");
        }

        // Parse data JSON
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error selama fetch:', error);

        // Tampilkan pesan error ke pengguna (opsional)
        const commitList = document.getElementById('commitList');
        if (commitList) {
            commitList.innerHTML = 'Gagal memuat data. Silakan coba lagi nanti.';
        }
    }
}

// Panggil fungsi fetchData() ketika DOM siap
document.addEventListener("DOMContentLoaded", function () {
    fetchData(); // Panggil fungsi fetchData setelah DOM selesai dimuat
});

/// ===============================================================================================================================================================================================
/// ============ HEADER NAVBAR ====================================================================================================================================================================
/// ===============================================================================================================================================================================================
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    header.classList.toggle('scrolled', window.scrollY > 0);
});
document.getElementById("contactLink").addEventListener("click", function() {
    document.getElementById("menuCheckbox").checked = false;
});

const menu = document.getElementById("menu");

// Function to open/close the menu
menuToggle.addEventListener("click", function() {
    document.body.classList.toggle("menu-open"); // Toggle the scroll locking on body
});

// Menutup menu responsif saat link diklik
document.querySelectorAll('#menu a').forEach(link => {
    link.addEventListener('click', () => {
        const menuCheckbox = document.getElementById('menuCheckbox');
        if (menuCheckbox.checked) {
            menuCheckbox.checked = false; // Uncheck menuCheckbox
        }
    });
});

// Function to toggle between light and dark mode
function toggleDarkMode() {
    const body = document.body;
    const modeIcon = document.getElementById("modeIcon");
    
    body.classList.toggle("dark-mode"); // Toggle class
    if (body.classList.contains("dark-mode")) {
        modeIcon.classList.remove("bi-sun");
        modeIcon.classList.add("bi-moon");  // Change icon to moon for dark mode
    } else {
        modeIcon.classList.remove("bi-moon");
        modeIcon.classList.add("bi-sun");  // Change icon to sun for light mode
    }
}

// Add event listeners for the dark mode toggle buttons
document.getElementById("lightModeToggleNavbar").addEventListener("click", toggleDarkMode);
document.getElementById("lightModeToggleMenu").addEventListener("click", toggleDarkMode);

/// ===============================================================================================================================================================================================
/// ============ HERO SECTION - VIDEO =============================================================================================================================================================
/// ===============================================================================================================================================================================================
// Function to set the theme based on time (AM/PM)
function setThemeBasedOnTime() {
    const now = new Date();
    const hours = now.getHours();
    console.log('Current Hour: ', hours); // Memastikan nilai jam

    if (hours >= 6 && hours < 18) {
        // Daytime: Light Mode
        document.body.classList.remove('dark-mode');
        document.body.classList.add('light-mode');
        changeBackgroundVideo("light");
    } else {
        // Nighttime: Dark Mode
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
        changeBackgroundVideo("dark");
    }
}

// Function to toggle light/dark mode when the button is clicked
function toggleTheme() {
    const body = document.body;
    const modeIcon = document.getElementById("modeIcon");
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        modeIcon.classList.remove("bi-sun");
        modeIcon.classList.add("bi-moon");
        changeBackgroundVideo("dark");
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        modeIcon.classList.remove("bi-moon");
        modeIcon.classList.add("bi-sun");
        changeBackgroundVideo("light");
    }
    // Save the current theme to localStorage
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
}    

// Function to change the background video based on the current theme
function changeBackgroundVideo(theme) {
    const video = document.getElementById("backgroundVideo");
    if (theme === "dark") {
        video.src = "assets/bg-dark.mp4";  // Dark mode video
    } else {
        video.src = "assets/bg-light.mp4";  // Light mode video
    }
}

// On page load, apply the theme based on time
window.addEventListener('DOMContentLoaded', () => {
    // Apply the theme based on current time (morning to evening -> light, else dark)
    setThemeBasedOnTime();

    // Set up event listeners for theme toggles if you need manual switch
    document.getElementById("lightModeToggleNavbar").addEventListener("click", toggleTheme);
    document.getElementById("lightModeToggleMenu").addEventListener("click", toggleTheme);
});

/// ===============================================================================================================================================================================================
/// ============ PROJECT SECTION ==================================================================================================================================================================
/// ===============================================================================================================================================================================================
fetch('/.netlify/functions/getCommits')
    .then(response => response.json())
    .then(data => {
        const commitList = document.getElementById('commitList');
        if (Array.isArray(data) && data.length > 0) {
            const latestCommit = data[0]; // Ambil hanya commit terbaru
            const date = new Date(latestCommit.commit.author.date).toLocaleDateString();
            commitList.innerHTML = `
                <p><strong>${latestCommit.committer.login}</strong> - ${latestCommit.commit.message} (${date})</p>
            `;
        } else {
            commitList.innerHTML = 'No commits found.';
        }
    })
    .catch(error => {
        console.error('Error fetching commits:', error);
        document.getElementById('commitList').innerHTML = 'Error fetching commits';
    });

/// ===============================================================================================================================================================================================
/// ============ FOOTER SECTION ===================================================================================================================================================================
/// ===============================================================================================================================================================================================
document.getElementById("year").textContent = new Date().getFullYear();

/// ===============================================================================================================================================================================================
/// ============ COOKIES ==========================================================================================================================================================================
/// ===============================================================================================================================================================================================
document.addEventListener('DOMContentLoaded', function () {
    // Check if the user has already accepted the cookies
    if (!getCookie('cookie_accepted')) {
        // Show the cookie notice if not accepted
        document.getElementById('cookie-notice').classList.remove('cookie-notice-hidden');
        document.getElementById('cookie-notice').classList.add('cookie-notice-visible');
    }

    // Event listener for the "Ok" button to accept cookies
    document.getElementById('cn-accept-cookie').addEventListener('click', function () {
        setCookie('cookie_accepted', 'true', 365);  // Set the cookie for 365 days
        document.getElementById('cookie-notice').classList.remove('cookie-notice-visible');
        document.getElementById('cookie-notice').classList.add('cookie-notice-hidden');
    });

    // Event listener for the close button
    document.getElementById('cn-close-notice').addEventListener('click', function () {
        document.getElementById('cookie-notice').classList.remove('cookie-notice-visible');
        document.getElementById('cookie-notice').classList.add('cookie-notice-hidden');
    });
});

// Function to set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie by name
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}