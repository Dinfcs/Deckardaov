// ==UserScript==
// @name         Mejora de estilos - Cyborg STR Tool (Optimizado)
// @namespace    http://tampermonkey.net/
// @version      2.9
// @description  Ajusta los estilos con colores más suaves, tamaños optimizados y filtros persistentes en tablas
// @author       [Tu Nombre]
// @match        https://cyborg.deckard.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

GM_addStyle(`
    /* Encabezados */
    .cyborg-str-tool h1, .cyborg-str-tool h2, .cyborg-str-tool h3, .cyborg-str-tool h4, .cyborg-str-tool h5, .cyborg-str-tool h6 {
        font-weight: bold !important;
        color: #C9D82B !important; /* Verde oliva oscuro */
        font-size: 15px !important;
    }

    /* Resto de los botones */
    .cyborg-str-tool button:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]),
    .cyborg-str-tool .btn:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]) {
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

    /* Botones específicos */
    .cyborg-str-tool .btn-success {
        background-color: #edede8 !important; /* Verde para Same */
    }

    .cyborg-str-tool .btn-primary {
        background-color: #AFB8B7 !important; /* Azul para In same MUS */
    }

    .cyborg-str-tool .btn-warning {
        background-color: #ff8400 !important; /* Amarillo para Different */
    }

    .cyborg-str-tool .btn-secondary {
        background-color: #6c757d !important; /* Gris para Not sure */
    }

    /* Enlaces */
    .cyborg-str-tool a {
        color: #919292 !important; /* Gris para enlaces sin abrir */
        text-decoration: none !important;
        font-weight: normal !important;
    }

    .cyborg-str-tool a:visited {
        color: #23A9D8 !important; /* Azul para enlaces visitados */
    }

    .cyborg-str-tool a:hover {
        color: #23A9D8 !important;
        text-decoration: underline !important;
    }

    /* Tablas */
    .cyborg-str-tool table:not(.table-hover) {
        border-collapse: collapse !important;
        width: 100% !important;
        font-size: 12px !important;
    }

    .cyborg-str-tool table th:not(.bg-secondary), .cyborg-str-tool table td:not(.bg-secondary) {
        border: 1px solid #ddd !important;
        padding: 3px !important;
        text-align: left !important;
        color: black !important; /* Cambia el color de las letras a negro */
    }

    .cyborg-str-tool table th:not(.bg-secondary) {
        background-color: #edede8 !important; /* Verde oliva */
        color: black !important; /* Cambia el color de las letras a negro */
        font-size: 12px !important;
    }

    /* Estilo de los campos de filtro */
    .cyborg-str-tool table input[type="text"] {
        background-color: #eeeeee !important; /* Gris claro para campos de filtro */
        border: 1px solid #ccc !important; /* Borde gris */
        padding: 5px !important;
        font-size: 12px !important;
        width: 100% !important;
    }

    .cyborg-str-tool input:focus, .cyborg-str-tool select:focus, .cyborg-str-tool textarea:focus {
        border-color: #4a6984 !important; /* Azul suave */
        outline: none !important;
        background-color: #fff !important;
    }

    /* Reducir tamaño del selector de página */
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
        min-width: 180px !important; /* ajustar valor */
        max-width: 300px !important; /* ajustar valor */
    }
`);

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Aplicar la clase única al body
        document.body.classList.add('cyborg-str-tool');

        // Establecer tamaño inicial de la ventana flotante
        const floatingWindow = document.getElementById('window_vetting_dlg');
        if (floatingWindow) {
            floatingWindow.style.left = '153px';
            floatingWindow.style.top = '11px';
            floatingWindow.style.width = '1470px';
            floatingWindow.style.height = '687px';
        }

        // Guardar los valores de los filtros antes de la búsqueda
        let filtros = {};

        document.querySelectorAll("table input").forEach(input => {
            input.addEventListener("input", () => {
                filtros[input.name] = input.value;
            });
        });

        // Restaurar los valores después de la búsqueda
        setInterval(() => {
            document.querySelectorAll("table input").forEach(input => {
                if (filtros[input.name]) {
                    input.value = filtros[input.name];
                }
            });
        }, 500);
    }, 0); // Ejecutar después de otros scripts
});
