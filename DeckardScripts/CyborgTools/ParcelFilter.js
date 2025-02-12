// ==UserScript==
// @name         Table with Filter and Export (No Window Open)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Displays table data in a modal, adds a filter, and allows export to Excel.
// @author       Your Name
// @match        https://cyborg.deckard.com/parcel/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.15.1/xlsx.full.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Create the floating button
    const button = document.createElement('button');
    button.textContent = 'Load Pages';
    button.style.position = 'fixed';
    button.style.bottom = '20%'; // 80% height from the bottom
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';

    document.body.appendChild(button);

    // Function to create a modal and display the table
    function showTableInModal(tableHTML) {
        // Create modal container
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1001';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#fff';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.width = '80%';
        modalContent.style.maxHeight = '80%';
        modalContent.style.overflow = 'auto';
        modalContent.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = '#ff0000';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '4px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => document.body.removeChild(modal);

        // Add table and filter
        modalContent.innerHTML = `
            <h1>Table Data</h1>
            <div class="filter-container">
                <label for="filter">Filter: </label>
                <input type="text" id="filter" placeholder="Enter a value to filter...">
            </div>
            ${tableHTML}
            <button class="export-button" id="export-btn">Export to Excel</button>
        `;

        // Append elements to modal
        modalContent.appendChild(closeButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Add filter functionality
        const filterInput = modalContent.querySelector('#filter');
        filterInput.addEventListener('input', () => {
            const filter = filterInput.value.toLowerCase();
            const rows = modalContent.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                let match = false;
                cells.forEach(cell => {
                    if (cell.textContent.toLowerCase().includes(filter)) {
                        match = true;
                    }
                });
                row.style.display = match ? '' : 'none';
            });
        });

        // Add export functionality
        const exportButton = modalContent.querySelector('#export-btn');
        exportButton.addEventListener('click', () => {
            const table = modalContent.querySelector('table');
            const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
            XLSX.writeFile(wb, "table_data.xlsx");
        });
    }

    // Function to load and display page data
    button.addEventListener('click', async () => {
        const numPages = prompt('Enter the number of pages to load:');
        if (!numPages || isNaN(numPages)) return;

        const originalTable = document.querySelector('table'); // Adjust the selector according to your table
        if (!originalTable) return;

        // Create a new table in memory
        const newTable = document.createElement('table');

        // Define the column names
        const columnNames = [
            "parcel_apn",
            "license",
            "license_status",
            "people_on_license",
            "parcel_state",
            "parcel_county",
            "parcel_use_type",
            "parcel_owner_name_1",
            "parcel_owner_name_2",
            "parcel_site_address",
            "parcel_site_address_unit_number",
            "parcel_bedrooms",
            "owner_address",
            "claiming_hoe",
            "parcel_latitude",
            "parcel_longitude"
        ];

        // Create the header row
        const headerRow = document.createElement('tr');
        columnNames.forEach(name => {
            const newHeader = document.createElement('th');
            newHeader.textContent = name;
            headerRow.appendChild(newHeader);
        });
        newTable.appendChild(headerRow);

        // Function to copy a row and remove the last 16 columns
        const copyRow = (row) => {
            const newRow = document.createElement('tr');
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (index < columnNames.length) { // Only copy necessary columns
                    const newCell = document.createElement('td');
                    newCell.textContent = cell.textContent.trim(); // Adjust the content
                    newRow.appendChild(newCell);
                }
            });
            return newRow;
        };

        // Copy rows from the original table
        originalTable.querySelectorAll('tr').forEach(row => {
            newTable.appendChild(copyRow(row));
        });

        // Load additional pages
        for (let i = 1; i <= numPages; i++) {
            // Simulate click on the next page button
            const nextButton = document.querySelector('.next-page');
            if (!nextButton) break;
            nextButton.click();

            // Wait for the page to load (adjust the time as needed)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get the new table and add its rows to the new table
            const additionalTable = document.querySelector('table');
            if (!additionalTable) break;

            additionalTable.querySelectorAll('tr').forEach(row => {
                newTable.appendChild(copyRow(row));
            });
        }

        // Show the table in a modal
        showTableInModal(newTable.outerHTML);
    });
})();