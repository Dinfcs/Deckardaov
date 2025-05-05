// ==UserScript==
// @name         Duplicate Listing Data
// @version      0.3
// @description  Duplica la información del listado de una página a otra y añade botón al hacer clic en "Nearby parcels"
// @author       Lucho
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Función para crear el botón Duplicate
    function createDuplicateButton() {
        // Crear el botón
        let button = document.createElement("button");
        button.innerHTML = "Duplicate";
        button.style.marginLeft = "10px";
        button.style.marginRight = "5px";
        button.id = "btn_duplicate";

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
                    alert("The ID of the target listing could not be found in the current URL.");
                }
            } else {
                alert("No source listing ID entered.");
            }
        });

        return button;
    }

    // Función para añadir el botón Duplicate al lado del botón "Map to selected parcel" o "Nearby listings"
    function addButton() {
        // Verificar si el botón ya existe
        if (document.getElementById("btn_duplicate")) {
            return; // El botón ya existe, no hacer nada
        }

        // Primero intentar encontrar el botón "Map to selected parcel"
        let mapButton = document.getElementById("btn_map_to_selected_probable_parcel");

        if (mapButton) {
            // Crear el botón Duplicate
            let duplicateButton = createDuplicateButton();

            // Insertar el botón "Duplicate" justo debajo del botón "Map to selected parcel"
            mapButton.parentNode.insertBefore(duplicateButton, mapButton.nextSibling);
        } else {
            // Si no existe el botón "Map to selected parcel", buscar el enlace "Nearby listings"
            let nearbyListingsLink = document.querySelector("a[href*='/listing/'][href*='near_location='][target='_blank']");

            if (nearbyListingsLink && nearbyListingsLink.textContent.includes("Nearby listings")) {
                // Crear el botón Duplicate
                let duplicateButton = createDuplicateButton();

                // Insertar el botón después del enlace "Nearby listings"
                nearbyListingsLink.parentNode.insertBefore(duplicateButton, nearbyListingsLink.nextSibling);
            } else {
                // Si no se encuentra ninguno de los dos, intentar nuevamente después de un breve retraso
                setTimeout(addButton, 1000);
            }
        }
    }

    // Llamar a la función para añadir el botón al cargar la página
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
                    if (spanElement && !spanElement.hasAttribute("data-clipboard-initialized")) {
                        spanElement.addEventListener("click", copyToClipboardAndNotify);
                        spanElement.setAttribute("data-clipboard-initialized", "true");
                    }
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Iniciar la observación de cambios en el DOM
    observeDOMChanges();

    // Añadir event listener para la pestaña "Nearby parcels"
    function setupNearbyParcelsTab() {
        const nearbyParcelsTab = document.getElementById("tab_listing_detail_page_nearby_parcel");

        if (nearbyParcelsTab) {
            nearbyParcelsTab.addEventListener("click", function() {
                // Esperar un momento para que la pestaña se cargue completamente
                setTimeout(function() {
                    // Verificar si el botón Duplicate existe
                    if (!document.getElementById("btn_duplicate")) {
                        // Si no existe, llamar a la función para añadirlo
                        addButton();
                    }
                }, 500); // Esperar 500ms para asegurar que el contenido de la pestaña se haya cargado
            });
            console.log("Event listener añadido a la pestaña Nearby parcels");
        } else {
            // Si el elemento no se encuentra aún, intentar de nuevo después de un tiempo
            setTimeout(setupNearbyParcelsTab, 1000);
        }
    }

    // Iniciar la configuración para la pestaña "Nearby parcels"
    setupNearbyParcelsTab();
})();
