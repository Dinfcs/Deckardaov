// ==UserScript==
// @name         Cyborg Image Viewer Pro
// @version      7.4
// @description  Visor avanzado de imágenes con carrusel de miniaturas
// @match        https://cyborg.deckard.com/listing/*
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
        modalObserver: null
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
                    console.log("Modal detectado");
                    obs.disconnect();
                    callback(modal);
                }
            });

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
            container.style.gridTemplateColumns = imageLinks.length < 8 ? "1fr" : "repeat(2, 1fr)";

            imageLinks.forEach((imgUrl, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgUrl;
                thumb.alt = `Miniatura ${index + 1}`;
                thumb.dataset.index = index;

                thumb.addEventListener('click', (e) => {
                    if (e.ctrlKey || e.metaKey) {
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
            if (action) action();
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

            // Crear elementos UI
            const thumbsContainer = uiBuilder.createThumbsContainer(imageLinks);
            const viewerContainer = uiBuilder.createViewerContainer(imageLinks);

            document.body.appendChild(thumbsContainer);
            document.body.appendChild(viewerContainer);

            // Inicializar Viewer.js
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
                    // Resaltar miniatura actual
                    if (appState.currentThumbnail) {
                        appState.currentThumbnail.classList.remove('current-thumbnail');
                    }

                    const thumbs = thumbsContainer.querySelectorAll('img');
                    if (thumbs && thumbs.length > e.detail.index) {
                        appState.currentThumbnail = thumbs[e.detail.index];
                        appState.currentThumbnail.classList.add('current-thumbnail');
                        appState.currentThumbnail.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                },
                hidden() {
                    // Limpieza al cerrar
                    cacheManager.setLastViewedIndex(appState.viewer.index);
                    thumbsContainer.remove();
                    viewerContainer.remove();
                    appState.viewerOpened = false;
                    document.removeEventListener('keydown', eventHandler.setupKeyboardNavigation);
                }
            });

            // Mostrar el viewer
            appState.viewer.show();

            // Restaurar última posición
            const lastIndex = cacheManager.getLastViewedIndex();
            if (lastIndex >= 0 && lastIndex < imageLinks.length) {
                setTimeout(() => appState.viewer.view(lastIndex), 100);
            }

            // Configurar navegación por teclado
            document.addEventListener('keydown', eventHandler.setupKeyboardNavigation);
        },

        openModalAndViewer() {
            console.log("Iniciando flujo completo...");

            // Verificar caché primero
            const cachedImages = cacheManager.get();
            if (cachedImages) {
                console.log("Usando imágenes desde caché");
                this.show(cachedImages);
                return;
            }

            // Configurar observer para detectar cuando el modal está abierto
            modalManager.observeForOpen(() => {
                const images = imageExtractor.fromModal();
                if (images) {
                    modalManager.close();
                    setTimeout(() => this.show(images), 300);
                }
            });

            // Simular clic en el botón original para abrir el modal
            const originalBtn = document.getElementById("btn_show_all_images");
            if (originalBtn) {
                originalBtn.click();
            } else {
                console.error("No se encontró el botón para abrir el modal");
            }
        }
    };

    // Inicializador de la aplicación
    const app = {
        init() {
            resourceLoader.load();
            styleManager.inject();
            this.setupButtons();

            // Atajo de teclado global
            document.addEventListener('keydown', eventHandler.setupGlobalShortcut);

            console.log("Cyborg Image Viewer Pro inicializado");
        },

        setupButtons() {
            const checkInterval = setInterval(() => {
                const originalBtn = document.getElementById("btn_show_all_images");
                if (originalBtn) {
                    clearInterval(checkInterval);

                    if (!document.getElementById("btn_carousel_viewer")) {
                        const viewerBtn = uiBuilder.createViewerButton();
                        originalBtn.parentNode.insertBefore(viewerBtn, originalBtn.nextSibling);
                        viewerBtn.addEventListener("click", () => imageViewer.openModalAndViewer());
                        console.log("Botón del viewer creado exitosamente");
                    }
                }
            }, 500);
        }
    };

    // Iniciar script
    app.init();
})();
