// ==UserScript==
// @name         Copiar Nombre de Host al Portapapeles
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Copia el contenido del campo host_name al portapapeles al hacer clic en él, mostrando notificaciones
// @author       Lucho
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Función para copiar el texto al portapapeles
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            console.log('Texto copiado al portapapeles:', text);
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

    // Función para agregar el evento de clic al campo host_name
    function addClickEvent() {
        let hostNameField = document.querySelector('td.value[data-field-name="host_name"]');

        if (hostNameField) {
            hostNameField.addEventListener('click', function() {
                let hostNameValue = hostNameField.textContent;
                copyToClipboard(hostNameValue);
            });

            console.log('Evento click agregado al campo host_name');
        } else {
            console.log('No se encontró el campo host_name');
        }
    }

    // Observar cambios en el DOM para detectar cuando se agregue el campo host_name
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                addClickEvent();
            }
        });
    });

    // Iniciar el observador en el cuerpo del documento
    observer.observe(document.body, { childList: true, subtree: true });

})();
