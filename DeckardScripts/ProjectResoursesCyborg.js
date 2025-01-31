// ==UserScript==
// @name         PREDIT con Estilos Modernos
// @namespace    ProjectResources Cyborg
// @version      2.4
// @description  Mostrar el nombre del proyecto detectado en la URL y una tabla de datos mejorada en la parte inferior de la página, con estilos elegantes y modernos de Bootstrap.
// @author
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Incluir Bootstrap CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
    document.head.appendChild(link);

    const jsonURL = 'https://script.google.com/macros/s/AKfycbzKRzrnEtgTaGmSDN0daIjtquhBWL5rwn_ZQR8FRYbn5fHtODKSQSTKoi1bXWmrlR0vSg/exec';

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

    const nombreProyecto = obtenerNombreProyectoDesdeURL();
    if (!nombreProyecto) {
        console.error('No se pudo detectar el nombre del proyecto desde la URL.');
        return;
    }

    const contenedor = document.createElement('div');
    contenedor.className = 'container-fluid p-3';
    contenedor.style.marginTop = '0';
    document.body.appendChild(contenedor);

    const contenedorDatos = document.createElement('div');
    contenedorDatos.className = 'table-responsive';
    contenedorDatos.style.marginTop = '0';
    contenedor.appendChild(contenedorDatos);

    async function cargarDatos() {
        try {
            const response = await fetch(jsonURL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Error al leer la base de datos: ${response.statusText}`);

            const data = await response.json();
            const proyectoFiltrado = data.tabla.find(proyecto =>
                proyecto.Project.toLowerCase() === nombreProyecto.toLowerCase()
            );

            if (!proyectoFiltrado) {
                contenedorDatos.textContent = 'No data found for the detected project.';
                return;
            }

            const table = document.createElement('table');
            table.className = 'table table-hover table-bordered w-100';
            table.style.marginTop = '0';

            const headers = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];
            const headerWidths = ['10%', '10%', '10%', '60%', '10%'];

            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            headers.forEach((header, index) => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.width = headerWidths[index];
                th.className = 'bg-secondary text-white';
                headerRow.appendChild(th);
            });

            const tbody = table.createTBody();
            const row = tbody.insertRow();
            headers.forEach(header => {
                const cell = row.insertCell();
                cell.style.verticalAlign = 'top';

                if (header === 'Important Info' && typeof proyectoFiltrado[header] === 'string') {
                    const infoParagraph = document.createElement('p');
                    infoParagraph.style.whiteSpace = 'pre-wrap';
                    infoParagraph.textContent = proyectoFiltrado[header];
                    cell.appendChild(infoParagraph);
                } else if (Array.isArray(proyectoFiltrado[header])) {
                    proyectoFiltrado[header].forEach(link => {
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.textContent = link.type;
                        a.target = '_blank';
                        a.className = 'd-block mb-1 text-info font-weight-bold';
                        cell.appendChild(a);
                    });
                } else {
                    cell.textContent = proyectoFiltrado[header] || '';
                }
            });

            contenedorDatos.appendChild(table);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
        }
    }

    cargarDatos();
})();
