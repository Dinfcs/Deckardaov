// ==UserScript==
// @name         PREDIT Resumido
// @namespace    ProjectResources Cyborg
// @version      2.3
// @description  Mostrar el nombre del proyecto detectado en la URL y una tabla de datos mejorada en la parte inferior de la página.
// @author
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

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
    barraTitulo.textContent = `Project Detected: ${nombreProyecto}`;
    contenedor.appendChild(barraTitulo);

    const contenedorDatos = document.createElement('div');
    contenedorDatos.style.padding = '0px';
    contenedorDatos.style.overflowX = 'auto';
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
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.textContent = link.type;
                        a.target = '_blank';
                        a.style.display = 'block';
                        a.style.marginBottom = '6px';
                        a.style.color = '#1E90FF';
                        a.style.textDecoration = 'none';
                        a.style.fontWeight = 'bold';
                        a.onmouseover = () => a.style.color = '#3742fa';
                        a.onmouseout = () => a.style.color = '#1E90FF';
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
