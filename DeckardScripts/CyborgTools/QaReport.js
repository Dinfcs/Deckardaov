//==UserScript==
// @name       Qa Report
// @version     2.6
// @description Extrae la informacion para hacer qa del listado y la manda a la hoja de datos con appscrit
// @author      Lucho
// @match        https://cyborg.deckard.com/listing/*
// @grant       none
// ==/UserScript==


(function () {
    'use strict';

    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsaMYnVMK65UfAKsVg27_fqzzdALlYPwaBQeN-_nFUwSmLHG3GT14Kw5aif1AbC_5BrA/exec";
    const QAERS_URL = APPS_SCRIPT_URL + "?qaers";

function showNotification(message, color = "red") {
    let notification = document.createElement("div");
    notification.innerText = message;

    // Iconos según el color de la notificación (por ejemplo, verde para éxito y rojo para error)
    const icon = color === "red" ? "⚠️" : "✔️";
    notification.innerHTML = `<span style="font-size: 24px; margin-right: 10px;">${icon}</span>${message}`;

    Object.assign(notification.style, {
        position: "fixed",// Fija la notificación en la pantalla
        top: "50%",// Centrada verticalmente
        left: "50%",// Centrada horizontalmente
        transform: "translate(-50%, -50%)", // Ajuste perfecto al centro de la pantalla
        backgroundColor: color === "red" ? "#f44336" : "#4CAF50", // Rojo para error, verde para éxito
        color: "white",
        padding: "20px 30px",
        borderRadius: "12px",
        zIndex: "10000",// Asegura que la notificación esté encima de otros elementos
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: "18px",// Tamaño de fuente más grande
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)", // Sombra más prominente
        textAlign: "center",
        opacity: "0",// Inicialmente invisible
        transform: "translate(-50%, -50%) translateY(50px)", // Comienza desde más abajo
        transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out", // Transiciones suaves
    });

    document.body.appendChild(notification);

    // Animación de entrada (deslizar hacia arriba)
    setTimeout(() => {
        notification.style.opacity = "1";
        notification.style.transform = "translate(-50%, -50%) translateY(0)";
    }, 10); // Espera un poco para asegurar que la transición se aplique

    // Eliminar la notificación después de 3 segundos
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translate(-50%, -50%) translateY(50px)"; // Desliza hacia abajo antes de desaparecer
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);// Esperar el tiempo de la transición
    }, 3000);// Duración de la notificación visible
}



    function convertDate(isoFormat) {
        if (!isoFormat.match(/^\d{4}-\d{2}-\d{2}$/)) return "";
        let [year, month, day] = isoFormat.split("-");
        return `${day}/${month}/${year}`;
    }

    function getQaerFromPage() {
        return document.querySelector('#user_id')?.innerText.trim() || "";
    }

    function createReportLink() {
        let link = document.createElement("a");
        link.innerText = "Report QA |";
        link.href = "#"; // El enlace no llevará a ningún lado, solo ejecutará una acción
        link.style.cssText = `
            margin-left: 10px;
            margin-right: 10px;
            color: blue;
            cursor: pointer;
            text-decoration: none;
        `;
        link.onclick = extractData; // Ejecuta la función extractData cuando se hace clic en el enlace
        return link;
    }

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

    function checkQaerAndShowLink() {
        const CACHE_KEY = 'qaersData';
        const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutos de cache

        // Verificar si la información está en cache y no ha expirado
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_KEY + '_time');

        if (cachedData && cachedTime && (Date.now() - cachedTime) < CACHE_EXPIRATION_TIME) {
            // Usar datos de cache si no han expirado
            console.log("Using cached QAers data");
            processQaersData(JSON.parse(cachedData));
        } else {
            // Si no está en cache o está expirado, realizar la solicitud
            fetch(QAERS_URL)
                .then(response => response.json())
                .then(data => {
                if (!data.qaers || !Array.isArray(data.qaers)) {
                    throw new Error("Invalid JSON format");
                }

                // Cachear los datos recibidos
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                localStorage.setItem(CACHE_KEY + '_time', Date.now().toString());

                // Procesar los datos
                processQaersData(data);
            })
                .catch(error => {
                console.error("Error fetching QAers:", error);
                showNotification("Error fetching QAers", "red");
            });
        }

        function processQaersData(data) {
            let currentQaer = getQaerFromPage();
            if (data.qaers.includes(currentQaer)) {
                let userSection = document.getElementById("user_section");
                if (userSection) {
                    let link = createReportLink();
                    // Insertar el enlace antes del primer hijo dentro del div#user_section
                    userSection.insertBefore(link, userSection.firstChild);
                } else {
                    console.warn("User section not found.");
                }
            } else {
                console.warn(`QAer "${currentQaer}" not found in the list.`);
            }
        }
    }


