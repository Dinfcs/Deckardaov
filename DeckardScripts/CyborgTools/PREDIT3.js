// ==UserScript==
// @name         PREDIT3
// @namespace    ProjectResources Cyborg
// @version      3.1
// @description  Se optimiza lectura de base de datos, se guarda en caché y solo se suplanta si hay diferencia con la de la base de datos. Se borra barra de nombre cuando se consiguen datos y aparece cuando no se consiguen datos. / se ejecuta el script al detectar el boton edit para sincronizar con la pagina / Se agrega función de copiar nombre del proyecto al portapapeles y mostrar notificación.
// @author
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const jsonURL = 'https://script.google.com/macros/s/AKfycbzKRzrnEtgTaGmSDN0daIjtquhBWL5rwn_ZQR8FRYbn5fHtODKSQSTKoi1bXWmrlR0vSg/exec';
    const cacheKey = 'projectDataCache';

    function waitForButton() {
        const observer = new MutationObserver((mutations, obs) => {
            const button = document.querySelector('#btn_open_vetting_dlg');
            if (button) {
                obs.disconnect(); // Deja de observar cambios en el DOM
                ejecutarScript(); // Llama a la función principal
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function obtenerNombreProyectoDesdeURL() {
        const url = window.location.href;
        const patrones = [
            {
                regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/,
                formato: (m) => `AUS - ${m[2].replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) === 'Bass Coast' ? m[2].replace(/_/g, ' ') : 'City of ' + m[2].replace(/_/g, ' ')}`
            },
            {
                regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/,
                formato: (m) => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${m[4].replace(/_/g, ' ')}`
            },
            {
                regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/,
                formato: (m) => `${m[1].toUpperCase()} - ${m[2].replace(/_/g, ' ')} County`
            },
            {
                regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//,
                formato: (m) => `${m[1].toUpperCase()} - ${m[3].replace(/_/g, ' ')}`
            }
        ];

        for (const { regex, formato } of patrones) {
            const match = url.match(regex);
            if (match) return formato(match);
        }
        return null;
    }

    function ejecutarScript() {
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

        const contenedorDatos = document.createElement('div');
        contenedorDatos.style.padding = '0px';
        contenedorDatos.style.overflowX = 'auto';
        contenedor.appendChild(contenedorDatos);

        async function cargarDatos() {
            try {
                const cacheData = localStorage.getItem(cacheKey);
                if (cacheData) {
                    mostrarDatos(JSON.parse(cacheData));
                }

                const response = await fetch(jsonURL, { cache: 'no-store' });
                if (!response.ok) throw new Error(`Error al leer la base de datos: ${response.statusText}`);

                const newData = await response.json();
                if (JSON.stringify(newData) !== JSON.stringify(JSON.parse(cacheData))) {
                    localStorage.setItem(cacheKey, JSON.stringify(newData));
                    mostrarDatos(newData);
                }
            } catch (error) {
                console.error('Error al cargar los datos:', error);
            }
        }

        function mostrarDatos(data) {
            const proyectoFiltrado = data.tabla.find(proyecto => proyecto.Project.toLowerCase() === nombreProyecto.toLowerCase());
            if (!proyectoFiltrado) {
                const barraTitulo = document.createElement('div');
                barraTitulo.style.backgroundColor = '#caccca';
                barraTitulo.style.color = '#000';
                barraTitulo.style.padding = '1px';
                barraTitulo.style.fontSize = '16px';
                barraTitulo.style.fontWeight = 'bold';
                barraTitulo.textContent = `No data found for: ${nombreProyecto}`;
                contenedor.appendChild(barraTitulo);
                return;
            }

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.marginTop = '0px';
            table.style.fontFamily = 'Arial, sans-serif';
            table.style.fontSize = '14px';
            table.style.color = '#333';

            const headers = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];
            const headerWidths = ['10%', '10%', '10%', '60%', '10%'];

            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            headers.forEach((header, index) => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.width = headerWidths[index];
                th.style.backgroundColor = '#D3D3D3';
                th.style.color = '#333';
                th.style.padding = '12px';
                th.style.textAlign = 'left';
                th.style.borderBottom = '2px solid #DDD';
                th.style.borderRight = '1px solid #DDD';
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
                cell.style.borderRight = '1px solid #EEE';
                cell.style.verticalAlign = 'top';
                cell.style.color = '#555';
                cell.style.fontSize = '14px';

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
                    if (header === 'Important Info') {
                        cell.innerHTML = proyectoFiltrado[header].replace(/\n/g, '<br>') || '';
                    } else {
                        cell.textContent = proyectoFiltrado[header] || '';
                    }
                }

// Añadir evento para copiar al portapapeles
if (header === 'Project') {
    cell.style.cursor = 'pointer';
    cell.addEventListener('click', () => {
        navigator.clipboard.writeText(cell.textContent)
            .then(() => {
                crearNotificacion(`Copied to clipboard: ${cell.textContent}`);
            })
            .catch(err => {
                console.error('Error al copiar al portapapeles:', err);
            });
    });
}
});

// Función para crear la notificación
function crearNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.position = 'fixed';
    notificacion.style.top = '77%';
    notificacion.style.left = '8%';
    notificacion.style.transform = 'translate(-50%, -50%)';
    notificacion.style.backgroundColor = '#333';
    notificacion.style.color = '#fff';
    notificacion.style.padding = '16px';
    notificacion.style.borderRadius = '8px';
    notificacion.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    notificacion.style.fontFamily = 'Arial, sans-serif';
    notificacion.style.zIndex = '1000';
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transition = 'opacity 0.5s ease';
        setTimeout(() => notificacion.remove(), 500);
    }, 2000);
}

// Resto del script
contenedorDatos.innerHTML = '';
contenedorDatos.appendChild(table);
}

cargarDatos();
}

waitForButton();
})();

