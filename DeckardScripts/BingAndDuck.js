// ==UserScript==
// @name         find with Bing Maps and DuckDuckGo Maps
// @namespace    http://tampermonkey.net/
// @version      1.2
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

    // Crear contenedor de iconos
    const iconContainer = document.createElement('div');
    iconContainer.style.position = 'fixed';
    iconContainer.style.top = '30px'; // Ajusta este valor para subir o bajar el contenedor
    iconContainer.style.left = '40.2%';
    iconContainer.style.transform = 'translateX(-50%)';
    iconContainer.style.display = 'flex';
    iconContainer.style.gap = '5px';
    iconContainer.style.zIndex = '0'; // Ajusta este valor para que quede detrás de otras ventanas
    document.body.appendChild(iconContainer);

    // Crear botón de Bing Maps
    const bingButton = document.createElement('img');
    bingButton.src = 'https://www.bing.com/sa/simg/favicon-2x.ico'; // Ícono de Bing
    bingButton.style.width = '30px';
    bingButton.style.height = '30px';
    bingButton.style.cursor = 'pointer';
    bingButton.title = 'Buscar en Bing Maps';
    bingButton.onclick = openBingMaps;
    iconContainer.appendChild(bingButton);

    // Crear botón de DuckDuckGo Maps
    const duckButton = document.createElement('img');
    duckButton.src = 'https://duckduckgo.com/favicon.ico'; // Ícono de DuckDuckGo
    duckButton.style.width = '30px';
    duckButton.style.height = '30px';
    duckButton.style.cursor = 'pointer';
    duckButton.title = 'Buscar en DuckDuckGo Maps';
    duckButton.onclick = openDuckMaps;
    iconContainer.appendChild(duckButton);

})();