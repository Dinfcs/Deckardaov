// ==UserScript==
// @name         PR Sonoma
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Mostrar botón flotante para buscar APN en PR al detectar un cambio en el portapapeles
// @author       Tu nombre
// @match        https://cyborg.deckard.com/listing/CA/sonoma/_/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Función para verificar cambios en el portapapeles
    async function verificarPortapapeles() {
        try {
            let text = await navigator.clipboard.readText();
            // Eliminar todos los espacios del texto
            text = text.replace(/\s+/g, '');
            const apnRegex = /^\d{12}$/;
            if (apnRegex.test(text)) {
                mostrarBoton(text);
            }
        } catch (err) {
            console.error('Error reading clipboard: ', err);
        }
    }

    // Configurar un intervalo para verificar el portapapeles cada segundo
    setInterval(verificarPortapapeles, 1000);

    // Función para mostrar el botón flotante
    function mostrarBoton(apn) {
        let boton = document.getElementById('buscar-apn-boton');

        if (!boton) {
            boton = document.createElement('button');
            boton.id = 'buscar-apn-boton';
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
            boton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            boton.style.transition = 'background-color 0.3s ease';

            // Agregar efecto hover
            boton.addEventListener('mouseover', () => {
                boton.style.backgroundColor = '#51CAF5';
            });

            boton.addEventListener('mouseout', () => {
                boton.style.backgroundColor = '#51CAF5';
            });

            // Agregar evento para abrir la URL al hacer clic
            boton.addEventListener('click', abrirURL.bind(null, apn));

            document.body.appendChild(boton);
        }
    }

    // Función para abrir la URL
    function abrirURL(apn) {
        const url = `https://common1.mptsweb.com/mbap/SONOMA/Asr/AsrMain/${apn}`;
        window.open(url, '_blank');
    }
})();
