const API_CONFIG = {
    BASE_URL: 'http://localhost:7070',
    ENDPOINTS: {
        RESTAURANTEROS: '/api/restauranteros',
        USUARIOS: '/api/usuarios',
        ADMIN: '/api/admin'
    }
};

class SazonAPI {
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getAllRestauranteros() {
        return this.request(API_CONFIG.ENDPOINTS.RESTAURANTEROS);
    }

    static async getRestauranteroById(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.RESTAURANTEROS}/${id}`);
    }

    static async createRestaurantero(data) {
        return this.request(API_CONFIG.ENDPOINTS.RESTAURANTEROS, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async updateRestaurantero(id, data) {
        return this.request(`${API_CONFIG.ENDPOINTS.RESTAURANTEROS}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async deleteRestaurantero(id) {
        return this.request(`${API_CONFIG.ENDPOINTS.RESTAURANTEROS}/${id}`, {
            method: 'DELETE'
        });
    }

    static async getAllUsuarios() {
        return this.request(API_CONFIG.ENDPOINTS.USUARIOS);
    }

    static async createUsuario(data) {
        return this.request(API_CONFIG.ENDPOINTS.USUARIOS, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async loginUsuario(credentials) {
        return this.request(`${API_CONFIG.ENDPOINTS.USUARIOS}/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
}

class UIUtils {
    static showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            zIndex: '9999',
            fontWeight: 'bold',
            backgroundColor: type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    static showError(message) {
        this.showMessage(message, 'error');
    }

    static showSuccess(message) {
        this.showMessage(message, 'success');
    }

    static showLoading(show = true) {
        let loader = document.getElementById('global-loader');
        
        if (show && !loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = '<div class="spinner"></div>';
            
            Object.assign(loader.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: '9998'
            });

            const spinner = loader.querySelector('.spinner');
            Object.assign(spinner.style, {
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            });

            document.body.appendChild(loader);
        } else if (!show && loader) {
            loader.remove();
        }
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
