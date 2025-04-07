// ==UserScript==
// @name         Pestañita con iframe flotante y nombre de rama en header clickeable
// @namespace    https://tu-namespace-ejemplo.com
// @version      1.7
// @description  Iframe flotante con rama en header clickeable para copiar, movible, minimizable y redimensionable. Versión con formato correcto de COLO en mayúsculas.
// @author       Tú
// @match        https://deckardtech.atlassian.net/browse/COLO*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let isVisible = false;

    function generarNombreRama() {
        try {
            const titulo = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]')?.innerText || '';

            // Selector mejorado para el ticket
            const ticketElement = document.querySelector('a[href*="/browse/COLO-"] span') ||
                                 document.querySelector('span.css-1gd7hga') ||
                                 document.querySelector('[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"] span');

            const ticket = ticketElement?.innerText || 'COLO-XXXX'; // Valor por defecto si no encuentra

            // Limpiar el texto del ticket (manteniendo COLO en mayúsculas)
            const ticketLimpio = ticket.replace(/\s+/g, '').replace(/^colo-/i, 'COLO-');

            const match = titulo.match(/\[(.*?)\]\s*(.*)/);
            let ubicacion = '', accion = '';

            if (match) {
                ubicacion = match[1].toLowerCase().replace(/\s+/g, '-');
                accion = match[2].toLowerCase().replace(/\s+/g, '-');
            } else {
                accion = titulo.toLowerCase().replace(/\s+/g, '-');
            }

            const rama = `${ticketLimpio}-${accion}-${ubicacion}-luis`
                .replace(/-+/g, '-')
                .replace(/[^a-zA-Z0-9\-]/g, '');

            return rama;
        } catch (e) {
            console.error("Error generando nombre de rama:", e);
            return 'error-generando-nombre-rama';
        }
    }

    // Resto del código permanece igual...
    // Crear la pestañita flotante
    const tab = document.createElement('div');
    tab.innerText = 'Abrir';
    Object.assign(tab.style, {
        position: 'fixed',
        right: '0px',
        top: '80%',
        background: '#333',
        color: '#fff',
        padding: '10px 15px',
        cursor: 'pointer',
        borderRadius: '8px 0 0 8px',
        zIndex: 9999,
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px'
    });

    // Crear contenedor del iframe
    const iframeContainer = document.createElement('div');
    Object.assign(iframeContainer.style, {
        position: 'fixed',
        top: '0%',
        right: '0%',
        width: '56%',
        height: '99%',
        backgroundColor: '#fff',
        border: '2px solid #333',
        borderRadius: '10px',
        boxShadow: '0 0 15px rgba(0,0,0,0.5)',
        zIndex: 9998,
        display: 'none',
        resize: 'none',
        overflow: 'hidden'
    });

    // Barra superior
    const header = document.createElement('div');
    Object.assign(header.style, {
        height: '30px',
        background: '#333',
        color: '#fff',
        padding: '5px 10px',
        cursor: 'move',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    });

    const title = document.createElement('span');
    title.innerText = generarNombreRama();
    Object.assign(title.style, {
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        userSelect: 'all'
    });

    title.title = 'Haz clic para copiar';
    title.addEventListener('click', () => {
        const rama = generarNombreRama();
        navigator.clipboard.writeText(rama).then(() => {
            title.innerText = '✅ Copiado!';
            setTimeout(() => {
                title.innerText = generarNombreRama();
            }, 1500);
        });
    });

    header.appendChild(title);

    const minimizeBtn = document.createElement('span');
    minimizeBtn.innerText = '✖';
    minimizeBtn.style.cursor = 'pointer';
    minimizeBtn.style.fontSize = '16px';
    minimizeBtn.style.marginLeft = '10px';
    minimizeBtn.addEventListener('click', () => {
        iframeContainer.style.display = 'none';
        isVisible = false;
    });

    header.appendChild(minimizeBtn);
    iframeContainer.appendChild(header);

    // Iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'https://dinfcs.github.io/Deckardaov/TS/index.html';
    iframe.allow = 'clipboard-write';
    Object.assign(iframe.style, {
        width: '100%',
        height: 'calc(100% - 30px)',
        border: 'none',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px'
    });

    iframeContainer.appendChild(iframe);

    // Resizer
    const resizer = document.createElement('div');
    Object.assign(resizer.style, {
        width: '15px',
        height: '15px',
        background: '#888',
        position: 'absolute',
        right: '0',
        bottom: '0',
        cursor: 'se-resize',
        zIndex: 9999,
        borderBottomRightRadius: '8px'
    });

    iframeContainer.appendChild(resizer);

    let isResizing = false;
    resizer.addEventListener('mousedown', function (e) {
        e.preventDefault();
        isResizing = true;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function (e) {
        if (!isResizing) return;
        const newWidth = e.clientX - iframeContainer.offsetLeft;
        const newHeight = e.clientY - iframeContainer.offsetTop;
        iframeContainer.style.width = newWidth + 'px';
        iframeContainer.style.height = newHeight + 'px';
    });

    document.addEventListener('mouseup', function () {
        isResizing = false;
        document.body.style.userSelect = 'auto';
    });

    // Drag
    let isDragging = false;
    let offsetX, offsetY;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - iframeContainer.offsetLeft;
        offsetY = e.clientY - iframeContainer.offsetTop;
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            iframeContainer.style.left = `${e.clientX - offsetX}px`;
            iframeContainer.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = 'auto';
    });

    // Mostrar/ocultar
    tab.addEventListener('click', () => {
        isVisible = !isVisible;
        iframeContainer.style.display = isVisible ? 'block' : 'none';
        if (isVisible) {
            const rama = generarNombreRama();
            title.innerText = rama;
        }
    });

    document.body.appendChild(tab);
    document.body.appendChild(iframeContainer);
})();
