// ==UserScript==
// @name         Google Maps Super Tools (Complete)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Combina todas las funcionalidades: Ctrl+Click en sugerencias, botones para abrir en diferentes mapas y copiar enlaces, con mejoras en la interfaz.
// @author       Luis Escalante
// @match        *://www.google.com/maps/*
// @match        https://www.bing.com/maps?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==================== CONFIGURACIÓN ====================
    const CONFIG = {
        buttonSize: '50px',
        buttonFontSize: '24px',
        buttonPosition: '15px',
        buttonSpacing: '60px',
        buttonStyle: {
            position: 'fixed',
            right: '15px',
            width: '50px',
            height: '50px',
            fontSize: '24px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
            zIndex: '1000',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s'
        },
        buttonHoverStyle: {
            transform: 'scale(1.1)',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)'
        }
    };

    // ==================== FUNCIONES PRINCIPALES ====================

    // 1. Abrir direcciones con Ctrl+Click en sugerencias de Google Maps
    function setupCtrlClickForSuggestions() {
        if (!window.location.hostname.includes('google.com')) return;

        document.addEventListener('click', function(event) {
            if (event.ctrlKey) {
                const target = event.target.closest('.DgCNMb, .qBF1Pd'); // Contenedores de sugerencia

                if (target) {
                    event.preventDefault();
                    const direccionPartes = target.querySelectorAll('.cGyruf span, .W4Efsd > span:first-child > span:first-child');
                    const ciudadEstado = target.querySelector('.EmLCAe span, .W4Efsd > span:nth-child(2)');

                    if (direccionPartes.length > 0 && ciudadEstado) {
                        const direccion = Array.from(direccionPartes).map(span => span.innerText.trim()).join(' ');
                        const ubicacion = ciudadEstado.innerText.trim();
                        const direccionCompleta = `${direccion}, ${ubicacion}`;
                        const url = `https://www.google.com/maps/search/${encodeURIComponent(direccionCompleta)}`;
                        window.open(url, '_blank');
                    }
                }
            }
        });
    }

    // 2. Funcionalidad para copiar enlace y abrir en otros mapas
    async function getCoordinates() {
        try {
            // Primero intentar con el portapapeles
            const text = await navigator.clipboard.readText();
            const match = text.match(/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/);
            if (match) return text.replace(/\s+/g, "");
        } catch (error) {
            console.log("No se pudo leer el portapapeles:", error);
        }

        // Si no hay en portapapeles, obtener de la URL actual
        const urlParams = new URLSearchParams(window.location.search);
        if (window.location.hostname.includes("google.com")) {
            return urlParams.get("center")?.replace(/\s+/g, "");
        } else if (window.location.hostname.includes("bing.com")) {
            return urlParams.get("cp")?.replace(/\s+/g, "");
        }

        return null;
    }

    async function copyMapLink() {
        try {
            if (window.location.hostname.includes("google.com")) {
                await clickShareButton();
            } else {
                const coords = await getCoordinates();
                if (coords) {
                    const url = `https://www.google.com/maps?q=${coords}`;
                    await navigator.clipboard.writeText(url);
                    showNotification("✅ Link copied to clipboard");
                }
            }
        } catch (error) {
            console.error("Error copying link:", error);
            showNotification("❌ Error copying link");
        }
    }

    async function clickShareButton() {
        let inputField = document.querySelector('input.vrsrZe');
        if (!inputField) {
            let shareButton = document.querySelector('button[aria-label="Share"]');
            if (!shareButton) {
                showNotification("⚠️ Share button not found");
                return;
            }
            shareButton.click();
            console.log("🔄 Clicking 'Share'... waiting for link input.");
            inputField = await waitForElement('input.vrsrZe', 5000);
        }

        if (inputField && inputField.value) {
            await navigator.clipboard.writeText(inputField.value);

            // Buscar y hacer clic en el botón de cierre (ícono "X")
            let closeButton = document.querySelector('span.G6JA1c.google-symbols, button[aria-label="Close"]');
            if (closeButton) {
                closeButton.click();
                console.log("✅ Close button clicked.");
            } else {
                console.log("⚠️ Close button not found.");
            }

            showNotification("✅ Link copied to clipboard");
            console.log("✅ Link copied:", inputField.value);
        } else {
            showNotification("⚠️ No link found");
            console.log("❌ Input field found, but no link available.");
        }
    }

    async function openInMap(service) {
        const coordinates = await getCoordinates();
        if (!coordinates) {
            showNotification("⚠️ No valid coordinates found");
            return;
        }

        let url;
        switch (service) {
            case 'bing':
                url = `https://www.bing.com/maps?cp=${coordinates.replace(",", "~")}&lvl=19.8&style=g`;
                break;
            case 'duckduckgo':
                url = `https://duckduckgo.com/?q=${coordinates}&iaxm=maps`;
                break;
            case 'google':
                url = `https://www.google.com/maps?q=${coordinates}`;
                break;
            default:
                return;
        }

        window.open(url, '_blank');
    }

    // ==================== FUNCIONES UTILITARIAS ====================

    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const element = document.querySelector(selector);

            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    observer.disconnect();
                    reject(new Error(`Timeout waiting for element: ${selector}`));
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        Object.assign(notification.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            padding: '15px 25px',
            borderRadius: '10px',
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            zIndex: '9999',
            opacity: '0',
            transition: 'opacity 0.3s ease-in-out',
            pointerEvents: 'none'
        });

        document.body.appendChild(notification);

        // Mostrar la notificación con animación
        setTimeout(() => notification.style.opacity = '1', 10);

        // Ocultar después de 2 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    function createButton(id, emoji, title, onClick, top) {
        const button = document.createElement('button');
        button.id = id;
        button.textContent = emoji;
        button.title = title;

        // Aplicar estilos base
        Object.assign(button.style, CONFIG.buttonStyle);
        button.style.top = top;

        // Efecto hover
        button.addEventListener('mouseenter', () => {
            Object.assign(button.style, CONFIG.buttonHoverStyle);
        });
        button.addEventListener('mouseleave', () => {
            Object.assign(button.style, CONFIG.buttonStyle);
            button.style.top = top;
        });

        button.addEventListener('click', onClick);
        return button;
    }

    function createFloatingButtons() {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.id = 'gmst-buttons-container';
        Object.assign(buttonsContainer.style, {
            position: 'fixed',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: '1000'
        });

        const buttons = [
            {
                id: 'gmst-copy-link',
                emoji: '📋',
                title: 'Copy map link',
                onClick: copyMapLink
            },
            {
                id: 'gmst-toggle-service',
                emoji: window.location.hostname.includes('google.com') ? '🌐' : '🗺️',
                title: window.location.hostname.includes('google.com') ? 'Open in Bing Maps' : 'Open in Google Maps',
                onClick: () => openInMap(window.location.hostname.includes('google.com') ? 'bing' : 'google')
            },
            {
                id: 'gmst-duckduckgo',
                emoji: '🦆',
                title: 'Open in DuckDuckGo Maps',
                onClick: () => openInMap('duckduckgo')
            }
        ];

        buttons.forEach((btn, index) => {
            const button = createButton(btn.id, btn.emoji, btn.title, btn.onClick, `calc(50% - ${75 - (index * 60)}px)`);
            buttonsContainer.appendChild(button);
        });

        document.body.appendChild(buttonsContainer);
    }

    // ==================== INICIALIZACIÓN ====================

    // Configurar eventos
    setupCtrlClickForSuggestions();

    // Inyectar botones después de un pequeño retraso para asegurar que el DOM esté listo
    setTimeout(() => {
        createFloatingButtons();
    }, 1000);

})();
