function openLoginSelectModal() {
    fetch('loginSelect.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const chooseSection = doc.querySelector('.choose');
            if (chooseSection) {
                document.getElementById('loginSelectContent').innerHTML = chooseSection.outerHTML;
                
                setupLoginSelectButtons();
            }
            document.getElementById('loginSelectModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error cargando loginSelect.html:', error);
        });
}

function setupLoginSelectButtons() {
    loadScript('../Scripts/loginAdminModal.js');
    loadScript('../Scripts/loginRestModal.js');
    
    const adminButton = document.querySelector('.button[onclick*="admin"]');
    const restButton = document.querySelector('.button[onclick*="rest"]');
    
    if (adminButton) {
        adminButton.onclick = function(e) {
            e.preventDefault();
            closeLoginSelectModal();
            openLoginAdminModal();
        };
    }
    
    if (restButton) {
        restButton.onclick = function(e) {
            e.preventDefault();
            closeLoginSelectModal();
            openLoginRestModal();
        };
    }
}

function loadScript(src) {
    if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        document.head.appendChild(script);
    }
}

function closeLoginSelectModal() {
    document.getElementById('loginSelectModal').style.display = 'none';
}

document.addEventListener('click', function(event) {
    const loginModal = document.getElementById('loginSelectModal');
    if (event.target === loginModal) {
        closeLoginSelectModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginSelectModal();
    }
});
