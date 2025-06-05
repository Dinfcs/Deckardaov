// ==UserScript==
// @name         Fullscreen Table with Filter and Export (CSV Mod, No Require)
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Extrae datos, elimina duplicados y exporta a CSV sin dependencias externas.
// @match        https://cyborg.deckard.com/parcel/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- NUEVA FUNCIÓN: Convierte un array de objetos a un string CSV ---
    function convertToCSV(data, headers) {
        // Función para escapar caracteres especiales en una celda de CSV
        const escapeCSVCell = (cell) => {
            if (cell === null || cell === undefined) {
                return '';
            }
            const cellString = String(cell);
            // Si la celda contiene una coma, una comilla doble o un salto de línea, debe ir entre comillas
            if (cellString.search(/("|,|\n)/g) >= 0) {
                // Escapa las comillas dobles existentes duplicándolas
                const escapedString = cellString.replace(/"/g, '""');
                return `"${escapedString}"`;
            }
            return cellString;
        };

        // 1. Crear la fila de encabezados
        const headerRow = headers.map(escapeCSVCell).join(',');

        // 2. Crear las filas de datos
        const dataRows = data.map(row => {
            return headers.map(header => {
                return escapeCSVCell(row[header]);
            }).join(',');
        });

        // 3. Unir todo con saltos de línea
        return [headerRow, ...dataRows].join('\n');
    }


    const button = document.createElement('button');
    button.textContent = 'Load Pages';
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

    function showTableInModal(tableHTML, tableData, tableHeaders) {
        const modal = document.createElement('div');
        Object.assign(modal.style, {
            position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: '1001'
        });

        const modalContent = document.createElement('div');
        Object.assign(modalContent.style, {
            backgroundColor: '#fff', padding: '20px', borderRadius: '10px',
            width: '95%', height: '95%', overflow: 'auto',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)', position: 'relative'
        });

        const closeButton = document.createElement('button');
        closeButton.textContent = '✖';
        Object.assign(closeButton.style, {
            position: 'absolute', top: '10px', right: '10px', padding: '5px 10px',
            backgroundColor: '#ff4d4d', color: '#fff', border: 'none',
            borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
        });
        closeButton.onclick = () => document.body.removeChild(modal);

        modalContent.innerHTML = `
            <h2 style="text-align:center; margin-bottom:10px;">Table Data</h2>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <label for="filter" style="margin-right: 10px;">Filter: </label>
                <input type="text" id="filter" placeholder="Enter a value..." style="padding:5px; border:1px solid #ccc; border-radius:4px; margin-right: 10px;">
                <button id="export-csv-btn" style="background:#28a745; color:#fff; padding:8px 12px; border:none; border-radius:4px; cursor:pointer; font-size:12px;">Export to CSV</button>
            </div>
            ${tableHTML}
        `;

        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        const filterInput = modalContent.querySelector('#filter');
        filterInput.addEventListener('input', () => {
            const filter = filterInput.value.toLowerCase();
            modalContent.querySelectorAll('tbody tr').forEach(row => {
                row.style.display = [...row.querySelectorAll('td')].some(cell =>
                    cell.textContent.toLowerCase().includes(filter)
                ) ? '' : 'none';
            });
        });

        // --- MODIFICACIÓN: Lógica de exportación usa nuestra nueva función ---
        modalContent.querySelector('#export-csv-btn').addEventListener('click', () => {
            // Llama a la función manual para generar el contenido del CSV
            const csvOutput = convertToCSV(tableData, tableHeaders);

            const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'table_data.csv';
            link.click();
        });
    }

    button.addEventListener('click', async () => {
        const numPages = prompt('Enter the number of pages to load:');
        if (!numPages || isNaN(numPages)) return;

        const originalTable = document.querySelector('table');
        if (!originalTable) return;

        const tableHeaders = [
            "parcel_apn", "license", "license_status", "people_on_license",
            "parcel_state", "parcel_county", "parcel_use_type", "parcel_owner_name_1",
            "parcel_owner_name_2", "parcel_site_address", "parcel_site_address_unit_number",
            "parcel_bedrooms", "owner_address", "claiming_hoe", "parcel_latitude", "parcel_longitude"
        ];

        let tableData = [];

        const extractDataFromCurrentPage = () => {
            document.querySelectorAll('table tr').forEach(row => {
                const rowData = {};
                row.querySelectorAll('td').forEach((cell, index) => {
                    if (index < tableHeaders.length) {
                        rowData[tableHeaders[index]] = cell.textContent.trim();
                    }
                });
                if (Object.keys(rowData).length > 0) {
                    tableData.push(rowData);
                }
            });
        };

        extractDataFromCurrentPage();

        for (let i = 1; i < numPages; i++) {
            const nextButton = document.querySelector('.next-page');
            if (!nextButton || nextButton.disabled) break;
            nextButton.click();
            await new Promise(resolve => setTimeout(resolve, 10));
            extractDataFromCurrentPage();
        }

        const seen = new Set();
        const uniqueTableData = tableData.filter(row => {
            const rowString = JSON.stringify(row);
            if (!seen.has(rowString)) {
                seen.add(rowString);
                return true;
            }
            return false;
        });

        const tableHTML = `
            <table style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr>
                        ${tableHeaders.map(name => `<th style='border:1px solid #ccc; padding:5px; background:#007bff; color:#fff;'>${name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${uniqueTableData.map(row => `
                        <tr>
                            ${tableHeaders.map(header => `<td style='border:1px solid #ccc; padding:5px;'>${row[header] || ''}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        // Pasamos los datos y los encabezados a la función de la modal
        showTableInModal(tableHTML, uniqueTableData, tableHeaders);
    });
})();
