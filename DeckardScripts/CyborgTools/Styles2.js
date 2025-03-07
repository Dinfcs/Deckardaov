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
        .fancybox-button,
        [data-test-id="float-window-minimize-or-restore-btn"],
        [data-test-id="float-window-close-btn"],
        #btnCancel,
        #btnAccept
    `;

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
        fontSizeBase: '12px',  // letra de botones
        fontSizeSmall: '11px', // titulos de las tablas
        fontSizeLarge: '18px',
        fontSizeBuckets: '15px',
        spacingXs: '1px',
        spacingSm: '1px',
        spacingMd: '5px',
        spacingLg: '10px',
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
            .cyborg-str-tool button:not(${EXCLUSIONS}):not(#btn_submit_vetting_dlg),
            .cyborg-str-tool .btn:not(${EXCLUSIONS}):not(#btn_submit_vetting_dlg),
            #btn_submit_vetting_dlg,
            #btn_record_no_matching_parcel_found,
            #btn_record_listing_not_live,
            #btn_open_vetting_dlg,
            #nearbyParcelsButton,
            #btn_open_vetting_dlg_as_qa_mode {
                background-color: ${THEME.primary} !important;
                color: white !important;
                border: none !important;
                border-radius: ${STYLE.borderRadius} !important;
                padding: 4px 8px !important;
                font-size: ${STYLE.fontSizeBase} !important;
                font-weight: 550 !important;
                transition: all ${STYLE.transition} !important;
                box-shadow: ${STYLE.boxShadow} !important;
                cursor: pointer !important;
                align-items: center !important;
                justify-content: center !important;
                height: 30px !important; /* Altura fija para más compacidad */
            }

            /* Botones secundarios */
            #btn_record_no_matching_parcel_found,
            #btn_record_listing_not_live, #secondary-button {
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

            /* =================
               4. ENLACES
               ================= */
            .cyborg-str-tool a:not(${EXCLUSIONS}) {
                color: #96adb5 !important;
                text-decoration: none !important;
                font-weight: 500 !important;
                transition: all ${STYLE.transition} !important;
                border-bottom: 1px solid transparent !important;
            }

            .cyborg-str-tool a:visited:not(${EXCLUSIONS}) {
                color: #02acf5 !important; /* Púrpura más suave para visitados */
            }

            .cyborg-str-tool a:hover:not(${EXCLUSIONS}) {
                color: ${THEME.hover} !important;
                border-bottom: 1px solid ${THEME.hover} !important;
                text-decoration: none !important;
            }

            /* =================
               5. TABLAS MODERNAS
               ================= */
            .cyborg-str-tool table th[data-dash-column="city_p"]:not(${EXCLUSIONS}) {
                min-width: 180px !important;
                max-width: 300px !important;
            }

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
               6. INPUTS Y FORMULARIOS
               ================= */
            .cyborg-str-tool input:not(${EXCLUSIONS}, #checkbox_only_show_parcels_with_associated_license, #checkbox_advanced_filter_mode, #checkbox_batch_edit_mode, #checkbox_listing_search_keyword_is_regex),
            .cyborg-str-tool select:not(${EXCLUSIONS}, #checkbox_only_show_parcels_with_associated_license, #checkbox_advanced_filter_mode, #checkbox_batch_edit_mode, #checkbox_listing_search_keyword_is_regex),
            .cyborg-str-tool textarea:not(${EXCLUSIONS}, #checkbox_only_show_parcels_with_associated_license, #checkbox_advanced_filter_mode, #checkbox_batch_edit_mode, #checkbox_listing_search_keyword_is_regex) {
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

            /* =================
               7. CONTENEDOR FLOTANTE BOTONES DUPLICADOS
               ================= */
            .pop_up_header_container {
                position: fixed; /* Fija el contenedor en la pantalla */
                top: 5px; /* Distancia desde la parte superior */
                left: 50%; /* Centrado horizontal */
                transform: translateX(-50%); /* Ajuste para centrar correctamente */
                z-index: 9999; /* Asegura que esté por encima de otros elementos */
                background-color: rgba(255, 255, 255, 0.8); /* Fondo blanco con 80% de opacidad */
                padding: 8px; /* Espaciado interno */
                border-radius: 12px; /* Bordes redondeados */
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Sombra para dar profundidad */
                display: flex; /* Usa flexbox para alinear los botones */
                gap: 10px; /* Espacio entre botones (reducido para ahorrar espacio) */
                justify-content: center; /* Centra los botones horizontalmente */
                flex-wrap: nowrap; /* Evita que los botones se envuelvan en múltiples líneas */
                max-width: 70%; /* Ancho máximo del contenedor (ajusta según sea necesario) */
                width: auto; /* Ancho automático basado en el contenido */
                backdrop-filter: blur(10px); /* Efecto de desenfoque para mejorar la legibilidad */
            }

            /* =================
               8. ESTILOS COMUNES PARA TODOS LOS BOTONES
               ================= */
            .pop_up_header_container .btn,
            button[id*="btn_listing_pair_next"],
            button[id*="btn_listing_pair_prev"] {
                min-width: 90px !important; /* Ancho mínimo para todos los botones */
                padding: 5px 10px !important; /* Espaciado interno */
                font-size: 14px !important; /* Tamaño de fuente */
                font-weight: 500 !important; /* Grosor de la fuente */
                border-radius: 6px !important; /* Bordes redondeados */
                border: none !important; /* Sin bordes */
                cursor: pointer !important; /* Cursor de puntero */
                transition: all 0.3s ease !important; /* Transición suave */
                display: inline-flex !important; /* Usar flexbox para centrar contenido */
                align-items: center !important; /* Centrar verticalmente */
                justify-content: center !important; /* Centrar horizontalmente */
                text-align: center !important; /* Alineación de texto */
            }

            /* =================
               9. COLORES DE FONDO PERSONALIZADOS PARA LOS BOTONES
               ================= */
            .pop_up_header_container .btn-success { /* Same */
                background-color: #4CAF50 !important;
                color: white !important;
            }

            .pop_up_header_container .btn-primary { /* In same MUS */
                background-color: #2196F3 !important;
                color: white !important;
            }

            .pop_up_header_container .btn-warning { /* Different */
                background-color: #FF9800 !important;
                color: white !important;
            }

            .pop_up_header_container .btn-info { /* Not sure */
                background-color: #00BCD4 !important;
                color: white !important;
            }

            button[id*="btn_listing_pair_next"] { /* Next pair */
                background-color: #FF5722 !important;
                color: white !important;
            }

            button[id*="btn_listing_pair_prev"] { /* Prev pair */
                background-color: #B0BEC5 !important;
                color: white !important;
            }

            /* =================
               10. EFECTO HOVER PARA TODOS LOS BOTONES
               ================= */
            .pop_up_header_container .btn:hover,
            button[id*="btn_listing_pair_next"]:hover,
            button[id*="btn_listing_pair_prev"]:hover {
                opacity: 0.9 !important;
                transform: translateY(-2px) !important;
            }

            /* =================
               11. ESTILO PARA EL BOTÓN "PREV PAIR" CUANDO ESTÁ DESHABILITADO
               ================= */
            button[id*="btn_listing_pair_prev"][disabled] {
                background-color: #B0BEC5 !important;
                color: #fff !important;
                cursor: not-allowed !important;
            }

            /* =================
               12. ESTILOS PARA LOS TABS
               ================= */
            .tab-container .tab {
                display: inline-block;
                background-color: ${THEME.bgLight} !important; /* Fondo claro */
                border: 1px solid ${THEME.border} !important; /* Borde sutil */
                border-bottom: none !important;
                transition: all ${STYLE.transition} !important; /* Transición suave */
                text-align: center !important;
                box-sizing: border-box !important;
                font-size: ${STYLE.fontSizeBuckets} !important; /* Tamaño de fuente base */
                font-weight: 530 !important; /* Fuente semibold */
                color: ${THEME.medium} !important; /* Color de texto secundario */
                border-radius: ${STYLE.borderRadius} ${STYLE.borderRadius} 0 0 !important; /* Bordes redondeados solo arriba */
                cursor: pointer !important; /* Cursor de puntero */
                margin-right: ${STYLE.spacingXs} !important; /* Espaciado entre tabs */
            }

            /* Estilos para el tab seleccionado */
            .tab-container .tab--selected {
                background-color: white !important; /* Fondo blanco */
                color: ${THEME.primary} !important; /* Color primario */
                border-color: ${THEME.primary} !important; /* Borde primario */
                font-weight: 500 !important; /* Fuente más gruesa */
                box-shadow: 0 -2px 0 ${THEME.primary} inset !important; /* Línea inferior de acento */
            }

            /* Efecto hover para los tabs */
            .tab-container .tab:hover {
                background-color: ${THEME.light} !important; /* Fondo más claro al pasar el mouse */
                color: ${THEME.dark} !important; /* Color de texto más oscuro */
            }

            /* Efecto hover para el tab seleccionado */
            .tab-container .tab--selected:hover {
                background-color: white !important; /* Mantener fondo blanco */
                color: ${THEME.hover} !important; /* Color primario más oscuro */
                border-color: ${THEME.hover} !important; /* Borde primario más oscuro */
            }
        `;

        addStyle(css);
        document.body.classList.add('cyborg-str-tool');
    };

    /**
     * Agrega eventos a los botones para hacer clic automático en "Next Pair" después de 0.5 segundos
     * y mover el scroll de la página a la parte superior.
     */
    const addAutoNextPairClick = () => {
        // Selecciona los botones "Same", "In same MUS", "Different", y "Not sure"
        const buttons = [
            document.querySelector('.btn-success'), // Same
            document.querySelector('.btn-primary'), // In same MUS
            document.querySelector('.btn-warning'), // Different
            document.querySelector('.btn-info')     // Not sure
        ];

        // Selecciona el botón "Next Pair"
        const nextPairButton = document.querySelector('button[id*="btn_listing_pair_next"]');

        if (nextPairButton) {
            buttons.forEach(button => {
                if (button) {
                    button.addEventListener('click', () => {
                        // Programa el clic en "Next Pair" después de 0.5 segundos
                        setTimeout(() => {
                            nextPairButton.click(); // Hacer clic en "Next Pair"
                            window.scrollTo({ top: 0, behavior: 'smooth' }); // Mover el scroll a la parte superior
                        }, 500); // 500 milisegundos = 0.5 segundos
                    });
                }
            });
        }
    };

    /**
     * Función para hacer clic en el botón "Save" si existe
     */
    const clickSaveButton = () => {
        const saveButton = document.getElementById('btn_submit_vetting_dlg'); // Selecciona el botón Save
        if (saveButton) {
            saveButton.click(); // Hace clic en el botón Save si existe
        }
    };

    // Inicialización basada en el estado del documento
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            requestAnimationFrame(applyModernStyles);
            addAutoNextPairClick(); // Agrega los eventos después de que el DOM esté listo
        });
    } else {
        requestAnimationFrame(applyModernStyles);
        addAutoNextPairClick(); // Agrega los eventos si el DOM ya está listo
    }

    // Observer para aplicar estilos a elementos dinámicos
    const observeDOM = () => {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const callback = (mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    requestAnimationFrame(() => {
                        document.body.classList.add('cyborg-str-tool');
                        addAutoNextPairClick(); // Vuelve a agregar eventos si se añaden nuevos botones dinámicamente
                    });
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    };

    // Atajo de teclado: Ctrl + S para hacer clic en el botón Save
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') { // Verifica si se presionó Ctrl + S
            e.preventDefault(); // Evita el comportamiento predeterminado (guardar la página)
            clickSaveButton(); // Llama a la función para hacer clic en el botón Save
        }
    });

    // Iniciar observer si el DOM ya está cargado
    if (document.readyState !== 'loading') {
        observeDOM();
    } else {
        document.addEventListener('DOMContentLoaded', observeDOM);
    }
})();
