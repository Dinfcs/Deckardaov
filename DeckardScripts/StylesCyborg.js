// ==UserScript==
// @name         estilos sin gm
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Ajusta los estilos con colores más suaves, tamaños optimizados y filtros persistentes en tablas
// @author       [Tu Nombre]
// @match        https://cyborg.deckard.com/*
// @grant        none
// @run-at       document-start
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
            .cyborg-str-tool h1, .cyborg-str-tool h2, .cyborg-str-tool h3, .cyborg-str-tool h4, .cyborg-str-tool h5, .cyborg-str-tool h6 {
                font-weight: bold !important;
                color: #C9D82B !important;
                font-size: 15px !important;
            }

            /* Botones */
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

            /* Enlaces */
            .cyborg-str-tool a {
                color: #919292 !important;
                text-decoration: none !important;
                font-weight: normal !important;
            }

            .cyborg-str-tool a:visited {
                color: #23A9D8 !important;
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
                color: black !important;
            }

            .cyborg-str-tool table th:not(.bg-secondary) {
                background-color: #edede8 !important;
                color: black !important;
                font-size: 12px !important;
            }

            /* Campos de filtro */
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
            .cyborg-str-tool table th[data-dash-column="city_p"] {
            min-width: 180px !important; /* ajustar valor */
            max-width: 300px !important; /* ajustar valor */
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
