// ==UserScript==
// @name         PREDIT3 Optimized
// @namespace    ProjectResources Cyborg
// @version      3.5
// @description
// @author
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const JSON_URL = 'https://script.google.com/macros/s/AKfycbzKRzrnEtgTaGmSDN0daIjtquhBWL5rwn_ZQR8FRYbn5fHtODKSQSTKoi1bXWmrlR0vSg/exec';
    const CACHE_KEY = 'projectDataCache', IMAGE_CACHE_KEY = 'imageCache';
    const COLUMN_WIDTHS = ['10%', '10%', '10%', '50%', '20%'];
    const HEADERS = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];
    const NO_PREVIEW_IMAGE = "https://dinfcs.github.io/Deckardaov/DeckardScripts/DatabasePR/imagen.png";
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyB3xq3Lz8OZtRMg0qxtXBD8cvjqlDx97eXWiqPu5zgJ1cxWJ04GsajAZ8ctK-zHLxHLQ/exec';

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
        let errorBar = document.createElement('div');
        errorBar.style.cssText = 'background-color: #caccca; color: #000; padding: 1px; font-size: 18px; font-weight: bold;';
        errorBar.textContent = message;
        document.body.appendChild(errorBar);
    }

    function createTable(data) {
        let table = document.createElement('table'), tbody = table.createTBody();
        table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #ddd;';

        let thead = table.createTHead(), headerRow = thead.insertRow();
        HEADERS.forEach((header, i) => {
            let cell = headerRow.insertCell();
            cell.style.cssText = `border: 1px solid #ddd; padding: 16px 12px; width: ${COLUMN_WIDTHS[i]}; font-size: 16px; font-weight: bold; background-color: #f8f9fa;`;
            cell.textContent = header;
        });

        let row = tbody.insertRow();
        HEADERS.forEach((header, i) => {
            let cell = row.insertCell();
            cell.style.cssText = `border: 1px solid #ddd; padding: 10px 12px; width: ${COLUMN_WIDTHS[i]}; vertical-align: top;`;

            if (header === 'Public Records & GIS' || header === 'License List') {
                appendLinks(cell, data[header]);
            } else if (header === 'Important Info') {
                cell.innerHTML = data[header]?.replace(/\n/g, '<br>') || '';
            } else if (header === 'Media') {
                appendMedia(cell, data[header]);
            } else {
                cell.textContent = data[header] || '';
            }
        });

        document.body.appendChild(table);
    }

    // ✅ Función para agregar los enlaces correctamente en Public Records & GIS y License List
    function appendLinks(cell, items) {
        if (!items || items.length === 0) {
            cell.textContent = "No data available";
            return;
        }

        items.forEach(({ type, url }) => {
            let linkContainer = document.createElement('div');
            linkContainer.style.marginBottom = '5px';

            let link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.textContent = type;
            link.style.cssText = 'color: #007bff; text-decoration: none; font-weight: bold;';

            if (url === 'N/A') {
                link.textContent = 'N/A';
                link.style.color = '#888';
                link.href = '#';
                link.onclick = (e) => e.preventDefault();
            }

            linkContainer.appendChild(link);
            cell.appendChild(linkContainer);
        });
    }

    function appendMedia(cell, media) {
        media.forEach(({ url, type }) => {
            if (url === 'N/A') return;
            let container = document.createElement('div');
            container.style.marginBottom = '10px';

            let img = document.createElement('img');
            img.style.cssText = 'max-width: 100px; max-height: 100px; cursor: pointer; border-radius: 4px; display: block; margin: 0 auto;';
            img.src = NO_PREVIEW_IMAGE;
            img.onclick = () => openImageModal(img.src); // Abre modal en lugar de enlace

            let text = document.createElement('div');
            text.textContent = type;
            text.style.cssText = 'text-align: center; font-size: 12px; color: #007bff; margin-top: 4px;';

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
            } else {
                img.onclick = () => window.open(url, '_blank'); // Para enlaces no Drive, abre en una nueva pestaña
            }

            container.append(img, text);
            cell.appendChild(container);
        });
    }

    // Función para abrir el modal con la imagen en base64
    function openImageModal(imgSrc) {
        let modal = document.createElement('div');
        modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center;
        z-index: 1000;
    `;

        let img = document.createElement('img');
        img.src = imgSrc;
        img.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 8px;';

        let closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
        position: absolute; top: 20px; right: 30px; font-size: 30px; color: white;
        cursor: pointer; font-weight: bold;
    `;
        closeBtn.onclick = () => document.body.removeChild(modal);

        modal.append(img, closeBtn);
        document.body.appendChild(modal);
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
    // Verifica si el iframe ya existe para evitar duplicados
    if (document.querySelector('#parcel-iframe')) return;

    // Busca el enlace "All parcels in the region"
    const parcelLink = document.querySelector('a[href*="/parcel/"]');
    if (!parcelLink) return; // Si no se encuentra el enlace, no hacer nada

    // Obtiene la URL completa
    const parcelUrl = 'https://cyborg.deckard.com' + parcelLink.getAttribute('href');

    // Crea el iframe
    const iframe = document.createElement('iframe');
    iframe.src = parcelUrl;
    iframe.id = 'parcel-iframe'; // Asigna un ID único al iframe
    iframe.style.cssText = `
        width: 100%;
        height: 600px;
        border: 1px solid #ddd;
        margin-top: 20px;
        display: block; /* Asegura que ocupe el ancho completo */
    `;

    // Inserta el iframe al final del body
    document.body.appendChild(iframe);
    console.log('Iframe insertado correctamente al final de la página.');
}

// Espera a que la página esté completamente cargada y luego inserta el iframe
window.addEventListener('load', createIframeWithTabs);

    waitForElement('#btn_open_vetting_dlg', fetchData);

})();
