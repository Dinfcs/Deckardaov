// ==UserScript==
// @name         Download Parcels with Formatting
// @namespace
// @version      2.0
// @description  Extrae datos de todas las páginas en parcel y las descarga como Excel con formato avanzado
// @match        https://cyborg.deckard.com/parcel/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.15.1/xlsx.full.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Configuración de estilos
    const styles = {
        header: {
            fill: { patternType: "solid", fgColor: { rgb: "004B87" } },
            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
            alignment: { horizontal: "center", vertical: "center", wrapText: true },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        },
        evenRow: {
            fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } },
            font: { color: { rgb: "000000" }, sz: 11 },
            border: styles.header.border
        },
        oddRow: {
            fill: { patternType: "solid", fgColor: { rgb: "F2F2F2" } },
            font: { color: { rgb: "000000" }, sz: 11 },
            border: styles.header.border
        },
        activeStatus: {
            fill: { patternType: "solid", fgColor: { rgb: "D1E231" } },
            font: { bold: true }
        },
        inactiveStatus: {
            fill: { patternType: "solid", fgColor: { rgb: "00AEEF" } }
        },
        warningStatus: {
            fill: { patternType: "solid", fgColor: { rgb: "FFC000" } }
        },
        errorStatus: {
            fill: { patternType: "solid", fgColor: { rgb: "FF0000" } },
            font: { color: { rgb: "FFFFFF" } }
        }
    };

    // Crear botón de descarga
    const button = document.createElement('button');
    button.textContent = 'Download Parcel';
    Object.assign(button.style, {
        padding: '10px 15px',
        backgroundColor: '#004B87',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: '2px 2px 10px rgba(0,0,0,0.3)',
        marginRight: '10px',
        fontWeight: 'bold'
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
            return `${urlParts[1]}_${urlParts[2]}_parcels_${new Date().toISOString().slice(0,10)}`;
        }
        return `parcel_data_${new Date().toISOString().slice(0,10)}`;
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
            width: '450px',
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
            zIndex: '1001',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
        });

        progressContainer.innerHTML = `
            <h3 style="margin-top: 0; color: #004B87;">Collecting Parcel Data</h3>
            <div style="background-color: #e0e0e0; height: 25px; border-radius: 12px; margin: 15px 0; overflow: hidden;">
                <div id="progress-bar" style="background: linear-gradient(90deg, #004B87, #00AEEF); height: 100%; width: 0%; transition: width 0.5s;"></div>
            </div>
            <div id="progress-text" style="font-size: 14px; margin-bottom: 10px;">Preparing to collect data...</div>
            <div id="status-message" style="font-size: 13px; color: #666; min-height: 20px;"></div>
            <div id="row-count" style="font-size: 12px; color: #888; margin-top: 10px;"></div>
        `;

        const overlay = document.createElement('div');
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
                document.getElementById('progress-text').textContent = 
                    `Processing page ${current} of ${total} (${percentage}%)`;
            },
            updateStatus: (message) => {
                document.getElementById('status-message').textContent = message;
            },
            updateRowCount: (count) => {
                document.getElementById('row-count').textContent = `Total rows collected: ${count}`;
            },
            remove: () => {
                setTimeout(() => {
                    document.body.removeChild(progressContainer);
                    document.body.removeChild(overlay);
                }, 500);
            }
        };
    }

    async function waitForTableLoad() {
        const maxAttempts = 20;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const rows = document.querySelectorAll('table tr');
            if (rows.length > 0) {
                const hasDataRows = Array.from(rows).some(row => {
                    return row.querySelectorAll('td').length > 5; // Asume que hay al menos 5 columnas
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
        
        if (cells.length < tableHeaders.length) return null;
        
        cells.forEach((cell, index) => {
            if (index < tableHeaders.length) {
                let value = cell.textContent.trim();
                
                // Limpieza básica de datos
                if (value === '-' || value === 'N/A') value = '';
                
                rowData[tableHeaders[index]] = value;
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
                    throw new Error('Failed to load table on first page');
                }
            }

            // Procesar todas las páginas
            for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
                progress.updateStatus(`Extracting data from page ${currentPage}...`);
                progress.updateProgress(currentPage, totalPages);

                // Esperar a que la tabla se cargue
                if (!await waitForTableLoad()) {
                    console.warn(`No table data found on page ${currentPage}`);
                    progress.updateStatus(`No data found on page ${currentPage}, stopping collection`);
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

                progress.updateRowCount(tableData.length);
                console.log(`Page ${currentPage}: Found ${pageRowCount} rows`);

                // Si estamos en la última página, no hacer clic en "siguiente"
                if (currentPage >= totalPages) break;

                // Navegar a la siguiente página
                const nextButton = document.querySelector('.next-page');
                if (!nextButton || nextButton.disabled) {
                    console.log('No next page button available');
                    break;
                }

                progress.updateStatus(`Loading page ${currentPage + 1}...`);
                nextButton.click();
                await new Promise(resolve => setTimeout(resolve, 300)); // Pausa para carga
            }

            console.log(`Data collection complete. Total rows: ${tableData.length}`);
            progress.updateStatus('Finalizing data export...');
            progress.updateRowCount(`Total rows collected: ${tableData.length}`);
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

        // Crear libro y hoja de trabajo
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Definir anchos de columna basados en contenido
        const colWidths = tableHeaders.map(header => {
            const maxContentLength = Math.max(
                header.length,
                ...data.map(row => (row[header] || '').toString().length)
            );
            return { wch: Math.min(Math.max(maxContentLength * 1.1, 12), 50) };
        });

        ws['!cols'] = colWidths;

        // Aplicar estilos a las celdas
        if (!ws['!styles']) ws['!styles'] = {};

        // Estilo para encabezados
        tableHeaders.forEach((header, colIndex) => {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
            ws[cellRef].s = styles.header;
        });

        // Estilos para filas de datos
        data.forEach((row, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0;
            const rowStyle = isEvenRow ? styles.evenRow : styles.oddRow;

            tableHeaders.forEach((header, colIndex) => {
                const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
                
                // Clonar el estilo base
                ws[cellRef].s = JSON.parse(JSON.stringify(rowStyle));
                
                // Aplicar estilos condicionales
                if (header === 'license_status') {
                    const status = row[header] || '';
                    if (status.match(/active/i)) {
                        ws[cellRef].s = Object.assign(ws[cellRef].s, styles.activeStatus);
                    } else if (status.match(/inactive|expired/i)) {
                        ws[cellRef].s = Object.assign(ws[cellRef].s, styles.inactiveStatus);
                    } else if (status.match(/pending|waiting/i)) {
                        ws[cellRef].s = Object.assign(ws[cellRef].s, styles.warningStatus);
                    } else if (status.match(/rejected|denied/i)) {
                        ws[cellRef].s = Object.assign(ws[cellRef].s, styles.errorStatus);
                    }
                }
                
                // Formato especial para coordenadas
                if ((header === 'parcel_latitude' || header === 'parcel_longitude') && row[header]) {
                    ws[cellRef].t = 'n'; // Tipo numérico
                    ws[cellRef].z = '0.000000'; // Formato de 6 decimales
                }
            });
        });

        // Congelar la fila de encabezado
        ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2' };

        // Añadir filtros a los encabezados
        ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(tableHeaders.length - 1)}1` };

        // Añadir hoja al libro
        XLSX.utils.book_append_sheet(wb, ws, "Parcel Data");

        // Generar archivo Excel
        XLSX.writeFile(wb, `${filenameBase}.xlsx`, { compression: true });
    }

    button.addEventListener('click', async () => {
        button.disabled = true;
        button.textContent = 'Processing...';
        
        try {
            const totalPages = getTotalPages();
            const confirmDownload = confirm(`This will download data from ${totalPages} pages (approx. ${totalPages * 10} records). Continue?`);

            if (!confirmDownload) {
                button.textContent = 'Download Parcel';
                button.disabled = false;
                return;
            }

            const startTime = performance.now();
            const tableData = await collectData(totalPages);
            const endTime = performance.now();
            
            console.log(`Data collection took ${((endTime - startTime)/1000).toFixed(2)} seconds`);
            exportToFormattedExcel(tableData);
            
        } catch (error) {
            console.error('Error in data collection:', error);
            alert(`Error: ${error.message}\n\nCheck console for details.`);
        } finally {
            button.textContent = 'Download Parcel';
            button.disabled = false;
        }
    });
})();
