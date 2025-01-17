// ==UserScript==
// @name         Misterb&b Address
// @version      2025-01-17
// @description  Get the address from misterb&b rentals
// @author       Erika
// @match        https://www.misterbandb.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=misterbandb.com
// @grant        none
// ==/UserScript==

const createLayer = (propertyAddress) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '9999';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.width = '300px';
    overlay.style.height = '130px';
    overlay.style.padding = '1rem';
    overlay.style.background = 'rgba(255, 255, 255, 0.9)';
    overlay.style.overflow = 'auto';

    const closeButton = document.createElement('button');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '2px';
    closeButton.style.right = '2px';
    closeButton.style.fontSize = '10px';
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
