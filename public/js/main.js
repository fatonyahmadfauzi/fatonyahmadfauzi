// Fungsi untuk mencegah XSS (Cross-Site Scripting)
function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

(function() {
    // Blokir kombinasi tombol tertentu
    document.addEventListener('keydown', function(event) {
        if ((event.ctrlKey && event.key === 'U') || // Ctrl + U (View Source)
            (event.ctrlKey && event.shiftKey && event.key === 'J') || // Ctrl + Shift + J (Console)
            (event.key === 'F12')) { // F12 (DevTools)
            event.preventDefault();
            alert("Fitur ini dinonaktifkan!");
        }
    });

    // Deteksi Developer Tools menggunakan Fake Loop
    setInterval(function() {
        if (window.outerWidth - window.innerWidth > 200 || window.outerHeight - window.innerHeight > 200) {
            document.body.innerHTML = "<h1>Developer tools terdeteksi! Akses diblokir.</h1>";
        }
    }, 1000);
})();

// Menampilkan peringatan di Console Developer
(function() {
    console.log("%c Berhenti!", "color: red; font-size: 50px; font-weight: bold;");
    console.log(
        "%cIni adalah fitur browser yang ditujukan untuk developer. Jika seseorang meminta Anda untuk menyalin-menempel sesuatu di sini untuk mengaktifkan fitur Facebook atau 'meretas' akun seseorang, ini adalah penipuan dan akan memberikannya akses ke akun Anda.",
        "color: white; background: black; font-size: 16px; padding: 10px;"
    );
    console.log("Lihat https://www.facebook.com/selfxss untuk informasi selengkapnya.");
})();
