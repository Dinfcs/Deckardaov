// ==UserScript==
// @name         Script Principal
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Define y carga scripts auxiliares según la URL
// @author       Tu Nombre
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Lista de scripts secundarios con las URLs correspondientes
    const scripts = [
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgButtons.js'
        },
        {
            urlPattern: /^https:\/\/evolve\.com\/vacation-rentals\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/EvolveAddress.js'
        }
    ];

    scripts.forEach(({urlPattern, scriptUrl}) => {
        if (window.location.href.match(urlPattern)) {
            fetch(scriptUrl)
                .then(response => response.text())
                .then(scriptContent => {
                    eval(scriptContent); // Ejecuta el script cargado
                })
                .catch(error => console.error('Error al cargar el script:', error));
        }
    });
})();
