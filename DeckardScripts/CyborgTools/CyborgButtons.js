// ==UserScript==
// @name         CyborgButtons
// @namespace    http://tampermonkey.net/
// @version      4.9 // Incremented version to reflect significant changes
// @description  Botones laterales que cargan iframes (con ancho y posición configurables, todos persistentes) o abren pestañas nuevas al hacer clic, con estilos unificados y animaciones de deslizamiento. No se ejecuta dentro de iframes. Ahora con barra inferior estilo dock más compacta y botones más bajos.
// @author       Luis
// @match        https://cyborg.deckard.com/listing*
// @match        *://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // *** INICIO DE LA COMPROBACIÓN PARA EVITAR EJECUCIÓN EN IFRAMES ***
    if (window.self !== window.top) {
        // Este script se está ejecutando dentro de un iframe, por lo tanto, no hacemos nada.
        return;
    }
    // *** FIN DE LA COMPROBACIÓN ***

    // Crear elemento style para los estilos CSS comunes
    const style = document.createElement('style');
    style.textContent = `
        /* Contenedor principal de la barra tipo dock (más compacto y sutil) */
        #dockBar {
            position: fixed;
            bottom: 0; /* Pegado al fondo */
            left: 50%; /* Centrado horizontalmente (anteriormente 205px, ahora centrado absoluto) */
            transform: translateX(-50%); /* Ajuste para centrarlo perfectamente */
            z-index: 9999;
            display: flex;
            justify-content: center; /* Centrar los botones dentro del dock */
            align-items: flex-end; /* Alinear los botones a la parte inferior de su contenedor (para el efecto pop-up) */
            padding: 2px 10px; /* Padding interno más reducido */
            gap: 6px; /* Espacio entre los botones más reducido */
            background: rgba(255, 255, 255, 0.15); /* Fondo blanco muy translúcido */
            backdrop-filter: blur(8px); /* Efecto de cristal esmerilado */
            -webkit-backdrop-filter: blur(8px); /* Soporte para Webkit */
            border-top-left-radius: 8px; /* Esquinas superiores redondeadas, más pequeñas */
            border-top-right-radius: 8px;
            box-shadow: 0 -3px 10px rgba(0,0,0,0.2); /* Sombra más sutil */
        }

        /* Estilos base para todos los botones en el dock (más pequeños y visibles) */
        .dock-button {
            width: 45px; /* Ancho de cada botón reducido */
            height: 28px; /* Altura de cada botón más reducida */
            background: rgba(9, 49, 64, 0.7); /* Fondo oscuro semi-transparente para mejor visibilidad */
            color: white; /* Texto blanco para alto contraste */
            border: 1px solid rgba(255, 255, 255, 0.3); /* Borde blanco sutil para delimitar */
            border-radius: 5px 5px 0 0; /* Solo esquinas superiores redondeadas, más pequeñas */
            cursor: pointer;
            box-shadow: none; /* La sombra la maneja el dock, individualmente solo al hover */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center; /* Centrar verticalmente el contenido */
            transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
            text-align: center;
            padding-top: 0; /* Eliminado el padding-top, ya se centra con justify-content */
            box-sizing: border-box;
        }

        /* Efecto hover uniforme para TODOS los botones (más sutil y con borde) */
        .dock-button:hover {
            background: rgba(7, 38, 51, 0.9); /* Oscurecer un poco más y menos transparente al pasar el ratón */
            transform: translateY(-3px) scale(1.03); /* Deslizar hacia arriba y ligeramente más grande, menos dramático */
            box-shadow: 0 3px 10px rgba(0,0,0,0.2); /* Sombra más pronunciada al hacer hover */
            border-color: rgba(255, 255, 255, 0.5); /* Borde más visible al hacer hover */
        }

        .dock-button span {
            font-size: 8px; /* Tamaño de fuente más pequeño */
            font-weight: bold;
            letter-spacing: 0.5px;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.2); /* Pequeña sombra para el texto para legibilidad */
            color: white; /* Asegurar que el texto sea blanco */
        }

        /* Contenedor principal del iframe (modal, ahora sin fondo oscuro) */
        #iframeContainer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none; /* Oculto por defecto */
            z-index: 10000;
            background: transparent; /* ¡Fondo completamente transparente! */
            display: flex; /* Usar flexbox para centrar o alinear contenido */
            align-items: center; /* Centrar verticalmente */
            /* justify-content se establecerá dinámicamente en JS (flex-end, flex-start o center) */
            pointer-events: none; /* Permitir clics a través del fondo cuando está oculto */
        }
        #iframeContainer.active {
            display: flex;
            pointer-events: auto; /* Habilitar clics cuando está activo */
        }

        /* Estilos base para el wrapper del iframe. Dimensiones, bordes y sombras son dinámicos via JS */
        .iframe-wrapper {
            position: relative;
            background: white;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;

            /* Animación de deslizamiento - ahora desde abajo */
            transform: translateY(100vh); /* Inicia fuera de la pantalla por debajo */
            opacity: 0; /* Inicia invisible */
            transition: transform 0.4s ease-out, opacity 0.4s ease-out;
        }

        .iframe-wrapper.slide-in {
            transform: translateY(0); /* Se desliza a su posición final */
            opacity: 1; /* Se hace visible */
        }

        /* Estilo para el iframe dentro del wrapper */
        .iframe-wrapper iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        }

        .close-btn {
            position: absolute;
            top: 10px; /* Posición ajustada */
            left: 10px; /* Posición ajustada */
            width: 28px; /* Tamaño ajustado */
            height: 28px; /* Tamaño ajustado */
            border-radius: 50%;
            background: #ff4444;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px; /* Tamaño ajustado */
            font-weight: bold;
            z-index: 10001;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25); /* Sombra ajustada */
            transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .close-btn:hover {
            background: #cc0000;
            transform: scale(1.1) rotate(90deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        }
    `;
    document.head.appendChild(style);

    // Contenedor principal del iframe (vacío inicialmente)
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'iframeContainer';
    document.body.appendChild(iframeContainer);

    // Nuevo contenedor para la barra tipo dock
    const dockBar = document.createElement('div');
    dockBar.id = 'dockBar';
    document.body.appendChild(dockBar);

    // Global variables to manage the active iframe and persistent iframes
    let activeIframeWrapper = null;
    const persistentIframesMap = new Map(); // Map to store persistent iframe wrappers by label

    // Function to create an iframe wrapper, iframe, and close button
    function createIframeElements(config) {
        const iframeWrapper = document.createElement('div');
        iframeWrapper.className = 'iframe-wrapper';
        iframeWrapper.dataset.label = config.label; // For debugging/identification

        const iframe = document.createElement('iframe');
        iframe.src = config.url; // URL loaded only on creation
        iframe.setAttribute('allow', 'clipboard-write'); // Permitir acceso al portapapeles si es necesario

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = `Cerrar ${config.label}`;
        closeBtn.onclick = function(e) {
            e.stopPropagation(); // Prevenir que el clic se propague al iframeContainer
            closeActiveIframe();
        };

        iframeWrapper.appendChild(closeBtn);
        iframeWrapper.appendChild(iframe);

        return { iframeWrapper, iframe, closeBtn };
    }

    // Function to manage showing and hiding iframes
    function showIframe(iframeWrapper, config) {
        // Ocultar el iframe actualmente activo si es diferente
        if (activeIframeWrapper && activeIframeWrapper !== iframeWrapper) {
            activeIframeWrapper.classList.remove('slide-in'); // Inicia la animación de salida para el actual
            activeIframeWrapper.addEventListener('transitionend', function handler() {
                if (activeIframeWrapper.parentNode) {
                    activeIframeWrapper.parentNode.removeChild(activeIframeWrapper);
                }
                activeIframeWrapper.removeEventListener('transitionend', handler);
            }, { once: true });
        }

        // --- APLICAR ESTILOS DINÁMICOS CADA VEZ QUE SE MUESTRA EL IFRAME ---
        // Esto es crucial para que los iframes persistentes se muestren con el tamaño y posición correctos
        iframeWrapper.style.width = `${config.iframeWidth}%`;
        iframeWrapper.style.height = `${config.iframeHeight}%`;

        // Configurar la alineación horizontal del contenedor del iframe
        if (config.iframePosition === 'right') {
            iframeContainer.style.justifyContent = 'flex-end';
        } else if (config.iframePosition === 'left') {
            iframeContainer.style.justifyContent = 'flex-start';
        } else {
            iframeContainer.style.justifyContent = 'center'; // Por defecto o 'center'
        }
        iframeContainer.style.alignItems = 'center'; // Siempre centrar verticalmente

        // Aplicar estilos de borde y sombra para iframes que no son 100% de pantalla
        if (config.iframeWidth === 100 && config.iframeHeight === 100) {
            iframeWrapper.style.borderRadius = '0'; // Sin bordes redondeados
            iframeWrapper.style.boxShadow = 'none'; // Sin sombra
        } else {
            iframeWrapper.style.borderRadius = '10px'; // Con bordes redondeados
            iframeWrapper.style.boxShadow = '0 8px 25px rgba(0,0,0,0.35)'; // Con sombra
        }
        // --- FIN DE APLICACIÓN DE ESTILOS DINÁMICOS ---

        // Añadir el iframeWrapper al contenedor principal si no está ya
        if (!iframeContainer.contains(iframeWrapper)) {
            iframeContainer.appendChild(iframeWrapper);
        }

        // Mostrar el contenedor y disparar la animación de entrada
        iframeContainer.classList.add('active');
        requestAnimationFrame(() => {
            iframeWrapper.classList.add('slide-in');
        });

        activeIframeWrapper = iframeWrapper; // Actualizar la referencia al iframe activo
    }

    // Función para cerrar el iframe actualmente activo
    const closeActiveIframe = () => {
        if (activeIframeWrapper) {
            activeIframeWrapper.classList.remove('slide-in'); // Inicia la animación de salida
            activeIframeWrapper.addEventListener('transitionend', function handler() {
                iframeContainer.classList.remove('active'); // Ocultar el contenedor modal
                // Eliminar el iframeWrapper del DOM, pero no de `persistentIframesMap`
                // para mantener su estado si es un iframe persistente.
                if (activeIframeWrapper.parentNode) {
                    activeIframeWrapper.parentNode.removeChild(activeIframeWrapper);
                }
                activeIframeWrapper.removeEventListener('transitionend', handler);
            }, { once: true });
            activeIframeWrapper = null; // Limpiar la referencia al iframe activo
        }
    };

    // Cerrar el iframe al hacer clic fuera de él (en el fondo transparente)
    iframeContainer.onclick = function(e) {
        if (e.target === iframeContainer) {
            closeActiveIframe();
        }
    };

    // Definición de los botones
    const buttonsConfig = [
        {
            label: 'LB & PQ',
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA91SpQ2ZDf7rJFVESnBCVk9/exec',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 90,     // Ancho del iframe: 90%
            iframeHeight: 100,   // Alto del iframe: 100%
            iframePosition: 'center', // Centrado
            persistent: true     // Mantener estado y no recargar
        },
        {
            label: 'AO',
            url: 'https://dinfcs.github.io/Deckardaov/',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 40,     // Ancho del iframe: 40%
            iframeHeight: 100,   // Alto del iframe: 100%
            iframePosition: 'left', // Pegado a la izquierda
            persistent: true
        },
        {
            label: 'ADV-FILTER', // Nombre en mayúsculas
            url: 'https://dinfcs.github.io/Deckardaov/FilterGeneratorv2/index.html',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 40,     // Ancho del iframe: 40%
            iframeHeight: 100,   // Alto del iframe: 100%
            iframePosition: 'left', // Pegado a la izquierda
            persistent: true
        },
        {
            label: 'PREDIT', // Nombre en mayúsculas
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbzlbnt8-hCek-5BBAfCpMMwkh8iw-30ULecqU6RyvMYooFuZkeR97YE8YjfDFTBkYO8xQ/exec',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 90,     // Ancho del iframe: 90%
            iframeHeight: 100,   // Alto del iframe: 100%
            iframePosition: 'center', // Centrado
            persistent: true
        },
        {
            label: 'ACCOUNTS', // Nombre en mayúsculas
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA41SpQ2ZDf7rJFVESnBCVk9/exec',
            openInNewTab: true // Abre en nueva pestaña
        },
        {
            label: 'REGRID', // Nombre en mayúsculas
            url: 'https://app.regrid.com/',
            openInNewTab: true // Abre en nueva pestaña
        }
    ];

    buttonsConfig.forEach((config) => {
        const dockButton = document.createElement('div');
        dockButton.className = 'dock-button';
        // Asegurar que el texto del botón siempre sea mayúsculas
        dockButton.innerHTML = `<span>${config.label.toUpperCase()}</span>`;
        dockButton.title = config.label; // Añadir título para accesibilidad/tooltip

        // Configurar la acción al hacer clic
        dockButton.onclick = () => {
            if (config.openInNewTab) {
                window.open(config.url, '_blank');
            } else {
                let iframeWrapper;

                if (config.persistent && persistentIframesMap.has(config.label)) {
                    // Si es persistente y ya existe, recuperarlo del mapa
                    iframeWrapper = persistentIframesMap.get(config.label);
                } else {
                    // Crear nuevos elementos si no es persistente o si es persistente pero no se ha creado aún
                    const elements = createIframeElements(config);
                    iframeWrapper = elements.iframeWrapper;

                    if (config.persistent) {
                        persistentIframesMap.set(config.label, iframeWrapper);
                    }
                }
                // Mostrar el iframe (nuevo o recuperado), pasando la configuración para que aplique los estilos
                showIframe(iframeWrapper, config);
            }
        };

        dockBar.appendChild(dockButton); // Añadir el botón al nuevo dockBar
    });

})();
