// ==UserScript==
// @name      Ramdon Qa Report App
// @version     2.5
// @description
// @author      Lucho
// @match        https://cyborg.deckard.com/listing/*
// @grant       none
// ==/UserScript==

(function () {
    'use strict';
    const urlcodeverg = window.location.href;
    const Codeverg = "https://script.google.com/macros/s/AKfycbzsaMYnVMK65UfAKsVg27_fqzzdALlYPwaBQeN-_nFUwSmLHG3GT14Kw5aif1AbC_5BrA/exec";
    const MINIONS = Codeverg + "?qaers";
    const CACHE_DATA = 'qaersData';
    const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutos de cache
    const PROJECT_NAME_PATTERNS = [
    { regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/, format: m => `AUS - ${m[2].replace(/_/g, ' ') === 'Bass Coast' ? m[2].replace(/_/g, ' ') : 'City of ' + capitalizeWords(m[2].replace(/_/g, ' '))}` },
    { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${capitalizeWords(m[4].replace(/_/g, ' '))}` },
    { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[2].replace(/_/g, ' '))} County` },
    { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[3].replace(/_/g, ' '))}` }];

    function getProjectNameFromUrl() {
        const url = window.location.href;
        for (const { regex, format } of PROJECT_NAME_PATTERNS) {
            const match = url.match(regex);
            if (match) return format(match);
        }
        return null;
    }

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

   function showNotification(message, color = "red") {
    const notification = Object.assign(document.createElement("div"), {
        innerHTML: `<span style="font-size: 24px; margin-right: 10px;">
                        ${color === "red" ? "⚠️" : "✔️"}
                    </span>${message}`,
        style: `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) translateY(50px);
            background: ${color === "red" ? "#f44336" : "#4CAF50"};
            color: white;
            padding: 16px 24px;
            border-radius: 10px;
            z-index: 10000;
            font: 16px 'Segoe UI', sans-serif;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            text-align: center;
            opacity: 0;
            transition: opacity 0.4s, transform 0.4s;
        `
    });

    document.body.appendChild(notification);
    setTimeout(() => Object.assign(notification.style, { opacity: "1", transform: "translate(-50%, -50%)" }), 10);
    setTimeout(() => {
        Object.assign(notification.style, { opacity: "0", transform: "translate(-50%, -50%) translateY(50px)" });
        setTimeout(() => notification.remove(), 400);
    }, 2000);
}

    // Función para convertir fechas
    function convertDate(isoFormat) {
        if (!isoFormat.match(/^\d{4}-\d{2}-\d{2}$/)) return "";
        const [year, month, day] = isoFormat.split("-");
        return `${day}/${month}/${year}`;
    }

    // Función para obtener el QAer de la página
    function getQaerFromPage() {
        return document.querySelector('#user_id')?.innerText.trim() || "";
    }

    // Función para obtener el primer nombre y primer apellido del QAer
    function getQaerNameShort() {
        const userIdElement = document.querySelector('#user_id');
        if (!userIdElement) return "Desconocido";

        const fullName = userIdElement.innerText.trim();
        const nameParts = fullName.split(" ");

        if (nameParts.length >= 3) {
            return `${nameParts[0]} ${nameParts[2]}`; // Primer nombre + segundo nombre
        } else {
            return fullName; // Si el formato no es el esperado, regresa el texto completo
        }
    }

    // Función para crear el enlace de reporte
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
        link.onclick = extractData;
        return link;
    }

    // Función para esperar a que aparezca la sección de usuario
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

    // Función para verificar minions
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
                showNotification("Error fetching Minions", "red");
            }
        }

        function processQaersData(data) {
            const currentQaer = getQaerFromPage();
            if (data.qaers.includes(currentQaer)) {
                const userSection = document.getElementById("user_section");
                if (userSection) {
                    const link = createReportLink();
                    userSection.insertBefore(link, userSection.firstChild);
                } else {
                    console.warn("User section not found.");
                }
            } else {
                console.warn(`QAer "${currentQaer}" not found in the list.`);
            }
        }
    }

    // Función para generar feedback
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

    // Función para mostrar la ventana de edición
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
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: "10000",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
        });

        const modalContent = document.createElement("div");
        Object.assign(modalContent.style, {
            background: "#f9f9f9",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            width: "90%",
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            opacity: 0,
            transform: "scale(0.8)",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
        });

        modalContent.innerHTML = `
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Random QA Report</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 300px;">
                    ${Object.entries(data).map(([key, value]) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <label style="color: #555; width: 40%;"><strong>${key}:</strong></label>
                            <input id="input_${key}" type="text" value="${value}" style="width: 55%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; transition: border 0.3s ease;">
                        </div>
                    `).join("")}

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <label style="color: #555; width: 40%;"><strong>Error:</strong></label>
                        <select id="errorSelect" style="width: 55%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; transition: border 0.3s ease;">
                            <option disabled selected>Select an option...</option>
                            ${errors.map(err => `<option value="${err}">${err}</option>`).join("")}
                        </select>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <label style="color: #555; width: 40%;"><strong>Possible Affected Listings:</strong></label>
                        <input id="affectedListings" type="number" value="0" min="0" style="width: 55%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; transition: border 0.3s ease;">
                    </div>
                    <div id="dynamicFieldsContainer" style="display: flex; flex-direction: column; gap: 10px;"></div>
                    <div style="display: flex; justify-content: space-around; gap: 10px; margin-top: 20px;">
                        <button id="btnAccept" style="flex: 1; padding: 12px 24px; background-color: #CAD92B; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; ">Accept</button>
                        <button id="btnCancel" style="flex: 1; padding: 12px 24px; background-color: #23A9D8; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; ">Cancel</button>
                          <a href="https://docs.google.com/spreadsheets/d/14N1pWw7fVIDgTko2A7faqbmkPVXM8LnHaeR0bd_TGxw/edit?gid=0#gid=0" target="_blank" style="flex: 1; padding: 12px 24px; background-color:rgb(90, 93, 94); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; text-decoration: none; display: flex; justify-content: center; align-items: center;">Database</a>
                    </div>

                </div>
                <div style="flex: 1; min-width: 300px;">
                    <div style="display: flex; flex-direction: column; align-items: flex-start; width: 100%;">
                        <label style="color: #555; width: 100%;"><strong>FeedBack:</strong></label>
                        <textarea id="commentInput" style="width: calc(100% - 16px); padding: 8px; height: 120px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; transition: border 0.3s ease; margin-bottom: 10px;"></textarea>
                        <label style="color: #555; width: 100%;"><strong>Preview:</strong></label>
                        <div id="commentPreview" style="width: calc(100% - 16px); padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; background-color: #fff; min-height: 60px; word-wrap: break-word;"></div>
                    </div>
                </div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        const errorSelect = document.getElementById("errorSelect");
        const commentInput = document.getElementById("commentInput");
        const commentPreview = document.getElementById("commentPreview");
        const btnAccept = document.getElementById("btnAccept");
        const btnCancel = document.getElementById("btnCancel");
        const dynamicFieldsContainer = document.getElementById("dynamicFieldsContainer");

        function updatePreview() {
            let text = commentInput.value;
            text = text.replace(/<(.*)\|(.*)>/g, '<a href="$1" target="_blank">$2</a>');
            commentPreview.innerHTML = text;
        }

        function updateDynamicFields(error) {
            dynamicFieldsContainer.innerHTML = ""; // Limpiar campos dinámicos anteriores

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
                    div.style.marginBottom = "10px";

                    div.innerHTML = `
                        <label style="color: #555; width: 40%;"><strong>${field.label}</strong></label>
                        <input id="${field.id}" type="text" style="width: 55%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; transition: border 0.3s ease;">
                    `;

                    dynamicFieldsContainer.appendChild(div);
                });
            }
        }

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

        errorSelect.addEventListener("change", function () {
            updateDynamicFields(this.value);
            updateFeedback();
        });

        dynamicFieldsContainer.addEventListener("input", updateFeedback);

        setTimeout(() => {
            modalContent.style.opacity = 1;
            modalContent.style.transform = "scale(1)";
        }, 10);

        btnAccept.addEventListener("click", () => {
            const editedData = {};
            Object.keys(data).forEach(key => {
                editedData[key] = document.getElementById(`input_${key}`).value.trim();
            });

            editedData.error = errorSelect.value;
            editedData.comments = document.getElementById("commentPreview").innerText;
            editedData.possible_affected_listings = document.getElementById("affectedListings").value || "0";

            if (!editedData.listing.startsWith("http")) { showNotification("Invalid listing link", "red"); return; }
            if (!editedData.project) { showNotification("Project cannot be empty", "red"); return; }
            if (!editedData.qaer) { showNotification("QAer cannot be empty", "red"); return; }
            if (!editedData.qaed) { showNotification("QAed cannot be empty", "red"); return; }
            if (editedData.error === "Select an option...") { showNotification("You must select an error", "red"); return; }

            showNotification("Recording data, please wait...", "green");

            modalContent.style.opacity = 0;
            modalContent.style.transform = "scale(0.8)";
            setTimeout(() => {
                document.body.removeChild(modal);
                onConfirm(editedData);
            }, 300);
        });

        btnCancel.addEventListener("click", () => {
            modalContent.style.opacity = 0;
            modalContent.style.transform = "scale(0.8)";
            setTimeout(() => document.body.removeChild(modal), 300);
        });
    }

    // Función para extraer datos
    function extractData() {
        const secondaryInfo = [...document.querySelectorAll('span')].find(el => el.textContent.trim() === "Secondary information");

        if (secondaryInfo) {
            secondaryInfo.click();
            setTimeout(() => {
                const rawDate = document.querySelector('[data-field-name="resolved_vetted_date"]')?.innerText.trim() || "";
                const data = {
                    date: new Date().toLocaleDateString("en-GB"),
                    date_of_mapping: convertDate(rawDate),
                    project: getProjectNameFromUrl(), // Usar la nueva función para obtener el proyecto
                    qaer: getQaerNameShort(),
                    qaed: extractQaEd(),
                    listing: window.location.href,
                    urlcodeverg: urlcodeverg 
                };

                showEditWindow(data, (finalData) => {
                    fetch(Codeverg, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(finalData)
                    })
                        .then(() => showNotification("Data registered successfully.", "green"))
                        .catch(error => {
                        console.error("❌ Error sending data:", error);
                        alert("Error sending data. Check the console.");
                    });
                });
            }, 1000);
        } else {
            showNotification("⚠️ 'Secondary information' not found.");
        }
    }

    // Función para extraer el QAed
    function extractQaEd() {
        const apnField = document.querySelector('[data-field-name="apn"] em');
        if (!apnField) return "";

        const match = apnField.innerText.match(/edited by (.*?) \d+ (days|months|years|hours|minutes|seconds) ago/) ||
                      apnField.innerText.match(/edited by (.*?) a (day|month|year|hour|minute|second) ago/);

        return match ? match[1] : "";
    }

    // Esperar a que el 'user_section' aparezca en el DOM y luego ejecutar el código
    waitForUserSection().then(() => {
        checkQaerAndShowLink();
    });
})();
