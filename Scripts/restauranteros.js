class RestauranterosManager {
    static currentRestauranteros = [];
    static currentEditingId = null;

    static async loadAllRestauranteros() {
        try {
            UIUtils.showLoading(true);
            this.currentRestauranteros = await SazonAPI.getAllRestauranteros();
            this.displayRestauranteros();
            UIUtils.showSuccess(`${this.currentRestauranteros.length} restauranteros cargados`);
        } catch (error) {
            UIUtils.showError('Error al cargar restauranteros: ' + error.message);
            this.currentRestauranteros = [];
        } finally {
            UIUtils.showLoading(false);
        }
    }

    static displayRestauranteros() {
        const container = document.getElementById('restauranteros-list');
        if (!container) return;

        if (this.currentRestauranteros.length === 0) {
            container.innerHTML = '<p class="no-data">No hay restauranteros disponibles</p>';
            return;
        }

        container.innerHTML = this.currentRestauranteros.map(r => `
            <div class="restaurantero-card" data-id="${r.codigorestaurantero || r.id_usuario}">
                <div class="card-header">
                    <h3>${r.nombreU}</h3>
                    <span class="status-badge ${r.status === 1 ? 'active' : 'inactive'}">
                        ${r.status === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <div class="card-body">
                    <p><strong>Correo:</strong> ${r.correo}</p>
                    <p><strong>RFC:</strong> ${r.rfc || 'No especificado'}</p>
                    <p><strong>Tipo:</strong> ${r.tipo || 'restaurantero'}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="RestauranterosManager.editRestaurantero(${r.codigorestaurantero || r.id_usuario})">
                        Editar
                    </button>
                    <button class="btn-delete" onclick="RestauranterosManager.deleteRestaurantero(${r.codigorestaurantero || r.id_usuario})">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    static async createRestaurantero(data) {
        try {
            UIUtils.showLoading(true);
            await SazonAPI.createRestaurantero(data);
            UIUtils.showSuccess('Restaurantero creado exitosamente');
            await this.loadAllRestauranteros();
            this.clearForm();
        } catch (error) {
            UIUtils.showError('Error al crear restaurantero: ' + error.message);
        } finally {
            UIUtils.showLoading(false);
        }
    }

    static async updateRestaurantero(id, data) {
        try {
            UIUtils.showLoading(true);
            await SazonAPI.updateRestaurantero(id, data);
            UIUtils.showSuccess('Restaurantero actualizado exitosamente');
            await this.loadAllRestauranteros();
            this.clearForm();
        } catch (error) {
            UIUtils.showError('Error al actualizar restaurantero: ' + error.message);
        } finally {
            UIUtils.showLoading(false);
        }
    }

    static async deleteRestaurantero(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este restaurantero?')) {
            return;
        }

        try {
            UIUtils.showLoading(true);
            await SazonAPI.deleteRestaurantero(id);
            UIUtils.showSuccess('Restaurantero eliminado exitosamente');
            await this.loadAllRestauranteros();
        } catch (error) {
            UIUtils.showError('Error al eliminar restaurantero: ' + error.message);
        } finally {
            UIUtils.showLoading(false);
        }
    }

    static async editRestaurantero(id) {
        try {
            const restaurantero = await SazonAPI.getRestauranteroById(id);
            this.fillForm(restaurantero);
            this.currentEditingId = id;
            
            const form = document.getElementById('restaurantero-form-container');
            if (form) {
                form.scrollIntoView({ behavior: 'smooth' });
            }
        } catch (error) {
            UIUtils.showError('Error al cargar datos del restaurantero: ' + error.message);
        }
    }

    static fillForm(restaurantero) {
        const form = document.getElementById('restaurantero-form');
        if (!form) return;

        const nombreField = document.getElementById('nombre');
        const correoField = document.getElementById('correo');
        const rfcField = document.getElementById('rfc');
        
        if (nombreField) nombreField.value = restaurantero.nombreU || '';
        if (correoField) correoField.value = restaurantero.correo || '';
        if (rfcField) rfcField.value = restaurantero.rfc || '';
        
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Actualizar Restaurantero';
        }
    }

    static clearForm() {
        const form = document.getElementById('restaurantero-form');
        if (form) {
            form.reset();
            this.currentEditingId = null;
            
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Crear Restaurantero';
            }
        }
    }

    static initForm() {
        const form = document.getElementById('restaurantero-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                nombreU: document.getElementById('nombre').value.trim(),
                correo: document.getElementById('correo').value.trim(),
                contrasena: document.getElementById('contrasena').value,
                rfc: document.getElementById('rfc')?.value.trim() || null,
                tipo: 'restaurantero'
            };

            if (!formData.nombreU || !formData.correo || !formData.contrasena) {
                UIUtils.showError('Nombre, correo y contraseña son obligatorios');
                return;
            }

            if (!formData.correo.includes('@')) {
                UIUtils.showError('Formato de correo inválido');
                return;
            }

            if (this.currentEditingId) {
                await this.updateRestaurantero(this.currentEditingId, formData);
            } else {
                await this.createRestaurantero(formData);
            }
        });

        const cancelBtn = document.getElementById('cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.body.classList.contains('require-auth')) {
        if (!AuthManager.requireAuth()) return;
    }

    RestauranterosManager.initForm();
    RestauranterosManager.loadAllRestauranteros();
});
