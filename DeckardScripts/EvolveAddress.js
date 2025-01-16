// ==UserScript==
// @name         Evolve Address
// @version      2025-01-10
// @description  Get the address from evolve vacation rentals
// @author       Erika
// @match        https://evolve.com/vacation-rentals/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=evolve.com
// @grant        none
// ==/UserScript==

// create a disposable over layer that shows the property address information.
const createLayer = (propertyAddress) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '9999';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.width = '300px'; // Ancho original
    overlay.style.height = '130px'; // Alto original
    overlay.style.padding = '1rem';
    overlay.style.background = 'rgba(255, 255, 255, 0.9)';
    overlay.style.overflow = 'auto';
    const closeButton = document.createElement('button');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '2px';
    closeButton.style.right = '2px';
    closeButton.style.fontSize = '10px'; // Tamaño de fuente más pequeño
    closeButton.innerHTML = 'X';
    closeButton.addEventListener('click', () => {
        overlay.remove();
    });
    overlay.innerHTML = `<h4>Property Address</h4><p>${propertyAddress}</p>`;
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);
}

(function() {
    'use strict';
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
        const data = JSON.parse(nextData.textContent);
        const propertyAddress = data?.props?.pageProps?.listing?.adContent.find(ad => ad.text.includes("PROPERTY ADDRESS:"))?.text || "Address not found";
        createLayer(propertyAddress);
        console.log(propertyAddress);
    }
})();
