// ==UserScript==
// @name         estilos sin gm
// @namespace    http://tampermonkey.net/
// @version      1.9
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
    .cyborg-str-tool h1:not(#window_vetting_dlg *):not(#vetting_data_footer *), .cyborg-str-tool h2:not(#window_vetting_dlg *):not(#vetting_data_footer *), .cyborg-str-tool h3:not(#window_vetting_dlg *):not(#window_vetting_dlg *), .cyborg-str-tool h4:not(#window_vetting_dlg *):not(#vetting_data_footer *), .cyborg-str-tool h5:not(#vetting_dlg *):not(#vetting_data_footer *), .cyborg-str-tool h6:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.pop_up_header_container *):not(#iframe-button-container *) {
        font-weight: bold !important;
        color: #C9D82B !important; /* Verde oliva oscuro */
        font-size: 15px !important;
    }

    /* Resto de los botones */
    .cyborg-str-tool button:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(#btn_submit_vetting_dlg):not([style*="Nearby Parcels"]):not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]):not(.pop_up_header_container *):not(#iframe-button-container button),
    .cyborg-str-tool .btn:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(#btn_submit_vetting_dlg):not([style*="Nearby Parcels"]):not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]):not(.pop_up_header_container *):not(#iframe-button-container button),
    #btn_submit_vetting_dlg {
        background-color: #1b95bf !important; /* azul suave */
        color: white !important;
        border-radius: 5px !important;
        padding: 5px 8px !important;
        font-size: 14px !important;
        border: none !important;
        transition: 0.3s ease-in-out !important;
    }
        /* Botones específicos */
    #btn_record_no_matching_parcel_found,
    #btn_record_listing_not_live,
    #btn_open_vetting_dlg,
    #btn_open_vetting_dlg_as_qa_mode {
        background-color: #1b95bf !important; /* azul suave */
        color: white !important;
        border-radius: 0px !important;
        padding: 5px 8px !important;
        font-size: 14px !important;
        border: none !important;
        transition: 0.3s ease-in-out !important;
    }

    /* Estilo específico para el botón de mapeo */
    #btn_map_to_selected_probable_parcel {
        margin-left: 8px !important; /* ajustar valor */
        margin-right: 8px !important; /* ajustar valor */
    }

    /* Estilo específico para el botón de Show data lead per region */
    #btn_show_data_lead_per_region {
        margin-left: 8px !important; /* ajustar valor */
    }

    /* Estilo específico para el input */
    .form-check-input[id="checkbox_only_show_parcels_with_associated_license"]:not(#window_vetting_dlg *):not(#vetting_data_footer *):not([style*="Nearby Parcels"]) {
        margin-left: -2px !important; /* ajustar valor */
    }

    /* Estilo específico para el label */
    .form-check-label.form-label[for="checkbox_only_show_parcels_with_associated_license"]:not(#window_vetting_dlg *):not(#vetting_data_footer *):not([style*="Nearby Parcels"]) {
        margin-left: 18px !important; /* ajustar valor */
    }

    /* Estilo específico para el input de búsqueda */
    .dash-input#input_street_number_hint:not(#window_vetting_dlg *):not(#vetting_data_footer *):not([style*="Nearby Parcels"]) {
        margin-left: 15px !important; /* ajustar valor */
    }

    /* Enlaces */
    .cyborg-str-tool a:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.pop_up_header_container *):not(#iframe-button-container *) {
        color: #919292 !important; /* Gris para enlaces sin abrir */
        text-decoration: none !important;
        font-weight: normal !important;
    }

    .cyborg-str-tool a:visited:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.pop_up_header_container *):not(#iframe-button-container *) {
        color: #23A9D8 !important; /* Azul para enlaces visitados */
    }

    .cyborg-str-tool a:hover:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.pop_up_header_container *):not(#iframe-button-container *) {
        color: #23A9D8 !important;
        text-decoration: underline !important;
    }

    /* Tablas */
    .cyborg-str-tool table:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.table-hover):not(.pop_up_header_container *):not(#iframe-button-container *) {
        border-collapse: collapse !important;
        width: 100% !important;
        font-size: 12px !important;
    }

    .cyborg-str-tool table th:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.bg-secondary):not(.pop_up_header_container *):not(#iframe-button-container *), .cyborg-str-tool table td:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.bg-secondary):not(.pop_up_header_container *):not(#iframe-button-container *) {
        text-align: left !important;
        color: black !important; /* Cambia el color de las letras a negro */
    }

    .cyborg-str-tool table th:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.bg-secondary):not(.pop_up_header_container *):not(#iframe-button-container *) {
        background-color: #edede8 !important; /* Verde oliva */
        color: black !important; /* Cambia el color de las letras a negro */
        font-size: 12px !important;
    }

    /* Estilo de los campos de filtro */
    .cyborg-str-tool table input[type="text"]:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.pop_up_header_container *):not(#iframe-button-container *) {
        background-color: #eeeeee !important; /* Gris claro para campos de filtro */
        border: 1px solid #ccc !important; /* Borde gris */
        padding: 5px !important;
        font-size: 12px !important;
        width: 100% !important;
    }

    .cyborg-str-tool table th[data-dash-column="city_p"]:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(.pop_up_header_container *):not(#iframe-button-container *) {
        min-width: 180px !important; /* ajustar valor */
        max-width: 300px !important; /* ajustar valor */
    }

    /* No aplicar negrita al texto dentro de listing_quick_view_apn_or_address_info */
    .cyborg-str-tool .listing_quick_view_apn_or_address_info:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(#iframe-button-container *) {
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

    // Función para hacer clic en el botón
    function clickButton() {
        var button = document.getElementById('btn_submit_vetting_dlg');
        if (button) {
            button.click();
        }
    }

    // Evento para detectar la combinación de teclas Ctrl+S
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            clickButton();
        }
    }, false);

})();
