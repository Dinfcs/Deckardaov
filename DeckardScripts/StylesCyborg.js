// ==UserScript==
// @name         estilos sin gm
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Ajusta los estilos con colores más suaves, tamaños optimizados y filtros persistentes en tablas
// @author       [Tu Nombre]
// @match        https://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const addStyle = (css) => {
        // Verifica si los estilos ya fueron añadidos
        if (document.querySelector('#custom-cyborg-styles')) return;

        const style = document.createElement('style');
        style.id = 'custom-cyborg-styles';
        style.textContent = css;
        document.head.appendChild(style);
    };

    const applyStyles = () => {
        if (!document.head) {
            setTimeout(applyStyles, 50);
            return;
        }

        addStyle(`
    /* Encabezados */
    .cyborg-str-tool h1, .cyborg-str-tool h2, .cyborg-str-tool h3, .cyborg-str-tool h4, .cyborg-str-tool h5, .cyborg-str-tool h6:not(.pop_up_header_container *) {
        font-weight: bold !important;
        color: #C9D82B !important; /* Verde oliva oscuro */
        font-size: 15px !important;
    }

    /* Resto de los botones */
    .cyborg-str-tool button:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]):not(.pop_up_header_container *),
    .cyborg-str-tool .btn:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]):not(.pop_up_header_container *) {
        background-color: #1b95bf !important; /* azul suave */
        color: white !important;
        border-radius: 0px !important;
        padding: 5px 8px !important;
        font-size: 14px !important;
        border: none !important;
        transition: 0.3s ease-in-out !important;
    }

    /* Estilo específico para el botón de Lina */
    #btn_map_to_selected_probable_parcel {
        margin-left: 8px !important; /* ajustar valor */
        margin-right: 8px !important; /* ajustar valor */
    }

    /* Estilo específico para el botón de Show data lead per region */
    #btn_show_data_lead_per_region {
        margin-left: 8px !important; /* ajustar valor */
    }

    /* Estilo específico para el input */
    .form-check-input[id="checkbox_only_show_parcels_with_associated_license"] {
        margin-left: -2px !important; /* ajustar valor */
    }

    /* Estilo específico para el label */
    .form-check-label.form-label[for="checkbox_only_show_parcels_with_associated_license"] {
        margin-left: 18px !important; /* ajustar valor */
    }

    /* Estilo específico para el input de búsqueda */
    .dash-input#input_street_number_hint {
        margin-left: 15px !important; /* ajustar valor */
    }

    /* Enlaces */
    .cyborg-str-tool a:not(.pop_up_header_container *) {
        color: #919292 !important; /* Gris para enlaces sin abrir */
        text-decoration: none !important;
        font-weight: normal !important;
    }

    .cyborg-str-tool a:visited:not(.pop_up_header_container *) {
        color: #23A9D8 !important; /* Azul para enlaces visitados */
    }

    .cyborg-str-tool a:hover:not(.pop_up_header_container *) {
        color: #23A9D8 !important;
        text-decoration: underline !important;
    }

    /* Tablas */
    .cyborg-str-tool table:not(.table-hover):not(.pop_up_header_container *) {
        border-collapse: collapse !important;
        width: 100% !important;
        font-size: 12px !important;
    }

    .cyborg-str-tool table th:not(.bg-secondary):not(.pop_up_header_container *), .cyborg-str-tool table td:not(.bg-secondary):not(.pop_up_header_container *) {
        border: 1px solid #ddd !important;
        padding: 3px !important;
        text-align: left !important;
        color: black !important; /* Cambia el color de las letras a negro */
    }

    .cyborg-str-tool table th:not(.bg-secondary):not(.pop_up_header_container *) {
        background-color: #edede8 !important; /* Verde oliva */
        color: black !important; /* Cambia el color de las letras a negro */
        font-size: 12px !important;
    }

    /* Estilo de los campos de filtro */
    .cyborg-str-tool table input[type="text"]:not(.pop_up_header_container *) {
        background-color: #eeeeee !important; /* Gris claro para campos de filtro */
        border: 1px solid #ccc !important; /* Borde gris */
        padding: 5px !important;
        font-size: 12px !important;
        width: 100% !important;
    }

    .cyborg-str-tool input:focus:not(.pop_up_header_container *), .cyborg-str-tool select:focus:not(.pop_up_header_container *), .cyborg-str-tool textarea:focus:not(.pop_up_header_container *) {
        border-color: #4a6984 !important; /* Azul suave */
        outline: none !important;
        background-color: #fff !important;
    }

    /* Reducir tamaño del selector de página */
    .cyborg-str-tool .pagination input:not(.pop_up_header_container *) {
        width: 50px !important;
        font-size: 11px !important;
        text-align: center !important;
    }

    /* Espaciado general */
    .cyborg-str-tool .container:not(.pop_up_header_container *), .cyborg-str-tool .content:not(.pop_up_header_container *) {
        padding: 10px !important;
    }

    .cyborg-str-tool table th[data-dash-column="city_p"]:not(.pop_up_header_container *) {
        min-width: 180px !important; /* ajustar valor */
        max-width: 300px !important; /* ajustar valor */
    }

    /* No aplicar negrita al texto dentro de listing_quick_view_apn_or_address_info */
    .cyborg-str-tool .listing_quick_view_apn_or_address_info {
        font-weight: normal !important;
    }
        `);

        document.body.classList.add('cyborg-str-tool');
    };

    // Esperamos hasta que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyStyles);
        window.addEventListener('load', applyStyles); // Respaldo en caso de que el DOM tarde más en cargar
    } else {
        applyStyles();
    }
})();
