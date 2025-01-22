// ==UserScript==
// @name         Buscador
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Detecta coordenadas en el portapapeles y las busca en el otro servicio de mapas (Google Maps o Bing Maps).
// @match        https://www.bing.com/maps*
// @match        https://www.google.com/maps*
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
    function crearBotonFlotante(textoBoton, onClick) {
        const btnContainer = document.createElement('div');
        btnContainer.style.position = 'fixed';
        btnContainer.style.top = '50%'; // Centrar verticalmente
        btnContainer.style.right = '20px';
        btnContainer.style.transform = 'translateY(-50%)'; // Ajustar para centrar completamente
        btnContainer.style.zIndex = '9999';

        const btn = document.createElement('button');
        btn.textContent = textoBoton;
        btn.style.padding = '8px 8px';
        btn.style.fontSize = '10px';
        btn.style.backgroundColor = '#1E90FF';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.onclick = onClick;

        btnContainer.appendChild(btn);
        document.body.appendChild(btnContainer);
    }

    // Determinar el sitio web actual y crear el botón correspondiente
    if (window.location.host.includes('bing.com')) {
        crearBotonFlotante('Buscar en Google Maps', async () => {
            const coordenada = await obtenerCoordenadasDesdePortapapeles();
            if (coordenada) {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordenada)}`, '_blank');
            } else {
                alert('No se encontraron coordenadas válidas en el portapapeles.');
            }
        });
    } else if (window.location.host.includes('google.com')) {
        crearBotonFlotante('Buscar en Bing Maps', async () => {
            const coordenada = await obtenerCoordenadasDesdePortapapeles();
            if (coordenada) {
                window.open(`https://www.bing.com/maps?q=${encodeURIComponent(coordenada)}`, '_blank');
            } else {
                alert('No se encontraron coordenadas válidas en el portapapeles.');
            }
        });
    }
})();
