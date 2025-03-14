document.addEventListener("DOMContentLoaded", function () {
    const metaTag = document.createElement("meta");
    metaTag.setAttribute("property", "og:updated_time");
    metaTag.setAttribute("content", Math.floor(Date.now() / 1000)); // Unix timestamp
    document.head.appendChild(metaTag);
    console.log("Meta tag og:updated_time telah ditambahkan:", metaTag);
});
