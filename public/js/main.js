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
})();

// Menampilkan peringatan di Console Developer
(function() {
    console.log("%c Berhenti!", "color: red; font-size: 50px; font-weight: bold;");
    console.log(
        "%cIni adalah fitur browser yang ditujukan untuk developer. Jika seseorang meminta Anda untuk menyalin-menempel sesuatu di sini untuk mengaktifkan fitur Websites atau 'meretas' akun seseorang, ini adalah penipuan dan akan memberikannya akses ke akun Anda.",
        "color: white; background: black; font-size: 16px; padding: 10px;"
    );
})();
