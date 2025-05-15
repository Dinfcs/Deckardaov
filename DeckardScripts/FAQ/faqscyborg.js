// ==UserScript==
// @name         Barra de Búsqueda Mejorada v2.4
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Barra de búsqueda con ventana flotante grande, zoom en imágenes y diseño mejorado.
// @author
// @match        https://cyborg.deckard.com/listing/*STR*
// ==/UserScript==

(function() {
    'use strict';

    // --- Variable para almacenar los datos de FAQ ---
    let faqData = [];

    // --- Estilos CSS Mejorados ---
    const styles = `
        :root {
            --search-primary-color: #007bff;
            --search-secondary-color: #6c757d;
            --search-light-gray: #f8f9fa;
            --search-medium-gray: #e9ecef;
            --search-dark-gray: #343a40;
            --search-text-color: #212529;
            --search-bg-color: #ffffff;
            --search-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            --search-border-radius: 12px;
            --search-font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }

        .floating-search-container {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 8000;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            font-family: var(--search-font-family);
        }

        .floating-search-bar {
            display: flex;
            align-items: center;
            background: var(--search-bg-color);
            border-radius: 28px;
            box-shadow: var(--search-shadow);
            padding: 8px 15px;
            width: 200px;
            max-width: calc(100vw - 40px);
            border: 1px solid var(--search-medium-gray);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            transition: all 0.3s ease;
        }

        .floating-search-bar:hover {
            width: 300px;
        }

        .floating-search-input {
            flex-grow: 1;
            border: none;
            background: transparent;
            padding: 8px 0;
            font-size: 14px;
            outline: none;
            color: var(--search-text-color);
            margin-right: 10px;
        }

        .floating-search-input::placeholder {
            color: #888;
            opacity: 1;
        }

        .floating-search-button {
            background: var(--search-primary-color);
            border: none;
            color: white;
            cursor: pointer;
            padding: 8px;
            font-size: 16px;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
        }

        .floating-search-button:hover {
            background: #0056b3;
        }

        .search-results-window {
            position: fixed;
            top: 20px;
            left: 50%;
            width: 90vw;
            height: calc(100vh - 40px);
            min-width: 320px;
            max-width: 1200px;
            background: var(--search-bg-color);
            border-radius: var(--search-border-radius);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
            z-index: 8000;
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid var(--search-medium-gray);
            opacity: 0;
            transform: translateX(-50%) scale(0.95);
            transition: opacity 0.25s ease-out, transform 0.25s ease-out;
        }

        .search-results-window.visible {
            display: flex;
            opacity: 1;
            transform: translateX(-50%) scale(1);
        }

        .search-results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: var(--search-light-gray);
            border-bottom: 1px solid var(--search-medium-gray);
            cursor: move;
            user-select: none;
            border-top-left-radius: var(--search-border-radius);
            border-top-right-radius: var(--search-border-radius);
        }

        .search-results-title {
            font-weight: 600;
            color: var(--search-dark-gray);
            font-size: 17px;
        }

        .window-controls-container {
            display: flex;
            align-items: center;
        }

        .window-control {
            background: transparent;
            border: none;
            color: var(--search-secondary-color);
            cursor: pointer;
            font-size: 20px;
            margin-left: 10px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease, color 0.2s ease;
        }

        .window-control:hover {
            background: var(--search-medium-gray);
            color: var(--search-dark-gray);
        }

        .search-results-content {
            padding: 25px;
            overflow-y: auto;
            flex-grow: 1;
            scrollbar-width: thin;
            scrollbar-color: var(--search-primary-color) var(--search-light-gray);
        }

        .search-results-content::-webkit-scrollbar {
            width: 10px;
        }

        .search-results-content::-webkit-scrollbar-track {
            background: var(--search-light-gray);
            border-radius: 10px;
        }

        .search-results-content::-webkit-scrollbar-thumb {
            background-color: var(--search-primary-color);
            border-radius: 10px;
            border: 2px solid var(--search-light-gray);
        }

        .faq-item {
            margin-bottom: 20px;
            padding: 20px;
            border-radius: 8px;
            background: var(--search-bg-color);
            border: 1px solid #e9ecef;
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .faq-item:last-child {
            margin-bottom: 0;
        }

        .faq-item:hover {
            border-color: var(--search-primary-color);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            transform: translateY(-2px);
        }

        .faq-question {
            font-weight: 600;
            color: var(--search-primary-color);
            margin-bottom: 10px;
            font-size: 18px;
        }

        .faq-answer {
            color: #555;
            line-height: 1.7;
            white-space: pre-line;
            font-size: 15px;
        }

        .faq-answer img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 10px 0;
            cursor: zoom-in;
            transition: transform 0.2s ease;
        }

        .faq-answer img:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .highlight {
            background-color: #ffe082;
            font-weight: bold;
            padding: 1px 3px;
            border-radius: 3px;
            color: #333;
        }

        .no-results, .initial-message, .error-message {
            text-align: center;
            color: var(--search-secondary-color);
            padding: 50px 20px;
            font-size: 16px;
            font-style: italic;
        }

        .error-message {
            color: #d9534f;
        }

        /* Modal para imágenes */
        .image-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
            z-index: 8000;
            overflow: auto;
            justify-content: center;
            align-items: center;
        }

        .image-modal-content {
            max-width: 90%;
            max-height: 90%;
            margin: auto;
            display: block;
            animation: zoom 0.3s;
        }

        .image-modal-close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            transition: 0.3s;
            cursor: pointer;
        }

        .image-modal-close:hover {
            color: #bbb;
        }

        @keyframes zoom {
            from {transform: scale(0.5)}
            to {transform: scale(1)}
        }

        @media (max-width: 768px) {
            .floating-search-container {
                bottom: 15px;
                right: 15px;
            }

            .floating-search-bar {
                width: 50px;
                padding: 8px;
                justify-content: flex-end;
            }

            .floating-search-bar:hover {
                width: calc(100vw - 30px);
            }

            .floating-search-input {
                display: none;
                margin-right: 0;
            }

            .floating-search-bar:hover .floating-search-input {
                display: block;
                margin-right: 10px;
            }

            .search-results-window {
                width: 95vw;
                height: calc(100vh - 20px);
                top: 10px;
            }

            .search-results-header {
                padding: 10px 15px;
            }

            .search-results-title {
                font-size: 16px;
            }

            .window-control {
                font-size: 18px;
                width: 28px;
                height: 28px;
            }

            .search-results-content {
                padding: 15px;
            }

            .faq-question {
                font-size: 17px;
            }

            .faq-answer {
                font-size: 14px;
            }
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // --- Crear Elementos HTML ---
    const container = document.createElement('div');
    container.className = 'floating-search-container';

    const searchBar = document.createElement('div');
    searchBar.className = 'floating-search-bar';

    const searchInput = document.createElement('input');
    searchInput.className = 'floating-search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Cargando FAQs...';
    searchInput.autocomplete = 'off';
    searchInput.setAttribute('aria-label', 'Campo de búsqueda');
    searchInput.disabled = true;

    const searchButton = document.createElement('button');
    searchButton.className = 'floating-search-button';
    searchButton.innerHTML = '<span>&#x1F50D;</span>';
    searchButton.title = 'Buscar';
    searchButton.setAttribute('aria-label', 'Botón de búsqueda');
    searchButton.disabled = true;

    const resultsWindow = document.createElement('div');
    resultsWindow.className = 'search-results-window';
    resultsWindow.setAttribute('role', 'dialog');
    resultsWindow.setAttribute('aria-modal', 'true');
    resultsWindow.setAttribute('aria-labelledby', 'searchResultsTitle');

    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'search-results-header';

    const resultsTitle = document.createElement('div');
    resultsTitle.className = 'search-results-title';
    resultsTitle.id = 'searchResultsTitle';
    resultsTitle.textContent = 'Resultados de Búsqueda';

    const windowControlsContainer = document.createElement('div');
    windowControlsContainer.className = 'window-controls-container';

    const closeButton = document.createElement('button');
    closeButton.className = 'window-control';
    closeButton.innerHTML = '<span>&times;</span>';
    closeButton.title = 'Cerrar';
    closeButton.setAttribute('aria-label', 'Cerrar ventana de resultados');

    const resultsContent = document.createElement('div');
    resultsContent.className = 'search-results-content';

    // Crear modal para imágenes
    const imageModal = document.createElement('div');
    imageModal.className = 'image-modal';

    const modalClose = document.createElement('span');
    modalClose.className = 'image-modal-close';
    modalClose.innerHTML = '&times;';
    modalClose.title = 'Cerrar';

    const modalContent = document.createElement('img');
    modalContent.className = 'image-modal-content';

    imageModal.appendChild(modalClose);
    imageModal.appendChild(modalContent);

    // --- Construir la Estructura del DOM ---
    windowControlsContainer.appendChild(closeButton);
    resultsHeader.appendChild(resultsTitle);
    resultsHeader.appendChild(windowControlsContainer);

    resultsWindow.appendChild(resultsHeader);
    resultsWindow.appendChild(resultsContent);

    searchBar.appendChild(searchInput);
    searchBar.appendChild(searchButton);

    container.appendChild(searchBar);
    document.body.appendChild(resultsWindow);
    document.body.appendChild(container);
    document.body.appendChild(imageModal);

    // --- Lógica de Funcionalidad ---
    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    let searchTimeout;
    let isWindowVisible = false;

    // --- Función para cargar los datos de FAQ desde JSON ---
    async function loadFaqData() {
        try {
           // const response = await fetch('https://dinfcs.github.io/Deckardaov/DeckardScripts/FAQ/FAQ.json');
            const response = await fetch('https://script.google.com/a/macros/deckard.com/s/AKfycbwTWV21oVCGJqeOtDNgJ_14XH89wjqrP0M7kEqfo3aGNjnQqaCJRio0F1VG9JdhHUYz/exec?endpoint=json');
            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }
            const data = await response.json();

            if (Array.isArray(data)) {
                faqData = data;
            } else if (data && Array.isArray(data.preguntasFrecuentes)) {
                faqData = data.preguntasFrecuentes;
            } else if (data && Array.isArray(data.FAQ)) {
                 faqData = data.FAQ;
            }
            else {
                throw new Error('Formato de FAQ JSON inesperado.');
            }

            searchInput.placeholder = 'Busca en la Base de Conocimiento...';
            console.log('Datos de FAQ cargados:', faqData.length, 'elementos');

        } catch (error) {
            console.error('Error al cargar los datos de FAQ:', error);
            faqData = [];
            searchInput.placeholder = 'Error al cargar FAQs.';
            resultsContent.innerHTML = '';
            const errorMessage = document.createElement('p');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'No se pudieron cargar las FAQs. Por favor, inténtalo más tarde.';
            resultsContent.appendChild(errorMessage);
            if (!isWindowVisible) showResultsWindow();
        } finally {
            searchInput.disabled = false;
            searchButton.disabled = false;
            if (document.activeElement === searchInput) {
                 displayResults(searchInput.value);
            }
        }
    }

    // Función para mostrar resultados con debounce
function displayResults(searchTerm) {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        resultsContent.innerHTML = ''; // Limpiar resultados anteriores

        // Si el input está deshabilitado (cargando o error)
        if (searchInput.disabled) {
            const statusMessage = document.createElement('p');
            statusMessage.className = 'initial-message';
            statusMessage.textContent = searchInput.placeholder;
            resultsContent.appendChild(statusMessage);
            return;
        }

        if (!searchTerm.trim()) {
            const initialMessage = document.createElement('p');
            initialMessage.className = 'initial-message';
            initialMessage.textContent = 'Escribe algo para buscar en las FAQs.';
            resultsContent.appendChild(initialMessage);
            return;
        }

        // Si faqData está vacío y no es debido a un error de carga
        if (faqData.length === 0 && !resultsContent.querySelector('.error-message')) {
            const noDataMessage = document.createElement('p');
            noDataMessage.className = 'no-results';
            noDataMessage.textContent = 'No hay datos de FAQ disponibles para buscar.';
            resultsContent.appendChild(noDataMessage);
            return;
        }

        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        let foundResults = false;
        const fragment = document.createDocumentFragment();

        faqData.forEach(item => {
            if (item && typeof item.question === 'string' && typeof item.answer === 'string') {
                // Extraer solo el texto (excluyendo imágenes en base64)
                const textOnlyAnswer = item.answer.replace(/<img[^>]+src="data:image[^"]*"[^>]*>/g, '');
                const lowerQuestion = item.question.toLowerCase();
                const lowerAnswer = textOnlyAnswer.toLowerCase();

                if (lowerQuestion.includes(lowerSearchTerm) || lowerAnswer.includes(lowerSearchTerm)) {
                    foundResults = true;
                    const resultItem = document.createElement('div');
                    resultItem.className = 'faq-item';

                    // Procesar pregunta
                    const questionElement = document.createElement('h3');
                    questionElement.className = 'faq-question';
                    questionElement.innerHTML = highlightText(item.question, searchTerm);

                    // Procesar respuesta (texto + imágenes preservadas)
                    const answerElement = document.createElement('div');
                    answerElement.className = 'faq-answer';

                    // Highlight solo en el texto y preservar imágenes
                    const processedText = highlightText(textOnlyAnswer, searchTerm);
                    const imagesHtml = extractImagesFromAnswer(item.answer);
                    answerElement.innerHTML = processedText + imagesHtml;

                    resultItem.appendChild(questionElement);
                    resultItem.appendChild(answerElement);
                    fragment.appendChild(resultItem);
                }
            } else {
                console.warn('Item de FAQ con formato incorrecto, omitido:', item);
            }
        });

        if (foundResults) {
            resultsContent.appendChild(fragment);
            // Agregar event listeners a las imágenes después de añadirlas al DOM
            setTimeout(() => {
                const images = resultsContent.querySelectorAll('.faq-answer img');
                images.forEach(img => {
                    img.addEventListener('click', function() {
                        openImageModal(this.src);
                    });
                });
            }, 0);
        } else if (!resultsContent.querySelector('.error-message')) {
            const noResults = document.createElement('p');
            noResults.className = 'no-results';
            noResults.textContent = 'No se encontraron resultados para tu búsqueda. Intenta con otros términos.';
            resultsContent.appendChild(noResults);
        }

        // Mostrar ventana si hay término de búsqueda y no está visible
        if (searchTerm.trim() && !isWindowVisible) {
            showResultsWindow();
        }
    }, 250); // Debounce de 250ms
}

// Función auxiliar para extraer imágenes del answer sin modificar
function extractImagesFromAnswer(html) {
    const imgRegex = /<img[^>]+src="data:image[^"]*"[^>]*>/g;
    let imagesHtml = '';
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
        imagesHtml += match[0];
    }

    return imagesHtml;
}

// Función para resaltar texto (sin cambios)
function highlightText(text, searchTerm) {
    if (!searchTerm.trim()) return text;
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

    // Función para resaltar texto
    function highlightText(text, searchTerm) {
        if (!searchTerm.trim()) return text;
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    // Mostrar ventana de resultados
    function showResultsWindow() {
        if (isWindowVisible) return;
        resultsWindow.classList.add('visible');
        isWindowVisible = true;
        searchInput.setAttribute('aria-expanded', 'true');
    }

    // Ocultar ventana de resultados
    function hideResultsWindow() {
        if (!isWindowVisible) return;
        resultsWindow.classList.remove('visible');
        isWindowVisible = false;
        searchInput.setAttribute('aria-expanded', 'false');
    }

    // Función para abrir imagen en modal
    function openImageModal(src) {
        modalContent.src = src;
        imageModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Función para cerrar modal de imagen
    function closeImageModal() {
        imageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // --- Event Listeners ---
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        displayResults(searchTerm);
        if (searchTerm.trim() && !isWindowVisible && !searchInput.disabled) {
            showResultsWindow();
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.disabled) return;
        if (searchInput.value.trim() || faqData.length > 0 || resultsContent.querySelector('.error-message')) {
             displayResults(searchInput.value);
             showResultsWindow();
        }
    });

    searchButton.addEventListener('click', () => {
        if (searchInput.disabled) return;
        displayResults(searchInput.value);
        showResultsWindow();
        searchInput.focus();
    });

    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        hideResultsWindow();
    });

    // Event listeners para el modal de imágenes
    modalClose.addEventListener('click', closeImageModal);

    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imageModal.style.display === 'flex') {
            closeImageModal();
        }
    });

    resultsHeader.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        const rect = resultsWindow.getBoundingClientRect();
        resultsWindow.style.transform = 'none';
        resultsWindow.style.left = `${rect.left}px`;
        resultsWindow.style.top = `${rect.top}px`;
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        resultsHeader.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let x = e.clientX - dragOffsetX;
        let y = e.clientY - dragOffsetY;
        const minX = 0;
        const minY = 0;
        const maxX = window.innerWidth - resultsWindow.offsetWidth;
        const maxY = window.innerHeight - resultsWindow.offsetHeight;
        x = Math.max(minX, Math.min(x, maxX));
        y = Math.max(minY, Math.min(y, maxY));
        resultsWindow.style.left = `${x}px`;
        resultsWindow.style.top = `${y}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            resultsHeader.style.cursor = 'move';
            document.body.style.userSelect = '';
        }
    });

    document.addEventListener('click', (e) => {
        if (isWindowVisible && !resultsWindow.contains(e.target) && !container.contains(e.target)) {
            hideResultsWindow();
        }
    });

    resultsWindow.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    searchBar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // --- Inicialización ---
    loadFaqData().then(() => {
        displayResults(searchInput.value);
    });

    if (searchInput.disabled) {
        displayResults('');
    }

    setTimeout(() => {
        container.style.bottom = '50px';
        container.style.right = '15px';
    }, 100);

})();
