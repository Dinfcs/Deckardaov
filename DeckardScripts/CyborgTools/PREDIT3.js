// ==UserScript==
// @name         PREDIT3 Optimized
// @namespace    ProjectResources Cyborg
// @version      3.7
// @description  Visualización mejorada de recursos de proyectos
// @author
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const JSON_URL = 'https://script.google.com/macros/s/AKfycbzKRzrnEtgTaGmSDN0daIjtquhBWL5rwn_ZQR8FRYbn5fHtODKSQSTKoi1bXWmrlR0vSg/exec';
    const CACHE_KEY = 'projectDataCache', IMAGE_CACHE_KEY = 'imageCache';
    const HEADERS = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];
    const NO_PREVIEW_IMAGE = "https://dinfcs.github.io/Deckardaov/DeckardScripts/DatabasePR/imagen.png";
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyB3xq3Lz8OZtRMg0qxtXBD8cvjqlDx97eXWiqPu5zgJ1cxWJ04GsajAZ8ctK-zHLxHLQ/exec';

    // Agregar fuentes y estilos globales
    function addGlobalStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            .pr-container * {
                box-sizing: border-box;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
            }

            .pr-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                border-radius: 6px;
                overflow: hidden;
                background: white;
                margin-bottom: 0px;
                border: 1px solid #eaeaea;
            }

            .pr-table thead {
                background: #f9fafb;
            }

            .pr-table th {
                color: #111827;
                font-weight: 600;
                font-size: 14px;
                padding: 12px 18px;
                text-align: left;
                border-bottom: 1px solid #eaeaea;
                position: relative;
            }

            .pr-table td {
                padding: 16px 18px;
                border-bottom: 1px solid #eaeaea;
                color: #374151;
                font-size: 14px;
                line-height: 1.5;
                vertical-align: top;
            }

            .pr-table tr:last-child td {
                border-bottom: none;
            }

            .pr-table th:not(:last-child):after {
                content: '';
                position: absolute;
                right: 0;
                top: 25%;
                height: 50%;
                width: 1px;
                background: #eaeaea;
            }

            .pr-table td:not(:last-child) {
                border-right: 1px solid #eaeaea;
            }

            .pr-link-list {
                list-style: none;
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .pr-link {
                display: block;
                color: #2563eb;
                font-weight: 500;
                text-decoration: none;
                transition: all 0.15s ease;
                padding: 6px 10px;
                border-radius: 4px;
                background: #f0f5ff;
            }

            .pr-link:hover {
                background: #e0eaff;
                transform: translateY(-1px);
            }

            .pr-media-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(90px, 200px));
                gap: 15px;
            }

            .pr-media-item {
                display: flex;
                flex-direction: column;
                gap: 6px;
                align-items: center;
            }

            .pr-image-container {
                width: auto;
                aspect-ratio: 1;
                overflow: hidden;
                border-radius: 6px;
                background: #f9fafb;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #eaeaea;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }

            .pr-image-container:hover {
                transform: scale(1.03);
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }

            .pr-media-label {
                font-size: 12px;
                color: #4b5563;
                text-align: center;
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .pr-image {
                max-width: 85%;
                max-height: 85%;
                object-fit: contain;
            }

            .pr-iframe-container {
                border: 1px solid #eaeaea;
                border-radius: 6px;
                overflow: hidden;
                margin: 2px 0;
            }

            .pr-iframe-header {
                padding: 12px 18px;
                background: #f9fafb;
                border-bottom: 1px solid #eaeaea;
                font-weight: 600;
                font-size: 14px;
                color: #111827;
                display: flex;
                align-items: center;
            }

            .pr-iframe {
                width: 100%;
                height: 580px;
                border: none;
                display: block;
            }

            .pr-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .pr-modal-content {
                max-width: 90%;
                max-height: 90%;
                position: relative;
                opacity: 0;
                transform: scale(0.95);
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
            }

            .pr-modal-image {
                max-width: 100%;
                max-height: 90vh;
                display: block;
                border-radius: 4px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            }

            .pr-modal-close {
                position: absolute;
                top: -40px;
                right: 0;
                width: 34px;
                height: 34px;
                border-radius: 50%;
                background: rgba(255,255,255,0.9);
                color: #111827;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 20px;
                font-weight: 600;
                transition: background 0.2s ease;
            }

            .pr-modal-close:hover {
                background: white;
            }

            .pr-error-message {
                margin: 0px;
                padding: 12px 16px;
                background-color: #fee2e2;
                color: #dc2626;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                align-items: center;
                border-left: 4px solid #dc2626;
            }

            @media (max-width: 768px) {
                .pr-table {
                    display: block;
                    overflow-x: auto;
                }

                .pr-table th,
                .pr-table td {
                    padding: 12px 14px;
                    font-size: 13px;
                }

        .pr-media-grid {
                    grid-template-columns: repeat(auto-fit, minmax(70px, 10));
                }
            }
        `;
        document.head.appendChild(styleEl);
    }

    function waitForElement(selector, callback) {
        new MutationObserver((_, obs) => {
            let element = document.querySelector(selector);
            if (element) { obs.disconnect(); callback(element); }
        }).observe(document.body, { childList: true, subtree: true });
    }

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function getProjectNameFromUrl() {
        const url = window.location.href;
        const patterns = [
            { regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/, format: m => `AUS - ${m[2].replace(/_/g, ' ') === 'Bass Coast' ? m[2].replace(/_/g, ' ') : 'City of ' + capitalizeWords(m[2].replace(/_/g, ' '))}` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${capitalizeWords(m[4].replace(/_/g, ' '))}` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[2].replace(/_/g, ' '))} County` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[3].replace(/_/g, ' '))}` }
        ];
        for (const { regex, format } of patterns) {
            const match = url.match(regex);
            if (match) return format(match);
        }
        return null;
    }

    async function fetchData() {
        try {
            addGlobalStyles();

            let cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) displayData(JSON.parse(cachedData));

            const response = await fetch(JSON_URL, { cache: 'no-store' });
            if (!response.ok) throw new Error(response.statusText);

            const newData = await response.json();
            if (JSON.stringify(newData) !== cachedData) {
                localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
                displayData(newData);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    function displayData(data) {
        const projectName = getProjectNameFromUrl();
        if (!projectName) return console.error('Project name not found in URL.');

        const projectData = data.tabla.find(p => p.Project.toLowerCase() === projectName.toLowerCase());
        if (!projectData) return showError(`No data found for: ${projectName}`);

        createTable(projectData);
        createIframeWithTabs();
    }

    function showError(message) {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'pr-error-message';
        errorMsg.textContent = message;
        document.body.appendChild(errorMsg);
    }

    function createTable(data) {
        // Contenedor principal
        const mainContainer = document.createElement('div');
        mainContainer.className = 'pr-container';
        mainContainer.style.margin = '0px';

        // Título de la tabla
        const tableTitle = document.createElement('div');
        tableTitle.style.cssText = `
        font-size: 18px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 5px;
    `;

        // Crear tabla
        const table = document.createElement('table');
        table.className = 'pr-table';
        table.id = 'projectResources-table';

        // Crear encabezado
        const thead = table.createTHead();
        const headerRow = thead.insertRow();

        HEADERS.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.textAlign = 'center'; // Centrando el texto del encabezado
            headerRow.appendChild(th);
        });

        // Crear cuerpo de la tabla
        const tbody = table.createTBody();
        const row = tbody.insertRow();

        HEADERS.forEach(header => {
            const cell = row.insertCell();

            if (header === 'Public Records & GIS' || header === 'License List') {
                appendLinks(cell, data[header]);
            } else if (header === 'Important Info') {
                cell.innerHTML = data[header]?.replace(/\n/g, '<br>') || '';
            } else if (header === 'Media') {
                appendMedia(cell, data[header]);
            } else {
                cell.textContent = data[header] || '';
                cell.style.fontWeight = '600';
            }
        });

        // Agregar todo al contenedor principal
        mainContainer.appendChild(tableTitle);
        mainContainer.appendChild(table);
        document.body.appendChild(mainContainer);
    }


    function appendLinks(cell, items) {
        if (!items || items.length === 0) {
            cell.innerHTML = `<span style="color: #9ca3af; font-style: italic;">No data available</span>`;
            return;
        }

        const linkList = document.createElement('ul');
        linkList.className = 'pr-link-list';

        items.forEach(({ type, url }) => {
            const listItem = document.createElement('li');

            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.className = 'pr-link';
            link.textContent = type;

            if (url === 'N/A') {
                link.textContent = 'N/A';
                link.style.color = '#9ca3af';
                link.style.fontStyle = 'italic';
                link.href = '#';
                link.onclick = (e) => e.preventDefault();
                link.style.background = '#f3f4f6';
            }

            listItem.appendChild(link);
            linkList.appendChild(listItem);
        });

        cell.appendChild(linkList);
    }

    function appendMedia(cell, media) {
        if (!media || !media.length) {
            cell.innerHTML = `<span style="color: #9ca3af; font-style: italic;">No media available</span>`;
            return;
        }

        const mediaGrid = document.createElement('div');
        mediaGrid.className = 'pr-media-grid';

        media.forEach(({ url, type }) => {
            if (url === 'N/A') return;

            const mediaItem = document.createElement('div');
            mediaItem.className = 'pr-media-item';

            const imgContainer = document.createElement('div');
            imgContainer.className = 'pr-image-container';

            const img = document.createElement('img');
            img.className = 'pr-image';
            img.src = NO_PREVIEW_IMAGE;
            img.alt = type;

            const label = document.createElement('div');
            label.className = 'pr-media-label';
            label.textContent = type;

            if (url.includes('drive.google.com')) {
                let cachedImage = getCachedImage(url);
                if (cachedImage) {
                    img.src = cachedImage;
                } else {
                    fetchGoogleDriveImage(url).then(base64 => {
                        if (base64) {
                            img.src = base64;
                            cacheImage(url, base64);
                        }
                    });
                }
                imgContainer.onclick = () => openImageModal(img.src);
            } else {
                imgContainer.onclick = () => window.open(url, '_blank');
            }

            imgContainer.appendChild(img);
            mediaItem.appendChild(imgContainer);
            mediaItem.appendChild(label);
            mediaGrid.appendChild(mediaItem);
        });

        cell.appendChild(mediaGrid);
    }

    function openImageModal(imgSrc) {
        const modal = document.createElement('div');
        modal.className = 'pr-modal';

        const modalContent = document.createElement('div');
        modalContent.className = 'pr-modal-content';

        const img = document.createElement('img');
        img.className = 'pr-modal-image';
        img.src = imgSrc;

        const closeBtn = document.createElement('div');
        closeBtn.className = 'pr-modal-close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = () => {
            modal.style.opacity = '0';
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.95)';
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                modalContent.style.opacity = '0';
                modalContent.style.transform = 'scale(0.95)';
                setTimeout(() => document.body.removeChild(modal), 300);
            }
        };

        modalContent.appendChild(img);
        modalContent.appendChild(closeBtn);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Activar animación después de agregar al DOM
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
    }

    async function fetchGoogleDriveImage(imageUrl) {
        try {
            const response = await fetch(`${SCRIPT_URL}?url=${encodeURIComponent(imageUrl)}`);
            const data = await response.json();
            return data?.success ? data.base64 : null;
        } catch (error) {
            console.error('Error fetching Google Drive image:', error);
            return null;
        }
    }

    function getCachedImage(imageUrl) {
        return JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}')[imageUrl] || null;
    }

    function cacheImage(imageUrl, base64) {
        let cache = JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
        cache[imageUrl] = base64;
        localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
    }

    function createIframeWithTabs() {
        if (document.querySelector('#parcel-iframe')) return;

        const parcelLink = document.querySelector('a[href*="/parcel/"]');
        if (!parcelLink) return;

        const parcelUrl = 'https://cyborg.deckard.com' + parcelLink.getAttribute('href');

        // Obtener la URL base para el segundo iframe
        const currentUrl = window.location.href;
        const baseUrl = currentUrl.split('/STR')[0]; // Eliminar todo después de /STR
        const mappedUrl = `${baseUrl}?tab=all&subset=mapped`; // Construir la nueva URL

        // Contenedor principal
        const container = document.createElement('div');
        container.className = 'pr-container';
        container.style.margin = '0px';

        // Crear pestañas
        const tabContainer = document.createElement('div');
        tabContainer.style.display = 'flex';
        tabContainer.style.width = '100%';

        // Estilos para las pestañas
        const tabStyles = `
        .pr-tab {
            display: inline-block;
            background-color: #f9f9f9;
            border: 1px solid #d6d6d6;
            border-bottom: none;
            padding: 10px 15px;
            transition: background-color, color 200ms;
            width: 50%;
            text-align: center;
            box-sizing: border-box;
            cursor: pointer;
        }
        .pr-tab:hover {
            background-color: #e9e9e9;
        }
        .pr-tab--selected {
            border-top: 2px solid #1975FA;
            color: black;
            background-color: white;
        }
        .pr-tab--selected:hover {
            background-color: white;
        }
        @media screen and (min-width: 800px) {
            .pr-tab {
                border-right: none;
            }
            .pr-tab--selected {
                border-bottom: none;
            }
        }
    `;

        // Agregar estilos al documento
        const styleElement = document.createElement('style');
        styleElement.textContent = tabStyles;
        document.head.appendChild(styleElement);

        // Pestaña All Parcels
        const allParcelsTab = document.createElement('div');
        allParcelsTab.className = 'pr-tab pr-tab--selected';
        allParcelsTab.innerHTML = '<span>All Parcels</span>';

        // Pestaña All Listings Mapped
        const allListingsMappedTab = document.createElement('div');
        allListingsMappedTab.className = 'pr-tab';
        allListingsMappedTab.innerHTML = '<span>All Listings Mapped</span>';

        // Crear contenedor de iframes
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'pr-iframe-container';

        // Iframe para All Parcels
        const allParcelsIframe = document.createElement('iframe');
        allParcelsIframe.className = 'pr-iframe';
        allParcelsIframe.id = 'parcel-iframe';
        allParcelsIframe.src = parcelUrl;

        // Iframe para All Listings Mapped
        const allListingsMappedIframe = document.createElement('iframe');
        allListingsMappedIframe.className = 'pr-iframe';
        allListingsMappedIframe.id = 'mapped-iframe';
        allListingsMappedIframe.src = mappedUrl;
        allListingsMappedIframe.style.display = 'none'; // Ocultar inicialmente
        allListingsMappedIframe.style.height = '2040px'; // Ajusta este valor según tus necesidades

        // Función para cambiar entre pestañas
        const switchTab = (tab) => {
            if (tab === 'allParcels') {
                allParcelsIframe.style.display = 'block';
                allListingsMappedIframe.style.display = 'none';
                allParcelsTab.classList.add('pr-tab--selected');
                allListingsMappedTab.classList.remove('pr-tab--selected');
            } else {
                allParcelsIframe.style.display = 'none';
                allListingsMappedIframe.style.display = 'block';
                allListingsMappedTab.classList.add('pr-tab--selected');
                allParcelsTab.classList.remove('pr-tab--selected');
            }
        };

        // Event listeners para las pestañas
        allParcelsTab.addEventListener('click', () => switchTab('allParcels'));
        allListingsMappedTab.addEventListener('click', () => switchTab('allListingsMapped'));

        // Activar la pestaña inicial
        switchTab('allParcels');

        // Agregar elementos al DOM
        tabContainer.appendChild(allParcelsTab);
        tabContainer.appendChild(allListingsMappedTab);
        iframeContainer.appendChild(allParcelsIframe);
        iframeContainer.appendChild(allListingsMappedIframe);
        container.appendChild(tabContainer);
        container.appendChild(iframeContainer);
        document.body.appendChild(container);
    }

    waitForElement('#btn_open_vetting_dlg', fetchData);
})();
