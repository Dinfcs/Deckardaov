// ==UserScript==
// @name         estilos sin gm
// @namespace    http://tampermonkey.net/
// @version      1.13
// @description  Ajusta los estilos con colores más suaves, tamaños optimizados y filtros persistentes en tablas
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const addStyle = (css) => {
        if (document.querySelector('#custom-cyborg-styles')) return;
        const style = document.createElement('style');
        style.id = 'custom-cyborg-styles';
        style.textContent = css;
        document.head.appendChild(style);
    };

    const applyStyles = () => {
        // Exclusiones:  Excluye la tabla con la clase 'project-data-table' y su contenido.
        const exclusions = `
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

        addStyle(`
            /* Reutilización de selectores */
            .cyborg-str-tool {
                /* No es necesario especificar font-family si no se cambia */
            }

            /* Encabezados */
            .cyborg-str-tool h1:not(${exclusions}),
            .cyborg-str-tool h2:not(${exclusions}),
            .cyborg-str-tool h3:not(${exclusions}),
            .cyborg-str-tool h4:not(${exclusions}),
            .cyborg-str-tool h5:not(${exclusions}),
            .cyborg-str-tool h6:not(${exclusions}) {
                font-weight: bold !important;
                color: #C9D82B !important; /* Verde oliva oscuro */
                font-size: 15px !important;
            }

            /* Título del listado */
            .page_header_bar h4 span {
                font-size: 20px !important;
            }

            /* Botones - Agrupados y optimizados */
            .cyborg-str-tool button:not(${exclusions}):not(#btn_submit_vetting_dlg),
            .cyborg-str-tool .btn:not(${exclusions}):not(#btn_submit_vetting_dlg),
            #btn_submit_vetting_dlg,
            #btn_record_no_matching_parcel_found,
            #btn_record_listing_not_live,
            #btn_open_vetting_dlg,
            #btn_open_vetting_dlg_as_qa_mode {
                background-color: #1b95bf !important; /* azul suave */
                color: white !important;
                border: none !important;
                padding: 5px 8px !important;
                font-size: 14px !important;
                transition: 0.3s ease-in-out !important;
            }

            /*Especifícos*/
            #btn_record_no_matching_parcel_found,
            #btn_record_listing_not_live,
            #btn_open_vetting_dlg,
            #btn_open_vetting_dlg_as_qa_mode{
                border-radius: 0px !important;
            }


            /*Botones - Excepciones con border radius */
            .cyborg-str-tool button:not(${exclusions}):not(#btn_submit_vetting_dlg):not(#btn_record_no_matching_parcel_found):not(#btn_record_listing_not_live):not(#btn_open_vetting_dlg):not(#btn_open_vetting_dlg_as_qa_mode),
            .cyborg-str-tool .btn:not(${exclusions}):not(#btn_submit_vetting_dlg):not(#btn_record_no_matching_parcel_found):not(#btn_record_listing_not_live):not(#btn_open_vetting_dlg):not(#btn_open_vetting_dlg_as_qa_mode),
            #btn_submit_vetting_dlg{
                 border-radius: 5px !important;
            }

            /* Estilo específico para el botón de mapeo */
            #btn_map_to_selected_probable_parcel {
                margin-left: 8px !important;
                margin-right: 8px !important;
            }

            /* Estilo específico para el botón de Show data lead per region */
            #btn_show_data_lead_per_region {
                margin-left: 8px !important;
            }

            /* Estilo específico para el input */
            .form-check-input#checkbox_only_show_parcels_with_associated_license:not(${exclusions}) {
                margin-left: -2px !important;
            }

            /* Estilo específico para el label */
            .form-check-label.form-label[for="checkbox_only_show_parcels_with_associated_license"]:not(${exclusions}) {
                margin-left: 18px !important;
            }

            /* Estilo específico para el input de búsqueda */
            .dash-input#input_street_number_hint:not(${exclusions}) {
                margin-left: 15px !important;
            }

            /* Enlaces */
            .cyborg-str-tool a:not(${exclusions}) {
                color: #23A9D8 !important;  /* Azul antes de visitar */
                text-decoration: none !important;
                font-weight: normal !important;
                transition: color 0.2s ease-in-out, text-decoration 0.2s ease-in-out !important; /* Transiciones */
            }

            /* Enlaces visitados (usando una regla dinámica) */
            .cyborg-str-tool a:visited:not(${exclusions}) {
                color: #9FAB22 !important; /* Color después de visitar */
            }

            /* Hover para todos los enlaces */
            .cyborg-str-tool a:hover:not(${exclusions}) {
              text-decoration: underline !important;
            }

           /* Tablas (excluyendo la tabla con la clase 'project-data-table') */
            .cyborg-str-tool table:not(${exclusions}):not(.table-hover) {
                border-collapse: collapse !important;
                width: 100% !important;
                font-size: 12px !important;
            }

             .cyborg-str-tool table th:not(${exclusions}):not(.bg-secondary),
            .cyborg-str-tool table td:not(${exclusions}):not(.bg-secondary) {
                text-align: left !important;
                color: black !important;
            }

           .cyborg-str-tool table th:not(${exclusions}):not(.bg-secondary) {
                background-color: #edede8 !important; /* Verde oliva */
                color: black !important;
                font-size: 12px !important;
            }

            /* Estilo de los campos de filtro */
            .cyborg-str-tool table input[type="text"]:not(${exclusions}) {
                background-color: #eeeeee !important; /* Gris claro para campos de filtro */
                border: 1px solid #ccc !important;
                padding: 5px !important;
                font-size: 12px !important;
                width: 100% !important;
            }

            .cyborg-str-tool table th[data-dash-column="city_p"]:not(${exclusions}) {
                min-width: 180px !important;
                max-width: 300px !important;
            }

            /* No aplicar negrita al texto dentro de listing_quick_view_apn_or_address_info */
            .cyborg-str-tool.listing_quick_view_apn_or_address_info:not(${exclusions}) {
                font-weight: normal !important;
            }
        `);

        document.body.classList.add('cyborg-str-tool');
    };

    // Optimización: Usar requestAnimationFrame para aplicar los estilos
    const handleDOMContentLoaded = () => {
        requestAnimationFrame(applyStyles);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
        // No es necesario el evento load si ya tenemos DOMContentLoaded
    } else {
        handleDOMContentLoaded(); // Ya está listo, ejecutar directamente
    }

    const clickButton = () => {
        const button = document.getElementById('btn_submit_vetting_dlg');
        if (button) {
            button.click();
        }
    };

    // Optimización: Usar un solo event listener para keydown
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            clickButton();
        }
    });
})();
