// ==UserScript==
// @name         Cyborg Dispute helper
// @version      4.8
// @description  Trigger de categorización movido al botón "Submit" nativo. Añade el campo "reply".
// @author       Luis Escalante (Modificado por Gemini)
// @match        https://cyborg.deckard.com/dispute/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURACIÓN ---
    const GOOGLE_APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwvwPxv__OMIg9aMSeQ0RCDBnmwf1wBaZ8EDn7pUcRNUzFGvfs9obcrJ3-8Tbq5FnSn/exec';
    let currentDisputeData = null;

    // --- FUNCIÓN PARA INYECTAR ESTILOS CSS ---
    function addGlobalStyle(css) {
        const head = document.head || document.getElementsByTagName('head')[0];
        if (!head) return;
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    }
    addGlobalStyle(`
        #dispute-card-container {
            position: fixed; bottom: 20px; right: 20px; background-color: white; border: 1px solid #ccc;
            border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); width: 850px;
            max-width: 90%; z-index: 10000; font-family: Arial, sans-serif;
            transition: transform 0.3s ease-out, opacity 0.3s ease-out; transform: translateY(20px); opacity: 0;
        }
        #dispute-card-container.visible { transform: translateY(0); opacity: 1; }
        #dispute-card-content { padding: 15px; }
        #dispute-card-container table { width: 100%; border-collapse: collapse; font-size: 14px; table-layout: fixed; }
        #dispute-card-container th, #dispute-card-container td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; word-wrap: break-word; }
        #dispute-card-container th { background-color: #ADD8E6; font-weight: bold; }
        #dispute-card-container textarea { width: 100%; box-sizing: border-box; height: 100px; border: 1px solid #ccc; border-radius: 4px; padding: 5px; font-size: 14px; resize: vertical; }
        #dispute-card-buttons { padding: 10px 15px; text-align: right; border-top: 1px solid #eee; background-color: #f9f9f9; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        #dispute-card-buttons button { padding: 8px 15px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px; font-weight: bold; }
        #copyBtn { background-color: #007bff; color: white; }
        #closeDisputeCardBtn { background-color: #6c757d; color: white; }
        #categorization-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; border-radius: 8px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); z-index: 10002; padding: 25px; width: 400px; font-family: Arial, sans-serif; }
        #categorization-modal h3 { margin-top: 0; }
        #categorization-modal select { width: 100%; padding: 10px; margin-top: 10px; border-radius: 5px; border: 1px solid #ccc; font-size: 16px; }
        #categorization-modal .buttons { text-align: right; margin-top: 20px; }
        #categorization-modal button { padding: 10px 18px; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px; font-weight: bold; }
        #sendCategoryBtn { background-color: #28a745; color: white; }
        #cancelCategoryBtn { background-color: #6c757d; color: white; }
        #general-notification { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); color: white; padding: 10px 20px; border-radius: 5px; z-index: 10001; opacity: 0; transition: opacity 0.3s, bottom 0.3s; }
    `);

    // --- FUNCIONES COMPLETAS ---

    function showNotification(message, type = 'success') {
        const n = document.createElement('div');
        n.id = 'general-notification'; n.innerText = message;
        n.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
        document.body.appendChild(n);
        setTimeout(() => { n.style.opacity = '1'; n.style.bottom = '50px'; }, 10);
        setTimeout(() => { n.style.opacity = '0'; n.style.bottom = '30px'; setTimeout(() => n.remove(), 300); }, 3000);
    }

    function showDisputeCard(data) {
        const existingCard = document.getElementById('dispute-card-container');
        if (existingCard) existingCard.remove();
        const card = document.createElement('div');
        card.id = 'dispute-card-container';
        card.dataset.deckardId = data.deckard_id;
        card.innerHTML = `
            <div id="dispute-card-content">
                <table id="disputeCardTable">
                    <thead><tr><th colspan="2">Property Information</th><th>Dispute - Client Comment</th></tr></thead>
                    <tbody>
                        <tr><td>Site Address</td><td>${data.disputed_site_address}</td><td rowspan="3"><i>"${data.dispute_comments}"</i></td></tr>
                        <tr><td>APN</td><td>${data.disputed_apn}</td></tr>
                        <tr><td>Rentalscape Link</td><td><a href="${data.rentalscape_link}" target="_blank">${data.rentalscape_link}</a></td></tr>
                        <tr><th colspan="3">Dispute Answer</th></tr>
                        <tr><td colspan="3"><textarea id="disputeAnswerText" placeholder="Write your answer here or in the main comments box..."></textarea></td></tr>
                    </tbody>
                </table>
            </div>
            <div id="dispute-card-buttons"><button id="copyBtn">Copy</button><button id="closeDisputeCardBtn">Close</button></div>`;
        document.body.appendChild(card);
        setTimeout(() => card.classList.add('visible'), 10);
        document.getElementById('closeDisputeCardBtn').addEventListener('click', () => card.remove());
        document.getElementById('copyBtn').addEventListener('click', copyTableToClipboard);
    }

    function copyTableToClipboard() {
        if (!currentDisputeData) { showNotification("No data loaded to copy", "error"); return; }
        const data = currentDisputeData;
        const answerText = document.getElementById('disputeAnswerText') ? document.getElementById('disputeAnswerText').value : '';
        const tableHtml = `<table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11pt; border: 1px solid black;"><colgroup><col style="width: 15%;"><col style="width: 45%;"><col style="width: 40%;"></colgroup><thead><tr><th colspan="2" style="border: 1px solid #000; padding: 8px; background-color: #ADD8E6;">Property Information</th><th style="border: 1px solid #000; padding: 8px; background-color: #ADD8E6;">Dispute - Client Comment</th></tr></thead><tbody><tr><td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Site Address</td><td style="border: 1px solid #000; padding: 8px;">${data.disputed_site_address}</td><td style="border: 1px solid #000; padding: 8px; vertical-align: top;" rowspan="3"><i>"${data.dispute_comments}"</i></td></tr><tr><td style="border: 1px solid #000; padding: 8px; font-weight: bold;">APN</td><td style="border: 1px solid #000; padding: 8px;">${data.disputed_apn}</td></tr><tr><td style="border: 1px solid #000; padding: 8px; font-weight: bold;">Rentalscape Link</td><td style="border: 1px solid #000; padding: 8px;"><a href="${data.rentalscape_link}">${data.rentalscape_link}</a></td></tr><tr><th colspan="3" style="border: 1px solid #000; padding: 8px; background-color: #ADD8E6;">Dispute Answer</th></tr><tr><td colspan="3" style="border: 1px solid #000; padding: 8px; min-height: 100px;">${answerText.replace(/\n/g, '<br>')}</td></tr></tbody></table>`;
        const blob = new Blob([tableHtml], { type: 'text/html' });
        navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(() => showNotification('Copied to clipboard!', 'success'));
    }

    function showCategorizationModal() {
        if (!currentDisputeData) { showNotification('Error: No dispute data loaded.', 'error'); return; }
        const existingModal = document.getElementById('categorization-modal');
        if (existingModal) existingModal.remove();
        const modal = document.createElement('div');
        modal.id = 'categorization-modal';
        modal.innerHTML = `
            <h3>Categorized by these items:</h3>
            <select id="disputeCategorySelect">
                <option value="Address/APN Correction">Address/APN Correction</option>
                <option value="License issue">License issue</option>
                <option value="Client Suggestion">Client Suggestion</option>
                <option value="Bug">Bug</option>
            </select>
            <div class="buttons">
                <button id="cancelCategoryBtn">Cancel</button>
                <button id="sendCategoryBtn">Send</button>
            </div>`;
        document.body.appendChild(modal);
        document.getElementById('sendCategoryBtn').addEventListener('click', sendDataToGoogleSheet);
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => modal.remove());
    }

    function getDataLeadName() {
        const nameSpan = document.querySelector('span.text-gray-700');
        if (nameSpan) {
            return nameSpan.innerText.trim();
        } else {
            console.warn("Could not find the user name span element.");
            return 'N/A';
        }
    }

    async function sendDataToGoogleSheet() {
        if (!currentDisputeData) { showNotification('Error: No dispute data to send.', 'error'); return; }
        const modal = document.getElementById('categorization-modal');
        const sendButton = document.getElementById('sendCategoryBtn');
        sendButton.textContent = 'Sending...';
        sendButton.disabled = true;

        const dataLeadName = getDataLeadName();

        const payload = {
            date: new Date().toLocaleDateString('en-CA'),
            category: document.getElementById('disputeCategorySelect').value,
            rentalscapeLink: currentDisputeData.rentalscape_link,
            deckardId: currentDisputeData.deckard_id,
            dataLead: dataLeadName,
            reply: currentDisputeData.reply || 'N/A'
        };

        try {
            await fetch(GOOGLE_APP_SCRIPT_URL, {
                method: 'POST', mode: 'no-cors', cache: 'no-cache',
                headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            showNotification('Data sent successfully!', 'success');
            if(modal) modal.remove();
        } catch (error) {
            console.error('Network error sending data:', error);
            showNotification('Network Error. See console.', 'error');
        } finally {
             if(sendButton) { sendButton.textContent = 'Send'; sendButton.disabled = false; }
        }
    }

    function getDataFromTableRow(row) {
        if (!row) return null;
        try {
            const deckardId = row.querySelector('td[data-col-id="deckard_id"]')?.innerText.trim() || 'N/A';
            const disputedApn = row.querySelector('td[data-col-id="disputed_apn"]')?.innerText.trim() || 'N/A';
            const disputedSiteAddress = row.querySelector('td[data-col-id="disputed_site_address_disputed"]')?.innerText.trim() || 'N/A';
            const disputeComments = row.querySelector('td[data-col-id="dispute_comments"]')?.innerText.trim() || 'N/A';
            const pathname = window.location.pathname; const pathParts = pathname.split('/');
            let rentalscapeLink = '#';
            if (pathParts.length >= 4 && pathParts[1] === 'dispute' && disputedApn !== 'N/A') {
                const state = pathParts[2]; const county = pathParts[3];
                const jurisdictionPath = pathParts.slice(2).join('/').toLowerCase().replace(/\//g, '-');
                const apnIdentifier = `APN-${state.toUpperCase()}-${county.toUpperCase()}-${disputedApn}`;
                rentalscapeLink = `https://rentalscape.deckard.technology/${jurisdictionPath}/list/${apnIdentifier}/overview`;
            }
            return { deckard_id: deckardId, rentalscape_link: rentalscapeLink, disputed_apn: disputedApn, disputed_site_address: disputedSiteAddress, dispute_comments: disputeComments };
        } catch (e) {
            console.error("Error al extraer datos de la fila:", e);
            showNotification("Error getting data from row. See console.", "error");
            return null;
        }
    }


    // --- LÓGICA DE INICIALIZACIÓN ---
    function initialize() {
        console.log("Cyborg Dispute Helper 4.8 Initializing...");

        document.body.addEventListener('click', function(event) {
            const target = event.target;
            // Solo nos interesan los clics en botones
            if (!(target instanceof HTMLButtonElement)) return;

            // Lógica para el botón "Resolve" en la tabla
            if (target.innerText.trim() === 'Resolve') {
                const row = target.closest('tr');
                const data = getDataFromTableRow(row);
                if (data) {
                    currentDisputeData = data; // Guardamos los datos de la fila
                    showDisputeCard(data);     // Mostramos la tarjeta de ayuda de Jira
                }
            }
            // Lógica para el botón azul "Submit" del pop-up nativo
            else if (target.matches('button.bg-blue-600') && target.innerText.trim() === 'Submit') {
                 if (!currentDisputeData) {
                     showNotification("Error: No dispute selected. Please click 'Resolve' first.", "error");
                     return;
                 }

                 // No prevenimos la acción por defecto para que la página procese su pop-up,
                 // pero sí detenemos la propagación para evitar conflictos.
                 event.stopPropagation();

                 const popup = target.closest('.resolution_popup');
                 if (popup) {
                    const checkedRadio = popup.querySelector('input[name="outcome"]:checked');
                    // Obtenemos el texto del label asociado al radio button seleccionado
                    const replyText = checkedRadio ? checkedRadio.nextElementSibling.innerText.trim() : 'No selection';

                    // Añadimos el nuevo dato a nuestro objeto
                    currentDisputeData.reply = replyText;

                    console.log("Submitting with reply:", replyText);

                    // Cerramos nuestra tarjeta de ayuda si está visible
                    const jiraHelperCard = document.getElementById('dispute-card-container');
                    if (jiraHelperCard) jiraHelperCard.remove();

                    // Esperamos un momento antes de mostrar nuestro modal de categorización.
                    setTimeout(showCategorizationModal, 150);
                 }
            }
        }, true); // Usar "true" para la captura de eventos, es más fiable.
    }

    // Inicia el script cuando la ventana se ha cargado completamente.
    window.addEventListener('load', initialize);

})();
