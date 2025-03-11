// ==UserScript==
// @name         Search in Leon County
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Busca valores en Leon County o utiliza el portapapeles si no hay valor disponible
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/FL/leon/_/STR*
// @grant        none
// @grant        navigator.clipboard.readText
// ==/UserScript==

(function() {
    'use strict';

    // Crear el botón flotante
    const button = document.createElement("button");
    button.innerText = "Search in Leon County";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.padding = "10px 15px";
    button.style.backgroundColor = "#28a745";
    button.style.color = "#FFF";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.zIndex = "9999";

    // Agregar funcionalidad al botón
    button.addEventListener("click", async () => {
        let value = null;

        // Intentar encontrar el valor en la página
        const tdElement = document.querySelector('td.value[data-field-name="apn"][data-modified="true"] p a');
        if (tdElement) {
            const valueMatch = tdElement.innerText.match(/^\d+/); // Captura solo los dígitos
            if (valueMatch) {
                value = valueMatch[0];
            }
        }

        // Si no se encontró el valor, usar el portapapeles
        if (!value) {
            try {
                value = await navigator.clipboard.readText(); // Leer el texto del portapapeles
                if (!/^\d+$/.test(value)) { // Validar que el texto del portapapeles sea un número
                    alert("El contenido del portapapeles no es un número válido.");
                    return;
                }
            } catch (err) {
                alert("No se pudo acceder al portapapeles: " + err);
                return;
            }
        }

        if (value) {
            // Construir la URL y abrirla
            const url = `https://search.leonpa.gov/Property/Details/${encodeURIComponent(value)}`;
            window.open(url, "_blank");
        } else {
            alert("No se encontró ningún valor para buscar.");
        }
    });

    // Agregar el botón al documento
    document.body.appendChild(button);
})();
