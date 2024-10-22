// ==UserScript==
// @name         Iframe Switcher
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Añade botones para abrir iframes en la parte inferior izquierda de la página, con funcionalidad personalizada para PRs, LB, PQ y Pr/Gis, con iframes siempre con fondo blanco.
// @author       Tú
// @match        *://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Identificador del contenedor de botones
    const buttonContainerId = 'iframe-button-container';
    let hideTimeout;

    // Crea el contenedor de botones en la parte inferior izquierda
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

        // Botones principales con URLs
        const buttons = [
            { text: 'PS', url: 'https://dinfcs.github.io/Deckardaov/ParcelSearch/index.html', color: '#cccccc' },
            { text: 'AOV', url: 'https://dinfcs.github.io/Deckardaov/', color: '#cccccc' },
            { text: 'PrTools', url: 'https://dinfcs.github.io/Deckardaov/PrTools/', color: '#cccccc' }
        ];

        buttons.forEach(({ text, url, color }) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.onclick = () => {
                resetHideTimer();
                toggleIframe(url, `${text.toLowerCase()}-iframe`);
            };
            button.style.padding = '5px 8px';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = color;
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '3px';
            container.appendChild(button);
        });

        // === Botón LB (Lightbox) ===
        const lbButton = document.createElement('button');
        lbButton.textContent = 'LB';
        lbButton.style.padding = '5px 8px';
        lbButton.style.cursor = 'pointer';
        lbButton.style.backgroundColor = 'blue';
        lbButton.style.color = 'white';
        lbButton.style.border = 'none';
        lbButton.style.borderRadius = '3px';
        lbButton.onclick = () => {
            resetHideTimer();
            toggleIframe('https://login-spatialstream.prod.lightboxre.com/MemberPages/Login.aspx?ReturnUrl=%2fmemberpages%2fdefault.aspx%3fma%3ddeckardtech&ma=deckardtech', 'lb-iframe');
        };
        container.appendChild(lbButton);

        // === Botón PQ (ParcelQuest) ===
        const pqButton = document.createElement('button');
        pqButton.textContent = 'PQ';
        pqButton.style.padding = '5px 8px';
        pqButton.style.cursor = 'pointer';
        pqButton.style.backgroundColor = 'red';
        pqButton.style.color = 'white';
        pqButton.style.border = 'none';
        pqButton.style.borderRadius = '3px';
        pqButton.onclick = () => {
            resetHideTimer();
            toggleIframe('https://pqweb.parcelquest.com/#login', 'pq-iframe');
        };
        container.appendChild(pqButton);

        // === Botón Pr/Gis ===
        const prgisButton = document.createElement('button');
        prgisButton.textContent = 'Pr/Gis';
        prgisButton.style.padding = '5px 8px';
        prgisButton.style.cursor = 'pointer';
        prgisButton.style.backgroundColor = 'orange';
        prgisButton.style.color = 'white';
        prgisButton.style.border = 'none';
        prgisButton.style.borderRadius = '3px';
        prgisButton.onclick = () => {
            resetHideTimer();
            const savedUrl = localStorage.getItem('prgisUrl'); // Cargar la URL guardada
            toggleIframe(savedUrl || 'about:blank', 'prgis-iframe'); // Cargar la URL o about:blank
            createPrGisControls(); // Crea los controles del iframe Pr/Gis
        };
        container.appendChild(prgisButton);

        // === Botón Regrid ===
        const regridButton = document.createElement('button');
        regridButton.textContent = 'Regrid';
        regridButton.style.padding = '5px 8px';
        regridButton.style.cursor = 'pointer';
        regridButton.style.backgroundColor = 'green';
        regridButton.style.color = 'white';
        regridButton.style.border = 'none';
        regridButton.style.borderRadius = '3px';
        regridButton.onclick = () => {
            window.open('https://app.regrid.com/', '_blank'); // Abre en una nueva pestaña
        };
        container.appendChild(regridButton);

        document.body.appendChild(container);
        createShowButton(); // Crear el botón para volver a mostrar los botones
        startHideTimer(); // Iniciar el temporizador para ocultar los botones
    }

    // === Funciones para manejar iframes ===

    // Oculta todos los iframes
    function hideAllIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.style.width = '0%';
            if (iframe.id === 'prgis-iframe') {
                document.getElementById('prgis-controls').style.display = 'none'; // Oculta los controles
            }
        });
    }

    // Alterna la visibilidad de un iframe dado su URL y su ID
    function toggleIframe(url, iframeId) {
        const iframe = document.getElementById(iframeId);

        if (iframe) {
            if (iframe.style.width === '95%') {
                iframe.style.width = '0%';
            } else {
                hideAllIframes();
                iframe.style.width = '95%';
            }
            return;
        }

        const newIframe = document.createElement('iframe');
        newIframe.src = url; // Usar la URL proporcionada
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

    // === Crea los controles para el iframe "Pr/Gis" ===
    function createPrGisControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'prgis-controls';
        controlsContainer.style.position = 'fixed';
        controlsContainer.style.bottom = '10px';
        controlsContainer.style.right = '10px';
        controlsContainer.style.zIndex = '9999';
        controlsContainer.style.backgroundColor = '#f1f1f1';
        controlsContainer.style.padding = '10px';
        controlsContainer.style.borderRadius = '5px';

        // Botón para cerrar los controles
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.cursor = 'pointer';
        closeButton.style.backgroundColor = 'red';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '3px';
        closeButton.onclick = () => {
            controlsContainer.style.display = 'none'; // Oculta los controles
        };

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'Introduce la URL';
        urlInput.style.width = '300px';

        // Cargar la URL guardada en localStorage si existe
        const savedUrl = localStorage.getItem('prgisUrl');
        if (savedUrl) {
            urlInput.value = savedUrl; // Cargar URL guardada en el campo
        }

        const saveButton = document.createElement('button');
        saveButton.textContent = 'Guardar';
        saveButton.onclick = () => {
            const newUrl = urlInput.value;
            localStorage.setItem('prgisUrl', newUrl); // Guardar en localStorage
        
            // Si el iframe ya existe, actualizar su URL
            const iframe = document.getElementById('prgis-iframe');
            if (iframe) {
                iframe.src = newUrl; // Actualizar la URL del iframe
            } else {
                // Si el iframe no existe, crearlo
                toggleIframe(newUrl, 'prgis-iframe');
            }
        };
        

        const clearButton = document.createElement('button');
        clearButton.textContent = 'Borrar';
        clearButton.onclick = () => {
            localStorage.removeItem('prgisUrl'); // Borrar de localStorage
            urlInput.value = ''; // Limpiar el campo
        };

        const projectButton = document.createElement('button');
        projectButton.textContent = 'Abrir Proyecto';
        projectButton.onclick = () => {
            window.open(urlInput.value, '_blank'); // Abrir la URL en una nueva pestaña
        };

        controlsContainer.appendChild(closeButton);
        controlsContainer.appendChild(urlInput);
        controlsContainer.appendChild(saveButton);
        controlsContainer.appendChild(clearButton);
        controlsContainer.appendChild(projectButton);

        document.body.appendChild(controlsContainer);
    }

    // === Funciones para manejar los botones y el contenedor ===

    // Crea el botón para volver a mostrar el contenedor de botones
    function createShowButton() {
        const showButton = document.createElement('button');
        showButton.id = 'show-button';
        showButton.textContent = '➤';
        showButton.style.position = 'fixed';
        showButton.style.bottom = '10px';
        showButton.style.left = '10px';
        showButton.style.zIndex = '10000';
        showButton.style.display = 'none';
        showButton.style.padding = '5px';
        showButton.style.borderRadius = '0';
        showButton.style.backgroundColor = '#0096d2';
        showButton.style.color = 'white';
        showButton.style.border = 'none';
        showButton.style.cursor = 'pointer';

        showButton.onclick = () => {
            document.getElementById(buttonContainerId).style.display = 'flex';
            showButton.style.display = 'none';
            startHideTimer();
        };

        document.body.appendChild(showButton);
    }

    // Oculta el contenedor de botones y muestra el botón para volver a mostrarlos
    function hideButtonContainer() {
        document.getElementById(buttonContainerId).style.display = 'none';
        document.getElementById('show-button').style.display = 'block';
    }

    // Inicia un temporizador para ocultar el contenedor de botones
    function startHideTimer() {
        hideTimeout = setTimeout(() => {
            hideButtonContainer();
        }, 10000); // Ocultar después de 10 segundos
    }

    // Reinicia el temporizador de ocultar
    function resetHideTimer() {
        clearTimeout(hideTimeout);
        startHideTimer();
    }

    // Inicia el script
    createButtonContainer();
})();
