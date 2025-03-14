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

    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsaMYnVMK65UfAKsVg27_fqzzdALlYPwaBQeN-_nFUwSmLHG3GT14Kw5aif1AbC_5BrA/exec";
    const QAERS_URL = APPS_SCRIPT_URL + "?qaers";
    const CACHE_KEY = 'qaersData';
    const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutos de cache

    // Función para mostrar notificaciones
    function showNotification(message, color = "red") {
        const notification = document.createElement("div");
        notification.innerHTML = `<span style="font-size: 24px; margin-right: 10px;">${color === "red" ? "⚠️" : "✔️"}</span>${message}`;

        Object.assign(notification.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: color === "red" ? "#f44336" : "#4CAF50",
            color: "white",
            padding: "20px 30px",
            borderRadius: "12px",
            zIndex: "10000",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontSize: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
            opacity: "0",
            transform: "translate(-50%, -50%) translateY(50px)",
            transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = "1";
            notification.style.transform = "translate(-50%, -50%) translateY(0)";
        }, 10);

        setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transform = "translate(-50%, -50%) translateY(50px)";
            setTimeout(() => document.body.removeChild(notification), 500);
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

    // Función para verificar el QAer y mostrar el enlace
    async function checkQaerAndShowLink() {
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_KEY + '_time');

        if (cachedData && cachedTime && (Date.now() - cachedTime) < CACHE_EXPIRATION_TIME) {
            processQaersData(JSON.parse(cachedData));
        } else {
            try {
                const response = await fetch(QAERS_URL);
                const data = await response.json();
                if (!data.qaers || !Array.isArray(data.qaers)) throw new Error("Invalid JSON format");

                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_KEY + '_time', Date.now().toString());
                processQaersData(data);
            } catch (error) {
                console.error("Error fetching QAers:", error);
                showNotification("Error fetching QAers", "red");
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
            "Structure": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Verifiqué los registros y noté que la estructura asignada no es la correcta. En este caso la adecuada es ${dynamicFields.structure || "(aquí va la estructura correcta)"}. Te recomiendo revisarlo más a detalle. ¡Gracias! Att: ${qaer}`,
            "Wrong APN": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que el APN no es correcto. Por favor, mis motivos son: ${dynamicFields.reasons || "(aquí van los motivos)"}. ¡Muchas Gracias! Att: ${qaer}`,
            "Wrong Address Override": `¡Hola ${qaed}! Espero que estés teniendo un buen día. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. La identificación fue precisa y la evidencia espectacular. Sin embargo, al revisarla, noté que el Address Override no es correcto. Por favor, en este caso sería: ${dynamicFields.correctAddress || "(aquí va el address correcto)"}. ¡Muchas Gracias! Att: ${qaer}`,
            "Rental Override": `Hola ${qaed}, espero que estés bien. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. ////////////////////////////////. ¡Gracias! Att: ${qaer}`,
            "Bad APN": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. El APN registrado tiene un formato erróneo por lo que generó una Bad APN. Trata de verificar siempre en los PR para evitar este tipo de errores. ¡Muchas gracias! Att: ${qaer}`,
            "Unit Box (If visible)": `¡Saludos ${qaed}!, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <${link}|esta propiedad tuya> en ${project}. Noté que omitiste llenar el campo 'Unit Box'. En este caso era: ${dynamicFields.unitBox || "(aquí va el unit box)"}. Recuerda que este campo es importante para separar las Property Cards en RS. Este puede estar en las imágenes o en la descripción del listing. Tenlo presente para una próxima vez. ¡Muchas gracias! Att: ${qaer}`,
            "Evidences": `Hola ${qaed}, espero que todo esté bien. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que faltan algunas evidencias necesarias. Por favor, asegúrate de incluir toda la información requerida. ¡Gracias! Att: ${qaer}`,
            "Missing Address Override": `Saludos ${qaed}, espero que todo esté bien. Revisando Random QA, encontré <${link}|esta propiedad tuya> en ${project}. Noté que faltó hacerle Address Override. Asegúrate de agregarlo cuando sea necesario. ¡Muchas gracias! Att: ${qaer}`,
            "Missing MUS": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que falta información en el campo MUS. Aun cuando en important info estaba la instrucción, sé que son detalles que a veces se nos pasan y que estarás más pendiente de esto. ¡Gracias! Att: ${qaer}`,
            "Property Manager Info (If required)": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que falta la información del Property Manager. Por favor, asegúrate de agregarla si es requerida. ¡Gracias! Att: ${qaer}`,
            "Missing Address Override in an NMF Listing (If required)": `¡Saludos ${qaed}!, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <${link}|esta propiedad tuya> en ${project}. Está muy bien identificada, sin embargo, olvidaste agregar el Address Override. Ten presente que si la propiedad es un condominio y se consigue fácilmente pero no consigues la unidad, debes dejar el NMF con el Unit # unk. ¡Muchas gracias! Att: ${qaer}`,
            "Verification Data": `¡Hola ${qaed}! Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Noté que falta información en los datos de verificación. Por favor, siempre es bueno asegurarse de que toda la información sea correcta. ¡Gracias! Att: ${qaer}`,
            "QA Is Not Correct High": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad> en ${project} la cual marcaste con QAok. Noté que el QAok no es correcto. Mis motivos son: ${dynamicFields.reasons || "(aquí van los motivos)"}. ¡Gracias! Att: ${qaer}`,
            "QA Is Not Correct Low": `Hola ${qaed}, hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project} la cual marcaste con QAok. Noté que la QA no es correcta. Mis motivos son: ${dynamicFields.reasons || "(aquí van los motivos)"}. ¡Gracias! Att: ${qaer}`,
            "Wrong/ Not Required Unit Box": `¡Hola ${qaed}! Espero que estés teniendo un buen día. Hoy estoy realizando Random QA y encontré <${link}|esta propiedad tuya> en ${project}. Hiciste un buen trabajo identificando la propiedad, sin embargo, noté que dejaste ${dynamicFields.unitBox || "(aquí va el unit box)"} en el Unit Box cuando no era necesario. ¡Muchas Gracias! Att: ${qaer}`,
            "Do Not Clear Previous Address Override In An NMF Listing": `¡Saludos ${qaed}!, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <${link}|esta propiedad tuya> en ${project}. Noté que no eliminaste el Address Override anterior en un listing de NMF. Asegúrate de revisarlo y corregirlo. ¡Muchas gracias! Att: ${qaer}`
        };

        return feedbackTemplates[error] || "Por favor, revisa los detalles del error.";
    }

    // Función para mostrar la ventana de edición
    function showEditWindow(data, onConfirm) {
        const errors = [
            "Structure", "Wrong APN", "Wrong Address Override", "Rental Override", "Bad APN",
            "Unit Box (If visible)", "Evidences", "Missing Address Override", "Missing MUS",
            "Property Manager Info (If required)", "Missing Address Override in an NMF Listing (If required)",
            "Verification Data", "QA Is Not Correct High", "QA Is Not Correct Low", "Wrong/ Not Required Unit Box",
            "Do Not Clear Previous Address Override In An NMF Listing"
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
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Review and Edit</h2>
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
                        <button id="btnAccept" style="flex: 1; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: background-color 0.3s ease;">Accept</button>
                        <button id="btnCancel" style="flex: 1; padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: background-color 0.3s ease;">Cancel</button>
                    </div>
                </div>
                <div style="flex: 1; min-width: 300px;">
                    <div style="display: flex; flex-direction: column; align-items: flex-start; width: 100%;">
                        <label style="color: #555; width: 100%;"><strong>Comments:</strong></label>
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

        btnAccept.addEventListener("mouseover", () => btnAccept.style.backgroundColor = "#45a049");
        btnAccept.addEventListener("mouseout", () => btnAccept.style.backgroundColor = "#4CAF50");
        btnCancel.addEventListener("mouseover", () => btnCancel.style.backgroundColor = "#da190b");
        btnCancel.addEventListener("mouseout", () => btnCancel.style.backgroundColor = "#f44336");

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
                    project: document.querySelector('td[style*="cursor: pointer;"]')?.innerText.trim() || "",
                    qaer: getQaerFromPage(),
                    qaed: extractQaEd(),
                    listing: window.location.href
                };

                showEditWindow(data, (finalData) => {
                    fetch(APPS_SCRIPT_URL, {
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
