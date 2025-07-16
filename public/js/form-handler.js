// Form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const formData = {
                name: event.target.name.value,
                email: event.target.email.value,
                message: event.target.message.value,
            };

            try {
                const response = await fetch("https://faa-form-backend.vercel.app/api/handle-form", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();
                alert(data.status === "success" 
                    ? "Message sent successfully!" 
                    : "Error: " + data.message);
                
                event.target.reset();
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            }
        });
    }
});