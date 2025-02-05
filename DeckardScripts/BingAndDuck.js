// ==UserScript==
// @name         find with Bing Maps and DuckDuckGo Maps
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Función para buscar el enlace de Google Maps y extraer las coordenadas
    function getCoordinatesFromLink() {
        const link = document.querySelector('a[href*="https://www.google.com/maps/place/"]');
        if (link) {
            const href = link.href;
            console.log(":link: Enlace encontrado:", href);

            const match = href.match(/place\/([-0-9.]+)\+([-0-9.]+)/);
            if (match && match.length === 3) {
                const lat = parseFloat(match[1]);
                const lon = parseFloat(match[2]);
                console.log(":round_pushpin: Coordenadas desde enlace: Lat =", lat, "Lon =", lon);
                return { lat, lon };
            }
        }
        return null;
    }

    // Función para buscar las coordenadas en la tabla
    function getCoordinatesFromTable() {
        const latElement = document.querySelector('td.value[data-field-name="latitude"]');
        const lonElement = document.querySelector('td.value[data-field-name="longitude"]');

        if (latElement && lonElement) {
            const lat = parseFloat(latElement.textContent.trim());
            const lon = parseFloat(lonElement.textContent.trim());

            if (!isNaN(lat) && !isNaN(lon)) {
                console.log(":round_pushpin: Coordenadas desde tabla: Lat =", lat, "Lon =", lon);
                return { lat, lon };
            }
        }
        return null;
    }

    // Función para obtener coordenadas de cualquier fuente disponible
    function getCoordinates() {
        let coordinates = getCoordinatesFromLink();
        if (!coordinates) {
            coordinates = getCoordinatesFromTable();
        }
        return coordinates;
    }

    // Función para abrir Bing Maps con vista satelital y zoom alto
    function openBingMaps() {
        const coordinates = getCoordinates();
        if (!coordinates) {
            alert(":warning: No se encontraron coordenadas en la página.");
            return;
        }
        const url = `https://www.bing.com/maps?q=${coordinates.lat},${coordinates.lon}&cp=${coordinates.lat}~${coordinates.lon}&lvl=19.7&style=h`;
        window.open(url, '_blank');
    }

    // Función para abrir DuckDuckGo Maps
    function openDuckMaps() {
        const coordinates = getCoordinates();
        if (!coordinates) {
            alert(":warning: No se encontraron coordenadas en la página.");
            return;
        }
        const url = `https://duckduckgo.com/?va=i&t=hv&q=${coordinates.lat}%2C${coordinates.lon}+Show+on+Map&ia=web&iaxm=maps`;
        window.open(url, '_blank');
    }

    // Función para insertar los iconos
    function insertarIconos() {
        const targetDivs = document.querySelectorAll('div');
        let insertedIcons = false;

        targetDivs.forEach(targetDiv => {
            const h5Element = targetDiv.querySelector('h5[style="display: inline;"]');
            const rentalscapeImg = targetDiv.querySelector('a[href^="https://rentalscape.deckard.technology"] img[src="/assets/image/rentalscape.svg"]');
            const googleMapLink = targetDiv.querySelector('a[href*="https://www.google.com/maps/place/"] img[src="/assets/image/google_map.svg"]');

            if (h5Element && rentalscapeImg && googleMapLink && !insertedIcons) {
                const googleLink = googleMapLink.parentElement;
                const iconContainer = document.createElement('span');
                iconContainer.style.gap = '10px';

                googleLink.insertAdjacentElement('afterend', iconContainer);

                // Crear botón de Bing Maps
                const bingButton = document.createElement('img');
                bingButton.src = 'https://www.bing.com/sa/simg/favicon-2x.ico'; // Ícono de Bing
                bingButton.style.marginLeft = '5px'; // Margen para separarlo de otros botones
                bingButton.style.width = '30px';
                bingButton.style.height = '30px';
                bingButton.style.cursor = 'pointer';
                bingButton.title = 'Buscar en Bing Maps';
                bingButton.onclick = openBingMaps;
                iconContainer.appendChild(bingButton);

                // Crear botón de DuckDuckGo Maps
                const duckButton = document.createElement('img');
                duckButton.src = 'https://duckduckgo.com/favicon.ico'; // Ícono de DuckDuckGo
                duckButton.style.marginLeft = '5px'; // Margen para separarlo de otros botones
                duckButton.style.width = '30px';
                duckButton.style.height = '30px';
                duckButton.style.cursor = 'pointer';
                duckButton.title = 'Buscar en DuckDuckGo Maps';
                duckButton.onclick = openDuckMaps;
                iconContainer.appendChild(duckButton);

                insertedIcons = true; // Marcar como insertados para evitar duplicaciones
            }
        });
    }

    // Crear un observador de mutaciones para esperar a que el div aparezca
    const observer = new MutationObserver((mutations, obs) => {
        const targetDiv = document.querySelector('div h5[style="display: inline;"]');
        if (targetDiv) {
            insertarIconos();
            obs.disconnect(); // Dejar de observar una vez que el div ha sido encontrado e insertado los íconos
        }
    });

    // Configurar el observador de mutaciones
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
