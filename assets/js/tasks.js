// assets/js/tasks.js
export function initTasks() {
  const STORAGE_KEY = 'tomato_tasks_v1';
  const taskTextInput = document.getElementById('taskText');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const taskListEl = document.getElementById('taskList');
  const filters = document.querySelectorAll('.filter-btn');
  const remainingBadge = document.getElementById('remainingBadge');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');

  let tasks = []; // {id, text, done}

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);

  function loadTasks(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch(e){
      tasks = [];
    }
  }
  function saveTasks(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

  function renderTasks(filter = 'all'){
    taskListEl.innerHTML = '';
    const filtered = tasks.filter(t => {
      if (filter === 'all') return true;
      if (filter === 'active') return !t.done;
      if (filter === 'completed') return t.done;
    });

    if (filtered.length === 0){
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No hay tareas en esta vista.';
      taskListEl.appendChild(empty);
    } else {
      filtered.forEach((task) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.setAttribute('draggable', 'true');
        item.dataset.id = task.id;

        // checkbox
        const cb = document.createElement('button');
        cb.className = 'task-checkbox' + (task.done ? ' checked' : '');
        cb.setAttribute('aria-pressed', String(task.done));
        cb.title = task.done ? 'Marcar como pendiente' : 'Marcar como completada';
        cb.addEventListener('click', () => toggleTask(task.id));
        cb.innerHTML = task.done ? '&#10003;' : '';
        item.appendChild(cb);

        // text
        const txt = document.createElement('div');
        txt.className = 'task-text' + (task.done ? ' completed' : '');
        txt.textContent = task.text;
        txt.setAttribute('tabindex', '0');
        txt.addEventListener('dblclick', () => editTaskPrompt(task.id));
        txt.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); editTaskPrompt(task.id); }
        });
        item.appendChild(txt);

        // actions
        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'small-btn';
        editBtn.title = 'Editar';
        editBtn.innerHTML = '✏️';
        editBtn.addEventListener('click', () => editTaskPrompt(task.id));
        actions.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.className = 'small-btn';
        delBtn.title = 'Eliminar';
        delBtn.innerHTML = '🗑️';
        delBtn.addEventListener('click', () => {
          if (confirm('Eliminar tarea?')) removeTask(task.id);
        });
        actions.appendChild(delBtn);

        item.appendChild(actions);

        // drag-and-drop handlers
        item.addEventListener('dragstart', (e) => {
          item.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', task.id);
        });
        item.addEventListener('dragend', () => { item.classList.remove('dragging'); });

        item.addEventListener('dragover', (e) => {
          e.preventDefault(); e.dataTransfer.dropEffect = 'move';
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer.getData('text/plain');
          const targetId = task.id;
          if (!draggedId || draggedId === targetId) return;
          reorderTasks(draggedId, targetId);
        });

        taskListEl.appendChild(item);
      });
    }

    updateRemaining();
  }

  function addTask(text){
    const trimmed = (text || '').trim();
    if (!trimmed) return false;
    tasks.push({ id: uid(), text: trimmed, done: false });
    saveTasks();
    renderTasks(getActiveFilter());
    return true;
  }

  function toggleTask(id){
    tasks = tasks.map(t => t.id === id ? {...t, done: !t.done} : t);
    saveTasks();
    renderTasks(getActiveFilter());
  }

  function removeTask(id){
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks(getActiveFilter());
  }

  function editTaskPrompt(id){
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newText = prompt('Editar tarea:', task.text);
    if (newText === null) return;
    const trimmed = newText.trim();
    if (!trimmed) {
      alert('El texto no puede quedar vacío.');
      return;
    }
    tasks = tasks.map(t => t.id === id ? {...t, text: trimmed} : t);
    saveTasks();
    renderTasks(getActiveFilter());
  }

  function reorderTasks(draggedId, targetId){
    const from = tasks.findIndex(t => t.id === draggedId);
    const to = tasks.findIndex(t => t.id === targetId);
    if (from < 0 || to < 0 || from === to) return;
    const [item] = tasks.splice(from, 1);
    tasks.splice(to, 0, item);
    saveTasks();
    renderTasks(getActiveFilter());
  }

  function clearCompleted(){
    if (!confirm('¿Borrar todas las tareas completadas?')) return;
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    renderTasks(getActiveFilter());
  }

  function getActiveFilter(){
    const active = document.querySelector('.filter-btn.active');
    return active ? active.dataset.filter : 'all';
  }

  function updateRemaining(){
    const rem = tasks.filter(t => !t.done).length;
    remainingBadge.textContent = `${rem} pendiente${rem === 1 ? '' : 's'}`;
  }

  // event wiring
  addTaskBtn.addEventListener('click', () => {
    const ok = addTask(taskTextInput.value);
    if (ok) taskTextInput.value = '';
    taskTextInput.focus();
  });

  taskTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTaskBtn.click();
    }
  });

  filters.forEach(f => f.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    f.classList.add('active');
    renderTasks(f.dataset.filter);
  }));

  clearCompletedBtn.addEventListener('click', clearCompleted);

  // initialize
  loadTasks();
  renderTasks();

  // support drop on list container to append at end
  taskListEl.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  taskListEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId) return;
    const from = tasks.findIndex(t => t.id === draggedId);
    if (from < 0) return;
    const [item] = tasks.splice(from,1);
    tasks.push(item);
    saveTasks();
    renderTasks(getActiveFilter());
  });

  // Return small API if se quiere usar desde fuera
  return {
    addTask,
    clearCompleted,
  };
}

