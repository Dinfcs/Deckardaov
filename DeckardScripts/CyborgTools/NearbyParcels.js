// ==UserScript==
// @name         NearbyParcels
// @namespace    
// @version      2.8
// @description  Añade un botón para abrir direcciones visibles en Google Maps o Google Search con apertura escalonada
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log('NearbyParcels script ejecutándose');

    let collapseTimeout;

    function waitForButton() {
        const observer = new MutationObserver((mutations, obs) => {
            const button = document.querySelector('#btn_open_vetting_dlg');
            if (button) {
                obs.disconnect();
                createButton();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function createButton() {
        console.log('Creando el botón "Nearby Parcels"');

        const button = document.createElement('button');
        button.innerHTML = 'Nearby Parcels';
        button.id = 'nearbyParcelsButton';
        button.style.marginLeft = '5px';
        button.style.width = '115px';
        button.style.height = '30.4px';
        button.style.backgroundColor = '#045875';
        button.style.color = 'white';
        button.style.fontSize = '14px';
        button.style.position = 'relative';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.top = '-1px';
        button.style.zIndex = '0';

        const footerDiv = document.getElementById('vetting_data_footer');
        if (footerDiv) {
            footerDiv.appendChild(button);
            console.log('Botón "Nearby Parcels" añadido');
        } else {
            console.log('No se encontró el div con la clase "card-footer".');
        }

        button.addEventListener('click', showSecondaryButtons);
    }

    function showSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());

        createSecondaryButton('🗺️ Maps', () => searchVisibleAddresses('maps'));
        createSecondaryButton('📖 Google', () => searchVisibleAddresses('google'));

        clearTimeout(collapseTimeout);
        collapseTimeout = setTimeout(hideSecondaryButtons, 5000);
    }

    function hideSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());
    }

    function createSecondaryButton(text, onClick) {
        let button = document.createElement('button');
        button.innerText = text;
        button.classList.add('secondary-button');
        button.style.marginLeft = '5px';
        button.addEventListener('click', onClick);

        let mainButton = document.querySelector('#nearbyParcelsButton');
        mainButton.parentNode.insertBefore(button, mainButton.nextSibling);
    }

    function searchVisibleAddresses(type) {
        const addressLinks = document.querySelectorAll('div.unfocused.dash-cell-value.cell-markdown p a[href^="https://www.google.com/search?"]');
        console.log(`Encontradas ${addressLinks.length} direcciones`);

        const uniqueAddresses = new Set();

        addressLinks.forEach(link => {
            if (isElementInViewport(link)) {
                const address = link.textContent.trim();
                console.log(`Dirección visible: ${address}`);
                uniqueAddresses.add(address);
            }
        });

        const addressesArray = [...uniqueAddresses].slice(0, 10); // Máximo 10 direcciones
        const delay = Math.max(300, Math.min(1000, 10000 / addressesArray.length)); // Ajusta entre 300ms y 1s

        addressesArray.forEach((address, index) => {
            setTimeout(() => {
                let url = type === 'maps'
                    ? `https://www.google.com/maps/search/${encodeURIComponent(address)}`
                    : `https://www.google.com/search?q=${encodeURIComponent(address)}`;

                window.open(url, '_blank');
            }, index * delay);
        });

        console.log(`Abriendo ${addressesArray.length} direcciones con un intervalo de ${delay} ms.`);
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    }

    waitForButton();
})();
