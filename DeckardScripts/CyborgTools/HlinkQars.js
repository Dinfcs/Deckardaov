// ==UserScript==
// @name         Hiperlink dinámico en tabla
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Genera y actualiza enlaces en columnas 19 y 20 basados en columna 0
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let observer, timeout;

    function applyLinks() {
        document.querySelectorAll('.cell-table tbody tr').forEach(row => {
            const actionCell = row.querySelector('td.column-0 a');
            if (!actionCell) return;

            const baseHref = actionCell.getAttribute('href');
            if (!baseHref) return;

            ['td.column-19 div', 'td.column-20 div'].forEach(selector => {
                const cell = row.querySelector(selector);
                if (cell) {
                    const fullHref = `${baseHref}?tab=picked_for_qa&subset=pending_qa`;
                    // Siempre reemplaza el contenido para asegurar que el enlace se actualiza
                    cell.innerHTML = `<p><a href="${fullHref}" target="_self">${cell.textContent.trim()}</a></p>`;
                }
            });
        });
    }

    function observeTable() {
        if (observer) observer.disconnect();
        const table = document.querySelector('.cell-table');
        if (!table) return;

        observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(applyLinks, 1000); // Espera 300ms para evitar múltiples ejecuciones
        });

        observer.observe(table, { childList: true, subtree: true, characterData: true });
    }

    (function init(attempts = 0) {
        if (attempts >= 10) return console.error('No se pudo inicializar');
        if (!document.querySelector('.cell-table')) return setTimeout(() => init(attempts + 1), 500);
        console.log('Inicialización exitosa');
        observeTable();
        applyLinks();
    })();

    setInterval(() => !observer && observeTable(), 10000);
    window.addEventListener('beforeunload', () => observer?.disconnect());
})();
