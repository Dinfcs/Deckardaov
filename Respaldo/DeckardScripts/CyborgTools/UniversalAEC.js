// ==UserScript==
// @name         Universal Address Extractor
// @version      1.7 // Versión actualizada con limpieza de dirección
// @description  Extracts property addresses from multiple vacation rental sites, with special handling for cyborg.deckard.com
// @author       Lucho
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // Lista de dominios donde NO debe ejecutarse el script para la lógica GENERAL.
    // NOTA: cyborg.deckard.com se maneja específicamente al inicio del script.
    const blockedDomains = [
        "www.google.com",
        "www.bing.com",
        "duckduckgo.com",
        "netorgft4047789.sharepoint.com",
        "docs.google.com",
        "assr.parcelquest.com",
        "login-spatialstream.prod.lightboxre.com",
        "script.google.com",
        "deckardtech.atlassian.net",
        "milladeoro.tinkko.com",
        "www.zillow.com",
        "www.redfin.com",
        "www.realtor.com",
        "www.realestate.com.au",
        "auth.corelogic.asia",
        "github.com",
        "app.regrid.com",
        "apps.nearmap.com",
        "www.psar.org",
        "lookerstudio.google.com",
        "platzi.com",
        "www.bancolombia.com",
        "openai.com",
        "www.deepseek.com",
        "gemini.google.com",
        "rentalscape.deckard.technology"
    ];

    // Obtener dominio y ruta actual
    const currentDomain = window.location.hostname;
    const currentPath = window.location.pathname;

    /**
     * Helper para formatear una dirección limpiamente, excluyendo partes vacías.
     * @param {string[]} parts - Componentes de la dirección.
     * @returns {string} Dirección formateada.
     */
    function formatAddress(...parts) {
        return parts.filter(p => p && p.trim() !== '').map(p => p.trim()).join(', ');
    }

    function showFloatingWindow(message) {
        if (!message) return;
        let windowDiv = document.getElementById("address-extractor-window");
        if (windowDiv) {
            windowDiv.remove();
        }

        windowDiv = document.createElement("div");
        windowDiv.id = "address-extractor-window";
        windowDiv.style.position = "fixed";
        windowDiv.style.bottom = "20px";
        windowDiv.style.right = "20px";
        windowDiv.style.background = "rgba(0, 0, 0, 0.8)";
        windowDiv.style.color = "white";
        windowDiv.style.padding = "15px";
        windowDiv.style.borderRadius = "10px";
        windowDiv.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
        windowDiv.style.fontSize = "16px";
        windowDiv.style.zIndex = "9999";
        windowDiv.style.maxWidth = "300px";
        windowDiv.style.cursor = "pointer";
        windowDiv.innerHTML = `<h4>📍 Property Address</h4><p>${decodeURIComponent(message)}</p>`;

        windowDiv.addEventListener("click", () => {
            navigator.clipboard.writeText(decodeURIComponent(message)).then(() => {
                showNotification("📋 Address copied to clipboard!");
            }).catch(err => console.error("❌ Error copying address: ", err));
        });

        document.body.appendChild(windowDiv);
    }

    function showNotification(message) {
        let notification = document.createElement("div");
        notification.style.position = "fixed";
        notification.style.top = "50%";
        notification.style.left = "50%";
        notification.style.transform = "translate(-50%, -50%)";
        notification.style.background = "rgba(0, 0, 0, 0.8)";
        notification.style.color = "white";
        notification.style.padding = "15px";
        notification.style.borderRadius = "10px";
        notification.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
        notification.style.fontSize = "16px";
        notification.style.zIndex = "10000";
        notification.style.maxWidth = "300px";
        notification.style.textAlign = "center";
        notification.innerHTML = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }

    // --- FUNCIONES DE EXTRACCIÓN (sin cambios funcionales) ---
    function extractFromSchemaOrg(doc) {
        let scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (let script of scripts) {
            try {
                let jsonData = JSON.parse(script.textContent);
                if (!Array.isArray(jsonData)) { jsonData = [jsonData]; }
                for (let data of jsonData) {
                    let addressObj = data.address || data.geo?.address;
                    if (typeof addressObj === 'string' && addressObj.length > 5) { return addressObj; }
                    if (addressObj && typeof addressObj === 'object' && addressObj["@type"] === "PostalAddress") {
                        let address = formatAddress(addressObj.streetAddress, addressObj.addressLocality, addressObj.addressRegion, addressObj.postalCode, addressObj.addressCountry);
                        if (address.length > 5) { return address; }
                    }
                    if (data && typeof data === 'object' && data.address && data.address.streetAddress) {
                         let address = formatAddress(data.address.streetAddress, data.address.addressLocality, data.address.addressRegion, data.address.postalCode, data.address.addressCountry);
                        if (address.length > 5) { return address; }
                    }
                }
            } catch (error) { /* console.error("❌ Error parsing Schema.org JSON-LD:", error); */ }
        }
        return null;
    }

    function extractFromMapDataAttributes(doc) {
        const elements = doc.querySelectorAll('[data-latitude][data-longitude],[data-address],[data-location],[data-street]');
        for (const el of elements) {
            const address = el.dataset.address || el.dataset.location || el.dataset.street;
            if (address && address.length > 5) { return address; }
        }
        return null;
    }

    function extractFromCommonAddressElements(doc) {
        const selectors = ['address', '[itemprop="address"]', '.address', '.location', '.property-address', '#property-address', '#location-details', 'div[itemtype$="PostalAddress"]'];
        for (const selector of selectors) {
            const elements = doc.querySelectorAll(selector);
            for (const el of elements) {
                let text = el.textContent.trim();
                text = text.replace(/[\n\t\r]+/g, ' ').replace(/\s{2,}/g, ' ');
                text = text.replace(/^(Address|Location|Property Address|Dirección|Ubicación|Dirección de la Propiedad):\s*/i, '');
                const street = el.querySelector('[itemprop="streetAddress"]')?.textContent;
                const city = el.querySelector('[itemprop="addressLocality"]')?.textContent;
                const region = el.querySelector('[itemprop="addressRegion"]')?.textContent;
                const zip = el.querySelector('[itemprop="postalCode"]')?.textContent;
                const country = el.querySelector('[itemprop="addressCountry"]')?.textContent;
                let combinedAddress = formatAddress(street, city, region, zip, country);
                if (combinedAddress.length > 5) { return combinedAddress; }
                if (text.length > 10 && (text.includes("Street") || text.includes("Ave") || text.includes("Road") || /\d/.test(text) && (text.includes(",") || text.includes(".")))) { return text; }
            }
        }
        return null;
    }

    function extractFromMisterbandb(doc) {
        const scriptTags = doc.getElementsByTagName('script');
        for (let tag of scriptTags) {
            if (tag.textContent.includes('window.detailMapHosting =')) {
                const data = tag.textContent.match(/window\.detailMapHosting\s*=\s*(\{.*\});/);
                if (data && data[1]) {
                    try {
                        let details = JSON.parse(data[1]);
                        let address = formatAddress(details.address, details.city, details.state, details.zip);
                        if (address.length > 5) { return address; }
                    } catch (error) { console.error("❌ Error parsing Misterb&b JSON:", error); }
                }
            }
        }
        return null;
    }

    function extractFromMichaels(doc) {
        let pageSource = doc.body.innerHTML;
        let match = pageSource.match(/propDetails:\s*({.*?"unit_id":.*?})/s);
        if (match && match[1]) {
            try {
                let details = JSON.parse(match[1]);
                let address = formatAddress(details.address, details.city, details.state, details.zip);
                if (address.length > 5) { return address; }
            } catch (error) { console.error("❌ Error parsing Michaels JSON:", error); }
        }
        return null;
    }

    function extractFromEvolve(doc) {
        const nextData = doc.getElementById('__NEXT_DATA__');
        if (nextData) {
            try {
                let data = JSON.parse(nextData.textContent);
                const listingAddress = data?.props?.pageProps?.listing?.address;
                if (listingAddress && typeof listingAddress === 'object') {
                    const address = formatAddress(listingAddress.street, listingAddress.city, listingAddress.state, listingAddress.postalCode, listingAddress.country);
                     if (address.length > 5) { return address; }
                }
                let fullText = data?.props?.pageProps?.listing?.adContent?.find(ad => ad.text.includes("PROPERTY ADDRESS:"))?.text || "";
                let start = fullText.indexOf("PROPERTY ADDRESS:\n - ") + "PROPERTY ADDRESS:\n - ".length;
                let end = fullText.indexOf("\n\nGUEST CONTACT");
                if (start !== -1 && end !== -1 && start < end) {
                    let address = fullText.substring(start, end).trim();
                    if (address.length > 5) { return address; }
                }
            } catch (error) { console.error("❌ Error parsing Evolve JSON:", error); }
        }
        return null;
    }

    function extractFromSedona(doc) {
        let scripts = doc.querySelectorAll('script[type="application/ld+json"]');
        for (let script of scripts) {
            try {
                let jsonData = JSON.parse(script.textContent);
                if (jsonData.address && jsonData.address.streetAddress) {
                    let address = formatAddress(jsonData.address.streetAddress, jsonData.address.addressLocality, jsonData.address.addressRegion, jsonData.address.postalCode, jsonData.address.addressCountry);
                    if (address.length > 5) { return address; }
                }
            } catch (error) { /* console.error("❌ Error parsing Sedona JSON-LD:", error); */ }
            }
        return null;
    }

    function extractFromUnitData(doc) {
        let unitElement = doc.querySelector('.abe-column.abe-unit-info[id="unit-data"]');
        if (unitElement) {
            let address1 = unitElement.getAttribute('data-unit-address1') || "";
            let address2 = unitElement.getAttribute('data-unit-address2') || "";
            let city = unitElement.getAttribute('data-unit-city') || "";
            let state = unitElement.getAttribute('data-unit-state') || "";
            let zip = unitElement.getAttribute('data-unit-zip') || "";
            let fullAddress = formatAddress(address1, address2, city, state, zip);
            if (fullAddress.length > 5) { return fullAddress; }
        }
        return null;
    }

    function extractFromRawHTML(doc) {
        let pageSource = doc.body.innerHTML;
        let match1 = pageSource.match(/"directions":"",\s*"address":"(.*?)"/);
        if (match1 && match1[1]) {
            let address = decodeURIComponent(match1[1]);
            if (address.length > 5) { return address; }
        }
        let match2 = pageSource.match(/to the following address:\s*(.*?)(?=<[^>]*?>|\n\n|$)/i);
        if (match2 && match2[1]) {
            let address = match2[1].trim();
            address = address.replace(/<br\s*\/?>/gi, '').replace(/<ul.*?<\/ul>/gis, '').trim();
            if (address.length > 5) { return address; }
        }
        let match3 = pageSource.match(/address:\s*(.*?)(?=<[^>]*?>|\n\n|$)/i);
        if (match3 && match3[1]) {
            let address = match3[1].trim();
            address = address.replace(/<br\s*\/?>/gi, '').replace(/<ul.*?<\/ul>/gis, '').trim();
            if (address.length > 5) { return address; }
        }
        return null;
    }

    // --- ORDEN DE EJECUCIÓN OPTIMIZADO para un 'doc' dado ---
    function findAddressInDocument(doc) {
        return extractFromSchemaOrg(doc) ||
               extractFromCommonAddressElements(doc) ||
               extractFromMapDataAttributes(doc) ||
               extractFromEvolve(doc) ||
               extractFromMisterbandb(doc) ||
               extractFromMichaels(doc) ||
               extractFromSedona(doc) ||
               extractFromUnitData(doc) ||
               extractFromRawHTML(doc);
    }

    /**
     * Limpia el texto de una dirección, eliminando instrucciones o texto adicional.
     * @param {string} addressText - El texto de la dirección a limpiar.
     * @returns {string} La dirección limpia.
     */
    function cleanAddressText(addressText) {
        if (!addressText) return '';

        let cleaned = addressText.trim();

        // Define patrones que indican el final de la dirección y el inicio de texto adicional.
        // El orden importa: los patrones más específicos o que cortan antes deben ir primero.
        const stopPatterns = [
            /Set your GPS\/GOOGLE\/WAZE to the following address:/i, // Si esto se pasó por alto en el regex
            /From\s.+?:/i,                                        // Ej: "From Northwest Florida Beaches International Airport (ECP):"
            /\n\s*Directions:/i,                                  // Salto de línea seguido de "Directions:"
            /\n\s*Please\s*note:/i,
            /\n\s*Check-in\s*instructions:/i,
            /\n\s*This\s*is\s*the\s*community\s*in\s*which/i,     // Frase específica del ejemplo
            /\n\s*Guests\s*will\s*receive/i,
            /\n\s*Key\s*features/i,
            /\n\s*Parking\s*instructions:/i,
            /\n\s*Getting\s*there:/i,
            /\n\s*Details\s*of\s*the\s*property:/i,
            /\n\s*Things\s*to\s*know:/i,
            /\n\s*House\s*rules:/i,
            /\n\s*(?:Turn|Continue|Follow|Go|Walk|Drive|Walk|Drive)\b/i, // Líneas que comienzan con instrucciones direccionales
            /\n\s*[-*\d]+\.?\s*\w/i,                              // Cualquier punto de viñeta o elemento de lista numerada
            /\.\s*(?:Amenities|Features|Location|Nearby|About this rental|The space|Guest access|Other things to note|Interaction with guests)/i // . seguido de encabezados de sección comunes
        ];

        for (const pattern of stopPatterns) {
            const match = cleaned.match(pattern);
            if (match) {
                // Si se encuentra una coincidencia, se toma todo antes de ella.
                cleaned = cleaned.substring(0, match.index).trim();
                break; // Detenerse después de la primera coincidencia
            }
        }

        // Limpieza final de comas o puntos sobrantes al final
        cleaned = cleaned.replace(/,\s*$/, '').replace(/\.\s*$/, '').trim();

        return cleaned;
    }


    /**
     * Espera a que un elemento aparezca en el DOM usando MutationObserver.
     * @param {string} selector - El selector CSS del elemento a esperar.
     * @param {number} timeoutMs - Tiempo máximo en milisegundos para esperar.
     * @returns {Promise<HTMLElement|null>} Una promesa que se resuelve con el elemento o null si hay timeout.
     */
    function waitForElement(selector, timeoutMs = 15000) {
        return new Promise((resolve) => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`🔍 Elemento "${selector}" encontrado inmediatamente.`);
                return resolve(element);
            }

            const observer = new MutationObserver((mutations, obs) => {
                const foundElement = document.querySelector(selector);
                if (foundElement) {
                    obs.disconnect();
                    console.log(`🔍 Elemento "${selector}" encontrado vía MutationObserver.`);
                    resolve(foundElement);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });

            setTimeout(() => {
                observer.disconnect();
                const currentElement = document.querySelector(selector);
                if (!currentElement) {
                    console.warn(`⏳ Timeout: Elemento "${selector}" no encontrado después de ${timeoutMs / 1000} segundos.`);
                }
                resolve(currentElement);
            }, timeoutMs);
        });
    }


    // --- LÓGICA ESPECÍFICA PARA CYBORG.DECKARD.COM/LISTING/* ---
    if (currentDomain === "cyborg.deckard.com" && currentPath.startsWith("/listing/")) {
        console.log("✅ Universal Address Extractor Loaded on Cyborg Deckard Listing. Waiting for rentalscape link as anchor...");

        const rentalscapeAnchorSelector = 'a[href^="https://rentalscape.deckard.technology/"]';

        waitForElement(rentalscapeAnchorSelector).then(rentalscapeAnchorElement => {
            let targetLinkElement = null;

            if (rentalscapeAnchorElement) {
                // El enlace objetivo está dentro del <h5> que es el hermano anterior del enlace de rentalscape.
                const h5Element = rentalscapeAnchorElement.previousElementSibling;
                if (h5Element && h5Element.tagName === 'H5') {
                    targetLinkElement = h5Element.querySelector('a');
                }
            }

            if (targetLinkElement && typeof GM_xmlhttpRequest !== 'undefined') {
                const targetUrl = targetLinkElement.href;
                console.log(`📡 Fetching address from: ${targetUrl}`);

                GM_xmlhttpRequest({
                    method: "GET",
                    url: targetUrl,
                    onload: function(response) {
                        try {
                            const parser = new DOMParser();
                            const remoteDoc = parser.parseFromString(response.responseText, 'text/html');
                            console.log("📄 Remote document parsed. Attempting address extraction from it.");

                            let extractedAddress = findAddressInDocument(remoteDoc); // Usamos 'let' para reasignar

                            if (extractedAddress) {
                                extractedAddress = cleanAddressText(extractedAddress); // <--- APLICAR LIMPIEZA AQUÍ
                                console.log("🎉 Address successfully extracted and cleaned from remote page:", extractedAddress);
                                showFloatingWindow(extractedAddress);
                            } else {
                                console.log("😞 No address found in the remote page using defined methods.");
                                showFloatingWindow("Address not found on linked page.");
                            }
                        } catch (e) {
                            console.error("❌ Error parsing remote document or extracting address:", e);
                            showNotification("❌ Error extracting address from remote page.");
                        }
                    },
                    onerror: function(error) {
                        console.error("❌ GM_xmlhttpRequest failed:", error);
                        showNotification("❌ Failed to load remote page for address extraction.");
                    }
                });
            } else if (!rentalscapeAnchorElement) {
                console.log("🔍 Rentalscape anchor link not found on the page after waiting.");
                showNotification("Rentalscape anchor link not found on this listing page.");
            } else if (!targetLinkElement) {
                 console.log("🔍 Target link not found (e.g., h5 not found or a inside h5 missing).");
                 showNotification("Target listing link not found on this page.");
            } else {
                console.log("🔍 GM_xmlhttpRequest not available. Ensure @grant GM_xmlhttpRequest is set.");
                showNotification("Script permission missing for background requests.");
            }
        });
        return;
    }

    // --- LÓGICA GENERAL DE BLOQUEO DE DOMINIOS ---
    // Si el dominio está en la lista de bloqueo, detener la ejecución del script general
    if (blockedDomains.includes(currentDomain)) {
        console.log(`🚫 Universal Address Extractor bloqueado en ${currentDomain}`);
        return;
    }

    // --- LÓGICA GENERAL DE EXTRACCIÓN PARA CUALQUIER OTRA PÁGINA PERMITIDA ---
    console.log("✅ Universal Address Extractor Loaded, searching for address...");

    let attempts = 0;
    const maxAttempts = 30; // Máximo 30 segundos
    const intervalTime = 1000; // Cada segundo

    let interval = setInterval(() => {
        let address = findAddressInDocument(document); // Usamos 'let' para reasignar
        if (address || attempts >= maxAttempts) {
            clearInterval(interval);
            if (address) {
                address = cleanAddressText(address); // <--- APLICAR LIMPIEZA AQUÍ
                console.log("📍 Address found on current page:", address);
                showFloatingWindow(address);
            } else {
                console.warn("⏳ Timeout reached while searching for address. No address found.");
            }
        }
        attempts++;
    }, intervalTime);
})();
