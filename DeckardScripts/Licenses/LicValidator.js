// ==UserScript==
// @name         Deckard License Validator (Optimized with Alerts)
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  License validator with unit discrepancy alerts
// @match        *://*/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Improved styles with alert additions
    const style = document.createElement('style');
style.textContent = `
    .deckard-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-family: 'Segoe UI', sans-serif;
        font-size: 13px;
        color: #333;
        max-height: 70vh;
        overflow: hidden;
        z-index: 100;
    }

    .deckard-header {
        background: #00AEEF;
        color: white;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 500;
        font-size: 13px;
        border-radius: 8px 8px 0 0;
    }

    .deckard-close {
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 2px 6px;
        border-radius: 4px;
        transition: background 0.2s;
    }

    .deckard-close:hover {
        background: rgba(255,255,255,0.2);
    }

    .deckard-content {
        padding: 10px;
        overflow-y: auto;
        max-height: calc(70vh - 42px);
    }

    .deckard-section {
        background: #f5f7f9;
        padding: 8px;
        border-radius: 6px;
        margin-bottom: 8px;
        border-left: 3px solid #00AEEF;
    }

    .deckard-unit {
        display: inline-block;
        padding: 3px 6px;
        margin: 2px 4px 2px 0;
        font-size: 11px;
        background: #e1f5fe;
        border-radius: 3px;
        cursor: pointer;
        transition: background 0.2s;
    }

    .deckard-unit:hover {
        background: #b3e5fc;
    }

    .deckard-unit.unk {
        background: #eee;
        color: #777;
    }

    .deckard-unit.highlighted {
        background: #D1E231;
        color: #000;
    }

    .deckard-tabs {
        display: flex;
        border-bottom: 1px solid #ddd;
        margin-bottom: 10px;
    }

    .deckard-tab {
        flex: 1;
        padding: 6px;
        text-align: center;
        cursor: pointer;
        font-size: 12px;
        background: #f0f0f0;
        border-radius: 4px 4px 0 0;
        opacity: 0.8;
        transition: all 0.2s;
    }

    .deckard-tab:hover {
        opacity: 1;
        background: #e0e0e0;
    }

    .deckard-tab.active {
        background: #00AEEF;
        color: white;
        opacity: 1;
    }

    .deckard-unit-floating {
        display: inline-block;
        background: #ef2800;
        color: white;
        padding: 2px 80px;
        border-radius: 4px;
        font-size: 15px;
        margin: 1px;

        transition: background 0.2s;
    }

    .deckard-unit-floating:hover {
        background: #0095d9;
    }

    .deckard-list-licenses {
        font-size: 11px;
        padding: 6px;
        background: #f0f8ff;
        border-left: 3px solid #D1E231;
        border-radius: 4px;
        margin-bottom: 8px;
        line-height: 1.4;
    }

    .deckard-alert {
        position: fixed;
        top: 15px;
        right: 15px;
        background: #e53935;
        color: white;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 12px;
        max-width: 220px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    }

    .deckard-alert-close {
        font-size: 14px;
        cursor: pointer;
        float: right;
    }

    .deckard-alert-button {
        background: #D1E231;
        color: #000;
        padding: 4px 6px;
        font-size: 11px;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        margin-left: 4px;
    }

    .deckard-alert-button:hover {
        background: #c1d420;
    }

    .deckard-section-title {
        font-size: 11px;
        color: #A7A9AC;
        margin-bottom: 4px;
        font-weight: bold;
    }

    @keyframes slideIn {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;

    document.head.appendChild(style);

    // Utility functions
    const utils = {
        // Normalize license by removing separators and converting to uppercase
        normalizeLicense: license => license.replace(/[- ._]/g, '').toUpperCase(),

        // Extract APN from page
        extractAPN: () => {
            const tdEl = document.querySelector('td.value[data-field-name="apn"] p');
            const tdApn = tdEl ? tdEl.textContent.match(/^\d+/)?.[0] : null;

            if (tdApn) return tdApn;

            const inputEl = document.querySelector('input[name="apn"], input[id*="apn"]');
            if (inputEl) {
                const inputApn = inputEl.value.match(/\d+/)?.[0];
                if (inputApn) return inputApn;
            }

            return null;
        },

        // Extract sheet name
        extractSheetName: () => {
            const el = document.querySelector('td[style*="font-weight: 600; cursor: pointer;"]');
            return el?.textContent.trim();
        },

        // Extract licenses
        extractLicenses: () => {
            const el = document.querySelector('td.value[data-field-name="probable_licenses"]');
            return el?.textContent.trim().split(',').map(l => l.trim()).filter(l => l);
        },

        // Extract current unit number
        extractCurrentUnit: () => {
            const unitEl = document.querySelector('td.value[data-field-name="unit_number"] p');
            if (unitEl) {
                // Extract only the unit number, ignoring additional text like "(edited by...)"
                const unitMatch = unitEl.textContent.match(/^\s*(\d+)/);
                return unitMatch ? unitMatch[1].trim() : null;
            }

            const inputEl = document.querySelector('input[name="unit_number"], input[id*="unit_number"]');
            return inputEl ? inputEl.value.trim() : null;
        },

        // Highlight text on page
        highlightText: (text) => {
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: node =>
                        !node.parentElement.closest('.deckard-popup') &&
                        !node.parentElement.closest('.deckard-alert') &&
                        !['SCRIPT', 'STYLE'].includes(node.parentElement.tagName) ?
                        NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
                }
            );

            while (walker.nextNode()) {
                const node = walker.currentNode;
                if (node.nodeValue.includes(text)) {
                    const span = document.createElement('span');
                    span.className = 'deckard-highlight';
                    span.textContent = text;

                    const parts = node.nodeValue.split(text);
                    const fragment = document.createDocumentFragment();

                    parts.forEach((part, i) => {
                        fragment.appendChild(document.createTextNode(part));
                        if (i < parts.length - 1) fragment.appendChild(span.cloneNode(true));
                    });

                    node.parentNode.replaceChild(fragment, node);
                }
            }
        },

        // Show discrepancy alert
        showAlert: (currentUnit, expectedUnits) => {
            // Remove previous alerts
            document.querySelectorAll('.deckard-alert').forEach(el => el.remove());

            const alert = document.createElement('div');
            alert.className = 'deckard-alert';
            alert.innerHTML = `
                <div class="deckard-alert-header">
                    <span>⚠️ Unit discrepancy</span>
                    <span class="deckard-alert-close">×</span>
                </div>
                <div class="deckard-alert-content">
                    <p>Current unit "<strong>${currentUnit}</strong>" doesn't match expected units for listed licenses:</p>
                    <p><strong>${expectedUnits.join(', ')}</strong></p>
                </div>
                <div class="deckard-alert-actions">
                    <button class="deckard-alert-button">Understood</button>
                </div>
            `;

            // Events to close alert
            const closeAlert = () => alert.remove();
            alert.querySelector('.deckard-alert-close').addEventListener('click', closeAlert);
            alert.querySelector('.deckard-alert-button').addEventListener('click', closeAlert);

            document.body.appendChild(alert);

            // Auto-close after 10 seconds
            setTimeout(closeAlert, 10000);
        }
    };

    // Main UI component
    class DeckardUI {
        constructor(apn, sheetName, licensesData, jsonData, listLicenses) {
            this.apn = apn;
            this.sheetName = sheetName;
            this.licensesData = licensesData;
            this.jsonData = jsonData;
            this.listLicenses = listLicenses || [];
            this.popup = null;
            this.expectedUnits = this.getExpectedUnits();
        }

        // Get expected units for listed licenses
        getExpectedUnits() {
            const units = new Set();
            this.licensesData.forEach(data => {
                if (this.listLicenses.includes(data.license) && data.units) {
                    data.units.forEach(unit => units.add(unit));
                }
            });
            return Array.from(units);
        }

        // Check for unit discrepancy
        checkUnitMismatch() {
            const currentUnit = utils.extractCurrentUnit();

            // If no current unit or no expected units, do nothing
            if (!currentUnit || this.expectedUnits.length === 0) return false;

            // If current unit doesn't match expected units, show alert
            if (!this.expectedUnits.includes(currentUnit)) {
                utils.showAlert(currentUnit, this.expectedUnits);
                return true;
            }

            return false;
        }

        // Create and show popup
        show() {
            // Remove previous window if exists
            document.querySelector('.deckard-popup')?.remove();

            // Check for unit discrepancy
            const hasMismatch = this.checkUnitMismatch();

            const listLicensesText = this.listLicenses.length > 0 ?
                `<div class="deckard-list-licenses ${hasMismatch ? 'deckard-mismatch' : ''}">
                    Listed licenses: ${this.listLicenses.join(', ')}
                    ${hasMismatch ? '<div style="margin-top:5px;font-size:11px;color:#d32f2f;"><strong>Alert!</strong> Current unit doesn\'t match expected units</div>' : ''}
                </div>` : '';

            this.popup = document.createElement('div');
            this.popup.className = 'deckard-popup';
            this.popup.innerHTML = `
                <div class="deckard-header">
                    <span>Licenses for APN: ${this.apn}</span>
                    <span class="deckard-close">×</span>
                </div>
                <div class="deckard-content">
                    ${listLicensesText}
                    <div class="deckard-tabs">
                        <div class="deckard-tab active" data-tab="licenses">Licenses</div>
                        <div class="deckard-tab" data-tab="units">Units</div>
                    </div>
                    <div id="deckard-tab-content"></div>
                </div>
            `;

            // Initialize tabs
            this.initTabs();

            // Set up events
            this.setupEvents();

            // Show floating units
            this.showFloatingUnits();

            document.body.appendChild(this.popup);
        }

        // Initialize tab content
        initTabs() {
            const tabContent = this.popup.querySelector('#deckard-tab-content');
            const currentUnit = utils.extractCurrentUnit();

            // Licenses tab content
            const licensesContent = document.createElement('div');
            this.licensesData.forEach(data => {
                const section = document.createElement('div');
                section.className = 'deckard-section';

                // Check if this license is in the list and has unit discrepancy
                const isInList = this.listLicenses.includes(data.license);
                const hasUnitMismatch = isInList && currentUnit &&
                                      data.units && !data.units.includes(currentUnit);

                section.innerHTML = `
                    <div class="deckard-license">
                        ${data.license}
                        ${!data.foundWithOriginal ? '<span style="color:#888;font-size:0.8em;">-></span>' : ''}
                        ${isInList ? '<span style="color:#0073aa;font-size:0.8em;margin-left:5px;">(in list)</span>' : ''}
                        ${hasUnitMismatch ? '<span style="color:#d32f2f;font-size:0.8em;margin-left:5px;">⚠️ Doesn\'t match</span>' : ''}
                    </div>
                    ${data.units?.length ?
                        data.units.map(u => {
                            const isCurrentUnit = u === currentUnit;
                            return `<span class="deckard-unit ${isCurrentUnit ? 'highlighted' : ''}"
                                  style="${isCurrentUnit ? 'border:2px solid #4caf50;' : ''}">${u}</span>`;
                        }).join('') :
                        '<span style="color:#999;font-style:italic">No associated units</span>'}
                `;
                licensesContent.appendChild(section);
            });

            // Units tab content
            const unitsMap = new Map();
            if (this.jsonData[this.apn]) {
                Object.entries(this.jsonData[this.apn]).forEach(([license, units]) => {
                    units.forEach(unit => {
                        if (!unitsMap.has(unit)) unitsMap.set(unit, []);
                        unitsMap.get(unit).push(license);
                    });
                });
            }

            const unitsContent = document.createElement('div');
            Array.from(unitsMap.entries()).sort().forEach(([unit, licenses]) => {
                const isCurrentUnit = unit === currentUnit;
                const unitsInList = licenses.filter(license => this.listLicenses.includes(license));
                const isInListLicenses = unitsInList.length > 0;

                unitsContent.innerHTML += `
                    <div style="margin-bottom:8px;padding:8px;background:#f9f9f9;border-radius:6px;
                         ${isCurrentUnit ? 'border:2px solid #4caf50;' : ''}
                         ${isInListLicenses ? 'background:#e3f2fd;' : ''}">
                        <span class="deckard-unit ${licenses.length ? '' : 'unk'} ${isCurrentUnit ? 'highlighted' : ''}">
                            ${unit}
                            ${isCurrentUnit ? ' (current unit)' : ''}
                            ${isInListLicenses ? ' (in listed licenses)' : ''}
                        </span>
                        ${licenses.length ? `
                            <div style="font-size:11px;margin-top:4px;color:#666;">
                                ${licenses.map(l => this.listLicenses.includes(l) ?
                                    `<strong style="color:#0073aa">${l}</strong>` : l).join(', ')}
                            </div>` : ''}
                    </div>
                `;
            });

            // Show licenses tab by default
            tabContent.appendChild(licensesContent);

            // Save references for tab switching
            this.licensesContent = licensesContent;
            this.unitsContent = unitsContent;
        }

        // Set up events
        setupEvents() {
            const tabContent = this.popup.querySelector('#deckard-tab-content');

            // Tab events
            this.popup.querySelectorAll('.deckard-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.popup.querySelectorAll('.deckard-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');

                    tabContent.innerHTML = '';
                    if (tab.dataset.tab === 'licenses') {
                        tabContent.appendChild(this.licensesContent);
                    } else {
                        tabContent.appendChild(this.unitsContent);
                    }

                    // Update floating units when switching tabs
                    this.showFloatingUnits();
                });
            });

            // Unit highlighting event
            this.popup.addEventListener('click', e => {
                if (e.target.classList.contains('deckard-unit')) {
                    const unit = e.target.textContent.split(' ')[0]; // Only take the unit part

                    // Remove previous highlighting
                    document.querySelectorAll('.deckard-highlight').forEach(el => {
                        if (el.textContent === unit) el.replaceWith(unit);
                    });

                    // Toggle highlighting
                    if (!e.target.classList.contains('highlighted')) {
                        utils.highlightText(unit);
                        e.target.classList.add('highlighted');
                    } else {
                        e.target.classList.remove('highlighted');
                    }
                }
            });

            // Close popup event
            this.popup.querySelector('.deckard-close').addEventListener('click', () => {
                // Clear floating units
                document.querySelectorAll('.deckard-unit-floating-container').forEach(el => el.remove());
                // Remove highlights
                document.querySelectorAll('.deckard-highlight').forEach(el => {
                    el.replaceWith(document.createTextNode(el.textContent));
                });
                this.popup.remove();
            });

            // Floating units event
            document.addEventListener('click', e => {
                if (e.target.classList.contains('deckard-unit-floating')) {
                    const unitInput = document.querySelector('input[name="unit_number"], input[id*="unit_number"]');
                    if (unitInput) {
                        unitInput.value = e.target.textContent;
                        unitInput.focus();

                        // Simulate input to trigger any onChange events
                        const event = new Event('input', { bubbles: true });
                        unitInput.dispatchEvent(event);
                    }
                }
            });
        }

        // Show floating units next to input
        showFloatingUnits() {
            const unitInput = document.querySelector('input[name="unit_number"], input[id*="unit_number"]');
            if (!unitInput) return;

            // Remove previous floating units
            document.querySelectorAll('.deckard-unit-floating-container').forEach(el => el.remove());

            // Show expected units for listed licenses
            if (this.expectedUnits.length > 0) {
                const container = document.createElement('div');
                container.className = 'deckard-unit-floating-container';

                const title = document.createElement('span');
                title.className = 'deckard-unit-floating-title';
                title.innerHTML = '<span style="font-weight: bold; color: red;">Suggested units:</span>';
                container.appendChild(title);

                this.expectedUnits.sort().forEach(unit => {
                    const unitTag = document.createElement('span');
                    unitTag.className = 'deckard-unit-floating';
                    unitTag.textContent = unit;
                    container.appendChild(unitTag);
                });

                unitInput.parentNode.insertBefore(container, unitInput.nextSibling);
            }
        }
    }


    // Function to completely restart the script
function restartScript() {
    // Clean up everything existing

    // Run again after 0.5 seconds
    setTimeout(() => {
        init() || new MutationObserver(() => {
            if (init()) this.disconnect();
        }).observe(document.body, { childList: true, subtree: true });
    }, 1000);
}

// Set up observers for edit/save buttons
function setupButtonObservers() {
    const handleButtonClick = (e) => {
        if (e.target.matches('#btn_open_vetting_dlg, #btn_submit_vetting_dlg')) {
            restartScript();
        }
    };

    // Use event delegation for dynamic clicks
    document.body.addEventListener('click', handleButtonClick);

    // Also observe DOM changes in case buttons appear later
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

// Set up button observers on load
setupButtonObservers();
    // Main function to process data
    function processData(apn, sheetName, licenses) {
        const jsonUrl = `https://dinfcs.github.io/Deckardaov/DeckardScripts/Licenses/${encodeURIComponent(sheetName)}.json`;

        fetch(jsonUrl)
            .then(res => res.json())
            .then(jsonData => {
                const licensesData = licenses.map(license => {
                    const normalized = utils.normalizeLicense(license);
                    let units = jsonData.data?.[apn]?.[license] || [];
                    let foundWithOriginal = true;

                    // Search by normalized license if not found directly
                    if (!units.length) {
                        const normalizedKey = Object.keys(jsonData.data?.[apn] || {})
                            .find(k => utils.normalizeLicense(k) === normalized);
                        if (normalizedKey) {
                            units = jsonData.data[apn][normalizedKey];
                            foundWithOriginal = false;
                        }
                    }

                    return { license, units, foundWithOriginal };
                });

                new DeckardUI(apn, sheetName, licensesData, jsonData.data || {}, licenses).show();
            })
            .catch(() => {
                // Show interface even if data loading fails
                new DeckardUI(
                    apn,
                    sheetName,
                    licenses.map(license => ({ license, units: null, foundWithOriginal: false })),
                    {},
                    licenses
                ).show();
            });
    }

    // Automatic initialization
    function init() {
        const apn = utils.extractAPN();
        const sheet = utils.extractSheetName();
        const licenses = utils.extractLicenses();

        if (apn && sheet && licenses?.length) {
            processData(apn, sheet, licenses);
            return true;
        }
        return false;
    }

    // Run initialization
    if (!init()) {
        const observer = new MutationObserver(() => {
            if (init()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Monitor unit field changes to check for discrepancies
    function setupUnitChangeMonitoring() {
        // Observe DOM changes that might affect the unit field
        const unitObserver = new MutationObserver(() => {
            const popup = document.querySelector('.deckard-popup');
            if (popup) {
                // There's an active popup, update the check
                const ui = new DeckardUI(
                    popup.querySelector('.deckard-header span').textContent.replace('Licenses for APN: ', ''),
                    utils.extractSheetName(),
                    [], // Will be filled when recreating the interface
                    {},
                    utils.extractLicenses() || []
                );
                ui.checkUnitMismatch();
            }
        });

        // Observe the container that likely contains the unit field
        const unitContainer = document.querySelector('td.value[data-field-name="unit_number"]');
        if (unitContainer) {
            unitObserver.observe(unitContainer, { childList: true, subtree: true, characterData: true });
        }
    }

    // Set up unit change monitoring
    setupUnitChangeMonitoring();
})();
