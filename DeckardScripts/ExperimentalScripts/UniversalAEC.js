// ==UserScript==
// @name         Universal Rental Address Extractor
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Extract an address from a secondary page and display it on the primary page
// @author       Your Name
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    setTimeout(function () {
        console.log(":white_check_mark: Universal Address Extractor Loaded, searching for address...");

        function showFloatingWindow(message) {
            let window = document.createElement("div");
            window.style.position = "fixed";
            window.style.bottom = "20px";
            window.style.right = "20px";
            window.style.background = "rgba(0, 0, 0, 0.8)";
            window.style.color = "white";
            window.style.padding = "10px";
            window.style.borderRadius = "8px";
            window.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
            window.style.fontSize = "14px";
            window.style.zIndex = "9999";
            window.style.maxWidth = "250px";
            window.style.cursor = "pointer";
            window.innerHTML = `<h4 style="margin: 0 0 5px;">Property Address</h4><p style="margin: 0;">${decodeURIComponent(message)}</p><button id="closeButton" style="margin-top: 10px; padding: 5px 10px; background: #ff0000; color: white; border: none; border-radius: 5px; cursor: pointer;">X</button>`;

            window.querySelector("#closeButton").addEventListener("click", () => {
                document.body.removeChild(window);
            });

            window.addEventListener("click", () => {
                navigator.clipboard.writeText(decodeURIComponent(message)).then(() => {
                    showNotification(":clipboard: Address copied to clipboard!");
                }).catch(err => console.error(":x: Error copying address: ", err));
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
            notification.style.padding = "10px";
            notification.style.borderRadius = "8px";
            notification.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
            notification.style.fontSize = "14px";
            notification.style.zIndex = "10000";
            notification.style.maxWidth = "250px";
            notification.style.textAlign = "center";
            notification.innerHTML = message;

            document.body.appendChild(notification);

            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }

        function extractAddressFromContent(content) {
            let address = null;

            // Misterb&b
            const scriptTags = content.getElementsByTagName('script');
            for (let tag of scriptTags) {
                if (tag.textContent.includes('window.detailMapHosting =')) {
                    const data = tag.textContent.match(/window\.detailMapHosting\s*=\s*(\{.*\});/);
                    if (data && data[1]) {
                        try {
                            let details = JSON.parse(data[1]);
                            address = `${details.address}, ${details.city}`;
                            console.log(":round_pushpin: Address found (Misterb&b):", address);
                            return address;
                        } catch (error) {
                            console.error(":x: Error parsing Misterb&b JSON:", error);
                        }
                    }
                }
            }

            // Otras plataformas (Ejemplo: AirBnB, Rentalscape, etc.)
            let addressMeta = content.querySelector('meta[property="og:street-address"], meta[property="og:location"], meta[name="address"]');
            if (addressMeta) {
                address = addressMeta.getAttribute("content");
                console.log(":round_pushpin: Address found (Meta Tag):", address);
                return address;
            }

            // Si no encontró dirección, devolver null
            return null;
        }

        function extractAddress(url) {
            console.log(`:mag: Fetching URL: ${url}`);
            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: function (response) {
                    console.log(`:memo: Response received for URL: ${url}`);
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(response.responseText, 'text/html');
                    let address = extractAddressFromContent(doc);
                    if (address) {
                        showFloatingWindow(address);
                    } else {
                        console.warn(":hourglass_flowing_sand: Address not found.");
                    }
                },
                onerror: function (error) {
                    console.error(":x: Error fetching URL: ", error);
                }
            });
        }

        function getFirstRentalLink() {
            let container = document.querySelector('div > h5 > a');
            if (container) {
                let firstLink = container.closest('div').querySelector('a[href^="https://"]:not([href*="rentalscape.deckard"])');
                if (firstLink) {
                    return firstLink.href;
                }
            }
            return null;
        }

        let rentalLink = getFirstRentalLink();
        if (rentalLink) {
            console.log(`:link: Rental link found: ${rentalLink}`);
            extractAddress(rentalLink);
        } else {
            console.error(":x: No valid rental link found.");
        }

    }, 5000); // Retraso de 5 segundos

})();
