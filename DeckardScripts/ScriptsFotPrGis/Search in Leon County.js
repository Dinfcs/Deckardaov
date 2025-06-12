// ==UserScript==
// @name         Search in Leon County
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Busca valores en Leon County o utiliza el portapapeles si no hay valor disponible
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/FL/leon/_/STR*
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
    button.addEventListener("click", () => {
        let value = null;

        // Intentar encontrar el valor en la página
        const tdElement = document.querySelector('td.value[data-field-name="apn"] p');
        if (tdElement) {
            const valueMatch = tdElement.innerText.match(/^\w+/); // Captura el valor alfanumérico al inicio
            if (valueMatch) {
                value = valueMatch[0]; // Primer grupo coincidente
            }
        }

        // Si no se encontró el valor, leer manualmente el portapapeles
        if (!value) {
            const input = document.createElement("textarea");
            document.body.appendChild(input);
            input.focus();
            document.execCommand("paste"); // Pegar desde el portapapeles
            value = input.value.trim(); // Obtener el texto pegado
            document.body.removeChild(input); // Limpiar el textarea

            // Validar el valor obtenido
            if (!/^\w+$/.test(value)) { // Validar que sea un formato alfanumérico
                alert("El contenido del portapapeles no tiene un formato válido.");
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
