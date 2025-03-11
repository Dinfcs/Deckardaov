// ==UserScript==
// @name         Search in PR FL - St Johns County
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Añade un botón flotante para buscar valores en una página específica
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/FL/st_johns/_/STR*
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // Crear el botón flotante
    const button = document.createElement("button");
    button.innerText = "Search in PR";
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.padding = "10px 15px";
    button.style.backgroundColor = "#007BFF";
    button.style.color = "#FFF";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.zIndex = "9999";

    // Agregar funcionalidad al botón
    button.addEventListener("click", () => {
        const tdElement = document.querySelector('td.value[data-field-name="apn"][data-modified="true"] p a');
        if (tdElement) {
            // Extraer SOLO el número ignorando textos adicionales
            const valueMatch = tdElement.innerText.match(/^\d+/); // Captura solo los dígitos al inicio
            if (valueMatch) {
                const value = valueMatch[0]; // Primer grupo coincidente (el número)
                // Construir la URL y abrirla
                const url = `https://qpublic.schneidercorp.com/Application.aspx?AppID=960&LayerID=21179&PageTypeID=4&PageID=9059&Q=1707999504&KeyValue=${encodeURIComponent(value)}`;
                window.open(url, "_blank");
            } else {
                alert("No se encontró un número válido en el elemento especificado.");
            }
        } else {
            alert("No se encontró el valor en el elemento especificado.");
        }
    });

    // Agregar el botón al documento
    document.body.appendChild(button);
})();
