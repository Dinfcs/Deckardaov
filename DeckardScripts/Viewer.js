// ==UserScript==
// @name         Fancybox Image Carousel for Listings
// @namespace    http://tampermonkey.net/
// @version      2.9
// @description  Extract and display images in a carousel using Fancybox with enhanced zoom functionality, transparent modal background, and thumbnail navigation. Automatically executes Fancybox 2 seconds after clicking on a specific image/icon, and closes any open modals when Fancybox is closed. Added keyboard navigation with 'a', 'd', 'w', and 's' keys.
// @author       ChatGPT
// @match        https://cyborg.deckard.com/listing/*
// ==/UserScript==

(function() {
    'use strict';

    // Función para agregar un script o estilo al documento
    const addResource = (type, src) => {
        const element = type === 'script' ? document.createElement('script') : document.createElement('link');
        if (type === 'script') {
            element.src = src;
            element.type = 'text/javascript';
            element.async = false;
        } else {
            element.href = src;
            element.rel = 'stylesheet';
            element.type = 'text/css';
        }
        document.head.appendChild(element);
    };

    // Función para agregar estilos al documento
    const addStyle = (css) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    // Agregar estilos y scripts de Viewer.js
    addResource('style', 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/viewer.min.css');
    addResource('script', 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/viewer.min.js');

    // Ajustar el tamaño del ícono de la imagen con id="btn_show_all_images"
    addStyle(`
        #btn_show_all_images {
            height: 25px !important;
            width: 25px !important;
        }
        #thumbsContainer {
            position: fixed;
            right: 0;
            top: 0;
            z-index: 9999;
            height: 100%;
            width: 150px;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 20px;
            border-left: 2px solid #fff;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
            overflow-y: auto;
        }
        #thumbsContainer img {
            width: 100px;
            height: auto;
            margin-bottom: 10px;
            cursor: pointer;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        #thumbsContainer img:hover {
            opacity: 0.7;
            transform: scale(1.1);
        }
        #escapeNotice {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: rgba(0, 0, 0, 0.8);
            color: #fff;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 16px;
            display: none;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        }
    `);

    let viewer;

    // Función para extraer imágenes y abrir Viewer.js
    function extractImages() {
        console.log('Extracting images...');
        const imageLinks = Array.from(document.querySelectorAll("a[href^='https://deckard-imddb-us-west']")).map(anchor => anchor.href);

        if (imageLinks.length === 0) {
            alert("No images found!");
            return;
        }

        // Crear contenedor de miniaturas
        const thumbsContainer = document.createElement('div');
        thumbsContainer.id = "thumbsContainer";

        imageLinks.forEach((thumbUrl, index) => {
            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = "Thumbnail";
            img.addEventListener('click', () => viewer.view(index));
            thumbsContainer.appendChild(img);
        });

        document.body.appendChild(thumbsContainer);

        // Crear contenedor de notificación de escape
        const escapeNotice = document.createElement('div');
        escapeNotice.id = "escapeNotice";
        escapeNotice.innerText = "Press the Escape key to close";
        document.body.appendChild(escapeNotice);

        // Mostrar la notificación de escape con animación
        setTimeout(() => {
            escapeNotice.style.display = 'block';
            setTimeout(() => escapeNotice.style.opacity = 1, 100);
        }, 200);

        // Cerrar la notificación después de 3 segundos
        setTimeout(() => {
            escapeNotice.style.opacity = 0;
            setTimeout(() => escapeNotice.style.display = 'none', 500);
        }, 3000);

        // Crear contenedor de imágenes para Viewer.js
        const imageContainer = document.createElement('div');
        imageContainer.id = "imageViewerContainer";
        imageContainer.style.display = "none";

        imageLinks.forEach(imgUrl => {
            const img = document.createElement('img');
            img.src = imgUrl;
            imageContainer.appendChild(img);
        });

        document.body.appendChild(imageContainer);

        // Inicializamos Viewer.js
        viewer = new Viewer(imageContainer, {
            inline: false,
            button: true,
            navbar: false,
            title: false,
            toolbar: {
                zoomIn: 1,
                zoomOut: 1,
                oneToOne: 1,
                reset: 1,
                prev: 1,
                next: 1,
                rotateLeft: 1,
                rotateRight: 1,
                flipHorizontal: 1,
                flipVertical: 1,
            },
            viewed() {
                viewer.zoomTo(1);
            },
            hidden() {
                thumbsContainer.remove();
                imageContainer.remove();
                closeFloatingWindows();
            }
        });

        viewer.show();
        document.addEventListener('keydown', handleKeyNavigation);
    }

    // Función para manejar la navegación con el teclado
    function handleKeyNavigation(e) {
        if (!viewer) return;
        switch (e.key.toLowerCase()) {
            case 'd': viewer.next(); break;
            case 'a': viewer.prev(); break;
            case 'w': viewer.zoom(0.1); break;
            case 's': viewer.zoom(-0.1); break;
            case 'r': viewer.reset(); break;
        }
    }

    // Función para verificar la existencia del ícono y añadir el evento de clic
    function setupClickEvent() {
        const iconElement = document.getElementById("btn_show_all_images");
        if (iconElement) {
            console.log('Icon found, adding click event...');
            iconElement.addEventListener("click", () => setTimeout(extractImages, 500));
        } else {
            console.log('Icon not found, retrying...');
            setTimeout(setupClickEvent, 500);
        }
    }

    // Función para cerrar las ventanas flotantes
    function closeFloatingWindows() {
        const closeButton = document.querySelector("button.btn-close[aria-label='Close']");
        closeButton?.click();
    }

    // Función para cerrar todo cuando se presiona la tecla Escape
    function closeOnEscape(e) {
        if (e.key === 'Escape') {
            document.getElementById('thumbsContainer')?.remove();
            document.getElementById('imageViewerContainer')?.remove();
            document.getElementById('escapeNotice')?.remove();
            closeFloatingWindows();
        }
    }

    // Iniciar la configuración del evento de clic
    setupClickEvent();

    // Escuchar la tecla Escape para cerrar la interfaz
    window.addEventListener('keydown', closeOnEscape);

})();
