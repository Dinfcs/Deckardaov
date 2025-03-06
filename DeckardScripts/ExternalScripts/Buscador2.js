// ==UserScript==
// @name         Buscador
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Un script para mejorar la experiencia en Google Maps y Bing Maps
// @author       Luis Escalante
// @match        *://www.google.com/maps/*
// ==/UserScript==

(function () {
    async function getClipboardCoordinates() {
        try {
            const text = await navigator.clipboard.readText();
            const match = text.match(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/);
            if (match) {
                return text.replace(/\s+/g, ""); // Remueve espacios en caso de que los haya
            }
        } catch (error) {
            console.error("Error al leer el portapapeles:", error);
        }
        return null;
    }

    function getCurrentLocation() {
        const urlParams = new URLSearchParams(window.location.search);
        const centerParam = urlParams.get("center");
        if (centerParam) {
            return centerParam.replace(/\s+/g, ""); // Elimina espacios
        }
        return null;
    }

    async function openBingMaps() {
        let coordinates = await getClipboardCoordinates() || getCurrentLocation();
        if (coordinates) {
            coordinates = coordinates.replace(",", "~"); // Formato correcto para Bing Maps
            window.open(`https://www.bing.com/maps?cp=${coordinates}&lvl=19.8&style=g`, "_blank");
        } else {
            alert("No se encontraron coordenadas válidas.");
        }
    }

    async function openDuckDuckGoMaps() {
        const coordinates = await getClipboardCoordinates() || getCurrentLocation();
        if (coordinates) {
            window.open(`https://duckduckgo.com/?q=${coordinates}&iaxm=maps`, "_blank");
        } else {
            alert("No se encontraron coordenadas válidas.");
        }
    }

    function createButton(id, emoji, altText, onClick) {
        const button = document.createElement("button");
        button.id = id;
        button.textContent = emoji;
        button.title = altText;
        button.style.position = "fixed";
        button.style.right = "15px";
        button.style.width = "50px";
        button.style.height = "50px";
        button.style.fontSize = "24px";
        button.style.borderRadius = "10px";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.2)";
        button.style.zIndex = "1000";
        button.style.backgroundColor = "#fff";
        button.style.display = "flex";
        button.style.alignItems = "center";
        button.style.justifyContent = "center";

        button.addEventListener("click", onClick);

        return button;
    }

    function injectButtons() {
        const bingButton = createButton("bing-maps-button", "🌐", "Abrir en Bing Maps", openBingMaps);
        const duckButton = createButton("duckduckgo-maps-button", "🦆", "Abrir en DuckDuckGo Maps", openDuckDuckGoMaps);

        bingButton.style.top = "50%";
        duckButton.style.top = "calc(50% + 60px)";

        document.body.appendChild(bingButton);
        document.body.appendChild(duckButton);
    }

    injectButtons();
})();
