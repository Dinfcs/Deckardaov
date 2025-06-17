// ==UserScript==
// @name         BCCHelper
// @namespace
// @version      2.4
// @description  Iframe flotante con visualizador de imagen, enlace a S3, rama editable, commit, movible, redimensionable y auto-rellenado de búsqueda.
// @author
// @match        https://deckardtech.atlassian.net/*
// @match        https://dinfcs.github.io/Deckardaov/TS/index.html
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Decide qué código ejecutar dependiendo de si estamos en Jira o en el Iframe.
    if (window.location.hostname === 'deckardtech.atlassian.net') {
        crearPanelFlotante();
    } else if (window.location.hostname === 'dinfcs.github.io') {
        // Ejecuta el código que modifica el contenido del iframe.
        modificarContenidoDelIframe();
    }

    // =========================================================================
    //        FUNCIÓN PARA LA PÁGINA DE JIRA (CON LA NUEVA LÓGICA)
    // =========================================================================
    function crearPanelFlotante() {
        let isVisible = false;
        let isFirstOpen = true; // <--- NUEVO: Flag para controlar la primera apertura.

        function generarNombreRamaBase() { try { const titulo = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]')?.innerText || ''; const ticketElement = document.querySelector('a[href*="/browse/PAM-"] span') || document.querySelector('span.css-1gd7hga') || document.querySelector('[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"] span'); const ticket = ticketElement?.innerText || 'PAM-XXXX'; const ticketLimpio = ticket.replace(/\s+/g, '').replace(/^pam-/i, 'PAM-'); const match = titulo.match(/\[(.*?)\]\s*(.*)/); let ubicacion = '', accion = ''; if (match) { ubicacion = match[1].toLowerCase().replace(/\s+/g, '-'); accion = match[2].toLowerCase().replace(/\s+/g, '-'); } else { accion = titulo.toLowerCase().replace(/\s+/g, '-'); } const ramaBase = `${ticketLimpio}-${accion}-${ubicacion}-`.replace(/-+/g, '-').replace(/[^a-zA-Z0-9\-]/g, ''); return ramaBase; } catch (e) { console.error("Error generando nombre de rama:", e); return 'error-generando-nombre-rama-'; } }
        function generarMensajeCommit() { try { const titulo = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]')?.innerText.trim() || 'Título no encontrado'; return `git commit -m "${titulo}"`; } catch (e) { console.error("Error generando mensaje de commit:", e); return 'commit -m "Error generando mensaje"'; } }
        const tab = document.createElement('div'); tab.innerText = '<-'; Object.assign(tab.style, { position: 'fixed', right: '0px', top: '80%', background: '#333', color: '#fff', padding: '10px 15px', cursor: 'pointer', borderRadius: '8px 0 0 8px', zIndex: 9999, fontFamily: 'Arial, sans-serif', fontSize: '14px' });
        const iframeContainer = document.createElement('div'); Object.assign(iframeContainer.style, { position: 'fixed', top: '0%', right: '0%', width: '56%', height: '99%', backgroundColor: '#fff', border: '2px solid #333', borderRadius: '10px', boxShadow: '0 0 15px rgba(0,0,0,0.5)', zIndex: 9998, display: 'none', resize: 'none', overflow: 'hidden' });
        const header = document.createElement('div'); Object.assign(header.style, { height: '35px', background: '#333', color: '#fff', padding: '5px 10px', cursor: 'move', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' });
        const branchContainer = document.createElement('div'); Object.assign(branchContainer.style, { display: 'flex', alignItems: 'center', flexGrow: '1', fontFamily: 'monospace', fontSize: '14px' });
        const branchPrefix = document.createElement('span'); branchPrefix.innerText = generarNombreRamaBase(); const userNameInput = document.createElement('input'); userNameInput.type = 'text'; userNameInput.value = 'luis'; Object.assign(userNameInput.style, { background: '#555', color: '#fff', border: '1px solid #777', borderRadius: '3px', marginLeft: '2px', width: '80px', padding: '2px 4px' });
        const copyBranchBtn = document.createElement('button'); copyBranchBtn.innerText = 'Copiar'; copyBranchBtn.title = "Copiar comando 'git checkout -b <rama>'"; Object.assign(copyBranchBtn.style, { marginLeft: '10px', padding: '3px 8px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', fontSize: '12px' }); branchContainer.append(branchPrefix, userNameInput, copyBranchBtn); header.appendChild(branchContainer);
        const minimizeBtn = document.createElement('span'); minimizeBtn.innerText = '✖'; Object.assign(minimizeBtn.style, { cursor: 'pointer', fontSize: '16px', marginLeft: '10px', padding: '0 5px' }); header.appendChild(minimizeBtn);
        const commitContainer = document.createElement('div'); Object.assign(commitContainer.style, { height: '40px', background: '#f0f0f0', padding: '0 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc', fontFamily: 'monospace', color: '#333', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }); commitContainer.title = 'Haz clic para copiar el mensaje de commit'; const commitText = document.createElement('code'); commitText.innerText = generarMensajeCommit(); commitContainer.appendChild(commitText);
        iframeContainer.appendChild(header); iframeContainer.appendChild(commitContainer);
        const iframe = document.createElement('iframe'); iframe.src = 'https://dinfcs.github.io/Deckardaov/TS/index.html'; iframe.allow = 'clipboard-write'; Object.assign(iframe.style, { width: '100%', height: 'calc(100% - 75px)', border: 'none', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }); iframeContainer.appendChild(iframe);
        const resizer = document.createElement('div'); Object.assign(resizer.style, { width: '15px', height: '15px', background: '#888', position: 'absolute', right: '0', bottom: '0', cursor: 'se-resize', zIndex: 9999, borderBottomRightRadius: '8px' }); iframeContainer.appendChild(resizer);
        copyBranchBtn.addEventListener('click', (e) => { e.stopPropagation(); const fullBranchName = branchPrefix.innerText + userNameInput.value; const gitCommand = `git checkout -b ${fullBranchName}`; navigator.clipboard.writeText(gitCommand).then(() => { const originalText = copyBranchBtn.innerText; copyBranchBtn.innerText = '✅ Comando Copiado!'; copyBranchBtn.style.background = '#28a745'; setTimeout(() => { copyBranchBtn.innerText = originalText; copyBranchBtn.style.background = '#007bff'; }, 2000); }); });
        commitContainer.addEventListener('click', () => { const commitMessage = generarMensajeCommit(); navigator.clipboard.writeText(commitMessage).then(() => { const originalText = commitText.innerText; commitText.innerText = '✅ Mensaje de commit copiado!'; setTimeout(() => { commitText.innerText = originalText; }, 1500); }); });
        minimizeBtn.addEventListener('click', () => { iframeContainer.style.display = 'none'; isVisible = false; });
        let isResizing = false; resizer.addEventListener('mousedown', function (e) { e.preventDefault(); isResizing = true; document.body.style.userSelect = 'none'; });
        let isDragging = false; let offsetX, offsetY; header.addEventListener('mousedown', (e) => { if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') { return; } isDragging = true; offsetX = e.clientX - iframeContainer.offsetLeft; offsetY = e.clientY - iframeContainer.offsetTop; document.body.style.userSelect = 'none'; });
        document.addEventListener('mousemove', function (e) { if (isResizing) { iframeContainer.style.width = (e.clientX - iframeContainer.offsetLeft) + 'px'; iframeContainer.style.height = (e.clientY - iframeContainer.offsetTop) + 'px'; } if (isDragging) { iframeContainer.style.left = `${e.clientX - offsetX}px`; iframeContainer.style.top = `${e.clientY - offsetY}px`; } });
        document.addEventListener('mouseup', function () { isResizing = false; isDragging = false; document.body.style.userSelect = 'auto'; });

        // MODIFICACIÓN: Evento de clic en la pestaña
        tab.addEventListener('click', () => {
            isVisible = !isVisible;
            iframeContainer.style.display = isVisible ? 'block' : 'none';
            if (isVisible) {
                branchPrefix.innerText = generarNombreRamaBase();
                commitText.innerText = generarMensajeCommit();

                // Si es la primera vez que se abre el iframe, extrae el texto y envíalo.
                if (isFirstOpen) {
                    // Espera un momento para asegurar que el iframe haya cargado su propio script.
                    setTimeout(() => {
                        try {
                            const tituloElement = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]');
                            const tituloCompleto = tituloElement ? tituloElement.innerText : '';
                            const match = tituloCompleto.match(/\[(.*?)\]/); // Busca texto dentro de []

                            if (match && match[1]) {
                                const textoParaIframe = match[1].trim();
                                // Envía el mensaje al iframe
                                iframe.contentWindow.postMessage({
                                    type: 'AUTOFILL_SEARCH',
                                    payload: textoParaIframe
                                }, 'https://dinfcs.github.io');
                            }
                        } catch (e) {
                            console.error("BCCHelper: Error al enviar datos al iframe.", e);
                        }
                    }, 500); // 500ms de espera

                    isFirstOpen = false; // Marca como "ya no es la primera vez"
                }
            }
        });
        document.body.appendChild(tab); document.body.appendChild(iframeContainer);
    }


    // =========================================================================
    //  FUNCIÓN PARA MODIFICAR EL IFRAME (CON LA LÓGICA PARA RECIBIR DATOS)
    // =========================================================================
    function modificarContenidoDelIframe() {
        const waitForElement = (selector, callback, maxRetries = 20) => {
            let retries = 0;
            const interval = setInterval(() => {
                const element = document.querySelector(selector);
                if (element) {
                    clearInterval(interval);
                    callback(element);
                } else if (retries++ > maxRetries) {
                    clearInterval(interval);
                    console.warn(`UserScript: No se pudo encontrar el elemento '${selector}' después de varias reintentos.`);
                }
            }, 250);
        };

        // --- NUEVO: Tarea para escuchar el mensaje de Jira ---
        window.addEventListener('message', (event) => {
            // Medida de seguridad: solo aceptar mensajes de nuestro dominio de Jira
            if (event.origin !== 'https://deckardtech.atlassian.net') {
                return;
            }

            // Si el mensaje tiene el formato esperado...
            if (event.data && event.data.type === 'AUTOFILL_SEARCH' && event.data.payload) {
                const textoDeJira = event.data.payload;

                // Espera a que el campo de búsqueda exista
                waitForElement('#buscarSplit', (inputElement) => {
                    inputElement.value = textoDeJira;
                    // Dispara un evento "input" para que la página reaccione
                    // como si el usuario hubiera escrito manualmente.
                    inputElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                });
            }
        });


        // --- Tarea 1: Añadir la lupa al lado de la etiqueta "Logo Link" ---
        const setupLogoVisualizer = (logoLabel) => {
            const logoInput = document.getElementById('logoUrl');
            if (!logoInput) {
                console.error('UserScript Error: Se encontró la etiqueta, pero no el input con id="logoUrl".');
                return;
            }
            Object.assign(logoLabel.style, {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
            });
            const viewIcon = document.createElement('span');
            viewIcon.innerText = '🔍';
            viewIcon.title = 'Previsualizar el logo enlazado';
            Object.assign(viewIcon.style, {
                cursor: 'pointer',
                fontSize: '16px',
                marginLeft: '10px'
            });
            logoLabel.appendChild(viewIcon);
            viewIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const imageUrl = logoInput.value.trim();
                if (imageUrl) {
                    showImageOverlay(imageUrl);
                } else {
                    alert('El campo "Logo Link" está vacío.');
                }
            });
        };

        // --- Tarea 2: Reemplazar botones de Filtro ---
        const setupFilterButtons = (filtersContainer) => {
            const cleanButtonSelector = '#filtros button.btn-secondary';
            let cleanButton = null;
            filtersContainer.querySelectorAll(cleanButtonSelector).forEach(btn => {
                if (btn.innerText.trim().toLowerCase() === 'clean') { cleanButton = btn; }
            });
            if (!cleanButton) {
                 console.warn('UserScript Advertencia: No se encontró el botón "Clean". Si existe, ajusta el selector:', cleanButtonSelector);
                 return;
            }
            const buttonContainer = cleanButton.parentElement;
            cleanButton.remove();
            const s3Button = document.createElement('button');
            s3Button.innerText = 'S3';
            s3Button.title = 'Abrir consola de AWS S3 Transfer';
            s3Button.type = 'button';
            s3Button.className = 'btn btn-warning';
            s3Button.style.color = 'white';
            s3Button.addEventListener('click', () => {
                window.open('https://webapp-8ba8c4de11154ee89.transfer-webapp.us-west-2.on.aws/', '_blank');
            });
            buttonContainer.appendChild(s3Button);
        };

        // --- Función de ayuda que crea y muestra el overlay de la imagen ---
        const showImageOverlay = (src) => {
            document.getElementById('image-overlay-userscript')?.remove();
            const overlay = document.createElement('div');
            overlay.id = 'image-overlay-userscript';
            Object.assign(overlay.style, {
                position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: '20000', display: 'flex',
                justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
            });
            const imagePreview = document.createElement('img');
            imagePreview.src = src;
            imagePreview.onerror = () => { overlay.innerText = 'Error al cargar la imagen. ¿El enlace es correcto?'; imagePreview.remove(); };
            imagePreview.style.cssText = 'max-width: 90%; max-height: 90%; border: 4px solid white; border-radius: 8px;';
            overlay.appendChild(imagePreview);
            overlay.addEventListener('click', () => overlay.remove());
            document.body.appendChild(overlay);
        };

        // --- INICIO DE EJECUCIÓN ---
        waitForElement('label[for="logoUrl"]', (logoLabel) => {
            console.log("UserScript: Etiqueta del logo encontrada. Configurando visualizador.");
            setupLogoVisualizer(logoLabel);
        });

        waitForElement('#filtros', (filtersContainer) => {
             console.log("UserScript: Contenedor de filtros encontrado. Configurando botones.");
             setupFilterButtons(filtersContainer);
        });
    }
})();
