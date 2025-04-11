// ==UserScript==
// @name         Deckard License Validator funcional
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Validador simple de licencias
// @match        *://*/*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    // Estilos mínimos
    const style = document.createElement('style');
    style.textContent = `
        .deckard-popup {
            position: fixed;
            top: 60%;
            right: 20px;
            width: 350px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 9999;
            font-family: Arial, sans-serif;
            max-height: 80vh;
            overflow: auto;
        }
        .deckard-header {
            background: #0073aa;
            color: white;
            padding: 10px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
        }
        .deckard-close {
            cursor: pointer;
        }
        .deckard-content {
            padding: 10px;
        }
        .deckard-section {
            margin-bottom: 15px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
        }
        .deckard-unit {
            display: inline-block;
            padding: 3px 6px;
            margin: 2px;
            background: #e3f2fd;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
        }
        .deckard-unit.unk {
            background: #f0f0f0;
            color: #777;
        }
        .deckard-highlight {
            background: yellow;
        }
        .deckard-license {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .deckard-tabs {
            display: flex;
            margin-bottom: 10px;
        }
        .deckard-tab {
            padding: 5px 10px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
        }
        .deckard-tab.active {
            border-bottom-color: #0073aa;
            font-weight: bold;
        }
        .deckard-unit-floating-container {
            display: block;
            margin-top: 5px;
        }
        .deckard-unit-floating-title {
            display: inline-block;
            margin-right: 8px;
            font-size: 12px;
            color: #666;
            vertical-align: middle;
        }
        .deckard-unit-floating {
            display: inline-block;
            padding: 4px 8px;
            margin: 0 3px 3px 0;
            background: #0073aa;
            color: white;
            border-radius: 12px;
            font-size: 12px;
            cursor: default;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        }
        .deckard-unit-floating:hover {
            background: #005d8f;
            transform: translateY(-1px);
            box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        .deckard-unit-floating:active {
            transform: translateY(1px);
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);

    function normalizeLicense(license) {
        return license.replace(/[- ._]/g, '').toUpperCase();
    }

    function extractAPN() {
        // Primero intenta obtenerlo del td.value
        const tdEl = document.querySelector('td.value[data-field-name="apn"] p');
        const tdApn = tdEl ? tdEl.textContent.match(/^\d+/)?.[0] : null;

        if (tdApn) return tdApn;

        // Si no está en el td, busca en el input
        const inputEl = document.querySelector('input[name="apn"], input[id*="apn"]');
        if (inputEl) {
            // Extrae solo los dígitos del valor del input
            const inputApn = inputEl.value.match(/\d+/)?.[0];
            if (inputApn) return inputApn;
        }

        return null;
    }

    function extractSheetName() {
        const el = document.querySelector('td[style*="font-weight: 600; cursor: pointer;"]');
        return el?.textContent.trim();
    }

    function extractLicenses() {
        const el = document.querySelector('td.value[data-field-name="probable_licenses"]');
        return el?.textContent.trim().split(',').map(l => l.trim()).filter(l => l);
    }

    function showResults(apn, sheetName, licensesData, jsonData) {
        // Obtener las licencias del listado (del campo probable_licenses)
        const listLicenses = extractLicenses() || [];
        const listLicensesText = listLicenses.length > 0 ?
            `Licencia del listado: ${listLicenses.join(', ')}` : '';

        const popup = document.createElement('div');
        popup.className = 'deckard-popup';
        popup.innerHTML = `
            <div class="deckard-header">
                <span>Licencias para APN: ${apn}</span>
                <span class="deckard-close">×</span>
            </div>
            <div class="deckard-content">
                ${listLicensesText ? `<div style="padding:10px;border-bottom:1px solid #eee;font-size:13px;">${listLicensesText}</div>` : ''}
                <div class="deckard-tabs">
                    <div class="deckard-tab active" data-tab="licenses">Licencias</div>
                    <div class="deckard-tab" data-tab="units">Unidades</div>
                </div>
                <div id="deckard-tab-content"></div>
            </div>
        `;

        // Pestaña de licencias
        const licensesContent = document.createElement('div');
        licensesData.forEach(data => {
            const section = document.createElement('div');
            section.className = 'deckard-section';
            section.innerHTML = `
                <div class="deckard-license">${data.license} ${!data.foundWithOriginal ? '<span style="color:#888;font-size:0.8em;">(normalizada)</span>' : ''}</div>
                ${data.units?.length ?
                    data.units.map(u => `<span class="deckard-unit">${u}</span>`).join('') :
                    '<span style="color:#999">Sin unidades asociadas</span>'}
            `;
            licensesContent.appendChild(section);
        });

        // Pestaña de unidades
        const unitsMap = new Map();
        if (jsonData[apn]) {
            Object.entries(jsonData[apn]).forEach(([license, units]) => {
                units.forEach(unit => {
                    if (!unitsMap.has(unit)) unitsMap.set(unit, []);
                    unitsMap.get(unit).push(license);
                });
            });
        }

        const unitsContent = document.createElement('div');
        Array.from(unitsMap.entries()).sort().forEach(([unit, licenses]) => {
            unitsContent.innerHTML += `
                <div style="margin-bottom:5px">
                    <span class="deckard-unit ${licenses.length ? '' : 'unk'}">${unit}</span>
                    ${licenses.length ? `<div style="font-size:11px">${licenses.join(', ')}</div>` : ''}
                </div>
            `;
        });

        // Manejo de pestañas
        const tabContent = popup.querySelector('#deckard-tab-content');
        tabContent.appendChild(licensesContent);

        popup.querySelectorAll('.deckard-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                popup.querySelectorAll('.deckard-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                tabContent.innerHTML = '';
                if (tab.dataset.tab === 'licenses') {
                    tabContent.appendChild(licensesContent);
                } else {
                    tabContent.appendChild(unitsContent);
                }

                // Actualizar unidades flotantes al cambiar de pestaña
                showFloatingUnits();
            });
        });

        // Eventos de unidades
        popup.addEventListener('click', e => {
            if (e.target.classList.contains('deckard-unit')) {
                const unit = e.target.textContent;
                document.querySelectorAll('.deckard-highlight').forEach(el => {
                    if (el.textContent === unit) el.replaceWith(unit);
                });

                if (!e.target.classList.contains('highlighted')) {
                    highlightText(unit);
                    e.target.classList.add('highlighted');
                } else {
                    e.target.classList.remove('highlighted');
                }
            }
        });

        // Función para mostrar unidades flotantes
        const showFloatingUnits = () => {
            const unitInput = document.querySelector('input[name="unit_number"], input[id*="unit_number"]');
            if (!unitInput) return;

            // Eliminar unidades flotantes previas
            document.querySelectorAll('.deckard-unit-floating-container').forEach(el => el.remove());

            // Obtener todas las unidades únicas de las licencias del listado
            const allUnits = new Set();

            licensesData.forEach(data => {
                if (listLicenses.includes(data.license)) {
                    data.units?.forEach(unit => allUnits.add(unit));
                }
            });

            // Si hay unidades, mostrarlas flotando cerca del input
            if (allUnits.size > 0) {
                const container = document.createElement('div');
                container.className = 'deckard-unit-floating-container';

                const title = document.createElement('span');
                title.className = 'deckard-unit-floating-title';
                title.textContent = 'Unit Suggested:';
                container.appendChild(title);

                Array.from(allUnits).sort().forEach(unit => {
                    const unitTag = document.createElement('span');
                    unitTag.className = 'deckard-unit-floating';
                    unitTag.textContent = unit;
                    container.appendChild(unitTag);
                });

                // Insertamos el contenedor después del input
                unitInput.parentNode.insertBefore(container, unitInput.nextSibling);
            }
        };

        // Mostrar unidades flotantes al inicio
        showFloatingUnits();

        // Cerrar popup
        popup.querySelector('.deckard-close').addEventListener('click', () => {
            // Limpiar unidades flotantes al cerrar
            document.querySelectorAll('.deckard-unit-floating-container').forEach(el => el.remove());
            popup.remove();
        });

        document.body.appendChild(popup);
    }

    function highlightText(text) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: node =>
                    !node.parentElement.closest('.deckard-popup') &&
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
    }

    function processData(apn, sheetName, licenses) {
        const jsonUrl = `https://dinfcs.github.io/Deckardaov/DeckardScripts/Licenses/${encodeURIComponent(sheetName)}.json`;

        fetch(jsonUrl)
            .then(res => res.json())
            .then(jsonData => {
                const licensesData = licenses.map(license => {
                    const normalized = normalizeLicense(license);
                    let units = jsonData.data?.[apn]?.[license] || [];
                    let foundWithOriginal = true;

                    if (!units.length) {
                        const normalizedKey = Object.keys(jsonData.data?.[apn] || {})
                            .find(k => normalizeLicense(k) === normalized);
                        if (normalizedKey) {
                            units = jsonData.data[apn][normalizedKey];
                            foundWithOriginal = false;
                        }
                    }

                    return { license, units, foundWithOriginal };
                });

                showResults(apn, sheetName, licensesData, jsonData.data || {});
            })
            .catch(() => {
                showResults(apn, sheetName,
                    licenses.map(license => ({ license, units: null, foundWithOriginal: false })),
                    {}
                );
            });
    }

    // Inicio automático
    const check = () => {
        const apn = extractAPN();
        const sheet = extractSheetName();
        const licenses = extractLicenses();
        if (apn && sheet && licenses?.length) {
            processData(apn, sheet, licenses);
            return true;
        }
        return false;
    };

    if (!check()) {
        const observer = new MutationObserver(() => check() && observer.disconnect());
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
