// ==UserScript==
// @name         Enhanced Search Bar v3.3
// @namespace    http://tampermonkey.net/
// @version      3.3
// @description  Search icon that opens a floating window with integrated search bar (improved version)
// @author
// @match        https://cyborg.deckard.com/listing/*STR*
// ==/UserScript==

(function() {
    'use strict';

    // --- Global variables ---
    let faqData = [];
    let isDragging = false;
    let dragOffsetX, dragOffsetY;
    let searchTimeout;
    let isWindowVisible = false;
    let isDataLoaded = false;
    const STORAGE_KEY = 'faqDataCache';
    const CACHE_TIMESTAMP_KEY = 'faqDataTimestamp';

    // --- Optimized CSS styles ---
    const styles = `
        .floating-search-container {
            position: fixed;
            bottom: 60px;
            left: 11px;
            z-index: 8000;
            font-family: 'Segoe UI', Roboto, sans-serif;
            transition: all 0.3s ease;
        }

        .floating-search-button {
            background: #6fb833;
            border: none;
            color: white;
            cursor: pointer;
            padding: 12px;
            font-size: 20px;
            border-radius: 25%;
            width: 34px;
            height: 34px;
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
    `;

    // --- Main functions ---
    async function loadFaqData() {
        try {
            // Try to load from localStorage first
            const cachedData = localStorage.getItem(STORAGE_KEY);
            const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

            if (cachedData && cachedTimestamp) {
                faqData = JSON.parse(cachedData);
                isDataLoaded = true;
                searchButton.disabled = false;
                console.log("Loaded FAQ data from cache");
            }

            // Always fetch fresh data but only update if different
            const response = await fetch('https://dinfcs.github.io/Deckardaov/DeckardScripts/FAQ/faqs.json');
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

            const freshData = await response.json();
            const freshDataString = JSON.stringify(freshData);

            if (!cachedData || freshDataString !== cachedData) {
                faqData = Array.isArray(freshData) ? freshData :
                         freshData?.preguntasFrecuentes ? freshData.preguntasFrecuentes :
                         freshData?.FAQ ? freshData.FAQ : [];

                localStorage.setItem(STORAGE_KEY, freshDataString);
                localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now());
                console.log("Updated FAQ data from server");
            }

            isDataLoaded = true;
            searchButton.disabled = false;
        } catch (error) {
            console.error('Error loading FAQs:', error);
            showStatusMessage('Failed to load FAQs. Please try again later.', true);

            if (!isDataLoaded && faqData.length === 0) {
                showStatusMessage('Using cached data (offline mode)', false);
            }
        }
    }

    function displayAllFAQs(searchTerm = '') {
        resultsContent.innerHTML = '';

        if (!faqData.length) {
            return showStatusMessage('No FAQ data available.');
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
            showStatusMessage('No results found for your search.');
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

        const textNodes = [];
        tempDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                textNodes.push(highlightText(node.textContent, searchTerm));
            } else if (node.nodeType === Node.ELEMENT_NODE) {
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
        console.log("Showing results window");
        resultsWindow.classList.add('visible');
        isWindowVisible = true;
        windowSearchInput.focus();

        // Position window near the button if not already positioned
        if (!resultsWindow.style.left && !resultsWindow.style.top) {
            const buttonRect = searchButton.getBoundingClientRect();
            resultsWindow.style.left = '28%';// Distancia desde la izquierda
            resultsWindow.style.top = '6%';// Distancia desde arriba
        }
    }

    function hideResultsWindow() {
        resultsWindow.classList.remove('visible');
        isWindowVisible = false;
    }

    function toggleResultsWindow() {
        if (!isWindowVisible) {
            if (!isDataLoaded) {
                showStatusMessage("Loading FAQs...");
                showResultsWindow();
                return;
            }

            // Restore previous search if any
            const previousSearch = windowSearchInput.value.trim();
            if (previousSearch) {
                displayAllFAQs(previousSearch);
            } else {
                displayAllFAQs();
            }

            showResultsWindow();
        } else {
            // Just bring to front if already visible
            resultsWindow.style.zIndex = '8000';
        }
    }

    // --- DOM element creation ---
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Main container with search button
    const container = document.createElement('div');
    container.className = 'floating-search-container';

    const searchButton = document.createElement('button');
    searchButton.className = 'floating-search-button';
    searchButton.innerHTML = '&#x1F50D;';
    searchButton.disabled = true;
    searchButton.title = 'Open FAQ search';

    // Results window with integrated search bar
    const resultsWindow = document.createElement('div');
    resultsWindow.className = 'search-results-window';

    const resultsHeader = document.createElement('div');
    resultsHeader.className = 'search-results-header';

    const resultsTitle = document.createElement('div');
    resultsTitle.className = 'search-results-title';
    resultsTitle.textContent = 'Knowledge Base';

    const closeButton = document.createElement('button');
    closeButton.className = 'window-control';
    closeButton.innerHTML = '&times;';
    closeButton.title = 'Close window';

    // Search bar inside window
    const searchContainer = document.createElement('div');
    searchContainer.className = 'window-search-container';

    const windowSearchInput = document.createElement('input');
    windowSearchInput.className = 'window-search-input';
    windowSearchInput.type = 'text';
    windowSearchInput.placeholder = 'Search in FAQs...';

    const resultsContent = document.createElement('div');
    resultsContent.className = 'search-results-content';

    // --- DOM assembly ---
    resultsHeader.append(resultsTitle, closeButton);
    searchContainer.appendChild(windowSearchInput);
    resultsWindow.append(resultsHeader, searchContainer, resultsContent);
    container.appendChild(searchButton);
    document.body.append(container, resultsWindow);

    // --- Event listeners ---
    searchButton.addEventListener('click', toggleResultsWindow);

    windowSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            displayAllFAQs(windowSearchInput.value.trim());
        }, 300);
    });

    closeButton.addEventListener('click', hideResultsWindow);

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
        resultsWindow.style.transform = 'none'; // Remove any previous transform
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        resultsHeader.style.cursor = 'move';
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isWindowVisible) {
            hideResultsWindow();
        }
    });

    // --- Initialization ---
    loadFaqData();
})();
