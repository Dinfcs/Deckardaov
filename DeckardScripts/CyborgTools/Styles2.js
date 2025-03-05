// ==UserScript==
// @name         Estilos Modernos y Compactos
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  Estilos modernos y compactos para una mejor experiencia de usuario.
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Lista de selectores excluidos
    const EXCLUSIONS = `
        #window_vetting_dlg *,
        #vetting_data_footer *,
        .pop_up_header_container *,
        #iframe-button-container *,
        .fancybox-button,
        [data-test-id="float-window-minimize-or-restore-btn"],
        [data-test-id="float-window-close-btn"],
        .project-data-table,
        .project-data-table *
    `;

    // Sistema de colores modernos
    const THEME = {
        primary: '#4A90E2',       // Azul moderno
        secondary: '#7C4DFF',     // Violeta moderno
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
        fontSizeSmall: '13px', // titulos de las tablas
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

    /**
     * Agrega un elemento de estilo al documento
     * @param {string} css - Contenido CSS a agregar
     */
    const addStyle = (css) => {
        if (document.querySelector('#custom-cyborg-styles')) return;

        const style = document.createElement('style');
        style.id = 'custom-cyborg-styles';
        style.textContent = css;
        document.head.appendChild(style);
    };

    /**
     * Genera y aplica los estilos CSS modernos
     */
    const applyModernStyles = () => {
        const css = `
            /* =================
               1. RESET BÁSICO
               ================= */
            .cyborg-str-tool *:not(${EXCLUSIONS}) {

                box-sizing: border-box;
                font-family: ${STYLE.fontFamily};
            }

            /* =================
               2. ENCABEZADOS
               ================= */
            .cyborg-str-tool h1:not(${EXCLUSIONS}),
            .cyborg-str-tool h2:not(${EXCLUSIONS}),
            .cyborg-str-tool h3:not(${EXCLUSIONS}),
            .cyborg-str-tool h4:not(${EXCLUSIONS}),
            .cyborg-str-tool h5:not(${EXCLUSIONS}),
            .cyborg-str-tool h6:not(${EXCLUSIONS}) {
                color: #CAD92B !important;
                font-weight: 600 !important;
                font-size: ${STYLE.fontSizeLarge} !important;
                margin-bottom: ${STYLE.spacingSm} !important;
            }



            /* =================
               3. BOTONES MODERNOS
               ================= */
            .cyborg-str-tool button:not(${EXCLUSIONS}),
            .cyborg-str-tool .btn:not(${EXCLUSIONS}),
            #btn_submit_vetting_dlg,
            #btn_record_no_matching_parcel_found,
            #btn_record_listing_not_live,
            #btn_open_vetting_dlg,
            #btn_open_vetting_dlg_as_qa_mode {
                background-color: ${THEME.primary} !important;
                color: white !important;
                border: none !important;
                padding: ${STYLE.spacingSm} ${STYLE.spacingMd} !important;
                font-size: ${STYLE.fontSizeBase} !important;
                border-radius: ${STYLE.borderRadius} !important;
                box-shadow: ${STYLE.boxShadow} !important;
                transition: all ${STYLE.transition} !important;
                cursor: pointer !important;

                align-items: center !important;
                justify-content: center !important;
                gap: ${STYLE.spacingXs} !important;
            }

            .cyborg-str-tool button:hover:not(${EXCLUSIONS}),
            .cyborg-str-tool .btn:hover:not(${EXCLUSIONS}),
            #btn_submit_vetting_dlg:hover,
            #btn_record_no_matching_parcel_found:hover,
            #btn_record_listing_not_live:hover,
            #btn_open_vetting_dlg:hover,
            #btn_open_vetting_dlg_as_qa_mode:hover {
                background-color: ${THEME.hover} !important;
                box-shadow: ${STYLE.boxShadowHover} !important;
                transform: translateY(-1px) !important;
            }

            .cyborg-str-tool button:active:not(${EXCLUSIONS}),
            .cyborg-str-tool .btn:active:not(${EXCLUSIONS}),
            #btn_submit_vetting_dlg:active,
            #btn_record_no_matching_parcel_found:active,
            #btn_record_listing_not_live:active,
            #btn_open_vetting_dlg:active,
            #btn_open_vetting_dlg_as_qa_mode:active {
                transform: translateY(0) !important;
                box-shadow: ${STYLE.boxShadow} !important;
            }

            /* =================
               4. TABLAS MODERNAS
               ================= */
            .cyborg-str-tool table:not(${EXCLUSIONS}) {
                width: 100% !important;
                border-collapse: collapse !important;
                font-size: ${STYLE.fontSizeSmall} !important;
                border-radius: ${STYLE.borderRadius} !important;
                overflow: hidden !important;
                box-shadow: ${STYLE.boxShadow} !important;
            }

            .cyborg-str-tool table th:not(${EXCLUSIONS}),
            .cyborg-str-tool table td:not(${EXCLUSIONS}) {
                padding: ${STYLE.spacingSm} !important;
                border-bottom: 1px solid ${THEME.border} !important;
                text-align: left !important;
            }

            .cyborg-str-tool table th:not(${EXCLUSIONS}) {
                background-color: ${THEME.bgHeader} !important;
                color: ${THEME.dark} !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
            }

            .cyborg-str-tool table tr:nth-child(even):not(${EXCLUSIONS}) {
                background-color: ${THEME.bgLight} !important;
            }

            .cyborg-str-tool table tr:hover:not(${EXCLUSIONS}) {
                background-color: ${THEME.light} !important;
            }

            /* =================
               5. ENLACES
               ================= */
            .cyborg-str-tool a:not(${EXCLUSIONS}) {
                color: ${THEME.primary} !important;
                text-decoration: none !important;
                transition: color ${STYLE.transition} !important;
            }

            .cyborg-str-tool a:hover:not(${EXCLUSIONS}) {
                color: ${THEME.hover} !important;
                text-decoration: underline !important;
            }

            /* =================
               6. INPUTS Y FORMULARIOS
               ================= */
            .cyborg-str-tool input:not(${EXCLUSIONS}),
            .cyborg-str-tool select:not(${EXCLUSIONS}),
            .cyborg-str-tool textarea:not(${EXCLUSIONS}) {
                background-color: white !important;
                border: 1px solid ${THEME.border} !important;
                border-radius: ${STYLE.borderRadius} !important;
                padding: ${STYLE.spacingXs} ${STYLE.spacingSm} !important;
                font-size: ${STYLE.fontSizeBase} !important;
                transition: border-color ${STYLE.transition}, box-shadow ${STYLE.transition} !important;
            }

            .cyborg-str-tool input:focus:not(${EXCLUSIONS}),
            .cyborg-str-tool select:focus:not(${EXCLUSIONS}),
            .cyborg-str-tool textarea:focus:not(${EXCLUSIONS}) {
                border-color: ${THEME.primary} !important;
                box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2) !important;
                outline: none !important;
            }


        `;

        addStyle(css);
        document.body.classList.add('cyborg-str-tool');
    };

    /**
     * Simula clic en el botón de envío
     */
    const submitVettingForm = () => {
        const button = document.getElementById('btn_submit_vetting_dlg');
        if (button) button.click();
    };

    // Inicialización basada en el estado del documento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(applyModernStyles));
    } else {
        requestAnimationFrame(applyModernStyles);
    }

    // Atajo de teclado: Ctrl+S para enviar formulario
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            submitVettingForm();
        }
    });

    // Observer para aplicar estilos a elementos dinámicos
    const observeDOM = () => {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    requestAnimationFrame(() => {
                        document.body.classList.add('cyborg-str-tool');
                    });
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    };

    // Iniciar observer si el DOM ya está cargado
    if (document.readyState !== 'loading') {
        observeDOM();
    } else {
        document.addEventListener('DOMContentLoaded', observeDOM);
    }
})();
