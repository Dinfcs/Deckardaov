// ==UserScript==
// @name         NearbyParcels
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Añade un botón en la parte superior de la página para abrir direcciones en Google Maps
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('NearbyParcels script ejecutándose');

    function createButton() {
        console.log('Creando el botón "Abrir Nparcels"');
        
        // Crea el botón "Abrir Nparcels"
        const button = document.createElement('button');
        button.innerHTML = '<b>OPEN NP</b>'; // Texto en negrita
        button.style.position = 'fixed';
        button.style.top = '0px';
        button.style.left = '50%';
        button.style.transform = 'translateX(-50%)';
        button.style.zIndex = 9999;
        button.style.padding = '2px';
        button.style.backgroundColor = '#093140';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.fontSize = '14px';
        button.style.cursor = 'pointer';

        document.body.appendChild(button);
        console.log('Botón "Abrir Nparcels" añadido al DOM:', button);

        // Agrega el evento de click al botón
        button.addEventListener('click', () => {
            console.log('Botón "Abrir Nparcels" clicado');

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

    // Ejecuta la creación del botón 2 segundos después de cargar la página
    window.addEventListener('load', () => {
        setTimeout(createButton, 2000);
    });
})();
