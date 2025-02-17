// ==UserScript==
// @name         AutoFill SpatialStream & ParcelQuest Login
// @namespace    http://tampermonkey.net/
// @version      3.4
// @description  Autocompletar login en SpatialStream (LB) y ParcelQuest (PQ) y abrir LightBox Vision automáticamente
// @author       [Tu Nombre]
// @match        https://login-spatialstream.prod.lightboxre.com/*
// @match        https://pqweb.parcelquest.com/*
// @grant        clipboardRead
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log("%c[Script] Iniciando ejecución...", "color: cyan; font-weight: bold;");

    const currentUrl = window.location.href.toLowerCase();
    console.log(`%c[Script] URL actual: ${currentUrl}`, "color: cyan;");

    // URLs esperadas
    const loginUrlSpatial = "https://login-spatialstream.prod.lightboxre.com/memberpages/login.aspx";
    const dashboardUrlSpatial = "https://login-spatialstream.prod.lightboxre.com/memberpages/default.aspx?ma=deckardtech";
    const loginUrlPQ = "https://pqweb.parcelquest.com/#login";

    // Usuarios válidos para SpatialStream (LB)
    const validUsers = ["Lorenvasquez", "Henrychaves", "FVelez", "KCano"];
    const validPQUser = "w4y6ed32"; // Usuario permitido para PQ

    async function getClipboardText() {
        try {
            return await navigator.clipboard.readText();
        } catch (error) {
            console.error("%c[Script] Error al obtener el portapapeles:", "color: red;", error);
            return null;
        }
    }

    function waitForElement(selector, callback, timeout = 15000) {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                clearInterval(interval);
                console.log(`%c[Script] Elemento encontrado: ${selector}`, "color: green;");
                callback(element);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                console.warn(`%c[Script] No se encontró el elemento: ${selector} tras ${timeout / 1000} segundos.`, "color: orange;");
            }
        }, 100);
    }

    async function loginSpatialStream() {
        const clipboardText = await getClipboardText();
        if (!validUsers.includes(clipboardText.trim())) {
            console.warn("%c[Script] Usuario no autorizado para LB. Deteniendo script.", "color: red;");
            return;
        }

        console.log("%c[Script] Detectada página de login en SpatialStream...", "color: yellow;");

        const userField = document.querySelector('input[name="ctl00$ctl00$MainContentPlaceHolder$MainContent$LoginUser$UserName"]');
        const passwordField = document.querySelector('input[name="ctl00$ctl00$MainContentPlaceHolder$MainContent$LoginUser$Password"]');
        const loginButton = document.querySelector('input[name="ctl00$ctl00$MainContentPlaceHolder$MainContent$LoginUser$LoginButton"]');

        if (userField && passwordField && loginButton) {
            console.log("%c[Script] Campos encontrados en SpatialStream, rellenando login...", "color: green;");

            userField.value = clipboardText;
            userField.dispatchEvent(new Event('input', { bubbles: true }));

            setTimeout(() => {
                console.log("%c[Script] Usuario pegado, ingresando contraseña...", "color: green;");
                passwordField.value = "Deckard2023";
                passwordField.dispatchEvent(new Event('input', { bubbles: true }));

                setTimeout(() => {
                    console.log("%c[Script] Contraseña pegada, esperando antes de enviar...", "color: green;");

                    setTimeout(() => {
                        console.log("%c[Script] Haciendo clic en 'Iniciar sesión'...", "color: green;");
                        loginButton.click();
                    }, 1000);

                }, 1000); // Retardo antes de enviar

            }, 1000); // Retardo después de ingresar usuario

        } else {
            console.error("%c[Script] No se encontraron los campos de login en SpatialStream.", "color: red;");
        }
    }

    function autoClickLightBox() {
        console.log("%c[Script] Detectada página de Dashboard de SpatialStream...", "color: yellow;");
        waitForElement('a.AppLinkSingleButton', (button) => {
            if (button.textContent.includes("Start LightBox Vision")) {
                console.log("%c[Script] Botón encontrado, haciendo clic...", "color: green;");
                button.click();
            } else {
                console.warn("%c[Script] El botón encontrado no coincide con 'Start LightBox Vision'.", "color: orange;");
            }
        });
    }

    function waitForPQElements(callback, timeout = 15000) {
        const startTime = Date.now();
        const observer = new MutationObserver(() => {
            const userField = document.querySelector('#txtName');
            const passwordField = document.querySelector('#txtPwd');
            const loginButton = document.querySelector('input[type="button"][data-bind="click: doLogin, enable: canDoLogin"]');

            if (userField && passwordField && loginButton) {
                console.log("%c[Script] Elementos detectados en PQ, iniciando login...", "color: green;");
                observer.disconnect(); // Detener la observación
                callback(userField, passwordField, loginButton);
            } else if (Date.now() - startTime > timeout) {
                observer.disconnect();
                console.warn("%c[Script] Tiempo de espera agotado. No se encontraron los campos de login en ParcelQuest.", "color: orange;");
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    async function loginParcelQuest() {
        const clipboardText = await getClipboardText();
        if (clipboardText.trim() !== validPQUser) {
            console.warn("%c[Script] Usuario no autorizado para PQ. Deteniendo script.", "color: red;");
            return;
        }

        console.log("%c[Script] Detectada página de login en ParcelQuest, esperando elementos...", "color: yellow;");
        waitForPQElements((userField, passwordField, loginButton) => {
            userField.value = clipboardText;
            userField.dispatchEvent(new Event('input', { bubbles: true }));

            setTimeout(() => {
                passwordField.value = "uxvezy";
                passwordField.dispatchEvent(new Event('input', { bubbles: true }));

                setTimeout(() => {
                    console.log("%c[Script] Haciendo clic en 'Log In' en PQ...", "color: green;");
                    loginButton.click();
                }, 500);
            }, 500);
        });
    }

    // Ejecutar el script según la URL detectada
    if (currentUrl.startsWith(loginUrlSpatial)) {
        loginSpatialStream();
    } else if (currentUrl.startsWith(dashboardUrlSpatial)) {
        autoClickLightBox();
    } else if (currentUrl.startsWith(loginUrlPQ)) {
        loginParcelQuest();
    } else {
        console.warn(`%c[Script] URL no reconocida: ${currentUrl}`, "color: red;");
    }
})();
