function openRegistroModal() {
    fetch('registro.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const chooseSection = doc.querySelector('.form');
            
            if (chooseSection) {
                document.getElementById('registroContent').innerHTML = chooseSection.outerHTML;
            }
            
            document.getElementById('registroModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error cargando registro.html:', error);
            document.getElementById('registroModal').style.display = 'flex';
        });
}

function closeLoginModal() {
    document.getElementById('registroModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('registroModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
});
