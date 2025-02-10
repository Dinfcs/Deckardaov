// ==UserScript==
// @name         NearbyParcels
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Añade un botón fijo para abrir direcciones en Google Maps que solo aparece cuando el scroll está arriba
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('NearbyParcels script ejecutándose');

    function waitForButton() {
        const observer = new MutationObserver((mutations, obs) => {
            const button = document.querySelector('#btn_record_no_matching_parcel_found');
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
        button.style.position = 'relative'; // Posición absoluta dentro del contenedor padre
        button.style.fontFamily = ' Arial, sans-serif'
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

            // Selecciona todos los hipervínculos de Google en la página
            const links = document.querySelectorAll('a[href*="https://www.google.com/search?q="]');
            console.log(`Encontrados ${links.length} enlaces`);

            links.forEach((link, index) => {
                // Abre solo los primeros 10 hipervínculos
                if (index < 10) {
                    // Extrae la dirección del hipervínculo
                    const url = new URL(link.href);
                    const searchParams = new URLSearchParams(url.search);
                    const address = searchParams.get('q');
                    console.log(`Dirección extraída: ${address}`);

                    // Abre la dirección en Google Maps
                    if (address) {
                        window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank');
                    }
                }
            });
        });
    }

    waitForButton();
})();
