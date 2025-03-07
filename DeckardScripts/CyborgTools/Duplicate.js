// ==UserScript==
// @name         Duplicate Listing Data
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Duplica la información del listado de una página a otra y asegura la presencia de botones clave
// @author       Tu Nombre
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addDuplicateButton() {
        if (!document.querySelector("#duplicateButton")) {
            let button = document.createElement("button");
            button.id = "duplicateButton";
            button.innerHTML = "Duplicate";
            button.style.fontSize = "14px";
            button.style.marginLeft = "-3px";
            button.style.display = "inline-block";

            let mapButton = document.getElementById("btn_map_to_selected_probable_parcel");

            if (mapButton) {
                mapButton.parentNode.insertBefore(button, mapButton.nextSibling);

                button.addEventListener("click", function() {
                    let sourceId = prompt("Ingrese el ID del listado de donde desea copiar la información:");

                    if (sourceId) {
                        let currentUrl = window.location.href;
                        let destinationIdMatch = currentUrl.match(/STR-[^\/]+$/);
                        let destinationId = destinationIdMatch ? destinationIdMatch[0] : null;

                        if (destinationId) {
                            let newUrl = currentUrl.split('?')[0] + `?listing_to_prefill_vetted_data_from=%7B%22deckard_id%22%3A%22${sourceId}%22%7D`;
                            window.location.href = newUrl;
                        } else {
                            alert("No se pudo encontrar el ID del listado de destino en la URL actual.");
                        }
                    } else {
                        alert("No se ingresó un ID de listado de origen.");
                    }
                });
            }
        }
    }

    function ensureNearbyParcelsButton() {
        if (!document.getElementById("tab_listing_detail_page_nearby_parcel")) {
            let tabContainer = document.querySelector(".tab-container");
            if (tabContainer) {
                let newButton = document.createElement("div");
                newButton.className = "tab tab--selected";
                newButton.id = "tab_listing_detail_page_nearby_parcel";
                newButton.innerHTML = `<span>Nearby parcels</span>`;

                tabContainer.appendChild(newButton);
            }
        }
    }

    function restartScript() {
        addDuplicateButton();
        ensureNearbyParcelsButton();
    }

    function observeDOMChanges() {
        const observer = new MutationObserver(() => {
            if (!document.querySelector("#duplicateButton")) {
                restartScript();
            }
            ensureNearbyParcelsButton();
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    addDuplicateButton();
    ensureNearbyParcelsButton();
    observeDOMChanges();
})();
