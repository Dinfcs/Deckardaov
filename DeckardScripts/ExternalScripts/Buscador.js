// ==UserScript==
// @name         Buscador de Coordenadas
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Detecta coordenadas en el portapapeles y las busca en otros servicios de mapas.
// @match        https://www.bing.com/maps*
// @match        https://www.google.com/maps*
// @match        https://duckduckgo.com/*
// @grant        GM_getClipboard
// @grant        GM_addStylea
// ==/UserScript==

(function () {
    'use strict';

    // Verifica si un texto contiene coordenadas en el formato "lat, lng"
    function esCoordenada(texto) {
        const regex = /^\s*([-+]?\d{1,2}(?:\.\d+)?),\s*(-\d{1,3}(?:\.\d+)?)\s*$/;
        return regex.test(texto);
    }

    // Obtiene coordenadas desde el portapapeles
    async function obtenerCoordenadasDesdePortapapeles() {
        try {
            const texto = await navigator.clipboard.readText();
            return esCoordenada(texto) ? texto.match(/([-+]?\d{1,2}(?:\.\d+)?),\s*(-\d{1,3}(?:\.\d+)?)/).slice(1, 3) : null;
        } catch (e) {
            console.error('Error al acceder al portapapeles:', e);
            return null;
        }
    }

    // Crea un contenedor flotante
    function crearContenedorBotones() {
        const contenedor = document.createElement('div');
        contenedor.style.position = 'fixed';
        contenedor.style.top = '50%';
        contenedor.style.right = '20px';
        contenedor.style.transform = 'translateY(-50%)';
        contenedor.style.zIndex = '9999';
        contenedor.style.background = 'rgba(0, 0, 0, 0.5)';
        contenedor.style.borderRadius = '10px';
        contenedor.style.padding = '10px';
        contenedor.style.display = 'flex';
        contenedor.style.flexDirection = 'column';
        contenedor.style.gap = '5px';
        document.body.appendChild(contenedor);
        return contenedor;
    }

    // Crea un botón flotante dentro del contenedor
    function crearBoton(icono, onClick) {
        const btn = document.createElement('button');
        btn.innerHTML = icono;
        btn.style.padding = '10px';
        btn.style.fontSize = '24px';
        btn.style.background = 'transparent';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.display = 'block';
        btn.onclick = onClick;
        return btn;
    }

    // Inicializa los botones según el servicio de mapas actual
    async function inicializarBotones() {
        const mapaActual = window.location.host;
        const contenedor = crearContenedorBotones();

        // Mapeo de botones según el servicio actual
        const botones = {
            'bing.com': [
                { icono: '🌐', url: (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
                { icono: '🦆', url: (lat, lng) => `https://duckduckgo.com/?va=i&t=hv&q=${lat},${lng}+Show+on+Map&ia=web&iaxm=maps&bbox=` }
            ],
            'google.com': [
                { icono: '📍', url: (lat, lng) => `https://www.bing.com/maps?q=${lat},${lng}&cp=${lat}~${lng}&lvl=16.0&style=h` },
                { icono: '🦆', url: (lat, lng) => `https://duckduckgo.com/?va=i&t=hv&q=${lat},${lng}+Show+on+Map&ia=web&iaxm=maps&bbox=` }
            ],
            'duckduckgo.com': [
                { icono: '🌐', url: (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
                { icono: '📍', url: (lat, lng) => `https://www.bing.com/maps?q=${lat},${lng}&cp=${lat}~${lng}&lvl=16.0&style=h` }
            ]
        };

        // Determina qué botones agregar según la página actual
        const mapaClave = mapaActual.includes('bing.com') ? 'bing.com'
            : mapaActual.includes('google.com') ? 'google.com'
                : 'duckduckgo.com';

        for (const { icono, url } of botones[mapaClave]) {
            contenedor.appendChild(crearBoton(icono, async () => {
                const coordenadas = await obtenerCoordenadasDesdePortapapeles();
                if (coordenadas) {
                    const [lat, lng] = coordenadas;
                    window.open(url(lat, lng), '_blank');
                } else {
                    alert('No se encontraron coordenadas válidas en el portapapeles.');
                }
            }));
        }
    }

    // Ejecutar cuando la página cargue
    window.addEventListener('load', inicializarBotones);
})();
