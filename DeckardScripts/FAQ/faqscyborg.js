// ==UserScript==
// @name         Barra de Búsqueda Mejorada v3.2
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Ícono de lupa que abre ventana flotante con barra de búsqueda integrada (versión corregida)
// @author
// @match        https://cyborg.deckard.com/listing/*STR*
// ==/UserScript==

(function() {
    'use strict';

    // --- Variables globales ---
    let faqData = [];
    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    let searchTimeout;
    let isWindowVisible = false;
    let isDataLoaded = false;

    // --- Estilos CSS optimizados ---
    const styles = `
        .floating-search-container {
            position: fixed;
            bottom: 50px;
            right: 15px;
            z-index: 8000;
            font-family: 'Segoe UI', Roboto, sans-serif;
            transition: all 0.3s ease;
        }

        .floating-search-button {
            background: #007bff;
            border: none;
            color: white;
            cursor: pointer;
            padding: 12px;
            font-size: 20px;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .floating-search-button:hover {
            background: #0056b3;
            transform: scale(1.1);
        }

        .search-results-window {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            max-width: 850px;
            height: 85vh;
            background: white;
            border-radius: 12px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
            z-index: 8000;
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #e9ecef;
            opacity: 0;
            transition: opacity 0.25s ease;
        }

        .search-results-window.visible {
            display: flex;
            opacity: 1;
        }

        .search-results-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            cursor: move;
            user-select: none;
        }

        .window-search-container {
            display: flex;
            align-items: center;
            padding: 10px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
        }

        .window-search-input {
            flex-grow: 1;
            border: 1px solid #e9ecef;
            border-radius: 20px;
            padding: 8px 15px;
            font-size: 14px;
            outline: none;
            color: #212529;
            margin-right: 10px;
            transition: all 0.2s ease;
        }

        .window-search-input:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .search-results-title {
            font-weight: 600;
            color: #343a40;
            font-size: 17px;
        }

        .window-control {
            background: transparent;
            border: none;
            color: #6c757d;
            cursor: pointer;
            font-size: 20px;
            margin-left: 10px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        .window-control:hover {
            background: #e9ecef;
            color: #343a40;
        }

        .search-results-content {
            padding: 10px;
            overflow-y: auto;
            flex-grow: 1;
        }

        .search-results-content::-webkit-scrollbar {
            width: 8px;
        }

        .search-results-content::-webkit-scrollbar-track {
            background: #f8f9fa;
        }

        .search-results-content::-webkit-scrollbar-thumb {
            background-color: #007bff;
            border-radius: 4px;
        }

        .faq-item {
            margin-bottom: 15px;
            padding: 15px;
            border-radius: 8px;
            background: white;
            border: 1px solid #e9ecef;
            transition: all 0.2s ease;
        }

        .faq-item:hover {
            border-color: #007bff;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .faq-question {
            font-weight: 600;
            color: #007bff;
            margin-bottom: 8px;
            font-size: 16px;
        }

        .faq-answer {
            color: #555;
            line-height: 1.6;
            white-space: pre-line;
            font-size: 14px;
        }

        .faq-answer img {
            display: block;
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 8px auto;
            cursor: zoom-in;
            transition: transform 0.2s ease;
        }

        .faq-answer img:hover {
            transform: scale(1.02);
        }

        .highlight {
            background-color: #ffe082;
            font-weight: bold;
            padding: 1px 3px;
            border-radius: 3px;
        }

        .status-message {
            text-align: center;
            color: #6c757d;
            padding: 40px 20px;
            font-size: 15px;
        }

        .error-message {
            color: #d9534f;
        }

        .image-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
            z-index: 8000;
            justify-content: center;
            align-items: center;
        }

        .image-modal-content {
            max-width: 90%;
            max-height: 90%;
        }

        .image-modal-close {
            position: absolute;
            top: 15px;
            right: 35px;
            color: #f1f1f1;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
        }
    `;

    // --- Funciones principales ---
    async function loadFaqData() {
        try {
            const response = await fetch('https://dinfcs.github.io/Deckardaov/DeckardScripts/FAQ/faqs.json');
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const data = await response.json();
            faqData = Array.isArray(data) ? data :
                     data?.preguntasFrecuentes ? data.preguntasFrecuentes :
                     data?.FAQ ? data.FAQ : [];

            isDataLoaded = true;
            console.log("Datos de FAQ cargados correctamente");
        } catch (error) {
            console.error('Error al cargar FAQs:', error);
            showStatusMessage('No se pudieron cargar las FAQs. Por favor, inténtalo más tarde.', true);
        } finally {
            searchButton.disabled = false;
        }
    }

    function displayAllFAQs(searchTerm = '') {
        resultsContent.innerHTML = '';

        if (!faqData.length) {
            return showStatusMessage('No hay datos de FAQ disponibles.');
        }

        const fragment = document.createDocumentFragment();
        let hasResults = false;

        faqData.forEach(item => {
            if (!item?.question || !item?.answer) return;

            if (searchTerm) {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const textOnlyAnswer = item.answer.replace(/<img[^>]*>/g, '');
                if (!item.question.toLowerCase().includes(lowerSearchTerm) &&
                    !textOnlyAnswer.toLowerCase().includes(lowerSearchTerm)) {
                    return;
                }
            }

            hasResults = true;
            const resultItem = createResultItem(item, searchTerm);
            fragment.appendChild(resultItem);
        });

        if (hasResults) {
            resultsContent.appendChild(fragment);
        } else {
            showStatusMessage('No se encontraron resultados para tu búsqueda.');
        }
    }

    function createResultItem(item, searchTerm) {
        const resultItem = document.createElement('div');
        resultItem.className = 'faq-item';

        const questionElement = document.createElement('h3');
        questionElement.className = 'faq-question';
        questionElement.innerHTML = highlightText(item.question, searchTerm);
        resultItem.appendChild(questionElement);

        const answerElement = document.createElement('div');
        answerElement.className = 'faq-answer';
        answerElement.innerHTML = processAnswerContent(item.answer, searchTerm);
        resultItem.appendChild(answerElement);

        return resultItem;
    }

    function processAnswerContent(answer, searchTerm) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = answer;

        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('click', () => openImageModal(img.src));
        });

        const textNodes = [];
        tempDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                textNodes.push(highlightText(node.textContent, searchTerm));
            } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'IMG') {
                textNodes.push(node.outerHTML);
            }
        });

        return textNodes.join('');
    }

    function highlightText(text, searchTerm) {
        if (!searchTerm?.trim()) return text;
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return text.replace(new RegExp(`(${escapedTerm})`, 'gi'), '<span class="highlight">$1</span>');
    }

    function showStatusMessage(message, isError = false) {
        resultsContent.innerHTML = '';
        const msgElement = document.createElement('p');
        msgElement.className = isError ? 'error-message status-message' : 'status-message';
        msgElement.textContent = message;
        resultsContent.appendChild(msgElement);
    }

    function showResultsWindow() {
        console.log("Mostrando ventana de resultados");
        resultsWindow.classList.add('visible');
        isWindowVisible = true;
        windowSearchInput.focus();
    }

    function hideResultsWindow() {
        resultsWindow.classList.remove('visible');
        isWindowVisible = false;
    }

    function toggleResultsWindow() {
        if (!isWindowVisible) {
            if (!isDataLoaded) {
                showStatusMessage("Cargando FAQs...");
                showResultsWindow();
                return;
            }
            displayAllFAQs();
            showResultsWindow();
        } else {
            hideResultsWindow();
        }
    }

    function openImageModal(src) {
        modalContent.src = src;
        imageModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeImageModal() {
        imageModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // --- Creación de elementos DOM ---
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Contenedor principal con solo el botón de lupa
    const container = document.createElement('div');
    container.className = 'floating-search-container';

    const searchButton = document.createElement('button');
    searchButton.className = 'floating-search-button';
    searchButton.innerHTML = '&#x1F50D;';
    searchButton.disabled = true;
    searchButton.title = 'Abrir buscador de FAQs';

    // Ventana de resultados con barra de búsqueda integrada
    const resultsWindow = document.createElement('div');
    resultsWindow.className = 'search-results-window';

    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'search-results-header';

    const resultsTitle = document.createElement('div');
    resultsTitle.className = 'search-results-title';
    resultsTitle.textContent = 'Base de Conocimiento';

    const closeButton = document.createElement('button');
    closeButton.className = 'window-control';
    closeButton.innerHTML = '&times;';
    closeButton.title = 'Cerrar ventana';

    // Barra de búsqueda dentro de la ventana
    const searchContainer = document.createElement('div');
    searchContainer.className = 'window-search-container';

    const windowSearchInput = document.createElement('input');
    windowSearchInput.className = 'window-search-input';
    windowSearchInput.type = 'text';
    windowSearchInput.placeholder = 'Buscar en las FAQs...';

    const resultsContent = document.createElement('div');
    resultsContent.className = 'search-results-content';

    // Modal para imágenes
    const imageModal = document.createElement('div');
    imageModal.className = 'image-modal';

    const modalClose = document.createElement('span');
    modalClose.className = 'image-modal-close';
    modalClose.innerHTML = '&times;';

    const modalContent = document.createElement('img');
    modalContent.className = 'image-modal-content';

    // --- Ensamblaje del DOM ---
    resultsHeader.append(resultsTitle, closeButton);
    searchContainer.appendChild(windowSearchInput);
    resultsWindow.append(resultsHeader, searchContainer, resultsContent);
    container.appendChild(searchButton);
    imageModal.append(modalClose, modalContent);
    document.body.append(container, resultsWindow, imageModal);

    // --- Event listeners ---
    searchButton.addEventListener('click', toggleResultsWindow);

    windowSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            displayAllFAQs(windowSearchInput.value.trim());
        }, 300);
    });

    closeButton.addEventListener('click', hideResultsWindow);
    modalClose.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', e => e.target === imageModal && closeImageModal());

    resultsHeader.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        isDragging = true;
        const rect = resultsWindow.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        resultsHeader.style.cursor = 'grabbing';
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        resultsWindow.style.left = `${e.clientX - dragOffsetX}px`;
        resultsWindow.style.top = `${e.clientY - dragOffsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        resultsHeader.style.cursor = 'move';
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (imageModal.style.display === 'flex') closeImageModal();
            else if (isWindowVisible) hideResultsWindow();
        }
    });

    document.addEventListener('click', e => {
        if (isWindowVisible && !resultsWindow.contains(e.target) && !container.contains(e.target)) {
            hideResultsWindow();
        }
    });

    // --- Inicialización ---
    loadFaqData();
})();
