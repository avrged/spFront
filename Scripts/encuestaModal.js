function abrirModalEncuesta() {
    document.getElementById('encuestaModal').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('encuestaModal').classList.add('show');
    }, 10);
}

window.cerrarModalEncuesta = function() {
    document.getElementById('encuestaModal').classList.remove('show');
    setTimeout(() => {
        document.getElementById('encuestaModal').style.display = 'none';
    }, 300);
};

document.getElementById('cerrarModalEncuesta').onclick = cerrarModalEncuesta;

document.getElementById('encuestaModal').onclick = function(e) {
    if (e.target === this) cerrarModalEncuesta();
};