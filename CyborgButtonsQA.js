// ==UserScript==
// @name         Script Auxiliar
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Carga el script principal
// @author       Tu Nombre
// @match        *://*/*
// @icon         https://dinfcs.github.io/Deckardaov/logo.png
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    // URL del script principal
    const principalScriptUrl = 'https://dinfcs.github.io/Deckardaov/DeckardScripts/Principal.js';
    fetch(principalScriptUrl)
        .then(response => response.text())
        .then(scriptContent => {
            eval(scriptContent); // Ejecuta el script principal cargado
        })
        .catch(error => console.error('Error al cargar el script principal:', error));
})();
