function openLoginRestModal() {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '../styles/modal-login-rest.css';
    if (!document.querySelector(`link[href="${cssLink.href}"]`)) {
        document.head.appendChild(cssLink);
    }
    
    fetch('loginRest.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const formSection = doc.querySelector('.form');
            if (formSection) {
                document.getElementById('loginRestContent').innerHTML = formSection.outerHTML;
                
                const script = document.createElement('script');
                script.src = '../Scripts/login.js';
                document.head.appendChild(script);
            }
            document.getElementById('loginRestModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error cargando loginRest.html:', error);
        });
}

function closeLoginRestModal() {
    document.getElementById('loginRestModal').style.display = 'none';
}

document.addEventListener('click', function(event) {    const modal = document.getElementById('loginRestModal');
    if (event.target === modal) {
        closeLoginRestModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginRestModal();
    }
});
