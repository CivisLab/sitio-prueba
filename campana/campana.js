// «Ver como» de la pestaña de campaña (sitio/campana): cada rol ve solo las secciones que lleva en data-roles.
// Sin este guion se ven todas. El rol elegido no se guarda: al volver a abrir, se ve todo.
(function () {
  var botones = document.querySelectorAll('.rol[data-rol]');
  var partes = document.querySelectorAll('.campana [data-roles]');
  var nota = document.getElementById('rol-nota');
  function ver(rol) {
    botones.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.rol === rol)); });
    partes.forEach(function (p) { p.hidden = p.dataset.roles.split(' ').indexOf(rol) < 0; });
    if (nota) nota.textContent = rol === 'gerente' ? 'Cada rol ve solo lo que necesita para decidir.'
      : 'Vista reducida para este rol. Cambie a «Gerencia» para ver todo.';
  }
  botones.forEach(function (b) { b.addEventListener('click', function () { ver(b.dataset.rol); }); });
})();
