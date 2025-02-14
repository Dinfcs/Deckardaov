// ==UserScript==
// @name         Viewer completo
// @version      4
// @description  Image carousel with keyboard navigation and adaptive thumbnail layout using Viewer.js and an additional button to open the carousel.
// @author       ChatGPT
// @match        https://cyborg.deckard.com/listing/*
// ==/UserScript==

(function() {
    'use strict';

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

        if (imageLinks.length === 0 && retryCount < 5) {
            console.log(`Retrying... Attempt ${retryCount + 1}`);
            setTimeout(() => extractImages(retryCount + 1), 1000);
            return;
        }

        if (imageLinks.length === 0) {
            alert("¡No se encontraron imágenes!");
            return;
        }

        const thumbsContainer = document.createElement('div');
        thumbsContainer.id = "thumbsContainer";
        thumbsContainer.style.gridTemplateColumns = imageLinks.length < 13 ? "1fr" : "repeat(2, 1fr)";

                    // Crear el contenedor de la notificación
            const notification = document.createElement('div');
            notification.id = "floatingNotification";
            notification.innerHTML = `
                <p>🔹 Press <b>Escape</b> or click outside to close.</p>
                <p>🔹 Ctrl + Click on a thumbnail to open in a new tab.</p>
            `;
            document.body.appendChild(notification);

            // Desaparecer el cuadro de instrucciones después de 7 segundos
            setTimeout(() => {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 500); // Elimina el elemento después de la animación
            }, 5000);

            // Agregar estilos para la notificación flotante
            addStyle(`
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
        // fin contenedor de la notificación


        imageLinks.forEach((thumbUrl, index) => {
            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = "Thumbnail";

            img.addEventListener('click', (event) => {
                if (event.ctrlKey || event.metaKey) {
                    // Si Ctrl (Windows/Linux) o Cmd (Mac) está presionado, abrir en una nueva pestaña
                    window.open(thumbUrl, '_blank');
                } else {
                    // Si no, abrir en el visor normalmente
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
    const additionalButton = document.getElementById("btn_additional");

    if (additionalButton) {
        console.log('Additional button found, adding click event...');
        additionalButton.addEventListener("click", () => {
            console.log("Abriendo carrusel con imágenes en caché...");
            extractImages(); // Ahora solo usa las imágenes almacenadas en sessionStorage
        });
    } else {
        console.log('Additional button not found, retrying...');
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

function createAdditionalButton() {
    // 🔴 Eliminar cualquier botón adicional existente antes de crear uno nuevo
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


    function reloadScriptOnTabClick() {
    const imagesTab = document.querySelector(".tab span");

    if (imagesTab && imagesTab.textContent.trim() === "Images") {
        imagesTab.parentElement.addEventListener("click", () => {
            console.log("Tab 'Images' clickeado, verificando si es necesario recargar...");

            // Verificar si el botón adicional ya existe
            if (document.getElementById("btn_additional")) {
                console.log("El botón 'btn_additional' ya existe, no se recarga el script.");
            } else {
                console.log("El botón 'btn_additional' no existe, recargando el script...");
                initialize2(); // Solo recargar si el botón no está presente
            }
        });
    } else {
        console.log("Tab 'Images' no encontrado, reintentando...");
        setTimeout(reloadScriptOnTabClick, 500); // Reintentar si el tab aún no está cargado
    }
}

// Llamar a la función al cargar el script
reloadScriptOnTabClick();

function preloadImages(attempt = 0) {
    console.log(`Intento ${attempt + 1}: Iniciando precarga de imágenes...`);

    if (attempt >= 3) {
        console.log("No se pudo abrir el modal después de varios intentos. Reiniciando el script...");
        initialize(); // Reiniciar el script en lugar de recargar la página
        return;
    }

    const storedImageLinks = sessionStorage.getItem('imageLinks');
    if (storedImageLinks) {
        console.log("Las imágenes ya están en caché.");
        return;
    }

    const originalButton = document.getElementById("btn_show_all_images");
    if (!originalButton) {
        console.log("Botón principal no encontrado, reintentando...");
        setTimeout(() => preloadImages(attempt + 1), 800);
        return;
    }

    console.log("Limpiando cualquier modal o overlay previo...");
    closeFloatingWindows(); // Cierra cualquier modal que haya quedado abierto
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove()); // Elimina cualquier overlay

    console.log("Abriendo modal en segundo plano para extraer enlaces...");

    // Ocultar temporalmente el modal
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

    originalButton.click(); // Intentar abrir el modal

    setTimeout(() => {
        const modalVisible = document.querySelector(".modal.show");

        if (!modalVisible) {
            console.log(`El modal no se abrió en el intento ${attempt + 1}, reintentando...`);
            preloadImages(attempt + 1);
            return;
        }

        console.log("El modal se abrió correctamente, extrayendo imágenes...");
        const imageLinks = Array.from(document.querySelectorAll("a[href^='https://deckard-imddb-us-west']"))
            .map(anchor => anchor.href);

        if (imageLinks.length > 0) {
            sessionStorage.setItem('imageLinks', JSON.stringify(imageLinks));
            console.log(`Se almacenaron ${imageLinks.length} imágenes en caché.`);

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

                console.log("Modal restaurado correctamente.");
            }, 1000);
        } else {
            console.log("No se encontraron imágenes en el modal.");
        }
    }, 1000);
}




function initialize() {
    const originalButtonContainer = document.getElementById('listing_detail_page_image_gallery');
    if (originalButtonContainer) {
        createAdditionalButton();
        setupClickEvent();
        preloadImages(); // Llama a la precarga de imágenes en segundo plano
    } else {
        setTimeout(initialize, 800);
    }
}
    function initialize2() {
    const originalButtonContainer = document.getElementById('listing_detail_page_image_gallery');
    if (originalButtonContainer) {
        createAdditionalButton();
        setupClickEvent();
    } else {
        setTimeout(initialize2, 0);
    }
}

    initialize();
    window.addEventListener('keydown', closeOnEscape);

})();
