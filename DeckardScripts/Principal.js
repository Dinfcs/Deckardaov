// ==UserScript==
// @name         Script Principal
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  Define y carga scripts auxiliares según la URL
// @author       Tu Nombre
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(async function() {
    'use strict';

    const scripts = [
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\//, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/CyborgButtons.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/NearbyParcels.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/BingAndDuck.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/ProjectResoursesCyborg.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/CA\/sonoma\/.*\/STR.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PrSonoma.js' },
        { urlPattern: /^https:\/\/www\.google\.com\/maps\/.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/Buscador.js' },
        { urlPattern: /^https:\/\/www\.bing\.com\/maps.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/Buscador.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/Viewer.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\//, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/StylesCyborg.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/.*\?.*subset=pending_qa/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/Autofilterforqa.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/parcel\/.+$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/ParcelAdresses.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/parcel\/.+$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/ParcelFilter.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/MA\/dukes...town_of_oak_bluffs\/.*\/STR.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PR-MA%20-Town_of_Oak_Bluffs.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/MA\/dukes...town_of_tisbury\/.*\/STR.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PR-MA-Town_of_Tisbury.js' },
        { urlPattern: /^https:\/\/login-spatialstream\.prod\.lightboxre\.com\/MemberPages\/.*$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/AutologinLB-PQ.js' },
        { urlPattern: /^https:\/\/pqweb\.parcelquest\.com\/#login$/,scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/AutologinLB-PQ.js' }
        
        
    ];

    const loadScript = (scriptUrl) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.onload = () => {
                console.log(`Script loaded: ${scriptUrl}`);
                resolve();
            };
            script.onerror = () => {
                console.error(`Error loading script: ${scriptUrl}`);
                reject();
            };
            document.head.appendChild(script);
        });
    };

    try {
        const matchingScripts = scripts.filter(({ urlPattern }) => urlPattern.test(window.location.href));
        for (const { scriptUrl } of matchingScripts) {
            await loadScript(scriptUrl);
        }
        
        // Cargar el script UniversalAE.js al final
        await loadScript('https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/UniversalAE.js');
    } catch (error) {
        console.error('Error loading scripts:', error);
    }
})();
