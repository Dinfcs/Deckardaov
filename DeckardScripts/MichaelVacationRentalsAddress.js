// ==UserScript==
// @name         Michael's Vacation Rentals Address
// @version      2025-01-20
// @description  Get the address from Michael's Vacation Rentals
// @author       Lucho
// @match        https://www.michaelsvacationrentals.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=michaelsvacationrentals.com
// @grant        none
// ==/UserScript==

const createLayer = (propertyDetails) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '9999';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.width = '300px';
    overlay.style.height = '200px';
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

    if (propertyDetails) {
        overlay.innerHTML = `<h4>Property Details</h4>
                             <p><strong>Address:</strong> ${propertyDetails.address}</p>
                             <p><strong>Name:</strong> ${propertyDetails.prop_name}</p>`;
    } else {
        overlay.innerHTML = `<h4>Property Details</h4><p>No se encontraron datos específicos.</p>`;
    }

    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);
}

(function() {
    'use strict';
    const scriptTags = document.getElementsByTagName('script');
    let propertyDetails = null;

    for (let tag of scriptTags) {
        if (tag.textContent.includes('prop_name":"') && tag.textContent.includes('address":"')) {
            const propNameMatch = tag.textContent.match(/prop_name":"([^"]*)"/);
            const addressMatch = tag.textContent.match(/address":"([^"]*)"/);

            if (propNameMatch && addressMatch) {
                propertyDetails = {
                    prop_name: propNameMatch[1],
                    address: addressMatch[1]
                };
                break;
            }
        }
    }

    createLayer(propertyDetails);
})();
