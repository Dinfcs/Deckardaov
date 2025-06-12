// ==UserScript==
// @name         Misterb&b Address
// @version      2025-01-17
// @description  Get the address from misterb&b rentals
// @author       Lucho
// @match        https://www.misterbandb.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=misterbandb.com
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
    const scriptTags = document.getElementsByTagName('script');
    for (let tag of scriptTags) {
        if (tag.textContent.includes('window.detailMapHosting =')) {
            const data = tag.textContent.match(/window\.detailMapHosting\s*=\s*(\{.*\});/);
            if (data && data[1]) {
                const propertyDetails = JSON.parse(data[1]);
                const propertyAddress = `${propertyDetails.address}, ${propertyDetails.city}`;
                createLayer(propertyAddress);
                console.log(propertyAddress);
                break;
            }
        }
    }
})();
