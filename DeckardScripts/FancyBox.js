// ==UserScript==
// @name         FancyboxListing
// @namespace    http://tampermonkey.net/
// @version      2.8
// @description  Extract and display images in a carousel using Fancybox with enhanced zoom functionality, transparent modal background, thumbnail navigation, and a floating camera icon. Automatically executes Fancybox 2 seconds after clicking on the camera icon and closes any open modals when Fancybox is closed.
// @author       ChatGPT
// @match        https://cyborg.deckard.com/listing/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Incluir librerías Fancybox y jQuery
    const addScript = (src) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.async = false;
        document.head.appendChild(script);
    };

    const addStyle = (href) => {
        const link = document.createElement('link');
        link.href = href;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        document.head.appendChild(link);
    };

    addStyle('https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.css');
    addStyle('https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.thumbs.min.css');
    addScript('https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js');
    addScript('https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.min.js');
    addScript('https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.7/jquery.fancybox.thumbs.min.js');

    // Agregar estilos para la camarita flotante
    GM_addStyle(`
        #floatingCamera {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 24px;
            cursor: pointer;
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        #floatingCamera img {
            width: 70%;
            height: 70%;
        }
    `);

    // Crear camarita flotante
    let floatingCamera = document.createElement('button');
    floatingCamera.id = "floatingCamera";
    floatingCamera.innerHTML = '<img src="/assets/image/up-right-from-square-solid.svg" alt="Camera">';
    document.body.appendChild(floatingCamera);

    // Función para ejecutar el mismo comportamiento que el botón original
    function triggerOriginalButton() {
        const originalButton = document.getElementById("btn_show_all_images");
        if (originalButton) {
            originalButton.click();
        }
    }

    // Función para extraer imágenes y abrir Fancybox
    function extractImages() {
        console.log('Extracting images...');
        let imageLinks = [];
        document.querySelectorAll("a[href^='https://deckard-imddb-us-west']").forEach(anchor => {
            let imgUrl = anchor.href;
            imageLinks.push({
                src: imgUrl,
                opts: {
                    caption: "Image",
                    thumb: imgUrl
                }
            });
        });

        if (imageLinks.length > 0) {
            $.fancybox.open(imageLinks, {
                loop: true,
                buttons: [
                    "zoom",
                    "close",
                    "thumbs" // Agregar botón de miniaturas
                ],
                wheel: "zoom", // Habilitar el zoom con el scroll
                // Aumentar el nivel máximo de zoom
                zoom: {
                    maxRatio: 10
                },
                thumbs: {
                    autoStart: true // Mostrar miniaturas automáticamente
                },
                afterClose: function() {
                    // Cerrar cualquier ventana emergente específica
                    const closeButton = document.querySelector("button.btn-close[aria-label='Close']");
                    if (closeButton) {
                        closeButton.click();
                    }
                }
            });
        } else {
            alert("No images found!");
        }
    }

    // Evento para esperar 2 segundos y abrir Fancybox al hacer clic en la camarita flotante
    floatingCamera.addEventListener("click", () => {
        console.log('Camera clicked, waiting 2 seconds...');
        triggerOriginalButton();
        setTimeout(() => {
            extractImages();
        }, 2000); // Esperar 2 segundos
    });

})();
