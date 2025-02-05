// ==UserScript==
// @name         Mejora de estilos - Cyborg STR Tool (Optimizado)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Ajusta los estilos con colores más suaves, tamaños optimizados y filtros persistentes en tablas
// @author       [Tu Nombre]
// @match        https://cyborg.deckard.com/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

GM_addStyle(`
    /* Encabezados */
    .cyborg-str-tool h1, .cyborg-str-tool h2, .cyborg-str-tool h3, .cyborg-str-tool h4, .cyborg-str-tool h5, .cyborg-str-tool h6 {
        font-weight: bold !important;
        color: #C9D82B !important;
        font-size: 15px !important;
    }

    /* Botones generales */
    .cyborg-str-tool button:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]),
    .cyborg-str-tool .btn:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]) {
        background-color: #1b95bf !important;
        color: white !important;
        border-radius: 0px !important;
        padding: 5px 8px !important;
        font-size: 14px !important;
        border: none !important;
        transition: 0.3s ease-in-out !important;
    }

    /* Estilos específicos para botones */
    #btn_map_to_selected_probable_parcel, #btn_show_data_lead_per_region {
        margin-left: 8px !important;
    }

    .form-check-input[id="checkbox_only_show_parcels_with_associated_license"] {
        margin-left: -2px !important;
    }

    .form-check-label[for="checkbox_only_show_parcels_with_associated_license"] {
        margin-left: 18px !important;
    }

    .dash-input#input_street_number_hint {
        margin-left: 15px !important;
    }

    /* Colores personalizados para botones */
    .cyborg-str-tool .btn-success { background-color: #edede8 !important; }
    .cyborg-str-tool .btn-primary { background-color: #AFB8B7 !important; }
    .cyborg-str-tool .btn-warning { background-color: #ff8400 !important; }
    .cyborg-str-tool .btn-secondary { background-color: #6c757d !important; }

    /* Enlaces */
    .cyborg-str-tool a {
        color: #919292 !important;
        text-decoration: none !important;
    }

    .cyborg-str-tool a:visited { color: #23A9D8 !important; }
    .cyborg-str-tool a:hover { color: #23A9D8 !important; text-decoration: underline !important; }

    /* Tablas */
    .cyborg-str-tool table:not(.table-hover) {
        border-collapse: collapse !important;
        width: 100% !important;
        font-size: 12px !important;
    }

    .cyborg-str-tool table th, .cyborg-str-tool table td {
        border: 1px solid #ddd !important;
        padding: 3px !important;
        text-align: left !important;
        color: black !important;
    }

    .cyborg-str-tool table th {
        background-color: #edede8 !important;
        color: black !important;
    }

    /* Filtros */
    .cyborg-str-tool table input[type="text"] {
        background-color: #eeeeee !important;
        border: 1px solid #ccc !important;
        padding: 5px !important;
        font-size: 12px !important;
        width: 100% !important;
    }

    .cyborg-str-tool input:focus, .cyborg-str-tool select:focus, .cyborg-str-tool textarea:focus {
        border-color: #4a6984 !important;
        outline: none !important;
        background-color: #fff !important;
    }

    .cyborg-str-tool .pagination input {
        width: 50px !important;
        font-size: 11px !important;
        text-align: center !important;
    }

    /* Espaciado general */
    .cyborg-str-tool .container, .cyborg-str-tool .content {
        padding: 10px !important;
    }

    .cyborg-str-tool table th[data-dash-column="city_p"] {
        min-width: 180px !important;
        max-width: 300px !important;
    }
`);

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.classList.add('cyborg-str-tool'); // Agregar clase al body

        // Ajustar ventana flotante
        const floatingWindow = document.getElementById('window_vetting_dlg');
        if (floatingWindow) {
            floatingWindow.style.cssText = 'left: 153px; top: 11px; width: 1470px; height: 687px;';
        }

        // Optimización de filtros
        const filtros = {};
        const inputs = document.querySelectorAll("table input");

        inputs.forEach(input => {
            input.addEventListener("input", () => {
                filtros[input.name] = input.value;
            });
        });

        // Restaurar valores de filtros
        inputs.forEach(input => {
            if (filtros[input.name]) {
                input.value = filtros[input.name];
            }
        });
    }, 0);
});
