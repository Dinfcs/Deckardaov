// ==UserScript==
// @name         License Validator with Data Check
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  License validator that only runs when data exists
// @match        *://*/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Minimal styles
    const style = document.createElement('style');
    style.textContent = `
        .deckard-popup {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: Arial, sans-serif;
            font-size: 13px;
            z-index: 9999;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            max-height: 80vh;
            overflow: auto;
        }

        .deckard-header {
            padding: 8px;
            background: #f5f5f5;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
        }

        .deckard-close {
            cursor: pointer;
        }

        .deckard-content {
            padding: 8px;
        }

        .deckard-section {
            margin-bottom: 10px;
            padding: 8px;
            background: #f9f9f9;
            border-radius: 3px;
        }

        .deckard-unit {
            display: inline-block;
            padding: 2px 5px;
            margin: 2px;
            background: #e0e0e0;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
        }

        .deckard-unit.highlighted {
            background: #ffeb3b;
        }

        .deckard-search input {
            width: 100%;
            padding: 5px;
            margin-bottom: 5px;
            border: 1px solid #ddd;
        }

        .deckard-search button {
            width: 100%;
            padding: 5px;
            background: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // Utility functions
    const utils = {
        normalizeLicense: license => license.replace(/[- ._]/g, '').toUpperCase(),

        extractAPN: () => {
            const tdEl = document.querySelector('td.value[data-field-name="apn"] p');
            const tdApn = tdEl ? tdEl.textContent.match(/^\d+/)?.[0] : null;
            if (tdApn) return tdApn;

            const inputEl = document.querySelector('input[name="apn"], input[id*="apn"]');
            if (inputEl) return inputEl.value.match(/\d+/)?.[0];
            return null;
        },

        extractSheetName: () => {
            const path = window.location.pathname;
            const match = path.match(/\/listing\/([^\/]+)\/([^\/]+)\/([^\/]+)\//);
            if (!match) return null;

            const state = match[1].toLowerCase();
            const county = match[2].toLowerCase();
            const city = match[3].toLowerCase();

            return city === '_' 
                ? `${state}-${county}-str-licenses` 
                : `${state}-${county}-${city.replace(/\s+/g, '_')}-str-licenses`;
        },

        extractLicenses: () => {
            const el = document.querySelector('td.value[data-field-name="probable_licenses"]');
            return el?.textContent.trim().split(',').map(l => l.trim()).filter(l => l);
        },

        extractCurrentUnit: () => {
            const unitEl = document.querySelector('td.value[data-field-name="unit_number"] p');
            if (unitEl) {
                const unitMatch = unitEl.textContent.match(/^\s*(\d+)/);
                return unitMatch ? unitMatch[1].trim() : null;
            }
            const inputEl = document.querySelector('input[name="unit_number"], input[id*="unit_number"]');
            return inputEl ? inputEl.value.trim() : null;
        }
    };

    // Main UI component
    class DeckardUI {
        constructor(apn, sheetName, licensesData, jsonData, listLicenses) {
            this.apn = apn;
            this.jsonData = jsonData;
            this.listLicenses = listLicenses || [];
            this.popup = null;
            this.createPopup();
        }

        createPopup() {
            this.popup = document.createElement('div');
            this.popup.className = 'deckard-popup';
            this.popup.innerHTML = `
                <div class="deckard-header">
                    <span>Licenses for APN: ${this.apn}</span>
                    <span class="deckard-close">×</span>
                </div>
                <div class="deckard-content">
                    ${this.createLicensesSection()}
                    <div class="deckard-section deckard-search">
                        <div>Manual Search:</div>
                        <input type="text" id="deckard-search-input" placeholder="Enter APN or License">
                        <button id="deckard-search-btn">Search</button>
                        <div id="deckard-search-results"></div>
                    </div>
                </div>
            `;

            this.setupEvents();
            document.body.appendChild(this.popup);
        }

        createLicensesSection() {
            let html = '<div class="deckard-section">';
            if (this.listLicenses.length > 0) {
                html += `<strong>Licenses:</strong> ${this.listLicenses.join(', ')}</div>`;
            } else {
                html += 'No licenses found</div>';
            }
            return html;
        }

        handleSearch() {
            const input = this.popup.querySelector('#deckard-search-input').value.trim();
            const results = this.popup.querySelector('#deckard-search-results');
            results.innerHTML = '';

            if (!input) return;

            // Search by APN
            if (/^\d+$/.test(input)) {
                const apnData = this.jsonData[input];
                if (!apnData) {
                    results.innerHTML = 'No data found for this APN';
                    return;
                }

                let html = `<div><strong>APN ${input}:</strong></div>`;
                for (const [license, units] of Object.entries(apnData)) {
                    html += `
                        <div style="margin-top:5px;">
                            <div>${license}:</div>
                            <div>${units.map(u => `<span class="deckard-unit">${u}</span>`).join('')}</div>
                        </div>
                    `;
                }
                results.innerHTML = html;
            } 
            // Search by license
            else {
                const normalizedSearch = utils.normalizeLicense(input);
                let found = false;
                let html = '';

                for (const [apn, licenses] of Object.entries(this.jsonData)) {
                    for (const [license, units] of Object.entries(licenses)) {
                        if (utils.normalizeLicense(license).includes(normalizedSearch)) {
                            found = true;
                            html += `
                                <div style="margin-top:5px;">
                                    <div><strong>${apn}</strong> - ${license}:</div>
                                    <div>${units.map(u => `<span class="deckard-unit">${u}</span>`).join('')}</div>
                                </div>
                            `;
                        }
                    }
                }

                results.innerHTML = found ? html : 'No matching licenses found';
            }
        }

        setupEvents() {
            // Close button
            this.popup.querySelector('.deckard-close').addEventListener('click', () => {
                this.popup.remove();
            });

            // Search button
            this.popup.querySelector('#deckard-search-btn').addEventListener('click', () => {
                this.handleSearch();
            });

            // Search on Enter
            this.popup.querySelector('#deckard-search-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });

            // Unit highlighting
            this.popup.addEventListener('click', (e) => {
                if (e.target.classList.contains('deckard-unit')) {
                    e.target.classList.toggle('highlighted');
                }
            });
        }
    }

    // Main process function with data check
    function processData(apn, sheetName, licenses) {
        return new Promise((resolve) => {
            const jsonUrl = `https://dinfcs.github.io/Deckardaov/DeckardScripts/Licenses/${encodeURIComponent(sheetName)}.json`;

            fetch(jsonUrl)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(jsonData => {
                    // Check if there's any data for this sheet
                    if (!jsonData.data || Object.keys(jsonData.data).length === 0) {
                        console.log(`No data available for sheet: ${sheetName}`);
                        resolve(false);
                        return;
                    }

                    // Check if there's data for this specific APN
                    if (!jsonData.data[apn]) {
                        console.log(`No data available for APN: ${apn}`);
                        resolve(false);
                        return;
                    }

                    new DeckardUI(apn, sheetName, licenses, jsonData.data || {}, licenses);
                    resolve(true);
                })
                .catch(error => {
                    console.log('Data loading failed:', error.message);
                    resolve(false);
                });
        });
    }

    // Initialization with data check
    async function init() {
        const apn = utils.extractAPN();
        const sheet = utils.extractSheetName();
        const licenses = utils.extractLicenses();

        if (apn && sheet && licenses?.length) {
            return await processData(apn, sheet, licenses);
        }
        return false;
    }

    // Run on page load with data verification
    init().then(initialized => {
        if (!initialized) {
            const observer = new MutationObserver(async () => {
                const success = await init();
                if (success) observer.disconnect();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });

    // Restart script function
    function restartScript() {
        setTimeout(() => {
            init().then(initialized => {
                if (!initialized) {
                    new MutationObserver(async () => {
                        const success = await init();
                        if (success) this.disconnect();
                    }).observe(document.body, { childList: true, subtree: true });
                }
            });
        }, 1000);
    }

    // Set up observers for edit/save buttons
    function setupButtonObservers() {
        const handleButtonClick = (e) => {
            if (e.target.matches('#btn_open_vetting_dlg, #btn_submit_vetting_dlg')) {
                restartScript();
            }
        };

        document.body.addEventListener('click', handleButtonClick);

        const buttonObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const editBtn = node.querySelector('#btn_open_vetting_dlg');
                        const saveBtn = node.querySelector('#btn_submit_vetting_dlg');

                        if (editBtn) editBtn.addEventListener('click', restartScript);
                        if (saveBtn) saveBtn.addEventListener('click', restartScript);
                    }
                });
            });
        });

        buttonObserver.observe(document.body, { childList: true, subtree: true });
    }

    setupButtonObservers();
})();
