// ==UserScript==
// @name         Duplicate Listing Data
// @version      0.1
// @description  Duplica la información del listado de una página a otra
// @author       Lucho
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addButton() {
        // Crear el botón flotante
        let button = document.createElement("button");
        button.innerHTML = "Duplicate";
        button.style.marginLeft = "1px";


        // Encontrar el botón "Map to selected parcel"
        let mapButton = document.getElementById("btn_map_to_selected_probable_parcel");

        if (mapButton) {
            // Insertar el botón "Duplicate" justo debajo del botón "Map to selected parcel"
            mapButton.parentNode.insertBefore(button, mapButton.nextSibling);

            // Evento de clic en el botón
            button.addEventListener("click", function() {
                let sourceId = prompt("Enter the ID of the listing you wish to copy the information from:");

                if (sourceId) {
                    // Obtener el ID del listado de destino del enlace de la página actual
                    let currentUrl = window.location.href;
                    let destinationIdMatch = currentUrl.match(/STR-[^\/]+$/);
                    let destinationId = destinationIdMatch ? destinationIdMatch[0] : null;

                    if (destinationId) {
                        // Mantener la estructura de la URL original y agregar el nuevo parámetro
                        let newUrl = currentUrl.split('?')[0] + `?listing_to_prefill_vetted_data_from=%7B%22deckard_id%22%3A%22${sourceId}%22%7D`;

                        // Redirigir a la nueva URL
                        window.location.href = newUrl;
                    } else {
                        alert("The ID of the target listing could not be found in the current URL..");
                    }
                } else {
                    alert("No source listing ID entered.");
                }
            });
        } else {
            // Intentar nuevamente después de un breve retraso
            setTimeout(addButton, 1000);
        }
    }

    // Llamar a la función para añadir el botón
    addButton();

    // Función para copiar el ID al portapapeles y mostrar la notificación
    function copyToClipboardAndNotify() {
        const spanElement = document.querySelector(".page_header_bar h4 span");
        if (spanElement) {
            const textToCopy = spanElement.textContent;

            // Copiar el texto al portapapeles sin pedir permisos adicionales
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Crear la notificación
                const notification = document.createElement("div");
                notification.innerText = `${textToCopy} copied`;
                notification.style.position = "absolute";
                notification.style.top = `${spanElement.getBoundingClientRect().bottom + window.scrollY}px`;
                notification.style.left = `${spanElement.getBoundingClientRect().left + window.scrollX}px`;
                notification.style.backgroundColor = "#000";
                notification.style.color = "#fff";
                notification.style.padding = "5px";
                notification.style.borderRadius = "3px";
                notification.style.zIndex = "1000";

                document.body.appendChild(notification);

                // Eliminar la notificación después de 3 segundos
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }).catch(err => {
                console.error('Error copying text: ', err);
            });
        }
    }

    // Función para observar cambios en el DOM
    function observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    const spanElement = document.querySelector(".page_header_bar h4 span");
                    if (spanElement) {
                        spanElement.addEventListener("click", copyToClipboardAndNotify);
                        observer.disconnect(); // Dejar de observar una vez encontrado el elemento
                    }
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Iniciar la observación de cambios en el DOM
    observeDOMChanges();
})();
