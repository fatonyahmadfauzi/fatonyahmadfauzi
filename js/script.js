const menuToggle = document.getElementById("menuToggle");
const menu = document.getElementById("menu");

// Function to open/close the menu
menuToggle.addEventListener("click", function() {
    menu.classList.toggle("open"); // Toggle the 'open' class for menu visibility
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
