// ==UserScript==
// @name         ProjectResourses Foating
// @namespace    http://tampermonkey.net/
// @version      1.14
// @description  Mostrar el nombre del proyecto detectado en la URL y la tabla completa de datos en una ventana flotante.
// @author       Tu Nombre
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const jsonURL = 'https://dinfcs.github.io/Deckardaov/data.json';

    function obtenerNombreProyectoDesdeURL() {
        const url = window.location.href;

        const regexCondado = /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/;
        const matchCondado = url.match(regexCondado);
        if (matchCondado) {
            const estado = matchCondado[1].toUpperCase();
            const nombreCondado = matchCondado[2].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
            return `${estado} - ${nombreCondado} County`;
        }

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
        console.error('No se pudo detectar el nombre del proyecto desde la URL.');
        return;
    }

    const ventana = document.createElement('div');
    ventana.style.position = 'fixed';
    ventana.style.bottom = '48px';
    ventana.style.left = '0px';
    ventana.style.width = '600px';
    ventana.style.height = '40px';
    ventana.style.backgroundColor = '#fff';
    ventana.style.border = '1px solid #ccc';
    ventana.style.borderRadius = '10px';
    ventana.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    ventana.style.overflow = 'hidden';
    ventana.style.zIndex = '10000';
    ventana.style.transition = 'height 0.3s ease';
    document.body.appendChild(ventana);

    const barraTitulo = document.createElement('div');
    barraTitulo.style.backgroundColor = '#4CAF50';
    barraTitulo.style.color = '#fff';
    barraTitulo.style.padding = '10px';
    barraTitulo.style.cursor = 'pointer';
    barraTitulo.style.display = 'flex';
    barraTitulo.style.justifyContent = 'space-between';
    barraTitulo.style.alignItems = 'center';
    barraTitulo.textContent = `Proyecto Detectado: ${nombreProyecto}`;
    ventana.appendChild(barraTitulo);

    let minimizado = true;
    barraTitulo.addEventListener('click', () => {
        minimizado = !minimizado;
        if (minimizado) {
            ventana.style.height = '40px';
        } else {
            ventana.style.height = '600px';
        }
    });

    const contenedorDatos = document.createElement('div');
    contenedorDatos.style.padding = '10px';
    contenedorDatos.style.overflowY = 'auto';
    contenedorDatos.style.height = 'calc(100% - 40px)';
    ventana.appendChild(contenedorDatos);

    async function cargarDatos() {
        try {
            const response = await fetch(jsonURL);
            if (!response.ok) {
                throw new Error(`Error al cargar el archivo JSON: ${response.statusText}`);
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
            table.style.marginTop = '10px';
            table.style.backgroundColor = '#f9f9f9';
            table.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';

            const headers = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];

            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.backgroundColor = '#4CAF50';
                th.style.color = '#fff';
                th.style.padding = '10px';
                th.style.textAlign = 'left';
                headerRow.appendChild(th);
            });

            const tbody = table.createTBody();
            const row = tbody.insertRow();
            headers.forEach(header => {
                const cell = row.insertCell();
                cell.style.padding = '10px';
                cell.style.borderBottom = '1px solid #ddd';
                if (Array.isArray(proyectoFiltrado[header])) {
                    proyectoFiltrado[header].forEach(link => {
                        if (link.url && link.type) {
                            const a = document.createElement('a');
                            a.href = link.url;
                            a.textContent = link.type;
                            a.target = '_blank';
                            cell.appendChild(a);
                            cell.appendChild(document.createElement('br'));
                        }
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
