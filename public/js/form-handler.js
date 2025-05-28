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
                const response = await fetch(process.env.FORM_SUBMISSION_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const text = await response.text();
                    console.log("Raw Response:", text);

                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.error("Failed to parse JSON:", e);
                        throw new Error("Invalid JSON from server");
                    }
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