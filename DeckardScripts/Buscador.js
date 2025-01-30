// ==UserScript==
// @name         Buscador
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Detecta coordenadas en el portapapeles y las busca en el otro servicio de mapas (Google Maps, Bing Maps, DuckDuckGo Maps).
// @match        https://www.bing.com/maps*
// @match        https://www.google.com/maps*
// @match        https://duckduckgo.com/*
// @grant        GM_getClipboard
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Función para comprobar si el texto es una coordenada válida en el formato A, -B
    function esCoordenada(texto) {
        const regex = /^\s*([-+]?\d{1,2}(?:\.\d+)?),\s*(-\d{1,3}(?:\.\d+)?)\s*$/;
        return regex.test(texto);
    }

    // Función para obtener las coordenadas desde el portapapeles
    async function obtenerCoordenadasDesdePortapapeles() {
        try {
            const texto = await navigator.clipboard.readText();
            return esCoordenada(texto) ? texto : null;
        } catch (e) {
            console.error('Error al acceder al portapapeles:', e);
            return null;
        }
    }

    // Función para crear y mostrar el botón flotante
    function crearBotonFlotante(icono, onClick, topOffset) {
        const btnContainer = document.createElement('div');
        btnContainer.style.position = 'fixed';
        btnContainer.style.top = `calc(50% + ${topOffset}px)`; // Centrar verticalmente con desplazamiento
        btnContainer.style.right = '20px';
        btnContainer.style.zIndex = '9999';

        const btn = document.createElement('button');
        btn.innerHTML = icono;
        btn.style.padding = '8px';
        btn.style.fontSize = '24px';
        btn.style.backgroundColor = 'transparent';
        btn.style.color = '#000';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.onclick = onClick;

        btnContainer.appendChild(btn);
        document.body.appendChild(btnContainer);
    }

    // Función para inicializar los botones
    function inicializarBotones() {
        if (window.location.host.includes('bing.com')) {
            crearBotonFlotante('🌐', async () => {
                const coordenada = await obtenerCoordenadasDesdePortapapeles();
                if (coordenada) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordenada)}`, '_blank');
                } else {
                    alert('No se encontraron coordenadas válidas en el portapapeles.');
                }
            }, -30);
            crearBotonFlotante('🦆', async () => {
                const coordenada = await obtenerCoordenadasDesdePortapapeles();
                if (coordenada) {
                    window.open(`https://duckduckgo.com/?va=i&t=hv&q=${encodeURIComponent(coordenada)}+Show+on+Map&ia=web&iaxm=maps&bbox=`, '_blank');
                } else {
                    alert('No se encontraron coordenadas válidas en el portapapeles.');
                }
            }, 30);
        } else if (window.location.host.includes('google.com')) {
            crearBotonFlotante('📍', async () => {
                const coordenada = await obtenerCoordenadasDesdePortapapeles();
                if (coordenada) {
                    window.open(`https://www.bing.com/maps?q=${encodeURIComponent(coordenada)}`, '_blank');
                } else {
                    alert('No se encontraron coordenadas válidas en el portapapeles.');
                }
            }, -30);
            crearBotonFlotante('🦆', async () => {
                const coordenada = await obtenerCoordenadasDesdePortapapeles();
                if (coordenada) {
                    window.open(`https://duckduckgo.com/?va=i&t=hv&q=${encodeURIComponent(coordenada)}+Show+on+Map&ia=web&iaxm=maps&bbox=`, '_blank');
                } else {
                    alert('No se encontraron coordenadas válidas en el portapapeles.');
                }
            }, 30);
        } else if (window.location.host.includes('duckduckgo.com')) {
            crearBotonFlotante('🌐', async () => {
                const coordenada = await obtenerCoordenadasDesdePortapapeles();
                if (coordenada) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordenada)}`, '_blank');
                } else {
                    alert('No se encontraron coordenadas válidas en el portapapeles.');
                }
            }, -30);
            crearBotonFlotante('📍', async () => {
                const coordenada = await obtenerCoordenadasDesdePortapapeles();
                if (coordenada) {
                    window.open(`https://www.bing.com/maps?q=${encodeURIComponent(coordenada)}`, '_blank');
                } else {
                    alert('No se encontraron coordenadas válidas en el portapapeles.');
                }
            }, 30);
        }
    }

    // Inicializar los botones una vez que la página ha cargado
    window.addEventListener('load', inicializarBotones);
})();
