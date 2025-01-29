// ==UserScript==
// @name         NearbyParcels
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Añade un botón fijo para abrir direcciones en Google Maps que solo aparece cuando el scroll está arriba
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('NearbyParcels script ejecutándose');

    function createButton() {
        console.log('Creando el botón "Abrir Nparcels"');

        // Crea el botón "Abrir Nparcels"
        const button = document.createElement('button');
        button.innerHTML = '<b>NearbyParcels</b>'; // Texto en negrita
        button.style.position = 'fixed';
        button.style.top = '0px'; // Totalmente pegado a la parte superior
        button.style.left = '60%';
        button.style.transform = 'translateX(-50%)';
        button.style.zIndex = 9999;
        button.style.padding = '2px';
        button.style.backgroundColor = '#093140';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.fontSize = '14px';
        button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        button.style.cursor = 'pointer';
        button.style.transition = 'opacity 0.3s ease'; // Transición suave para la visibilidad
        button.style.opacity = '1'; // Totalmente visible al cargar
        button.style.zIndex = '0'; // Ajusta este valor para que quede detrás de otras ventanas

        document.body.appendChild(button);
        console.log('Botón "Abrir Nparcels" añadido al DOM:', button);

        // Agrega el evento de click al botón
        button.addEventListener('click', () => {
            console.log('Botón "Abrir Nparcels" clicado');

            // Selecciona todos los hipervínculos de Google en la página
            const links = document.querySelectorAll('a[href*="https://www.google.com/search?q="]');
            console.log(`Encontrados ${links.length} enlaces`);

            links.forEach((link, index) => {
                // Abre solo los primeros 10 hipervínculos
                if (index < 10) {
                    // Extrae la dirección del hipervínculo
                    const url = new URL(link.href);
                    const searchParams = new URLSearchParams(url.search);
                    const address = searchParams.get('q');
                    console.log(`Dirección extraída: ${address}`);

                    // Abre la dirección en Google Maps
                    if (address) {
                        window.open(`https://www.google.com/maps/search/${encodeURIComponent(address)}`, '_blank');
                    }
                }
            });
        });

        // Agrega el evento de scroll para ocultar/mostrar el botón
        window.addEventListener('scroll', () => {
            const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

            if (currentScrollTop === 0) {
                // Si el usuario está completamente arriba, muestra el botón
                button.style.opacity = '1';
            } else {
                // Si el usuario se desplaza hacia abajo, oculta el botón
                button.style.opacity = '0';
            }
        });
    }

    // Ejecuta la creación del botón 2 segundos después de cargar la página
    window.addEventListener('load', () => {
        setTimeout(createButton, 4000);
    });
})();
