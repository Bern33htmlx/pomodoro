// assets/js/logo-pulse.js
(function(){
  // Ajusta estos valores a tu preferencia
  const LOGO_MS = 2500;     // tiempo que se muestra SOLO EL LOGO (ms)
  const MESSAGE_MS = 2500;  // tiempo que se muestra el mensaje grande (ms)

  const overlay = document.getElementById('splashOverlay');
  const logo = document.getElementById('splashLogo');
  const message = document.getElementById('splashMessage');
  if(!overlay || !logo || !message) return;

  // Respeta prefers-reduced-motion: si está activado, no animar; mostrar breve y quitar
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){
    overlay.parentNode && overlay.parentNode.removeChild(overlay);
    return;
  }

  // Bloquear scroll mientras dure el splash (clase usada por CSS)
  document.documentElement.classList.add('splash-active');
  document.body.classList.add('splash-active');

  // Asegurar visibilidad inmediata
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';

  // Fase 1: mostrar logo solo -> espera LOGO_MS
  setTimeout(()=> {
    try {
      // Detener la animación del logo (opcional) y ocultarlo
      logo.style.animation = 'none';
      logo.style.display = 'none';
    } catch(e){}

    // Mostrar mensaje central
    message.setAttribute('aria-hidden','false');
    message.classList.add('show');

    // Fase 2: mostrar mensaje MESSAGE_MS, luego ocultar overlay
    setTimeout(()=> {
      // ocultar overlay con transición
      overlay.classList.add('hidden');

      // Eliminar del DOM tras la transición (420ms coincide con CSS)
      setTimeout(()=>{
        if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.documentElement.classList.remove('splash-active');
        document.body.classList.remove('splash-active');
      }, 420);
    }, MESSAGE_MS);

  }, LOGO_MS);

  // Safety fallback: en 6s forzar limpieza por si algo falla
  setTimeout(()=>{
    if(document.body.classList.contains('splash-active')){
      overlay.classList.add('hidden');
      setTimeout(()=>{
        if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        document.documentElement.classList.remove('splash-active');
        document.body.classList.remove('splash-active');
      }, 420);
    }
  }, 6000);
})();
