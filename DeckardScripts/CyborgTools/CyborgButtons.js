// ==UserScript==
// @name         LbPqFrame_Extended
// @namespace    http://tampermonkey.net/
// @version      4.4
// @description  Botones laterales que cargan iframes (con ancho y posición configurables) o abren pestañas nuevas al hacer clic, con estilos unificados y animaciones de deslizamiento. No se ejecuta dentro de iframes. Ahora con barra inferior estilo dock más compacta y botones más bajos.
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
            left: 10.6%; /* Centrado horizontalmente */
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
            /* justify-content se establecerá dinámicamente en JS (flex-end o center) */
            pointer-events: none; /* Permitir clics a través del fondo cuando está oculto */
        }
        #iframeContainer.active {
            display: flex;
            pointer-events: auto; /* Habilitar clics cuando está activo */
        }

        .iframe-wrapper {
            position: relative;
            width: 80%; /* Ancho por defecto del wrapper reducido */
            height: 75%; /* Altura del wrapper reducida */
            background: white; /* Color de fondo para el wrapper */
            border-radius: 10px; /* Bordes redondeados para el contenedor del iframe */
            box-shadow: 0 8px 25px rgba(0,0,0,0.35); /* Sombra ajustada */
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

        #appFrame {
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


    // Función para cargar y mostrar un iframe modal
    function loadAndShowIframe(url, title, widthPercentage, position) {
        // Limpiar el contenido previo del contenedor
        iframeContainer.innerHTML = '';

        // Configurar la alineación horizontal del contenedor del iframe
        iframeContainer.style.justifyContent = (position === 'right') ? 'flex-end' : 'center';
        iframeContainer.style.alignItems = 'center'; // Siempre centrar verticalmente

        // Crear elementos del iframe
        const iframeWrapper = document.createElement('div');
        iframeWrapper.className = 'iframe-wrapper';
        iframeWrapper.style.width = `${widthPercentage}%`; // Asignar el ancho dinámicamente
        // La altura ya está definida en CSS para el wrapper (75%)

        const iframe = document.createElement('iframe');
        iframe.id = 'appFrame';
        iframe.src = url;
        iframe.setAttribute('allow', 'clipboard-write'); // Permitir acceso al portapapeles si es necesario

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = `Cerrar ${title}`;

        // Función para cerrar el iframe con animación
        const closeIframe = () => {
            iframeWrapper.classList.remove('slide-in'); // Inicia la animación de salida
            iframeWrapper.addEventListener('transitionend', function handler() {
                iframeContainer.classList.remove('active'); // Ocultar el contenedor
                iframeWrapper.removeEventListener('transitionend', handler);
            }, { once: true });
        };

        // Configurar eventos para el botón de cierre y el clic fuera del iframe
        closeBtn.onclick = function(e) {
            e.stopPropagation();
            closeIframe();
        };

        // Cerrar el iframe al hacer clic fuera de él (en el fondo transparente)
        iframeContainer.onclick = function(e) {
            if (e.target === iframeContainer) {
                closeIframe();
            }
        };

        // Agregar elementos al wrapper y luego al contenedor principal
        iframeWrapper.appendChild(closeBtn);
        iframeWrapper.appendChild(iframe);
        iframeContainer.appendChild(iframeWrapper);

        // Mostrar el contenedor (sin el iframe aún en posición final)
        iframeContainer.classList.add('active');

        // Disparar la animación de entrada después de un pequeño retardo
        requestAnimationFrame(() => {
            iframeWrapper.classList.add('slide-in');
        });
    }

    // Definición de los botones
    const buttonsConfig = [
        {
            label: 'LB & PQ',
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA91SpQ2ZDf7rJFVESnBCVk9/exec',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 95, // Ancho del iframe
            iframePosition: 'center' // Posición del iframe
        },
        {
            label: 'AO',
            url: 'https://dinfcs.github.io/Deckardaov/',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 80, // Ancho del iframe
            iframePosition: 'right' // Pegado a la derecha
        },
        {
            label: 'Adv-Filter',
            url: 'https://dinfcs.github.io/Deckardaov/FilterGeneratorv2/index.html',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 70, // Ancho del iframe
            iframePosition: 'right' // Pegado a la derecha
        },
        {
            label: 'PrEdit',
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbzlbnt8-hCek-5BBAfCpMMwkh8iw-30ULecqU6RyvMYooFuZkeR97YE8YjfDFTBkYO8xQ/exec',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 95, // Ancho del iframe
            iframePosition: 'center' // Posición del iframe
        },
        {
            label: 'Accounts',
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA41SpQ2ZDf7rJFVESnBCVk9/exec',
            openInNewTab: true // Abre en nueva pestaña
        },
        {
            label: 'Regrid',
            url: 'https://app.regrid.com/',
            openInNewTab: true // Abre en nueva pestaña
        }
    ];

    buttonsConfig.forEach((config) => {
        const dockButton = document.createElement('div');
        dockButton.className = 'dock-button';
        dockButton.innerHTML = `<span>${config.label}</span>`;
        dockButton.title = config.label; // Añadir título para accesibilidad/tooltip

        // Configurar la acción al hacer clic
        dockButton.onclick = () => {
            if (config.openInNewTab) {
                window.open(config.url, '_blank');
            } else {
                // Pasar el ancho y la posición al cargar el iframe
                loadAndShowIframe(config.url, config.label, config.iframeWidth, config.iframePosition);
            }
        };

        dockBar.appendChild(dockButton); // Añadir el botón al nuevo dockBar
    });

})();
