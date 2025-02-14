// ==UserScript==
// @name         Search APN MA - Town of Tisbury
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Transform and search APN
// @author       Your Name
// @match        *://*/*
// ==/UserScript==

(function() {
    'use strict';

    // Crear el botón flotante
    const button = document.createElement('button');
    button.textContent = 'Search APN';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.padding = '10px';
    button.style.backgroundColor = '#0078D4';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    document.body.appendChild(button);

    // Función para transformar la APN
    function transformAPN(apn) {
        const match = apn.match(/^TISBM0*(\d+)([A-Z])B0.*(\d)$/);
        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return null;
    }

    // Función para copiar al portapapeles
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // Función para mostrar notificación
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '50px';
        notification.style.right = '10px';
        notification.style.padding = '10px';
        notification.style.backgroundColor = '#333';
        notification.style.color = '#fff';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 5000);
    }

    // Función para buscar la APN
    async function searchAPN() {
        let apnElement = document.querySelector("td[data-field-name='apn'] p");
        let apn = apnElement ? apnElement.textContent.trim().substring(0, 22) : '';

        if (!apn || apn.trim() === '') {
            apn = await navigator.clipboard.readText();
            apn = apn.trim().substring(0, 22);
        }

        console.log('APN extraída del campo o del portapapeles:', apn);

        if (apn.startsWith('TISBM')) {
            const transformedAPN = transformAPN(apn);
            if (transformedAPN) {
                copyToClipboard(transformedAPN);
                showNotification(`APN Transformada: ${transformedAPN}`);
                window.open('https://www.axisgis.com/TisburyMA/', '_blank');
            } else {
                showNotification('No se pudo transformar la APN. Por favor, asegúrese de que la APN es válida.');
            }
        } else {
            showNotification('Por favor, copie una APN válida que comience con TISBM.');
        }
    }

    // Agregar evento al botón
    button.addEventListener('click', searchAPN);
})();
