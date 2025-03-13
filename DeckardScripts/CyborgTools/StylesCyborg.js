// ==UserScript==
// @name         1234
// @namespace    http://tampermonkey.net/
// @version      4
// @description  Estilos modernos y compactos con aplicación inmediata para mejorar la experiencia de usuario.
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/*
// @grant        none
// @run-at       document-start
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
        #btnAccept,
        .pr-table,
        .pr-table th,
        .pr-table thead,
        .pr-table tr,
        .pr-table td
    `;

    // Sistema de colores Deckard
    const THEME = {
        primary: '#00AEEF',       // Azul del logo Deckard
        secondary: '#D1E231',     // Verde lima del logo Deckard
        accent: '#D1E231',        // Verde lima como acento
        dark: '#000000',          // Negro según la paleta
        medium: '#4D4D4D',        // Gris oscuro según la paleta
        light: '#F2F2F2',         // Gris claro según la paleta
        hover: '#0098D1',         // Azul oscuro (hover) - variación del azul principal
        active: '#0087BE',        // Azul más oscuro (active) - variación más oscura del azul
        bgLight: '#FFFFFF',       // Fondo claro - blanco
        bgAlt: '#F2F2F2',         // Fondo alternativo - gris claro de la paleta
        bgHeader: '#E6F7FD',      // Fondo de encabezados - azul muy claro
        border: '#DEDEDE',        // Color de bordes - gris neutro
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

    // Aplicación de estilos (se ejecuta inmediatamente)
    function injectStyles() {
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
                color: ${THEME.primary} !important;
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
                background-color: ${THEME.secondary} !important;
                color: ${THEME.dark} !important;
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
                color: white !important;
            }

            /* Interacciones de botones */
            .cyborg-str-tool button:not(${EXCLUSIONS}):hover,
            .cyborg-str-tool .btn:not(${EXCLUSIONS}):hover {
                background-color: ${THEME.primary} !important;
                color: white !important;
            }

            #btn_submit_vetting_dlg:hover {
                background-color: ${THEME.active} !important;
            }

            /* =================
               4. ENLACES
               ================= */
            .cyborg-str-tool a:not(${EXCLUSIONS}) {
                color: #89929c !important;
            }

            .cyborg-str-tool a.visited:not(${EXCLUSIONS}) {
                color: ${THEME.primary} !important;
            }
            .cyborg-str-tool a:hover:not(${EXCLUSIONS}) {
                color: ${THEME.hover} !important;
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
                box-shadow: 0 0 0 2px rgba(0, 174, 239, 0.2) !important;
                outline: none !important;
            }

                                /* Estilos para los tabs */
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
                font-weight:500 !important; /* Fuente más gruesa */
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

                gap: 10px; /* Espacio entre botones (reducido para ahorrar espacio) */

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
                background-color: ${THEME.secondary} !important; /* Verde lima */
                color: ${THEME.dark} !important; /* Texto negro */
            }

            .pop_up_header_container .btn-primary { /* In same MUS */
                background-color: ${THEME.primary} !important; /* Azul */
                color: white !important;
            }

            .pop_up_header_container .btn-warning { /* Different */
                background-color: #FF9800 !important; /* Mantener naranja para "Different" */
                color: white !important;
            }

            .pop_up_header_container .btn-info { /* Not sure */
                background-color: ${THEME.medium} !important; /* Gris oscuro */
                color: white !important;
            }

            button[id*="btn_listing_pair_next"] { /* Next pair */
                background-color: ${THEME.light} !important; /* Gris claro */
                color: ${THEME.dark} !important; /* Texto negro */
                border: 1px solid ${THEME.border} !important;
            }

            button[id*="btn_listing_pair_prev"] { /* Prev pair */
                background-color: ${THEME.light} !important; /* Gris claro */
                color: ${THEME.dark} !important; /* Texto negro */
                border: 1px solid ${THEME.border} !important;
            }

        `;

        const style = document.createElement('style');
        style.id = 'custom-cyborg-styles';
        style.textContent = css;

        // Insertar estilos lo antes posible
        if (document.head) {
            document.head.appendChild(style);
        } else {
            // Si document.head aún no está disponible, esperar y volver a intentar
            const checkHead = setInterval(() => {
                if (document.head) {
                    document.head.appendChild(style);
                    clearInterval(checkHead);
                }
            }, 10); // Comprobar cada 10ms
        }

        // Agregar clase al body tan pronto como esté disponible
        const applyBodyClass = () => {
            if (document.body) {
                document.body.classList.add('cyborg-str-tool');
            }
        };

        applyBodyClass();
        // Asegurarse de que la clase se aplique cuando el body esté disponible
        document.addEventListener('DOMContentLoaded', applyBodyClass);
    }

    // Función para configurar los eventos de clic automático
    function setupButtonEvents() {
        // Usar delegación de eventos para manejar botones creados dinámicamente
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Comprobar botón "Same"
            if (target.classList.contains('btn-success')) {
                scheduleNextPairClick(2000); // 2 segundos
            }
            // Comprobar botones "In same MUS", "Different", "Not sure"
            else if (target.classList.contains('btn-primary') ||
                    target.classList.contains('btn-warning') ||
                    target.classList.contains('btn-info')) {
                scheduleNextPairClick(500); // 0.5 segundos
            }
        });

        // Atajo de teclado Ctrl+S para hacer clic en el botón Save
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const saveButton = document.getElementById('btn_submit_vetting_dlg');
                if (saveButton) {
                    saveButton.click();
                }
            }
        });
    }

    document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        e.target.classList.add('visited');
    }
});

    // Programar clic en "Next Pair"
    function scheduleNextPairClick(delay) {
        setTimeout(() => {
            const nextPairButton = document.querySelector('button[id*="btn_listing_pair_next"]');
            if (nextPairButton) {
                nextPairButton.click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, delay);
    }

    // Configurar observador para elementos dinámicos
    function setupObserver() {
        // Usar un MutationObserver simplificado
        const observer = new MutationObserver(() => {
            document.body.classList.add('cyborg-str-tool');
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // INICIALIZACIÓN INMEDIATA
    // 1. Inyectar estilos lo antes posible
    injectStyles();

    // 2. Configurar eventos cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupButtonEvents();
            setupObserver();
        });
    } else {
        setupButtonEvents();
        setupObserver();
    }

    // 3. Asegurarse de que los estilos sean aplicados incluso si se carga tarde
    window.addEventListener('load', () => {
        document.body.classList.add('cyborg-str-tool');
    });
})();
