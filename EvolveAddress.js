// ==UserScript==
// @name         Evolve Address
// @version      2025-01-10
// @description  Get the address from evolve vacation rentals
// @author       Erika
// @match        https://evolve.com/vacation-rentals/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=evolve.com
// @grant        none
// ==/UserScript==
// create a disposable over layer than show all the address information.
const createLayer = (data) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '9999';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.width = '300px';
    overlay.style.height = '370px';
    overlay.style.padding = '1rem';
    overlay.style.background = 'rgba(255, 255, 255, 0.9)';
    overlay.style.overflow = 'auto';
    const closeButton = document.createElement('button');
    closeButton.style.position = 'absolute';
    closeButton.style.top = '0';
    closeButton.style.right = '0';
    closeButton.html = 'X';
    closeButton.addEventListener('click', () => {
        overlay.remove();
    });
    let html = "";
    html += `<h4>Add Content</h4>`;
    data?.props?.pageProps?.listing?.adContent.forEach(ad => {
        if(ad.text === "") return;
        html += `<p><b>${ad.type}:</b> ${ad.text}</p>`;
    });
    overlay.innerHTML = html;
    overlay.appendChild(closeButton);
    document.body.appendChild(overlay);
}
(function() {
    'use strict';
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
        const data = JSON.parse(nextData.textContent);
        createLayer(data);
        console.log(data?.props?.pageProps?.listing?.units[0]?.addresses[0])
    }
})();