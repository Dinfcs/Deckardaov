// URL del JSON con los scripts
const JSON_URL = "https://dinfcs.github.io/Deckardaov/DeckardScripts/cargador.json";

// Función para calcular un hash SHA-256 del contenido del JSON
async function computeHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Descargar y almacenar scripts solo si hay cambios
async function fetchScripts(forceUpdate = false) {
    try {
        console.log("📥 Descargando configuración de scripts desde:", JSON_URL);
        const response = await fetch(JSON_URL);
        if (!response.ok) throw new Error(`❌ Error al obtener JSON: ${response.statusText}`);
        const textData = await response.text();
        const newHash = await computeHash(textData);
        const data = JSON.parse(textData);

        // Obtener el hash almacenado
        const storedData = await new Promise(resolve => {
            chrome.storage.local.get(["scriptsCache", "scriptsHash"], resolve);
        });

        if (!forceUpdate && storedData.scriptsHash === newHash) {
            console.log("⚡ No hay cambios en los scripts. No se actualiza el caché.");
            return;
        }

        // Descargar todos los scripts en paralelo
        const scriptPromises = data.scripts.map(async ({ scriptUrl, urlPattern }) => {
            console.log(`🔄 Descargando script: ${scriptUrl}`);
            const scriptResponse = await fetch(scriptUrl);
            if (!scriptResponse.ok) throw new Error(`❌ Error al descargar ${scriptUrl}`);

            return {
                content: await scriptResponse.text(),
                scriptUrl,
                urlPattern
            };
        });

        const scriptsArray = await Promise.all(scriptPromises);
        const newScripts = scriptsArray.reduce((acc, script) => {
            if (!acc[script.urlPattern]) acc[script.urlPattern] = [];
            acc[script.urlPattern].push(script);
            return acc;
        }, {});

        // Preservar los scripts cargados manualmente
        const manualScripts = {};
        if (storedData.scriptsCache) {
            for (const [urlPattern, scripts] of Object.entries(storedData.scriptsCache)) {
                scripts.forEach(script => {
                    if (script.scriptUrl.startsWith("user-script:")) {
                        if (!manualScripts[urlPattern]) manualScripts[urlPattern] = [];
                        manualScripts[urlPattern].push(script);
                    }
                });
            }
        }

        // Combinar scripts descargados con los scripts manuales
        const combinedScripts = { ...newScripts }; // Copia de los scripts descargados

        // Añadir scripts manuales sin sobrescribir los descargados
        for (const [urlPattern, scripts] of Object.entries(manualScripts)) {
            if (!combinedScripts[urlPattern]) {
                combinedScripts[urlPattern] = [];
            }
            combinedScripts[urlPattern].push(...scripts); // Añadir scripts manuales
        }

        // Guardar en almacenamiento local con el nuevo hash y la fecha de actualización
        chrome.storage.local.set({ 
            scriptsCache: combinedScripts, 
            scriptsHash: newHash,
            lastUpdated: new Date().toISOString() // Guardar la fecha de la última actualización
        }, () => {
            console.log("✅ Scripts actualizados en almacenamiento local.");
        });

    } catch (error) {
        console.error("🚨 Error al obtener scripts:", error);
    }
}

// Inyectar scripts según la URL
function injectScriptForUrl(tabId, url, frameId = 0) {
    chrome.storage.local.get(["scriptsCache", "enabledScripts"], (data) => {
        if (!data.scriptsCache) return;

        let scriptsMatched = 0;
        for (const [urlPattern, scripts] of Object.entries(data.scriptsCache)) {
            if (matchUrlPattern(url, urlPattern)) {
                console.log(`✅ Coincidencia: ${url} ↔ ${urlPattern}`);
                scripts.forEach(({ content, scriptUrl, runAt }) => {
                    if (data.enabledScripts?.[scriptUrl] !== false) {
                        injectScript(tabId, content, scriptUrl, runAt, frameId);
                        scriptsMatched++;
                    }
                });
            }
        }
        if (scriptsMatched === 0) console.log(`⚠️ No hay scripts para: ${url}`);
    });
}

// Inyectar script en la página
function injectScript(tabId, scriptContent, scriptName, runAt = "document-end", frameId = 0) {
    chrome.scripting.executeScript({
        target: { tabId, frameIds: [frameId] },
        func: (code, name) => {
            if (document.querySelector(`script[data-name="${name}"]`)) return;
            const script = document.createElement("script");
            script.textContent = code;
            script.setAttribute("data-name", name);
            document.documentElement.appendChild(script);
            console.log(`✅ Script ejecutado: ${name} en frame ${window.location.href}`);
        },
        args: [scriptContent, scriptName],
        world: "MAIN",
        injectImmediately: runAt === "document-start", // Inyectar inmediatamente si es document-start
    }, () => {
        if (chrome.runtime.lastError) {
            console.log(`🚨 Error al inyectar el script en frame: ${chrome.runtime.lastError.message}`);
        }
    });
}

// Comprobar coincidencia con patrón de URL
function matchUrlPattern(url, pattern) {
    return new RegExp(pattern.replace(/\*/g, ".*")).test(url);
}

// Listener para inyectar scripts cuando un documento (principal o iframe) se carga
chrome.webNavigation.onCompleted.addListener((details) => {
    console.log(`🌍 Navegación completada: ${details.url}, frameId: ${details.frameId}`);
    injectScriptForUrl(details.tabId, details.url, details.frameId);
}, {
    url: [{ schemes: ['http', 'https'] }]
});

// Mantener compatibilidad con el listener anterior para casos de uso específicos
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        console.log(`🌍 Página principal cargada: ${tab.url}`);
        injectScriptForUrl(tabId, tab.url, 0); // 0 es el ID del frame principal
    }
});

// Método manual para actualizar los scripts desde el popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateScripts") {
        fetchScripts(true).then(() => sendResponse({ status: "updated" }));
        return true; // Indicar que la respuesta es asíncrona
    }
});

// Descargar scripts al inicio
fetchScripts();

// Recargar cada 5 minutos si hay cambios
setInterval(fetchScripts, 5 * 60 * 1000);