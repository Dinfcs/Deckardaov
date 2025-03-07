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

    const JSON_URL = 'https://script.google.com/macros/s/AKfycbzKRzrnEtgTaGmSDN0daIjtquhBWL5rwn_ZQR8FRYbn5fHtODKSQSTKoi1bXWmrlR0vSg/exec';
    const CACHE_KEY = 'projectDataCache';
    const COLUMN_WIDTHS = ['10%', '10%', '10%', '50%', '20%'];
    const HEADERS = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];
    const PROJECT_NAME_PATTERNS = [
        { regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/, format: m => `AUS - ${m[2].replace(/_/g, ' ') === 'Bass Coast' ? m[2].replace(/_/g, ' ') : 'City of ' + capitalizeWords(m[2].replace(/_/g, ' '))}` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${capitalizeWords(m[4].replace(/_/g, ' '))}` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[2].replace(/_/g, ' '))} County` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[3].replace(/_/g, ' '))}` }
    ];
    const NO_PREVIEW_IMAGE = "https://dinfcs.github.io/Deckardaov/DeckardScripts/DatabasePR/imagen.png";

    function waitForElement(selector, callback) {
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                callback(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function getProjectNameFromUrl() {
        const url = window.location.href;
        for (const { regex, format } of PROJECT_NAME_PATTERNS) {
            const match = url.match(regex);
            if (match) return format(match);
        }
        return null;
    }

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function createNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `position: fixed; top: 77%; left: 8%; background-color: #333; color: #fff; padding: 16px; border-radius: 8px; font-size: 16px;`;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 2000);
    }

    async function fetchData() {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                displayData(JSON.parse(cachedData));
            }

            const response = await fetch(JSON_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);

            const newData = await response.json();
            if (JSON.stringify(newData) !== cachedData) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
                displayData(newData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    function applyStyles(element, styles) {
        for (const property in styles) {
            element.style[property] = styles[property];
        }
    }

    function loadImage(imageUrl, imgElement, openImageCallback) {
        imgElement.src = imageUrl;

        imgElement.onload = () => {
            imgElement.style.cursor = 'pointer';
            imgElement.addEventListener('click', openImageCallback);
        };

        imgElement.onerror = () => {
            console.warn(`Failed to load image: ${imageUrl}. Showing default image.`);
            imgElement.src = NO_PREVIEW_IMAGE;
            imgElement.alt = "No Preview Available";
            imgElement.style.cursor = 'default';
        };
    }

    function displayData(data) {
        const projectName = getProjectNameFromUrl();
        if (!projectName) {
            console.error('Project name not found in URL.');
            return;
        }

        const projectData = data.tabla.find(project => project.Project.toLowerCase() === projectName.toLowerCase());

        if (!projectData) {
            const errorBar = document.createElement('div');
            errorBar.style.cssText = 'background-color: #caccca; color: #000; padding: 1px; font-size: 18px; font-weight: bold;';
            errorBar.textContent = `No data found for: ${projectName}`;
            document.body.appendChild(errorBar);
            return;
        }

        if (projectData.Project.includes(' - ')) {
            projectData.Project = projectData.Project.split(' - ').map((part, index) => index === 0 ? part : capitalizeWords(part)).join(' - ');
        }

        const table = document.createElement('table');
        table.classList.add('project-data-table');

        const tableStyles = {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #ddd',
        };
        applyStyles(table, tableStyles);

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        HEADERS.forEach((header, index) => {
            const cell = headerRow.insertCell();
            const cellStyles = {
                border: '1px solid #ddd',
                padding: '16px 12px', // Aumentar el padding para más espacio
                width: COLUMN_WIDTHS[index],
                fontSize: '16px', // Aumentar el tamaño de la fuente
                fontWeight: 'bold', // Aplicar negrita
                color: '#495057',
                backgroundColor: '#f8f9fa', // Fondo gris claro para los encabezados
            };
            applyStyles(cell, cellStyles);
            cell.textContent = header;
        });

        const tbody = table.createTBody();
        const row = tbody.insertRow();

        HEADERS.forEach((header, index) => {
            const cell = row.insertCell();
            const cellStyles = {
                border: '1px solid #ddd',
                padding: '10px 12px',
                width: COLUMN_WIDTHS[index],
                fontSize: '14px',
                color: '#495057',
            };
            applyStyles(cell, cellStyles);

            if (Array.isArray(projectData[header])) {
                if (header === 'Media') {
                    projectData[header].forEach(item => {
                        const container = document.createElement('div');
                        container.style.marginBottom = '8px';

                        const img = document.createElement('img');
                        img.alt = item.type;
                        img.style.cssText = 'max-width: 100%; max-height: 100px; border-radius: 4px; display: block; margin: 0 auto;';
                        img.loading = "lazy";

                        const openImageInPopup = () => {
                            const popup = window.open(item.url, 'imagePopup', 'width=800,height=600,resizable=yes,scrollbars=yes');
                            if (!popup || popup.closed || typeof popup.closed == 'undefined') {
                                window.open(item.url, '_blank');
                            }
                        };

                        loadImage(item.url, img, openImageInPopup);

                        const a = document.createElement('a');
                        a.href = "javascript:void(0);";
                        a.style.display = 'block';
                        a.style.textAlign = 'center';
                        a.style.textDecoration = 'none';

                        a.addEventListener('click', (event) => {
                            event.preventDefault();
                            openImageInPopup();
                        });

                        const linkText = document.createElement('span');
                        linkText.textContent = item.type;
                        linkText.style.display = 'block';
                        linkText.style.fontSize = '12px';
                        linkText.style.color = '#007bff';
                        linkText.style.marginTop = '4px';
                        linkText.style.transition = 'color 0.2s ease-in-out';

                        a.addEventListener('mouseover', () => linkText.style.color = '#0056b3');
                        a.addEventListener('mouseout', () => linkText.style.color = '#007bff');

                        container.appendChild(a);
                        a.appendChild(img);
                        a.appendChild(linkText);
                        cell.appendChild(container);
                    });
                } else {
                    projectData[header].forEach(link => {
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.textContent = link.type;
                        a.target = '_blank';
                        const linkStyles = {
                            display: 'block',
                            fontSize: '14px',
                            color: '#23A9D8',
                            textDecoration: 'none',
                            transition: 'color 0.2s ease-in-out, text-decoration 0.2s ease-in-out',
                        };
                        applyStyles(a, linkStyles);

                        a.addEventListener('mouseover', () => a.style.textDecoration = 'underline');
                        a.addEventListener('mouseout', () => a.style.textDecoration = 'none');

                        const styleSheet = document.styleSheets[0];
                        try {
                            styleSheet.insertRule(`.project-data-table a[href="${a.href}"]:visited { color: #CAD92B !important; }`, styleSheet.cssRules.length);
                        } catch (e) {
                            console.warn("No se pudo insertar la regla para :visited.", e);
                            const visitedStyle = document.createElement('style');
                            visitedStyle.textContent = `.project-data-table a:visited { color: #CAD92B !important; }`;
                            document.head.appendChild(visitedStyle);
                        }
                        cell.appendChild(a);
                    });
                }
            } else if (header === 'Important Info') {
                cell.innerHTML = projectData[header] ? projectData[header].replace(/\n/g, '<br>') : '';
                cell.style.fontSize = '14px';
            } else {
                cell.textContent = projectData[header] || '';
            }

            if (header === 'Project') {
                cell.style.cursor = 'pointer';
                cell.addEventListener('click', () => {
                    navigator.clipboard.writeText(cell.textContent)
                        .then(() => createNotification(`Copied to clipboard: ${cell.textContent}`))
                        .catch(err => console.error('Clipboard error:', err));
                });
            }
        });

        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.backgroundColor = '#fff';
        container.appendChild(table);
        document.body.appendChild(container);

        // Crear el iframe con pestañas
        createIframeWithTabs(container);
    }

    // Crear iframe con pestañas estilo "tabs"
    function createIframeWithTabs(container) {
        const iframeContainer = document.createElement('div');
        iframeContainer.style.marginTop = '20px';

        // Crear pestañas
        const tabContainer = document.createElement('div');
        tabContainer.style.display = 'flex';
        tabContainer.style.marginBottom = '10px';

        const currentParcelTab = document.createElement('div');
        currentParcelTab.className = 'tab tab--selected';
        currentParcelTab.innerHTML = '<span>Current Parcel</span>';
        currentParcelTab.style.cursor = 'pointer';

        const widerSearchTab = document.createElement('div');
        widerSearchTab.className = 'tab';
        widerSearchTab.innerHTML = '<span>Parcel in Wider Search Range</span>';
        widerSearchTab.style.cursor = 'pointer';

        // Estilos para las pestañas
        const tabStyles = `
            .tab {
                display: inline-block;
                background-color: #f9f9f9;
                border: 1px solid #d6d6d6;
                border-bottom: none;
                padding: 20px 25px;
                transition: background-color, color 200ms;
                width: 100%;
                text-align: center;
                box-sizing: border-box;
            }
            .tab:last-of-type {
                border-right: 1px solid #d6d6d6;
                border-bottom: 1px solid #d6d6d6;
            }
            .tab:hover {
                cursor: pointer;
            }
            .tab--selected {
                border-top: 2px solid #1975FA;
                color: black;
                background-color: white;
            }
            .tab--selected:hover {
                background-color: white;
            }
            .tab--disabled {
                color: #d6d6d6;
            }

            @media screen and (min-width: 800px) {
                .tab {
                    border: 1px solid #d6d6d6;
                    border-right: none;
                    width: calc(100% / 2);
                }
                .tab--selected,
                .tab:last-of-type.tab--selected {
                    border-bottom: none;
                    border-top: 2px solid #1975FA;
                }
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = tabStyles;
        document.head.appendChild(styleElement);

        tabContainer.appendChild(currentParcelTab);
        tabContainer.appendChild(widerSearchTab);

        // Crear iframe
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';

        // Obtener el enlace del "Parcel in wider search range"
        const widerSearchLink = document.querySelector('a[href*="near_location"]');
        const widerSearchUrl = widerSearchLink ? widerSearchLink.href : '';

        // Manejar el cambio de pestañas
        currentParcelTab.addEventListener('click', () => {
            iframe.src = modifyUrl();
            currentParcelTab.classList.add('tab--selected');
            widerSearchTab.classList.remove('tab--selected');
        });

        widerSearchTab.addEventListener('click', () => {
            if (widerSearchUrl) {
                iframe.src = widerSearchUrl;
                widerSearchTab.classList.add('tab--selected');
                currentParcelTab.classList.remove('tab--selected');
            } else {
                alert('No wider search range parcel link found.');
            }
        });

        // Establecer la pestaña inicial
        iframe.src = modifyUrl();

        iframeContainer.appendChild(tabContainer);
        iframeContainer.appendChild(iframe);
        container.appendChild(iframeContainer);
    }

    // Modificar URL para el iframe
    function modifyUrl() {
        const urlParts = window.location.href.split('/');
        return `https://cyborg.deckard.com/parcel/${urlParts[4]}/${urlParts[5]}/${urlParts[6]}`;
    }

    // Iniciar la carga de datos cuando la página esté lista
    waitForElement('#btn_open_vetting_dlg', () => {
        fetchData();
    });
})();
