// ==UserScript==
// @name         Estilos Modernos y Compactos (Optimizado)
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Estilos modernos y compactos optimizados para una mejor experiencia de usuario y carga más rápida.
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Constantes y configuración (definidas fuera de funciones para solo inicializarlas una vez)
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

    const THEME = {
        primary: '#4A90E2',       
        secondary: '#4A90E2',     
        accent: '#00C853',        
        dark: '#2C3E50',          
        medium: '#546E7A',        
        light: '#ECEFF1',         
        hover: '#3F51B5',         
        active: '#303F9F',        
        bgLight: '#FAFAFA',       
        bgAlt: '#F5F5F5',         
        bgHeader: '#E3F2FD',      
        border: '#CFD8DC',        
        shadow: 'rgba(0, 0, 0, 0.1)'
    };

    const STYLE = {
        fontFamily: 'Roboto, sans-serif',
        fontSizeBase: '12px',
        fontSizeSmall: '11px',
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

    // Almacenamiento para comprobar si los estilos ya están aplicados
    let stylesApplied = false;
    let observerActive = false;
    let buttonEventsBound = false;
    let styleElement = null;

    /**
     * Agrega un elemento de estilo al documento una sola vez
     * @param {string} css - Contenido CSS a agregar
     */
    const addStyle = (css) => {
        if (stylesApplied || document.querySelector('#custom-cyborg-styles')) return;

        styleElement = document.createElement('style');
        styleElement.id = 'custom-cyborg-styles';
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        stylesApplied = true;
    };

    /**
     * Genera los estilos CSS modernos (función optimizada para generar CSS una sola vez)
     */
    const generateStyles = () => {
        // Uso de template string literal en una sola declaración para mejorar rendimiento
        return `
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
                height: 30px !important;
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
                color: #02acf5 !important;
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
                position: fixed;
                top: 5px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                background-color: rgba(255, 255, 255, 0.8);
                padding: 8px;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: nowrap;
                max-width: 70%;
                width: auto;
                backdrop-filter: blur(10px);
            }

            /* =================
               8. ESTILOS COMUNES PARA TODOS LOS BOTONES
               ================= */
            .pop_up_header_container .btn,
            button[id*="btn_listing_pair_next"],
            button[id*="btn_listing_pair_prev"] {
                min-width: 90px !important;
                padding: 5px 10px !important;
                font-size: 14px !important;
                font-weight: 500 !important;
                border-radius: 6px !important;
                border: none !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                text-align: center !important;
            }

            /* =================
               9. COLORES DE FONDO PERSONALIZADOS PARA LOS BOTONES
               ================= */
            .pop_up_header_container .btn-success {
                background-color: #4CAF50 !important;
                color: white !important;
            }

            .pop_up_header_container .btn-primary {
                background-color: #2196F3 !important;
                color: white !important;
            }

            .pop_up_header_container .btn-warning {
                background-color: #FF9800 !important;
                color: white !important;
            }

            .pop_up_header_container .btn-info {
                background-color: #00BCD4 !important;
                color: white !important;
            }

            button[id*="btn_listing_pair_next"] {
                background-color: #B0BEC5 !important;
                color: white !important;
            }

            button[id*="btn_listing_pair_prev"] {
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
                background-color: ${THEME.bgLight} !important;
                border: 1px solid ${THEME.border} !important;
                border-bottom: none !important;
                transition: all ${STYLE.transition} !important;
                text-align: center !important;
                box-sizing: border-box !important;
                font-size: ${STYLE.fontSizeBuckets} !important;
                font-weight: 530 !important;
                color: ${THEME.medium} !important;
                border-radius: ${STYLE.borderRadius} ${STYLE.borderRadius} 0 0 !important;
                cursor: pointer !important;
                margin-right: ${STYLE.spacingXs} !important;
            }

            /* Estilos para el tab seleccionado */
            .tab-container .tab--selected {
                background-color: white !important;
                color: ${THEME.primary} !important;
                border-color: ${THEME.primary} !important;
                font-weight: 500 !important;
                box-shadow: 0 -2px 0 ${THEME.primary} inset !important;
            }

            /* Efecto hover para los tabs */
            .tab-container .tab:hover {
                background-color: ${THEME.light} !important;
                color: ${THEME.dark} !important;
            }

            /* Efecto hover para el tab seleccionado */
            .tab-container .tab--selected:hover {
                background-color: white !important;
                color: ${THEME.hover} !important;
                border-color: ${THEME.hover} !important;
            }
        `;
    };

    /**
     * Aplica los estilos al document una sola vez
     */
    const applyModernStyles = () => {
        if (!stylesApplied) {
            document.body.classList.add('cyborg-str-tool');
            addStyle(generateStyles());
        }
    };

    /**
     * Configura eventos a botones una sola vez
     * Implementa detección de eventos con delegación para mejorar el rendimiento
     */
    const setupButtonEvents = () => {
        if (buttonEventsBound) return;

        // Usar delegación de eventos para mejorar rendimiento
        document.body.addEventListener('click', (e) => {
            const target = e.target;
            
            // Comprobar si el clic fue en uno de los botones de acción
            if (target.matches('.btn-success')) { // Same: 2 segundos
                handleButtonClick(2000);
            } else if (target.matches('.btn-primary, .btn-warning, .btn-info')) { // 0.5 segundos para el resto
                handleButtonClick(500);
            }
        });

        // Atajo de teclado Ctrl+S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                clickSaveButton();
            }
        });

        buttonEventsBound = true;
    };

    /**
     * Maneja el clic en un botón y programa el clic en "Next Pair" después del tiempo especificado
     * @param {number} delay - Tiempo de espera en milisegundos
     */
    const handleButtonClick = (delay) => {
        const nextPairButton = document.querySelector('button[id*="btn_listing_pair_next"]');
        if (nextPairButton) {
            // Usar setTimeout con una función explícita para evitar fugas de memoria
            setTimeout(() => {
                nextPairButton.click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, delay);
        }
    };

    /**
     * Función para hacer clic en el botón "Save" si existe
     */
    const clickSaveButton = () => {
        const saveButton = document.getElementById('btn_submit_vetting_dlg');
        if (saveButton) {
            saveButton.click();
        }
    };

    /**
     * Observador para aplicar estilos a elementos dinámicos (optimizado)
     */
    const setupDOMObserver = () => {
        if (observerActive) return;

        const targetNode = document.body;
        const config = { 
            childList: true, 
            subtree: true,
            attributes: false,
            characterData: false
        };

        // Usar debounce para reducir la frecuencia de actualizaciones
        let debounceTimer;
        const debounceDelay = 100; // ms

        const callback = (mutationsList) => {
            let shouldUpdateDOM = false;
            
            // Verificar si realmente necesitamos actualizar el DOM
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Sólo actualizar si se añadieron nodos relevantes
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1) { // Elemento
                            shouldUpdateDOM = true;
                            break;
                        }
                    }
                    if (shouldUpdateDOM) break;
                }
            }
            
            if (shouldUpdateDOM) {
                // Aplicar debounce para evitar múltiples actualizaciones en corto tiempo
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    document.body.classList.add('cyborg-str-tool');
                    if (!buttonEventsBound) {
                        setupButtonEvents();
                    }
                }, debounceDelay);
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
        observerActive = true;
    };

    /**
     * Función de inicialización principal
     */
    const init = () => {
        applyModernStyles();
        setupButtonEvents();
        setupDOMObserver();
    };

    // Iniciar la aplicación cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
