// ==UserScript==
// @name         Iframe qa
// @namespace    
// @version      2.7
// @description  Añade botones para abrir iframes en la parte inferior izquierda de la página, con funcionalidad personalizada y botones de cierre para cada iframe en la parte inferior izquierda que desaparecen al cerrarse cualquier iframe.
// @author       Luis Escalante
// @match        *://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Identificador del contenedor de botones
    const buttonContainerId = 'iframe-button-container';

    // Crea el contenedor de botones en la parte inferior izquierda
    function createButtonContainer() {
        if (document.getElementById(buttonContainerId)) return;

        const container = document.createElement('div');
        container.id = buttonContainerId;
        container.style.position = 'fixed';
        container.style.bottom = '10px';
        container.style.left = '50px';
        container.style.backgroundColor = '#f1f1f1';
        container.style.display = 'none'; // Empieza oculto
        container.style.gap = '5px';
        container.style.padding = '8px';
        container.style.zIndex = '9999';
        container.style.borderRadius = '5px';
        container.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';

        // Botones en el orden especificado

             const buttons = [
            { text: 'QA', url: 'https://www.appsheet.com/start/f9378e0d-cef0-48b9-bd15-618bac8a35a4?platform=desktop#vss=H4sIAAAAAAAAA6WOywrCMBBFf0XuOl-QnYgLEQUfuDEuYjOFYJuUJlVLyL879blWl3OHc-5NOFu6bKIuTpD79Lnm1EMiKWz7hhSkwsS72PpKQSgsdf0IV-PRmhrfRoWMfBAvQaQAmb7k5Z_9AtaQi7a01A6yAWXJE-T3gHHwhpAF6i7qY0X3zQzlzFnpiy6Q2fGYX0aEmZteG-3Mwht2lroKlG_kad0ragEAAA==&view=QA%20Report&appName=RandomQAReport-985429461-24-11-28', color: '#8e44ad', openMultiple: true },
            { text: 'FG', url: 'https://dinfcs.github.io/Deckardaov/Feedback%20Gerenator/', color: '#17a2b8' },
            { text: 'Parcel-S', url: 'https://dinfcs.github.io/Deckardaov/ParcelSearch/index.html', color: '#6c757d' },
            { text: 'AO', url: 'https://dinfcs.github.io/Deckardaov/', color: '#6c757d' },
            { text: 'Adv-Filter', url: 'https://dinfcs.github.io/Deckardaov/FilterGeneratorv2/index.html', color: '#6c757d' },
            { text: 'Accounts', url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbziAFj6j4YU0oDpCIVc0EQfcYjx5RG-RtXZPLbA43eAaA91SpQ2ZDf7rJFVESnBCVk9/exec',color: '#75a2c9', openInNewTab: true },
            { text: 'Regrid', url: 'https://app.regrid.com/', color: '#28a745', openInNewTab: true },
            { text: 'Predit', url: 'https://script.google.com/a/macros/deckard.com/s/AKfycbx3yRYrh8o8giGHQsNHgfshZJgdDq6-Uxi1_H4wd03v6pWgvly2hXjoiQxcGGL8DRt2CQ/exec', color: '#75a2c9', openInNewTab: true }
        ];
        buttons.forEach(({ text, url, color, openInNewTab, openMultiple }) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.onclick = () => {
                if (openInNewTab) {
                    window.open(url, '_blank');
                } else if (openMultiple) {
                    window.open(url, '_blank');
                    window.open('https://www.appsheet.com/start/0e4a5be2-014b-4c32-a963-9cced65a14e5?platform=desktop#vss=H4sIAAAAAAAAA6WQwU7DMBBEfwXt2UVJWqjwDSgghABBIw7UPZh4AxGJbdkOUEX-d9ahCA5cgJs9njee3QFeGnxdBlk9A18NX7cL3ACHQUC5sSiACzg2OjjTCmACrmT3Id4c7thWat3oRwER4pp9RgT0wIdfJ_B_d2DQKNShqRt0KS7BFLNF6TmBJHzDIDLo-iAfWhybJ2zr_8HM4NaYQGItfSgTRNJCBklsZ0kvsmI2yfNJsVdmOc_3eTbdzWbzg_k0vyfrmTO9PaLRVrStpXFhPKcf277TxJ9i9STJeO1UGgEW6CvUaiy6jpHK1qbqPao72tTfNuTP9cmblVpdGkXz1bL1GN8Beq_D3g0CAAA=&view=QA%20planning&appName=QAProductivity-985429461-24-10-30', '_blank');
                } else {
                    toggleIframe(url, `${text.toLowerCase()}-iframe`, text === 'LB' ? 95 : 50);
                }
            };
            button.style.padding = '5px 8px';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = color;
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.fontWeight = 'bold';
            button.style.fontSize = '12px';  // Tamaño de letra más pequeño
            container.appendChild(button);
        });

        document.body.appendChild(container);
        createToggleButton();
    }

    // === Funciones para manejar iframes ===

    function hideAllIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.style.width = '0%';
        });
        hideCloseButton();
    }

    function toggleIframe(url, iframeId, widthPercentage, backgroundColor = 'White') {
        const iframe = document.getElementById(iframeId);

        if (iframe) {
            if (iframe.style.width === `${widthPercentage}%`) {
                iframe.style.width = '0%';
                hideCloseButton();
            } else {
                hideAllIframes();
                iframe.style.width = `${widthPercentage}%`;
                showCloseButton(iframeId);
            }
            return;
        }

        const newIframe = document.createElement('iframe');
        newIframe.src = url;
        newIframe.style.position = 'fixed';
        newIframe.style.top = '0';
        newIframe.style.right = '0';
        newIframe.style.width = '0';
        newIframe.style.height = '100%';
        newIframe.style.border = 'none';
        newIframe.style.zIndex = '9998';
        newIframe.style.transition = 'width 0.3s ease';
        newIframe.style.backgroundColor = backgroundColor;
        newIframe.id = iframeId;
        newIframe.setAttribute('allow', 'clipboard-write');

        document.body.appendChild(newIframe);
        setTimeout(() => newIframe.style.width = `${widthPercentage}%`, 10);
        showCloseButton(iframeId);
    }

    function showCloseButton(iframeId) {
        let closeButton = document.getElementById('iframe-close-button');

        if (!closeButton) {
            closeButton = document.createElement('button');
            closeButton.id = 'iframe-close-button';
            closeButton.textContent = 'Cerrar';
            closeButton.style.position = 'fixed';
            closeButton.style.top = '20px';
            closeButton.style.right = '20px';
            closeButton.style.zIndex = '9999';
            closeButton.style.padding = '10px 20px';
            closeButton.style.cursor = 'pointer';
            closeButton.style.backgroundColor = 'red';
            closeButton.style.color = 'white';
            closeButton.style.border = 'none';
            closeButton.style.borderRadius = '8px';
            closeButton.style.fontSize = '16px';
            closeButton.onclick = hideAllIframes;

            document.body.appendChild(closeButton);
        }

        closeButton.style.display = 'block';
    }

    function hideCloseButton() {
        const closeButton = document.getElementById('iframe-close-button');
        if (closeButton) {
            closeButton.style.display = 'none';
        }
    }

    function createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-button';
        toggleButton.textContent = '➤';
        toggleButton.style.position = 'fixed';
        toggleButton.style.bottom = '13px';
        toggleButton.style.left = '10px';
        toggleButton.style.zIndex = '9999';
        toggleButton.style.padding = '8px 10px';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.backgroundColor = '#0096d2';
        toggleButton.style.color = 'white';
        toggleButton.style.border = 'none';
        toggleButton.style.borderRadius = '5px';

        let hideTimeout;

        toggleButton.onclick = () => {
            const container = document.getElementById(buttonContainerId);

            if (container.style.display === 'none') {
                container.style.display = 'flex';
                toggleButton.textContent = '⮜';

                hideTimeout = setTimeout(() => {
                    container.style.display = 'none';
                    toggleButton.textContent = '➤';
                }, 30000);

            } else {
                container.style.display = 'none';
                toggleButton.textContent = '➤';
                clearTimeout(hideTimeout);
            }
        };

        document.body.appendChild(toggleButton);
    }

    createButtonContainer();
})();
