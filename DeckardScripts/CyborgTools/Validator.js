// ==UserScript==
// @name         Validador de Campos
// @version      0.1
// @description  Valida campos en una tabla y muestra alertas si es necesario
// @author       Lucho
// @match        *://*/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';
    // Añadir estilos CSS para la animación
    const estiloAnimacion = document.createElement('style');
    estiloAnimacion.type = 'text/css';
    estiloAnimacion.innerHTML = `
        @keyframes inflarDesinflar {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        .animacion {
            animation: inflarDesinflar 1s infinite;
        }
    `;
    document.head.appendChild(estiloAnimacion);
    // Variable de control para las notificaciones
    let notificacionMostrada = false;
    let notificacion;
    // Función que crea una notificación roja
    function mostrarNotificacion(mensaje) {
        if (notificacionMostrada) return;
        // Crear el div de la notificación
        notificacion = document.createElement('div');
        notificacion.style.position = 'fixed';
        notificacion.style.top = '2.5%';
        notificacion.style.right = '39%';
        notificacion.style.backgroundColor = 'red';
        notificacion.style.color = 'white';
        notificacion.style.padding = '5px';
        notificacion.style.zIndex = '1000';
        notificacion.textContent = mensaje;
        notificacion.classList.add('animacion'); // Añadir la clase de animación
        // Añadir el div al body
        document.body.appendChild(notificacion);
        // Marcar la notificación como mostrada
        notificacionMostrada = true;
    }
    // Función que elimina la notificación
    function eliminarNotificacion() {
        if (notificacionMostrada && notificacion) {
            document.body.removeChild(notificacion);
            notificacionMostrada = false;
        }
    }
    // Función que valida los campos
    function validarCampos() {
        // Selecciona la tabla dentro del div con id 'div_vetted_data'
        let tabla = document.querySelector("#div_vetted_data #vetted_result_table");
        if (!tabla) {
            return;
        }
        let estructuraCorrecta = true;
        let apnCorrecto = true;
        // Validar campo "structure" y "unit_number"
        let estructuraElementos = tabla.querySelectorAll("td.value[data-field-name='structure'] p");
        estructuraElementos.forEach(elemento => {
            // Comprueba si el texto comienza con la palabra 'adu'
            if (elemento.textContent.trim().startsWith('adu')) {
                // Busca el siguiente campo 'unit_number'
                let fila = elemento.closest('tr');
                let siguienteElemento = fila ? fila.parentElement.querySelector("tr td.value[data-field-name='unit_number'] p") : null;
                // Comprueba si el texto comienza con 'ADU'
                if (!siguienteElemento || !siguienteElemento.textContent.trim().startsWith('ADU')) {
                    estructuraCorrecta = false;
                }
            }
        });
        // Validar campo "apn" y "address"
        let apnElementos = tabla.querySelectorAll("td.value[data-field-name='apn'] p");
        apnElementos.forEach(elemento => {
            // Comprueba si el texto no comienza con '__NO_MATCH_FOUND'
            if (!elemento.textContent.trim().startsWith('__NO_MATCH_FOUND')) {
                // Busca el campo 'address'
                let addressElemento = tabla.querySelector("td.value[data-field-name='address'] p");
                // Comprueba si el campo 'address' contiene la palabra 'Unit # unk'
                if (addressElemento && addressElemento.textContent.includes('Unit # unk')) {
                    apnCorrecto = false;
                }
            }
        });
        // Mostrar notificaciones según las validaciones
        if (!estructuraCorrecta) {
            mostrarNotificacion('Missing unitbox');
        } else if (!apnCorrecto) {
            mostrarNotificacion('Forgot to delete AO');
        } else {
            eliminarNotificacion(); // Elimina la notificación si todo está correcto
        }
    }
    // Observador para cambios en la tabla
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' || mutation.type === 'subtree') {
                validarCampos();
            }
        });
    });
    // Configuración del observador
    const config = { childList: true, subtree: true };
    // Función para inicializar el observador con un retraso
    function iniciarObservador() {
        // Selecciona la tabla dentro del div con id 'div_vetted_data'
        let tabla = document.querySelector("#div_vetted_data #vetted_result_table");
        if (tabla) {
            // Comienza a observar la tabla para cambios en el DOM
            observer.observe(tabla, config);
            // Ejecuta la función de validación inicialmente
            validarCampos();
        }
    }
    // Espera 5 segundos antes de iniciar el observador
    setTimeout(iniciarObservador, 5000);
})();
