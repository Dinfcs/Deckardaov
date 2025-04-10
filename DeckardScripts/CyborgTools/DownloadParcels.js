// ==UserScript==
// @name         DownloadParcels
// @namespace
// @version      1.6
// @description  Extrae datos de un numero de paginas en parcel y las descarga automaticamente como Excel con formato personalizado
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
            return `${urlParts[1]}_${urlParts[2]}_parcel`;
        }
        return 'table_data'; // fallback if URL doesn't match expected pattern
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
            remove: () => {
                document.body.removeChild(progressContainer);
                document.body.removeChild(overlay);
            }
        };
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

        // First go to page 1 if not already there
        const firstPageButton = document.querySelector('.first-page');
        if (firstPageButton && !firstPageButton.disabled) {
            firstPageButton.click();
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Collect data from page 1
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

        progress.updateProgress(1, totalPages);

        // Process remaining pages
        for (let i = 1; i < totalPages; i++) {
            const nextButton = document.querySelector('.next-page');
            if (!nextButton || nextButton.disabled) break;

            nextButton.click();
            // Wait for page to load
            await new Promise(resolve => setTimeout(resolve, 200));

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

            progress.updateProgress(i + 1, totalPages);
        }

        progress.remove();
        return tableData;
    }

    function exportToFormattedExcel(data) {
        const filenameBase = getFilenameFromUrl();
        const tableHeaders = Object.keys(data[0] || {});

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Define custom colors
        const colors = {
            lightBlue: { rgb: "00AEEF" },
            darkBlue: { rgb: "004B87" },
            limeGreen: { rgb: "D1E231" },
            lightGray: { rgb: "F2F2F2" },
            darkGray: { rgb: "A9A9A9" },
            black: { rgb: "000000" }
        };

        // Apply styling to the worksheet
        if (!ws['!cols']) ws['!cols'] = [];
        if (!ws['!rows']) ws['!rows'] = [];

        // Adjust column widths based on content
        tableHeaders.forEach((header, index) => {
            ws['!cols'][index] = { wch: Math.max(header.length * 1.5, 12) };
        });

        // Generate styles for the worksheet
        ws['!styles'] = {};

        // Add header style
        const headerRange = {s: {r: 0, c: 0}, e: {r: 0, c: tableHeaders.length - 1}};
        for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
            const cellRef = XLSX.utils.encode_cell({r: 0, c: col});
            ws[cellRef].s = {
                fill: { fgColor: colors.darkBlue },
                font: { color: { rgb: "FFFFFF" }, bold: true },
                alignment: { horizontal: "center", vertical: "center" }
            };
        }

        // Alternate row colors
        for (let row = 1; row <= data.length; row++) {
            const bgColor = row % 2 === 0 ? colors.lightGray : { rgb: "FFFFFF" };
            for (let col = 0; col < tableHeaders.length; col++) {
                const cellRef = XLSX.utils.encode_cell({r: row, c: col});
                if (ws[cellRef]) {
                    ws[cellRef].s = {
                        fill: { fgColor: bgColor },
                        font: { color: colors.black },
                        border: {
                            top: { style: "thin", color: colors.darkGray },
                            bottom: { style: "thin", color: colors.darkGray },
                            left: { style: "thin", color: colors.darkGray },
                            right: { style: "thin", color: colors.darkGray }
                        }
                    };
                }
            }
        }

        // Special formatting for specific columns
        if (tableHeaders.includes("license_status")) {
            const colIndex = tableHeaders.indexOf("license_status");
            for (let row = 1; row <= data.length; row++) {
                const cellRef = XLSX.utils.encode_cell({r: row, c: colIndex});
                if (ws[cellRef]) {
                    const status = ws[cellRef].v;
                    if (status === "Active") {
                        ws[cellRef].s = { ...ws[cellRef].s, fill: { fgColor: colors.limeGreen } };
                    } else if (status === "Inactive" || status === "Expired") {
                        ws[cellRef].s = { ...ws[cellRef].s, fill: { fgColor: colors.lightBlue } };
                    }
                }
            }
        }

        // Apply the styles using XLSX's style module
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Use XLSX.writeFile to save the file with formatting
        XLSX.writeFile(wb, `${filenameBase}.xlsx`);
    }

    button.addEventListener('click', async () => {
        const numPages = prompt('Enter the number of pages to load:');
        if (!numPages || isNaN(numPages) || numPages < 1) return;

        try {
            const tableData = await collectData(parseInt(numPages));
            exportToFormattedExcel(tableData);
        } catch (error) {
            console.error('Error collecting data:', error);
            alert('An error occurred while collecting data. Please try again.');
        }
    });
})();
