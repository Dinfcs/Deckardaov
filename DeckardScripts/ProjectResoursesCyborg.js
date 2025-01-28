// ==UserScript==
// @name         PREDIT
// @namespace    ProjectResources Cyborg
// @version      2.1
// @description  Mostrar el nombre del proyecto detectado en la URL y una tabla de datos mejorada en la parte inferior de la página.
// @author
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const jsonURL = 'https://dinfcs.github.io/Deckardaov/DeckardScripts/DatabasePR/data.json';
    const targetPattern = /https:\/\/cyborg\.deckard\.com\/listing\/[^\/]+\/[^\/]+\/STR[^\/]+/;


function obtenerNombreProyectoDesdeURL() {
    const url = window.location.href;

    // Detectar CiudadesAustralia
    const regexCiudadesAustralia = /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/;
    const matchCiudadesAustralia = url.match(regexCiudadesAustralia);
    if (matchCiudadesAustralia) {
        const estadoAustralia = 'AUS';
        const nombreCiudadAustralia = matchCiudadesAustralia[2].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        if (nombreCiudadAustralia === 'Bass Coast') {
            return `${estadoAustralia} - ${nombreCiudadAustralia}`;
        } else {
            return `${estadoAustralia} - City of ${nombreCiudadAustralia}`;
        }
    }

    // Detectar nombre de proyecto para condados tipo town
    const regexTown = /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/;
    const matchTown = url.match(regexTown);
    if (matchTown) {
        const estado = matchTown[1].toUpperCase();
        const tipo = matchTown[3].charAt(0).toUpperCase() + matchTown[3].slice(1); // "Town" o "Township"
        const nombreTown = matchTown[4].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        return `${estado} - ${tipo} Of ${nombreTown}`;
    }

    // Detectar nombre de proyecto para condados normales
    const regexCondado = /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/;
    const matchCondado = url.match(regexCondado);
    if (matchCondado) {
        const estado = matchCondado[1].toUpperCase();
        const nombreCondado = matchCondado[2].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        return `${estado} - ${nombreCondado} County`;
    }

    // Detectar nombre de proyecto para ciudades
    const regexCiudad = /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//;
    const matchCiudad = url.match(regexCiudad);
    if (matchCiudad) {
        const estado = matchCiudad[1].toUpperCase();
        const nombreCiudad = matchCiudad[3].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        return `${estado} - ${nombreCiudad}`;
    }

    return null;
}


    function clearSiteCache(urlPattern) {
        if ('caches' in window) {
            caches.keys().then(function (cacheNames) {
                cacheNames.forEach(function (cacheName) {
                    if (urlPattern.test(window.location.href)) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
    }

    // Limpiar caché del sitio web específico
    clearSiteCache(targetPattern);

    const nombreProyecto = obtenerNombreProyectoDesdeURL();
    if (!nombreProyecto) {
        console.error('No se pudo detectar el nombre del proyecto desde la URL.');
        return;
    }

    const contenedor = document.createElement('div');
    contenedor.style.width = '100%';
    contenedor.style.backgroundColor = '#fff';
    contenedor.style.marginTop = '0px';
    contenedor.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    contenedor.style.borderRadius = '8px';
    contenedor.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(contenedor);

    const barraTitulo = document.createElement('div');
    barraTitulo.style.backgroundColor = '#093140';
    barraTitulo.style.color = '#fff';
    barraTitulo.style.padding = '1px';
    barraTitulo.style.fontSize = '16px';
    barraTitulo.style.fontWeight = 'bold';

    barraTitulo.style.borderTopLeftRadius = '0px';
    barraTitulo.style.borderTopRightRadius = '0px';
    barraTitulo.textContent = `Project Detected: ${nombreProyecto}`;
    contenedor.appendChild(barraTitulo);

    const contenedorDatos = document.createElement('div');
    contenedorDatos.style.padding = '0px';
    contenedorDatos.style.overflowX = 'auto';
    contenedor.appendChild(contenedorDatos);

    // Evento para mostrar/ocultar la tabla al hacer clic en la barra de título
    barraTitulo.addEventListener('click', () => {
        if (contenedorDatos.style.display === 'none') {
            contenedorDatos.style.display = 'block';
        } else {
            contenedorDatos.style.display = 'none';
        }
    });

    async function cargarDatos() {
        try {
            const response = await fetch(jsonURL, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Error al leer la base de datos: ${response.statusText}`);
            }

            const data = await response.json();

            const proyectoFiltrado = data.tabla.find(proyecto =>
                proyecto.Project.toLowerCase() === nombreProyecto.toLowerCase()
            );

            if (!proyectoFiltrado) {
                contenedorDatos.textContent = 'No se encontraron datos para el proyecto detectado.';
                return;
            }

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '0px';

            const headers = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];
            const headerWidths = ['10%', '10%', '10%', '60%', '10%'];

            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            headers.forEach((header, index) => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.width = headerWidths[index];
                th.style.backgroundColor = '#F8F8F8';
                th.style.color = '#333';
                th.style.padding = '12px';
                th.style.textAlign = 'left';
                th.style.borderBottom = '2px solid #DDD';
                th.style.fontSize = '14px';
                th.style.fontWeight = 'bold';
                headerRow.appendChild(th);
            });

            const tbody = table.createTBody();
            const row = tbody.insertRow();
            headers.forEach(header => {
                const cell = row.insertCell();
                cell.style.padding = '12px';
                cell.style.borderBottom = '1px solid #EEE';
                cell.style.verticalAlign = 'top';
                cell.style.color = '#555';
                cell.style.fontSize = '12px';

                if (Array.isArray(proyectoFiltrado[header])) {
                    proyectoFiltrado[header].forEach(link => {
                        if (link.url && (link.type === 'Image' || /\.(jpg|jpeg|png|gif)$/.test(link.url))) {
                            const img = document.createElement('img');
                            img.src = link.url;
                            img.alt = 'Image';
                            img.style.width = '100px';
                            img.style.height = 'auto';
                            img.style.margin = '5px';
                            img.style.cursor = 'pointer';
                            img.style.borderRadius = '4px';
                            img.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                            img.onclick = () => window.open(link.url, '_blank');
                            cell.appendChild(img);
                        } else {
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.textContent = link.type;
                            a.target = '_blank';
                            a.style.display = 'block';
                            a.style.marginBottom = '6px';
                            a.style.color = '#1E90FF';
                            a.style.textDecoration = 'none';
                            a.style.fontWeight = 'bold';
                            a.style.transition = 'color 0.2s';
                            a.onmouseover = () => a.style.color = '#3742fa';
                            a.onmouseout = () => a.style.color = '#1E90FF';
                            cell.appendChild(a);
                        }
                    });
                } else {
                    if (header === 'Important Info' && proyectoFiltrado[header]) {
                        const paragraphs = proyectoFiltrado[header].split('\n');
                        paragraphs.forEach(paragraph => {
                            const p = document.createElement('p');
                            p.textContent = paragraph;
                            p.style.marginBottom = '5px'; // Ajustar esta línea para reducir el espacio entre párrafos
                            p.style.lineHeight = '1.2'; // Ajustar esta línea para reducir la altura de línea
                            cell.appendChild(p);
                        });
                    } else {
                        cell.textContent = proyectoFiltrado[header] || '';
                    }
                }
            });

            contenedorDatos.appendChild(table);

        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    }

    cargarDatos();
})();
