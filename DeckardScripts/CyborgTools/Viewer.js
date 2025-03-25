// ==UserScript==
// @name         Viewer4
// @version      7
// @description  Carrusel con miniaturas en Cyborg usando Viewer.js y caché temporal
// @match        https://cyborg.deckard.com/listing/*
// ==/UserScript==

(function() {
    'use strict';

    let viewer;
    let viewerOpened = false;
    let currentThumbnail;
    const pageUrl = window.location.href; // Guarda la URL actual para asociar el caché

    const addResource = (type, src) => {
        const element = document.createElement(type === 'script' ? 'script' : 'link');
        if (type === 'script') {
            element.src = src;
            element.type = 'text/javascript';
        } else {
            element.href = src;
            element.rel = 'stylesheet';
        }
        document.head.appendChild(element);
    };

    addResource('link', 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/viewer.min.css');
    addResource('script', 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/viewer.min.js');

    const addStyle = (css) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    addStyle(`
        #btn_show_all_images {
            height: 24px !important;
            width: 24px !important;
            cursor: pointer;
        }
        .viewer-close {
    right: auto !important;
    left: 10px !important;
}


 #thumbsContainer {
        position: fixed;
        right: 0;
        top: 0;
        z-index: 9999;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: grid;
        gap: 10px;
        padding: 10px;
        border-left: 2px solid white;
        box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
        overflow-y: auto;
        width: 300px; /* Aumenta el ancho del contenedor */
    }
    #thumbsContainer img {
        width: 100%; /* Mantiene la miniatura responsiva */
        height: auto;
        max-width: 200px; /* Aumenta el tamaño máximo */
        max-height: 200px; /* Ajusta la altura máxima */
        cursor: pointer;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    #thumbsContainer img:hover {
        opacity: 0.7;
        transform: scale(1.1);
    }
    .current-thumbnail {
        border: 2px solid yellow;
    }
        .viewer-backdrop {
            background-color: rgba(0, 0, 0, 0.95) !important; /* Fondo más oscuro */
        }
    `);

    function getCachedImages() {
        const cachedData = sessionStorage.getItem(pageUrl);
        return cachedData ? JSON.parse(cachedData) : null;
    }

    function cacheImages(imageLinks) {
        sessionStorage.setItem(pageUrl, JSON.stringify(imageLinks));
        console.log(`Imágenes almacenadas en caché (${imageLinks.length}):`, imageLinks);
    }

    function extractImages() {
        console.log('Extrayendo imágenes del modal...');

        const imageLinks = Array.from(document.querySelectorAll("a[href^='https://deckard-imddb-us-west']")).map(anchor => anchor.href);
        if (imageLinks.length === 0) {
            console.warn('No se encontraron imágenes.');
            return;
        }

        cacheImages(imageLinks);

        // 🔽 Cierra el modal automáticamente después de guardar las imágenes
        const closeButton = document.querySelector(".btn-close[aria-label='Close']");
        if (closeButton) {
            closeButton.click();
            console.log("Modal cerrado automáticamente.");
        } else {
            console.warn("No se encontró el botón para cerrar el modal.");
        }

        showCarousel(imageLinks);
    }

function showCarousel(imageLinks) {
    if (viewerOpened) return;

    console.log('Mostrando carrusel...');
    viewerOpened = true;

    const thumbsContainer = document.createElement('div');
    thumbsContainer.id = "thumbsContainer";
    thumbsContainer.style.gridTemplateColumns = imageLinks.length < 10 ? "1fr" : "repeat(2, 1fr)";

    imageLinks.forEach((thumbUrl, index) => {
        const img = document.createElement('img');
        img.src = thumbUrl;
        img.alt = "Miniatura";

        img.addEventListener('click', (event) => {
            if (event.ctrlKey) {
                window.open(thumbUrl, '_blank');
            } else {
                viewer.view(index);
            }
        });

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
            // Guardar la última miniatura vista en caché
            sessionStorage.setItem("lastViewedIndex", viewer.index);
            console.log("Última miniatura guardada en caché:", viewer.index);

            // Simular clic en el botón de cierre del modal original
            const modalCloseBtn = document.querySelector(".btn-close[aria-label='Close']");
            if (modalCloseBtn) {
                modalCloseBtn.click();
                console.log("Botón de cierre del modal original clickeado.");
            } else {
                console.warn("No se encontró el botón de cierre del modal.");
            }

            // Eliminar el carrusel y restablecer el estado
            document.getElementById("thumbsContainer")?.remove();
            document.getElementById("imageViewerContainer")?.remove();
            viewerOpened = false;
            document.removeEventListener('keydown', handleKeyNavigation);
        }
    });

    viewer.show();

    // Restaurar la última miniatura vista si existe en la caché
    const lastIndex = sessionStorage.getItem("lastViewedIndex");
    if (lastIndex !== null) {
        const index = parseInt(lastIndex, 10);
        if (index >= 0 && index < imageLinks.length) {
            console.log("Restaurando miniatura:", index);
            viewer.view(index);
        }
    }

    document.addEventListener('keydown', handleKeyNavigation);
}


    function handleKeyNavigation(e) {
        if (!viewerOpened) return;

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
        }
    }

    function openModalAndExtractImages() {
        console.log("Abriendo modal de imágenes...");

        const cachedImages = getCachedImages();
        if (cachedImages) {
            console.log("Cargando imágenes desde caché...");
            showCarousel(cachedImages);
            return;
        }

        const originalButton = document.getElementById("btn_show_all_images");
        if (originalButton) {
            originalButton.click();

            setTimeout(() => {
                extractImages();
            }, 1000);
        } else {
            console.warn("No se encontró el botón para abrir el modal.");
        }
    }

    function setupButton() {
        const interval = setInterval(() => {
            const btn = document.getElementById("btn_show_all_images");
            if (btn) {
                btn.style.height = "24px";
                btn.style.width = "24px";
                btn.addEventListener("click", openModalAndExtractImages);
                clearInterval(interval);
                console.log("Botón encontrado y configurado.");
            }
        }, 500);
    }

    function init() {
        setupButton();
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === 'q' && !viewerOpened) {
                e.preventDefault(); // Prevenir la acción predeterminada del navegador (si aplica)
                openModalAndExtractImages();
            }
        });
    }

    init();
})();
