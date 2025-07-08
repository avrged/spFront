function openLoginAdminModal() {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '../styles/modal-login-admin.css';
    if (!document.querySelector(`link[href="${cssLink.href}"]`)) {
        document.head.appendChild(cssLink);
    }
    
    fetch('loginAdmin.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const formSection = doc.querySelector('.form');
            if (formSection) {
                document.getElementById('loginAdminContent').innerHTML = formSection.outerHTML;
                const script = document.createElement('script');
                script.src = '../Scripts/login.js';
                document.head.appendChild(script);
            }
            document.getElementById('loginAdminModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error cargando loginAdmin.html:', error);
        });
}

function closeLoginAdminModal() {
    document.getElementById('loginAdminModal').style.display = 'none';
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('loginAdminModal');
    if (event.target === modal) {
        closeLoginAdminModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginAdminModal();
    }
});
