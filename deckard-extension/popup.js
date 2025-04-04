document.addEventListener("DOMContentLoaded", function () {
    const scriptsContainer = document.getElementById("scriptsContainer");
    const refreshButton = document.getElementById("refreshScripts");
    const versionInfo = document.getElementById("versionInfo");
    const statusContainer = document.getElementById("statusContainer");
    const currentUrlDisplay = document.getElementById("currentUrl");

    // Función para mostrar mensajes de estado
    function showStatus(message, type = "info") {
        statusContainer.textContent = message;
        statusContainer.className = `status ${type}`;
        statusContainer.style.display = "block";

        setTimeout(() => {
            statusContainer.style.opacity = "0";
            setTimeout(() => {
                statusContainer.style.display = "none";
                statusContainer.style.opacity = "1";
            }, 500);
        }, 3000);
    }

    // Función para actualizar el contador de scripts
    function updateScriptStats(scriptsCount) {
        const scriptStats = document.getElementById("scriptStats");
        if (scriptsCount > 0) {
            scriptStats.textContent = `${scriptsCount} scripts cargados`;
        } else {
            scriptStats.textContent = "No hay scripts disponibles";
        }
    }

    // Función para cargar y mostrar la información de la última actualización
    function loadVersionInfo() {
        chrome.storage.local.get(["lastUpdated"], (data) => {
            if (data.lastUpdated) {
                const date = new Date(data.lastUpdated);
                const formattedDate = date.toLocaleString();
                versionInfo.textContent = `Última actualización: ${formattedDate}`;
            } else {
                versionInfo.textContent = "Sin información de actualización";
            }
        });
    }

    // Función para cargar y mostrar scripts que coinciden con la URL actual
    function loadScripts() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs.length === 0) return;
            const currentUrl = tabs[0].url;

            // Mostrar la URL actual
            currentUrlDisplay.textContent = currentUrl;

            chrome.storage.local.get(["scriptsCache", "enabledScripts"], (data) => {
                scriptsContainer.innerHTML = "";

                if (!data.scriptsCache || Object.keys(data.scriptsCache).length === 0) {
                    scriptsContainer.innerHTML = "<p class='no-scripts'>No hay scripts almacenados.</p>";
                    updateScriptStats(0); // Actualizar el estado
                    return;
                }

                let foundScripts = false;
                let scriptsCount = 0;

                for (const [urlPattern, scripts] of Object.entries(data.scriptsCache)) {
                    if (matchUrlPattern(currentUrl, urlPattern)) {
                        foundScripts = true;
                        scriptsCount += scripts.length;

                        scripts.forEach(({ scriptUrl, content }) => {
                            const scriptName = scriptUrl.split('/').pop();

                            const container = document.createElement("div");
                            container.classList.add("script-container");

                            const title = document.createElement("div");
                            title.classList.add("script-title");
                            title.innerHTML = `
                                <span class="pattern-text">${scriptName}</span>
                            `;

                            // Interruptor para habilitar/deshabilitar
                            const toggle = document.createElement("input");
                            toggle.type = "checkbox";
                            toggle.checked = data.enabledScripts?.[scriptUrl] ?? true;
                            toggle.addEventListener("change", () => {
                                chrome.storage.local.get(["enabledScripts"], (result) => {
                                    const enabledScripts = result.enabledScripts || {};
                                    enabledScripts[scriptUrl] = toggle.checked;
                                    chrome.storage.local.set({ enabledScripts }, () => {
                                        showStatus(`Script ${toggle.checked ? "habilitado" : "deshabilitado"}`, "success");
                                    });
                                });
                            });

                            title.appendChild(toggle);
                            container.appendChild(title);
                            scriptsContainer.appendChild(container);
                        });
                    }
                }

                if (!foundScripts) {
                    scriptsContainer.innerHTML = "<p class='no-scripts'>No hay scripts activos para esta página.</p>";
                }

                // Actualizar el contador de scripts
                updateScriptStats(scriptsCount);
            });
        });
    }

    // Función para hacer match entre la URL y el patrón
    function matchUrlPattern(url, pattern) {
        try {
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            return regex.test(url);
        } catch (e) {
            console.error("Error en el patrón regex:", e);
            return false;
        }
    }

    // Evento para actualizar los scripts al hacer clic en el botón
    refreshButton.addEventListener("click", function () {
        refreshButton.textContent = "⏳ Actualizando...";
        refreshButton.disabled = true;

        chrome.runtime.sendMessage({ action: "updateScripts" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error al actualizar scripts:", chrome.runtime.lastError);
                refreshButton.textContent = "❌ Error";
                showStatus("Error al actualizar scripts", "error");

                setTimeout(() => {
                    refreshButton.textContent = "🔄 Actualizar";
                    refreshButton.disabled = false;
                }, 2000);
            } else {
                console.log("Respuesta del background.js:", response);

                setTimeout(() => {
                    refreshButton.textContent = "✅ Actualizado";
                    showStatus("Scripts actualizados correctamente", "success");

                    // Recargar la información
                    loadScripts();
                    loadVersionInfo();

                    setTimeout(() => {
                        refreshButton.textContent = "🔄 Actualizar";
                        refreshButton.disabled = false;
                    }, 2000);
                }, 1000);
            }
        });
    });

    // Abrir el dashboard en una nueva pestaña
    document.getElementById("openDashboard").addEventListener("click", () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL("dashboard.html"),
        });
    });

    // Cargar scripts e información al abrir el popup
    loadScripts();
    loadVersionInfo();
});