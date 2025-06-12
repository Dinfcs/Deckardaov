// ==UserScript==
// @name         Open Links
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Abre los primeros 10 hipervínculos que contienen "Open"
// @author       Tu Nombre
// @match        https://cyborg.deckard.com/listing/*
// @exclude      https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Crear el botón flotante
    const button = document.createElement('button');
    button.textContent = '"Open"';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.left = '50%';
    button.style.transform = 'translateX(-50%)';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    document.body.appendChild(button);

    // Función para abrir los enlaces
    button.addEventListener('click', () => {
        const links = Array.from(document.querySelectorAll('a[href^="/listing/"]'));
        const openLinks = links.filter(link => link.textContent.trim() === 'Open');
        openLinks.slice(0, 10).forEach(link => {
            window.open(link.href, '_blank');
        });
    });
})();
