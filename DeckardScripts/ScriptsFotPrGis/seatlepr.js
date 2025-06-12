// ==UserScript==
// @name         SearchPR Button Seattle
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Floating button to search parcels in King County without GM_* functions
// @author       You
// @match        https://cyborg.deckard.com/listing/WA/king/city_of_seattle/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Create the floating button
    const button = document.createElement('button');
    button.id = 'searchPRButton';
    button.textContent = 'searchPR';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    button.style.padding = '10px 15px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    button.style.fontSize = '14px';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';

    // Hover effect
    button.addEventListener('mouseover', () => button.style.backgroundColor = '#45a049');
    button.addEventListener('mouseout', () => button.style.backgroundColor = '#4CAF50');

    // Function to clean and validate APN
    function cleanAPN(apn) {
        return apn.replace(/[\s\-\.]/g, '');
    }

    // Function to show options menu
    async function showOptions() {
        try {
            const clipboardText = await navigator.clipboard.readText();
            const cleanedAPN = cleanAPN(clipboardText);

            if (!/^\d+$/.test(cleanedAPN) || cleanedAPN.length === 0) {
                alert(`The copied value is not valid. Please copy an APN.\n\nCopied value: "${clipboardText}"`);
                return;
            }

            // Create floating menu
            const menu = document.createElement('div');
            menu.style.position = 'fixed';
            menu.style.bottom = '60px';
            menu.style.right = '20px';
            menu.style.zIndex = '10000';
            menu.style.backgroundColor = 'white';
            menu.style.border = '1px solid #ddd';
            menu.style.borderRadius = '5px';
            menu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            menu.style.padding = '10px';
            menu.style.display = 'flex';
            menu.style.flexDirection = 'column';
            menu.style.gap = '8px';

            // Option 1: Parcel Detail
            const option1 = document.createElement('button');
            option1.textContent = 'View Parcel Detail';
            option1.style.padding = '8px 12px';
            option1.style.backgroundColor = '#4CAF50';
            option1.style.color = 'white';
            option1.style.border = 'none';
            option1.style.borderRadius = '4px';
            option1.style.cursor = 'pointer';
            option1.addEventListener('click', () => {
                window.open(`https://blue.kingcounty.com/Assessor/eRealProperty/Detail.aspx?ParcelNbr=${cleanedAPN}`, '_blank');
                menu.remove();
            });

            // Option 2: Dashboard
            const option2 = document.createElement('button');
            option2.textContent = 'View Dashboard';
            option2.style.padding = '8px 12px';
            option2.style.backgroundColor = '#2196F3';
            option2.style.color = 'white';
            option2.style.border = 'none';
            option2.style.borderRadius = '4px';
            option2.style.cursor = 'pointer';
            option2.addEventListener('click', () => {
                window.open(`https://blue.kingcounty.com/Assessor/eRealProperty/Dashboard.aspx?ParcelNbr=${cleanedAPN}`, '_blank');
                menu.remove();
            });

            // Close button
            const closeButton = document.createElement('button');
            closeButton.textContent = 'Close';
            closeButton.style.padding = '8px 12px';
            closeButton.style.backgroundColor = '#f44336';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '4px';
            closeButton.style.cursor = 'pointer';
            closeButton.addEventListener('click', () => menu.remove());

            // Add elements to menu
            menu.appendChild(option1);
            menu.appendChild(option2);
            menu.appendChild(closeButton);

            // Add menu to document body
            document.body.appendChild(menu);

            // Close menu when clicking outside
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== button) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });

        } catch (error) {
            console.error('Error:', error);
            alert('Could not read clipboard. Please ensure you have granted access.');
        }
    }

    button.addEventListener('click', showOptions);
    document.body.appendChild(button);
})();
