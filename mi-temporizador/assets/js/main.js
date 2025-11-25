import { initTimer } from './timer.js';
import { initTasks } from './tasks.js';

document.addEventListener('DOMContentLoaded', () => {
  initTimer();
  initTasks();
});


document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('infoPdfBtn');
  if (!btn) return;
  // pega aquí la URL del PDF que elijas:
  const pdfUrl = "https://www.lms.cl/web/wp-content/uploads/2020/03/M%C3%A9todo-Pomodoro-1.pdf"; // ejemplo opción 1
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.open(pdfUrl, '_blank', 'noopener');
  });
});




