// ==UserScript==
// @name         Mejora de estilos - Cyborg STR Tool (Optimizado)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Ajusta los estilos con colores más suaves, tamaños optimizados y filtros persistentes en tablas
// @author       [Tu Nombre]
// @match        https://cyborg.deckard.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==
GM_addStyle(`
    /* Estilo general */
    .cyborg-str-tool body {
        background-color: #f7f7f5 !important;
        color: #2d2d2d !important;
        font-family: 'Arial', sans-serif !important;
        font-size: 15px !important;
    }

    /* Reducir tamaño del selector de página */
    .cyborg-str-tool input.current-page {
        width: 35px !important;  /* Reducido */
        font-size: 12px !important;
        text-align: center !important;
        padding: 2px !important;
        min-width: unset !important; /* Anula el min-width original */
    }

    /* Encabezados */
    .cyborg-str-tool h1, .cyborg-str-tool h2, .cyborg-str-tool h3, .cyborg-str-tool h4, .cyborg-str-tool h5, .cyborg-str-tool h6 {
        font-weight: bold !important;
        color: #CAD92B !important; /* Verde oliva oscuro */
        font-size: 16px !important;
    }

    /* Botones */
    .cyborg-str-tool button:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]),
    .cyborg-str-tool .btn:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]) {
        background-color: #23A9D8 !important; /* azul suave */
        color: white !important;
        border-radius: 6px !important;
        padding: 5px 8px !important;
        font-size: 12px !important;
        border: none !important;
        transition: 0.3s ease-in-out !important;
    }

    .cyborg-str-tool button:hover:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]),
    .cyborg-str-tool .btn:hover:not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]) {
        background-color: #23A9D8 !important;
    }

    /* Botones específicos */
    .cyborg-str-tool .btn-success {
        background-color: #CAD92B !important; /* Verde para Same */
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
        padding: 4px !important;
        text-align: left !important;
    }

    .cyborg-str-tool table th:not(.bg-secondary) {
        background-color: #CAD92B !important; /* Verde oliva */
        color: white !important;
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

    /* Flechas de ordenación en azul */
    .cyborg-str-tool th.sortable::after {
        content: '\\25B2'; /* Flecha hacia arriba */
        color: #23A9D8; /* Azul */
        display: inline-block;
        margin-left: 5px;
    }

    .cyborg-str-tool th.sortable.desc::after {
        content: '\\25BC'; /* Flecha hacia abajo */
        color: #23A9D8; /* Azul */
    }

    /* Reducir tamaño del selector de página */
    .cyborg-str-tool .pagination input {
        width: 50px !important;
        font-size: 12px !important;
        text-align: center !important;
        padding: 3px !important;
    }

    /* Espaciado general */
    .cyborg-str-tool .container, .cyborg-str-tool .content {
        padding: 10px !important;
    }

    /* Estilo para la ventana flotante
    #window_vetting_dlg {
        left: 153px !important;
        top: 11px !important;
        width: 1470px !important;
        height: 687px !important;
    } */

    /* Excluir FancyBox y otros elementos */
    .cyborg-str-tool *:not(.fancybox-button):not(.fancybox-toolbar):not(svg):not(.table-hover):not(.mxB2n6eUnlkVqa81npUQ):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]) {
        /* Estilos excluidos */
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