// tabs.js — JavaScript puro para alternar pestañas dentro de un contenedor .nube
(function () {
  'use strict';

  // Inicializa las pestañas al cargar el DOM
  document.addEventListener('DOMContentLoaded', initTabs);

  function initTabs() {
    // Delegación: escucha clicks en cualquier .tabs dentro de .nube
    document.body.addEventListener('click', function (ev) {
      const clickedTab = ev.target.closest('.nube .tab');
      if (!clickedTab) return; // no es una tab -> salir

      // Si la tab contiene un <a>, prevenir navegación al hacer click
      const anchor = clickedTab.querySelector('a');
      if (anchor && ev.target.closest('a')) {
        ev.preventDefault();
      }

      toggleActive(clickedTab);
    });

    // Soporte de teclado: Enter / Space activan la tab cuando .tab tiene foco
    document.body.addEventListener('keydown', function (ev) {
      const focusedTab = document.activeElement;
      if (!focusedTab || !focusedTab.classList.contains('tab')) return;

      if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        toggleActive(focusedTab);
      }
    });

    // Inicializar atributos aria en tabs existentes (asegura consistencia)
    document.querySelectorAll('.nube .tab').forEach((t) => {
      if (!t.hasAttribute('role')) t.setAttribute('role', 'tab');
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '0');
      if (!t.hasAttribute('aria-selected')) t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
    });

    // Observador para cuando se agreguen nuevas .tab dinámicamente
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (!m.addedNodes) continue;
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          node.querySelectorAll && node.querySelectorAll('.tab').forEach(initSingleTab);
          if (node.classList && node.classList.contains('tab')) initSingleTab(node);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function initSingleTab(tabEl) {
      if (!tabEl.hasAttribute('role')) tabEl.setAttribute('role', 'tab');
      if (!tabEl.hasAttribute('tabindex')) tabEl.setAttribute('tabindex', '0');
      if (!tabEl.hasAttribute('aria-selected')) tabEl.setAttribute('aria-selected', tabEl.classList.contains('active') ? 'true' : 'false');
    }
  }

  // Quita .active de hermanas y lo pone en clicked, actualiza aria-selected
  function toggleActive(tabEl) {
    // Buscar el contenedor padre de tabs (si usas .tabs) — si no, usa el contenedor .nube
    const tabsContainer = tabEl.closest('.tabs') || tabEl.closest('.nube') || document;
    const siblingTabs = tabsContainer.querySelectorAll('.tab');

    siblingTabs.forEach((t) => {
      if (t === tabEl) return;
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    // Activa la tab clickeada
    tabEl.classList.add('active');
    tabEl.setAttribute('aria-selected', 'true');
  }
})();
