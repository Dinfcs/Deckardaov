// ==UserScript==
// @name         Fullscreen Table with Filter and Export
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Extrae datos de un numero de paginas en parcel y las muestra en una tabla  con opcion a exportar
// @match        https://cyborg.deckard.com/parcel/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.15.1/xlsx.full.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Create the floating button
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

    // Function to insert the button
    function insertButton() {
        const firstPageButton = document.querySelector('.first-page');
        if (firstPageButton) {
            firstPageButton.parentNode.insertBefore(button, firstPageButton);
        }
    }

    // Use MutationObserver to wait for the first-page button to appear
    const observer = new MutationObserver(() => {
        if (document.querySelector('.first-page')) {
            insertButton();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    function showTableInModal(tableHTML) {
        const modal = document.createElement('div');
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '1001'
        });

        const modalContent = document.createElement('div');
        Object.assign(modalContent.style, {
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '10px',
            width: '100%',
            maxHeight: '100%',
            overflow: 'auto',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)',
            position: 'relative'
        });

        const closeButton = document.createElement('button');
        closeButton.textContent = '✖';
        Object.assign(closeButton.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '5px 10px',
            backgroundColor: '#ff4d4d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
        });
        closeButton.onclick = () => document.body.removeChild(modal);

        modalContent.innerHTML = `
            <h2 style="text-align:center; margin-bottom:10px;">Table Data</h2>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <label for="filter" style="margin-right: 10px;">Filter: </label>
                <input type="text" id="filter" placeholder="Enter a value..." style="padding:5px; border:1px solid #ccc; border-radius:4px; margin-right: 10px;">
                <button id="export-btn" style="background:#28a745; color:#fff; padding:8px 12px; border:none; border-radius:4px; cursor:pointer; font-size:12px;">Export to Excel</button>
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

        modalContent.querySelector('#export-btn').addEventListener('click', () => {
            const table = modalContent.querySelector('table');
            const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
            XLSX.writeFile(wb, "table_data.xlsx");
        });
    }

    button.addEventListener('click', async () => {
        const numPages = prompt('Enter the number of pages to load:');
        if (!numPages || isNaN(numPages)) return;
        const originalTable = document.querySelector('table');
        if (!originalTable) return;

        const newTable = document.createElement('table');
        newTable.style.width = '100%';
        newTable.style.borderCollapse = 'collapse';
        newTable.innerHTML = '<thead><tr>' + [
            "parcel_apn", "license", "license_status", "people_on_license",
            "parcel_state", "parcel_county", "parcel_use_type", "parcel_owner_name_1",
            "parcel_owner_name_2", "parcel_site_address", "parcel_site_address_unit_number",
            "parcel_bedrooms", "owner_address", "claiming_hoe", "parcel_latitude", "parcel_longitude"
        ].map(name => `<th style='border:1px solid #ccc; padding:5px; background:#007bff; color:#fff;'>${name}</th>`).join('') + '</tr></thead><tbody></tbody>';

        const copyRow = row => {
            const newRow = document.createElement('tr');
            row.querySelectorAll('td').forEach((cell, index) => {
                if (index < 16) {
                    const newCell = document.createElement('td');
                    newCell.textContent = cell.textContent.trim();
                    newCell.style.border = '1px solid #ccc';
                    newCell.style.padding = '5px';
                    newRow.appendChild(newCell);
                }
            });
            return newRow;
        };

        originalTable.querySelectorAll('tr').forEach(row => newTable.querySelector('tbody').appendChild(copyRow(row)));
        for (let i = 1; i < numPages; i++) {
            const nextButton = document.querySelector('.next-page');
            if (!nextButton) break;
            nextButton.click();
            await new Promise(resolve => setTimeout(resolve, 10));
            document.querySelectorAll('table tr').forEach(row => newTable.querySelector('tbody').appendChild(copyRow(row)));
        }

        showTableInModal(newTable.outerHTML);
    });
})();
