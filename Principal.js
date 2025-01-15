// ==UserScript==
// @name         Script Principal
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Carga y ejecuta scripts secundarios
// @author       LuchoResuelve
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Lista de scripts secundarios a cargar
    const scripts = [
        'https://dinfcs.github.io/Deckardaov/EvolveAddress.js',
        'https://dinfcs.github.io/Deckardaov/CyborgButtons.js'
    ];

    scripts.forEach(script => {
        fetch(script)
            .then(response => response.text())
            .then(scriptContent => {
                eval(scriptContent); // Ejecuta el script cargado
            })
            .catch(error => console.error('Error al cargar el script:', error));
    });
})();
