// ==UserScript==
// @name         Download All Parcels to CSV
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Extrae datos de todas las páginas de 'parcel' y las descarga directamente en un archivo CSV.
// @match        https://cyborg.deckard.com/parcel/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('🚀 UserScript: Download All Parcels to CSV - Iniciado!');

    // 1. Definir la URL de la página objetivo
    const TARGET_URL_PATH = '/parcel/';

    // 2. *** ¡CRÍTICO! AJUSTA ESTOS SELECTORES BASÁNDOTE EN TU INSPECCIÓN DEL DOM REAL DE LA PÁGINA! ***
    //    Usa las Herramientas de Desarrollador (F12) para ver el HTML y encontrar IDs o clases únicas.
    //    Si la paginación está dentro de un div con una ID, por ejemplo: `#pagination-container .first-page`
    //    Si la tabla principal tiene una ID, por ejemplo: `#main-data-table tbody tr`
    const SELECTORS = {
        // Selector para el contenedor de los botones de paginación.
        // EJEMPLO: '#pagination-container', '.my-custom-pager', 'div.pagination-wrapper'
        PAGINATION_CONTAINER: '.pagination-controls', // ESTE ES UN EJEMPLO. ¡AJÚSTALO!

        // Selector para el botón que lleva a la primera página.
        // EJEMPLO: '#firstPageButton', '.pager-button.first', 'a[title="Go to first page"]'
        FIRST_PAGE_BUTTON: '.first-page', // ESTE ES UN EJEMPLO. ¡AJÚSTALO!

        // Selector para el botón de "Siguiente Página".
        // EJEMPLO: '#nextPageButton', '.pager-button.next', 'a[title="Go to next page"]'
        NEXT_PAGE_BUTTON: '.next-page', // ESTE ES UN EJEMPLO. ¡AJÚSTALO!

        // Selector para el botón que muestra la última página o el número total de páginas.
        // EJEMPLO: '#lastPageButton', '.pager-button.last', 'span.total-pages'
        LAST_PAGE_BUTTON: '.last-page', // ESTE ES UN EJEMPLO. ¡AJÚSTALO!

        // Selector para las filas de datos de la tabla principal.
        // ES MUY IMPORTANTE QUE ESTE SELECTOR APUNTE SÓLO A LA TABLA DE DATOS DE PARCEL.
        // EJEMPLO: '#parcel-data-table tbody tr', 'table.listing-data tr:not(.header-row)', '#content table tr'
        MAIN_DATA_TABLE_ROWS: 'table tr' // ESTE ES UN EJEMPLO MUY GENÉRICO. ¡AJÚSTALO A UNA TABLA ESPECÍFICA!
    };

    // Encabezados de la tabla, en el orden en que deben aparecer en el CSV
    // Deben coincidir con los datos que se extraen en extractRowData
    const TABLE_HEADERS = [
        "parcel_apn", "license", "license_status", "people_on_license",
        "parcel_state", "parcel_county", "parcel_use_type", "parcel_owner_name_1",
        "parcel_owner_name_2", "parcel_site_address", "parcel_site_address_unit_number",
        "parcel_bedrooms", "owner_address", "claiming_hoe", "parcel_latitude", "parcel_longitude"
    ];

    // Crear el botón de descarga CSV
    const downloadCsvButton = document.createElement('button');
    downloadCsvButton.textContent = 'Download All Parcels (CSV)';
    downloadCsvButton.id = 'tm-download-parcel-csv-button'; // ID única para evitar conflictos

    Object.assign(downloadCsvButton.style, {
        padding: '10px 15px',
        backgroundColor: '#004B87', // Color azul oscuro
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: '2px 2px 10px rgba(0,0,0,0.3)',
        marginRight: '10px',
        fontWeight: 'bold',
        boxSizing: 'border-box'
    });

    /**
     * Inserta el botón de descarga en la página.
     */
    function insertButton() {
        console.log('--- insertButton() called ---');
        if (!window.location.pathname.startsWith(TARGET_URL_PATH)) {
            console.warn(`[Download Parcels] Script running on unexpected URL: ${window.location.pathname}. Not inserting button.`);
            return;
        }

        if (document.getElementById(downloadCsvButton.id)) {
            console.log('[Download Parcels] Button with ID', downloadCsvButton.id, 'already exists. Skipping insertion.');
            return;
        }

        const paginationContainer = document.querySelector(SELECTORS.PAGINATION_CONTAINER);
        let targetElement = document.querySelector(SELECTORS.FIRST_PAGE_BUTTON);

        console.log('[Download Parcels] Debug: Found targetElement (FIRST_PAGE_BUTTON):', targetElement);
        console.log('[Download Parcels] Debug: Found paginationContainer:', paginationContainer);

        if (targetElement) {
            targetElement.parentNode.insertBefore(downloadCsvButton, targetElement);
            console.log('[Download Parcels] Button inserted next to FIRST_PAGE_BUTTON.');
        } else if (paginationContainer) {
            paginationContainer.prepend(downloadCsvButton);
            console.log('[Download Parcels] Button inserted in PAGINATION_CONTAINER as fallback.');
        } else {
            console.warn('[Download Parcels] No ideal insertion point found (FIRST_PAGE_BUTTON or PAGINATION_CONTAINER). Trying general fallbacks.');
            const headerElement = document.querySelector('h1, h2, .page-header, .navbar, .page-title');
            if (headerElement) {
                headerElement.parentNode.insertBefore(downloadCsvButton, headerElement.nextSibling);
                console.log('[Download Parcels] Button inserted near common header element.');
            } else {
                document.body.prepend(downloadCsvButton);
                console.warn('[Download Parcels] Button appended to body as final fallback. Check page layout.');
            }
        }
        console.log('--- insertButton() finished ---');
    }

    // Usar MutationObserver para esperar que los elementos de la página estén cargados.
    const observer = new MutationObserver((mutations, obs) => {
        if (window.location.pathname.startsWith(TARGET_URL_PATH) && document.querySelector(SELECTORS.FIRST_PAGE_BUTTON)) {
            console.log('[Download Parcels] Target element (FIRST_PAGE_BUTTON) found by MutationObserver! Proceeding with button insertion.');
            insertButton();
            obs.disconnect();
            console.log('[Download Parcels] MutationObserver disconnected.');
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[Download Parcels] MutationObserver connected to document body.');

    // Asegurarse de que el botón se inserta incluso si los elementos ya están presentes al cargar la página
    if (window.location.pathname.startsWith(TARGET_URL_PATH) && document.querySelector(SELECTORS.FIRST_PAGE_BUTTON)) {
        console.log('[Download Parcels] Target element (FIRST_PAGE_BUTTON) already present on initial load. Inserting button directly.');
        insertButton();
        observer.disconnect();
    }

    /**
     * Genera un nombre de archivo CSV basado en la URL y la fecha actual.
     * @returns {string} El nombre de archivo propuesto.
     */
    function getFilenameFromUrl() {
        const urlParts = window.location.pathname.split('/').filter(part => part && part !== '_');
        if (urlParts.length >= 3 && urlParts[0] === 'parcel') {
            return `${urlParts[1]}_${urlParts[2]}_parcels_${new Date().toISOString().slice(0,10)}.csv`;
        }
        return `parcel_data_${new Date().toISOString().slice(0,10)}.csv`;
    }

    /**
     * Obtiene el número total de páginas de la paginación.
     * @returns {number} El número total de páginas, por defecto 1.
     */
    function getTotalPages() {
        const lastPageElement = document.querySelector(SELECTORS.LAST_PAGE_BUTTON);
        if (lastPageElement) {
            const pageText = lastPageElement.textContent.trim();
            const totalPages = parseInt(pageText);
            return isNaN(totalPages) || totalPages < 1 ? 1 : totalPages;
        }
        console.warn('[Download Parcels] Could not find LAST_PAGE_BUTTON. Assuming 1 page.');
        return 1;
    }

    /**
     * Muestra una barra de progreso modal al usuario.
     * @returns {object} Objeto con métodos para actualizar y remover la barra.
     */
    function showProgressBar() {
        const progressContainer = document.createElement('div');
        Object.assign(progressContainer.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '450px',
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
            zIndex: '10001',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif',
            boxSizing: 'border-box'
        });

        progressContainer.innerHTML = `
            <h3 style="margin-top: 0; color: #004B87;">Collecting Parcel Data</h3>
            <div style="background-color: #e0e0e0; height: 25px; border-radius: 12px; margin: 15px 0; overflow: hidden;">
                <div id="tm-progress-bar" style="background: linear-gradient(90deg, #004B87, #00AEEF); height: 100%; width: 0%; transition: width 0.5s;"></div>
            </div>
            <div id="tm-progress-text" style="font-size: 14px; margin-bottom: 10px;">Preparing to collect data...</div>
            <div id="tm-status-message" style="font-size: 13px; color: #666; min-height: 20px;"></div>
            <div id="tm-row-count" style="font-size: 12px; color: #888; margin-top: 10px;"></div>
        `;

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: '10000'
        });

        document.body.appendChild(overlay);
        document.body.appendChild(progressContainer);

        return {
            container: progressContainer,
            overlay: overlay,
            updateProgress: (current, total) => {
                const percentage = Math.round((current / total) * 100);
                document.getElementById('tm-progress-bar').style.width = `${percentage}%`;
                document.getElementById('tm-progress-text').textContent =
                    `Processing page ${current} of ${total} (${percentage}%)`;
            },
            updateStatus: (message) => {
                document.getElementById('tm-status-message').textContent = message;
            },
            updateRowCount: (count) => {
                document.getElementById('tm-row-count').textContent = `Total rows collected: ${count}`;
            },
            remove: () => {
                setTimeout(() => {
                    if (progressContainer.parentNode) document.body.removeChild(progressContainer);
                    if (overlay.parentNode) document.body.removeChild(overlay);
                }, 500);
            }
        };
    }

    /**
     * Espera a que los datos de la tabla se carguen y sean visibles.
     * @returns {Promise<boolean>} True si la tabla se cargó, false si hubo timeout.
     */
    async function waitForTableLoad() {
        const maxAttempts = 30; // Aumentar intentos para mayor resiliencia (30 * 300ms = 9 segundos)
        let attempts = 0;
        console.log('[Download Parcels] Waiting for table to load using selector:', SELECTORS.MAIN_DATA_TABLE_ROWS);

        while (attempts < maxAttempts) {
            const rows = document.querySelectorAll(SELECTORS.MAIN_DATA_TABLE_ROWS);
            if (rows.length > 0) {
                const hasDataRows = Array.from(rows).some(row => {
                    const cells = row.querySelectorAll('td');
                    return cells.length >= 5 && cells[0].textContent.trim() !== '';
                });
                if (hasDataRows) {
                    console.log(`[Download Parcels] Table loaded successfully after ${attempts} attempts. Found ${rows.length} potential rows.`);
                    return true;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 300));
            attempts++;
        }
        console.warn(`[Download Parcels] Timed out waiting for table to load after ${maxAttempts} attempts. No valid data rows found.`);
        return false;
    }

    /**
     * Extrae los datos de una fila HTML y los mapea a los encabezados definidos.
     * @param {HTMLElement} row - El elemento TR de la fila.
     * @param {string[]} tableHeaders - Array de nombres de encabezado.
     * @returns {object|null} Objeto con los datos de la fila o null si no es una fila válida.
     */
    function extractRowData(row, tableHeaders) {
        const rowData = {};
        const cells = row.querySelectorAll('td');

        if (cells.length < tableHeaders.length) {
            return null; // No suficientes celdas para ser una fila de datos completa
        }

        cells.forEach((cell, index) => {
            if (index < tableHeaders.length) {
                let value = cell.textContent.trim();
                if (value === '-' || value === 'N/A' || value === '' || value.toLowerCase() === 'n/a') {
                    value = '';
                }
                rowData[tableHeaders[index]] = value;
            }
        });

        // Asegurarse de que la fila tenga al menos algún dato significativo (ej. el primer campo no esté vacío)
        if (tableHeaders.length > 0 && !rowData[tableHeaders[0]] && rowData[tableHeaders[0]] !== '') {
             return null;
        }

        return Object.keys(rowData).length > 0 ? rowData : null;
    }

    /**
     * Recolecta todos los datos de las páginas de la tabla.
     * @param {number} totalPages - El número total de páginas a procesar.
     * @returns {Promise<object[]>} Un array de objetos con todos los datos recolectados.
     */
    async function collectData(totalPages) {
        const tableData = [];
        let progress = null;

        try {
            progress = showProgressBar();
            console.log('[Download Parcels] Starting data collection for', totalPages, 'pages.');

            const firstPageButton = document.querySelector(SELECTORS.FIRST_PAGE_BUTTON);
            if (firstPageButton && !firstPageButton.disabled && firstPageButton.href && !firstPageButton.classList.contains('active')) {
                progress.updateStatus('Navigating to first page...');
                console.log('[Download Parcels] Clicking first page button.');
                firstPageButton.click();
                if (!await waitForTableLoad()) {
                    throw new Error('Failed to load table data on first page after navigation. Aborting.');
                }
            } else {
                 progress.updateStatus('Starting data collection from current page...');
                 console.log('[Download Parcels] Already on first page or first page button not available/active.');
                 if (!await waitForTableLoad()) {
                    throw new Error('Failed to load table data on initial page. Aborting.');
                }
            }

            for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
                progress.updateStatus(`Extracting data from page ${currentPage}...`);
                progress.updateProgress(currentPage, totalPages);
                console.log(`[Download Parcels] Processing page ${currentPage}.`);

                if (currentPage > 1 && !await waitForTableLoad()) {
                    console.warn(`[Download Parcels] No table data found on page ${currentPage} after loading. Stopping collection.`);
                    progress.updateStatus(`No data found on page ${currentPage}, stopping collection early.`);
                    break;
                }

                const rows = document.querySelectorAll(SELECTORS.MAIN_DATA_TABLE_ROWS);
                let pageRowCount = 0;

                rows.forEach(row => {
                    const rowData = extractRowData(row, TABLE_HEADERS);
                    if (rowData) {
                        tableData.push(rowData);
                        pageRowCount++;
                    }
                });

                progress.updateRowCount(tableData.length);
                console.log(`[Download Parcels] Page ${currentPage}: Found ${pageRowCount} new rows. Total collected: ${tableData.length}.`);

                if (currentPage >= totalPages) {
                    console.log('[Download Parcels] Reached last page or total pages limit.');
                    break;
                }
                if (pageRowCount === 0 && currentPage > 1) { // Si no hay filas en una página subsiguiente, asumir fin de datos
                    console.warn('[Download Parcels] No new rows found on current page. Assuming end of data.');
                    break;
                }

                const nextButton = document.querySelector(SELECTORS.NEXT_PAGE_BUTTON);
                if (!nextButton || nextButton.disabled || nextButton.href === '#') {
                    console.log('[Download Parcels] No next page button available, or disabled/inactive. Assuming last page or end of navigation.');
                    break;
                }

                progress.updateStatus(`Loading page ${currentPage + 1}...`);
                nextButton.click();
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            console.log(`[Download Parcels] Data collection complete. Final total rows: ${tableData.length}.`);
            progress.updateStatus('Finalizing data export...');
            progress.updateRowCount(`Total rows collected: ${tableData.length}`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            return tableData;
        } catch (error) {
            console.error('[Download Parcels] Error during data collection:', error);
            if (progress) {
                progress.updateStatus(`Error: ${error.message}. Check browser console.`);
                progress.updateProgress(0, 1);
            }
            throw error;
        } finally {
            if (progress) {
                progress.remove();
                console.log('[Download Parcels] Progress bar removed.');
            }
        }
    }

    /**
     * Convierte un array de objetos en una cadena CSV.
     * @param {object[]} data - Array de objetos con los datos.
     * @param {string[]} headers - Array de encabezados en el orden deseado.
     * @returns {string} La cadena CSV.
     */
    function convertToCsv(data, headers) {
        if (!data || data.length === 0) {
            return headers.map(h => `"${h}"`).join(',') + '\n'; // Sólo encabezados si no hay datos
        }

        const csvRows = [];
        // Añadir encabezados
        csvRows.push(headers.map(header => {
            // Escapar comillas dobles y encerrar en comillas dobles
            return `"${header.replace(/"/g, '""')}"`;
        }).join(','));

        // Añadir filas de datos
        for (const row of data) {
            const values = headers.map(header => {
                let value = row[header] === undefined || row[header] === null ? '' : String(row[header]);
                // Escapar comillas dobles y encerrar en comillas dobles
                return `"${value.replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    /**
     * Descarga una cadena de texto como un archivo CSV.
     * @param {string} csvString - La cadena de texto CSV.
     * @param {string} filename - El nombre del archivo a descargar.
     */
    function downloadCsvFile(csvString, filename) {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // Navegadores que soportan el atributo 'download'
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url); // Liberar el objeto URL
            console.log(`[Download Parcels] CSV file "${filename}" generated and downloaded successfully.`);
        } else {
            alert('Your browser does not support automatic downloads. Please save the content manually.');
            console.warn('[Download Parcels] Browser does not support download attribute.');
            window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
        }
    }

    // Listener para el botón de descarga CSV
    downloadCsvButton.addEventListener('click', async () => {
        console.log('[Download Parcels] Download CSV button clicked.');
        downloadCsvButton.disabled = true;
        downloadCsvButton.textContent = 'Processing...';
        downloadCsvButton.classList.add('is-processing');

        try {
            const totalPages = getTotalPages();
            const confirmMessage = `This will download data from ${totalPages} pages (approx. ${totalPages * 10} records) to CSV. Continue?`;

            if (!confirm(confirmMessage)) {
                console.log('[Download Parcels] User cancelled download.');
                return;
            }

            const startTime = performance.now();
            const tableData = await collectData(totalPages);
            const endTime = performance.now();

            console.log(`[Download Parcels] Data collection phase completed in ${((endTime - startTime)/1000).toFixed(2)} seconds.`);

            if (tableData.length > 0) {
                const csvString = convertToCsv(tableData, TABLE_HEADERS);
                const filename = getFilenameFromUrl();
                downloadCsvFile(csvString, filename);
            } else {
                alert('No data was collected. The table might be empty or page structure has changed. Check console for details.');
                console.warn('[Download Parcels] No data collected to export.');
            }

        } catch (error) {
            console.error('[Download Parcels] Critical error during script execution:', error);
            alert(`An error occurred: ${error.message}\n\nPlease check the browser's console (F12) for more details.`);
        } finally {
            downloadCsvButton.textContent = 'Download All Parcels (CSV)';
            downloadCsvButton.disabled = false;
            downloadCsvButton.classList.remove('is-processing');
            console.log('[Download Parcels] Button state restored.');
        }
    });
})();
