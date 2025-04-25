// ==UserScript==
// @name         Download Parcels
// @namespace
// @version      1.9
// @description  Extrae datos de todas las páginas en parcel y las descarga automáticamente como Excel con formato personalizado
// @match        https://cyborg.deckard.com/parcel/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.15.1/xlsx.full.min.js
// ==/UserScript==

(function() {
    'use strict';

    const button = document.createElement('button');
    button.textContent = 'Download Parcel';
    Object.assign(button.style, {
        padding: '10px 15px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: '2px 2px 10px rgba(0,0,0,0.3)',
        marginRight: '10px'
    });

    function insertButton() {
        const firstPageButton = document.querySelector('.first-page');
        if (firstPageButton) {
            firstPageButton.parentNode.insertBefore(button, firstPageButton);
        }
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector('.first-page')) {
            insertButton();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function getFilenameFromUrl() {
        const urlParts = window.location.pathname.split('/').filter(part => part && part !== '_');
        if (urlParts.length >= 3 && urlParts[0] === 'parcel') {
            return `${urlParts[1]}_${urlParts[2]}_parcels`;
        }
        return 'table_data';
    }

    function getTotalPages() {
        const lastPageElement = document.querySelector('.last-page');
        if (lastPageElement) {
            const pageText = lastPageElement.textContent.trim();
            const totalPages = parseInt(pageText);
            return isNaN(totalPages) ? 1 : totalPages;
        }
        return 1;
    }

    function showProgressBar() {
        const progressContainer = document.createElement('div');
        Object.assign(progressContainer.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '10px',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)',
            zIndex: '1001',
            textAlign: 'center'
        });

        progressContainer.innerHTML = `
            <h3>Collecting Data...</h3>
            <div style="background-color: #eee; height: 20px; border-radius: 10px; margin: 10px 0; overflow: hidden;">
                <div id="progress-bar" style="background-color: #007bff; height: 100%; width: 0%; transition: width 0.3s;"></div>
            </div>
            <div id="progress-text">0%</div>
            <div id="status-message" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
        `;

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '1000'
        });

        document.body.appendChild(overlay);
        document.body.appendChild(progressContainer);

        return {
            container: progressContainer,
            overlay: overlay,
            updateProgress: (current, total) => {
                const percentage = Math.round((current / total) * 100);
                document.getElementById('progress-bar').style.width = `${percentage}%`;
                document.getElementById('progress-text').textContent = `${current} of ${total} pages (${percentage}%)`;
            },
            updateStatus: (message) => {
                document.getElementById('status-message').textContent = message;
            },
            remove: () => {
                document.body.removeChild(progressContainer);
                document.body.removeChild(overlay);
            }
        };
    }

    async function waitForTableLoad() {
        const maxAttempts = 15;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const rows = document.querySelectorAll('table tr');
            if (rows.length > 0) {
                // Verificar que las filas tengan datos (no solo encabezados)
                const hasDataRows = Array.from(rows).some(row => {
                    return row.querySelectorAll('td').length > 0;
                });
                if (hasDataRows) return true;
            }
            await new Promise(resolve => setTimeout(resolve, 300));
            attempts++;
        }
        return false;
    }

    function extractRowData(row, tableHeaders) {
        const rowData = {};
        const cells = row.querySelectorAll('td');

        // Verificar si es una fila de datos válida
        if (cells.length < tableHeaders.length) return null;

        cells.forEach((cell, index) => {
            if (index < tableHeaders.length) {
                rowData[tableHeaders[index]] = cell.textContent.trim();
            }
        });

        return Object.keys(rowData).length > 0 ? rowData : null;
    }

    async function collectData(totalPages) {
        const tableHeaders = [
            "parcel_apn", "license", "license_status", "people_on_license",
            "parcel_state", "parcel_county", "parcel_use_type", "parcel_owner_name_1",
            "parcel_owner_name_2", "parcel_site_address", "parcel_site_address_unit_number",
            "parcel_bedrooms", "owner_address", "claiming_hoe", "parcel_latitude", "parcel_longitude"
        ];

        const tableData = [];
        const progress = showProgressBar();

        try {
            // Ir a la primera página si no estamos ya allí
            const firstPageButton = document.querySelector('.first-page');
            if (firstPageButton && !firstPageButton.disabled) {
                progress.updateStatus('Navigating to first page...');
                firstPageButton.click();
                if (!await waitForTableLoad()) {
                    throw new Error('Failed to load first page');
                }
            }

            // Procesar todas las páginas
            for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
                progress.updateStatus(`Processing page ${currentPage}...`);
                progress.updateProgress(currentPage, totalPages);

                // Esperar a que la tabla se cargue
                if (!await waitForTableLoad()) {
                    console.warn(`No table data found on page ${currentPage}`);
                    break;
                }

                // Extraer datos de todas las filas válidas
                const rows = document.querySelectorAll('table tr');
                let pageRowCount = 0;

                rows.forEach(row => {
                    const rowData = extractRowData(row, tableHeaders);
                    if (rowData) {
                        tableData.push(rowData);
                        pageRowCount++;
                    }
                });

                console.log(`Page ${currentPage}: Found ${pageRowCount} rows`);

                // Si estamos en la última página, no necesitamos hacer clic en "siguiente"
                if (currentPage >= totalPages) break;

                // Navegar a la siguiente página
                const nextButton = document.querySelector('.next-page');
                if (!nextButton || nextButton.disabled) {
                    console.log('No next page button available');
                    break;
                }

                nextButton.click();
                await new Promise(resolve => setTimeout(resolve, 200)); // Pequeña pausa
            }

            console.log(`Data collection complete. Total rows: ${tableData.length}`);
            progress.updateStatus(`Completed: Collected ${tableData.length} rows`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            return tableData;
        } finally {
            progress.remove();
        }
    }

    function exportToFormattedExcel(data) {
        if (!data || data.length === 0) {
            alert('No data collected to export');
            return;
        }

        const filenameBase = getFilenameFromUrl();
        const tableHeaders = Object.keys(data[0] || {});

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${filenameBase}.xlsx`);
    }

    button.addEventListener('click', async () => {
        button.disabled = true;
        try {
            const totalPages = getTotalPages();
            const confirmDownload = confirm(`This will download data from ${totalPages} pages. Continue?`);

            if (!confirmDownload) return;

            const tableData = await collectData(totalPages);
            exportToFormattedExcel(tableData);
        } catch (error) {
            console.error('Error collecting data:', error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            button.disabled = false;
        }
    });
})();
