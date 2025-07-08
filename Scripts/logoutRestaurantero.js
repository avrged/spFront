document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.log-out-parent');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    const miRestauranteBtn = document.querySelector('.mi-restaurante-parent');
    if (miRestauranteBtn) {
        miRestauranteBtn.addEventListener('click', function() {
            window.location.href = 'vistaEdicionRest.html';
        });
    }
});
