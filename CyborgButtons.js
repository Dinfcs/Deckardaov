// ==UserScript==
// @name         Iframe qa
// @namespace    http://tampermonkey.net/
// @version      2.7
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

        // Botones en el orden especificado
        const buttons = [
            { text: 'PS', url: 'https://dinfcs.github.io/Deckardaov/ParcelSearch/index.html', color: '#6c757d' },
            { text: 'AO', url: 'https://dinfcs.github.io/Deckardaov/', color: '#6c757d' },
            { text: 'PrTools', url: 'https://dinfcs.github.io/Deckardaov/PrTools/', color: '#6c757d' },
            { text: 'Filter', url: 'https://dinfcs.github.io/Deckardaov/FilterGeneratorv2/index.html', color: '#6c757d' },
            { text: 'PR', url: 'https://deckardtech.atlassian.net/wiki/spaces/PC/pages/1717403844', color: '#6c757d', openInNewTab: true },
            { text: 'LB', url: 'https://login-spatialstream.prod.lightboxre.com/MemberPages/Login.aspx?ReturnUrl=%2fmemberpages%2fdefault.aspx%3fma%3ddeckardtech&ma=deckardtech', color: '#007bff' },
            { text: 'PQ', url: 'https://pqweb.parcelquest.com/#login', color: '#dc3545', openInNewTab: true },
            { text: 'Regrid', url: 'https://app.regrid.com/', color: '#28a745', openInNewTab: true }
            
        ];

        buttons.forEach(({ text, url, color, openInNewTab, openMultiple }) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.onclick = () => {
                if (openInNewTab) {
                    window.open(url, '_blank');
                } else if (openMultiple) {
                    window.open(url, '_blank');
                    window.open('https://www.appsheet.com/start/0e4a5be2-014b-4c32-a963-9cced65a14e5#appName=QAProductivity-985429461-24-10-30&group=%5B%5D&page=fastTable&sort=%5B%7B%22Column%22%3A%22Fecha%22%2C%22Order%22%3A%22Descending%22%7D%5D&table=Form+responses+1&view=QA+planning', '_blank');
                } else {
                    toggleIframe(url, `${text.toLowerCase()}-iframe`, text === 'LB' ? 95 : 50);
                }
            };
            button.style.padding = '5px 8px';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = color;
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.fontWeight = 'bold';
            button.style.fontSize = '12px';  // Tamaño de letra más pequeño
            container.appendChild(button);
        });

        document.body.appendChild(container);
        createToggleButton();
    }

    // === Funciones para manejar iframes ===

    function hideAllIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.style.width = '0%';
        });
        hideCloseButton();
    }

    function toggleIframe(url, iframeId, widthPercentage, backgroundColor = 'White') {
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
        newIframe.style.backgroundColor = backgroundColor;
        newIframe.id = iframeId;
        newIframe.setAttribute('allow', 'clipboard-write');

        document.body.appendChild(newIframe);
        setTimeout(() => newIframe.style.width = `${widthPercentage}%`, 10);
        showCloseButton(iframeId);
    }

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

    function hideCloseButton() {
        const closeButton = document.getElementById('iframe-close-button');
        if (closeButton) {
            closeButton.style.display = 'none';
        }
    }

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

        let hideTimeout;

        toggleButton.onclick = () => {
            const container = document.getElementById(buttonContainerId);

            if (container.style.display === 'none') {
                container.style.display = 'flex';
                toggleButton.textContent = '⮜';

                hideTimeout = setTimeout(() => {
                    container.style.display = 'none';
                    toggleButton.textContent = '➤';
                }, 30000);

            } else {
                container.style.display = 'none';
                toggleButton.textContent = '➤';
                clearTimeout(hideTimeout);
            }
        };

        document.body.appendChild(toggleButton);
    }

    createButtonContainer();
})();
