// ==UserScript==
// @name         Universal Address Extractor
// @version      1.2
// @description  Extracts property addresses from multiple vacation rental sites, except for certain domains
// @author       Lucho
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Lista de dominios donde NO debe ejecutarse el script
    const blockedDomains = [
        "cyborg.deckard.com",
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

    // Obtener dominio actual
    const currentDomain = window.location.hostname;

    // Si el dominio está en la lista, detener la ejecución del script
    if (blockedDomains.includes(currentDomain)) {
        console.log(`🚫 Universal Address Extractor bloqueado en ${currentDomain}`);
        return;
    }

    console.log("✅ Universal Address Extractor Loaded, searching for address...");

    function showFloatingWindow(message) {
        let window = document.createElement("div");
        window.style.position = "fixed";
        window.style.bottom = "20px";
        window.style.right = "20px";
        window.style.background = "rgba(0, 0, 0, 0.8)";
        window.style.color = "white";
        window.style.padding = "15px";
        window.style.borderRadius = "10px";
        window.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
        window.style.fontSize = "16px";
        window.style.zIndex = "9999";
        window.style.maxWidth = "300px";
        window.style.cursor = "pointer";
        window.innerHTML = `<h4>📍 Property Address</h4><p>${decodeURIComponent(message)}</p>`;

        window.addEventListener("click", () => {
            navigator.clipboard.writeText(decodeURIComponent(message)).then(() => {
                showNotification("📋 Address copied to clipboard!");
            }).catch(err => console.error("❌ Error copying address: ", err));
        });

        document.body.appendChild(window);
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

    function extractFromMisterbandb() {
        const scriptTags = document.getElementsByTagName('script');
        for (let tag of scriptTags) {
            if (tag.textContent.includes('window.detailMapHosting =')) {
                const data = tag.textContent.match(/window\.detailMapHosting\s*=\s*(\{.*\});/);
                if (data && data[1]) {
                    try {
                        let details = JSON.parse(data[1]);
                        let address = `${details.address}, ${details.city}`;
                        console.log("📍 Address found (Misterb&b):", address);
                        showFloatingWindow(address);
                        return true;
                    } catch (error) {
                        console.error("❌ Error parsing Misterb&b JSON:", error);
                    }
                }
            }
        }
        return false;
    }

    function extractFromMichaels() {
        let pageSource = document.body.innerHTML;
        let match = pageSource.match(/propDetails:\s*({.*?"unit_id":.*?})/s);
        if (match && match[1]) {
            try {
                let details = JSON.parse(match[1]);
                let address = `${details.address}, ${details.city}, ${details.state} ${details.zip}`;
                console.log("📍 Address found (Michaels):", address);
                showFloatingWindow(address);
                return true;
            } catch (error) {
                console.error("❌ Error parsing Michaels JSON:", error);
            }
        }
        return false;
    }

    function extractFromEvolve() {
        const nextData = document.getElementById('__NEXT_DATA__');
        if (nextData) {
            try {
                let data = JSON.parse(nextData.textContent);
                let fullText = data?.props?.pageProps?.listing?.adContent.find(ad => ad.text.includes("PROPERTY ADDRESS:"))?.text || "";
                let start = fullText.indexOf("PROPERTY ADDRESS:\n - ") + "PROPERTY ADDRESS:\n - ".length;
                let end = fullText.indexOf("\n\nGUEST CONTACT");
                if (start !== -1 && end !== -1) {
                    let address = fullText.substring(start, end).trim();
                    console.log("📍 Address found (Evolve):", address);
                    showFloatingWindow(address);
                    return true;
                }
            } catch (error) {
                console.error("❌ Error parsing Evolve JSON:", error);
            }
        }
        return false;
    }

    function extractFromSedona() {
        let scripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (let script of scripts) {
            try {
                let jsonData = JSON.parse(script.textContent);
                if (jsonData.address && jsonData.address.streetAddress) {
                    let address = jsonData.address.streetAddress;
                    console.log("📍 Address found (Sedona):", address);
                    showFloatingWindow(address);
                    return true;
                }
            } catch (error) {
                console.error("❌ Error parsing Sedona JSON-LD:", error);
            }
        }
        return false;
    }

    function extractFromRawHTML() {
        let pageSource = document.body.innerHTML;
        let match = pageSource.match(/"directions":"",\s*"address":"(.*?)"/);
        if (match && match[1]) {
            let address = match[1];
            console.log("📍 Address found (Raw HTML):", decodeURIComponent(address));
            showFloatingWindow(address);
            return true;
        }
        return false;
    }

            function extractFromUnitData() {
        let unitElement = document.querySelector('.abe-column.abe-unit-info[id="unit-data"]');
        if (unitElement) {
            let address1 = unitElement.getAttribute('data-unit-address1') || "";
            let address2 = unitElement.getAttribute('data-unit-address2') || "";
            let city = unitElement.getAttribute('data-unit-city') || "";
            let state = unitElement.getAttribute('data-unit-state') || "";
            let zip = unitElement.getAttribute('data-unit-zip') || "";

            let fullAddress = `${address1} ${address2}, ${city}, ${state} ${zip}`.trim().replace(/\s+/g, ' ');
            if (fullAddress.length > 5) {
                console.log("📍 Address found (Unit Data):", fullAddress);
                showFloatingWindow(fullAddress);
                return true;
            }
        }
        return false;
    }

    function findAddress() {
        return extractFromMisterbandb() ||
               extractFromMichaels() ||
               extractFromEvolve() ||
               extractFromSedona() ||
               extractFromUnitData() ||
               extractFromRawHTML();
    }


    let attempts = 0;
    let interval = setInterval(() => {
        if (findAddress() || attempts > 30) {
            clearInterval(interval);
            if (attempts > 30) console.warn("⏳ Timeout reached while searching for address.");
        }
        attempts++;
    }, 1000);
})();
