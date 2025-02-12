// ==UserScript==
// @name         Auto-check and enable input field (based on element)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Activa la casilla y habilita el campo especificado después de detectar un elemento en el DOM.
// @author       Tu Nombre
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Función para observar cambios en el DOM
    function observeDOM(callback) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('.column-header-name') && node.querySelector('.column-header-name').textContent === 'deckard_id') {
                        callback();
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Función a ejecutar cuando se detecte el elemento en el DOM
    function executeScript() {
        setTimeout(function() {
            // Simula un clic sobre la casilla
            var checkbox = document.getElementById('checkbox_advanced_filter_mode');
            if (checkbox) {
                if (!checkbox.checked) {
                    checkbox.click(); // Simular clic para activar la casilla
                }

                // Verificar nuevamente el estado de la casilla
                if (!checkbox.checked) {
                    checkbox.click(); // Simular clic adicional si es necesario
                }
            }

            // Habilitar el campo textarea
            var textareaField = document.getElementsByName('cyborg_advanced_filter_expr')[0];
            if (textareaField) {
                textareaField.disabled = false; // Habilitar el campo
                textareaField.click(); // Simula un clic en el campo para enfocarlo
            }
        }, 500); // Retardo de 5 segundos
    }

    // Iniciar la observación del DOM
    observeDOM(executeScript);
})();
