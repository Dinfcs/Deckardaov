// ==UserScript==
// @name         Script Principal
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Define y carga scripts auxiliares según la URL
// @author       Tu Nombre
// @match        *://*/*
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';

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
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/NearbyParcels.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ProjectResourses%20Floating.js'
        },
        {
            urlPattern: /^https:\/\/www\.google\.com\/maps/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Buscador.js'
        },
        {
            urlPattern: /^https:\/\/www\.bing\.com\/maps/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Buscador.js'
        }
    ];

    for (const {urlPattern, scriptUrl} of scripts) {
        if (window.location.href.match(urlPattern)) {
            try {
                const response = await fetch(scriptUrl);
                const scriptContent = await response.text();
                eval(scriptContent);
                console.log(`Script loaded: ${scriptUrl}`);
            } catch (error) {
                console.error(`Error loading script ${scriptUrl}:`, error);
            }
        }
    }
})();
