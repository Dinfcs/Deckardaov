// ==UserScript==
// @name         NearbyParcels
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  Añade un botón fijo para abrir direcciones en Google Maps basándose en las direcciones visibles en la columna "site address", evitando duplicados
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('NearbyParcels script ejecutándose');

    function waitForButton() {
        const observer = new MutationObserver((mutations, obs) => {
            const button = document.querySelector('#btn_open_vetting_dlg');
            if (button) {
                obs.disconnect(); // Deja de observar cambios en el DOM
                createButton(); // Llama a la función principal
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function createButton() {
        console.log('Creando el botón "NearbyParcels"');

        // Crea el botón "NearbyParcels"
        const button = document.createElement('button');
        button.innerHTML = 'Nearby Parcels'; // Texto en negrita
        button.style.marginLeft = '5px'; // Margen para separarlo de otros botones
        button.style.width = '115px'; // Ancho del botón
        button.style.height = '30.4px'; // Alto del botón
        button.style.backgroundColor = '#045875';
        button.style.color = 'white';
        button.style.fontSize = '14px';
        button.style.position = 'relative'; // Posición relativa dentro del contenedor padre
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.top = '-1px'; // Pegado a la parte superior
        button.style.zIndex = '0'; // Asegura que esté por encima de otros elementos

        // Añade el botón al div con la clase 'card-footer'
        const footerDiv = document.getElementById('vetting_data_footer');
        if (footerDiv) {
            footerDiv.appendChild(button);
            console.log('Botón "NearbyParcels" añadido al div con la clase "card-footer":', button);
        } else {
            console.log('No se encontró el div con la clase "card-footer".');
        }

        // Agrega el evento de click al botón
        button.addEventListener('click', () => {
            console.log('Botón "NearbyParcels" clicado');
            searchVisibleAddresses();
        });
    }

    function searchVisibleAddresses() {
        // Selecciona todos los enlaces en la columna "site address" que cumplen con el patrón dado
        const addressLinks = document.querySelectorAll('div.unfocused.dash-cell-value.cell-markdown p a[href^="https://www.google.com/search?"]');
        console.log(`Encontradas ${addressLinks.length} celdas de direcciones`);

        const uniqueAddresses = new Set();

        addressLinks.forEach((link, index) => {
            if (isElementInViewport(link)) {
                // Extrae la dirección del hipervínculo
                const address = link.textContent.trim();
                console.log(`Dirección visible extraída: ${address}`);

                // Verifica si la dirección ya ha sido procesada
                if (!uniqueAddresses.has(address)) {
                    uniqueAddresses.add(address);
                    // Abre la dirección en Google Maps
                    if (address) {
                        window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank');
                    }
                }
            }
        });
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    waitForButton();
})();
