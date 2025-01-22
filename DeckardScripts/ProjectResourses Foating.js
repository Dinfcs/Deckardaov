// ==UserScript==
// @name         ProjectResourses Embedded
// @namespace    http://tampermonkey.net/
// @version      1.15
// @description  Mostrar el nombre del proyecto detectado en la URL y la tabla completa de datos en la parte inferior de la página.
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const jsonURL = 'https://dinfcs.github.io/Deckardaov/DeckardScripts/DatabasePR/data.json';

    function obtenerNombreProyectoDesdeURL() {
        const url = window.location.href;

        // Detectar nombre de proyecto para condados tipo town (contiene "..." antes de "/_")
        const regexTown = /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/;
        const matchTown = url.match(regexTown);
        if (matchTown) {
            const estado = matchTown[1].toUpperCase();
            const tipo = matchTown[3].charAt(0).toUpperCase() + matchTown[3].slice(1); // "Town" o "Township"
            const nombreTown = matchTown[4].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
            return `${estado} - ${tipo} Of ${nombreTown}`;
        }

        // Detectar nombre de proyecto para condados normales (sin "..." antes de "/_")
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

    const nombreProyecto = obtenerNombreProyectoDesdeURL();
    if (!nombreProyecto) {
        console.error('Project name could not be detected from URL.');
        return;
    }

    const contenedor = document.createElement('div');
    contenedor.style.width = '100%';
    contenedor.style.backgroundColor = '#fff';
    contenedor.style.marginTop = '10px';
    document.body.appendChild(contenedor);

    const barraTitulo = document.createElement('div');
    barraTitulo.style.backgroundColor = '#C9D82B';
    barraTitulo.style.color = '#000';
    barraTitulo.style.padding = '0px';
    barraTitulo.style.display = 'flex';
    barraTitulo.style.justifyContent = 'space-between';
    barraTitulo.style.alignItems = 'center';
    barraTitulo.textContent = `Project Detected: ${nombreProyecto}`;
    contenedor.appendChild(barraTitulo);

    const contenedorDatos = document.createElement('div');
    contenedorDatos.style.padding = '0px';
    contenedorDatos.style.overflowY = 'auto';
    contenedor.appendChild(contenedorDatos);

    async function cargarDatos() {
        try {
            const response = await fetch(jsonURL);
            if (!response.ok) {
                throw new Error(`Error reading database: ${response.statusText}`);
            }

            const data = await response.json();

            const proyectoFiltrado = data.tabla.find(proyecto =>
                proyecto.Project.toLowerCase() === nombreProyecto.toLowerCase()
            );

            if (!proyectoFiltrado) {
                contenedorDatos.textContent = 'No data found for the detected project.';
                return;
            }

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '0px';
            table.style.backgroundColor = '#f9f9f9';
            table.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';

            const headers = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];
            const headerWidths = ['5%', '5%', '5%', '80%', '5%']; // Ajustar los tamaños según lo especificado

            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            headers.forEach((header, index) => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.width = headerWidths[index];
                th.style.backgroundColor = '#23A9D8';
                th.style.color = '#fff';
                th.style.padding = '5px';
                th.style.textAlign = 'left';
                headerRow.appendChild(th);
            });

            const tbody = table.createTBody();
            const row = tbody.insertRow();
            headers.forEach(header => {
                const cell = row.insertCell();
                cell.style.padding = '10px';
                cell.style.borderBottom = '1px solid #ddd';
                cell.style.verticalAlign = 'top'; // Alinear el contenido en la parte superior
                if (Array.isArray(proyectoFiltrado[header])) {
                    proyectoFiltrado[header].forEach(link => {
                        if (link.url && (link.type === 'Image' || /\.(jpg|jpeg|png|gif)$/.test(link.url))) { // Verificar si el enlace es de imagen
                            const img = document.createElement('img');
                            img.src = link.url;
                            img.alt = 'Image';
                            img.style.width = '60px'; // Ajustar tamaño de la miniatura
                            img.style.height = 'auto'; // Mantener proporción
                            img.style.cursor = 'pointer'; // Cambiar cursor al pasar sobre la imagen
                            img.onclick = () => window.open(link.url, '_blank'); // Abrir la imagen en una nueva pestaña al hacer clic
                            cell.appendChild(img);
                        } else {
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.textContent = link.type;
                            a.target = '_blank';
                            cell.appendChild(a);
                            cell.appendChild(document.createElement('br'));
                        }
                    });
                } else {
                    // Procesar saltos de línea para "Important Info"
                    if (header === 'Important Info' && proyectoFiltrado[header]) {
                        const textoConSaltosDeLinea = proyectoFiltrado[header].replace(/\n/g, '<br>');
                        cell.innerHTML = textoConSaltosDeLinea;
                    } else {
                        cell.textContent = proyectoFiltrado[header] || '';
                    }
                }
            });

            contenedorDatos.appendChild(table);

            // Ajusta la altura del contenedor de datos según el contenido
            contenedorDatos.style.height = `${contenedorDatos.scrollHeight}px`;
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    cargarDatos();
})();
