function abrirModalMembresia() {
    document.getElementById('membresiaModal').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('membresiaModal').classList.add('show');
    }, 10);
}

window.cerrarModalMembresia = function() {
    document.getElementById('membresiaModal').classList.remove('show');
    setTimeout(() => {
        document.getElementById('membresiaModal').style.display = 'none';
    }, 300);
};

document.getElementById('cerrarModalMembresia').onclick = cerrarModalMembresia;

document.getElementById('membresiaModal').onclick = function(e) {
    if (e.target === this) cerrarModalMembresia();
};