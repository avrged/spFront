let loadedCSS = new Set();

function openRegistroModal() {
    fetch('registro.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const formSection = doc.querySelector('section.form');
            
            if (formSection) {
                document.getElementById('registroContent').innerHTML = formSection.outerHTML;
                
                loadModalCSS('registro');
                
                const modal = document.getElementById('registroModal');
                modal.style.display = 'flex';
                
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                
                loadRegistroScript();
            }
        })
        .catch(error => console.error('Error cargando registro:', error));
}

function closeRegistroModal() {
    const modal = document.getElementById('registroModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('registroContent').innerHTML = '';
        const registroCSS = document.getElementById('modal-registro-css');
        if (registroCSS) {
            registroCSS.remove();
            loadedCSS.delete('modal-registro-css');
        }
    }, 300);
}

function loadRegistroScript() {
    loadScript('../Scripts/registro.js');
    
    setTimeout(() => {
        if (typeof initializeRegistroForm === 'function') {
            initializeRegistroForm();
        }
    }, 100);
}

function openLoginAdminModal() {
    fetch('loginAdmin.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const formSection = doc.querySelector('section.form');
            
            if (formSection) {
                document.getElementById('loginAdminContent').innerHTML = formSection.outerHTML;
                
                loadModalCSS('login-admin');
                
                const modal = document.getElementById('loginAdminModal');
                modal.style.display = 'flex';
                
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                

                loadScript('../Scripts/login.js', () => {
                    console.log('Script de login cargado');
                    
                    let attempts = 0;
                    const maxAttempts = 5;
                    
                    function tryInitialize() {
                        attempts++;
                        console.log(`Intento ${attempts} de inicialización...`);
                        
                        if (typeof initializeLoginForm === 'function') {
                            initializeLoginForm();
                        } else if (attempts < maxAttempts) {
                            setTimeout(tryInitialize, 100);
                        } else {
                            console.log('No se pudo inicializar después de ' + maxAttempts + ' intentos');
                        }
                    }
                    
                    setTimeout(tryInitialize, 100);
                });
            }
        })
        .catch(error => console.error('Error cargando loginAdmin:', error));
}

function closeLoginAdminModal() {
    const modal = document.getElementById('loginAdminModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('loginAdminContent').innerHTML = '';
        const loginAdminCSS = document.getElementById('modal-login-admin-css');
        if (loginAdminCSS) {
            loginAdminCSS.remove();
            loadedCSS.delete('modal-login-admin-css');
        }
    }, 300);
}

function openLoginRestModal() {
    fetch('loginRest.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const formSection = doc.querySelector('section.form');
            
            if (formSection) {
                document.getElementById('loginRestContent').innerHTML = formSection.outerHTML;
                
                loadModalCSS('login-rest');
                
                const modal = document.getElementById('loginRestModal');
                modal.style.display = 'flex';
                
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                
                loadLoginScript();
            }
        })
        .catch(error => console.error('Error cargando loginRest:', error));
}

function closeLoginRestModal() {
    const modal = document.getElementById('loginRestModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('loginRestContent').innerHTML = '';
        const loginRestCSS = document.getElementById('modal-login-rest-css');
        if (loginRestCSS) {
            loginRestCSS.remove();
            loadedCSS.delete('modal-login-rest-css');
        }
    }, 300);
}

function loadLoginScript() {
    loadScript('../Scripts/login.js');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    function tryInitialize() {
        attempts++;
        if (typeof initializeLoginForm === 'function') {
            console.log('Ejecutando initializeLoginForm... (intento ' + attempts + ')');
            initializeLoginForm();
        } else if (attempts < maxAttempts) {
            setTimeout(tryInitialize, 100);
        } else {
            console.log('No se pudo inicializar initializeLoginForm después de ' + maxAttempts + ' intentos');
        }
    }
    
    setTimeout(tryInitialize, 200);
}

function openLoginModal() {
    fetch('loginSelect.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const chooseSection = doc.querySelector('section.choose');
            
            if (chooseSection) {
                document.getElementById('loginContent').innerHTML = chooseSection.outerHTML;
                
                loadModalCSS('login');
                
                const modal = document.getElementById('loginModal');
                modal.style.display = 'flex';
                
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                
                setupLoginModalButtons();
            }
        })
        .catch(error => console.error('Error cargando login:', error));
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('loginContent').innerHTML = '';
        const loginCSS = document.getElementById('modal-login-css');
        if (loginCSS) {
            loginCSS.remove();
            loadedCSS.delete('modal-login-css');
        }
    }, 300);
}

function setupLoginModalButtons() {
    const registerLink = document.querySelector('.register-link');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeLoginModal();
            
            setTimeout(() => {
                openRegistroModal();
            }, 100);
        });
    }
    
    const buttons = document.querySelectorAll('.button');
    
    if (buttons[0]) {
        buttons[0].addEventListener('click', function(e) {
            e.preventDefault();
            closeLoginModal();
            setTimeout(() => {
                openLoginAdminModal();
            }, 100);
        });
    }
    
    if (buttons[1]) {
        buttons[1].addEventListener('click', function(e) {
            e.preventDefault();
            closeLoginModal();
            setTimeout(() => {
                openLoginRestModal();
            }, 100);
        });
    }
}

function loadModalCSS(modalType) {
    const cssId = `modal-${modalType}-css`;
    
    if (!loadedCSS.has(cssId)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = cssId;
        
        switch(modalType) {
            case 'login-admin':
                link.href = '../styles/modal-login-admin.css';
                break;
            case 'login-rest':
                link.href = '../styles/modal-login-rest.css';
                break;
            case 'login':
                link.href = '../styles/modal-login.css';
                break;
            case 'registro':
                link.href = '../styles/modal-registro.css';
                break;
            default:
                link.href = `../styles/modal-${modalType}.css`;
        }
        
        document.head.appendChild(link);
        loadedCSS.add(cssId);
    }
}

function loadScript(src, callback) {
    if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement('script');
        script.src = src;
        
        if (callback) {
            script.onload = callback;
        }
        
        document.head.appendChild(script);
    } else if (callback) {
        callback();
    }
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        if (event.target.id === 'registroModal') {
            closeRegistroModal();
        } else if (event.target.id === 'loginModal') {
            closeLoginModal();
        } else if (event.target.id === 'loginAdminModal') {
            closeLoginAdminModal();
        } else if (event.target.id === 'loginRestModal') {
            closeLoginRestModal();
        }
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeRegistroModal();
        closeLoginModal();
        closeLoginAdminModal();
        closeLoginRestModal();
    }
});