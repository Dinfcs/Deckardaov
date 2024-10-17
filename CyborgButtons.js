// ==UserScript==
// @name         Iframe Switcher
// @namespace    http://tampermonkey.net/
// @version      1.11
// @description  Añade botones para abrir iframes en la parte inferior izquierda de la página, con funcionalidad personalizada para PRs, LB, y PQ, con iframes siempre con fondo blanco. Los botones se ocultan automáticamente después de 30 segundos y aparece un botón para volver a mostrarlos.
// @author       Tú
// @match        *://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const buttonContainerId = 'iframe-button-container';
    const toggleButtonId = 'toggle-button';
    let hideTimeout;

    function createButtonContainer() {
        if (document.getElementById(buttonContainerId)) return;

        const container = document.createElement('div');
        container.id = buttonContainerId;
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.left = '10px';
        container.style.backgroundColor = '#f1f1f1';
        container.style.display = 'flex';
        container.style.gap = '5px';
        container.style.padding = '5px';
        container.style.zIndex = '9999';
        container.style.borderRadius = '5px';

        const buttons = [
            { text: 'PS', url: 'https://dinfcs.github.io/Deckardaov/ParcelSearch/index.html', color: '#cccccc' },
            { text: 'AOV', url: 'https://dinfcs.github.io/Deckardaov/', color: '#cccccc' },
            { text: 'PrTools', url: 'https://dinfcs.github.io/Deckardaov/PrTools/', color: '#cccccc' }
        ];

        buttons.forEach(({ text, url, color }) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.onclick = () => toggleIframe(url, `${text.toLowerCase()}-iframe`);
            button.style.padding = '5px 8px';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = color;
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            container.appendChild(button);
        });

        const lbButton = document.createElement('button');
        lbButton.textContent = 'LB';
        lbButton.style.padding = '5px 8px';
        lbButton.style.cursor = 'pointer';
        lbButton.style.backgroundColor = 'blue';
        lbButton.style.color = 'white';
        lbButton.style.border = 'none';
        lbButton.style.borderRadius = '3px';
        lbButton.onclick = () => toggleIframe('https://login-spatialstream.prod.lightboxre.com/MemberPages/Login.aspx?ReturnUrl=%2fmemberpages%2fdefault.aspx%3fma%3ddeckardtech&ma=deckardtech', 'lb-iframe');
        container.appendChild(lbButton);

        const pqButton = document.createElement('button');
        pqButton.textContent = 'PQ';
        pqButton.style.padding = '5px 8px';
        pqButton.style.cursor = 'pointer';
        pqButton.style.backgroundColor = 'red';
        pqButton.style.color = 'white';
        pqButton.style.border = 'none';
        pqButton.style.borderRadius = '3px';
        pqButton.onclick = () => toggleIframe('https://pqweb.parcelquest.com/#login', 'pq-iframe');
        container.appendChild(pqButton);

        const prsButton = document.createElement('button');
        prsButton.textContent = 'PRs';
        prsButton.style.padding = '5px 8px';
        prsButton.style.cursor = 'pointer';
        prsButton.style.backgroundColor = '#cccccc';
        prsButton.style.color = 'black';
        prsButton.style.border = 'none';
        prsButton.style.borderRadius = '3px';
        prsButton.onclick = () => togglePrsIframe();
        container.appendChild(prsButton);

        document.body.appendChild(container);
        startHideTimeout();
    }

    function createToggleButton() {
        if (document.getElementById(toggleButtonId)) return;

        const toggleButton = document.createElement('button');
        toggleButton.id = toggleButtonId;
        toggleButton.textContent = '➡️';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '10px';
        toggleButton.style.left = '10px';
        toggleButton.style.width = '40px';
        toggleButton.style.height = '40px';
        toggleButton.style.borderRadius = '50%';
        toggleButton.style.backgroundColor = '#007bff';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.zIndex = '10000';
        toggleButton.style.display = 'none';
        toggleButton.onclick = showButtonContainer;

        document.body.appendChild(toggleButton);
    }

    function showButtonContainer() {
        const container = document.getElementById(buttonContainerId);
        const toggleButton = document.getElementById(toggleButtonId);
        if (container) {
            container.style.display = 'flex';
            toggleButton.style.display = 'none';
            startHideTimeout();
        }
    }

    function hideButtonContainer() {
        const container = document.getElementById(buttonContainerId);
        const toggleButton = document.getElementById(toggleButtonId);
        if (container) {
            container.style.display = 'none';
            toggleButton.style.display = 'block';
        }
    }

    function startHideTimeout() {
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(hideButtonContainer, 30000);
    }

    function toggleIframe(url, iframeId) {
        const iframe = document.getElementById(iframeId);
        if (iframe) {
            iframe.style.width = iframe.style.width === '95%' ? '0%' : '95%';
        } else {
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
            newIframe.style.backgroundColor = 'white';
            newIframe.id = iframeId;
            document.body.appendChild(newIframe);
            setTimeout(() => newIframe.style.width = '95%', 10);
        }
    }

    function togglePrsIframe() {
        const prsIframe = document.getElementById('prs-iframe');
        if (prsIframe) {
            prsIframe.style.width = prsIframe.style.width === '95%' ? '0%' : '95%';
        } else {
            const newIframe = document.createElement('iframe');
            newIframe.id = 'prs-iframe';
            newIframe.style.position = 'fixed';
            newIframe.style.top = '0';
            newIframe.style.right = '0';
            newIframe.style.width = '0';
            newIframe.style.height = '100%';
            newIframe.style.border = 'none';
            newIframe.style.zIndex = '9998';
            newIframe.style.transition = 'width 0.3s ease';
            newIframe.style.backgroundColor = 'white';
            newIframe.src = localStorage.getItem('prsUrl') || 'https://deckardtech.atlassian.net/wiki/spaces/PC/pages/1717403844';
            document.body.appendChild(newIframe);
            setTimeout(() => newIframe.style.width = '95%', 10);
        }
    }

    createButtonContainer();
    createToggleButton();
})();
