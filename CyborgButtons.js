// ==UserScript==
// @name         Iframe Switcher
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Añade botones para abrir iframes en la parte inferior izquierda de la página, con funcionalidad personalizada para PRs, LB, y PQ, con iframes siempre con fondo blanco.
// @author       Tú
// @match        *://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const buttonContainerId = 'iframe-button-container';

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

        // Botones LB y PQ con funcionalidad personalizada
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

        // Botón PRs con funcionalidad personalizada
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
    }

    function hideAllIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.style.width = '0%';
        });
    }

    function toggleIframe(url, iframeId) {
        const iframe = document.getElementById(iframeId);

        // Si el iframe ya existe y está visible, lo ocultamos
        if (iframe) {
            if (iframe.style.width === '95%') {
                iframe.style.width = '0%';
            } else {
                hideAllIframes(); // Ocultar todos los iframes antes de mostrar uno nuevo
                iframe.style.width = '95%';
            }
            return; // Salimos de la función
        }

        // Si el iframe no existe, creamos uno nuevo
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
        newIframe.style.backgroundColor = 'white'; // Fondo blanco del iframe
        newIframe.id = iframeId; // Asignar ID para poder identificar el iframe
        document.body.appendChild(newIframe);
        setTimeout(() => newIframe.style.width = '95%', 10);
    }

    function togglePrsIframe() {
        const prsIframe = document.getElementById('prs-iframe');

        // Si el iframe de PRs ya existe y está visible, lo ocultamos
        if (prsIframe) {
            if (prsIframe.style.width === '95%') {
                prsIframe.style.width = '0%';
                togglePrsControls(false); // Ocultar controles si se oculta el iframe
            } else {
                hideAllIframes(); // Ocultar todos los iframes antes de mostrar uno nuevo
                prsIframe.style.width = '95%';
                togglePrsControls(true); // Mostrar controles al abrir el iframe
            }
            return; // Salimos de la función
        }

        // Si el iframe no existe, creamos uno nuevo
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
        newIframe.style.backgroundColor = 'white'; // Fondo blanco del iframe
        newIframe.src = localStorage.getItem('prsUrl') || 'https://deckardtech.atlassian.net/wiki/spaces/PC/pages/1717403844';
        document.body.appendChild(newIframe);

        createPrsControls();
        togglePrsControls(true);

        setTimeout(() => newIframe.style.width = '95%', 10);
    }

    function createPrsControls() {
        if (document.getElementById('prs-controls')) return;

        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'prs-controls';
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.top = '10px';
        controlsContainer.style.right = '10px';
        controlsContainer.style.backgroundColor = '#ffffff';
        controlsContainer.style.padding = '10px';
        controlsContainer.style.zIndex = '9999';
        controlsContainer.style.borderRadius = '5px';
        controlsContainer.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.gap = '5px';

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'Introduce la URL';
        urlInput.style.width = '250px';
        urlInput.value = localStorage.getItem('prsUrl') || '';

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Guardar';
        saveButton.onclick = () => {
            localStorage.setItem('prsUrl', urlInput.value);
            const prsIframe = document.getElementById('prs-iframe');
            prsIframe.src = urlInput.value;
        };

        const clearButton = document.createElement('button');
        clearButton.textContent = 'Borrar';
        clearButton.onclick = () => {
            localStorage.removeItem('prsUrl');
            urlInput.value = '';
            const prsIframe = document.getElementById('prs-iframe');
            prsIframe.src = 'about:blank';
        };

        const projectResourcesButton = document.createElement('button');
        projectResourcesButton.textContent = 'Project Resources';
        projectResourcesButton.onclick = () => {
            window.open('https://deckardtech.atlassian.net/wiki/spaces/PC/pages/1717403844', '_blank');
        };

        controlsContainer.appendChild(urlInput);
        controlsContainer.appendChild(saveButton);
        controlsContainer.appendChild(clearButton);
        controlsContainer.appendChild(projectResourcesButton);
        document.body.appendChild(controlsContainer);
    }

    function togglePrsControls(visible) {
        const controlsContainer = document.getElementById('prs-controls');
        if (controlsContainer) {
            controlsContainer.style.display = visible ? 'flex' : 'none';
        }
    }

    createButtonContainer();
})();
