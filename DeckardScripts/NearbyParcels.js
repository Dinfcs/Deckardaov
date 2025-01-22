// ==UserScript==
// @name         Abrir Nparcels en Google Maps
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Abre las direcciones de los hipervínculos de Google en Google Maps
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function createButton() {
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

        // Agrega el evento de click al botón
        button.addEventListener('click', () => {
            // Selecciona todos los hipervínculos de Google en la página
            const links = document.querySelectorAll('a[href*="https://www.google.com/search?q="]');
            links.forEach((link, index) => {
                // Abre solo los primeros 10 hipervínculos
                if (index < 10) {
                    // Extrae la dirección del hipervínculo
                    const url = new URL(link.href);
                    const searchParams = new URLSearchParams(url.search);
                    const address = searchParams.get('q');
                    // Abre la dirección en Google Maps
                    if (address) {
                        window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank');
                    }
                }
            });
        });
    }


    

    window.addEventListener('load', createButton);
})();
