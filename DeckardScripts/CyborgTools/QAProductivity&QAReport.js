// ==UserScript==
// @name         QA Productivity & Random QA Report - Unified
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Combina funcionalidades de captura de datos QA con sistema unificado de notificaciones
// @match        https://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuración común
    const RANDOM_QA_URL = "https://script.google.com/macros/s/AKfycbzsaMYnVMK65UfAKsVg27_fqzzdALlYPwaBQeN-_nFUwSmLHG3GT14Kw5aif1AbC_5BrA/exec";
    const MINIONS = RANDOM_QA_URL + "?qaers";
    const CACHE_DATA = 'qaersData';
    const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hora

    // Patrones comunes para nombres de proyecto
    const PROJECT_NAME_PATTERNS = [
        { regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/, format: m => `AUS - ${m[2].replace(/_/g, ' ') === 'Bass Coast' ? m[2].replace(/_/g, ' ') : 'City of ' + capitalizeWords(m[2].replace(/_/g, ' '))}` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${capitalizeWords(m[4].replace(/_/g, ' '))}` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[2].replace(/_/g, ' '))} County` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[3].replace(/_/g, ' '))}` }
    ];

    // Funciones de utilidad comunes
    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function cleanText(text) {
        return text.toLowerCase().trim().replace(/\s+/g, " ");
    }

    function getProjectNameFromUrl() {
        const url = window.location.href;
        for (const { regex, format } of PROJECT_NAME_PATTERNS) {
            const match = url.match(regex);
            if (match) return format(match);
        }
        return "Unknown Project";
    }

    // Sistema de notificaciones unificado mejorado
    function showNotification(message = "Data Registered", type = "success") {
        const colorMap = {
            "success": "#D1E231", // Verde lima
            "error": "#6C757D",   // Gris
            "info": "#007BFF",    // Azul
            "warning": "#FFD700", // Amarillo
            "red": "#f44336",    // Rojo (compatibilidad)
            "green": "#4CAF50"    // Verde (compatibilidad)
        };

        // Mapear tipos antiguos a nuevos
        const mappedType = type === "red" ? "error" :
                         type === "green" ? "success" : type;

        const iconMap = {
            "error": "⚠️",
            "success": "✔️",
            "warning": "⚠️",
            "info": "ℹ️"
        };

        const textColor = (mappedType === "success" || mappedType === "warning") ? "#000000" : "#FFFFFF";
        const icon = iconMap[mappedType] || "";

        const notification = document.createElement("div");
        notification.innerHTML = icon ? `<span style="font-size: 24px; margin-right: 10px;">${icon}</span>${message}` : message;
        notification.style.position = "fixed";
        notification.style.top = "50%";
        notification.style.left = "50%";
        notification.style.transform = "translate(-50%, -50%)" + (icon ? " translateY(50px)" : "");
        notification.style.background = colorMap[type] || colorMap.success;
        notification.style.color = textColor;
        notification.style.padding = "12px 24px";
        notification.style.borderRadius = "8px";
        notification.style.fontSize = "16px";
        notification.style.fontWeight = "600";
        notification.style.fontFamily = "'Inter', 'Segoe UI', sans-serif";
        notification.style.zIndex = "9999";
        notification.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.15)";
        notification.style.minWidth = "200px";
        notification.style.textAlign = "center";
        notification.style.opacity = "0";
        notification.style.transition = "opacity 0.3s ease-in-out, transform 0.4s";
        notification.style.display = "flex";
        notification.style.alignItems = "center";
        notification.style.justifyContent = "center";

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = "1";
            if (icon) notification.style.transform = "translate(-50%, -50%)";
        }, 10);

        setTimeout(() => {
            notification.style.opacity = "0";
            if (icon) notification.style.transform = "translate(-50%, -50%) translateY(50px)";
            setTimeout(() => notification.remove(), 300);
        }, icon ? 2000 : 1500);
    }

    // Función para convertir fechas (para Random QA)
    function convertDate(isoFormat) {
        if (!isoFormat.match(/^\d{4}-\d{2}-\d{2}$/)) return "";
        const [year, month, day] = isoFormat.split("-");
        return `${day}/${month}/${year}`;
    }

    // Función para obtener el QAer de la página (para Random QA)
    function getQaerFromPage() {
        return document.querySelector('#user_id')?.innerText.trim() || "";
    }

    // Función para obtener el nombre corto del QAer (para Random QA)
    function getQaerNameShort() {
        const userIdElement = document.querySelector('#user_id');
        if (!userIdElement) return "Desconocido";

        const fullName = userIdElement.innerText.trim();
        const nameParts = fullName.split(" ");

        if (nameParts.length >= 3) {
            return `${nameParts[0]} ${nameParts[2]}`;
        } else {
            return fullName;
        }
    }

    // Función para crear el enlace de reporte (para Random QA)
    function createReportLink() {
        const link = document.createElement("a");
        link.innerText = "Report QA |";
        link.href = "#";
        link.style.cssText = `
            margin-left: 10px;
            margin-right: 10px;
            color: blue;
            cursor: pointer;
            text-decoration: none;
        `;
        link.onclick = extractRandomQaData;
        return link;
    }

    // Función para esperar a que aparezca la sección de usuario (para Random QA)
    function waitForUserSection() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                const userSection = document.getElementById("user_section");
                if (userSection) {
                    clearInterval(interval);
                    resolve(userSection);
                }
            }, 100);
        });
    }

    // Función para verificar minions (para Random QA)
    async function checkQaerAndShowLink() {
        const cachedData = localStorage.getItem(CACHE_DATA);
        const cachedTime = localStorage.getItem(CACHE_DATA + '_time');

        if (cachedData && cachedTime && (Date.now() - cachedTime) < CACHE_EXPIRATION_TIME) {
            processQaersData(JSON.parse(cachedData));
        } else {
            try {
                const response = await fetch(MINIONS);
                const data = await response.json();
                if (!data.qaers || !Array.isArray(data.qaers)) throw new Error("Invalid JSON format");

                localStorage.setItem(CACHE_DATA, JSON.stringify(data));
                localStorage.setItem(CACHE_DATA + '_time', Date.now().toString());
                processQaersData(data);
            } catch (error) {
                console.error("Error fetching Minions:", error);
                showNotification("Error fetching Minions", "error");
            }
        }

        function processQaersData(data) {
            const currentQaer = getQaerFromPage();
            if (data.qaers.includes(currentQaer)) {
                const userSection = document.getElementById("user_section");
                if (userSection) {
                    const existingLink = userSection.querySelector('a[onclick="extractRandomQaData"]');
                    if (!existingLink) {
                        const link = createReportLink();
                        userSection.insertBefore(link, userSection.firstChild);
                    }
                } else {
                    console.warn("User section not found.");
                }
            } else {
                console.warn(`QAer "${currentQaer}" not found in the list.`);
            }
        }
    }

    // Función para generar feedback (para Random QA)
    function generateFeedback(error, qaed, project, link, qaer, dynamicFields = {}) {
        const feedbackTemplates = {
            "Wrong APN": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que el APN no es correcto. Por favor, mis motivos son: ${dynamicFields.reasons || "(aquí van los motivos)"}. ¡Muchas Gracias! Att: ${qaer}`,
            "Bad APN": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. El APN registrado tiene un formato erróneo por lo que generó una Bad APN. Trata de verificar siempre en los PR para evitar este tipo de errores. ¡Muchas gracias! Att: ${qaer}`,
            "Missing MUS": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que falta información en el campo MUS. Aun cuando en important info estaba la instrucción, sé que son detalles que a veces se nos pasan y que estarás más pendiente de esto. ¡Gracias! Att: ${qaer}`,
            "Missing Address Override": `Saludos ${qaed}, espero que todo esté bien. Revisando Random QA, encontré <${link}|esta propiedad tuya> en ${project}. Noté que faltó hacerle Address Override. Asegúrate de agregarlo cuando sea necesario. ¡Muchas gracias! Att: ${qaer}`,
            "Missing Address Override in an NMF Listing (If required)": `¡Saludos ${qaed}!, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <${link}|esta propiedad tuya> en ${project}. Está muy bien identificada, sin embargo, olvidaste agregar el Address Override. Ten presente que si la propiedad es un condominio y se consigue fácilmente pero no consigues la unidad, debes dejar el NMF con el Unit # unk. ¡Muchas gracias! Att: ${qaer}`,
            "Wrong Address Override": `¡Hola ${qaed}! Espero que estés teniendo un buen día. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. La identificación fue precisa y la evidencia espectacular. Sin embargo, al revisarla, noté que el Address Override no es correcto. Por favor, en este caso sería: ${dynamicFields.correctAddress || "(aquí va el address correcto)"}. ¡Muchas Gracias! Att: ${qaer}`,
            "Do Not Clear Previous Address Override In An NMF Listing": `¡Saludos ${qaed}!, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <${link}|esta propiedad tuya> en ${project}. Noté que no eliminaste el Address Override anterior en un listing de NMF. Asegúrate de revisarlo y corregirlo. ¡Muchas gracias! Att: ${qaer}`,
            "QA Is Not Correct High": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad> en ${project} la cual marcaste con QAok. Noté que el QAok no es correcto. Mis motivos son: ${dynamicFields.reasons || "(aquí van los motivos)"}. ¡Gracias! Att: ${qaer}`,
            "QA Is Not Correct Low": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project} la cual marcaste con QAok. Noté que la QA no es correcta. Mis motivos son: ${dynamicFields.reasons || "(aquí van los motivos)"}. ¡Gracias! Att: ${qaer}`,
            "Unit Box (If visible)": `¡Saludos ${qaed}!, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <${link}|esta propiedad tuya> en ${project}. Noté que omitiste llenar el campo 'Unit Box'. En este caso era: ${dynamicFields.unitBox || "(aquí va el unit box)"}. Recuerda que este campo es importante para separar las Property Cards en RS. Este puede estar en las imágenes o en la descripción del listing. Tenlo presente para una próxima vez. ¡Muchas gracias! Att: ${qaer}`,
            "Wrong/ Not Required Unit Box": `¡Hola ${qaed}! Espero que estés teniendo un buen día. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Hiciste un buen trabajo identificando la propiedad, sin embargo, noté que dejaste ${dynamicFields.unitBox || "(aquí va el unit box)"} en el Unit Box cuando no era necesario. ¡Muchas Gracias! Att: ${qaer}`,
            "Property Manager Info (If required)": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que falta la información del Property Manager. Por favor, asegúrate de agregarla si es requerida. ¡Gracias! Att: ${qaer}`,
            "Rental Override": `Hola ${qaed}, espero que estés bien. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. ////////////////////////////////. ¡Gracias! Att: ${qaer}`,
            "Evidences": `Hola ${qaed}, espero que todo esté bien. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que faltan algunas evidencias necesarias. Por favor, asegúrate de incluir toda la información requerida. ¡Gracias! Att: ${qaer}`,
            "Verification Data": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que falta información en los datos de verificación. Por favor, siempre es bueno asegurarse de que toda la información sea correcta. ¡Gracias! Att: ${qaer}`,
            "Structure": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Verifiqué los registros y noté que la estructura asignada no es la correcta. En este caso la adecuada es ${dynamicFields.structure || "(aquí va la estructura correcta)"}. Te recomiendo revisarlo más a detalle. ¡Gracias! Att: ${qaer}`
        };

        return feedbackTemplates[error] || "Error. Please write the feedback manually and report the error to Luis Escalante";
    }

    // Función para mostrar la ventana de edición (para Random QA)
 function showEditWindow(data, onConfirm) {
    const errors = [
        "Wrong APN", "Bad APN", "Wrong Address Override", "Missing Address Override",
        "Missing Address Override in an NMF Listing (If required)", "Do Not Clear Previous Address Override In An NMF Listing",
        "Missing MUS", "Property Manager Info (If required)", "QA Is Not Correct High", "QA Is Not Correct Low",
        "Wrong/ Not Required Unit Box", "Unit Box (If visible)", "Evidences", "Verification Data",
        "Rental Override", "Structure"
    ];

    const modal = document.createElement("div");
    Object.assign(modal.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.6)",
        zIndex: "10000",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
        backdropFilter: "blur(5px)",
    });

    const modalContent = document.createElement("div");
    Object.assign(modalContent.style, {
        background: "#ffffff",
        padding: "36px",
        borderRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        width: "90%",
        maxWidth: "1100px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        opacity: 0,
        transform: "scale(0.95) translateY(-10px)",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        boxSizing: "border-box",
    });

    // Filtrar los campos que no queremos mostrar en la interfaz
    const fieldsToShow = Object.keys(data).filter(key => key !== "urlcodeverg");