function showEditWindow(data, onConfirm) {
    let errors = [
        "Structure", "Wrong APN", "Wrong Address Override", "Rental Override", "Bad APN",
        "Unit Box (If visible)", "Evidences", "Missing Address Override", "Missing MUS",
        "Property Manager Info (If required)", "Missing Address Override in an NMF Listing (If required)",
        "Verification Data", "QA Is Not Correct High", "QA Is Not Correct Low",
        "Wrong/ Not Required Unit Box", "Do Not Clear Previous Address Override In An NMF Listing"
    ];

    let modal = document.createElement("div");
    Object.assign(modal.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#f9f9f9",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        width: "450px",
        zIndex: "10000",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        opacity: 0, // Initial state for fade-in
        transform: "translate(-50%, -50%) scale(0.8)", // Start with a slight scale down
        transition: "all 0.3s ease", // Smooth transition for both opacity and scale
    });

    modal.innerHTML = `
        <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Review and Edit</h2>
        ${Object.entries(data).map(([key, value]) => `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <label style="color: #555; width: 40%;"><strong>${key}:</strong></label>
                <input id="input_${key}" type="text" value="${value}" style="width: 55%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; transition: border 0.3s ease;">
            </div>
        `).join("")}

        <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="color: #555; width: 40%;"><strong>Error:</strong></label>
            <select id="errorSelect" style="width: 55%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; transition: border 0.3s ease;">
                <option disabled selected>Select an option...</option>
                ${errors.map(err => `<option value="${err}">${err}</option>`).join("")}
            </select>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="color: #555; width: 40%;"><strong>Comments:</strong></label>
            <textarea id="commentInput" style="width: 55%; padding: 8px; height: 60px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; transition: border 0.3s ease;"></textarea>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="color: #555; width: 40%;"><strong>Possible Affected Listings:</strong></label>
            <input id="affectedListings" type="number" value="0" min="0" style="width: 55%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; transition: border 0.3s ease;">
        </div>

        <div style="display: flex; justify-content: space-between; gap: 10px;">
            <button id="btnAccept" style="flex: 1; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: background-color 0.3s ease;">Accept</button>
            <button id="btnCancel" style="flex: 1; padding: 10px 20px; background-color: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; transition: background-color 0.3s ease;">Cancel</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Animate the modal to fade in and scale up
    setTimeout(() => {
        modal.style.opacity = 1;
        modal.style.transform = "translate(-50%, -50%) scale(1)";
    }, 10);

    // Hover effects on buttons
    document.getElementById("btnAccept").addEventListener("mouseover", (e) => {
        e.target.style.backgroundColor = "#45a049";
    });
    document.getElementById("btnAccept").addEventListener("mouseout", (e) => {
        e.target.style.backgroundColor = "#4CAF50";
    });
    document.getElementById("btnCancel").addEventListener("mouseover", (e) => {
        e.target.style.backgroundColor = "#f44336";
    });
    document.getElementById("btnCancel").addEventListener("mouseout", (e) => {
        e.target.style.backgroundColor = "#f44336";
    });

    document.getElementById("btnAccept").addEventListener("click", () => {
         showNotification("Sending data, please wait...", "green");
        let editedData = {};
        Object.keys(data).forEach(key => {
            editedData[key] = document.getElementById(`input_${key}`).value.trim();
        });

        editedData.error = document.getElementById("errorSelect").value;
        editedData.comments = document.getElementById("commentInput").value.trim();
        editedData.possible_affected_listings = document.getElementById("affectedListings").value || "0";

        // Validations before accepting changes
        if (!editedData.listing.startsWith("http")) return showNotification("Invalid listing link", "red");
        if (!editedData.project) return showNotification("Project cannot be empty", "red");
        if (!editedData.qaer) return showNotification("QAer cannot be empty", "red");
        if (!editedData.qaed) return showNotification("QAed cannot be empty", "red");
        if (editedData.error === "Select an option...") return showNotification("You must select an error", "red");

        // Animate the modal to fade out and scale down before removal
        modal.style.opacity = 0;
        modal.style.transform = "translate(-50%, -50%) scale(0.8)";
        setTimeout(() => {
            document.body.removeChild(modal);
            onConfirm(editedData);
        }, 300); // Delay removal to let the animation finish
    });

    document.getElementById("btnCancel").addEventListener("click", () => {
        // Animate the modal to fade out and scale down before removal
        modal.style.opacity = 0;
        modal.style.transform = "translate(-50%, -50%) scale(0.8)";
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300); // Delay removal to let the animation finish
    });
}

    function extractData() {
        let secondaryInfo = [...document.querySelectorAll('span')]
            .find(el => el.textContent.trim() === "Secondary information");

        if (secondaryInfo) {
            secondaryInfo.click();
            setTimeout(() => {
                let rawDate = document.querySelector('[data-field-name="resolved_vetted_date"]')?.innerText.trim() || "";
                let data = {
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
                        .then(() => showNotification("Data sent successfully.", "green"))
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

    function extractQaEd() {
        let apnField = document.querySelector('[data-field-name="apn"] em');
        if (!apnField) return "";

        let match = apnField.innerText.match(/edited by (.*?) \d+ (days|months|years|hours|minutes|seconds) ago/);
        if (!match) match = apnField.innerText.match(/edited by (.*?) a (day|month|year|hour|minute|second) ago/);

        return match ? match[1] : "";
    }

    // Esperamos a que el 'user_section' aparezca en el DOM y luego ejecutamos el código
    waitForUserSection().then(() => {
        checkQaerAndShowLink();
    });
})();
