// URL del JSON con los scripts
const JSON_URL = "https://dinfcs.github.io/Deckardaov/DeckardScripts/cargador.json";

// Función para descargar y almacenar los scripts en chrome.storage.local solo si hay cambios
async function fetchScripts() {
    try {
        console.log("📥 Descargando configuración de scripts desde:", JSON_URL);
        const response = await fetch(JSON_URL);
        if (!response.ok) throw new Error(`❌ Error al obtener JSON: ${response.statusText}`);
        const data = await response.json();

        // Verificar si hay cambios antes de actualizar el almacenamiento
        const storedData = await new Promise(resolve => {
            chrome.storage.local.get("scriptsCache", resolve);
        });

        if (JSON.stringify(storedData.scriptsCache) === JSON.stringify(data.scripts)) {
            console.log("⚡ No hay cambios en los scripts. No se actualiza el caché.");
            return;
        }

        // Descargar todos los scripts en paralelo para mejorar la velocidad
        const scriptPromises = data.scripts.map(async ({ scriptUrl, urlPattern }) => {
            const name = scriptUrl.split('/').pop();
            console.log(`🔄 Descargando script: ${name} (${urlPattern})`);

            const scriptResponse = await fetch(scriptUrl);
            if (!scriptResponse.ok) throw new Error(`❌ Error al descargar ${scriptUrl}`);

            return {
                content: await scriptResponse.text(),
                name,
                scriptUrl,
                urlPattern
            };
        });

        const scriptsArray = await Promise.all(scriptPromises);

        // Agrupar scripts por patrón de URL
        const newScripts = scriptsArray.reduce((acc, script) => {
            if (!acc[script.urlPattern]) acc[script.urlPattern] = [];
            acc[script.urlPattern].push(script);
            return acc;
        }, {});

        // Guardar en chrome.storage.local
        chrome.storage.local.set({ scriptsCache: newScripts }, () => {
            console.log("✅ Scripts almacenados en chrome.storage.local.");
        });

    } catch (error) {
        console.error("🚨 Error al obtener scripts:", error);
    }
}

// Función para cargar scripts desde chrome.storage.local
function loadScriptsFromStorage(callback) {
    chrome.storage.local.getBytesInUse("scriptsCache", bytes => {
        if (bytes > 0) {
            chrome.storage.local.get("scriptsCache", data => {
                console.log("📂 Scripts cargados desde almacenamiento local.");
                callback(data.scriptsCache);
            });
        } else {
            console.log("⚠️ No hay scripts en caché. Descargando...");
            fetchScripts();
        }
    });
}

// Función para inyectar scripts según la URL
function injectScriptForUrl(tabId, url) {
    loadScriptsFromStorage(scriptsCache => {
        let scriptsMatched = 0;
        for (const [urlPattern, scripts] of Object.entries(scriptsCache)) {
            if (matchUrlPattern(url, urlPattern)) {
                console.log(`✅ Coincidencia: ${url} ↔ ${urlPattern}`);
                scripts.forEach(({ content, name }) => injectScript(tabId, content, name));
                scriptsMatched += scripts.length;
            }
        }
        if (scriptsMatched === 0) console.log(`⚠️ No hay scripts para: ${url}`);
    });
}

// Función para inyectar script en la página evitando duplicados
function injectScript(tabId, scriptContent, scriptName) {
    chrome.scripting.executeScript({
        target: { tabId },
        func: (code, name) => {
            if (window[`__${name}_LOADED__`]) return; // Evitar ejecución duplicada
            window[`__${name}_LOADED__`] = true;

            const script = document.createElement("script");
            script.textContent = code;
            document.documentElement.appendChild(script);
            console.log(`✅ Script ejecutado: ${name}`);
        },
        args: [scriptContent, scriptName],
        world: "MAIN"
    }, () => {
        if (chrome.runtime.lastError) {
            console.log("🚨 Error al inyectar el script:", chrome.runtime.lastError);
        }
    });
}

// Función para comprobar si una URL coincide con un patrón
function matchUrlPattern(url, pattern) {
    return new RegExp(pattern.replace(/\*/g, ".*")).test(url);
}

// Listener para inyectar scripts cuando una pestaña se actualiza
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        console.log(`🌍 Página cargada: ${tab.url}`);
        injectScriptForUrl(tabId, tab.url);
    }
});

// Descargar scripts al inicio
fetchScripts();

// Recargar los scripts solo si hay cambios cada 5 minutos
setInterval(fetchScripts, 5 * 60 * 1000);
