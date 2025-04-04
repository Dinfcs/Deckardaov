document.addEventListener("DOMContentLoaded", function () {
    const scriptDropdown = document.getElementById("scriptDropdown");
    const scriptForm = document.getElementById("scriptForm");
    const scriptNameInput = document.getElementById("scriptName");
    const scriptUrlPatternInput = document.getElementById("scriptUrlPattern");
    const scriptRunAtInput = document.getElementById("scriptRunAt");
    const scriptCodeInput = document.getElementById("scriptCode");
    const saveScriptBtn = document.getElementById("saveScriptBtn");
    const deleteScriptBtn = document.getElementById("deleteScriptBtn");

    let currentScriptUrl = null; // Almacena el script seleccionado

    // Función para ajustar la altura del textarea dinámicamente
    function adjustTextareaHeight() {
        scriptCodeInput.style.height = "auto";
        scriptCodeInput.style.height = (scriptCodeInput.scrollHeight * 1.02) + "px";
    }

    scriptCodeInput.addEventListener("input", adjustTextareaHeight);

    // Función para extraer metadatos de un usuarioscript
    function parseUserScriptMetadata(scriptContent) {
        const metadata = {};
        const metadataBlock = scriptContent.match(/\/\/ ==UserScript==([\s\S]*?)\/\/ ==\/UserScript==/);
        if (metadataBlock) {
            const metadataLines = metadataBlock[1].trim().split("\n");
            metadataLines.forEach(line => {
                const match = line.match(/\/\/ @(\S+)\s+(.*)/);
                if (match) {
                    const key = match[1];
                    const value = match[2].trim();
                    metadata[key] = value;
                }
            });
        }
        return metadata;
    }

    // Función para validar patrones de URL
    function isValidUrlPattern(pattern) {
        try {
            new RegExp(pattern.replace(/\*/g, ".*"));
            return true;
        } catch (e) {
            return false;
        }
    }

    // Cargar los scripts en el dropdown con filtrado y ordenación
    function loadScriptsDropdown(filter = "") {
        chrome.storage.local.get(["scriptsCache"], (data) => {
            scriptDropdown.innerHTML = '<option value="">-- Selecciona un script --</option>';

            if (!data.scriptsCache || Object.keys(data.scriptsCache).length === 0) {
                return;
            }

            const scripts = [];
            for (const [urlPattern, scriptList] of Object.entries(data.scriptsCache)) {
                scriptList.forEach(script => {
                    if (script.scriptUrl.startsWith("user-script:")) {
                        scripts.push({ ...script, urlPattern });
                    }
                });
            }

            // Filtrar y ordenar
            const filteredScripts = scripts.filter(script =>
                script.scriptUrl.toLowerCase().includes(filter.toLowerCase()) ||
                script.urlPattern.toLowerCase().includes(filter.toLowerCase())
            ).sort((a, b) => a.scriptUrl.localeCompare(b.scriptUrl));

            filteredScripts.forEach(script => {
                const option = document.createElement("option");
                option.value = script.scriptUrl;
                option.textContent = script.scriptUrl.split(':')[1];
                scriptDropdown.appendChild(option);
            });
        });
    }

    // Cargar la información del script seleccionado en el formulario
    scriptDropdown.addEventListener("change", (e) => {
        const scriptUrl = e.target.value;
        if (!scriptUrl) {
            currentScriptUrl = null;
            scriptForm.reset();
            return;
        }

        chrome.storage.local.get(["scriptsCache"], (data) => {
            for (const [urlPattern, scripts] of Object.entries(data.scriptsCache)) {
                const script = scripts.find(s => s.scriptUrl === scriptUrl);
                if (script) {
                    currentScriptUrl = script.scriptUrl;
                    scriptNameInput.value = script.scriptUrl.split(':')[1];
                    scriptUrlPatternInput.value = script.urlPattern;
                    scriptRunAtInput.value = script.runAt || "document-end";
                    scriptCodeInput.value = script.content;
                    adjustTextareaHeight();
                    break;
                }
            }
        });
    });

    // Extraer metadatos y llenar el formulario cuando se pega un usuarioscript
    scriptCodeInput.addEventListener("input", () => {
        const scriptContent = scriptCodeInput.value;
        const metadata = parseUserScriptMetadata(scriptContent);

        if (metadata.name) scriptNameInput.value = metadata.name;
        if (metadata.match) scriptUrlPatternInput.value = metadata.match;
        scriptRunAtInput.value = metadata["run-at"] || "document-end";
    });

    // Guardar cambios en el script
    scriptForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const scriptName = scriptNameInput.value;
        const scriptUrlPattern = scriptUrlPatternInput.value;
        const scriptRunAt = scriptRunAtInput.value || "document-end";
        const scriptCode = scriptCodeInput.value;

        if (!scriptName || !scriptUrlPattern || !scriptCode) {
            alert("Por favor, completa todos los campos");
            return;
        }

        if (!isValidUrlPattern(scriptUrlPattern)) {
            alert("El patrón de URL no es válido. Usa * para coincidencias globales.");
            return;
        }

        chrome.storage.local.get(["scriptsCache"], (data) => {
            const scriptsCache = data.scriptsCache || {};

            // Eliminar el script antiguo si estamos editando
            if (currentScriptUrl) {
                for (const [urlPattern, scripts] of Object.entries(scriptsCache)) {
                    scriptsCache[urlPattern] = scripts.filter(s => s.scriptUrl !== currentScriptUrl);
                }
            }

            // Añadir el script actualizado
            if (!scriptsCache[scriptUrlPattern]) {
                scriptsCache[scriptUrlPattern] = [];
            }
            scriptsCache[scriptUrlPattern].push({
                scriptUrl: `user-script:${scriptName}`,
                content: scriptCode,
                urlPattern: scriptUrlPattern,
                runAt: scriptRunAt,
            });

            chrome.storage.local.set({ scriptsCache }, () => {
                alert("Script guardado correctamente");
                currentScriptUrl = null;
                scriptForm.reset();
                loadScriptsDropdown();
            });
        });
    });

    // Eliminar el script seleccionado
    deleteScriptBtn.addEventListener("click", () => {
        if (!currentScriptUrl) {
            alert("Por favor, selecciona un script para eliminar");
            return;
        }

        if (confirm("¿Estás seguro de que quieres eliminar este script?")) {
            chrome.storage.local.get(["scriptsCache"], (data) => {
                const scriptsCache = data.scriptsCache || {};

                for (const [urlPattern, scripts] of Object.entries(scriptsCache)) {
                    scriptsCache[urlPattern] = scripts.filter(s => s.scriptUrl !== currentScriptUrl);
                }

                chrome.storage.local.set({ scriptsCache }, () => {
                    alert("Script eliminado correctamente");
                    currentScriptUrl = null;
                    scriptForm.reset();
                    loadScriptsDropdown();
                });
            });
        }
    });

    // Botón para instalar usuarioscripts de terceros
    const installScriptBtn = document.createElement("button");
    installScriptBtn.textContent = "Instalar Userscript";
    installScriptBtn.addEventListener("click", () => {
        const scriptUrl = prompt("Introduce la URL del usuarioscript:");
        if (scriptUrl) {
            fetch(scriptUrl)
                .then(response => response.text())
                .then(content => {
                    const metadata = parseUserScriptMetadata(content);
                    scriptNameInput.value = metadata.name || "Nuevo Script";
                    scriptUrlPatternInput.value = metadata.match || "*";
                    scriptCodeInput.value = content;
                });
        }
    });
    document.body.insertBefore(installScriptBtn, scriptForm);

    // Campo de búsqueda avanzada
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Buscar scripts...";
    searchInput.addEventListener("input", (e) => loadScriptsDropdown(e.target.value));
    document.body.insertBefore(searchInput, scriptDropdown);

    // Cargar scripts en el dropdown al abrir el dashboard
    loadScriptsDropdown();
});