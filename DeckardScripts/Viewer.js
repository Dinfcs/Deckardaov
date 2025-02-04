// ==UserScript==
// @name         Viewerjs Image Carousel for Listings
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Image carousel with keyboard navigation and adaptive thumbnail layout using Viewer.js.
// @author       ChatGPT
// @match        https://cyborg.deckard.com/listing/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

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

    addResource('style', 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/viewer.min.css');
    addResource('script', 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/viewer.min.js');

    GM_addStyle(`
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
            background: rgba(0, 0, 0, 0.5);
            display: grid;
            gap: 15px; /* Más espacio entre miniaturas */
            padding: 10px;
            border-left: 2px solid #fff;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
            overflow-y: auto;
            width: 350px; /* Aumentar el ancho del frame */
        }
        #thumbsContainer img {
            width: 100%;
            height: auto;
            cursor: pointer;
            transition: transform 0.3s ease, opacity 0.3s ease;
        }
        #thumbsContainer img:hover {
            opacity: 0.7;
            transform: scale(1.1);
        }
        .viewer-canvas {
            background: rgba(0, 0, 0, 0.8); /* Fondo más oscuro detrás de las imágenes */
        }
        .current-thumbnail {
            border: 2px solid yellow; /* Resaltar la miniatura actual */
        }
    `);

    let viewer;
    let currentThumbnail;

    function extractImages(retryCount = 0) {
        console.log('Extracting images...');
        const storedImageLinks = sessionStorage.getItem('imageLinks');
        let imageLinks = storedImageLinks ? JSON.parse(storedImageLinks) : [];

        if (imageLinks.length === 0) {
            imageLinks = Array.from(document.querySelectorAll("a[href^='https://deckard-imddb-us-west']")).map(anchor => anchor.href);
            if (imageLinks.length > 0) {
                sessionStorage.setItem('imageLinks', JSON.stringify(imageLinks));
            }
        }

        if (imageLinks.length === 0 && retryCount < 5) { // Retry up to 5 times
            console.log(`Retrying... Attempt ${retryCount + 1}`);
            setTimeout(() => extractImages(retryCount + 1), 1000); // Wait 1 second before retrying
            return;
        }

        if (imageLinks.length === 0) {
            alert("¡No se encontraron imágenes!");
            return;
        }

        const thumbsContainer = document.createElement('div');
        thumbsContainer.id = "thumbsContainer";
        thumbsContainer.style.gridTemplateColumns = imageLinks.length < 13 ? "1fr" : "repeat(2, 1fr)"; // Dos columnas si hay 6 o más

        imageLinks.forEach((thumbUrl, index) => {
            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = "Thumbnail";
            img.addEventListener('click', () => viewer.view(index));
            thumbsContainer.appendChild(img);

            if (index === 0) {
                currentThumbnail = img;
                img.classList.add('current-thumbnail');
            }
        });

        document.body.appendChild(thumbsContainer);

        const imageContainer = document.createElement('div');
        imageContainer.id = "imageViewerContainer";
        imageContainer.style.display = "none";

        imageLinks.forEach(imgUrl => {
            const img = document.createElement('img');
            img.src = imgUrl;
            imageContainer.appendChild(img);
        });

        document.body.appendChild(imageContainer);

        viewer = new Viewer(imageContainer, {
            inline: false,
            button: true,
            navbar: false,
            title: false,
            toolbar: {
                zoomIn: 1,
                zoomOut: 1,
                reset: 1,
                prev: 1,
                next: 1,
            },
            transition: false,
            viewed() {
                if (currentThumbnail) {
                    currentThumbnail.classList.remove('current-thumbnail');
                }
                currentThumbnail = thumbsContainer.querySelectorAll('img')[viewer.index];
                if (currentThumbnail) {
                    currentThumbnail.classList.add('current-thumbnail');
                    currentThumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
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

    function handleKeyNavigation(e) {
        if (!viewer) return;

        switch (e.key.toLowerCase()) {
            case 'd':
                viewer.next();
                break;
            case 'a':
                viewer.prev();
                break;
            case 'w':
                viewer.zoom(0.1);
                break;
            case 's':
                viewer.zoom(-0.1);
                break;
            case 'r':
                viewer.reset();
                break;
        }
    }

    function setupClickEvent() {
        const iconElement = document.getElementById("btn_show_all_images");
        if (iconElement) {
            console.log('Icon found, adding click event...');
            iconElement.addEventListener("click", () => extractImages());
        } else {
            console.log('Icon not found, retrying...');
            setTimeout(setupClickEvent, 800);
        }
    }

    function closeFloatingWindows() {
        const closeButton = document.querySelector("button.btn-close[aria-label='Close']");
        closeButton?.click();
        document.removeEventListener('keydown', handleKeyNavigation);
    }

    function closeOnEscape(e) {
        if (e.key === 'Escape') {
            document.getElementById('thumbsContainer')?.remove();
            document.getElementById('imageViewerContainer')?.remove();
            closeFloatingWindows();
        }
    }

    setupClickEvent();
    window.addEventListener('keydown', closeOnEscape);

})();
