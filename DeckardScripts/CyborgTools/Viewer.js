// ==UserScript==
// @name         Viewer completo
// @version      4
// @description  Image carousel with keyboard navigation and adaptive thumbnail layout using Viewer.js and an additional button to open the carousel.
// @author       ChatGPT
// @match        https://cyborg.deckard.com/listing/*
// ==/UserScript==

(function() {
    'use strict';

    // Función para agregar recursos (CSS o JS)
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

    // Cargar recursos necesarios
    addResource('link', 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/viewer.min.css');
    addResource('script', 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/viewer.min.js');

    // Función para agregar estilos CSS
    const addStyle = (css) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    // Estilos CSS
    addStyle(`
        #btn_show_all_images, #btn_additional {
            height: 25px !important;
            width: 25px !important;
            margin: 5px;
            cursor: pointer;
        }
        #thumbsContainer {
            position: fixed;
            right: 0;
            top: 0;
            z-index: 9999;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: grid;
            gap: 15px;
            padding: 10px;
            border-left: 2px solid #fff;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
            overflow-y: auto;
            width: 250px;
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
            background: rgba(0, 0, 0, 0.8);
        }
        .current-thumbnail {
            border: 2px solid yellow;
        }
        #floatingNotification {
            position: fixed;
            left: 20px;
            top: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 18px;
            z-index: 99999;
            max-width: 350px;
            transition: opacity 0.2s ease-in-out;
        }
        #floatingNotification p {
            margin: 5px 0;
        }
    `);

    let viewer;
    let currentThumbnail;

    // Función para extraer imágenes
    function extractImages(retryCount = 0) {
        console.log('Extracting images...');

        const storedImageLinks = sessionStorage.getItem('imageLinks');
        let imageLinks = storedImageLinks ? JSON.parse(storedImageLinks) : [];

        if (imageLinks.length === 0) {
            imageLinks = Array.from(document.querySelectorAll("a[href^='https://deckard-imddb-us-west']"))
                .map(anchor => anchor.href);

            if (imageLinks.length > 0) {
                sessionStorage.setItem('imageLinks', JSON.stringify(imageLinks));
            }
        }

        if (imageLinks.length === 0 && retryCount < 5) {
            console.log(`Retrying... Attempt ${retryCount + 1}`);
            setTimeout(() => extractImages(retryCount + 1), 1000);
            return;
        }

        if (imageLinks.length === 0) {
            alert("¡No se encontraron imágenes!");
            return;
        }

     // Crear el contenedor de miniaturas
        const thumbsContainer = document.createElement('div');
        thumbsContainer.id = "thumbsContainer";

        // Ajustar el ancho del contenedor según la cantidad de imágenes
        if (imageLinks.length <= 15) {
            thumbsContainer.style.width = "180px"; // Ancho para una columna
        } else {
            thumbsContainer.style.width = "280px"; // Ancho para dos columnas
        }

        // Configurar el número de columnas
        thumbsContainer.style.gridTemplateColumns = imageLinks.length <= 15 ? "1fr" : "repeat(2, 1fr)";

        document.body.appendChild(thumbsContainer);


        const notification = document.createElement('div');
        notification.id = "floatingNotification";
        notification.innerHTML = `
            <p>🔹 Press <b>Escape</b> or click outside to close.</p>
            <p>🔹 Ctrl + Click on a thumbnail to open in a new tab.</p>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 5000);

        imageLinks.forEach((thumbUrl, index) => {
            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = "Thumbnail";
            img.style.cursor = "pointer";
            img.style.width = imageLinks.length > 15 ? "120px" : "130px";
            img.style.height = "auto";
            img.style.borderRadius = "5px";
            img.style.transition = "transform 0.2s ease-in-out";

            img.addEventListener('click', (event) => {
                if (event.ctrlKey || event.metaKey) {
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

        const imageContainer = document.createElement('div');
        imageContainer.id = "imageViewerContainer";
        imageContainer.style.display = "none";

        imageLinks.forEach(imgUrl => {
            const img = document.createElement('img');
            img.src = imgUrl;
            imageContainer.appendChild(img);
        });

        document.body.appendChild(imageContainer);

        // Obtener el último índice visto desde sessionStorage
        const lastViewedIndex = parseInt(sessionStorage.getItem('lastViewedIndex')) || 0;

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

                // Guardar el índice de la imagen actual en sessionStorage
                sessionStorage.setItem('lastViewedIndex', viewer.index);
            },
            hidden() {
                thumbsContainer.remove();
                imageContainer.remove();
                closeFloatingWindows();
            }
        });

        // Mostrar la última imagen vista
        viewer.show();
        viewer.view(lastViewedIndex);

        document.addEventListener('keydown', handleKeyNavigation);
    }

    // Función para manejar la navegación por teclado
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

    // Función para configurar el evento de clic en el botón adicional
    function setupClickEvent() {
        const additionalButton = document.getElementById("btn_additional");

        if (additionalButton) {
            additionalButton.addEventListener("click", () => {
                extractImages();
            });
        } else {
            setTimeout(setupClickEvent, 800);
        }
    }

    // Función para cerrar ventanas flotantes y eliminar la notificación
    function closeFloatingWindows() {
        // Cerrar el modal si está abierto
        const closeButton = document.querySelector("button.btn-close[aria-label='Close']");
        closeButton?.click();

        // Eliminar la notificación flotante si existe
        const notification = document.getElementById('floatingNotification');
        if (notification) {
            notification.remove();
        }

        // Eliminar el listener de teclado
        document.removeEventListener('keydown', handleKeyNavigation);
    }

    // Función para cerrar con la tecla Escape
    function closeOnEscape(e) {
        if (e.key === 'Escape') {
            // Eliminar el contenedor de miniaturas y el visor de imágenes
            document.getElementById('thumbsContainer')?.remove();
            document.getElementById('imageViewerContainer')?.remove();

            // Cerrar ventanas flotantes y eliminar la notificación
            closeFloatingWindows();
        }
    }

    // Función para crear el botón adicional
    function createAdditionalButton() {
        const existingButton = document.getElementById('btn_additional');
        if (existingButton) {
            existingButton.remove();
        }

        const originalButton = document.getElementById('btn_show_all_images');
        if (originalButton) {
            const button = document.createElement('img');
            button.id = 'btn_additional';
            button.src = 'https://dinfcs.github.io/Deckardaov/DeckardScripts/DatabasePR/carousel.png';
            button.style.display = 'inline';
            button.style.height = '20px';
            button.style.cursor = 'pointer';
            originalButton.parentNode.insertBefore(button, originalButton.nextSibling);
        }
    }

    // Función para recargar el script cuando se hace clic en el tab de "Images"
    function reloadScriptOnTabClick() {
        const imagesTab = document.querySelector(".tab span");

        if (imagesTab && imagesTab.textContent.trim() === "Images") {
            imagesTab.parentElement.addEventListener("click", () => {
                if (!document.getElementById("btn_additional")) {
                    initialize(false); // No precargar imágenes al recargar
                }
            });
        } else {
            setTimeout(reloadScriptOnTabClick, 500);
        }
    }

    // Función para precargar imágenes
    function preloadImages(attempt = 0) {
        if (attempt >= 3) {
            initialize(false); // No precargar imágenes si falla
            return;
        }

        const storedImageLinks = sessionStorage.getItem('imageLinks');
        if (storedImageLinks) {
            return;
        }

        const originalButton = document.getElementById("btn_show_all_images");
        if (!originalButton) {
            setTimeout(() => preloadImages(attempt + 1), 800);
            return;
        }

        closeFloatingWindows();
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());

        let modalStyle = document.getElementById("hiddenModalStyle");
        if (!modalStyle) {
            modalStyle = document.createElement('style');
            modalStyle.id = "hiddenModalStyle";
            modalStyle.textContent = `
                .modal, .modal-backdrop {
                    visibility: hidden !important;
                    opacity: 0 !important;
                    display: none !important;
                }
            `;
            document.head.appendChild(modalStyle);
        }

        originalButton.click();

        setTimeout(() => {
            const modalVisible = document.querySelector(".modal.show");

            if (!modalVisible) {
                preloadImages(attempt + 1);
                return;
            }

            const imageLinks = Array.from(document.querySelectorAll("a[href^='https://deckard-imddb-us-west']"))
                .map(anchor => anchor.href);

            if (imageLinks.length > 0) {
                sessionStorage.setItem('imageLinks', JSON.stringify(imageLinks));

                imageLinks.forEach(imgUrl => {
                    const img = new Image();
                    img.src = imgUrl;
                });

                setTimeout(closeFloatingWindows, 700);

                setTimeout(() => {
                    const hiddenStyle = document.getElementById("hiddenModalStyle");
                    if (hiddenStyle) hiddenStyle.remove();

                    document.querySelectorAll(".modal, .modal-backdrop").forEach(el => {
                        el.style.visibility = "visible";
                        el.style.opacity = "1";
                        el.style.display = "";
                    });
                }, 1000);
            }
        }, 1000);
    }

    // Función principal de inicialización
function initialize(shouldPreload = true) {
    const originalButtonContainer = document.getElementById('listing_detail_page_image_gallery');
    if (originalButtonContainer) {
        createAdditionalButton();
        setupClickEvent();
        if (shouldPreload) {
            preloadImages();
        }
    } else {
        // Usar MutationObserver para detectar cuándo el contenedor está disponible
        const observer = new MutationObserver((mutations, obs) => {
            const container = document.getElementById('listing_detail_page_image_gallery');
            if (container) {
                obs.disconnect(); // Dejar de observar
                createAdditionalButton();
                setupClickEvent();
                if (shouldPreload) {
                    preloadImages();
                }
            }
        });

        // Observar cambios en el DOM
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

    // Inicializar el script
    initialize();
    reloadScriptOnTabClick();
    window.addEventListener('keydown', closeOnEscape);
})();
