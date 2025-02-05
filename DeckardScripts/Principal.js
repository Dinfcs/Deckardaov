
// ==UserScript==
// @name         Script Principal
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Define y carga scripts auxiliares según la URL
// @author       Tu Nombre
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(async function() {
    'use strict';

    const scripts = [
            {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgButtons.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/NearbyParcels.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/BingAndDuck.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ProjectResoursesCyborg.js'
        },
        {
            urlPattern: /^https:\/\/evolve\.com\/vacation-rentals\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/EvolveAddress.js'
        },
        {
            urlPattern: /^https:\/\/www\.michaelsvacationrentals\.com\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/MichaelVacationRentalsAddress.js'
        },
        {
            urlPattern: /^https:\/\/sedona\.org\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/sedona.org.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/CA\/sonoma\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/PrSonoma.js'

        },
        {
            urlPattern: /^https:\/\/www\.google\.com\/maps\/place\/.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Buscador.js'
        },
        {
            urlPattern: /^https:\/\/www\.bing\.com\/maps.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Buscador.js'
        },
                {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Viewer.js'
        }        
    ];

    for (const {urlPattern, scriptUrl} of scripts) {
        if (window.location.href.match(urlPattern)) {
            try {
                console.log(`Loading script: ${scriptUrl}`);
                const script = document.createElement('script');
                script.src = scriptUrl;
                script.onload = () => {
                    console.log(`Script loaded and executed: ${scriptUrl}`);
                };
                script.onerror = () => {
                    console.error(`Error loading script ${scriptUrl}`);
                    alert(`Error loading script ${scriptUrl}. Check console for details.`);
                };
                document.head.appendChild(script);
            } catch (error) {
                console.error(`Error loading script ${scriptUrl}:`, error);
                alert(`Error loading script ${scriptUrl}. Check console for details.`);
            }
        }
    }
})();