modalContent.innerHTML = `
    <div class="qa-modal">
        <div class="modal-wrapper">
            <div class="modal-sidebar">
                <div class="sidebar-content">
                    <div class="logo-container">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check-circle">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <h2>QA Report</h2>
                    </div>

                    <div class="form-sections">
                        ${fieldsToShow.map(key => `
                            <div class="form-group">
                                <label for="input_${key}">${key.replace(/_/g, ' ')}</label>
                                <input id="input_${key}" type="text" value="${data[key]}">
                            </div>
                        `).join("")}

                        <div class="form-group">
                            <label for="errorSelect">Error Type</label>
                            <select id="errorSelect">
                                <option disabled selected>Select Error...</option>
                                ${errors.map(err => `<option value="${err}">${err}</option>`).join("")}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="affectedListings">Affected Listings</label>
                            <input id="affectedListings" type="number" value="0" min="0">
                        </div>

                        <div id="dynamicFieldsContainer"></div>
                    </div>
                </div>
            </div>

            <div class="modal-main">
                <div class="feedback-section">
                    <div class="feedback-header">
                        <h3>Feedback Details</h3>
                    </div>

                    <div class="feedback-content">
                        <div class="textarea-wrapper">
                            <label for="commentInput">Message</label>
                            <textarea id="commentInput" placeholder="Write your feedback here..."></textarea>
                        </div>

                        <div class="preview-wrapper">
                            <label>Preview</label>
                            <div id="commentPreview" class="preview-box"></div>
                        </div>

                        <div class="action-buttons">
                            <button id="btnAccept" class="btn btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Accept
                            </button>
                            <button id="btnCancel" class="btn btn-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                Cancel
                            </button>
                            <a href="https://docs.google.com/spreadsheets/d/14N1pWw7fVIDgTko2A7faqbmkPVXM8LnHaeR0bd_TGxw/edit?gid=0#gid=0" target="_blank" class="btn btn-database">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-database"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
                                Database
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;

    // Estilos CSS
    const styles = document.createElement('style');
    styles.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    .qa-modal {
        font-family: 'Inter', sans-serif;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.1);
        overflow: hidden;
        max-width: 1100px;
        width: 95%;
        animation: modalSlideIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
        border: 1px solid rgba(0,0,0,0.05);
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .modal-wrapper {
        display: flex;
        min-height: 600px;
    }

    .modal-sidebar {
        background: linear-gradient(135deg, #D1E231 0%, #D1E231 100%);
        color: #000000;
        width: 350px;
        padding: 30px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }

    .logo-container {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
    }

    .logo-container svg {
        width: 40px;
        height: 40px;
        margin-right: 15px;
        stroke: #000000;
    }

    .logo-container h2 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 600;
        color: #000000;
    }

    .form-sections {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-group label {
        margin-bottom: 8px;
        color: rgba(0,0,0,0.7);
        font-weight: 500;
        font-size: 0.9rem;
    }

    .form-group input,
    .form-group select {
        background: rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.2);
        color: #000000;
        padding: 10px;
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        background: rgba(0,0,0,0.1);
        border-color: rgba(0,0,0,0.4);
    }

    .modal-main {
        flex-grow: 1;
        background: #f4f6f9;
        padding: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .feedback-section {
        width: 100%;
        max-width: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        padding: 30px;
    }

    .feedback-header {
        text-align: center;
        margin-bottom: 25px;
    }

    .feedback-header h3 {
        color: #000000;
        font-size: 1.4rem;
        margin: 0;
    }

    .textarea-wrapper, .preview-wrapper {
        margin-bottom: 20px;
    }

    .textarea-wrapper label,
    .preview-wrapper label {
        display: block;
        margin-bottom: 8px;
        color: #000000;
        font-weight: 500;
    }

    .textarea-wrapper textarea {
        width: 100%;
        min-height: 150px;
        resize: vertical;
        border: 1px solid #6C757D;
        border-radius: 8px;
        padding: 12px;
        font-size: 0.9rem;
        transition: border-color 0.3s ease;
    }

    .textarea-wrapper textarea:focus {
        outline: none;
        border-color: #007BFF;
    }

    .preview-box {
        background: #f9f9f9;
        border: 1px solid #6C757D;
        border-radius: 8px;
        padding: 12px;
        min-height: 100px;
        max-height: 200px;
        overflow-y: auto;
    }

    .action-buttons {
        display: flex;
        gap: 15px;
    }

    .btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
    }

    .btn svg {
        width: 20px;
        height: 20px;
    }

    .btn-primary {
        background-color: #D1E231;
        color: #000000;
    }

    .btn-secondary {
        background-color: #6C757D;
        color: white;
    }

    .btn-database {
        background-color: #007BFF;
        color: white;
    }

    .btn:hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }

    @media (max-width: 900px) {
        .modal-wrapper {
            flex-direction: column;
        }

        .modal-sidebar {
            width: 100%;
        }
    }
`;

