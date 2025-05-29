// ==UserScript==
// @name          Cyborg Buttons
// @namespace    http://tampermonkey.net/
// @version      3.9
// @description  Botones laterales que cargan iframes (con ancho y posición configurables) o abren pestañas nuevas al hacer clic, con estilos unificados y animaciones de deslizamiento. No se ejecuta dentro de iframes.
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
        /* Estilos base para todos los botones laterales */
        .floating-button-tab {
            position: fixed;
            right: 0;
            width: 20px;
            height: 70px; /* Altura estándar para todos los botones */
            background: #093140; /* Color de fondo consistente */
            color: white;
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: -1px 0 3px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease, background 0.2s ease; /* Transición para la animación de hover */
        }

        /* Posicionamiento inicial específico para el primer botón (LB & PQ) */
        .floating-button-tab.first-button {
            transform: translateY(-50%); /* Centra verticalmente respecto a su 'top' */
        }

        /* Efecto hover uniforme para TODOS los botones */
        .floating-button-tab:hover {
            background: #072633; /* Oscurecer un poco al pasar el ratón */
            /* El transform se ajustará a continuación para cada caso */
        }

        /* Hover para el primer botón (LB & PQ) - mantiene el translateY(-50%) y añade translateX(-3px) */
        .floating-button-tab.first-button:hover {
            transform: translateY(-50%) translateX(-3px);
        }

        /* Hover para los demás botones (posicionados por píxeles) - solo añade translateX(-3px) */
        .floating-button-tab:not(.first-button):hover {
            transform: translateX(-3px);
        }


        .floating-button-tab span {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
            padding: 2px;
            box-sizing: border-box;
        }

        /* Contenedor principal del iframe (modal) */
        #iframeContainer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none; /* Oculto por defecto */
            z-index: 10000;
            background: transparent; /* Fondo ahora transparente */
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
            /* width se ajustará dinámicamente en JS */
            height: 95%; /* Altura fija para el wrapper del iframe */
            background: white; /* Color de fondo para el wrapper */
            border-radius: 8px; /* Bordes redondeados para el contenedor del iframe */
            box-shadow: 0 5px 15px rgba(0,0,0,0.3); /* Sombra más pronunciada */
            display: flex; /* Para que el iframe ocupe todo el wrapper */
            flex-direction: column; /* Para apilar elementos si hubiera varios */
            overflow: hidden; /* Asegurar que los bordes redondeados se apliquen */
            box-sizing: border-box; /* Asegurar que el padding/border no afecte el ancho dinámico */

            /* Animación de deslizamiento */
            transform: translateX(100vw); /* Inicia fuera de la pantalla a la derecha */
            opacity: 0; /* Inicia invisible */
            transition: transform 0.4s ease-out, opacity 0.4s ease-out; /* Transición para la animación */
        }

        .iframe-wrapper.slide-in {
            transform: translateX(0); /* Se desliza a su posición final */
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
            top: 10px;
            left: 10px; /* Posicionado en la esquina superior izquierda del wrapper */
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #ff4444; /* Rojo para cerrar */
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px; /* Tamaño un poco más grande */
            font-weight: bold;
            z-index: 10001; /* Asegurar que esté por encima del iframe */
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: background 0.2s ease, transform 0.2s ease;
        }

        .close-btn:hover {
            background: #cc0000;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);

    // Contenedor principal del iframe (vacío inicialmente)
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'iframeContainer';
    document.body.appendChild(iframeContainer);

    // Función para cargar y mostrar un iframe modal
    function loadAndShowIframe(url, title, widthPercentage, position) {
        // Limpiar el contenido previo del contenedor
        iframeContainer.innerHTML = '';

        // Configurar la alineación horizontal del contenedor del iframe
        // 'flex-end' para pegar a la derecha, 'center' para centrar
        iframeContainer.style.justifyContent = (position === 'right') ? 'flex-end' : 'center';

        // Crear elementos del iframe
        const iframeWrapper = document.createElement('div');
        iframeWrapper.className = 'iframe-wrapper';
        iframeWrapper.style.width = `${widthPercentage}%`; // Asignar el ancho dinámicamente

        const iframe = document.createElement('iframe');
        iframe.id = 'appFrame'; // Usamos un ID genérico ya que solo uno estará activo
        iframe.src = url;
        iframe.setAttribute('allow', 'clipboard-write'); // Permitir acceso al portapapeles si es necesario

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.title = `Cerrar ${title}`; // Título para accesibilidad

        // Función para cerrar el iframe con animación
        const closeIframe = () => {
            iframeWrapper.classList.remove('slide-in'); // Inicia la animación de salida
            // Esperar a que la transición termine antes de ocultar el contenedor
            iframeWrapper.addEventListener('transitionend', function handler() {
                iframeContainer.classList.remove('active'); // Ocultar el contenedor
                // Restablecer justify-content para futuras aperturas
                iframeContainer.style.justifyContent = 'center';
                iframeWrapper.removeEventListener('transitionend', handler); // Limpiar el listener
            }, { once: true }); // El listener se remueve automáticamente después de una ejecución
        };

        // Configurar eventos para el botón de cierre y el clic fuera del iframe
        closeBtn.onclick = function(e) {
            e.stopPropagation(); // Evitar que el clic se propague al contenedor
            closeIframe();
        };

        // Cerrar el iframe al hacer clic fuera de él (en el fondo)
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
        // requestAnimationFrame asegura que el navegador ha renderizado el estado inicial
        requestAnimationFrame(() => {
            iframeWrapper.classList.add('slide-in');
        });
    }

    // Definición de los botones
    const buttonsConfig = [
        {
            label: 'LB & PQ',
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA91SpQ2ZDf7rJFVESnBCVk9/exec',
            topOffset: 15, // Aumentado a 15% para bajar todos los botones
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 95, // Ancho del iframe
            iframePosition: 'center' // Posición del iframe
        },
        {
            label: 'AO',
            url: 'https://dinfcs.github.io/Deckardaov/',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 50, // La mitad del ancho
            iframePosition: 'right' // Pegado a la derecha
        },
        {
            label: 'Adv-Filter',
            url: 'https://dinfcs.github.io/Deckardaov/FilterGeneratorv2/index.html',
            openInNewTab: false, // Abre iframe modal
            iframeWidth: 50, // La mitad del ancho
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
            url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA91SpQ2ZDf7rJFVESnBCVk9/exec',
            openInNewTab: true // Abre en nueva pestaña
        },
        {
            label: 'Regrid',
            url: 'https://app.regrid.com/',
            openInNewTab: true // Abre en nueva pestaña
        },
        {
            label: 'QA', // Este botón se mueve al final
            url: 'https://www.appsheet.com/start/f9378e0d-cef0-48b9-bd15-618bac8a35a4?platform=desktop#vss=H4sIAAAAAAAAA6WOywrCMBBFf0XuOl-QnYgLEQUfuDEuYjOFYJuUJlVLyL879blWl3OHc-5NOFu6bKIuTpD79Lnm1EMiKWz7hhSkwsS72PpKQSgsdf0IV-PRmhrfRoWMfBAvQaQAmb7k5Z_9AtaQi7a01A6yAWXJE-T3gHHwhpAF6i7qY0X3zQzlzFnpiy6Q2fGYX0aEmZteG3Mwht2lroKlG_kad0ragEAAA==&view=QA%20Report&appName=RandomQAReport-985429461-24-11-28',
            openInNewTab: true // Abre en nueva pestaña
        }
    ];

    const buttonHeight = 70; // Altura definida en CSS para .floating-button-tab
    const verticalGap = 10; // Espacio entre botones en píxeles

    // Calcular la posición del borde inferior del primer botón (LB & PQ)
    // Su centro está en `topOffset%` de la altura de la ventana debido a 'top' y 'translateY(-50%)'.
    // Para calcular el borde inferior, sumamos la mitad de su altura a su posición central.
    let lastButtonBottomPx = (window.innerHeight * (buttonsConfig[0].topOffset / 100)) + (buttonHeight / 2);

    buttonsConfig.forEach((config, index) => {
        const floatingTab = document.createElement('div');
        floatingTab.className = 'floating-button-tab';
        floatingTab.innerHTML = `<span>${config.label}</span>`;

        if (index === 0) {
            floatingTab.style.top = `${config.topOffset}%`;
            floatingTab.classList.add('first-button'); // Añadir clase para estilos específicos del primer botón
        } else {
            // Para los botones subsiguientes, colocarlos debajo del anterior con un gap
            floatingTab.style.top = `${lastButtonBottomPx + verticalGap}px`;
            // No se añade transform:none explícitamente porque no tienen el transform inicial del primer botón.
            // Su hover ya es handled por ':not(.first-button):hover'

            // Actualizar lastButtonBottomPx para el siguiente botón
            lastButtonBottomPx = (lastButtonBottomPx + verticalGap) + buttonHeight;
        }

        // Configurar la acción al hacer clic
        floatingTab.onclick = () => {
            if (config.openInNewTab) {
                window.open(config.url, '_blank');
            } else {
                // Pasar el ancho y la posición al cargar el iframe
                loadAndShowIframe(config.url, config.label, config.iframeWidth, config.iframePosition);
            }
        };

        document.body.appendChild(floatingTab);
    });

})();
