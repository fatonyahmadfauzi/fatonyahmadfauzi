document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch('/.netlify/functions/submit-form', {
        method: "POST",
        body: JSON.stringify({
          name: sanitizeInput(event.target.name.value),
          email: sanitizeInput(event.target.email.value),
          message: sanitizeInput(event.target.message.value)
        })
      });
      
      const data = await response.json();
      alert(data.status === "success" ? "Pesan terkirim!" : "Error: " + data.message);
      event.target.reset();
    } catch (error) {
      alert("Error mengirim pesan");
    }
  });
});