// ==UserScript==
// @name        Definitive QA
// @namespace   http://tampermonkey.net/
// @version     2.5
// @description Extracts information, allows review and editing before sending to Google Sheets, and displays a notification with strict validations.
// @author      You
// @match       https://cyborg.deckard.com/*
// @grant       none
// ==/UserScript==

(function () {
    'use strict';

    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsaMYnVMK65UfAKsVg27_fqzzdALlYPwaBQeN-_nFUwSmLHG3GT14Kw5aif1AbC_5BrA/exec";
    const QAERS_URL = APPS_SCRIPT_URL + "?qaers";

    function showNotification(message, color = "red") {
        let notification = document.createElement("div");
        notification.innerText = message;
        Object.assign(notification.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: color,
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            zIndex: "10000"
        });
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
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
        link.href = "#";  // El enlace no llevará a ningún lado, solo ejecutará una acción
        link.style.cssText = `
            margin-left: 10px;
            margin-right: 10px;
            color: blue;
            cursor: pointer;
            text-decoration: none;
        `;
        link.onclick = extractData;  // Ejecuta la función extractData cuando se hace clic en el enlace
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
        fetch(QAERS_URL)
            .then(response => response.json())
            .then(data => {
                if (!data.qaers || !Array.isArray(data.qaers)) {
                    throw new Error("Invalid JSON format");
                }

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
            })
            .catch(error => {
                console.error("Error fetching QAers:", error);
                showNotification("⚠️ Error fetching QAers", "red");
            });
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
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
            width: "400px",
            textAlign: "center",
            zIndex: "10000"
        });

        modal.innerHTML = `
            <h2>Review and Edit</h2>
            ${Object.entries(data).map(([key, value]) => `
                <label><strong>${key}:</strong></label>
                <input id="input_${key}" type="text" value="${value}" style="width: 100%; margin-bottom: 10px;">
            `).join("")}

            <label><strong>Error:</strong></label>
            <select id="errorSelect" style="width: 100%; margin-bottom: 10px;">
                <option disabled selected>Select an option...</option>
                ${errors.map(err => `<option value="${err}">${err}</option>`).join("")}
            </select>

            <label><strong>Comments:</strong></label>
            <textarea id="commentInput" style="width: 100%; height: 50px; margin-bottom: 10px;"></textarea>

            <label><strong>Possible Affected Listings:</strong></label>
            <input id="affectedListings" type="number" value="0" min="0" style="width: 100%; margin-bottom: 10px;">

            <button id="btnAccept" style="margin-right: 10px; padding: 10px;">Accept</button>
            <button id="btnCancel" style="padding: 10px;">Cancel</button>
        `;

        document.body.appendChild(modal);

        document.getElementById("btnAccept").addEventListener("click", () => {
            let editedData = {};
            Object.keys(data).forEach(key => {
                editedData[key] = document.getElementById(`input_${key}`).value.trim();
            });

            editedData.error = document.getElementById("errorSelect").value;
            editedData.comments = document.getElementById("commentInput").value.trim();
            editedData.possible_affected_listings = document.getElementById("affectedListings").value || "0";

            if (!editedData.listing.startsWith("http")) return showNotification("⚠️ Invalid listing link", "red");
            if (!editedData.project) return showNotification("⚠️ Project cannot be empty", "red");
            if (!editedData.qaer) return showNotification("⚠️ QAer cannot be empty", "red");
            if (!editedData.qaed) return showNotification("⚠️ QAed cannot be empty", "red");
            if (editedData.error === "Select an option...") return showNotification("⚠️ You must select an error", "red");

            document.body.removeChild(modal);
            onConfirm(editedData);
        });

        document.getElementById("btnCancel").addEventListener("click", () => {
            document.body.removeChild(modal);
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
                        .then(() => showNotification("✅ Data sent successfully.", "green"))
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