document.body.appendChild(styles);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const errorSelect = document.getElementById("errorSelect");
    const commentInput = document.getElementById("commentInput");
    const commentPreview = document.getElementById("commentPreview");
    const btnAccept = document.getElementById("btnAccept");
    const btnCancel = document.getElementById("btnCancel");
    const dynamicFieldsContainer = document.getElementById("dynamicFieldsContainer");

    // Agregar efectos hover a los botones
    btnAccept.addEventListener("mouseover", () => {
        btnAccept.style.backgroundColor = "#BDC926";
        btnAccept.style.transform = "translateY(-1px)";
    });
    btnAccept.addEventListener("mouseout", () => {
        btnAccept.style.backgroundColor = "#CAD92B";
        btnAccept.style.transform = "translateY(0)";
    });

    btnCancel.addEventListener("mouseover", () => {
        btnCancel.style.backgroundColor = "#DBEAFE";
    });
    btnCancel.addEventListener("mouseout", () => {
        btnCancel.style.backgroundColor = "#EFF6FF";
    });

    // Mejorar apariencia de inputs al enfocarlos
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('focus', () => {
            el.style.borderColor = '#CAD92B';
            el.style.boxShadow = '0 0 0 3px rgba(202, 217, 43, 0.15)';
        });
        el.addEventListener('blur', () => {
            el.style.borderColor = '#E5E7EB';
            el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
        });
    });

    function updatePreview() {
        let text = commentInput.value;
        text = text.replace(/<(.*)\|(.*)>/g, '<a href="$1" target="_blank" style="color: #2563EB; text-decoration: none; font-weight: 500;">$2</a>');
        commentPreview.innerHTML = text;
    }

    function updateDynamicFields(error) {
        dynamicFieldsContainer.innerHTML = "";

        const fields = {
            "Structure": [{ label: "Estructura correcta:", id: "structure" }],
            "Wrong APN": [{ label: "Motivos del error APN:", id: "reasons" }],
            "Wrong Address Override": [{ label: "Dirección correcta:", id: "correctAddress" }],
            "Unit Box (If visible)": [{ label: "Unit Box correcto:", id: "unitBox" }],
            "QA Is Not Correct High": [{ label: "Motivos de QA incorrecto:", id: "reasons" }],
            "QA Is Not Correct Low": [{ label: "Motivos de QA incorrecto:", id: "reasons" }],
            "Wrong/ Not Required Unit Box": [{ label: "Unit Box incorrecto:", id: "unitBox" }]
        };

        if (fields[error]) {
            fields[error].forEach(field => {
                const div = document.createElement("div");
                div.style.display = "flex";
                div.style.justifyContent = "space-between";
                div.style.alignItems = "center";
                div.style.marginBottom = "16px";

                div.innerHTML = `
                    <label style="color: #4B5563; width: 40%; font-size: 14px; font-weight: 500;">${field.label}</label>
                    <input id="${field.id}" type="text" style="width: 58%; padding: 10px 14px; border: 1px solid #E5E7EB; border-radius: 8px; font-size: 14px; transition: all 0.2s ease; box-shadow: 0 1px 2px rgba(0,0,0,0.05); outline: none;">
                `;

                dynamicFieldsContainer.appendChild(div);

                // Aplicar el mismo comportamiento de focus/blur
                const input = div.querySelector('input');
                input.addEventListener('focus', () => {
                    input.style.borderColor = '#CAD92B';
                    input.style.boxShadow = '0 0 0 3px rgba(202, 217, 43, 0.15)';
                });
                input.addEventListener('blur', () => {
                    input.style.borderColor = '#E5E7EB';
                    input.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                });
            });
        }
    }

    // El resto de la función permanece igual
    function updateFeedback() {
        const selectedError = errorSelect.value;
        const dynamicFields = {};

        if (selectedError === "Structure") {
            dynamicFields.structure = document.getElementById("structure")?.value || "";
        } else if (selectedError === "Wrong APN" || selectedError === "QA Is Not Correct High" || selectedError === "QA Is Not Correct Low") {
            dynamicFields.reasons = document.getElementById("reasons")?.value || "";
        } else if (selectedError === "Wrong Address Override") {
            dynamicFields.correctAddress = document.getElementById("correctAddress")?.value || "";
        } else if (selectedError === "Unit Box (If visible)" || selectedError === "Wrong/ Not Required Unit Box") {
            dynamicFields.unitBox = document.getElementById("unitBox")?.value || "";
        }

        const feedback = generateFeedback(selectedError, data.qaed, data.project, data.listing, data.qaer, dynamicFields);
        commentInput.value = feedback;
        updatePreview();
    }

    commentInput.addEventListener("input", updatePreview);

    errorSelect.addEventListener("change", function() {
        updateDynamicFields(this.value);
        updateFeedback();
    });

    dynamicFieldsContainer.addEventListener("input", updateFeedback);

    setTimeout(() => {
        modalContent.style.opacity = 1;
        modalContent.style.transform = "scale(1) translateY(0)";
    }, 10);

    btnAccept.addEventListener("click", () => {
        const editedData = {};
        fieldsToShow.forEach(key => {
            editedData[key] = document.getElementById(`input_${key}`).value.trim();
        });

        editedData.urlcodeverg = data.urlcodeverg;
        editedData.error = errorSelect.value;
        editedData.comments = document.getElementById("commentPreview").innerText;
        editedData.possible_affected_listings = document.getElementById("affectedListings").value || "0";

        if (!editedData.listing.startsWith("http")) { showNotification("Invalid listing link", "error"); return; }
        if (!editedData.project) { showNotification("Project cannot be empty", "error"); return; }
        if (!editedData.qaer) { showNotification("QAer cannot be empty", "error"); return; }
        if (!editedData.qaed) { showNotification("QAed cannot be empty", "error"); return; }
        if (editedData.error === "Select an option...") { showNotification("You must select an error", "error"); return; }

        showNotification("Recording data, please wait...", "success");

        modalContent.style.opacity = 0;
        modalContent.style.transform = "scale(0.95) translateY(10px)";
        setTimeout(() => {
            document.body.removeChild(modal);
            onConfirm(editedData);
        }, 300);
    });

    btnCancel.addEventListener("click", () => {
        modalContent.style.opacity = 0;
        modalContent.style.transform = "scale(0.95) translateY(10px)";
        setTimeout(() => document.body.removeChild(modal), 300);
    });
}

    // Función para extraer datos de Random QA
    function extractRandomQaData() {
        const secondaryInfo = [...document.querySelectorAll('span')].find(el => el.textContent.trim() === "Secondary information");

        if (secondaryInfo) {
            secondaryInfo.click();
            setTimeout(() => {
                const rawDate = document.querySelector('[data-field-name="resolved_vetted_date"]')?.innerText.trim() || "";
                const data = {
                    date: new Date().toLocaleDateString("en-GB"),
                    date_of_mapping: convertDate(rawDate),
                    project: getProjectNameFromUrl(),
                    qaer: getQaerNameShort(),
                    qaed: extractQaEd(),
                    listing: window.location.href,
                    urlcodeverg: window.location.href
                };

                showEditWindow(data, (finalData) => {
                    fetch(RANDOM_QA_URL, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(finalData)
                    })
                        .then(() => showNotification("Data registered successfully.", "success"))
                        .catch(error => {
                            console.error("Error sending data:", error);
                            showNotification("Error sending data. Check the console.", "error");
                        });
                });
            }, 1000);
        } else {
            showNotification("'Secondary information' not found", "warning");
        }
    }

    // Función para extraer QAed (para Random QA)
    function extractQaEd() {
        const apnField = document.querySelector('[data-field-name="apn"] em');
        if (!apnField) return "";
        const match = apnField.innerText.match(
            /edited by (.*?)(?:\s\d+|\s?a)\s(?:years?|months?|days?|hours?|minutes?|seconds?)(?:(?:,|\sand)?\s\d+\s(?:years?|months?|days?|hours?|minutes?|seconds?))*\sago/i
        );

        if (match && match[1]) {
            return match[1]
                .replace(/\d+\s*(?:years?|months?|days?|hours?|minutes?|seconds?)/gi, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        return "";
    }

    // Funciones para QA Productivity
    let projectName = "";
    let qaer = "";
    let comments = "";
    let dataUrl = "";

    function extractQaProductivityData() {
        qaer = document.querySelector("#user_id")?.textContent.trim() || "Desconocido";
        projectName = getProjectNameFromUrl();
        dataUrl = window.location.href;
        let commentsTextarea = document.querySelector('textarea[name="verification_comments"]');
        comments = commentsTextarea ? commentsTextarea.value.trim() : "Sin comentarios";
    }

    function validateAndExtractAgain(callback) {
        extractQaProductivityData();
        if (!qaer || !projectName || !comments || !dataUrl) {
            console.warn("⚠️ Algunos datos están vacíos, intentando obtenerlos nuevamente...");
            setTimeout(() => {
                extractQaProductivityData();
                console.log("🔄 Datos reintentados:", { qaer, projectName, comments, dataUrl });
                callback();
            }, 500);
        } else {
            callback();
        }
    }

    function initializeQaProductivityScript() {
        console.log("✅ Report QA detectado, activando script...");

        document.addEventListener("click", function(event) {
            if (event.target.id === "btn_open_vetting_dlg") {
                extractQaProductivityData();
                console.log("Edit Mode abierto:", { qaer, projectName, dataUrl });

                setTimeout(() => {
                    const btnSave = document.querySelector("#btn_submit_vetting_dlg.btn-primary");

                    if (btnSave && btnSave.textContent.trim() === "Save" && !document.querySelector("#QaProductivity")) {
                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.id = "QaProductivity";
                        checkbox.style.marginLeft = "10px";

                        const label = document.createElement("label");
                        label.htmlFor = "QaProductivity";
                        label.textContent = " QA Productivity";
                        label.style.marginLeft = "5px";

                        btnSave.parentNode.insertBefore(checkbox, btnSave.nextSibling);
                        btnSave.parentNode.insertBefore(label, checkbox.nextSibling);
                    }
                }, 500);
            }
        });

        document.addEventListener("click", function(event) {
            if (event.target.id === "btn_submit_vetting_dlg") {
                const buttonText = event.target.textContent.trim();
                const checkbox = document.querySelector("#QaProductivity");

                if (buttonText === "Submit QA Result" || (buttonText === "Save" && checkbox && checkbox.checked)) {
                    validateAndExtractAgain(() => {
                        console.log("📤 Enviando datos:", { qaer, projectName, comments, dataUrl });

                        if (cleanText(comments) !== "qaed ok") {
                            const reportQaButton = [...document.querySelectorAll('a')].find(a => cleanText(a.textContent).startsWith("report qa |"));
                            if (reportQaButton) {
                                setTimeout(() => {
                                    reportQaButton.click();
                                }, 500);
                            } else {
                                console.log("⚠️ No se encontró el botón Report QA");
                            }
                        }

                        let payload = new FormData();
                        payload.append("Projectname", projectName || "Unknown Project");
                        payload.append("QAer", qaer || "Desconocido");
                        payload.append("Comments", comments || "Sin comentarios");
                        payload.append("dataUrl", dataUrl || "No disponible");

                        fetch(RANDOM_QA_URL + "?qaproductivity", {
                            method: "POST",
                            body: payload,
                            mode: "no-cors"
                        })
                        .then(() => {
                            showNotification("Data registered successfully", "success");
                        })
                        .catch(error => {
                            console.error("Error al enviar datos:", error);
                            showNotification("Error sending data", "error");
                        });
                    });
                }
            }
        });
    }

    function watchForReportQaButton() {
        const observer = new MutationObserver(() => {
            const reportQaButton = [...document.querySelectorAll('a')].find(a => cleanText(a.textContent).startsWith("report qa |"));
            if (reportQaButton) {
                observer.disconnect();
                initializeQaProductivityScript();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Inicialización de ambos sistemas
    function initializeCombinedScript() {
        // Inicializar Random QA Report
        waitForUserSection().then(() => {
            checkQaerAndShowLink();
        });

        // Inicializar QA Productivity
        watchForReportQaButton();
    }

    // Iniciar el script combinado
    initializeCombinedScript();
})();
