// ==UserScript==
// @name         PR Sonoma
// @namespace    http://tampermonkey.net/
// @version      4
// @description  Mostrar botón flotante para buscar APN en PR al detectar un cambio en el portapapeles
// @author       Tu nombre
// @match        https://cyborg.deckard.com/listing/CA/sonoma/_/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Crear un elemento de textarea oculto para copiar el contenido del portapapeles
    const textarea = document.createElement('textarea');
    textarea.style.position = 'absolute';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);

    // Función para leer el portapapeles y mostrar el botón si es un APN válido
    async function verificarPortapapeles() {
        try {
            const text = await navigator.clipboard.readText();
            const cleanText = text.trim();
            const apnRegex = /^\d{12}$/;
            if (apnRegex.test(cleanText)) {
                mostrarBoton(cleanText);
            }
        } catch (err) {
            console.error('Error reading clipboard: ', err);
        }
    }

    // Verificar el portapapeles cada segundo
    setInterval(verificarPortapapeles, 1000);

    // Función para mostrar el botón flotante
    function mostrarBoton(apn) {
        const boton = document.createElement('button');
        boton.textContent = 'Search in PR';
        boton.style.position = 'fixed';
        boton.style.bottom = '20px';
        boton.style.right = '20px';
        boton.style.zIndex = '10000';
        boton.style.padding = '10px 20px';
        boton.style.backgroundColor = '#51CAF5';
        boton.style.color = '#fff';
        boton.style.border = 'none';
        boton.style.borderRadius = '5px';
        boton.style.cursor = 'pointer';

        // Agregar evento para abrir la URL al hacer clic
        boton.addEventListener('click', () => {
            const url = `https://common1.mptsweb.com/mbap/SONOMA/Asr/AsrMain/${apn}`;
            window.open(url, '_blank');
        });

        document.body.appendChild(boton);

        // Eliminar el botón después de 10 segundos
        setTimeout(() => {
            boton.remove();
        }, 10000);
    }
})();
