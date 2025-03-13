// Fungsi untuk mencegah XSS (Cross-Site Scripting)
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

(function() {
    // Blokir kombinasi tombol tertentu
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey && event.key === 'U') || 
            (event.ctrlKey && event.shiftKey && event.key === 'J') || 
            (event.key === 'F12')) {
            event.preventDefault();
            console.log("Akses ke DevTools dinonaktifkan.");
        }
    });
})();

// Menampilkan peringatan di Console Developer
(function() {
    console.log("%c PERHATIAN!", "color: red; font-size: 40px; font-weight: bold;");
    console.log(
        "%cMenggunakan fitur ini untuk tujuan yang tidak sah dapat melanggar kebijakan kami.\n" +
        "Jika Anda tidak yakin, tutup tab ini dan hindari menempelkan skrip tidak dikenal.",
        "color: white; background: black; font-size: 16px; padding: 8px;"
    );
})();

// Mode Debug Aman
(function() {
    const developerModeToken = "YOUR_SECURE_TOKEN";
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("debug") === developerModeToken) {
        console.log("%c Debug Mode Aktif", "color: green; font-size: 20px; font-weight: bold;");
    } else {
        console.log("%c DevTools Akses Dibatasi!", "color: red; font-size: 20px;");
    }
})();
