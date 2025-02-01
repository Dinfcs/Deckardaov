// ==UserScript==
// @name         Fancybox Image Carousel for Listings
// @namespace    http://tampermonkey.net/
// @version      2.7
// @description  Extract and display images in a carousel using Fancybox with enhanced zoom functionality, transparent modal background, and thumbnail navigation. Automatically executes Fancybox 2 seconds after clicking on a specific image/icon, and closes any open modals when Fancybox is closed.
// @author       Lucho
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

    // Ajustar el tamaño de la imagen con id="btn_show_all_images"
    GM_addStyle(`
        #btn_show_all_images {
            height: 25px !important;
            width: 25px !important;
        }
    `);

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

    // Función para verificar la existencia del elemento e iniciar el evento de clic
    function setupClickEvent() {
        const iconElement = document.getElementById("btn_show_all_images");
        if (iconElement) {
            console.log('Icon found, adding click event...');
            iconElement.addEventListener("click", () => {
                console.log('Icon clicked, waiting 2 seconds...');
                setTimeout(() => {
                    extractImages();
                }, 500); // Esperar 2 segundos
            });
        } else {
            console.log('Icon not found, retrying...');
            // Si el elemento no está disponible, esperar y volver a intentar
            setTimeout(setupClickEvent, 500);
        }
    }

    // Iniciar la configuración del evento de clic
    setupClickEvent();

})();
