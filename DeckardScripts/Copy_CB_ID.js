// ==UserScript==
// @name         Copiar Cyborg ID
// @namespace    https://cyborg.deckard.com/
// @version      1.0
// @description  Agrega un botón para copiar el identificador de la URL en páginas que contengan "/listing/"
// @author       Luchito & Dilan
// @match        *://*/*listing/*
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    'use strict';
    
    function getIdentifier() {
        const pathSegments = window.location.pathname.split("/");
        return pathSegments[pathSegments.length - 1]; // Último segmento de la URL
    }

    function copyToClipboard(text) {
        const formattedText = "Duplicate of " + text;
        GM_setClipboard(formattedText); // Usa Tampermonkey para copiar al portapapeles
        showFloatingMessage("Copiado: " + formattedText); // Muestra mensaje flotante
    }

    function showFloatingMessage(text) {
        const existingMessage = document.getElementById("copyMessage");
        if (existingMessage) {
            existingMessage.remove(); // Elimina mensaje anterior si existe
        }

        const message = document.createElement("div");
        message.id = "copyMessage";
        message.innerText = text;
        message.style.position = "fixed";
        message.style.bottom = "140px"; // Ajustar posición arriba del botón
        message.style.right = "20px";
        message.style.padding = "10px 15px";
        message.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        message.style.color = "#fff";
        message.style.borderRadius = "5px";
        message.style.fontSize = "14px";
        message.style.zIndex = "10000";
        message.style.opacity = "1";
        message.style.transition = "opacity 0.5s ease-in-out";

        document.body.appendChild(message);

        // Desaparece el mensaje después de 2 segundos
        setTimeout(() => {
            message.style.opacity = "0";
            setTimeout(() => message.remove(), 500); // Removerlo tras desaparecer
        }, 2000);
    }

    function createButton() {
        const existingButton = document.getElementById("copyIdentifierButton");
        if (existingButton) return; // Evita duplicados

        const button = document.createElement("button");
        button.id = "copyIdentifierButton";
        button.innerText = "Copiar ID";
        button.style.position = "fixed";
        button.style.bottom = "60px"; // Ajustar posición
        button.style.right = "20px";
        button.style.padding = "10px";
        button.style.backgroundColor = "#007bff";
        button.style.color = "#fff";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.cursor = "pointer";
        button.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.3)";
        button.style.zIndex = "10000";
        button.onclick = () => copyToClipboard(getIdentifier());

        document.body.appendChild(button);
    }

    setTimeout(() => {
        if (window.location.href.includes("/listing/")) {
            createButton();
        }
    }, 4000);
})();

