// ==UserScript==
// @name         Auto-check and fill input with clipboard content (delay 7s)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Activa la casilla y pega el contenido del portapapeles en el campo especificado después de 5 segundos y luego el textarea después de 2 segundos más, simulando un enter. La ejecución del script depende del contenido del portapapeles.
// @author       Tu Nombre
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    window.addEventListener('load', function() {
        setTimeout(async function() {
            // Leer el contenido del portapapeles
            var clipboardText = await navigator.clipboard.readText();

            // Verificar si el contenido del portapapeles comienza con "suggest_qa is false and updated_at <"
            if (clipboardText.startsWith('suggest_qa is false and updated_at <')) {
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

                // Espera 2 segundos adicionales antes de rellenar el textarea
                setTimeout(function() {
                    // Rellena el campo textarea con el contenido del portapapeles
                    var textareaField = document.getElementsByName('cyborg_advanced_filter_expr')[0];
                    if (textareaField) {
                        textareaField.value = clipboardText;

                        // Simula un enter
                        var event = new KeyboardEvent('keydown', {
                            bubbles: true,
                            cancelable: true,
                            keyCode: 13
                        });
                        textareaField.dispatchEvent(event);
                    }
                }, 800); // Retardo adicional de 2 segundos
            }
        }, 2500); // Retardo de 5 segundos
    });
})();
