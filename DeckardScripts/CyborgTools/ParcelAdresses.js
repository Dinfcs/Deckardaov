// ==UserScript==
// @name         Address Finder with Smart Button Placement
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  Adds hyperlinks to addresses and places the Directions button next to Apply when available.
// @author       [Your Name]
// @match        *://*/*
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    let collapseTimeout;
    let directionsButton;

    // Function to add hyperlinks to addresses
    function addHyperlinks() {
        document.querySelectorAll('td.column-9 div.dash-cell-value').forEach(div => {
            let addressText = div.innerText.trim();

            if (addressText && !div.querySelector('a')) {
                let link = document.createElement('a');
                link.href = `https://www.google.com/search?q=${encodeURIComponent(addressText)}`;
                link.target = '_blank';
                link.style.textDecoration = 'none';
                link.style.color = '#007bff';
                link.style.fontWeight = 'bold';
                link.style.transition = 'color 0.3s';
                link.innerText = addressText;

                link.addEventListener('mouseover', () => link.style.color = '#0056b3');
                link.addEventListener('mouseout', () => link.style.color = '#007bff');

                div.innerHTML = '';
                div.appendChild(link);
            }
        });
    }

    // Function to get only visible addresses
    function getVisibleAddresses() {
        let addresses = [];
        document.querySelectorAll('td.column-9 div.dash-cell-value a').forEach(a => {
            let rect = a.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                addresses.push(a.innerText.trim());
            }
        });
        return addresses.reverse();
    }

    // Function to create the main button and place it next to #btn_apply_range_filter
    function createMainButton() {
        if (directionsButton) return;

        let applyButton = document.getElementById('btn_apply_range_filter');
        if (!applyButton) return;

        directionsButton = document.createElement('button');
        directionsButton.innerText = '🗺️ Addresses';
        directionsButton.id = 'directionsButton';
        styleButton(directionsButton, '#007bff');
        directionsButton.style.marginLeft = '5px';
        directionsButton.addEventListener('click', showSecondaryButtons);

        applyButton.parentNode.insertBefore(directionsButton, applyButton.nextSibling);
    }

    // Function to show secondary buttons
    function showSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());

        createSecondaryButton('🌍 Maps', '#28a745', () => openInTabs('maps'));
        createSecondaryButton('🔍 Google', '#ffc107', () => openInTabs('google'));

        clearTimeout(collapseTimeout);
        collapseTimeout = setTimeout(hideSecondaryButtons, 5000);
    }

    // Function to hide secondary buttons
    function hideSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.classList.add('fade-out'));
        setTimeout(() => document.querySelectorAll('.secondary-button').forEach(btn => btn.remove()), 500);
    }

    // Function to create styled secondary buttons
    function createSecondaryButton(text, color, onClick) {
        let button = document.createElement('button');
        button.innerText = text;
        button.classList.add('secondary-button');
        styleButton(button, color);
        button.style.marginTop = '5px';
        button.addEventListener('click', onClick);
        button.style.marginLeft = '4px';

        directionsButton.parentNode.insertBefore(button, directionsButton.nextSibling);
    }

    // Function to style buttons
    function styleButton(button, backgroundColor) {
        button.style.background = backgroundColor;
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.padding = '10px 14px';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0px 3px 6px rgba(0,0,0,0.2)';
        button.style.fontSize = '12px';
        button.style.fontWeight = 'bold';
        button.style.transition = 'all 0.3s ease-in-out';

        button.addEventListener('mouseover', () => button.style.transform = 'scale(1.1)');
        button.addEventListener('mouseout', () => button.style.transform = 'scale(1)');
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

    // Observer to detect when #btn_apply_range_filter appears in the DOM
    const observer = new MutationObserver(() => {
        if (document.getElementById('btn_apply_range_filter')) {
            createMainButton();
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Reapply hyperlinks dynamically
    setInterval(addHyperlinks, 3000);

})();
