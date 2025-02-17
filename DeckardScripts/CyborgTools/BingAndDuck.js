// ==UserScript==
// @name         Find with Bing Maps and DuckDuckGo Maps
// @namespace    
// @version      2.4
// @description  Agrega enlaces a Bing Maps y DuckDuckGo Maps en la página de proyectos
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function getCoordinates() {
        // Intenta obtener coordenadas desde un enlace de Google Maps
        const link = document.querySelector('a[href*="https://www.google.com/maps/place/"]');
        if (link) {
            const match = link.href.match(/place\/([-0-9.]+)\+([-0-9.]+)/);
            if (match) return { lat: match[1], lon: match[2] };
        }

        // Intenta obtener coordenadas desde la tabla
        const latElement = document.querySelector('td.value[data-field-name="latitude"]');
        const lonElement = document.querySelector('td.value[data-field-name="longitude"]');
        if (latElement && lonElement) {
            const lat = parseFloat(latElement.textContent.trim());
            const lon = parseFloat(lonElement.textContent.trim());
            if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
        }

        return null;
    }

    function createMapLink(href, iconSrc) {
        const link = document.createElement('a');
        link.href = href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        const icon = document.createElement('img');
        icon.src = iconSrc;
        Object.assign(icon.style, {
            marginLeft: '5px',
            width: '30px',
            height: '30px',
            cursor: 'pointer'
        });

        link.appendChild(icon);
        return link;
    }

    function insertarIconos() {
        const targetDiv = document.querySelector('div h5[style="display: inline;"]')?.parentElement;
        const googleMapLink = document.querySelector('a[href*="https://www.google.com/maps/place/"] img[src="/assets/image/google_map.svg"]');
        if (!targetDiv || !googleMapLink) return;

        const coordinates = getCoordinates();
        if (!coordinates) return;

        const iconContainer = document.createElement('span');
        iconContainer.style.gap = '10px';

        const bingUrl = `https://www.bing.com/maps?q=${coordinates.lat},${coordinates.lon}&cp=${coordinates.lat}~${coordinates.lon}&lvl=19.7&style=h`;
        const duckUrl = `https://duckduckgo.com/?va=i&t=hv&q=${coordinates.lat}%2C${coordinates.lon}+Show+on+Map&ia=web&iaxm=maps`;

        iconContainer.appendChild(createMapLink(bingUrl, 'https://www.bing.com/sa/simg/favicon-2x.ico'));
        iconContainer.appendChild(createMapLink(duckUrl, 'https://duckduckgo.com/favicon.ico'));

        googleMapLink.parentElement.insertAdjacentElement('afterend', iconContainer);
    }

    const observer = new MutationObserver((mutations, obs) => {
        if (document.querySelector('div h5[style="display: inline;"]')) {
            insertarIconos();
            obs.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
