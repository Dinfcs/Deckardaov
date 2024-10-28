// ==UserScript==
// @name         Iframe Switcher
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Añade botones para abrir iframes en la parte inferior izquierda de la página, con funcionalidad personalizada y botones de cierre para cada iframe en la parte inferior izquierda que desaparecen al cerrarse cualquier iframe.
// @author       Tú
// @match        *://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Identificador del contenedor de botones
    const buttonContainerId = 'iframe-button-container';

    // Crea el contenedor de botones en la parte inferior izquierda
    function createButtonContainer() {
        if (document.getElementById(buttonContainerId)) return;

        const container = document.createElement('div');
        container.id = buttonContainerId;
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.left = '50px';
        container.style.backgroundColor = '#f1f1f1';
        container.style.display = 'none'; // Empieza oculto
        container.style.gap = '5px';
        container.style.padding = '8px';
        container.style.zIndex = '9999';
        container.style.borderRadius = '5px';
        container.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';

        // Botones principales con URLs
        const buttons = [
            { text: 'PS', url: 'https://dinfcs.github.io/Deckardaov/ParcelSearch/index.html', color: '#6c757d' },
            { text: 'AOV', url: 'https://dinfcs.github.io/Deckardaov/', color: '#6c757d' },
            { text: 'PrTools', url: 'https://dinfcs.github.io/Deckardaov/PrTools/', color: '#6c757d' }
        ];

        buttons.forEach(({ text, url, color }) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.onclick = () => {
                toggleIframe(url, `${text.toLowerCase()}-iframe`, 40); // Cambiar ancho a 40%
            };
            button.style.padding = '5px 8px';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = color;
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.fontWeight = 'bold';
            button.style.fontSize = '14px';
            container.appendChild(button);
        });

        // === Botón LB (Lightbox) ===
        const lbButton = document.createElement('button');
        lbButton.textContent = 'LB';
        lbButton.style.padding = '5px 8px';
        lbButton.style.cursor = 'pointer';
        lbButton.style.backgroundColor = '#007bff';
        lbButton.style.color = 'white';
        lbButton.style.border = 'none';
        lbButton.style.borderRadius = '4px';
        lbButton.style.fontWeight = 'bold';
        lbButton.style.fontSize = '14px';
        lbButton.onclick = () => {
            toggleIframe('https://login-spatialstream.prod.lightboxre.com/MemberPages/Login.aspx?ReturnUrl=%2fmemberpages%2fdefault.aspx%3fma%3ddeckardtech&ma=deckardtech', 'lb-iframe', 95, 'white'); // Añadir fondo blanco
        };
        container.appendChild(lbButton);

        // === Botón PQ (ParcelQuest) ===
        const pqButton = document.createElement('button');
        pqButton.textContent = 'PQ';
        pqButton.style.padding = '5px 8px';
        pqButton.style.cursor = 'pointer';
        pqButton.style.backgroundColor = '#dc3545';
        pqButton.style.color = 'white';
        pqButton.style.border = 'none';
        pqButton.style.borderRadius = '4px';
        pqButton.style.fontWeight = 'bold';
        pqButton.style.fontSize = '14px';
        pqButton.onclick = () => {
            window.open('https://pqweb.parcelquest.com/#login', '_blank');
        };
        container.appendChild(pqButton);

        // === Botón Regrid ===
        const regridButton = document.createElement('button');
        regridButton.textContent = 'Regrid';
        regridButton.style.padding = '5px 8px';
        regridButton.style.cursor = 'pointer';
        regridButton.style.backgroundColor = '#28a745';
        regridButton.style.color = 'white';
        regridButton.style.border = 'none';
        regridButton.style.borderRadius = '4px';
        regridButton.style.fontWeight = 'bold';
        regridButton.style.fontSize = '14px';
        regridButton.onclick = () => {
            window.open('https://app.regrid.com/', '_blank');
        };
        container.appendChild(regridButton);

        document.body.appendChild(container);
        createToggleButton(); // Crear el botón para alternar la visibilidad de los botones
    }

    // === Funciones para manejar iframes ===

    // Oculta todos los iframes
    function hideAllIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.style.width = '0%';
        });
        hideCloseButton(); // Oculta el botón de cierre cuando se cierran todos los iframes
    }

    // Alterna la visibilidad de un iframe dado su URL y su ID
function toggleIframe(url, iframeId, widthPercentage, backgroundColor = 'transparent') {
    const iframe = document.getElementById(iframeId);

    if (iframe) {
        if (iframe.style.width === `${widthPercentage}%`) {
            iframe.style.width = '0%';
            hideCloseButton();
        } else {
            hideAllIframes();
            iframe.style.width = `${widthPercentage}%`;
            showCloseButton(iframeId);
        }
        return;
    }

    const newIframe = document.createElement('iframe');
    newIframe.src = url;
    newIframe.style.position = 'fixed';
    newIframe.style.top = '0';
    newIframe.style.right = '0';
    newIframe.style.width = '0';
    newIframe.style.height = '100%';
    newIframe.style.border = 'none';
    newIframe.style.zIndex = '9998';
    newIframe.style.transition = 'width 0.3s ease';
    newIframe.style.backgroundColor = backgroundColor; // Establece el fondo del iframe
    newIframe.id = iframeId;

    // Aquí agregamos el atributo allow
    newIframe.setAttribute('allow', 'clipboard-write');

    document.body.appendChild(newIframe);
    setTimeout(() => newIframe.style.width = `${widthPercentage}%`, 10);
    showCloseButton(iframeId);
}


    // Muestra el botón de cierre para el iframe
    function showCloseButton(iframeId) {
        let closeButton = document.getElementById('iframe-close-button');

        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.id = 'iframe-close-button';
            closeButton.textContent = 'Cerrar';
            closeButton.style.position = 'fixed';
            closeButton.style.top = '20px';
            closeButton.style.right = '20px';
            closeButton.style.zIndex = '9999';
            closeButton.style.padding = '10px 20px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.backgroundColor = 'red';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '8px';
            closeButton.style.fontSize = '16px';
            closeButton.onclick = hideAllIframes;

            document.body.appendChild(closeButton);
        }

        closeButton.style.display = 'block';
    }

    // Oculta el botón de cierre del iframe
    function hideCloseButton() {
        const closeButton = document.getElementById('iframe-close-button');
        if (closeButton) {
            closeButton.style.display = 'none';
        }
    }

    // === Funciones para manejar los botones y el contenedor ===

    // Crea el botón para alternar la visibilidad del contenedor de botones
    function createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-button';
        toggleButton.textContent = '➤';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '13px';
        toggleButton.style.left = '10px';
        toggleButton.style.zIndex = '9999';
        toggleButton.style.padding = '8px 10px';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.backgroundColor = '#0096d2';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '5px';

        // Variable para almacenar el temporizador
        let hideTimeout;

        toggleButton.onclick = () => {
            const container = document.getElementById(buttonContainerId);

            if (container.style.display === 'none') {
                container.style.display = 'flex';
                toggleButton.textContent = '⮜';

                // Inicia un temporizador de 30 segundos para ocultar automáticamente el contenedor
                hideTimeout = setTimeout(() => {
                    container.style.display = 'none';
                    toggleButton.textContent = '➤';
                }, 30000); // 30000 ms = 30 segundos

            } else {
                // Oculta el contenedor y cancela el temporizador
                container.style.display = 'none';
                toggleButton.textContent = '➤';
                clearTimeout(hideTimeout); // Cancela el temporizador si se oculta manualmente
            }
        };

        document.body.appendChild(toggleButton);
    }

    // Inicia el script
    createButtonContainer();
})();
