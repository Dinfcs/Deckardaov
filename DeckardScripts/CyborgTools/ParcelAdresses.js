// ==UserScript==
// @name         Address Finder with Button Placement
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Adds hyperlinks to addresses and places the "Directions" button next to "Apply". It auto-collapses after 5 seconds.
// @author       [Your Name]
// @match        *://*/*
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    let collapseTimeout;

    // Function to add hyperlinks to addresses in the table
    function addHyperlinks() {
        document.querySelectorAll('td.column-9 div.dash-cell-value').forEach(div => {
            let addressText = div.innerText.trim();

            // Check if it already has a link
            if (addressText && !div.querySelector('a')) {
                let link = document.createElement('a');
                link.href = `https://www.google.com/search?q=${encodeURIComponent(addressText)}`;
                link.target = '_blank';
                link.style.textDecoration = 'underline';
                link.style.color = 'blue';
                link.innerText = addressText;

                div.innerHTML = ''; // Clear content and add the link
                div.appendChild(link);
            }
        });
    }

    // Function to get only visible addresses
    function getVisibleAddresses() {
        let addresses = [];
        document.querySelectorAll('td.column-9 div.dash-cell-value a').forEach(a => {
            let rect = a.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight) { // Only if visible
                addresses.push(a.innerText.trim());
            }
        });
        return addresses.reverse(); // Open from last to first
    }

    // Function to create the main button and place it next to "Apply"
    function createMainButton() {
        let applyButton = document.querySelector('#btn_apply_range_filter');
        if (!applyButton) {
            console.warn('Apply button not found!');
            return;
        }

        let button = document.createElement('button');
        button.innerText = '🗺️Addresses';
        button.id = 'mainButton';
        button.style.marginLeft = '10px';
        button.style.background = '#007bff';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '8px 12px';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0px 4px 6px rgba(0,0,0,0.1)';
        button.style.zIndex = '9999';

        button.addEventListener('click', showSecondaryButtons);
        applyButton.parentNode.insertBefore(button, applyButton.nextSibling);
    }

    // Function to show the "Google" and "Maps" buttons
    function showSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());

        createSecondaryButton('🌍🔍 Maps', () => openInTabs('maps'));
        createSecondaryButton('🔍 Google', () => openInTabs('google'));

        // Set a timer to collapse buttons after 5 seconds
        clearTimeout(collapseTimeout);
        collapseTimeout = setTimeout(hideSecondaryButtons, 5000);
    }

    // Function to hide the secondary buttons
    function hideSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());
    }

    // Function to create secondary buttons
    function createSecondaryButton(text, onClick) {
        let button = document.createElement('button');
        button.innerText = text;
        button.classList.add('secondary-button');
        button.style.marginLeft = '10px';
        button.style.background = '#28a745';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '8px 12px';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0px 4px 6px rgba(0,0,0,0.1)';
        button.style.zIndex = '9999';
        button.addEventListener('click', onClick);

        let mainButton = document.querySelector('#mainButton');
        mainButton.parentNode.insertBefore(button, mainButton.nextSibling);
    }

    // Function to open visible addresses in new tabs
    function openInTabs(type) {
        let addresses = getVisibleAddresses();

        if (addresses.length === 0) {
            alert('No visible addresses found.');
            return;
        }

        addresses.forEach((address, index) => {
            let url = type === 'maps'
                ? `https://www.google.com/maps/search/${encodeURIComponent(address)}`
                : `https://www.google.com/search?q=${encodeURIComponent(address)}`;

            setTimeout(() => {
                GM_openInTab(url, { active: false });
            }, index * 200);
        });
    }

    // Execute when the page loads
    setTimeout(() => {
        addHyperlinks();
        createMainButton();
    }, 2000);

    // Reapply hyperlinks if the page updates dynamically
    setInterval(addHyperlinks, 3000);

})();
