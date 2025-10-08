// File: public/js/form-handler.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();

            // GANTI URL DI BAWAH INI
            const apiUrl = "https://gmail-services.vercel.app/api/handle-form";

            const formData = {
                name: event.target.name.value,
                email: event.target.email.value,
                message: event.target.message.value,
            };

            try {
                const response = await fetch(apiUrl, { // Gunakan apiUrl yang baru
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();
                if (data.status === "success") {
                    alert("Pesan berhasil terkirim!");
                    event.target.reset();
                } else {
                    alert("Error: " + data.message);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("Terjadi kesalahan. Silakan coba lagi nanti.");
            }
        });
    }
});