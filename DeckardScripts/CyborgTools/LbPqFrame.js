// ==UserScript==
// @name         LbPqFrame
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  Botón lateral que carga el iframe solo al hacer clic
// @author       Luis
// @match        https://cyborg.deckard.com/listing*
// ==/UserScript==

(function() {
    'use strict';

    // Crear elemento style para los estilos
    const style = document.createElement('style');
    style.textContent = `
        #floatingTab {
            position: fixed;
            top: 10%;
            right: 0;
            transform: translateY(-50%);
            width: 20px;
            height: 70px;
            background: #093140;
            color: white;
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: -1px 0 3px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s ease;
        }

        #floatingTab:hover {
            transform: translateY(-50%) translateX(-3px);
        }

        #floatingTab span {
            writing-mode: vertical-rl;
            text-orientation: mixed;
            font-size: 10px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        #iframeContainer {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            z-index: 10000;
            background: transparent;
        }

        .iframe-wrapper {
            position: relative;
            width: 95%;
            height: 100%;
            margin: 0% auto;
        }

        #appFrame {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            border-radius: 4px;
        }

        .close-btn {
            position: absolute;
            top: 10px;
            left: 10px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #ff4444;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            z-index: 10001;
        }

        .close-btn:hover {
            background: #cc0000;
        }
    `;
    document.head.appendChild(style);

    // Crear la pestaña lateral delgada
    const floatingTab = document.createElement('div');
    floatingTab.id = 'floatingTab';
    floatingTab.innerHTML = '<span>LB & PQ</span>';
    document.body.appendChild(floatingTab);

    // Contenedor principal del iframe (vacío inicialmente)
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'iframeContainer';
    document.body.appendChild(iframeContainer);

    // Variable para controlar si ya se cargó el iframe
    let iframeLoaded = false;

    // Mostrar y cargar el iframe al hacer clic en la pestaña
    floatingTab.onclick = function() {
        if (!iframeLoaded) {
            // Crear elementos solo cuando se hace clic por primera vez
            const iframeWrapper = document.createElement('div');
            iframeWrapper.className = 'iframe-wrapper';

            const iframe = document.createElement('iframe');
            iframe.id = 'appFrame';
            iframe.src = 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA91SpQ2ZDf7rJFVESnBCVk9/exec';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.title = 'Cerrar';

            // Configurar eventos
            closeBtn.onclick = function(e) {
                e.stopPropagation();
                iframeContainer.style.display = 'none';
            };

            iframeContainer.onclick = function(e) {
                if (e.target === iframeContainer) {
                    iframeContainer.style.display = 'none';
                }
            };

            // Agregar elementos
            iframeWrapper.appendChild(closeBtn);
            iframeWrapper.appendChild(iframe);
            iframeContainer.appendChild(iframeWrapper);

            iframeLoaded = true;
        }

        // Mostrar el contenedor
        iframeContainer.style.display = 'block';
    };
})();
