// ==UserScript==
// @name         NearbyParcels
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Añade un botón para abrir direcciones visibles en Google Maps o Google Search
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log('NearbyParcels script ejecutándose');

    // Sistema de colores modernos
    const THEME = {
        primary: '#4A90E2',       // Azul moderno
        secondary: '#4A90E2',     // Violeta moderno
        accent: '#00C853',        // Verde brillante
        dark: '#2C3E50',          // Gris oscuro
        medium: '#546E7A',        // Gris medio
        light: '#ECEFF1',         // Gris claro
        hover: '#3F51B5',         // Azul oscuro (hover)
        active: '#303F9F',        // Azul más oscuro (active)
        bgLight: '#FAFAFA',       // Fondo claro
        bgAlt: '#F5F5F5',         // Fondo alternativo
        bgHeader: '#E3F2FD',      // Fondo de encabezados
        border: '#CFD8DC',        // Color de bordes
        shadow: 'rgba(0, 0, 0, 0.1)' // Sombras sutiles
    };

    // Propiedades de estilo
    const STYLE = {
        fontFamily: 'Roboto, sans-serif',
        fontSizeBase: '14px',  // letra de botones
        fontSizeSmall: '12px', // titulos de las tablas
        fontSizeLarge: '19px',
        spacingXs: '3px',
        spacingSm: '3px',
        spacingMd: '10px',
        spacingLg: '18px',
        borderRadius: '8px',
        transition: '0.2s ease',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        boxShadowHover: '0 4px 8px rgba(0, 0, 0, 0.15)'
    };

    let collapseTimeout;

    function waitForButton() {
        const observer = new MutationObserver((mutations, obs) => {
            const button = document.querySelector('#btn_open_vetting_dlg');
            if (button) {
                obs.disconnect(); // Deja de observar cambios en el DOM
                createButton();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function createButton() {
        console.log('Creando el botón "Nearby Parcels"');

        // Crea el botón principal
        const button = document.createElement('button');
        button.innerHTML = 'Nearby Parcels';
        button.id = 'nearbyParcelsButton';
        button.style.marginLeft = '5px';
        button.style.width = '115px';
        button.style.height = '30.4px';
        button.style.backgroundColor = THEME.primary; // Usar color primario del tema
        button.style.color = 'white';
        button.style.fontSize = STYLE.fontSizeBase;
        button.style.position = 'relative';
        button.style.fontFamily = STYLE.fontFamily;
        button.style.top = '-1px';
        button.style.zIndex = '0';
        button.style.border = 'none';
        button.style.borderRadius = STYLE.borderRadius;
        button.style.transition = `all ${STYLE.transition}`;
        button.style.boxShadow = STYLE.boxShadow;
        button.style.cursor = 'pointer';

        // Añadir estilos hover y active
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = THEME.hover;
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = STYLE.boxShadowHover;
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = THEME.primary;
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = STYLE.boxShadow;
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = STYLE.boxShadow;
        });

        // Añadir botón al footer
        const footerDiv = document.getElementById('vetting_data_footer');
        if (footerDiv) {
            footerDiv.appendChild(button);
            console.log('Botón "Nearby Parcels" añadido');
        } else {
            console.log('No se encontró el div con la clase "card-footer".');
        }

        // Evento de clic para mostrar opciones
        button.addEventListener('click', showSecondaryButtons);
    }

    function showSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());

        createSecondaryButton('🗺️ Maps', () => searchVisibleAddresses('maps'));
        createSecondaryButton('📖 Google', () => searchVisibleAddresses('google'));

        clearTimeout(collapseTimeout);
        collapseTimeout = setTimeout(hideSecondaryButtons, 5000);
    }

    function hideSecondaryButtons() {
        document.querySelectorAll('.secondary-button').forEach(btn => btn.remove());
    }

    function createSecondaryButton(text, onClick) {
        let button = document.createElement('button');
        button.innerText = text;
        button.classList.add('secondary-button');
        button.style.marginLeft = '5px';
        button.style.backgroundColor = THEME.secondary; // Usar color secundario del tema
        button.style.color = 'white';
        button.style.fontSize = STYLE.fontSizeBase;
        button.style.border = 'none';
        button.style.borderRadius = STYLE.borderRadius;
        button.style.padding = `${STYLE.spacingXs} ${STYLE.spacingSm}`;
        button.style.transition = `all ${STYLE.transition}`;
        button.style.boxShadow = STYLE.boxShadow;
        button.style.cursor = 'pointer';

        // Añadir estilos hover y active
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = THEME.hover;
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = STYLE.boxShadowHover;
        });

        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = THEME.secondary;
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = STYLE.boxShadow;
        });

        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = STYLE.boxShadow;
        });

        button.addEventListener('click', onClick);

        let mainButton = document.querySelector('#nearbyParcelsButton');
        mainButton.parentNode.insertBefore(button, mainButton.nextSibling);
    }

    function searchVisibleAddresses(type) {
        const addressLinks = document.querySelectorAll('div.unfocused.dash-cell-value.cell-markdown p a[href^="https://www.google.com/search?"]');
        console.log(`Encontradas ${addressLinks.length} direcciones`);

        const uniqueAddresses = new Set();

        addressLinks.forEach(link => {
            if (isElementInViewport(link)) {
                const address = link.textContent.trim();
                console.log(`Dirección visible: ${address}`);

                if (!uniqueAddresses.has(address)) {
                    uniqueAddresses.add(address);

                    let url = type === 'maps'
                        ? `https://www.google.com/maps/search/${encodeURIComponent(address)}`
                        : `https://www.google.com/search?q=${encodeURIComponent(address)}`;

                    window.open(url, '_blank');
                }
            }
        });
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.bottom <= window.innerHeight
        );
    }

    waitForButton();
})();
