// ==UserScript==
// @name         Styles2
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Rediseño moderno con tablas compactas y optimizadas para visualización eficiente
// @author       Luis Escalante (optimizado)
// @match        https://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Lista de selectores excluidos
    const EXCLUSIONS = `
        #window_vetting_dlg *,
        #vetting_data_footer *,
        .pop_up_header_container *,
        #iframe-button-container *,
        [style*="Nearby Parcels"],
        .fancybox-button,
        [data-test-id="float-window-minimize-or-restore-btn"],
        [data-test-id="float-window-close-btn"],
        .project-data-table,
        .project-data-table *
    `;

    // Sistema de colores modernos (optimizado)
    const THEME = {
        // Colores principales
        primary: '#23A9D8',     // Azul moderno para elementos principales
        secondary: '#23A9D8',   // Verde para elementos secundarios
        accent: '#f39c12',      // Naranja para acentos y destacados

        // Neutrales
        dark: '#34495e',       // Gris oscuro para texto principal
        medium: '#7f8c8d',     // Gris medio para texto secundario
        light: '#ecf0f1',      // Gris claro para fondos

        // Estados
        hover: '#2980b9',      // Azul oscuro para hover
        active: '#277fae',     // Verde oscuro para elementos activos

        // Backgrounds
        bgLight: '#f8f9fa',    // Fondo claro general
        bgAlt: '#e9ecef',      // Fondo alternativo
        bgHeader: '#dfe6e9',   // Fondo de encabezados

        // Elementos de interfaz
        border: '#ced4da',     // Color de bordes
        shadow: 'rgba(0, 0, 0, 0.05)' // Sombras (más sutiles)
    };

    // Propiedades de estilo (optimizadas para compacidad)
    const STYLE = {
        // Tipografía
        fontFamily: 'Roboto,',
        fontSizeBase: '13px',
        fontSizeSmall: '11px',
        fontSizeLarge: '15px',
        fontSizeHeader: '18px',

        // Espaciado (reducido)
        spacingXs: '2px',
        spacingSm: '4px',
        spacingMd: '8px',
        spacingLg: '12px',

        // Efectos (más sutiles)
        borderRadius: '3px',
        transition: '0.2s ease',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        boxShadowHover: '0 2px 5px rgba(0, 0, 0, 0.1)',
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
     * Genera y aplica los estilos CSS modernos con tablas compactas
     */
    const applyCompactStyles = () => {
        const css = `
            /* Estilos generales */
            .cyborg-str-tool {
                font-family: ${STYLE.fontFamily};
                color: ${THEME.dark};
            }

            /* Encabezados */
            .cyborg-str-tool h1:not(${EXCLUSIONS}),
            .cyborg-str-tool h2:not(${EXCLUSIONS}),
            .cyborg-str-tool h3:not(${EXCLUSIONS}),
            .cyborg-str-tool h4:not(${EXCLUSIONS}),
            .cyborg-str-tool h5:not(${EXCLUSIONS}),
            .cyborg-str-tool h6:not(${EXCLUSIONS}) {
                font-weight: 600 !important;
                color: ${THEME.dark} !important;
                font-size: ${STYLE.fontSizeLarge} !important;
                margin-bottom: ${STYLE.spacingMd} !important;
                letter-spacing: -0.01em !important;
            }

            /* Título del listado */
            .page_header_bar h4 span {
                font-size: ${STYLE.fontSizeHeader} !important;
                font-weight: 600 !important;
                color: #CAD92B !important;
                letter-spacing: -0.02em !important;
            }

            /* Estilos de botones */
            .cyborg-str-tool button:not(${EXCLUSIONS}):not(#btn_submit_vetting_dlg),
            .cyborg-str-tool .btn:not(${EXCLUSIONS}):not(#btn_submit_vetting_dlg),
            #btn_submit_vetting_dlg,
            #btn_record_no_matching_parcel_found,
            #btn_record_listing_not_live,
            #btn_open_vetting_dlg,
            #btn_open_vetting_dlg_as_qa_mode {
                background-color: ${THEME.primary} !important;
                color: white !important;
                border: none !important;
                border-radius: ${STYLE.borderRadius} !important;
                padding: ${STYLE.spacingXs} ${STYLE.spacingSm} !important;
                font-size: ${STYLE.fontSizeBase} !important;
                font-weight: 500 !important;
                transition: all ${STYLE.transition} !important;
                box-shadow: ${STYLE.boxShadow} !important;
                cursor: pointer !important;
                align-items: center !important;
                justify-content: center !important;
                height: 30px !important; /* Altura fija para más compacidad */
            }

            /* Botones especiales */
            #btn_submit_vetting_dlg {
                background-color: ${THEME.secondary} !important;
                font-weight: 600 !important;
            }

            /* Botones secundarios */
            #btn_record_no_matching_parcel_found,
            #btn_record_listing_not_live {
                background-color: ${THEME.medium} !important;
            }

            /* Interacciones de botones */
            .cyborg-str-tool button:not(${EXCLUSIONS}):hover,
            .cyborg-str-tool .btn:not(${EXCLUSIONS}):hover {
                background-color: ${THEME.hover} !important;

            }

            #btn_submit_vetting_dlg:hover {
                background-color: ${THEME.active} !important;
            }

            #btn_submit_vetting_dlg:hover {
                background-color: ${THEME.active} !important;
            }

            /* Enlaces */
            .cyborg-str-tool a:not(${EXCLUSIONS}) {
                color: ${THEME.primary} !important;
                text-decoration: none !important;
                font-weight: 500 !important;
                transition: all ${STYLE.transition} !important;
                border-bottom: 1px solid transparent !important;
            }

            .cyborg-str-tool a:visited:not(${EXCLUSIONS}) {
                color: #7952b3 !important; /* Púrpura más suave para visitados */
            }

            .cyborg-str-tool a:hover:not(${EXCLUSIONS}) {
                color: ${THEME.hover} !important;
                border-bottom: 1px solid ${THEME.hover} !important;
                text-decoration: none !important;
            }

            /* Tablas compactas */
            .cyborg-str-tool table:not(${EXCLUSIONS}):not(.table-hover) {
                border-collapse: collapse !important; /* Collapse en lugar de separate para más compacidad */
                width: 100% !important;
                font-size: ${STYLE.fontSizeSmall} !important;
                border: 1px solid ${THEME.border} !important;
                border-radius: ${STYLE.borderRadius} !important;
                overflow: hidden !important;
                box-shadow: none !important; /* Sin sombra para tablas */
                margin-bottom: ${STYLE.spacingSm} !important; /* Margen inferior reducido */
            }

            .cyborg-str-tool table th:not(${EXCLUSIONS}):not(.bg-secondary) {
                background-color: ${THEME.bgHeader} !important;
                color: ${THEME.dark} !important;
                font-size: ${STYLE.fontSizeSmall} !important;
                font-weight: 600 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.03em !important;
                padding: ${STYLE.spacingXs} ${STYLE.spacingSm} !important; /* Padding más pequeño */
                border-bottom: 1px solid ${THEME.border} !important;
                position: sticky !important;
                top: 0 !important;
                z-index: 10 !important;
                height: 20px !important; /* Altura fija para encabezados */
            }

            .cyborg-str-tool table td:not(${EXCLUSIONS}):not(.bg-secondary) {
                padding: ${STYLE.spacingXs} ${STYLE.spacingSm} !important; /* Padding más pequeño */
                vertical-align: middle !important;
                border-bottom: 1px solid ${THEME.border} !important;
                color: ${THEME.dark} !important;
                transition: background-color ${STYLE.transition} !important;
                height: 22px !important; /* Altura fija para celdas */
                max-height: 22px !important; /* Altura máxima para celdas */
                white-space: nowrap !important; /* Evita saltos de línea */
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }

            /* Filas alternadas y hover */
            .cyborg-str-tool table tr:nth-child(even):not(${EXCLUSIONS}) {
                background-color: ${THEME.bgLight} !important;
            }

            .cyborg-str-tool table tr:nth-child(odd):not(${EXCLUSIONS}) {
                background-color: white !important;
            }

            .cyborg-str-tool table tr:hover:not(${EXCLUSIONS}) td {
                background-color: rgba(52, 152, 219, 0.05) !important;
            }

            /* Última fila sin borde inferior */
            .cyborg-str-tool table tr:last-child td:not(${EXCLUSIONS}) {
                border-bottom: none !important;
            }

            /* Campos de filtro compactos */
            .cyborg-str-tool table input[type="text"]:not(${EXCLUSIONS}),
            .cyborg-str-tool input[type="text"]:not(${EXCLUSIONS}),
            .cyborg-str-tool input[type="search"]:not(${EXCLUSIONS}) {
                background-color: white !important;
                border: 1px solid ${THEME.border} !important;
                border-radius: ${STYLE.borderRadius} !important;
                padding: ${STYLE.spacingXs} !important; /* Padding más pequeño */
                font-size: ${STYLE.fontSizeSmall} !important;
                width: 100% !important;
                box-sizing: border-box !important;
                transition: all ${STYLE.transition} !important;
                color: ${THEME.dark} !important;
                height: 20px !important; /* Altura fija para inputs */
            }

            .cyborg-str-tool table input[type="text"]:focus:not(${EXCLUSIONS}),
            .cyborg-str-tool input[type="text"]:focus:not(${EXCLUSIONS}),
            .cyborg-str-tool input[type="search"]:focus:not(${EXCLUSIONS}) {
                border-color: ${THEME.primary} !important;
                outline: none !important;
                box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.15) !important;
            }

            /* Checkbox compactos */
            .cyborg-str-tool input[type="checkbox"]:not(${EXCLUSIONS}) {
                appearance: none !important;
                -webkit-appearance: none !important;
                height: 14px !important; /* Más pequeño */
                width: 14px !important; /* Más pequeño */
                border: 1px solid ${THEME.border} !important;
                border-radius: 2px !important;
                background-color: white !important;
                cursor: pointer !important;
                margin: 0 !important;
                vertical-align: middle !important;
                position: relative !important;
                top: -1px !important;
            }

            .cyborg-str-tool input[type="checkbox"]:checked:not(${EXCLUSIONS}) {
                background-color: ${THEME.primary} !important;
                border-color: ${THEME.primary} !important;
                position: relative !important;
            }

            .cyborg-str-tool input[type="checkbox"]:checked:not(${EXCLUSIONS})::after {
                content: "" !important;
                position: absolute !important;
                left: 4px !important; /* Ajustado para tamaño más pequeño */
                top: 1px !important; /* Ajustado para tamaño más pequeño */
                width: 3px !important; /* Ajustado para tamaño más pequeño */
                height: 7px !important; /* Ajustado para tamaño más pequeño */
                border: solid white !important;
                border-width: 0 2px 2px 0 !important;
                transform: rotate(45deg) !important;
            }

            /* Labels compactos */
            .cyborg-str-tool label.form-check-label:not(${EXCLUSIONS}) {
                margin-left: ${STYLE.spacingSm} !important;
                font-size: ${STYLE.fontSizeSmall} !important;
                cursor: pointer !important;
            }

            /* Ajustes específicos para márgenes */
            .form-check-input#checkbox_only_show_parcels_with_associated_license:not(${EXCLUSIONS}) {
                margin-left: 0 !important;
            }

            .form-check-label.form-label[for="checkbox_only_show_parcels_with_associated_license"]:not(${EXCLUSIONS}) {
                margin-left: ${STYLE.spacingSm} !important;
            }

.dash-input#input_street_number_hint:not(${EXCLUSIONS}) {
    padding: 2px 5px !important; /* Reduce el espacio interno */
}


            /* Contenedores compactos */
            .cyborg-str-tool .card:not(${EXCLUSIONS}),
            .cyborg-str-tool .container:not(${EXCLUSIONS}),
            .cyborg-str-tool .panel:not(${EXCLUSIONS}) {
                border-radius: ${STYLE.borderRadius} !important;
                box-shadow: ${STYLE.boxShadow} !important;
                border: 1px solid ${THEME.border} !important;
                overflow: hidden !important;
                margin-bottom: ${STYLE.spacingSm} !important;
            }

            /* Headers y footers de contenedores */
            .cyborg-str-tool .card-header:not(${EXCLUSIONS}),
            .cyborg-str-tool .panel-heading:not(${EXCLUSIONS}) {
                background-color: ${THEME.bgLight} !important;
                border-bottom: 1px solid ${THEME.border} !important;
                padding: ${STYLE.spacingSm} !important;
                min-height: 20px !important;
            }

            /* Scrollbars personalizados (Chrome/Safari) */
            .cyborg-str-tool *::-webkit-scrollbar {
                width: 6px !important; /* Más delgado */
                height: 6px !important; /* Más delgado */
            }

            .cyborg-str-tool *::-webkit-scrollbar-track {
                background: ${THEME.bgLight} !important;
            }

            .cyborg-str-tool *::-webkit-scrollbar-thumb {
                background-color: ${THEME.medium} !important;
                border-radius: 10px !important;
                border: 1px solid ${THEME.bgLight} !important;
            }

            .cyborg-str-tool *::-webkit-scrollbar-thumb:hover {
                background-color: ${THEME.primary} !important;
            }

            /* Column width específico */
            .cyborg-str-tool table th[data-dash-column="city_p"]:not(${EXCLUSIONS}) {
                min-width: 120px !important; /* Reducido */
                max-width: 180px !important; /* Reducido */
            }
            #input_listing_search_keyword {
    width: 200px !important;
    max-width: 200px !important;
    min-height: 30px !important;
    font-size: 13px !important;
    padding: 2px 5px !important;
    display: inline-block !important;
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
        document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(applyCompactStyles));
    } else {
        requestAnimationFrame(applyCompactStyles);
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
                    // Reaplica clases a elementos nuevos si es necesario
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
