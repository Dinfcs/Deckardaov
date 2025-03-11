// ==UserScript==
// @name         Qaproductivity Form
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Agrega un enlace para registrar productividad QA en Sheets
// @author       Luis Escalante
// @match        https://cyborg.deckard.com/listing/*?tab=picked_for_qa&subset=pending_qa
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const PROJECT_NAME_PATTERNS = [
        { regex: /\/listing\/AUS\/([^\/]+)\/([^\/]+)\/(STR[^\/]+)/, format: m => `AUS - ${m[2].replace(/_/g, ' ') === 'Bass Coast' ? m[2].replace(/_/g, ' ') : 'City of ' + capitalizeWords(m[2].replace(/_/g, ' '))}` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\.\.\.(town|township)_of_([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${m[3].charAt(0).toUpperCase() + m[3].slice(1)} Of ${capitalizeWords(m[4].replace(/_/g, ' '))}` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[2].replace(/_/g, ' '))} County` },
        {
            regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)(?:\/|\?|$)/,
            format: m => {
                const cleaned = m[3].split('?')[0]; // Elimina cualquier cosa después de "?"
                return `${m[1].toUpperCase()} - ${capitalizeWords(cleaned.replace(/_/g, ' '))}`;
            }
        }
    ];

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function getProjectNameFromUrl() {
        const url = window.location.href;
        for (const { regex, format } of PROJECT_NAME_PATTERNS) {
            const match = url.match(regex);
            if (match) return format(match);
        }
        return "Desconocido";
    }


    function insertQaLink() {
        const userSection = document.getElementById("user_section");
        const userIdSpan = document.getElementById("user_id");

        if (userSection && userIdSpan) {
            const qaLink = document.createElement("a");
            qaLink.innerText = "QaProductivity | ";
            qaLink.href = "#";
            qaLink.style.marginRight = "10px";
            qaLink.style.color = "#007bff";
            qaLink.style.cursor = "pointer";

            userSection.insertBefore(qaLink, userIdSpan);

            qaLink.addEventListener("click", function(event) {
                event.preventDefault();
                openQaForm();
            });
        } else {
            setTimeout(insertQaLink, 500);
        }
    }

    function getProjectListings() {
        const listingsSpan = document.getElementById("label_num_of_rows_in_the_table");
        if (listingsSpan) {
            const match = listingsSpan.innerText.match(/\d+/);
            return match ? match[0] : "No disponible";
        }
        return "No disponible";
    }

    function getQaerName() {
        const userIdSpan = document.getElementById("user_id");
        if (!userIdSpan) return "Desconocido";

        const fullName = userIdSpan.innerText.trim();
        const nameParts = fullName.split(" ");

        if (nameParts.length === 4) {
            return `${nameParts[0]} ${nameParts[2]}`; // Primer nombre + primer apellido
        } else if (nameParts.length === 3) {
            return `${nameParts[0]} ${nameParts[1]}`; // Primer nombre + primer apellido
        } else {
            return fullName; // En caso de que tenga una estructura diferente, lo dejamos como está
        }
    }


    function showNotification(message, isSuccess = true) {
        const notification = document.createElement("div");
        notification.innerText = message;
        notification.style.position = "fixed";
        notification.style.top = "50%";
        notification.style.left = "50%";
        notification.style.transform = "translate(-50%, -50%)";
        notification.style.background = isSuccess ? "#4CAF50" : "#f44336";
        notification.style.color = "white";
        notification.style.padding = "15px 20px";
        notification.style.borderRadius = "8px";
        notification.style.boxShadow = "0px 4px 10px rgba(0,0,0,0.2)";
        notification.style.zIndex = "10001";
        notification.style.fontSize = "16px";
        notification.style.fontWeight = "bold";
        notification.style.textAlign = "center";

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function openQaForm() {
        const projectListings = getProjectListings();
        const qaerName = getQaerName();
        const projectName = getProjectNameFromUrl(); // Obtener nombre del proyecto desde la URL

        const formHTML = `
            <div id="qaFormContainer" style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
                background:white; padding:20px; box-shadow:0px 10px 20px rgba(0,0,0,0.2); border-radius:8px; z-index:10000;
                width: 350px; font-family: Arial, sans-serif; border: 1px solid #ddd;">
                <h3 style="margin:0 0 10px; text-align:center; font-size:18px; color:#333;">Registrar QA Productivity</h3>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <label>QAer: <input id="qaer" type="text" value="${qaerName}" style="width:100%; padding:5px; border:1px solid #ccc; border-radius:5px;"></label>
                    <label>Project Name: <input id="projectName" type="text" value="${projectName}" style="width:100%; padding:5px; border:1px solid #ccc; border-radius:5px;"></label>
                    <label>Picked for QA: <input id="PickedForQA" type="text" value="${projectListings}" style="width:100%; padding:5px; border:1px solid #ccc; border-radius:5px;"></label>
                    <label>Reviewed Listings: <input id="reviewedListings" type="number" style="width:100%; padding:5px; border:1px solid #ccc; border-radius:5px;" required></label>
                    <label>Dups Reviewed: <input id="daupsReviewed" type="number" value="0" style="width:100%; padding:5px; border:1px solid #ccc; border-radius:5px;"></label>
                    <label>Time in other activities: <input id="timeActivities" type="number" value="0" style="width:100%; padding:5px; border:1px solid #ccc; border-radius:5px;"></label>
                    <label>Comments: <textarea id="comments" style="width:100%; padding:5px; border:1px solid #ccc; border-radius:5px;"></textarea></label>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:15px;">
                    <button id="sendQAData" style="background:#007bff; color:white; padding:8px 12px; border:none; border-radius:5px; cursor:pointer;">Enviar</button>
                    <button id="closeQAForm" style="background:#ccc; color:black; padding:8px 12px; border:none; border-radius:5px; cursor:pointer;">Cerrar</button>
                </div>
            </div>`;

        const formContainer = document.createElement("div");
        formContainer.innerHTML = formHTML;
        document.body.appendChild(formContainer);

        document.getElementById("closeQAForm").addEventListener("click", function() {
            formContainer.remove();
        });

        document.getElementById("sendQAData").addEventListener("click", function() {
            const payload = {
                QAer: document.getElementById("qaer").value,
                Projectname: document.getElementById("projectName").value,
                PickedForQA: document.getElementById("PickedForQA").value,
                ReviewedListings: document.getElementById("reviewedListings").value || 0,
                DupsReviewed: document.getElementById("daupsReviewed").value || 0,
                TimeActivities: document.getElementById("timeActivities").value || 0,
                Comments: document.getElementById("comments").value || ""
            };

            fetch("https://script.google.com/macros/s/AKfycbz4veiev0kMLtLY7s5olqv9Vb6UQbwNOFHM1DnZ2_zV5_BkmjeQyjW4k7adOQ82jVLWVA/exec", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                mode: "no-cors",
                body: JSON.stringify(payload)
            })
            .then(() => {
                showNotification("✅ Datos enviados correctamente");
            })
            .catch(error => {
                showNotification("❌ Error al enviar los datos", false);
                console.error(error);
            });

            formContainer.remove();
        });
    }

    insertQaLink();
})();
