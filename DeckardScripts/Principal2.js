// ==UserScript==
// @name         Script Principal
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Define y carga scripts auxiliares según la URL
// @author       Tu Nombre
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @require      https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/UniversalAE.js
// ==/UserScript==

(async function() {
    'use strict';

    const scripts = [
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/CyborgButtons.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/NearbyParcels.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/BingAndDuck.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/ProjectResoursesCyborg.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/CA\/sonoma\/.*\/STR.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PrSonoma.js'
        },
        {
            urlPattern: /^https:\/\/www\.google\.com\/maps\/.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/Buscador.js'
        },
        {
            urlPattern: /^https:\/\/www\.bing\.com\/maps.*$/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/Buscador.js'
        },
        {
           urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/,
           scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/Viewer.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\//,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/StylesCyborg.js'
        },
        {
            urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/.*\?.*subset=pending_qa/,
            scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/Autofilterforqa.js'
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
