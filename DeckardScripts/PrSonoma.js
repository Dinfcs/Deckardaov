// ==UserScript==
// @name         PR Sonoma
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Mostrar botón flotante para buscar APN en PR al detectar un cambio en el portapapeles
// @author       Tu nombre
// @match        https://cyborg.deckard.com/listing/CA/sonoma/_/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Escuchar eventos de teclado
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'c') {
            // Obtener el texto del portapapeles
            navigator.clipboard.readText().then(text => {
                // Eliminar espacios en blanco antes y después del texto
                const cleanText = text.trim();

                // Verificar si el texto es un número de 12 dígitos
                const apnRegex = /^\d{12}$/;
                if (apnRegex.test(cleanText)) {
                    mostrarBoton(cleanText);
                }
            }).catch(err => {
                console.error('Error reading clipboard: ', err);
            });
        }
    });

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
