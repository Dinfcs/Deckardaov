// ==UserScript==
// @name         Copiar Nombre de Host y Licencias al Portapapeles
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Copia el contenido de los campos host_name y probable_licenses al portapapeles al hacer clic en ellos, mostrando notificaciones (eventos se agregan solo una vez)
// @author       Lucho
// @match        https://cyborg.deckard.com/listing/*/STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Variables para rastrear si ya se agregaron los eventos
    let hostNameEventAdded = false;
    let licenseEventAdded = false;

    // Función para copiar el texto al portapapeles
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Texto copiado al portapeles:', text);
            showNotification(`${text} copied`);
        }).catch(function(err) {
            console.error('Error al copiar el texto al portapapeles:', err);
        });
    }

    // Función para mostrar una notificación
    function showNotification(message) {
        let notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '45%';
        notification.style.right = '70%';
        notification.style.padding = "5px";
        notification.style.backgroundColor = "#000";
        notification.style.color = "#fff";
        notification.style.borderRadius = "3px";
        notification.style.zIndex = '1000';
        notification.textContent = message;

        document.body.appendChild(notification);

        // Ocultar la notificación después de 3 segundos
        setTimeout(function() {
            document.body.removeChild(notification);
        }, 3000);
    }

    // Función para agregar el evento de clic a los campos especificados
    function addClickEvents() {
        // Campo host_name
        let hostNameField = document.querySelector('td.value[data-field-name="host_name"]');
        if (hostNameField && !hostNameEventAdded) {
            hostNameField.addEventListener('click', function() {
                let hostNameValue = hostNameField.textContent.trim();
                copyToClipboard(hostNameValue);
            });
            hostNameEventAdded = true;
            console.log('Evento click agregado al campo host_name');
        }

        // Campo probable_licenses
        let licenseField = document.querySelector('td.value[data-field-name="probable_licenses"]');
        if (licenseField && !licenseEventAdded) {
            licenseField.addEventListener('click', function() {
                let licenseValue = licenseField.textContent.trim();
                copyToClipboard(licenseValue);
            });
            licenseEventAdded = true;
            console.log('Evento click agregado al campo probable_licenses');
        }
    }

    // Observar cambios en el DOM para detectar cuando se agreguen los campos
    let observer = new MutationObserver(function(mutations) {
        if (!hostNameEventAdded || !licenseEventAdded) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    addClickEvents();
                }
            });
        }
    });

    // Iniciar el observador en el cuerpo del documento
    observer.observe(document.body, { childList: true, subtree: true });

    // Ejecutar también al cargar la página por si los campos ya están presentes
    addClickEvents();
})();
