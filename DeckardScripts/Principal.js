// ==UserScript==
// @name         Principal Script 
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Define and load auxiliary scripts according to the URL
// @author       Luis Escalante
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
        },
        {
            urlPattern: /^https:\/\/www\.misterbandb\.com\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Misterb&b%20Address.js'
        },
        {
            urlPattern: /^https:\/\/www\.michaelsvacationrentals\.com\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/MichaelVacationRentalsAddress.js'
        },
        {
            urlPattern: /^https:\/\/www\.bing\.com\/maps/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Buscador.js'
        },
        {
            urlPattern: /^https:\/\/www\.google\.com\/maps/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Buscador.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: [
                'https://dinfcs.github.io/Deckardaov/DeckardScripts/NearbyParcels.js',
                'https://dinfcs.github.io/Deckardaov/DeckardScripts/ProjectResourses%20Foating.js'
            ]
        }
    ];

    scripts.forEach(({urlPattern, scriptUrl}) => {
        if (window.location.href.match(urlPattern)) {
            if (Array.isArray(scriptUrl)) {
                scriptUrl.forEach(url => {
                    fetch(url)
                        .then(response => response.text())
                        .then(scriptContent => {
                            eval(scriptContent); // Ejecuta el script cargado
                        })
                        .catch(error => console.error('Error al cargar el script:', error));
                });
            } else {
                fetch(scriptUrl)
                    .then(response => response.text())
                    .then(scriptContent => {
                        eval(scriptContent); // Ejecuta el script cargado
                    })
                    .catch(error => console.error('Error al cargar el script:', error));
            }
        }
    });
})();
