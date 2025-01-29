// ==UserScript==
// @name         Extraer Dirección de Propiedad (con ventana flotante)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Extrae la dirección de la propiedad desde propDetails y la muestra en la página, con opción de copiar al portapapeles
// @author       Tu Nombre
// @match        https://www.michaelsvacationrentals.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("✅ Tampermonkey Script Cargado, esperando que propDetails aparezca...");

    // Función para crear la ventana flotante
    function mostrarVentanaFlotante(mensaje) {
        let ventana = document.createElement("div");
        ventana.style.position = "fixed";
        ventana.style.bottom = "20px";
        ventana.style.right = "20px";
        ventana.style.background = "rgba(0, 0, 0, 0.8)";
        ventana.style.color = "white";
        ventana.style.padding = "15px";
        ventana.style.borderRadius = "10px";
        ventana.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.3)";
        ventana.style.fontSize = "16px";
        ventana.style.zIndex = "9999";
        ventana.style.maxWidth = "300px";
        ventana.innerHTML = mensaje;

        document.body.appendChild(ventana);

        // Función para copiar al portapapeles
        ventana.addEventListener("click", () => {
            // Crear un elemento de texto temporal para copiar
            let tempTextArea = document.createElement("textarea");
            tempTextArea.value = mensaje.replace(/<br>/g, "\n").replace(/<[^>]+>/g, ""); // Eliminar HTML y convertir <br> en saltos de línea
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand("copy");
            document.body.removeChild(tempTextArea);

            // Notificar al usuario
            alert("📋 ¡Dirección copiada al portapapeles!");
        });

        // Si deseas que la ventana no se cierre automáticamente, simplemente elimina o comenta la siguiente línea:
        // setTimeout(() => {
        //     ventana.remove();
        // }, 10000); // 10 segundos
    }

    // Función para buscar `propDetails` en el código fuente
    function buscarPropDetails() {
        let pageSource = document.body.innerHTML;
        let match = pageSource.match(/propDetails:\s*({.*?"unit_id":.*?})/s);

        if (match && match[1]) {
            try {
                console.log("✅ propDetails encontrado, analizando JSON...");
                let propDetails = JSON.parse(match[1]);

                let address = propDetails.address || "Address not found";
                let address2 = propDetails.address2 || "N/A";
                let city = propDetails.city || "City not found";
                let state = propDetails.state || "Estado no encontrado";
                let zip = propDetails.zip || "Postal Code not found";

                console.log("📍 Property address:", address);
                console.log("📍 Address 2:", address2);
                console.log("📍 City:", city);
                console.log("📍 State:", state);
                console.log("📍 Código postal:", zip);

                // Mostrar la ventana flotante con la dirección completa
                let mensaje = `
                    📍 <b>Property address:</b><br>
                    ${address}, ${city}, ${state} ${zip}, ${address2}
                `;
                mostrarVentanaFlotante(mensaje);

                return true; // Se encontró, detener la búsqueda
            } catch (error) {
                console.error("❌ Error al analizar JSON:", error);
            }
        }
        return false; // No encontrado aún
    }

    // Intentar cada segundo hasta 15 intentos (máx. 15 segundos)
    let intentos = 0;
    let intervalo = setInterval(() => {
        if (buscarPropDetails() || intentos > 15) {
            clearInterval(intervalo); // Detener búsqueda si se encuentra o se agota el tiempo
            if (intentos > 15) console.warn("⏳ Se agotó el tiempo de espera para encontrar propDetails.");
        }
        intentos++;
    }, 1000);

})();
