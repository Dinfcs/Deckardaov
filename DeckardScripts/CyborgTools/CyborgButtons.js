// ==UserScript==
// @name         CyborgButtons
// @namespace    http://tampermonkey.net/
// @version      5.1 // Incremented version
// @description  Botones laterales que cargan iframes (con ancho y posición configurables, todos persistentes y con deslizamiento horizontal) o abren pestañas nuevas al hacer clic, con estilos unificados y animaciones. No se ejecuta dentro de iframes. Ahora con barra inferior estilo dock más compacta y botones más bajos.
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
            left:  211.8px; /* Centrado horizontalmente */
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
            background: rgba(0,0,0,0.1); /* Ligero fondo oscuro para el modal */
            pointer-events: none; /* Permitir clics a través del fondo cuando está oculto */
        }
        #iframeContainer.active {
            display: block; /* Simplemente mostrar el overlay */
            pointer-events: auto; /* Habilitar clics cuando está activo */
        }

        /* Estilos para el wrapper del iframe */
        .iframe-wrapper {
            position: fixed; /* Posicionamiento fijo para el iframe en la pantalla */
            top: 0;
            /* left y width serán establecidos por JS para el efecto de deslizamiento */
            height: 100%;
            background: white; /* Color de fondo para el wrapper */
            box-sizing: border-box;
            overflow: hidden;
            border: none; /* Borde se manejará dinámicamente */
            box-shadow: none; /* Sombra se manejará dinámicamente */
            transition: width 0.3s ease, left 0.3s ease, right 0.3s ease; /* Transición para el deslizamiento horizontal */
            z-index: 10001; /* Sobre el iframeContainer pero debajo del close button global */
        }

        /* Estilo para el iframe dentro del wrapper */
        .iframe-wrapper iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        }

        /* Estilos para el botón de cierre global */
        #global-close-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 38px; /* Tamaño más grande para el botón de cierre */
            height: 38px;
            border-radius: 50%;
            background: #cc0000; /* Rojo más oscuro */
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px; /* Tamaño de fuente más grande */
            font-weight: bold;
            z-index: 10002; /* Para que siempre esté encima de todo */
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
            display: none; /* Oculto por defecto */
        }

        #global-close-btn:hover {
            background: #990000; /* Rojo aún más oscuro al pasar el ratón */
            transform: scale(1.05) rotate(90deg);
            box-shadow: 0 6px 12px rgba(0,0,0,0.4);
        }
    `;
    document.head.appendChild(style);

    // Contenedor principal del iframe (el overlay transparente)
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

    // Crear el botón de cierre global una única vez
    const globalCloseBtn = document.createElement('button');
    globalCloseBtn.id = 'global-close-btn';
    globalCloseBtn.innerHTML = '×';
    globalCloseBtn.title = 'Cerrar Iframe';
    globalCloseBtn.onclick = function(e) {
        e.stopPropagation(); // Prevenir que el clic se propague al iframeContainer
        closeActiveIframe();
    };
    document.body.appendChild(globalCloseBtn);

    // Función para crear un iframe wrapper y el iframe interno
    function createIframeElements(config) {
        const iframeWrapper = document.createElement('div');
        iframeWrapper.className = 'iframe-wrapper';
        iframeWrapper.dataset.label = config.label; // Para identificación

        const iframe = document.createElement('iframe');
        iframe.src = config.url; // URL se carga solo en la creación
        iframe.setAttribute('allow', 'clipboard-write'); // Permitir acceso al portapapeles

        iframeWrapper.appendChild(iframe);
        return iframeWrapper;
    }

    // Función para mostrar y manejar la posición y tamaño de un iframe
    function showIframe(iframeWrapper, config) {
        // Ocultar el iframe actualmente activo si es diferente
        if (activeIframeWrapper && activeIframeWrapper !== iframeWrapper) {
            // Animación de salida para el iframe anterior
            activeIframeWrapper.style.width = '0%';
            // Resetear left/right para que la transición de salida sea limpia
            if (activeIframeWrapper.style.left) activeIframeWrapper.style.left = 'auto';
            if (activeIframeWrapper.style.right) activeIframeWrapper.style.right = 'auto';

            activeIframeWrapper.addEventListener('transitionend', function handler() {
                if (activeIframeWrapper.parentNode) {
                    activeIframeWrapper.parentNode.removeChild(activeIframeWrapper);
                }
                activeIframeWrapper.removeEventListener('transitionend', handler);
            }, { once: true });
        }

        // --- APLICAR ESTILOS DINÁMICOS CADA VEZ QUE SE MUESTRA EL IFRAME ---
        iframeWrapper.style.height = `${config.iframeHeight}%`;

        // Posicionamiento horizontal inicial (para la animación desde 0%)
        // Resetear left/right para evitar conflictos
        iframeWrapper.style.left = 'auto';
        iframeWrapper.style.right = 'auto';

        if (config.iframePosition === 'right') {
            iframeWrapper.style.right = '0';
        } else if (config.iframePosition === 'left') {
            iframeWrapper.style.left = '0';
        } else { // 'center' o default
            // Centrar: calcular left para que el iframe quede centrado
            // Se moverá desde 0% de ancho a config.iframeWidth% manteniendo el centro
            iframeWrapper.style.left = `${(100 - config.iframeWidth) / 2}%`;
        }

        iframeWrapper.style.width = '0%'; // Inicia en 0% para el efecto de deslizamiento


        // Aplicar estilos de borde y sombra para iframes que no son 100% de pantalla
        if (config.iframeWidth === 100 && config.iframeHeight === 100) {
            iframeWrapper.style.borderRadius = '0'; // Sin bordes redondeados
            iframeWrapper.style.boxShadow = 'none'; // Sin sombra
        } else {
            iframeWrapper.style.borderRadius = '10px'; // Con bordes redondeados
            iframeWrapper.style.boxShadow = '0 8px 25px rgba(0,0,0,0.35)'; // Con sombra
        }
        // --- FIN DE APLICACIÓN DE ESTILOS DINÁMICOS ---

        // Añadir el iframeWrapper al body si no está ya
        if (!document.body.contains(iframeWrapper)) {
            document.body.appendChild(iframeWrapper);
        }

        // Mostrar el contenedor de overlay y disparar la animación de entrada
        iframeContainer.classList.add('active');
        globalCloseBtn.style.display = 'flex'; // Mostrar el botón de cierre global

        // Usar requestAnimationFrame y un setTimeout para asegurar que la transición se aplique
        requestAnimationFrame(() => {
            setTimeout(() => {
                iframeWrapper.style.width = `${config.iframeWidth}%`; // Animar al ancho deseado
            }, 10); // Pequeño retardo para asegurar que el DOM ha procesado el 0% de width
        });

        activeIframeWrapper = iframeWrapper; // Actualizar la referencia al iframe activo
    }

    // Función para cerrar el iframe actualmente activo
    const closeActiveIframe = () => {
        if (activeIframeWrapper) {
            // Animación de salida del iframe
            activeIframeWrapper.style.width = '0%';

            activeIframeWrapper.addEventListener('transitionend', function handler() {
                // Una vez que la transición termina, ocultar el overlay y el botón de cierre
                iframeContainer.classList.remove('active');
                globalCloseBtn.style.display = 'none';

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
            iframePosition: 'right', // Pegado a la derecha
            persistent: true
        },
        {
            label: 'ADV-FILTER',
            url: 'https://dinfcs.github.io/Deckardaov/FilterGeneratorv2/index.html',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 48,     // Ancho del iframe: 40%
            iframeHeight: 100,   // Alto del iframe: 100%
            iframePosition: 'right', // Pegado a la derecha
            persistent: true
        },
        {
            label: 'ACCOUNTS',
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA91SpQ2ZDf7rJFVESnBCVk9/exec',
            openInNewTab: true // Abre en nueva pestaña
        },
        {
            label: 'REGRID',
            url: 'https://app.regrid.com/',
            openInNewTab: true // Abre en nueva pestaña
        },
                {
            label: 'PREDIT',
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbzlbnt8-hCek-5BBAfCpMMwkh8iw-30ULecqU6RyvMYooFuZkeR97YE8YjfDFTBkYO8xQ/exec',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 90,     // Ancho del iframe: 90%
            iframeHeight: 100,   // Alto del iframe: 100%
            iframePosition: 'center', // Centrado
            persistent: true
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
                // Si openMultiple es true, abre la segunda URL también
                if (config.openMultiple) {
                    window.open('https://www.appsheet.com/start/0e4a5be2-014b-4c32-a963-9cced65a14e5?platform=desktop#vss=H4sIAAAAAAAAA6WQwU7DMBBEfwXt2UVJWqjwDSgghABBIw7UPZh4AxGJbdkOUEX-d9ahCA5cgJs9njee3QFeGnxdBlk9A18NX7cL3ACHQUC5sSiACzg2OjjTCmACrmT3Id4c7thWat3oRwER4pp9RgT0wIdfJ_B_d2DQKNShqRt0KS7BFLNF6TmBJHzDIDLo-iDfWhybJ2zr_8HM4NaYQGItfSgTRNJCBklsZ0kvsmI2yfNJsVdmOc_3eTbdzWbzg_k0vyfrmTO9PaLRVrStpXFhPKcf277TxJ9i9STJeO1UGgEW6CvUaiy6jpHK1qbqPao72tTfNuTP9cmblVpdGkXz1bL1GN8Beq_D3g0CAAA=&view=QA%20planning&appName=QAProductivity-985429461-24-10-30', '_blank');
                }
            } else {
                let iframeWrapper;

                if (config.persistent && persistentIframesMap.has(config.label)) {
                    // Si es persistente y ya existe, recuperarlo del mapa
                    iframeWrapper = persistentIframesMap.get(config.label);
                } else {
                    // Crear nuevos elementos si no es persistente o si es persistente pero no se ha creado aún
                    iframeWrapper = createIframeElements(config);
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
