INSTRUCCIONES RÁPIDAS

1) Estructura:
   - index.html
   - assets/css/styles.css
   - assets/js/{main.js, timer.js, tasks.js}
   - assets/images/{logo.jpeg, cerebro1.png, cerebro2.png, cerebro3.png}

2) Abrir:
   - Basta con abrir index.html en el navegador (doble clic o arrastrar al navegador).
   - Para notificaciones en navegadores modernos es necesario HTTPS o "localhost". Si abres desde archivo (file://) la petición de permiso a veces puede no funcionar.

3) Si prefieres no usar módulos (compatibilidad antigua):
   - En vez de <script type="module" src="assets/js/main.js"></script>
     puedes concatenar los archivos y cargarlos con <script defer src="..."></script>,
     pero la versión actual usa módulos (ES modules).

4) Notas:
   - Mantén las imágenes en assets/images/ con los nombres indicados.
   - Si deseas un ZIP con todos los archivos listos, dímelo y te lo preparo.
