// assets/js/timer.js
export function initTimer() {
    
  // ELEMENTOS principales (usamos tus ids: btn-play, btn-pause, btn-refresh)
  const modeButtons = document.querySelectorAll('.mode-btn');
  const counterEl = document.querySelector('.counter');

  // botones existentes en tu HTML según lo pegado
  let btnPlay = document.getElementById('btn-play');
  let btnPause = document.getElementById('btn-pause');
  let btnRefresh = document.getElementById('btn-refresh');

  // otros botones/elementos (fuegos originales)
  let resetBtn = document.getElementById('resetBtn'); // en caso de que exista otro reset
  let loopBtn = document.getElementById('loopBtn');
  const loopToggleNav = document.getElementById('loopToggle');
  const themeToggle = document.getElementById('themeToggle');
  const themeDot = document.getElementById('themeDot');
  const characterEl = document.querySelector('.character');
  const brainImg = document.getElementById('brainImg');
  const customBtn = document.getElementById('customBtn');

  // SVG fallback strings (no forzamos inyección ahora, porque tu HTML ya trae SVGs inline)
  const SVG_REFRESH = '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 34a22 22 0 1 0 6-15"/><path d="M12 12 L20 6 L22 14"/></g></svg>';

  // --- Estado del temporizador ---
  let currentMinutes = 25;
  let timeRemaining = currentMinutes * 60;
  let timerId = null;
  let running = false;
  let loopMode = false;

  // --- Utilidades ---
  function formatTime(s) {
    s = Math.max(0, Math.round(s));
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${m}:${secs}`;
  }
  function updateCounterDisplay() { if (counterEl) counterEl.textContent = formatTime(timeRemaining); }

  // Adaptación: si tus elementos tienen otros selectores, los buscamos como fallback
  if (!btnPlay) btnPlay = document.querySelector('[data-action="play"], .play-btn, button.play');
  if (!btnPause) btnPause = document.querySelector('[data-action="pause"], .pause-btn, button.pause');
  if (!btnRefresh) btnRefresh = document.querySelector('[data-action="reset"], .reset-btn, button.reset, #resetBtn');

  // Si hay un botón 'resetBtn' adicional, preferimos btnRefresh pero mantenemos compatibilidad
  if (!btnRefresh && resetBtn) btnRefresh = resetBtn;

  // Helper visual: marcar botones según estado
  function setRunningVisuals(isRunning) {
    running = isRunning;
    // Si existen botones separados: deshabilitamos/enhabilitamos según corresponda
    if (btnPlay) {
      btnPlay.disabled = isRunning;
      btnPlay.classList.toggle('is-running', isRunning);
    }
    if (btnPause) {
      btnPause.disabled = !isRunning;
      btnPause.classList.toggle('is-running', isRunning);
    }
    // Si tienes un reset específico que quieres destacar, no lo tocamos.
  }

  // --- Lógica de tick / start / stop / reset (igual que antes) ---
  function tick() {
    if (timeRemaining <= 0) {
      stopTimer();
      if (loopMode) {
        timeRemaining = currentMinutes * 60;
        startTimer();
        return;
      } else {
        // notificación final
        try { new Notification('Temporizador', { body: '¡Tiempo finalizado!' }); } catch (e) { }
        return;
      }
    }
    timeRemaining -= 1;
    updateCounterDisplay();
  }

  function startTimer() {
    if (running) return;
    running = true;
    timerId = setInterval(tick, 1000);
    // visual: si tienes botones separados, actualizamos su estado visual
    setRunningVisuals(true);

    characterEl?.classList.add('animate');
    try {
      const activeBtn = document.querySelector('.mode-btn.active');
      const mins = activeBtn ? parseInt(activeBtn.dataset.minutes || currentMinutes, 10) : currentMinutes;
      if (mins === 25) {
        brainImg && (brainImg.src = 'assets/imagenes/pajaro2.jpeg');
      } else {
        brainImg && (brainImg.src = 'assets/imagenes/pajaro3.jpeg');
      }
    } catch (e) { }
  }

  function stopTimer() {
    running = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
    setRunningVisuals(false);
    characterEl?.classList.remove('animate');
    try {
      const activeBtn = document.querySelector('.mode-btn.active');
      const mins = activeBtn ? parseInt(activeBtn.dataset.minutes || currentMinutes, 10) : currentMinutes;
      if (mins === 25) {
        brainImg && (brainImg.src = 'assets/imagenes/pajaro1.jpeg');
      } else {
        brainImg && (brainImg.src = 'assets/imagenes/pajaro3.jpeg');
      }
    } catch (e) { }
  }

  function resetTimer() {
    stopTimer();
    timeRemaining = currentMinutes * 60;
    updateCounterDisplay();
  }

  // --- Atachar listeners a los botones separados ---
  // btnPlay -> startTimer
  if (btnPlay) {
    // aseguramos que no haga submit si es button en un form
    if (btnPlay.tagName.toLowerCase() === 'button') btnPlay.setAttribute('type', 'button');
    btnPlay.addEventListener('click', (e) => {
      e.preventDefault();
      startTimer();
    });
    // estado inicial: play habilitado, pause deshabilitado
    btnPlay.disabled = false;
  }

  // btnPause -> stopTimer
  if (btnPause) {
    if (btnPause.tagName.toLowerCase() === 'button') btnPause.setAttribute('type', 'button');
    btnPause.addEventListener('click', (e) => {
      e.preventDefault();
      stopTimer();
    });
    // inicialmente pausa debe estar deshabilitado
    btnPause.disabled = true;
  }

  // btnRefresh -> resetTimer (si usas icon refresh para reset)
  if (btnRefresh) {
    if (btnRefresh.tagName.toLowerCase() === 'button') btnRefresh.setAttribute('type', 'button');
    btnRefresh.addEventListener('click', (e) => {
      e.preventDefault();
      resetTimer();
    });
  }

  // Si tu layout también tiene botones con ids distintos (ej: playPauseBtn), los atamos como respaldo
  const fallbackPlayPause = document.getElementById('playPauseBtn');
  if (fallbackPlayPause && !btnPlay && !btnPause) {
    // si no existen botones separados, usamos el fallback como toggle
    fallbackPlayPause.addEventListener('click', () => { if (running) stopTimer(); else startTimer(); });
  }

  // Mode buttons behavior original (sin cambios)
  modeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.id === 'loopToggle') {
        loopMode = !loopMode;
        btn.classList.toggle('active', loopMode);
        if (loopBtn) loopBtn.setAttribute('aria-pressed', String(loopMode));
        return;
      }
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const minutes = parseInt(btn.getAttribute('data-minutes') || '25', 10);
      currentMinutes = minutes;
      timeRemaining = currentMinutes * 60;
      resetTimer();
      updateCounterDisplay();
      try {
        if (minutes === 25) {
          brainImg && (brainImg.src = 'assets/imagenes/pajaro1.jpeg');
        } else {
          brainImg && (brainImg.src = 'assets/imagenes/pajaro3.jpeg');
        }
      } catch (e) { }
    });
  });

  // loopBtn fallback listener (por si lo usas)
  if (loopBtn) {
    loopBtn.addEventListener('click', () => {
      loopMode = !loopMode;
      loopBtn.setAttribute('aria-pressed', String(loopMode));
      loopBtn.style.background = loopMode ? 'linear-gradient(180deg,#fff,#f0e1d2)' : '';
    });
  }

  // theme toggle (igual que antes)
  if (themeToggle) {
    // Inicializar estado del toggle según la clase presente en el body
    (function initThemeToggleUI(){
      const is = document.body.classList.contains('navy-theme');
      themeToggle.setAttribute('aria-checked', String(is));
      if (themeDot) themeDot.style.transform = is ? 'translateX(18px)' : 'translateX(0)';
    })();

    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('navy-theme');
      const is = document.body.classList.contains('navy-theme');
      themeToggle.setAttribute('aria-checked', String(is));
      if (themeDot) themeDot.style.transform = is ? 'translateX(18px)' : 'translateX(0)';
    });
  }

  // customBtn (igual)
  if (customBtn) {
    customBtn.addEventListener('click', () => {
      const minutes = prompt('Introduce los minutos para el temporizador (número):', '25');
      if (minutes === null) return;
      const m = Math.max(1, Math.round(Number(minutes) || 25));
      currentMinutes = m;
      timeRemaining = currentMinutes * 60;
      resetTimer();
      modeButtons.forEach(b => b.classList.remove('active'));
      updateCounterDisplay();
    });
  }

  // inicializamos display del contador
  timeRemaining = currentMinutes * 60;
  updateCounterDisplay();

  // request Notification (igual)
  (function requestNotification(){
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      const onFirstClick = () => {
        Notification.requestPermission().catch(()=>{});
        document.removeEventListener('click', onFirstClick);
      };
      document.addEventListener('click', onFirstClick);
    }
  })();

  // Devuelve API externa para control desde otros scripts si quieres
  return {
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
    setMinutes: (m) => { currentMinutes = m; timeRemaining = currentMinutes * 60; updateCounterDisplay(); }
  };
}
/* ---------- Mover botones "buenos" a la zona de controles y quitar los "malos" ----------
   - Mueve los elementos con id #btn-refresh, #btn-play, #btn-pause (si existen)
     hacia la zona .controls donde estaban los iconos malos (#resetBtn, #playPauseBtn, #loopBtn).
   - Conserva listeners (porque movemos nodos, no clonamos).
   - Elimina/oculta los botones malos para que no queden duplicados.
   - Ejecutar DESPUÉS de initTimer() / después de que se hayan registrado los listeners.
------------------------------------------------------------------------------ */
(function moveGoodButtons() {
  // Evitar ejecutar varias veces
  if (window.__movedGoodButtonsDone) return;
  // Pequeño timeout para asegurarnos de que initTimer haya corrido (ajusta si necesitas más tiempo)
  setTimeout(() => {
    const controls = document.querySelector('.controls');
    if (!controls) { console.warn('moveGoodButtons: no se encontró .controls'); return; }

    // Selectores de los botones "malos" dentro de .controls (en el orden visual que quieres reemplazar)
    const badSelectorsInControls = ['#resetBtn', '#playPauseBtn', '#loopBtn'];

    // Encontramos las referencias de botones "buenos"
    const goodEls = [
      document.getElementById('btn-refresh'),
      document.getElementById('btn-play'),
      document.getElementById('btn-pause')
    ].filter(Boolean); // quitar nulls

    if (goodEls.length === 0) {
      console.warn('moveGoodButtons: no se encontraron botones buenos (btn-refresh / btn-play / btn-pause).');
      return;
    }

    // Recopilar placeholders (los nodos malos) en el contenedor .controls — mantiene el orden visual
    let placeholders = [];
    badSelectorsInControls.forEach(sel => {
      const p = controls.querySelector(sel);
      if (p) placeholders.push(p);
    });

    // Si no hay placeholders explícitos, tomamos los primeros 3 icon-btn dentro de .controls (fallback)
    if (placeholders.length === 0) {
      placeholders = Array.from(controls.querySelectorAll('.icon-btn')).slice(0, 3);
    }

    if (placeholders.length === 0) {
      console.warn('moveGoodButtons: no se encontraron placeholders en .controls para reemplazar.');
      return;
    }

    // Hacemos 1:1 en orden: mover goodEls[i] al lugar de placeholders[i]
    // Si hay más goods que placeholders, solo movemos hasta placeholders.length
    const moves = Math.min(goodEls.length, placeholders.length);
    let movedCount = 0;

    for (let i = 0; i < moves; i++) {
      const good = goodEls[i];
      const placeholder = placeholders[i];
      if (!good || !placeholder) continue;

      // Si ya está en el mismo contenedor, saltamos
      if (placeholder.contains(good)) { movedCount++; continue; }

      try {
        // Insertamos el botón bueno en la posición del placeholder:
        // usamos replaceChild para que el botón bueno quede exactamente donde estaba el malo
        const parent = placeholder.parentNode;
        // Asegurarnos de no clonar (se preservan listeners)
        parent.replaceChild(good, placeholder);
        movedCount++;
      } catch (err) {
        console.error('moveGoodButtons: fallo al mover botón', err);
      }
    }

    // Si quedaron placeholders extra (por ejemplo 3 placeholders pero solo 2 goods),
    // eliminamos los que sobran (estéticos)
    if (placeholders.length > movedCount) {
      for (let j = movedCount; j < placeholders.length; j++) {
        const p = placeholders[j];
        try {
          p.remove();
        } catch(e){}
      }
    }

    // Opcional: si los botones buenos estaban dentro de un contenedor superior que ahora quedó vacío,
    // lo ocultamos para evitar espacio en blanco (siempre que no afecte a layout):
    (function hideEmptyParentOfGoods() {
      goodEls.forEach(g => {
        const parent = g && g.parentElement;
        if (!parent) return;
        // Si el padre original quedó sin hijos útiles, lo ocultamos
        if (parent && parent !== document.body && parent.children.length === 0) {
          parent.style.display = 'none';
        }
      });
    })();

    window.__movedGoodButtonsDone = true;
    console.info(`moveGoodButtons: movidos ${movedCount} botones buenos a .controls (y eliminados placeholders sobrantes).`);
  }, 120); // tiempo en ms: aumenta si tu initTimer se ejecuta más tarde
})();


/* 
  Mueve los botones funcionales existentes a la posición de los iconos viejos en la parte superior.
  Pega esto al final de assets/js/timer.js (o ejecútalo después de initTimer()).
*/
(function moveFunctionalButtonsToPlaceholders(){
  // Tiempo de espera opcional para asegurar que todo esté renderizado (puedes quitar si llamas después de initTimer)
  setTimeout(() => {
    // Helpers para localizar tus botones funcionales (los que tienen listeners)
    const btnRefresh = document.getElementById('btn-refresh') || document.querySelector('[data-action="reset"], .reset-btn, #resetBtn');
    const btnPlay   = document.getElementById('btn-play')    || document.querySelector('[data-action="play"], .play-btn, #play');
    const btnPause  = document.getElementById('btn-pause')   || document.querySelector('[data-action="pause"], .pause-btn, #pause');
    const fallbackToggle = document.getElementById('playPauseBtn') || document.querySelector('[data-action="play-pause"], .play-pause');

    // Colección de nodos funcionales en el orden que queremos moverlos (prioridad)
    const functionalBtns = [];
    if (btnRefresh) functionalBtns.push(btnRefresh);
    if (btnPlay) functionalBtns.push(btnPlay);
    if (btnPause) functionalBtns.push(btnPause);
    // si no hay btnPlay/btnPause pero sí hay un toggle, lo llevamos en segundo plano (será 2º o 3º según disponibilidad)
    if (fallbackToggle && !functionalBtns.includes(fallbackToggle)) functionalBtns.push(fallbackToggle);

    // Buscamos SVG pequeños en la zona superior de la página que parezcan los iconos viejos
    const allSVGs = Array.from(document.querySelectorAll('svg'));
    const placeholders = allSVGs.filter(svg => {
      try {
        // filtro por viewBox 64x64 y por posición (top) y tamaño pequeño en pantalla
        const vb = svg.getAttribute('viewBox') || '';
        const rect = svg.getBoundingClientRect();
        const nearTop = rect.top >= 0 && rect.top < 220; // ajustar si tus icons están más abajo
        const small = rect.width > 8 && rect.width < 120; // evitar detectar logos grandes
        return vb.startsWith('0 0 64 64') && nearTop && small;
      } catch(e) {
        return false;
      }
    });

    if (placeholders.length === 0) {
      console.warn('moveFunctionalButtonsToPlaceholders: no se encontraron placeholders SVG en la parte superior.');
      return;
    }

    // Tomamos los padres de los SVG (normalmente botones o contenedores) y los ordenamos por su posición X para mantener orden visual
    const placeholderParents = placeholders.map(s => s.parentElement).filter(Boolean)
      .sort((a,b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);

    // Reemplazamos los primeros N placeholders con los botones funcionales moviéndolos (no clonándolos)
    // Esto conserva event listeners y estados.
    let moves = 0;
    for (let i = 0; i < functionalBtns.length && i < placeholderParents.length; i++) {
      const targetParent = placeholderParents[i];
      const btn = functionalBtns[i];

      // Si el botón funcional ya está dentro del targetParent, saltar
      if (!btn || !targetParent) continue;
      if (targetParent.contains(btn)) { moves++; continue; }

      try {
        // Reemplazar el nodo placeholderParent por el botón funcional.
        // Pero queremos mantener la estructura visual (envoltorio). Hacemos:
        //  - Creamos un contenedor wrapper para insertar el botón en la misma posición/estilos.
        const wrapper = document.createElement('div');
        // Copiamos atributos posicion/estilos del padre antiguo para minimizar cambios en CSS
        // (copy inline style helps if layout depends on it)
        wrapper.className = targetParent.className || '';
        wrapper.style.cssText = targetParent.style.cssText || '';
        // Insertamos el wrapper en el DOM donde estaba el padre viejo
        targetParent.parentNode.insertBefore(wrapper, targetParent);
        // Movemos el botón funcional dentro del wrapper
        wrapper.appendChild(btn);
        // Eliminamos el padre viejo
        targetParent.remove();
        moves++;
      } catch (err) {
        console.error('moveFunctionalButtonsToPlaceholders: fallo al mover botón:', err);
      }
    }

    console.info(`moveFunctionalButtonsToPlaceholders: movidos ${moves} botones funcionales a ${placeholderParents.length} placeholders encontrados.`);
  }, 80); // 80ms para dejar que otras inicializaciones terminen; si tu initTimer se ejecuta más tarde aumenta este valor.
})();
