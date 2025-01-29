// ==UserScript==
// @name         Evolve Address
// @version      2025-01-10
// @description  Get the address from evolve vacation rentals
// @author       Lucho
// @match        https://evolve.com/vacation-rentals/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=evolve.com
// @grant        none
// ==/UserScript==

const extractAddress = (text) => {
    const start = text.indexOf("PROPERTY ADDRESS:\n - ") + "PROPERTY ADDRESS:\n - ".length;
    const end = text.indexOf("\n\nGUEST CONTACT");
    if (start !== -1 && end !== -1) {
        return text.substring(start, end).trim();
    }
    return "Address not found";
};

const createLayer = (propertyAddress) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.bottom = '20px';
    overlay.style.right = '20px';
    overlay.style.background = 'rgba(0, 0, 0, 0.8)';
    overlay.style.color = 'white';
    overlay.style.padding = '15px';
    overlay.style.borderRadius = '10px';
    overlay.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    overlay.style.fontSize = '16px';
    overlay.style.zIndex = '9999';
    overlay.style.maxWidth = '300px';
    overlay.style.cursor = 'pointer';
    overlay.innerHTML = `<h4>Property Address</h4><p>${propertyAddress}</p>`;

    overlay.addEventListener('click', () => {
        navigator.clipboard.writeText(propertyAddress).then(() => {
            alert('Address copied to clipboard!');
        }).catch(err => {
            console.error('Error copying address: ', err);
        });
    });

    document.body.appendChild(overlay);
};

(function() {
    'use strict';
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
        const data = JSON.parse(nextData.textContent);
        const fullText = data?.props?.pageProps?.listing?.adContent.find(ad => ad.text.includes("PROPERTY ADDRESS:"))?.text || "Address not found";
        const propertyAddress = extractAddress(fullText);
        createLayer(propertyAddress);
        console.log(propertyAddress);
    }
})();
