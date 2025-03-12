// ==UserScript==
// @name         ParcelApnMappeps
// @namespace    https://cyborg.deckard.com/
// @version      1.5
// @description  Convierte valores en la columna 0 en enlaces que copian el valor con notificación y abren la nueva URL en un iframe, pegando el valor en el filtro automáticamente.
// @author       TuNombre
// @match        https://cyborg.deckard.com/parcel/*
// ==/UserScript==

(function() {
    'use strict';

    // Comprobar si el script está ejecutándose dentro de un iframe
    if (window !== window.top) {
        return; // Si estamos dentro de un iframe, no ejecutar el script
    }

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
                enlace.addEventListener('click', async (e) => {
                    e.preventDefault();

                    // Copiar al portapapeles usando navigator.clipboard
                    try {
                        await navigator.clipboard.writeText(valor);
                        mostrarNotificacion(`copying: ${valor}`);
                    } catch (err) {
                        console.error('Error al copiar:', err);
                        mostrarNotificacion('Error al copiar');
                    }

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
            // Crear un contenedor para el iframe que se incrustará en la parte inferior de la página
            let container = document.createElement('div');
            container.id = 'iframe-container';
            container.style.position = 'relative'; // Se posiciona dentro del flujo normal de la página
            container.style.width = '100%';  // Ocupa todo el ancho de la página
            container.style.height = '50vh'; // Ajustar la altura según sea necesario
            container.style.background = 'none'; // Sin fondo
            container.style.borderTop = 'none';   // Sin borde

            // Asegurarse de que el contenedor esté al final de la página
            container.style.marginTop = '20px';  // Espacio antes del iframe (puedes ajustar esto)
            container.style.zIndex = '10';   // Asegura que el iframe se muestre sobre otros contenidos si es necesario

            // Crear el iframe
            let iframe = document.createElement('iframe');
            iframe.id = 'custom-iframe';
            iframe.src = url;
            iframe.style.width = '100%';
            iframe.style.height = '1250px';
            iframe.style.border = 'none';
            iframe.scrolling = 'no';  // Desactiva el scroll interno
            iframe.style.overflow = 'hidden'; // Asegura que no haya desplazamiento interno

            // Agregar el iframe al contenedor
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
