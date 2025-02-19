// ==UserScript==
// @name         AutoFill SpatialStream & ParcelQuest Login
// @version      3.9
// @description  Autocompletar login en SpatialStream (LB) y ParcelQuest (PQ) y abrir LightBox Vision automáticamente
// @author       Lucho
// @match        https://login-spatialstream.prod.lightboxre.com/*
// @match        https://pqweb.parcelquest.com/*
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    console.log("%c[Script] Iniciando ejecución...", "color: cyan; font-weight: bold;");

    const currentUrl = window.location.href.toLowerCase();
    console.log(`%c[Script] URL actual: ${currentUrl}`, "color: cyan;");

    const loginUrlSpatial = "https://login-spatialstream.prod.lightboxre.com/memberpages/login.aspx";
    const dashboardUrlSpatial = "https://login-spatialstream.prod.lightboxre.com/memberpages/default.aspx?ma=deckardtech";
    const loginUrlPQ = "https://pqweb.parcelquest.com/#login";

    async function getClipboardText() {
        try {
            const text = await navigator.clipboard.readText();
            return text.trim();
        } catch (error) {
            console.error("%c[Script] Error al obtener el portapapeles:", "color: red;", error);
            return null;
        }
    }

    function extractUsername(prefix, text) {
        if (text.startsWith(prefix)) {
            return text.replace(prefix, "").trim();
        }
        return null;
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
        const username = extractUsername("LB - ", clipboardText);
        if (!username) {
            console.warn("%c[Script] Usuario no autorizado para LB. Deteniendo script.", "color: red;");
            return;
        }

        console.log("%c[Script] Detectada página de login en SpatialStream...", "color: yellow;");

        waitForElement('input[name="ctl00$ctl00$MainContentPlaceHolder$MainContent$LoginUser$UserName"]', (userField) => {
            // Borrar el campo completamente antes de pegar el nuevo usuario
            userField.value = "";
            userField.dispatchEvent(new Event('input', { bubbles: true }));
            userField.dispatchEvent(new Event('change', { bubbles: true }));

            console.log("%c[Script] Campo de usuario borrado.", "color: green;");

            setTimeout(() => {
                userField.focus();
                userField.value = username;
                userField.dispatchEvent(new Event('input', { bubbles: true }));
                userField.dispatchEvent(new Event('change', { bubbles: true }));

                console.log("%c[Script] Usuario pegado en el campo de login en SpatialStream.", "color: green;");

                setTimeout(() => {
                    const passwordField = document.querySelector('input[name="ctl00$ctl00$MainContentPlaceHolder$MainContent$LoginUser$Password"]');
                    const loginButton = document.querySelector('input[name="ctl00$ctl00$MainContentPlaceHolder$MainContent$LoginUser$LoginButton"]');

                    if (!passwordField || !loginButton) {
                        console.error("%c[Script] No se encontraron los campos de contraseña o botón de login en SpatialStream.", "color: red;");
                        return;
                    }

                    if (passwordField.value.trim() === "") {
                        console.log("%c[Script] Campo de contraseña vacío. Esperando que el usuario ingrese la clave manualmente.", "color: orange;");
                        return;
                    }

                    console.log("%c[Script] Campo de contraseña ya tiene una clave. Esperando 1 segundo para enviar el formulario...", "color: green;");

                    setTimeout(() => {
                        console.log("%c[Script] Haciendo clic en 'Iniciar sesión'...", "color: green;");
                        loginButton.click();
                    }, 1000);
                }, 1000);
            }, 500);
        });
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
                observer.disconnect();
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
        const username = extractUsername("PQ - ", clipboardText);
        if (!username) {
            console.warn("%c[Script] Usuario no autorizado para PQ. Deteniendo script.", "color: red;");
            return;
        }

        console.log("%c[Script] Detectada página de login en ParcelQuest, esperando elementos...", "color: yellow;");

        waitForPQElements((userField, passwordField, loginButton) => {
            userField.value = "";
            userField.dispatchEvent(new Event('input', { bubbles: true }));
            userField.dispatchEvent(new Event('change', { bubbles: true }));

            setTimeout(() => {
                userField.value = username;
                userField.dispatchEvent(new Event('input', { bubbles: true }));
                userField.dispatchEvent(new Event('change', { bubbles: true }));

                console.log("%c[Script] Usuario pegado en ParcelQuest.", "color: green;");

                setTimeout(() => {
                    passwordField.value = "uxvezy";
                    passwordField.dispatchEvent(new Event('input', { bubbles: true }));

                    setTimeout(() => {
                        console.log("%c[Script] Haciendo clic en 'Log In' en PQ...", "color: green;");
                        loginButton.click();
                    }, 500);
                }, 500);
            }, 500);
        });
    }

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
