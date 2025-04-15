// ==UserScript==
// @name         License Validator with Manual Search
// @namespace    http://tampermonkey.net/
// @version      3.4
// @description  Valida licencias, saca alerta cuando la unidad es diferente o no esta y deja buscar manualmente apn y licencias en la base de datos
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

        .deckard-alert.warning {
            background: #e53935;
        }

        .deckard-alert.notice {
            background: #ff9800;
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

        .deckard-search-result {
            margin-bottom: 8px;
            padding: 8px;
            background: #f5f7f9;
            border-radius: 6px;
            border-left: 3px solid #00AEEF;
        }

        .deckard-search-result strong {
            color: #00AEEF;
        }

        @keyframes slideIn {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
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
            if (inputEl) {
                const inputApn = inputEl.value.match(/\d+/)?.[0];
                if (inputApn) return inputApn;
            }

            return null;
        },

        extractSheetName: () => {
            const path = window.location.pathname;
            const match = path.match(/\/listing\/([^\/]+)\/([^\/]+)\/([^\/]+)\//);

            if (!match) {
                console.error("No se pudo extraer el nombre de la hoja de la URL:", path);
                return null;
            }

            const state = match[1].toLowerCase();
            const county = match[2].toLowerCase();
            const city = match[3].toLowerCase();

            let sheetName;
            if (city === '_') {
                sheetName = `${state}-${county}-str-licenses`;
            } else {
                sheetName = `${state}-${county}-${city.replace(/\s+/g, '_')}-str-licenses`;
            }

            console.log("URL analizada:", path);
            console.log("Componentes extraídos:", {state, county, city});
            console.log("Nombre de hoja construido:", sheetName);

            return sheetName;
        },

        extractLicenses: () => {
            const el = document.querySelector('td.value[data-field-name="probable_licenses"]');
            return el?.textContent.trim().split(',').map(l => l.trim()).filter(l => l);
        },

        extractCurrentUnit: () => {
            const unitEl = document.querySelector('td.value[data-field-name="unit_number"] p');
            if (unitEl) {
                // Extrae solo el texto antes del <em> (la unidad real)
                const unitText = unitEl.childNodes[0]?.textContent || '';
                const unitMatch = unitText.match(/^\s*(\S+)/);
                return unitMatch ? unitMatch[1].trim() : null;
            }

            const inputEl = document.querySelector('input[name="unit_number"], input[id*="unit_number"]');
            return inputEl ? inputEl.value.trim() : null;
        },

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

        showAlert: (message, isWarning = true) => {
            document.querySelectorAll('.deckard-alert').forEach(el => el.remove());

            const alert = document.createElement('div');
            alert.className = `deckard-alert ${isWarning ? 'warning' : 'notice'}`;
            alert.innerHTML = `
                <div class="deckard-alert-header">
                    <span>⚠️ ${isWarning ? 'Warning' : 'Notice'}</span>
                    <span class="deckard-alert-close">×</span>
                </div>
                <div class="deckard-alert-content">
                    <p>${message}</p>
                </div>
                <div class="deckard-alert-actions">
                    <button class="deckard-alert-button">Understood</button>
                </div>
            `;

            const closeAlert = () => alert.remove();
            alert.querySelector('.deckard-alert-close').addEventListener('click', closeAlert);
            alert.querySelector('.deckard-alert-button').addEventListener('click', closeAlert);

            document.body.appendChild(alert);
            setTimeout(closeAlert, 10000);
        },

        showNoUnitAlert: (expectedUnits) => {
            utils.showAlert(
                `No unit number was added to this listing, but the license has associated units: <strong>${expectedUnits.join(', ')}</strong>`,
                true
            );
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

        getExpectedUnits() {
            const units = new Set();
            this.licensesData.forEach(data => {
                if (this.listLicenses.includes(data.license) && data.units) {
                    data.units.forEach(unit => units.add(unit));
                }
            });
            return Array.from(units);
        }

        checkUnitMismatch() {
            const currentUnit = utils.extractCurrentUnit();
            const unitFieldExists = document.querySelector('td.value[data-field-name="unit_number"]') !== null ||
                                  document.querySelector('input[name="unit_number"], input[id*="unit_number"]') !== null;

            // Case 1: No unit field in DOM (unit not added to listing)
            if (!unitFieldExists && this.expectedUnits.length > 0) {
                utils.showNoUnitAlert(this.expectedUnits);
                return true;
            }

            // Case 2: Unit field exists but is empty
            if (unitFieldExists && !currentUnit && this.expectedUnits.length > 0) {
                utils.showNoUnitAlert(this.expectedUnits);
                return true;
            }

            // Case 3: Unit exists but doesn't match expected units
            if (currentUnit && this.expectedUnits.length > 0 && !this.expectedUnits.includes(currentUnit)) {
                utils.showAlert(
                    `Current unit "<strong>${currentUnit}</strong>" doesn't match expected units for listed licenses: <strong>${this.expectedUnits.join(', ')}</strong>`,
                    true
                );
                return true;
            }

            return false;
        }

        show() {
            document.querySelector('.deckard-popup')?.remove();

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

                    <div class="deckard-section" style="margin-top: 15px;">
                        <div class="deckard-section-title">MANUAL SEARCH</div>
                        <input type="text" id="deckard-manual-search" placeholder="Enter APN or License"
                               style="width: 100%; padding: 6px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 5px;">
                        <button id="deckard-search-btn" style="width: 100%; padding: 6px; background: #00AEEF; color: white;
                               border: none; border-radius: 4px; cursor: pointer;">Search</button>
                        <div id="deckard-search-results" style="margin-top: 8px;"></div>
                    </div>
                </div>
            `;

            this.initTabs();
            this.setupEvents();
            this.showFloatingUnits();
            document.body.appendChild(this.popup);
        }

        handleManualSearch(searchTerm) {
            const resultsContainer = this.popup.querySelector('#deckard-search-results');
            resultsContainer.innerHTML = '';

            if (!searchTerm) return;

            const normalizedSearch = searchTerm.trim().toUpperCase();

            // Search by APN
            if (/^\d+$/.test(normalizedSearch)) {
                const apnData = this.jsonData[normalizedSearch];
                if (!apnData) {
                    resultsContainer.innerHTML = '<div style="color:#d32f2f;">No data found for APN: ' + normalizedSearch + '</div>';
                    return;
                }

                let html = '<div style="margin-bottom:10px;"><strong>APN:</strong> ' + normalizedSearch + '</div>';

                Object.entries(apnData).forEach(([license, units]) => {
                    html += `
                        <div class="deckard-section" style="margin-bottom:8px;">
                            <div><strong>License:</strong> ${license}</div>
                            <div style="margin-top:4px;">
                                ${units.length ?
                                    units.map(u => `<span class="deckard-unit">${u}</span>`).join('') :
                                    '<span style="color:#999;">No units associated</span>'}
                            </div>
                        </div>
                    `;
                });

                resultsContainer.innerHTML = html;
            }
            // Search by license
            else {
                let found = false;
                let html = '<div style="margin-bottom:10px;"><strong>Search results for:</strong> ' + normalizedSearch + '</div>';

                Object.entries(this.jsonData).forEach(([apn, licenses]) => {
                    Object.entries(licenses).forEach(([license, units]) => {
                        if (utils.normalizeLicense(license).includes(utils.normalizeLicense(normalizedSearch))) {
                            found = true;
                            html += `
                                <div class="deckard-section" style="margin-bottom:8px;">
                                    <div><strong>APN:</strong> ${apn}</div>
                                    <div><strong>License:</strong> ${license}</div>
                                    <div style="margin-top:4px;">
                                        ${units.length ?
                                            units.map(u => `<span class="deckard-unit">${u}</span>`).join('') :
                                            '<span style="color:#999;">No units associated</span>'}
                                    </div>
                                </div>
                            `;
                        }
                    });
                });

                if (!found) {
                    html += '<div style="color:#d32f2f;">No licenses found matching: ' + normalizedSearch + '</div>';
                }

                resultsContainer.innerHTML = html;
            }
        }

        initTabs() {
            const tabContent = this.popup.querySelector('#deckard-tab-content');
            const currentUnit = utils.extractCurrentUnit();

            // Licenses tab content
            const licensesContent = document.createElement('div');
            this.licensesData.forEach(data => {
                const section = document.createElement('div');
                section.className = 'deckard-section';

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

            tabContent.appendChild(licensesContent);
            this.licensesContent = licensesContent;
            this.unitsContent = unitsContent;
        }

        setupEvents() {
            const tabContent = this.popup.querySelector('#deckard-tab-content');

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

                    this.showFloatingUnits();
                });
            });

            this.popup.addEventListener('click', e => {
                if (e.target.classList.contains('deckard-unit')) {
                    const unit = e.target.textContent.split(' ')[0];

                    document.querySelectorAll('.deckard-highlight').forEach(el => {
                        if (el.textContent === unit) el.replaceWith(unit);
                    });

                    if (!e.target.classList.contains('highlighted')) {
                        utils.highlightText(unit);
                        e.target.classList.add('highlighted');
                    } else {
                        e.target.classList.remove('highlighted');
                    }
                }
            });

            this.popup.querySelector('.deckard-close').addEventListener('click', () => {
                document.querySelectorAll('.deckard-unit-floating-container').forEach(el => el.remove());
                document.querySelectorAll('.deckard-highlight').forEach(el => {
                    el.replaceWith(document.createTextNode(el.textContent));
                });
                this.popup.remove();
            });

            document.addEventListener('click', e => {
                if (e.target.classList.contains('deckard-unit-floating')) {
                    const unitInput = document.querySelector('input[name="unit_number"], input[id*="unit_number"]');
                    if (unitInput) {
                        unitInput.value = e.target.textContent;
                        unitInput.focus();
                        const event = new Event('input', { bubbles: true });
                        unitInput.dispatchEvent(event);
                    }
                }
            });

            // Manual search events
            this.popup.querySelector('#deckard-search-btn').addEventListener('click', () => {
                const searchInput = this.popup.querySelector('#deckard-manual-search');
                this.handleManualSearch(searchInput.value);
            });

            this.popup.querySelector('#deckard-manual-search').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleManualSearch(e.target.value);
                }
            });
        }

        showFloatingUnits() {
            const unitInput = document.querySelector('input[name="unit_number"], input[id*="unit_number"]');
            if (!unitInput) return;

            document.querySelectorAll('.deckard-unit-floating-container').forEach(el => el.remove());

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

    function restartScript() {
        setTimeout(() => {
            init() || new MutationObserver(() => {
                if (init()) this.disconnect();
            }).observe(document.body, { childList: true, subtree: true });
        }, 1000);
    }

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

    function processData(apn, sheetName, licenses) {
        const jsonUrl = `https://dinfcs.github.io/Deckardaov/DeckardScripts/Licenses/${encodeURIComponent(sheetName)}.json`;

        fetch(jsonUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error('No data found for this sheet');
                }
                return res.json();
            })
            .then(jsonData => {
                // Check if there's any data for the current APN
                if (!jsonData.data || !jsonData.data[apn]) {
                    console.log('No data found for APN:', apn);
                    return;
                }

                const licensesData = licenses.map(license => {
                    const normalized = utils.normalizeLicense(license);
                    let units = jsonData.data[apn][license] || [];
                    let foundWithOriginal = true;

                    if (!units.length) {
                        const normalizedKey = Object.keys(jsonData.data[apn] || {})
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
            .catch(error => {
                console.log('Error loading JSON data:', error.message);
            });
    }

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

    if (!init()) {
        const observer = new MutationObserver(() => {
            if (init()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function setupUnitChangeMonitoring() {
        const unitObserver = new MutationObserver(() => {
            const popup = document.querySelector('.deckard-popup');
            if (popup) {
                const ui = new DeckardUI(
                    popup.querySelector('.deckard-header span').textContent.replace('Licenses for APN: ', ''),
                    utils.extractSheetName(),
                    [],
                    {},
                    utils.extractLicenses() || []
                );
                ui.checkUnitMismatch();
            }
        });

        const unitContainer = document.querySelector('td.value[data-field-name="unit_number"]');
        if (unitContainer) {
            unitObserver.observe(unitContainer, { childList: true, subtree: true, characterData: true });
        }
    }

    setupButtonObservers();
    setupUnitChangeMonitoring();
})();
