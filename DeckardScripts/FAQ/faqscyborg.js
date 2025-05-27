// ==UserScript==
// @name         Enhanced Search Bar v3.6
// @namespace    http://tampermonkey.net/
// @version      3.6
// @description  Search icon with floating window and optimized cache management for large datasets
// @author       Your Name
// @match        https://cyborg.deckard.com/listing/*STR*
// @require      https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js
// @grant        none
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
    const ESSENTIAL_DATA_KEY = 'faqEssentialData';
    const DB_NAME = 'FAQDatabase';
    const DB_VERSION = 1;
    const STORE_NAME = 'faqs';

    // --- Optimized CSS styles ---
    const styles = `
        .floating-search-container {
            position: fixed;
            bottom: 49px;
            left: 11px;
            z-index: 8000;
            font-family: 'Segoe UI', Roboto, sans-serif;
            transition: all 0.3s ease;
        }

        .floating-search-button {
            background: #D1E231;
            border: none;
            color: white;
            cursor: pointer;
            padding: 12px;
            font-size: 20px;
            border-radius: 25%;
            width: 28px;
            height: 28px;
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
            margin-bottom: 0;
        }
        .faq-answer p {
            margin: 0em 0;
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

        .loading-container {
            position: relative;
            height: 4px;
            background: #f0f0f0;
            display: none;
        }

        .loading-bar {
            position: absolute;
            height: 100%;
            width: 0;
            background: linear-gradient(90deg, #D1E231, #007bff);
            transition: width 0.3s ease;
        }

        .loading-text {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 11px;
            color: #6c757d;
        }

        .pagination-controls {
            display: flex;
            justify-content: center;
            padding: 10px;
            background: #f8f9fa;
            border-top: 1px solid #e9ecef;
        }

        .pagination-button {
            margin: 0 5px;
            padding: 5px 10px;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            border-radius: 4px;
        }

        .pagination-button:hover {
            background: #eee;
        }

        .pagination-button:disabled {
            background: #f8f9fa;
            cursor: not-allowed;
            opacity: 0.6;
        }
    `;

    // --- IndexedDB Functions ---
    function openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    async function saveToIndexedDB(data) {
        try {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                store.put({
                    id: 'fullData',
                    data: data,
                    timestamp: Date.now(),
                    compressed: false
                });

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            });
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
            throw error;
        }
    }

    async function readFromIndexedDB() {
        try {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.get('fullData');

                request.onsuccess = () => resolve(request.result?.data);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error reading from IndexedDB:', error);
            return null;
        }
    }

    async function clearIndexedDBCache() {
        try {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
            throw error;
        }
    }

    // --- Data Processing Functions ---
    function getEssentialData(fullData) {
        if (!Array.isArray(fullData)) return [];

        return fullData.map(item => ({
            id: item.id || Math.random().toString(36).substring(2, 9),
            question: item.question || '',
            answerPreview: item.answer
                ? (item.answer.substring(0, 200) + (item.answer.length > 200 ? '...' : ''))
                : '',
            category: item.category || '',
            tags: item.tags || []
        }));
    }

    function processFullAnswer(answer, searchTerm = '') {
        if (!answer) return '';

        // Simple sanitization and processing
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = answer;

        // Process images
        const images = tempDiv.querySelectorAll('img');
        images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.loading = 'lazy';
        });

        // Highlight search terms if present
        if (searchTerm.trim()) {
            const textNodes = [];
            const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);

            let node;
            while (node = walker.nextNode()) {
                if (node.nodeValue.trim()) {
                    const highlighted = highlightText(node.nodeValue, searchTerm);
                    const span = document.createElement('span');
                    span.innerHTML = highlighted;
                    node.parentNode.replaceChild(span, node);
                }
            }
        }

        return tempDiv.innerHTML;
    }

    // --- Main Functions ---
    async function loadFaqData() {
        try {
            // Create loading indicator
            const loadingContainer = document.createElement('div');
            loadingContainer.className = 'loading-container';
            const loadingBar = document.createElement('div');
            loadingBar.className = 'loading-bar';
            const loadingText = document.createElement('div');
            loadingText.className = 'loading-text';
            loadingText.textContent = 'Updating data...';

            loadingContainer.appendChild(loadingBar);
            loadingContainer.appendChild(loadingText);
            resultsWindow.appendChild(loadingContainer);

            // Show loading indicator
            loadingContainer.style.display = 'block';
            loadingBar.style.width = '10%';

            // 1. Try to load essential data from localStorage for quick display
            const cachedEssential = localStorage.getItem(ESSENTIAL_DATA_KEY);
            if (cachedEssential) {
                const essentialData = JSON.parse(cachedEssential);
                if (essentialData.length) {
                    faqData = essentialData;
                    isDataLoaded = true;
                    searchButton.disabled = false;
                    loadingBar.style.width = '30%';
                    displayAllFAQs(); // Show essential data immediately
                }
            }

            // 2. Try to load full data from IndexedDB
            const indexedDBData = await readFromIndexedDB();
            if (indexedDBData && Array.isArray(indexedDBData) && indexedDBData.length) {
                faqData = indexedDBData;
                isDataLoaded = true;
                searchButton.disabled = false;
                loadingBar.style.width = '50%';

                // Update essential data in localStorage
                const essentialData = getEssentialData(indexedDBData);
                localStorage.setItem(ESSENTIAL_DATA_KEY, JSON.stringify(essentialData));

                displayAllFAQs(); // Update with full data
            }

            // 3. Always fetch fresh data
            try {
                loadingBar.style.width = '60%';
                const response = await fetch('https://script.google.com/a/macros/deckard.com/s/AKfycbwTWV21oVCGJqeOtDNgJ_14XH89wjqrP0M7kEqfo3aGNjnQqaCJRio0F1VG9JdhHUYz/exec?endpoint=json');

                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

                loadingBar.style.width = '75%';
                const freshData = await response.json();

                // Process the fresh data
                const processedData = Array.isArray(freshData) ? freshData :
                                   freshData?.preguntasFrecuentes ? freshData.preguntasFrecuentes :
                                   freshData?.FAQ ? freshData.FAQ : [];

                // Save to IndexedDB
                loadingBar.style.width = '85%';
                await saveToIndexedDB(processedData);

                // Update local variables
                faqData = processedData;
                isDataLoaded = true;

                // Update essential data in localStorage
                const essentialData = getEssentialData(processedData);
                localStorage.setItem(ESSENTIAL_DATA_KEY, JSON.stringify(essentialData));

                loadingBar.style.width = '95%';
                displayAllFAQs(); // Update with fresh data

            } catch (fetchError) {
                console.error('Fetch error:', fetchError);
                if (!faqData.length) {
                    showStatusMessage('Using cached data (offline mode)');
                }
            }

            isDataLoaded = true;
            searchButton.disabled = false;
            loadingBar.style.width = '100%';

            // Hide loading indicator after a short delay
            setTimeout(() => {
                loadingContainer.style.display = 'none';
            }, 500);

        } catch (error) {
            console.error('Error loading FAQs:', error);
            showStatusMessage('Failed to load FAQs. Using cached data if available.', true);

            // Hide loading indicator on error
            const loadingContainer = resultsWindow.querySelector('.loading-container');
            if (loadingContainer) {
                loadingContainer.style.display = 'none';
            }

            if (faqData.length) {
                displayAllFAQs(); // Show whatever data we have
            }
        }
    }

    function clearCache() {
        // Clear all storage
        Promise.all([
            clearIndexedDBCache(),
            new Promise((resolve) => {
                localStorage.removeItem(ESSENTIAL_DATA_KEY);
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(CACHE_TIMESTAMP_KEY);
                resolve();
            })
        ]).then(() => {
            faqData = [];
            isDataLoaded = false;
            showStatusMessage('Cache cleared. Reloading data...');
            loadFaqData();
        }).catch(error => {
            console.error('Error clearing cache:', error);
            showStatusMessage('Error clearing cache', true);
        });
    }

    function displayAllFAQs(searchTerm = '') {
        resultsContent.innerHTML = '';

        if (!faqData.length) {
            return showStatusMessage('No FAQ data available.');
        }

        const fragment = document.createDocumentFragment();
        let hasResults = false;

        // If we only have essential data, show a message
        const firstItem = faqData[0];
        if (!firstItem.answer && firstItem.answerPreview) {
            const message = document.createElement('div');
            message.className = 'status-message';
            message.innerHTML = `
                <p>Showing simplified results from cache. Full data is loading...</p>
                <button id="retryLoad" style="margin-top: 10px; padding: 5px 10px; background: #D1E231; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Retry Full Load
                </button>
            `;
            resultsContent.appendChild(message);

            document.getElementById('retryLoad')?.addEventListener('click', loadFaqData);
            return;
        }

        faqData.forEach(item => {
            if (!item?.question) return;

            if (searchTerm) {
                const lowerSearchTerm = searchTerm.toLowerCase();
                const questionMatch = item.question.toLowerCase().includes(lowerSearchTerm);
                const answerMatch = item.answer
                    ? item.answer.toLowerCase().includes(lowerSearchTerm)
                    : false;

                if (!questionMatch && !answerMatch) {
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

        if (item.answer) {
            answerElement.innerHTML = processFullAnswer(item.answer, searchTerm);
        } else if (item.answerPreview) {
            answerElement.innerHTML = highlightText(item.answerPreview, searchTerm);
            answerElement.style.color = '#888';
            answerElement.style.fontStyle = 'italic';
        }

        resultItem.appendChild(answerElement);

        return resultItem;
    }

    function highlightText(text, searchTerm) {
        if (!searchTerm?.trim() || !text) return text || '';
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
        resultsWindow.classList.add('visible');
        isWindowVisible = true;
        windowSearchInput.focus();

        if (!resultsWindow.style.left && !resultsWindow.style.top) {
            const buttonRect = searchButton.getBoundingClientRect();
            resultsWindow.style.left = '28%';
            resultsWindow.style.top = '6%';
        }
    }

    function hideResultsWindow() {
        resultsWindow.classList.remove('visible');
        isWindowVisible = false;
    }

    function toggleResultsWindow() {
        if (!isWindowVisible) {
            showResultsWindow();
            if (!isDataLoaded) {
                loadFaqData();
            } else {
                displayAllFAQs(windowSearchInput.value.trim());
            }
        } else {
            resultsWindow.style.zIndex = '8000';
        }
    }

    // --- DOM Setup ---
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

    const clearCacheButton = document.createElement('button');
    clearCacheButton.className = 'window-control';
    clearCacheButton.innerHTML = '🔄';
    clearCacheButton.title = 'Clear cache and reload';
    clearCacheButton.addEventListener('click', clearCache);

    // Search bar inside window
    const searchContainer = document.createElement('div');
    searchContainer.className = 'window-search-container';

    const windowSearchInput = document.createElement('input');
    windowSearchInput.className = 'window-search-input';
    windowSearchInput.type = 'text';
    windowSearchInput.placeholder = 'Search in FAQs...';

    const resultsContent = document.createElement('div');
    resultsContent.className = 'search-results-content';

    // --- DOM Assembly ---
    resultsHeader.append(resultsTitle, clearCacheButton, closeButton);
    searchContainer.appendChild(windowSearchInput);
    resultsWindow.append(resultsHeader, searchContainer, resultsContent);
    container.appendChild(searchButton);
    document.body.append(container, resultsWindow);

    // --- Event Listeners ---
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
        resultsWindow.style.transform = 'none';
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
