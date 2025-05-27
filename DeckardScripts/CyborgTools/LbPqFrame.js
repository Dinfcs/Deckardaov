// ==UserScript==
// @name         LB&PQ FRAME
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Botón lateral delgado que abre app en iframe con control simple
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

        #iframeOverlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: none;
            z-index: 10000;
        }

        .iframe-container {
            position: relative;
            width: 95%;
            height: 100%;
            margin: 0 auto;
        }

        #appFrame {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
            box-shadow: 0 0 15px rgba(0,0,0,0.3);
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

    // Overlay del iframe
    const iframeOverlay = document.createElement('div');
    iframeOverlay.id = 'iframeOverlay';

    // Contenedor del iframe
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'iframe-container';

    // Crear el iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'appFrame';
    iframe.src = 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA91SpQ2ZDf7rJFVESnBCVk9/exec';

    // Botón de cerrar (X)
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Cerrar';

    // Agregar elementos
    iframeContainer.appendChild(closeBtn);
    iframeContainer.appendChild(iframe);
    iframeOverlay.appendChild(iframeContainer);
    document.body.appendChild(iframeOverlay);

    // Mostrar el iframe al hacer clic en la pestaña
    floatingTab.onclick = function() {
        iframeOverlay.style.display = 'block';
    };

    // Cerrar el iframe
    closeBtn.onclick = function(e) {
        e.stopPropagation();
        iframeOverlay.style.display = 'none';
    };

    // Cerrar al hacer clic fuera del iframe
    iframeOverlay.onclick = function(e) {
        if (e.target === iframeOverlay) {
            iframeOverlay.style.display = 'none';
        }
    };
})();
