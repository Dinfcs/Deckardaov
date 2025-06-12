// ==UserScript==
// @name         PR-MA - Town of Oak Bluffs
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Convierte APNs y realiza búsquedas en AxisGIS automáticamente
// @author       Tu Nombre
// @match        https://cyborg.deckard.com/listing/MA/dukes...town_of_oak_bluffs/_/*
// @match        https://www.axisgis.com/Oak_BluffsMA#
// ==/UserScript==

(function() {
    'use strict';

    // Función para convertir el APN
    function convertAPN(apn) {
        let parts = apn.match(/OAKBM0*(\d+?)B0*(\d{1,3})L(\d{3})/);
        if (parts) {
            let firstPart = parseInt(parts[1], 10);
            let secondPart = parseInt(parts[2], 10);
            let lastDigit = parts[3][2] !== '0' ? parts[3][2] : '';
            return `${firstPart}-${secondPart}${lastDigit ? '-' + lastDigit : ''}`;
        }
        return null;
    }

    // Función para mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.innerText = message;
        notification.style.position = 'fixed';
        notification.style.bottom = '10px';
        notification.style.right = '10px';
        notification.style.zIndex = 1000;
        notification.style.padding = '10px';
        notification.style.backgroundColor = '#f8d7da';
        notification.style.color = '#721c24';
        notification.style.border = '1px solid #f5c6cb';
        notification.style.borderRadius = '5px';
        notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 5000); // Duración de 5 segundos
    }

    // Agregar botón flotante en la página cyborg.deckard.com
    if (window.location.href.includes('cyborg.deckard.com/listing/MA/dukes...town_of_oak_bluffs/_/')) {
        function addButton() {
            let button = document.createElement('button');
            button.innerText = 'Search in PR';
            button.style.position = 'fixed';
            button.style.bottom = '10px';
            button.style.right = '10px';
            button.style.zIndex = 1000;
            button.style.padding = '10px';
            button.style.backgroundColor = '#0078D4';
            button.style.color = '#fff';
            button.style.border = 'none';
            button.style.borderRadius = '5px';
            button.style.cursor = 'pointer';
            button.addEventListener('click', () => {
                let apnField = document.querySelector('td.value[data-field-name="apn"] p');
                if (apnField && !apnField.textContent.startsWith('__NO_MATCH_FOUND')) {
                    let apn = apnField.textContent.match(/OAKBM\d+B\d+L\d+/)[0];
                    let convertedAPN = convertAPN(apn);
                    navigator.clipboard.writeText(convertedAPN).then(() => {
                        window.open('https://www.axisgis.com/Oak_BluffsMA', '_blank');
                    });
                } else {
                    navigator.clipboard.readText().then(apn => {
                        if (apn.includes(' ') || apn.length < 18) {
                            showNotification('Please copy a valid APN');
                        } else {
                            let convertedAPN = convertAPN(apn);
                            navigator.clipboard.writeText(convertedAPN).then(() => {
                                window.open('https://www.axisgis.com/Oak_BluffsMA', '_blank');
                            });
                        }
                    });
                }
            });
            document.body.appendChild(button);
        }
        addButton();
    }

    // Pegar el APN transformado en AxisGIS
    if (window.location.href === 'https://www.axisgis.com/Oak_BluffsMA') {
        window.addEventListener('load', () => {
            let searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.click();
                navigator.clipboard.readText().then(text => {
                    searchInput.value = text;
                    let event = new Event('input', { bubbles: true });
                    searchInput.dispatchEvent(event);
                    let enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', charCode: 13, keyCode: 13 });
                    searchInput.dispatchEvent(enterEvent);
                });
            }
        });
    }
})();
