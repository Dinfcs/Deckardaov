// ==UserScript==
// @name         NearbyParcels
// @namespace
// @version      3.8
// @description  Añade un botón para abrir direcciones visibles en Google Maps, Google Search o Google Street View
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log('NearbyParcels script ejecutándose');

    let collapseTimeout;

    function waitForButton() {
        const observer = new MutationObserver((mutations, obs) => {
            const button = document.querySelector('#btn_open_vetting_dlg');
            if (button) {
                obs.disconnect(); // Deja de observar cambios en el DOM
                createButton();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function createButton() {
        console.log('Creando el botón "Nearby Parcels"');

        // Crea el botón principal
        const button = document.createElement('button');
        button.innerHTML = 'Nearby Parcels';
        button.id = 'nearbyParcelsButton';
        button.style.marginLeft = '5px';
        button.style.width = '115px';
        button.style.height = '30.4px';
        button.style.backgroundColor = '#045875';
        button.style.color = 'white';
        button.style.fontSize = '14px';
        button.style.position = 'relative';
        button.style.fontFamily = 'Arial, sans-serif';
        button.style.top = '-1px';
        button.style.zIndex = '0';

        // Añadir botón al footer
        const footerDiv = document.getElementById('vetting_data_footer');
        if (footerDiv) {
            footerDiv.appendChild(button);
            console.log('Botón "Nearby Parcels" añadido');
        } else {
            console.log('No se encontró el div con la clase "card-footer".');
        }

        // Evento de clic para mostrar opciones
        button.addEventListener('click', showSecondaryButtons);
    }

    function showSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());

        createSecondaryButton(':world_map: Maps', () => searchVisibleAddresses('maps'));
        createSecondaryButton(':book: Google', () => searchVisibleAddresses('google'));
        createSecondaryButton(':walking: Sview', () => searchVisibleAddresses('streetview'));

        clearTimeout(collapseTimeout);
        collapseTimeout = setTimeout(hideSecondaryButtons, 5000);
    }

    function hideSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());
    }

    function createSecondaryButton(text, onClick) {
        let button = document.createElement('button');
        button.innerText = text;
        button.classList.add('secondary-button');
        button.style.marginLeft = '5px';
        button.addEventListener('click', onClick);

        let mainButton = document.querySelector('#nearbyParcelsButton');
        mainButton.parentNode.insertBefore(button, mainButton.nextSibling);
    }

    function normalizeAddress(address) {
        // Limpieza y normalización de direcciones
        return address
            .replace(/[^\w\s,.-]/gi, '')  // Eliminar caracteres especiales
            .replace(/\s+/g, ' ')         // Normalizar espacios
            .trim();
    }

    async function getImprovedCoordinates(originalAddress) {
        // Normalizar la dirección
        const address = normalizeAddress(originalAddress);

        try {
            // Estrategias de geocodificación
            const strategies = [
                // 1. Dirección completa
                async () => {
                    const response = await fetch(https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, {
                        headers: {
                            'User-Agent': 'NearbyParcels/Precise Geocoding'
                        }
                    });
                    const data = await response.json();
                    return data.length > 0 ? {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                        precision: 'full',
                        displayName: data[0].display_name
                    } : null;
                },

                // 2. Intentar sin detalles específicos
                async () => {
                    const simplifiedAddress = address.split(',').slice(0, -1).join(',');
                    const response = await fetch(https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simplifiedAddress)}, {
                        headers: {
                            'User-Agent': 'NearbyParcels/Precise Geocoding'
                        }
                    });
                    const data = await response.json();
                    return data.length > 0 ? {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                        precision: 'approximate',
                        displayName: data[0].display_name
                    } : null;
                }
            ];

            // Probar estrategias hasta encontrar coordenadas
            for (const strategy of strategies) {
                const result = await strategy();
                if (result) {
                    console.log(Coordenadas encontradas (${result.precision}): ${result.displayName});
                    return result;
                }
            }

            console.warn(No se encontraron coordenadas precisas para: ${address});
            return null;

        } catch (error) {
            console.error('Error en geocodificación:', error);
            return null;
        }
    }

    async function searchVisibleAddresses(type) {
        const addressLinks = document.querySelectorAll('div.unfocused.dash-cell-value.cell-markdown p a[href^="https://www.google.com/search?"]');
        console.log(Encontradas ${addressLinks.length} direcciones);

        const uniqueAddresses = new Set();
        const coordinatesList = [];

        // Obtener coordenadas de todas las direcciones primero
        for (const link of addressLinks) {
            if (isElementInViewport(link)) {
                const address = link.textContent.trim();
                console.log(Dirección visible: ${address});

                if (!uniqueAddresses.has(address)) {
                    uniqueAddresses.add(address);

                    const coordinates = await getImprovedCoordinates(address);
                    if (coordinates) {
                        coordinatesList.push({ address, coordinates });
                    } else {
                        console.log(No se pudieron obtener coordenadas para la dirección: ${address});
                    }

                    // Añadir un pequeño retraso para respetar las políticas de la API
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        // Abrir las direcciones en el tipo seleccionado
        for (const item of coordinatesList) {
            let url;
            if (type === 'maps') {
                url = https://www.google.com/maps/search/${encodeURIComponent(item.address)};
                window.open(url, '_blank');
            } else if (type === 'google') {
                url = https://www.google.com/search?q=${encodeURIComponent(item.address)};
                window.open(url, '_blank');
            } else if (type === 'streetview') {
                // URL de Street View usando coordenadas
                url = https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${item.coordinates.lat},${item.coordinates.lon};
                window.open(url, '_blank');
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1 segundo entre aperturas
        }
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.bottom <= window.innerHeight
        );
    }

    waitForButton();
})();
