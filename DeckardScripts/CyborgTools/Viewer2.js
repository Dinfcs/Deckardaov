// ==UserScript==
// @name         Cyborg Image Viewer Pro
// @version      7.7 // Versión actualizada
// @description  Visor avanzado de imágenes con carrusel de miniaturas y recarga de caché
// @match        https://cyborg.deckard.com/listing/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Constantes
    const CACHE_PREFIX = 'imgCache_';
    const LAST_VIEWED_KEY = 'lastViewedIndex';
    const CDN_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.10.4/';
    const IMAGE_PATTERN = "a[href^='https://deckard-imddb-us-west']";

    // Estado de la aplicación
    const appState = {
        viewer: null,
        viewerOpened: false,
        currentThumbnail: null,
        pageUrl: window.location.href,
        modalObserver: null,
        buttonObserver: null,
        isSilentPreloading: false, // NUEVO: Bandera para la precarga silenciosa
        silentPreloadButtonCheckInterval: null // NUEVO: Intervalo para la precarga silenciosa
    };

    // Cargador de recursos
    const resourceLoader = {
        load() {
            [
                { type: 'link', attrs: { href: `${CDN_BASE}viewer.min.css`, rel: 'stylesheet' }},
                { type: 'script', attrs: { src: `${CDN_BASE}viewer.min.js`, type: 'text/javascript' }}
            ].forEach(resource => {
                const element = document.createElement(resource.type);
                Object.entries(resource.attrs).forEach(([key, value]) => {
                    element[key] = value;
                });
                document.head.appendChild(element);
            });
        }
    };

    // Gestor de estilos
    const styleManager = {
        inject() {
            const styles = `
                #btn_show_all_images, #btn_carousel_viewer {
                    height: 24px !important;
                    width: 24px !important;
                    cursor: pointer;
                    margin-left: 5px;
                    vertical-align: middle;
                }

                #btn_carousel_viewer {
                    margin-left: 8px;
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
                    background: rgba(0, 0, 0, 0.85);
                    display: grid;
                    gap: 12px;
                    padding: 15px;
                    border-left: 2px solid #444;
                    box-shadow: -2px 0 15px rgba(0, 0, 0, 0.6);
                    overflow-y: auto;
                    width: 320px;
                }

                #thumbsContainer img {
                    width: 100%;
                    height: auto;
                    max-width: 220px;
                    max-height: 220px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 4px;
                }

                #thumbsContainer img:hover {
                    opacity: 0.8;
                    transform: scale(1.05);
                    box-shadow: 0 0 8px rgba(255, 255, 0, 0.6);
                }

                .current-thumbnail {
                    border: 3px solid #ffeb3b !important;
                    box-shadow: 0 0 12px rgba(255, 235, 59, 0.8) !important;
                }

                .viewer-backdrop {
                    background-color: rgba(0, 0, 0, 0.97) !important;
                }

                .viewer-toolbar > ul > li {
                    margin: 0 8px !important;
                }

                /* NUEVO: Estilos para el botón de recarga */
                #thumbsContainer button {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 15px;
                    background-color: #4CAF50; /* Verde */
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.3s ease;
                    display: flex; /* Para centrar el icono y el texto */
                    align-items: center;
                    justify-content: center;
                    gap: 5px; /* Espacio entre el icono y el texto */
                }

                #thumbsContainer button:hover {
                    background-color: #45a049;
                }
            `;

            const styleElement = document.createElement('style');
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }
    };

    // Gestor de caché
    const cacheManager = {
        getKey() {
            return `${CACHE_PREFIX}${appState.pageUrl}`;
        },

        get() {
            const cachedData = sessionStorage.getItem(this.getKey());
            return cachedData ? JSON.parse(cachedData) : null;
        },

        set(images) {
            sessionStorage.setItem(this.getKey(), JSON.stringify(images));
            console.log(`Imágenes en caché: ${images.length}`);
        },

        clear() {
            sessionStorage.removeItem(this.getKey());
            console.log(`Caché de imágenes limpiada para ${appState.pageUrl}`);
        },

        getLastViewedIndex() {
            const index = parseInt(sessionStorage.getItem(LAST_VIEWED_KEY), 10);
            return !isNaN(index) ? index : 0;
        },

        setLastViewedIndex(index) {
            sessionStorage.setItem(LAST_VIEWED_KEY, index);
        }
    };

    // Extractor de imágenes
    const imageExtractor = {
        fromModal() {
            const imageLinks = Array.from(
                document.querySelectorAll(IMAGE_PATTERN)
            ).map(anchor => anchor.href);

            if (imageLinks.length === 0) {
                console.warn('No se encontraron imágenes en el modal');
                return null;
            }

            // Guardar en caché al extraer, independientemente de si es precarga silenciosa o no
            cacheManager.set(imageLinks);
            return imageLinks;
        }
    };

    // Gestor de modal
    const modalManager = {
        close() {
            const closeButton = document.querySelector(".btn-close[aria-label='Close']");
            if (closeButton) {
                closeButton.click();
                console.log("Modal cerrado automáticamente");
                return true;
            }
            console.warn("No se pudo encontrar el botón de cierre del modal");
            return false;
        },

        observeForOpen(callback) {
            if (appState.modalObserver) {
                appState.modalObserver.disconnect();
            }

            appState.modalObserver = new MutationObserver((mutations, obs) => {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    obs.disconnect(); // Desconectar el observer una vez que se detecta el modal
                    appState.modalObserver = null; // Limpiar la referencia
                    callback(modal);
                }
            });

            // Observar el body para detectar la aparición del modal
            appState.modalObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    // Constructor de interfaz de usuario
    const uiBuilder = {
        createThumbsContainer(imageLinks) {
            const container = document.createElement('div');
            container.id = "thumbsContainer";
            container.style.gridTemplateColumns = imageLinks.length <= 6 ? "1fr" : "repeat(2, 1fr)";

            // NUEVO: Botón de recarga de imágenes
            const refreshButton = document.createElement('button');
            refreshButton.innerHTML = ' Recargar Imágenes'; // Unicode refresh symbol
            refreshButton.title = "Borrar caché y recargar todas las imágenes";
            refreshButton.addEventListener('click', () => imageViewer.refreshImages());
            container.appendChild(refreshButton);

            imageLinks.forEach((imgUrl, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgUrl;
                thumb.alt = `Miniatura ${index + 1}`;
                thumb.dataset.index = index;

                thumb.addEventListener('click', (e) => {
                    if (e.ctrlKey || e.metaKey) { // CMD key for Mac
                        window.open(imgUrl, '_blank');
                    } else {
                        appState.viewer.view(index);
                    }
                });

                container.appendChild(thumb);
            });

            return container;
        },

        createViewerContainer(imageLinks) {
            const container = document.createElement('div');
            container.id = "imageViewerContainer";

            imageLinks.forEach(imgUrl => {
                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = "Imagen del visor";
                container.appendChild(img);
            });

            return container;
        },

        createViewerButton() {
            const viewerBtn = document.createElement("img");
            viewerBtn.id = "btn_carousel_viewer";
            viewerBtn.src = "https://dinfcs.github.io/Deckardaov/DeckardScripts/DatabasePR/carousel.png";
            viewerBtn.title = "Abrir visor de imágenes";
            viewerBtn.style.cssText = "display: inline; cursor: pointer; height: 24px; width: 24px; margin-left: 8px;";

            return viewerBtn;
        }
    };

    // Cargador/precargador de imágenes
    const imageLoader = {
        preload(imageUrls) {
            if (!imageUrls || imageUrls.length === 0) return;
            console.log(`Iniciando precarga de ${imageUrls.length} imágenes...`);
            imageUrls.forEach(url => {
                const img = new Image();
                img.src = url;
            });
        }
    };

    // Controlador de eventos
    const eventHandler = {
        setupKeyboardNavigation(e) {
            if (!appState.viewer || !appState.viewerOpened) return;

            const keyActions = {
                'd': () => appState.viewer.next(),
                'a': () => appState.viewer.prev(),
                'w': () => appState.viewer.zoom(0.1),
                's': () => appState.viewer.zoom(-0.1),
                'escape': () => appState.viewer.hide()
            };

            const action = keyActions[e.key.toLowerCase()];
            if (action) {
                e.preventDefault();
                action();
            }
        },

        setupGlobalShortcut(e) {
            if (e.ctrlKey && e.key.toLowerCase() === 'q' && !appState.viewerOpened) {
                e.preventDefault();
                imageViewer.openModalAndViewer();
            }
        }
    };

    // Visor de imágenes
    const imageViewer = {
        show(imageLinks) {
            if (appState.viewerOpened || !imageLinks || imageLinks.length === 0) return;

            console.log('Iniciando visor de imágenes...');
            appState.viewerOpened = true;

            const thumbsContainer = uiBuilder.createThumbsContainer(imageLinks);
            const viewerContainer = uiBuilder.createViewerContainer(imageLinks);

            document.body.appendChild(thumbsContainer);
            document.body.appendChild(viewerContainer);

            appState.viewer = new Viewer(viewerContainer, {
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
                    play: 0,
                    next: 1,
                },
                transition: false,
                keyboard: true,
                viewed(e) {
                    if (appState.currentThumbnail) {
                        appState.currentThumbnail.classList.remove('current-thumbnail');
                    }

                    const thumbs = thumbsContainer.querySelectorAll('img');
                    if (thumbs && thumbs.length > e.detail.index) {
                        appState.currentThumbnail = thumbs[e.detail.index];
                        appState.currentThumbnail.classList.add('current-thumbnail');
                        const containerRect = thumbsContainer.getBoundingClientRect();
                        const thumbRect = appState.currentThumbnail.getBoundingClientRect();

                        if (thumbRect.top < containerRect.top || thumbRect.bottom > containerRect.bottom) {
                            appState.currentThumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                },
                hidden() {
                    // Este callback se llama cuando el visor se oculta o se destruye.
                    if (appState.viewer) {
                       cacheManager.setLastViewedIndex(appState.viewer.index);
                       // NOTA: No llamar a viewer.destroy() aquí si ya se ha llamado desde fuera,
                       // porque se podría entrar en un bucle o error si la instancia ya está siendo destruida.
                       // La instancia de viewer se establece a null en el método `destroy()` de Viewer.js.
                    }
                    // Remover los contenedores de forma segura si existen
                    if (thumbsContainer && thumbsContainer.parentNode) thumbsContainer.remove();
                    if (viewerContainer && viewerContainer.parentNode) viewerContainer.remove();

                    appState.viewer = null; // Asegurarse de que la referencia se limpie
                    appState.viewerOpened = false;
                    document.removeEventListener('keydown', eventHandler.setupKeyboardNavigation);
                    console.log("Visor cerrado y limpiado.");
                }
            });

            appState.viewer.show();

            const lastIndex = cacheManager.getLastViewedIndex();
            if (lastIndex >= 0 && lastIndex < imageLinks.length) {
                setTimeout(() => appState.viewer.view(lastIndex), 100);
            }

            document.addEventListener('keydown', eventHandler.setupKeyboardNavigation);
        },

        openModalAndViewer() {
            console.log("Iniciando flujo completo (manual o atajo)...");

            // Si la precarga silenciosa está en curso, la desconectamos
            if (appState.isSilentPreloading && appState.silentPreloadButtonCheckInterval) {
                clearInterval(appState.silentPreloadButtonCheckInterval);
                appState.isSilentPreloading = false; // Resetear la bandera
                console.log("Precarga silenciosa interrumpida por acción del usuario.");
            }
            if (appState.modalObserver) {
                appState.modalObserver.disconnect(); // Desconectar cualquier observer pendiente
                appState.modalObserver = null;
            }

            // Verificar caché primero
            const cachedImages = cacheManager.get();
            if (cachedImages) {
                console.log("Usando imágenes desde caché. Abriendo visor directamente.");
                // Aunque ya se precargaron, una llamada extra no hace daño y asegura que estén listas.
                imageLoader.preload(cachedImages);
                this.show(cachedImages);
                return;
            }

            // Configurar observer para detectar cuando el modal está abierto (para extracción manual)
            modalManager.observeForOpen(() => {
                const images = imageExtractor.fromModal();
                if (images) {
                    imageLoader.preload(images);
                    modalManager.close();
                    setTimeout(() => this.show(images), 300);
                } else {
                    console.warn("No se encontraron imágenes en el modal durante la apertura manual. Cerrando modal.");
                    modalManager.close();
                }
            });

            // Simular clic en el botón original para abrir el modal
            const originalBtn = document.getElementById("btn_show_all_images");
            if (originalBtn) {
                originalBtn.click();
                console.log("Botón original clicado para abrir modal (manual).");
            } else {
                console.error("No se encontró el botón para abrir el modal (manual).");
            }
        },

        // NUEVO: Método para recargar imágenes (limpiar caché y extraer de nuevo)
        refreshImages() {
            if (!confirm("¿Estás seguro de que quieres recargar las imágenes? Esto borrará la caché local y buscará nuevas imágenes.")) {
                return;
            }

            console.log("Iniciando recarga de imágenes...");

            // Detener cualquier precarga silenciosa activa y desconectar observers
            if (appState.isSilentPreloading && appState.silentPreloadButtonCheckInterval) {
                clearInterval(appState.silentPreloadButtonCheckInterval);
                appState.isSilentPreloading = false;
                console.log("Precarga silenciosa interrumpida por recarga manual.");
            }
            if (appState.modalObserver) {
                appState.modalObserver.disconnect();
                appState.modalObserver = null;
            }

            // 1. Limpiar caché
            cacheManager.clear();

            // 2. Destruir el visor actual si está abierto
            // Esto activará el callback 'hidden' que se encarga de limpiar el DOM y el estado.
            if (appState.viewer) {
                appState.viewer.destroy();
                // appState.viewer será null y appState.viewerOpened false después de que 'hidden' se dispare.
            } else {
                console.warn("Intento de recargar imágenes, pero el visor no estaba abierto. Procediendo a la extracción.");
            }

            // Usar un setTimeout para asegurar que el DOM está limpio y el estado se ha actualizado
            // antes de intentar abrir el modal y el nuevo visor.
            setTimeout(() => {
                // 3. Configurar observer para detectar cuando el modal está abierto (para extracción de nuevas imágenes)
                modalManager.observeForOpen(() => {
                    console.log("Modal abierto por recarga manual. Extrayendo imágenes...");
                    const images = imageExtractor.fromModal(); // Esto también guarda en caché
                    if (images && images.length > 0) {
                        imageLoader.preload(images); // Iniciar la precarga de las nuevas imágenes
                        modalManager.close(); // Cerrar el modal inmediatamente

                        // 4. Mostrar el visor con las nuevas imágenes
                        // Usar un setTimeout para dar tiempo al modal a cerrarse completamente
                        setTimeout(() => this.show(images), 300);
                        console.log(`Recarga de imágenes completada para ${images.length} imágenes.`);
                    } else {
                        console.warn("No se encontraron imágenes después de la recarga. El visor no se abrirá.");
                        modalManager.close(); // Asegurarse de cerrar el modal
                    }
                });

                // Simular clic en el botón original para abrir el modal
                const originalBtn = document.getElementById("btn_show_all_images");
                if (originalBtn) {
                    originalBtn.click();
                    console.log("Botón original clicado para abrir modal (recarga manual).");
                } else {
                    console.error("No se encontró el botón para abrir el modal (recarga manual). No se puede recargar.");
                }
            }, 100); // Pequeño retardo para dar tiempo a la destrucción del visor anterior
        }
    };

    // Inicializador de la aplicación
    const app = {
        init() {
            resourceLoader.load();
            styleManager.inject();
            this.setupButtons(); // Configura el botón del carrusel y lo añade si no existe
            this.setupTabListener(); // Asegura que el botón del carrusel reaparezca al cambiar de pestaña

            // Atajo de teclado global
            document.addEventListener('keydown', eventHandler.setupGlobalShortcut);

            // NUEVO: Iniciar la precarga silenciosa al cargar la página
            this.startSilentPreload();

            console.log("Cyborg Image Viewer Pro inicializado");
        },

        setupButtons() {
            const initialCheckInterval = setInterval(() => {
                const originalBtn = document.getElementById("btn_show_all_images");
                if (originalBtn) {
                    clearInterval(initialCheckInterval);
                    this.addViewerButtonIfNeeded(originalBtn);
                }
            }, 500);
        },

        setupTabListener() {
            if (appState.buttonObserver) {
                appState.buttonObserver.disconnect();
            }

            appState.buttonObserver = new MutationObserver((mutations) => {
                const originalBtn = document.getElementById("btn_show_all_images");
                if (originalBtn) {
                    this.addViewerButtonIfNeeded(originalBtn);
                } else {
                    const viewerBtn = document.getElementById("btn_carousel_viewer");
                    if (viewerBtn) {
                        viewerBtn.remove();
                        console.log("Botón del viewer eliminado porque el botón original no está presente.");
                    }
                }
            });

            // Observar el body para detectar cambios que puedan indicar un cambio de pestaña (visibilidad del botón original)
            appState.buttonObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
            console.log("Observer de botones para pestañas configurado.");
        },

        addViewerButtonIfNeeded(originalBtn) {
            if (!document.getElementById("btn_carousel_viewer")) {
                const viewerBtn = uiBuilder.createViewerButton();
                if (originalBtn.parentNode) {
                    originalBtn.parentNode.insertBefore(viewerBtn, originalBtn.nextSibling);
                    viewerBtn.addEventListener("click", () => imageViewer.openModalAndViewer());
                    console.log("Botón del viewer creado exitosamente");
                }
            }
        },

        // NUEVO: Función para la precarga silenciosa
        startSilentPreload() {
            // No iniciar si ya estamos en un proceso de precarga o si el visor ya está abierto
            if (appState.isSilentPreloading || appState.viewerOpened) {
                console.log("Precarga silenciosa no iniciada: ya en curso o visor abierto.");
                return;
            }

            // 1. Verificar si ya tenemos imágenes en caché
            const cachedImages = cacheManager.get();
            if (cachedImages && cachedImages.length > 0) {
                console.log("Imágenes ya en caché. Iniciando precarga silenciosa desde caché.");
                imageLoader.preload(cachedImages);
                return; // No necesitamos abrir el modal
            }

            console.log("No hay imágenes en caché. Intentando precarga silenciosa via modal.");
            appState.isSilentPreloading = true; // Activar la bandera de precarga silenciosa

            // 2. Esperar a que el botón original de imágenes aparezca
            appState.silentPreloadButtonCheckInterval = setInterval(() => {
                const originalBtn = document.getElementById("btn_show_all_images");
                if (originalBtn) {
                    clearInterval(appState.silentPreloadButtonCheckInterval); // Detener la comprobación
                    console.log("Botón original de imágenes detectado para precarga silenciosa.");

                    // 3. Configurar un observer para detectar cuando el modal se abra
                    modalManager.observeForOpen(() => {
                        console.log("Modal abierto por precarga silenciosa. Extrayendo imágenes...");
                        const images = imageExtractor.fromModal(); // Esto también guarda en caché
                        if (images && images.length > 0) {
                            imageLoader.preload(images); // Iniciar la precarga de las imágenes
                            console.log(`Precarga silenciosa completada para ${images.length} imágenes.`);
                        } else {
                            console.warn("No se encontraron imágenes para la precarga silenciosa.");
                        }
                        // 4. Cerrar el modal inmediatamente
                        modalManager.close();
                        appState.isSilentPreloading = false; // Desactivar la bandera
                        console.log("Modal cerrado tras precarga silenciosa.");
                    });

                    // 5. Clicar el botón para abrir el modal (invisiblemente)
                    // Pequeño retardo para asegurar que el observer esté activo antes del clic
                    setTimeout(() => {
                        originalBtn.click();
                        console.log("Clic simulado en botón original para precarga silenciosa.");
                    }, 50); // Un pequeño retardo
                }
            }, 500); // Comprobar cada 0.5 segundos si el botón está disponible

            // Opcional: Un timeout para detener el proceso si el botón nunca aparece (ej. página sin imágenes)
            setTimeout(() => {
                if (appState.isSilentPreloading && appState.silentPreloadButtonCheckInterval) {
                    clearInterval(appState.silentPreloadButtonCheckInterval);
                    appState.isSilentPreloading = false;
                    console.warn("Precarga silenciosa cancelada: El botón de imágenes no apareció a tiempo.");
                }
            }, 10000); // Cancelar después de 10 segundos
        }
    };

    // Iniciar script
    app.init();
})();
