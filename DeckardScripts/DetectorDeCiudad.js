// ==UserScript==
// @name         Detector de coordenadas con alertas de exclusión
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Extrae latitud y longitud desde Google Maps o una tabla y muestra la ciudad en pantalla después de 4 segundos. Genera alertas si la ciudad está en la lista de exclusiones del proyecto.
// @author       Tu Nombre
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Función para obtener coordenadas desde el enlace de Google Maps
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
                return { lat, lon, source: "Google Maps" };
            }
        }
        return null;
    }

    // Función para obtener coordenadas desde la tabla
    function getCoordinatesFromTable() {
        const latElement = document.querySelector('td.value[data-field-name="latitude"]');
        const lonElement = document.querySelector('td.value[data-field-name="longitude"]');

        if (latElement && lonElement) {
            const lat = parseFloat(latElement.textContent.trim());
            const lon = parseFloat(lonElement.textContent.trim());

            if (!isNaN(lat) && !isNaN(lon)) {
                console.log(":round_pushpin: Coordenadas desde tabla: Lat =", lat, "Lon =", lon);
                return { lat, lon, source: "Tabla de datos" };
            }
        }
        return null;
    }

    // Función para obtener la ciudad desde las coordenadas
    async function fetchCity(lat, lon) {
        try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            const data = await response.json();
            return data.locality || 'Ciudad desconocida';
        } catch (error) {
            console.error(':x: Error al obtener la ciudad:', error);
            return 'Error al obtener la ciudad';
        }
    }

    // Función para obtener el nombre del proyecto desde la URL
 function obtenerNombreProyectoDesdeURL() {
    const url = window.location.href;

    const patrones = [
        { regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/, formato: (m) => `AUS - ${m[2].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) === 'Bass Coast' ? m[2].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'City of ' + m[2].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/, formato: (m) => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${m[4].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, formato: (m) => `${m[1].toUpperCase()} - ${m[2].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())} County` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//, formato: (m) => `${m[1].toUpperCase()} - ${m[3].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}` }
    ];

    for (const { regex, formato } of patrones) {
        const match = url.match(regex);
        if (match) return formato(match);
    }

    return null;
}

    // Función para verificar si una ciudad está en la lista de exclusiones de un proyecto
    async function verificarExclusionCiudad(proyecto, ciudad) {
        try {
            const response = await fetch('https://dinfcs.github.io/Deckardaov/restricciones.json'); // Reemplaza con la URL real de tu JSON
            const data = await response.json();
            const proyectoData = data[proyecto];
            if (proyectoData && proyectoData.exclusiones.includes(ciudad)) {
                return true;
            }
            return false;
        } catch (error) {
            console.error(':x: Error al verificar exclusión de la ciudad:', error);
            return false;
        }
    }

    // Función para mostrar una alerta en toda la pantalla con un botón de salida que cierra la pestaña
    function mostrarAlerta(city, proyecto) {
        const alertaDiv = document.createElement('div');
        alertaDiv.innerHTML = `
            <div style="color: white; background-color: red; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: fixed; top: 0; left: 0; z-index: 100000;">
                <h1>⚠️ Alerta: ${city} This listing is outside the boundaries of ${proyecto}</h1>
                <button id="exitButton" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; cursor: pointer;">Exit</button>
            </div>
        `;
        document.body.appendChild(alertaDiv);

        document.getElementById('exitButton').addEventListener('click', () => {
            window.close();
        });
    }

    // Función principal que ejecuta todo el flujo después de que se detecte el mensaje en la consola
    async function detectAndShowCity() {
        let coordinates = getCoordinatesFromLink() || getCoordinatesFromTable();
        const proyecto = obtenerNombreProyectoDesdeURL();

        if (!coordinates) {
            console.warn(':warning: No se encontraron coordenadas en la página.');
            return;
        }

        console.log(`Fuente: ${coordinates.source}`);
        console.log(`Latitud: ${coordinates.lat}`);
        console.log(`Longitud: ${coordinates.lon}`);
        console.log(`Proyecto: ${proyecto}`);

        const city = await fetchCity(coordinates.lat, coordinates.lon);
        console.log(`Ciudad: ${city}`);

        const exclusion = await verificarExclusionCiudad(proyecto, city);
        if (exclusion) {
            mostrarAlerta(city, proyecto);
        }
    }

    // Escuchar los mensajes de la consola y ejecutar el script cuando se detecte el mensaje específico
    (function() {
        const originalConsoleLog = console.log;
        console.log = function(message) {
            originalConsoleLog.apply(console, arguments);
            if (typeof message === 'string' && message.includes('cyborg page fully loaded')) {
                detectAndShowCity();
            }
        };
    })();

})();
