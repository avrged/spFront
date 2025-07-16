// Manejo de autenticación y registro
class AuthManager {
    static currentUser = null;

    static async login(email, password) {
        try {
            UIUtils.showLoading(true);
            
            const credentials = {
                correo: email,
                contrasena: password
            };

            const response = await SazonAPI.loginUsuario(credentials);
            
            if (response && response.user) {
                this.currentUser = response.user;
                localStorage.setItem('sazon_user', JSON.stringify(response.user));
                UIUtils.showSuccess('¡Bienvenido a SazonPT!');
                return true;
            } else {
                throw new Error('Credenciales inválidas');
            }
        } catch (error) {
            UIUtils.showError('Error al iniciar sesión: ' + error.message);
            return false;
        } finally {
            UIUtils.showLoading(false);
        }
    }

    static async register(userData) {
        try {
            UIUtils.showLoading(true);

            // Validaciones básicas
            if (!userData.nombreU || !userData.correo || !userData.contrasena) {
                throw new Error('Todos los campos son obligatorios');
            }

            if (!userData.correo.includes('@')) {
                throw new Error('Formato de correo inválido');
            }

            if (userData.contrasena.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            const response = await SazonAPI.createUsuario(userData);
            UIUtils.showSuccess('¡Registro exitoso! Ya puedes iniciar sesión');
            return true;

        } catch (error) {
            UIUtils.showError('Error en el registro: ' + error.message);
            return false;
        } finally {
            UIUtils.showLoading(false);
        }
    }

    static logout() {
        this.currentUser = null;
        localStorage.removeItem('sazon_user');
        UIUtils.showSuccess('Sesión cerrada exitosamente');
        window.location.href = '../index.html';
    }

    static getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('sazon_user');
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        return this.currentUser;
    }

    static isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    static requireAuth() {
        if (!this.isLoggedIn()) {
            UIUtils.showError('Debes iniciar sesión para acceder a esta página');
            window.location.href = '../pages/loginSelect.html';
            return false;
        }
        return true;
    }
}

// Formulario de login
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const success = await AuthManager.login(email, password);
            if (success) {
                // Redirigir según el tipo de usuario
                const user = AuthManager.getCurrentUser();
                if (user.tipo === 'restaurantero') {
                    window.location.href = 'vistaPrincipalRestaurantero.html';
                } else if (user.tipo === 'admin') {
                    window.location.href = 'vistaPrincipalAdmin.html';
                } else {
                    window.location.href = '../index.html';
                }
            }
        });
    }
}

// Formulario de registro
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userData = {
                nombreU: document.getElementById('nombre').value,
                correo: document.getElementById('email').value,
                contrasena: document.getElementById('password').value,
                telefono: document.getElementById('telefono')?.value || null,
                direccion: document.getElementById('direccion')?.value || null
            };

            const success = await AuthManager.register(userData);
            if (success) {
                setTimeout(() => {
                    window.location.href = 'loginSelect.html';
                }, 2000);
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initLoginForm();
    initRegisterForm();
    
    // Verificar si hay un usuario logueado y mostrar info
    const user = AuthManager.getCurrentUser();
    if (user) {
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.textContent = `Bienvenido, ${user.nombreU}`;
        }
    }
});
