if (localStorage.getItem('jsEnabled') === 'true') {
    window.location.href = '/index';
}
window.onload = function() {
    localStorage.setItem('jsEnabled', 'true');
};
