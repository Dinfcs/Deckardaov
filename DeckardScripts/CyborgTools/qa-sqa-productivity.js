// ==UserScript==
// @name         QA Productivity & Random QA Report25-04-2025
// @namespace
// @version      3.1
// @description  Combina funcionalidades de captura de datos QA con sistema unificado de notificaciones
// @match        https://cyborg.deckard.com/listing/*STR*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuración común
    const RANDOM_QA_URL = "https://script.google.com/macros/s/AKfycbzsaMYnVMK65UfAKsVg27_fqzzdALlYPwaBQeN-_nFUwSmLHG3GT14Kw5aif1AbC_5BrA/exec";
    const MINIONS = RANDOM_QA_URL + "?qaers";
    const CACHE_DATA = 'qaersData';
    const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hora
     let QaFlag = "No"; // Valor por defecto
        // Verificar si estamos en modo QA
        const qaModeButton = document.querySelector('#btn_open_vetting_dlg_as_qa_mode');
        if (qaModeButton && qaModeButton.textContent.trim() === "QA") {
            QaFlag = "Yes";
        }
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
        notification.style.zIndex = "99999";
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
    function generateFeedback(error, qaedc, project, link, qaer, dynamicFields = {}) {
        const getFirstName = (fullName) => {
        return fullName.split(' ')[0] || fullName; // Toma el primer elemento o el nombre completo si no hay espacios
    };
        const qaed = getFirstName(qaedc);
        const feedbackTemplates = {
            "Wrong APN": `Hola ${qaed}, Estoy realizando QA y <${link}|revisé una de tus propiedades> en ${project}. Noté que el APN no es correcto, esto se debe a:: ${dynamicFields.reasons || "(aquí van los motivos)"}.  Si tienes alguna duda o necesitas más información, ¡estoy aquí para ayudar! Att: ${qaer}`,
            "Bad APN": `¡Hola ${qaed}! Estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. El APN registrado tiene un formato erróneo por lo que generó una Bad APN. Trata de verificar siempre en los PR para evitar este tipo de errores. ¡Muchas gracias! Att: ${qaer}`,
            "Missing MUS": `Hola ${qaed}, Estoy realizando QA y revisé <${link}|una de tus propiedades> en ${project}. Noté que falta información en el campo MUS.  Para este proyecto es necesario completarlo, según la instrucción que puedes encontrar en Important Info. No olvides revisar esa información al comenzar tu proyecto.  Si tienes alguna duda o necesitas más información, ¡estoy aquí para ayudar!  Att: ${qaer}`,
            "Missing Address Override": `Hola ${qaed},  Estoy realizando QA y revisé <${link}|una de tus propiedades> en ${project}. Noté que faltó hacerle Address Override. Asegúrate de agregarlo cuando sea necesario. Si tienes alguna duda o necesitas más información, ¡estoy aquí para ayudar!  Att: ${qaer}`,
            "Missing Address Override in an NMF Listing (If required)": `Hola ${qaed}, Estoy realizando QA y revisé <${link}|una de tus propiedades> en ${project}. En este caso, no pudiste identificar la propiedad, pero no te preocupes, a veces pasa. Recuerda que, si la propiedad está en un condominio que puedes identificar fácilmente pero no encuentras la unidad específica, debes hacer el Address Override en NMF utilizando el siguiente formato: House number Street name Unit # unk, City, STATE ABBREVIATION Zip code. Si tienes alguna duda o necesitas más información, ¡estoy aquí para ayudar!  Att: ${qaer}`,
            "Wrong Address Override": `¡Hola ${qaed}! Estoy realizando QA y revisé <${link}| una de tus propiedades> en ${project}. La identificación fue precisa y la evidencia muy clara. Sin embargo, al revisarla, noté que el Address Override no es correcto. En este caso, la opción correcta sería: ${dynamicFields.correctAddress || "(aquí va el address correcto)"}. Si tienes alguna duda o necesitas más información, ¡estoy aquí para ayudar!  Att: ${qaer}`,
            "Do Not Clear Previous Address Override In An NMF Listing": `Hola ${qaed}, Estoy realizando QA y revisé <${link}|una de tus propiedades> en ${project}. Noté que no eliminaste el Address Override anterior en un listing de NMF. Asegúrate de quitarlo cuando identifiques la propiedad, ya que de lo contrario el cliente no podrá ver la dirección correcta.Si tienes alguna duda o necesitas más información, ¡estoy aquí para ayudar!  Att: ${qaer}`,
            "QA Is Not Correct High": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad> en ${project} la cual marcaste con QAok. Noté que el QAok no es correcto. Mis motivos son: ${dynamicFields.reasons || "(aquí van los motivos)"}. ¡Gracias! Att: ${qaer}`,
            "QA Is Not Correct Low": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project} la cual marcaste con QAok. Noté que la QA no es correcta. Mis motivos son: ${dynamicFields.reasons || "(aquí van los motivos)"}. ¡Gracias! Att: ${qaer}`,
            "Unit Box (If visible)": `Hola ${qaed}, Estoy realizando QA y revisé <${link}|una de tus propiedades> en ${project}. Noté que omitiste llenar el campo 'Unit Box'. En este caso era: ${dynamicFields.unitBox || "(aquí va el unit box)"}. Esta información la puedes encontrar en las imágenes, la descripción o el título del listing, y nos ayuda a separar correctamente las Property Cards. Si tienes alguna duda o necesitas más información, ¡estoy aquí para ayudar!   Att: ${qaer}`,
            "Wrong Unit Box": `Hola ${qaed}, Estoy realizando QA y revisé <${link}|una de tus propiedades> en ${project}. Hiciste un buen trabajo identificando la propiedad, sin embargo, la unidad que colocaste en el unit box, no coincide con las que ofertan en el listing ${dynamicFields.unitBox || "(aquí va el unit box)"} es la unidad correcta. ¡Muchas Gracias! Att: ${qaer}`,
            "Not Required Unit Box": `Hola ${qaed}, Estoy realizando QA y encontré <${link}|esta propiedad tuya> en ${project}. Hiciste un buen trabajo identificando la propiedad, sin embargo, noté que dejaste ${dynamicFields.unitBox || "(aquí va el unit box)"} en el Unit Box cuando no era necesario. . Si tienes alguna duda o necesitas más información, ¡estoy aquí para ayudar! Att: ${qaer}`,
            "Property Manager Info (If required)": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que falta la información del Property Manager. Por favor, asegúrate de agregarla si es requerida. ¡Gracias! Att: ${qaer}`,
            "Rental Override": `Hola ${qaed}, espero que estés bien. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. ¡Gracias! Att: ${qaer}`,
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
        "Wrong Unit Box", "Not Required Unit Box", "Unit Box (If visible)", "Rental Override", "Structure"
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
                        <!-- Nuevo selector Dispute -->
                        <div class="form-group dispute-group">
                            <label for="disputeCheckbox">Dispute</label>
                            <input type="checkbox" id="disputeCheckbox">
                        </div>
                        <!-- Fin Nuevo selector Dispute -->

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
                            <label for="secondaryError1">Secondary Error (Optional)</label>
                            <select id="secondaryError1">
                                <option value="">None</option>
                                ${errors.map(err => `<option value="${err}">${err}</option>`).join("")}
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="secondaryError2">Additional Error (Optional)</label>
                            <select id="secondaryError2">
                                <option value="">None</option>
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

    // Estilos CSS mejorados con áreas de texto más grandes
    const styles = document.createElement('style');
    styles.textContent = `
    /* Agrega esto al inicio de tus estilos CSS */
    .form-group label,
    .feedback-section label,
    .textarea-wrapper label,
    .preview-wrapper label {
        text-transform: uppercase !important;
    }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    .qa-modal {
        font-family: 'Inter', sans-serif;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 16px;
        box-shadow: 0 25px 50px rgba(0,0,0,0.1);
        overflow: auto;
        max-width: 95vw;
        max-height: 95vh;
        width: 100%;
        animation: modalSlideIn 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
        border: 1px solid rgba(0,0,0,0.05);
        margin: 2.5vh auto;
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
        flex-direction: row;
        min-height: auto;
        height: 100%;
    }

    .modal-sidebar {
        background: linear-gradient(135deg, #D1E231 0%, #D1E231 100%);
        color: #000000;
        width: 350px;
        padding: 25px;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
    }

    .logo-container {
        display: flex;
        align-items: center;
        margin-bottom: 25px;
    }

    .logo-container svg {
        width: 32px;
        height: 32px;
        margin-right: 12px;
        stroke: #000000;
    }

    .logo-container h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #000000;
    }

    .form-sections {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    /* Estilos específicos para el grupo Dispute */
    .form-group.dispute-group {
        flex-direction: row; /* Alinea el label y el checkbox horizontalmente */
        align-items: center; /* Centra verticalmente */
        justify-content: flex-start; /* Alinea al inicio */
        margin-bottom: 15px; /* Espacio debajo del grupo */
    }

    .form-group.dispute-group label {
        margin-bottom: 0; /* No margin-bottom para el label en esta configuración */
        margin-right: 10px; /* Espacio entre el label y el checkbox */
        font-size: 0.95rem; /* Ajusta el tamaño de la fuente si es necesario */
        min-width: 80px; /* Asegura un ancho mínimo para el label */
    }

    .form-group.dispute-group input[type="checkbox"] {
        width: 20px; /* Tamaño del checkbox */
        height: 20px;
        accent-color: #000000; /* Color del "tick" o fondo cuando está marcado */
        border: 2px solid #000000; /* Borde del checkbox */
        border-radius: 4px;
        background-color: rgba(0,0,0,0.05); /* Fondo ligero */
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .form-group.dispute-group input[type="checkbox"]:checked {
        background-color: #D1E231; /* Fondo cuando está marcado */
        border-color: #000000; /* Borde cuando está marcado */
    }

    .form-group.dispute-group input[type="checkbox"]:hover {
        box-shadow: 0 0 8px rgba(0,0,0,0.3); /* Sombra al pasar el ratón */
    }


    .form-group label {
        margin-bottom: 6px;
        color: rgba(0,0,0,0.7);
        font-weight: 500;
        font-size: 0.85rem;
    }

    .form-group input,
    .form-group select {
        background: rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.2);
        color: #000000;
        padding: 8px 12px;
        border-radius: 6px;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }

    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        background: rgba(0,0,0,0.1);
        border-color: rgba(0,0,0,0.4);
        box-shadow: 0 0 0 2px rgba(209, 226, 49, 0.3);
    }

    .modal-main {
        flex: 1;
        background: #f4f6f9;
        padding: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
    }

    .feedback-section {
        width: 100%;
        max-width: 600px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        padding: 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .feedback-header {
        text-align: center;
        margin-bottom: 20px;
    }

    .feedback-header h3 {
        color: #000000;
        font-size: 1.3rem;
        margin: 0;
    }

    .feedback-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
        flex: 1;
    }

    .textarea-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-bottom: 0;
    }

    .textarea-wrapper label {
        display: block;
        margin-bottom: 8px;
        color: #000000;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .textarea-wrapper textarea {
        width: 100%;
        flex: 1;
        min-height: 250px;
        resize: vertical;
        border: 1px solid #6C757D;
        border-radius: 8px;
        padding: 12px;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        line-height: 1.5;
    }

    .textarea-wrapper textarea:focus {
        outline: none;
        border-color: #007BFF;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
    }

    .preview-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-bottom: 0;
    }

    .preview-wrapper label {
        display: block;
        margin-bottom: 8px;
        color: #000000;
        font-weight: 500;
        font-size: 0.95rem;
    }

    .preview-box {
        background: #f9f9f9;
        border: 1px solid #6C757D;
        border-radius: 8px;
        padding: 12px;
        flex: 1;
        min-height: 250px;
        max-height: 300px;
        overflow-y: auto;
        font-size: 0.95rem;
        line-height: 1.5;
        white-space: pre-wrap;
    }

    .action-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 20px;
    }

    .btn {
        flex: 1 1 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 12px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.3s ease;
        text-decoration: none;
        font-size: 0.9rem;
        min-width: 100px;
    }

    .btn svg {
        width: 18px;
        height: 18px;
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
        box-shadow: 0 3px 8px rgba(0,0,0,0.1);
    }

    /* Responsive adjustments */
    @media (max-width: 1200px) {
        .modal-wrapper {
            flex-direction: column;
            max-height: 85vh;
        }

        .modal-sidebar {
            width: 100%;
            padding: 20px;
        }

        .modal-main {
            padding: 20px;
        }

        .feedback-section {
            max-width: 100%;
        }
    }

    @media (max-width: 768px) {
        .qa-modal {
            max-width: 98vw;
            max-height: 98vh;
            margin: 1vh auto;
        }

        .logo-container h2 {
            font-size: 1.3rem;
        }

        .form-group input,
        .form-group select {
            padding: 7px 10px;
        }

        .textarea-wrapper textarea,
        .preview-box {
            min-height: 200px;
        }

        .action-buttons {
            gap: 8px;
        }

        .btn {
            flex: 1 1 100px;
            padding: 8px 10px;
            font-size: 0.85rem;
        }
    }

    @media (max-width: 480px) {
        .modal-sidebar,
        .modal-main {
            padding: 15px;
        }

        .logo-container {
            flex-direction: column;
            text-align: center;
            margin-bottom: 15px;
        }

        .logo-container svg {
            margin-right: 0;
            margin-bottom: 8px;
        }

        .form-sections {
            gap: 12px;
        }

        .feedback-header h3 {
            font-size: 1.2rem;
        }

        .textarea-wrapper textarea,
        .preview-box {
            min-height: 180px;
            font-size: 0.9rem;
        }

        .btn {
            flex: 1 1 80px;
            font-size: 0.8rem;
            min-width: auto;
        }
    }

    @media (max-height: 700px) {
        .qa-modal {
            max-height: 90vh;
        }

        .textarea-wrapper textarea,
        .preview-box {
            min-height: 150px;
        }

        .modal-sidebar,
        .modal-main {
            overflow-y: auto;
        }

        .form-sections {
            gap: 10px;
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
    const disputeCheckbox = document.getElementById("disputeCheckbox"); // Nuevo: Referencia al checkbox

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
        btnCancel.style.backgroundColor = "#7f8894";
    });
    btnCancel.addEventListener("mouseout", () => {
        btnCancel.style.backgroundColor = "#7f8894";
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

         // Obtener el valor ACTUAL del campo qaed del formulario
         const currentQaed = document.getElementById("input_qaed")?.value.trim() || data.qaed;

         if (selectedError === "Structure") {
             dynamicFields.structure = document.getElementById("structure")?.value || "";
         } else if (selectedError === "Wrong APN" || selectedError === "QA Is Not Correct High" || selectedError === "QA Is Not Correct Low") {
             dynamicFields.reasons = document.getElementById("reasons")?.value || "";
         } else if (selectedError === "Wrong Address Override") {
             dynamicFields.correctAddress = document.getElementById("correctAddress")?.value || "";
         } else if (selectedError === "Unit Box (If visible)" || selectedError === "Wrong/ Not Required Unit Box") {
             dynamicFields.unitBox = document.getElementById("unitBox")?.value || "";
         }

         // Usar currentQaed en lugar de data.qaed
         const feedback = generateFeedback(selectedError, currentQaed, data.project, data.listing, data.qaer, dynamicFields);
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
         // 1. Obtener todos los valores necesarios
         const primaryError = errorSelect.value;
         const project = document.getElementById("input_project")?.value.trim() || "";
         const qaer = document.getElementById("input_qaer")?.value.trim() || "";
         const qaed = document.getElementById("input_qaed")?.value.trim() || "";
         const listing = document.getElementById("input_listing")?.value.trim() || "";
         const date = document.getElementById("input_date")?.value.trim() || "";
         const dateOfMapping = document.getElementById("input_date_of_mapping")?.value.trim() || "";
         const isDisputed = disputeCheckbox.checked; // Nuevo: Estado del checkbox Dispute



         // 2. Validación PRIORITARIA del Error Type
         if (!primaryError || primaryError === "Select Error..." || primaryError === "Select Primary Error...") {
             showNotification("You must select a valid error type", "error");
             errorSelect.style.border = "2px solid #f44336";
             errorSelect.style.boxShadow = "0 0 5px rgba(244, 67, 54, 0.5)";
             errorSelect.focus();

             setTimeout(() => {
                 errorSelect.style.border = "1px solid #E5E7EB";
                 errorSelect.style.boxShadow = "none";
             }, 3000); // Resaltar por 3 segundos
             return; // Detener inmediatamente
         }

         // 3. Validación del resto de campos obligatorios
         const validations = [
             {
                 condition: !project,
                 notification: () => showNotification("Project name is required", "error"),
                 element: document.getElementById("input_project"),
                 fieldName: "Project"
             },
             {
                 condition: !qaer,
                 notification: () => showNotification("QAer name is required", "error"),
                 element: document.getElementById("input_qaer"),
                 fieldName: "QAer"
             },
             {
                 condition: !qaed,
                 notification: () => showNotification("QAed name is required", "error"),
                 element: document.getElementById("input_qaed"),
                 fieldName: "QAed"
             },
             {
                 condition: !listing || !listing.startsWith("http"),
                 notification: () => showNotification("Valid listing URL is required (must start with http/https)", "error"),
                 element: document.getElementById("input_listing"),
                 fieldName: "Listing URL"
             },
             {
                 condition: !date,
                 notification: () => showNotification("Date is required", "error"),
                 element: document.getElementById("input_date"),
                 fieldName: "Date"
             },
             {
                 condition: !dateOfMapping,
                 notification: () => showNotification("Mapping date is required", "error"),
                 element: document.getElementById("input_date_of_mapping"),
                 fieldName: "Mapping Date"
             }
         ];

         // 4. Encontrar el primer error (si existe)
         const firstError = validations.find(v => v.condition);

         if (firstError) {
             firstError.notification();
             firstError.element.focus();

             // Resaltar campo con error
             firstError.element.style.border = "2px solid #f44336";
             firstError.element.style.boxShadow = "0 0 5px rgba(244, 67, 54, 0.5)";

             // Crear tooltip de error
             const tooltip = document.createElement("div");
             tooltip.textContent = `${firstError.fieldName} is required`;
             tooltip.style.position = "absolute";
             tooltip.style.backgroundColor = "#f44336";
             tooltip.style.color = "white";
             tooltip.style.padding = "5px 10px";
             tooltip.style.borderRadius = "4px";
             tooltip.style.top = `${firstError.element.offsetTop - 35}px`;
             tooltip.style.left = `${firstError.element.offsetLeft}px`;
             tooltip.style.zIndex = "99999";
             tooltip.style.fontSize = "12px";
             tooltip.style.fontWeight = "bold";

             firstError.element.parentNode.appendChild(tooltip);

             setTimeout(() => {
                 firstError.element.style.border = "1px solid #E5E7EB";
                 firstError.element.style.boxShadow = "none";
                 tooltip.remove();
             }, 3000);

             return;
         }

         // 5. Si todo es válido, preparar datos para enviar
         const editedData = {
             ...Object.fromEntries(fieldsToShow.map(key =>
                                                    [key, document.getElementById(`input_${key}`).value.trim()]
                                                   )),
             urlcodeverg: data.urlcodeverg,
             error: primaryError,
             secondary_error_1: document.getElementById("secondaryError1").value || null,
             secondary_error_2: document.getElementById("secondaryError2").value || null,
             comments: document.getElementById("commentInput").value,
             possible_affected_listings: document.getElementById("affectedListings").value || "0",
             dispute: disputeCheckbox.checked ? "Yes" : "No",
             timestamp: new Date().toISOString()
         };

         // 6. Feedback y envío
         showNotification("Sending QA report...", "info");

         modalContent.style.opacity = 0;
         modalContent.style.transform = "scale(0.95) translateY(10px)";

         setTimeout(() => {
             document.body.removeChild(modal);
             onConfirm(editedData);
         }, 500);
     });

    btnCancel.addEventListener("click", () => {
        modalContent.style.opacity = 0;
        modalContent.style.transform = "scale(0.95) translateY(10px)";
        setTimeout(() => document.body.removeChild(modal), 300);
    });
}

    // Función para extraer datos de Random QA
    function extractRandomQaData() {
        // Verificar si el checkbox suggest_qa está marcado
        const suggestQaCheckbox = document.querySelector('input[id*="suggest_qa"]');
        if (suggestQaCheckbox && suggestQaCheckbox.checked) {
            return;
        }

        // Verificar si los comentarios contienen "SQAed" (case insensitive)
        const commentsTextarea = document.querySelector('textarea[name="verification_comments"]');
        if (commentsTextarea && /sqae?d/i.test(commentsTextarea.value.trim())) {
            return;
        }

        // Continuar con el proceso normal si no se cumplen las condiciones de bloqueo
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

            // Observar clics en el botón QA para actualizar QaFlag
        document.addEventListener("click", function(event) {
            if (event.target.id === "btn_open_vetting_dlg_as_qa_mode") {
                QaFlag = "Yes";
                console.log("Modo QA activado, QaFlag:", QaFlag);
            }
        });

    // Añadimos los estilos globales una sola vez
    if (!document.querySelector('#QaProductivityStyles')) {
        const style = document.createElement('style');
        style.id = 'QaProductivityStyles';
        style.textContent = `
            #QaProductivity {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                border: 2px solid #D1E231;
                border-radius: 4px;
                background-color: rgba(209, 226, 49, 0.1);
                outline: none;
                cursor: pointer;
                position: relative;
                transition: all 0.2s ease;
                vertical-align: middle;
                margin-left: 12px;
            }

            #QaProductivity:checked {
                background-color: #D1E231;
                border-color: #D1E231;
            }

            #QaProductivity:checked::after {
                content: "✓";
                position: absolute;
                color: #000;
                font-size: 14px;
                font-weight: bold;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }

            #QaProductivity:hover {
                box-shadow: 0 0 8px rgba(209, 226, 49, 0.6);
                transform: scale(1.05);
            }

            label[for="QaProductivity"] {
                margin-left: 8px;
                color: #D1E231;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                transition: all 0.2s ease;
                text-shadow: 0 1px 1px rgba(0,0,0,0.2);
            }

            label[for="QaProductivity"]:hover {
                color: #e6ff00;
                text-shadow: 0 0 8px rgba(209, 226, 49, 0.6);
            }
        `;
        document.head.appendChild(style);
    }

    document.addEventListener("click", function(event) {
        if (event.target.id === "btn_open_vetting_dlg") {
            extractQaProductivityData();
            console.log("Edit Mode abierto:", { qaer, projectName, dataUrl });

            setTimeout(() => {
                const btnSave = document.querySelector("#btn_submit_vetting_dlg.btn-primary");

                if (btnSave && btnSave.textContent.trim() === "Save" && !document.querySelector("#QaProductivity")) {
                    // Checkbox mejorado
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = "QaProductivity";
                    checkbox.style.cssText = `
                        margin-left: 12px;
                        width: 18px;
                        height: 18px;
                        cursor: pointer;
                    `;

                    // Label mejorado
                    const label = document.createElement("label");
                    label.htmlFor = "QaProductivity";
                    label.textContent = " QA Productivity";
                    label.style.cssText = `
                        margin-left: 8px;
                        color: #D1E231;
                        font-weight: 600;
                        font-size: 14px;
                        cursor: pointer;
                        display: inline-flex;
                        align-items: center;
                    `;

                    // Contenedor para mejor alineación
                    const container = document.createElement("div");
                    container.style.display = "flex";
                    container.style.alignItems = "center";
                    container.style.marginLeft = "10px";
                    container.appendChild(checkbox);
                    container.appendChild(label);

                    btnSave.parentNode.insertBefore(container, btnSave.nextSibling);
                }
            }, 500);
        }
    });


 document.addEventListener("click", function(event) {
            if (event.target.id === "btn_submit_vetting_dlg") {
                const buttonText = event.target.textContent.trim();
                const qaProductivityCheckbox = document.querySelector("#QaProductivity");
                const suggestQaCheckbox = document.querySelector('input[id*="suggest_qa"]');
                const commentsTextarea = document.querySelector('textarea[name="verification_comments"]');
                const comments = commentsTextarea ? commentsTextarea.value.trim() : "";

                // Verificar condiciones de bloqueo
                if (suggestQaCheckbox && suggestQaCheckbox.checked) {
                    console.log("🚫 Acción cancelada: suggest_qa está marcado");
                    return;
                }

                if (/sqa/i.test(comments)) {
                    console.log("🚫 Acción cancelada: comentarios contienen SQAed");
                    return;
                }

                if (buttonText === "Submit QA Result" || (buttonText === "Save" && qaProductivityCheckbox && qaProductivityCheckbox.checked)) {
                    validateAndExtractAgain(() => {
                        console.log("📤 Enviando datos:", { qaer, projectName, comments, dataUrl, QaFlag });

                        if (cleanText(comments) !== "qaed ok") {
                            const reportQaButton = [...document.querySelectorAll('a')].find(a => cleanText(a.textContent).startsWith("report qa |"));
                            if (reportQaButton) {
                                setTimeout(() => {
                                    reportQaButton.click();
                                }, 500);
                            } else {
                                console.log("⚠️ No se ejecutó Report QA");
                            }
                        }

                        let payload = new FormData();
                        payload.append("Projectname", projectName || "Unknown Project");
                        payload.append("QAer", qaer || "Desconocido");
                        payload.append("Comments", comments || "Sin comentarios");
                        payload.append("dataUrl", dataUrl || "No disponible");
                        payload.append("QaFlag", QaFlag); // Añadir QaFlag al payload

                        fetch(RANDOM_QA_URL + "?qaproductivity", {
                            method: "POST",
                            body: payload,
                            mode: "no-cors"
                        })
                        .then(() => {
                            showNotification("Data registered successfully", "success");
                            QaFlag = "No"; // Resetear el flag después del envío
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

    function initSQAModalHandler() {
    'use strict';
    // Configuración
    const SQA_APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbw5tlJMrL4ZBvQA665x55-Hh6PSK1sb-5Nphy_7z-omBtGshVlWZNjtLR5gz1NKs04tKA/exec";
    const REPORT_QA_SELECTOR = 'a[href="#"][style*="color: blue"]';
    const SAVE_BUTTON_SELECTOR = '#btn_submit_vetting_dlg.btn-primary';

    // Verificar si el botón Report QA existe
    function reportQaButtonExists() {
        const reportQaBtn = document.querySelector(REPORT_QA_SELECTOR);
        return reportQaBtn && reportQaBtn.textContent.includes("Report QA");
    }

    // Obtener nombre del proyecto desde la URL
    function getProjectNameFromUrl() {
        const url = window.location.href;
        const patterns = [
            { regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/, format: m => `AUS - ${m[2].replace(/_/g, ' ') === 'Bass Coast' ? m[2].replace(/_/g, ' ') : 'City of ' + m[2].replace(/_/g, ' ')}` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${m[4].replace(/_/g, ' ')}` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${m[2].replace(/_/g, ' ')} County` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//, format: m => `${m[1].toUpperCase()} - ${m[3].replace(/_/g, ' ')}` }
        ];
        for (const { regex, format } of patterns) {
            const match = url.match(regex);
            if (match) return format(match);
        }
        return "Unknown Project";
    }

    // Mostrar notificación
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#4CAF50' : '#F44336'};
            color: white;
            border-radius: 4px;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: fadeIn 0.3s;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Obtener solo la fecha del timestamp actual (formato YYYY-MM-DD)
    function getCurrentDateOnly() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    // Extraer el nombre del QAed desde los elementos <em> de la tabla
    function extractQaedFromTable() {
        const emElements = document.querySelectorAll('#vetted_result_table em');
        if (emElements && emElements.length > 0) {
            // Tomar el primer elemento <em> que contiene "edited by"
            for (const em of emElements) {
                const text = em.textContent.trim();
                if (text.includes('edited by')) {
                    // Patrón: edited by NOMBRE X time ago
                    const match = text.match(/edited by\s+([^0-9]+?)\s+\d+/);
                    if (match && match[1]) {
                        return match[1].trim();
                    }
                }
            }
        }
        return "Desconocido";
    }

    // Crear y mostrar el modal SQA
    function showSQAModal() {
        // Verificar condiciones SQA
        const suggestQaChecked = document.querySelector('input[id*="suggest_qa"]')?.checked;
        const commentsText = document.querySelector('textarea[name="verification_comments"]')?.value.trim() || '';
        const isSQAed = /sqae?d/i.test(commentsText);
        if (!suggestQaChecked && !isSQAed) return;

        // Obtener datos necesarios
        const qaer = document.querySelector("#user_id")?.textContent.trim() || "Desconocido";
        const qaed = extractQaedFromTable();
        const listingUrl = window.location.href;
        const projectName = getProjectNameFromUrl();
        const currentDate = getCurrentDateOnly();

        // Crear modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: 'Inter', sans-serif;
        `;
        modal.innerHTML = `
        <div style="background: white; width: 90%; max-width: 600px; border-radius: 12px; padding: 25px; box-shadow: 0 5px 30px rgba(0,0,0,0.3);">
            <h2 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 10px;">SQA Feedback</h2>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">Proyecto</label>
                <input type="text" id="sqaProject" value="${projectName}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">URL del Listing</label>
                <input type="text" id="sqaListingUrl" value="${listingUrl}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">Fecha</label>
                <input type="date" id="sqaDate" value="${currentDate}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">QAed (Persona que recibe QA)</label>
                <input type="text" id="sqaQaed" value="${qaed}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">QAer (Persona que hace QA)</label>
                <input type="text" id="sqaQaer" value="${qaer}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">Tipo de consulta</label>
                <select id="sqaCaseType" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
                    <option value="">Seleccione un caso...</option>
                    <option value="Structure">Structure</option>
                    <option value="Address Override">Address Override</option>
                    <option value="Bad APN">Bad APN</option>
                    <option value="Unit Box">Unit Box</option>
                    <option value="Other">Otro</option>
                </select>
            </div>

            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #555;">Mensaje</label>
                <textarea id="sqaMessage" style="width: 100%; height: 150px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical;"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="sqaCancelBtn" style="padding: 10px 20px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; font-weight: 600;">Cancelar</button>
                <button id="sqaSubmitBtn" style="padding: 10px 20px; background: #D1E231; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; color: #000;">Enviar</button>
            </div>
        </div>
        `;
        document.body.appendChild(modal);

        // Configurar elementos del modal
        const projectInput = modal.querySelector('#sqaProject');
        const listingUrlInput = modal.querySelector('#sqaListingUrl');
        const dateInput = modal.querySelector('#sqaDate');
        const qaedInput = modal.querySelector('#sqaQaed');
        const qaerInput = modal.querySelector('#sqaQaer');
        const caseTypeSelect = modal.querySelector('#sqaCaseType');
        const messageTextarea = modal.querySelector('#sqaMessage');
        const cancelBtn = modal.querySelector('#sqaCancelBtn');
        const submitBtn = modal.querySelector('#sqaSubmitBtn');

                const getFirstName = (fullName) => {
        return fullName.split(' ')[0] || fullName; // Toma el primer elemento o el nombre completo si no hay espacios
    };
        const qaedc = getFirstName(qaed);
        // Plantillas de mensaje
        const templates = {
            'Structure': `Hola ${qaedc}, hoy me encuentro haciendo SQA (${qaer}) y encontré este listing tuyo: <${listingUrl}|${projectName}>. `,
            'Address Override': `Hola ${qaedc}, hoy me encuentro haciendo SQA (${qaer}) y encontré este listing tuyo: <${listingUrl}|${projectName}>.`,
            'Bad APN': `Hola ${qaedc}, hoy me encuentro haciendo SQA (${qaer}) y encontré este listing tuyo: <${listingUrl}|${projectName}>.`,
            'Unit Box': `Hola ${qaedc}, hoy me encuentro haciendo SQA (${qaer}) y encontré este listing tuyo: <${listingUrl}|${projectName}>.`,
            'Other': `Hola ${qaedc}, hoy me encuentro haciendo SQA (${qaer}) y encontré este listing tuyo: <${listingUrl}|${projectName}>. `
        };
        // Event listeners
        caseTypeSelect.addEventListener('change', function() {
            if (this.value && templates[this.value]) {
                // Actualizar la plantilla con los valores actuales de los campos
                const currentQaed = qaedInput.value.trim();
                const currentListingUrl = listingUrlInput.value.trim();
                const currentProject = projectInput.value.trim();

                let templateText = templates[this.value]
                    .replace(qaed, currentQaed)
                    .replace(listingUrl, currentListingUrl)
                    .replace(projectName, currentProject);

                messageTextarea.value = templateText;
            }
        });

        cancelBtn.addEventListener('click', () => modal.remove());

        submitBtn.addEventListener('click', function() {
            if (!caseTypeSelect.value) {
                showNotification('Seleccione un tipo de caso', 'error');
                caseTypeSelect.focus();
                return;
            }

            const payload = {
                project: projectInput.value.trim(),
                listingUrl: listingUrlInput.value.trim(),
                timestamp: dateInput.value, // Solo la fecha
                qaed: qaedInput.value.trim(),
                qaer: qaerInput.value.trim(),
                caseType: caseTypeSelect.value,
                message: messageTextarea.value,
                isSQAed: isSQAed,
                suggestQaChecked: suggestQaChecked
            };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            // Enviar datos a AppScript
            fetch(SQA_APPSCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: JSON.stringify(payload)
            })
            .then(() => {
                showNotification('Feedback enviado con éxito', 'success');
                modal.remove();
            })
            .catch(() => {
                showNotification('Error al enviar el feedback', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar';
            });
        });
    }

    // Manejador de clic en botones Save/Submit
    function handleSaveButtonClick(event) {
        if (!reportQaButtonExists()) return;
        const buttonText = event.target.textContent.trim();
        if (buttonText === 'Save' || buttonText === 'Submit QA Result') {
            //setTimeout(showSQAModal, 100);
        }
    }

    // Inicializar observador de eventos
    document.addEventListener('click', function(event) {
        if (event.target?.matches(SAVE_BUTTON_SELECTOR)) {
            handleSaveButtonClick(event);
        }
    });

    // CSS para animaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSQAModalHandler);
} else {
    initSQAModalHandler();
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
