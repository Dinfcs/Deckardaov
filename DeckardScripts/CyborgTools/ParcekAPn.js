// ==UserScript==
// @name         Modificar columna 0 y abrir en iframe con notificación
// @namespace    https://cyborg.deckard.com/
// @version      1.4
// @description  Convierte valores en la columna 0 en enlaces que copian el valor con notificación y abren la nueva URL en un iframe, pegando el valor en el filtro automáticamente.
// @author       TuNombre
// @match        https://cyborg.deckard.com/parcel/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    function modificarCeldas() {
        document.querySelectorAll('td[data-dash-column="parcel_apn"]').forEach(td => {
            let div = td.querySelector('.dash-cell-value');
            if (div && !td.dataset.modified) {
                let valor = div.textContent.trim();

                // Crear el enlace
                let enlace = document.createElement('a');
                enlace.href = '#';
                enlace.textContent = valor;
                enlace.style.color = 'blue';
                enlace.style.textDecoration = 'underline';
                enlace.style.cursor = 'pointer';

                // Evento al hacer clic
                enlace.addEventListener('click', (e) => {
                    e.preventDefault();

                    // Copiar al portapapeles
                    GM_setClipboard(valor);

                    // Mostrar notificación simple
                    mostrarNotificacion(`Copiado: ${valor}`);

                    // Construir la nueva URL
                    let nuevaURL = window.location.href.replace('/parcel/', '/listing/') + `?tab=all&subset=mapped`;

                    // Crear o actualizar el iframe
                    insertarIframe(nuevaURL, valor);
                });

                // Reemplazar contenido de la celda
                td.innerHTML = '';
                td.appendChild(enlace);
                td.dataset.modified = 'true'; // Evita modificar dos veces
            }
        });
    }

    function insertarIframe(url, valorApn) {
        let existingIframe = document.getElementById('custom-iframe');

        if (!existingIframe) {
            // Crear un contenedor para el iframe si no existe
            let container = document.createElement('div');
            container.id = 'iframe-container';
            container.style.position = 'fixed';
            container.style.bottom = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '50vh';
            container.style.borderTop = '2px solid black';
            container.style.background = 'white';
            container.style.zIndex = '1000';

            // Crear botón para cerrar el iframe
            let closeButton = document.createElement('button');
            closeButton.textContent = 'Cerrar';
            closeButton.style.position = 'absolute';
            closeButton.style.right = '10px';
            closeButton.style.top = '5px';
            closeButton.style.zIndex = '1001';
            closeButton.addEventListener('click', () => container.remove());

            // Crear el iframe
            let iframe = document.createElement('iframe');
            iframe.id = 'custom-iframe';
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.style.border = 'none';

            // Agregar elementos al contenedor
            container.appendChild(closeButton);
            container.appendChild(iframe);
            document.body.appendChild(container);

            // Esperar que el iframe cargue y luego pegar el valor en el filtro
            iframe.onload = () => pegarEnFiltroEnIframe(iframe, valorApn);

        } else {
            // Si el iframe ya existe, solo actualizamos la URL
            existingIframe.src = url;
            existingIframe.onload = () => pegarEnFiltroEnIframe(existingIframe, valorApn);
        }
    }

    function pegarEnFiltroEnIframe(iframe, valorApn) {
        let doc = iframe.contentDocument || iframe.contentWindow.document;
        if (!doc) return;

        let observer = new MutationObserver(() => {
            let filtroInput = doc.querySelector('th[data-dash-column="apn_mapped_via_cyborg"] input[type="text"]');
            if (filtroInput) {
                observer.disconnect();
                filtroInput.value = valorApn;
                filtroInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        observer.observe(doc, { childList: true, subtree: true });
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

    // Observar cambios en la tabla y modificar las celdas
    const observer = new MutationObserver(modificarCeldas);
    observer.observe(document.body, { childList: true, subtree: true });
})();
