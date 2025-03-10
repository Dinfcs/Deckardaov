// ==UserScript==
// @name         ApnMappepListing
// @namespace    https://cyborg.deckard.com/
// @version      1.6
// @description  Precarga el iframe oculto y lo muestra al hacer clic en el enlace. Minimiza en lugar de cerrar para optimizar la carga de datos sin dejar rastros visibles en la página principal.
// @author       TuNombre
// @match        https://cyborg.deckard.com/listing/*
// ==/UserScript==

(function() {
    'use strict';

    let iframeContainer; // Contenedor global para el iframe

    function modificarCeldas() {
        document.querySelectorAll('td.value[data-field-name="apn"]').forEach(td => {
            let p = td.querySelector('p');
            if (p && !td.dataset.modified) {
                let textoCompleto = p.innerHTML.trim(); // Mantiene HTML (incluyendo <em>)
                let textoSinEm = p.textContent.trim().split('(')[0].trim(); // Solo el APN (antes de <em>)

                // Crear el enlace
                let enlace = document.createElement('a');
                enlace.href = '#';
                enlace.innerHTML = textoCompleto; // Mantiene formato original (incluyendo <em>)
                enlace.style.color = 'blue';
                enlace.style.textDecoration = 'underline';
                enlace.style.cursor = 'pointer';

                // Evento al hacer clic
                enlace.addEventListener('click', async (e) => {
                    e.preventDefault();

                    // Copiar solo el APN al portapapeles
                    try {
                        await navigator.clipboard.writeText(textoSinEm);
                        mostrarNotificacion(`Copiado: ${textoSinEm}`);
                    } catch (err) {
                        console.error('Error al copiar:', err);
                        mostrarNotificacion('Error al copiar');
                    }

                    // Mostrar el iframe precargado
                    maximizarIframe();
                });

                // Reemplazar el contenido del párrafo con el enlace
                p.innerHTML = '';
                p.appendChild(enlace);
                td.dataset.modified = 'true'; // Evita modificar dos veces
            }
        });
    }

    function precargarIframe() {
        if (document.getElementById('iframe-container')) return; // Evita duplicados

        let url = window.location.href.replace(/\/[^/]+$/, '') + `?tab=all&subset=mapped`;

        // Crear contenedor del iframe (inicialmente oculto)
        iframeContainer = document.createElement('div');
        iframeContainer.id = 'iframe-container';
        iframeContainer.style.position = 'fixed';
        iframeContainer.style.bottom = '0';
        iframeContainer.style.left = '0';
        iframeContainer.style.width = '100%'; // Ocupa todo el ancho
        iframeContainer.style.height = '90vh'; // Ocupa el 90% de la altura de la pantalla
        iframeContainer.style.borderTop = '2px solid black';
        iframeContainer.style.background = 'white';
        iframeContainer.style.zIndex = '1000';
        iframeContainer.style.overflow = 'hidden';
        iframeContainer.style.display = 'none'; // Completamente oculto hasta que se maximice

        // Crear botón para minimizar el iframe
        let minimizeButton = document.createElement('button');
        minimizeButton.textContent = 'Minimizar';
        minimizeButton.style.position = 'absolute';
        minimizeButton.style.right = '10px';
        minimizeButton.style.top = '5px';
        minimizeButton.style.zIndex = '1001';
        minimizeButton.addEventListener('click', () => minimizarIframe());

        // Crear el iframe (precargado pero oculto)
        let iframe = document.createElement('iframe');
        iframe.id = 'custom-iframe';
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        // Agregar elementos al contenedor
        iframeContainer.appendChild(minimizeButton);
        iframeContainer.appendChild(iframe);
        document.body.appendChild(iframeContainer);
    }

    function maximizarIframe() {
        iframeContainer.style.display = 'block'; // Hace visible el iframe
    }

    function minimizarIframe() {
        iframeContainer.style.display = 'none'; // Oculta completamente el iframe
    }

    function mostrarNotificacion(mensaje) {
        let notif = document.createElement('div');
        notif.textContent = mensaje;
        notif.style.position = 'fixed';
        notif.style.bottom = '20px';
        notif.style.right = '20px';
        notif.style.background = 'black';
        notif.style.color = 'white';
        notif.style.padding = '10px 15px';
        notif.style.borderRadius = '5px';
        notif.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notif.style.zIndex = '9999';
        document.body.appendChild(notif);

        setTimeout(() => notif.remove(), 2000); // Desaparece después de 2 segundos
    }

    // Precargar el iframe minimizado al cargar la página
    window.addEventListener('load', precargarIframe);

    // Observar cambios en la tabla y modificar las celdas
    const observer = new MutationObserver(modificarCeldas);
    observer.observe(document.body, { childList: true, subtree: true });
})();
