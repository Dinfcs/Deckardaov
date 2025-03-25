// ==UserScript==
// @name         QaProductivity2
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Captura datos de QA, envía a Google Apps Script y valida "Report QA"
// @match        https://cyborg.deckard.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function getProjectNameFromUrl() {
        const url = window.location.href;
        const patterns = [
            { regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/, format: m => `AUS - ${m[2].replace(/_/g, ' ') === 'Bass Coast' ? m[2].replace(/_/g, ' ') : 'City of ' + capitalizeWords(m[2].replace(/_/g, ' '))}` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${capitalizeWords(m[4].replace(/_/g, ' '))}` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[2].replace(/_/g, ' '))} County` },
            { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[3].replace(/_/g, ' '))}` }
        ];
        for (const { regex, format } of patterns) {
            const match = url.match(regex);
            if (match) return format(match);
        }
        return "Unknown Project";
    }

    function cleanText(text) {
        return text.toLowerCase().trim().replace(/\s+/g, " ");
    }

    function showNotification() {
        const notification = document.createElement("div");
        notification.textContent = "Data Registered";
        notification.style.position = "fixed";
        notification.style.top = "50%";
        notification.style.left = "50%";
        notification.style.transform = "translate(-50%, -50%)";
        notification.style.background = "#28a745"; // Verde
        notification.style.color = "#fff"; // Blanco
        notification.style.padding = "10px 20px";
        notification.style.borderRadius = "5px";
        notification.style.fontSize = "16px";
        notification.style.fontWeight = "bold";
        notification.style.zIndex = "9999";
        notification.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000); // Desaparece en 3 segundos
    }

    let projectName = "";
    let qaer = "";
    let comments = "";
    let dataUrl = "";

    function extractData() {
        qaer = document.querySelector("#user_id")?.textContent.trim() || "Desconocido";
        projectName = getProjectNameFromUrl();
        dataUrl = window.location.href;
        let commentsTextarea = document.querySelector('textarea[name="verification_comments"]');
        comments = commentsTextarea ? commentsTextarea.value.trim() : "Sin comentarios";
    }

    function validateAndExtractAgain(callback) {
        extractData();
        if (!qaer || !projectName || !comments || !dataUrl) {
            console.warn("⚠️ Algunos datos están vacíos, intentando obtenerlos nuevamente...");
            setTimeout(() => {
                extractData();
                console.log("🔄 Datos reintentados:", { qaer, projectName, comments, dataUrl });
                callback();
            }, 500); // Esperar medio segundo y volver a intentar
        } else {
            callback();
        }
    }

    function initializeScript() {
        console.log("✅ Report QA detectado, activando script...");

        document.addEventListener("click", function(event) {
            if (event.target.id === "btn_open_vetting_dlg") {
                extractData();
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
                                }, 1500); // Espera 1.5 segundos antes de hacer clic
                            } else {
                                console.log("⚠️ No se encontró el botón Report QA");
                            }
                        }

                        let payload = new FormData();
                        payload.append("Projectname", projectName || "Unknown Project");
                        payload.append("QAer", qaer || "Desconocido");
                        payload.append("Comments", comments || "Sin comentarios");
                        payload.append("dataUrl", dataUrl || "No disponible");

                        fetch("https://script.google.com/macros/s/AKfycbwFpD504asAX9UbOI43plFJ8NUhezB13g6TNWhhh3jlmh9NYcOz7BN89i6zzcb8QujH/exec", {
                            method: "POST",
                            body: payload,
                            mode: "no-cors"
                        })
                        .then(() => {
                            console.log("✅ Datos enviados a AppScript");
                            showNotification(); // Mostrar notificación al enviar datos
                        })
                        .catch(error => console.error("❌ Error al enviar datos:", error));
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
                initializeScript();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    watchForReportQaButton();
})();
