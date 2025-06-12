// ================================================================= //
// =================== CONFIGURACIÓN DEL REPOSITORIO ================= //
// ================================================================= //

// MODIFICADO: Configuración para el repositorio privado de GitHub
const GH_TOKEN = 'token';
const REPO_OWNER = 'Dinfcs';
const REPO_NAME = 'Deckard';
const MANIFEST_PATH = 'DeckardScripts/cargador.json'; // Asegúrate que esta sea la ruta correcta a tu JSON

// MODIFICADO: URL para obtener el JSON desde la API de GitHub
const JSON_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${MANIFEST_PATH}`;

// ================================================================= //
// ==================== LÓGICA DE LA EXTENSIÓN ===================== //
// ================================================================= //

/**
 * Calcula un hash SHA-256 del contenido del manifiesto para detectar cambios.
 * @param {string} text - El contenido del archivo JSON.
 * @returns {Promise<string>} El hash calculado.
 */
async function computeHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Descarga el manifiesto y todos los scripts desde el repositorio privado.
 * Almacena los scripts en caché solo si el contenido ha cambiado.
 * @param {boolean} forceUpdate - Si es true, ignora el hash y fuerza la actualización.
 */
async function fetchScripts(forceUpdate = false) {
    try {
        console.log("📥 Descargando configuración de scripts desde (privado):", JSON_URL);

        const response = await fetch(JSON_URL, {
            headers: {
                'Authorization': `token ${GH_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
            }
        });

        if (!response.ok) throw new Error(`❌ Error al obtener JSON: ${response.statusText}`);
        const textData = await response.text();
        const newHash = await computeHash(textData);
        const manifest = JSON.parse(textData);

        const storedData = await chrome.storage.local.get(["scriptsHash"]);

        if (!forceUpdate && storedData.scriptsHash === newHash) {
            console.log("⚡ No hay cambios en los scripts. No se actualiza el caché.");
            return;
        }

        console.log("🔄 Hay cambios en el manifiesto o se forzó la actualización. Descargando todos los scripts...");

        const scriptPromises = manifest.scripts.map(async ({ scriptPath, urlPattern, runAt }) => {
            if (!scriptPath) return null;

            const scriptApiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${scriptPath}`;
            
            const scriptResponse = await fetch(scriptApiUrl, {
                headers: {
                    'Authorization': `token ${GH_TOKEN}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            });

            if (!scriptResponse.ok) {
                console.error(`❌ Error al descargar ${scriptPath}: ${scriptResponse.statusText}`);
                return null;
            }

            return {
                content: await scriptResponse.text(),
                scriptUrl: scriptPath, // Usamos la ruta como identificador único
                urlPattern,
                runAt: runAt || 'document_end' // Valor por defecto
            };
        });

        const scriptsArray = (await Promise.all(scriptPromises)).filter(Boolean);
        
        const newScriptsCache = scriptsArray.reduce((acc, script) => {
            if (!acc[script.urlPattern]) acc[script.urlPattern] = [];
            acc[script.urlPattern].push(script);
            return acc;
        }, {});

        await chrome.storage.local.set({ 
            scriptsCache: newScriptsCache,
            scriptsHash: newHash,
            lastUpdated: new Date().toISOString()
        });
        
        console.log("✅ Scripts actualizados en almacenamiento local desde el repositorio privado.");

    } catch (error) {
        console.error("🚨 Error al obtener scripts:", error);
    }
}

/**
 * Inyecta todos los scripts que coincidan con la URL proporcionada.
 * @param {number} tabId - ID de la pestaña.
 * @param {string} url - URL de la pestaña o frame.
 * @param {number} frameId - ID del frame donde se inyectará.
 */
function injectScriptForUrl(tabId, url, frameId) {
    chrome.storage.local.get(["scriptsCache", "enabledScripts"], (data) => {
        if (!data.scriptsCache) return;

        for (const [urlPattern, scripts] of Object.entries(data.scriptsCache)) {
            if (matchUrlPattern(url, urlPattern)) {
                console.log(`[Inject] Coincidencia: ${url} -> ${urlPattern}`);
                scripts.forEach(({ content, scriptUrl, runAt }) => {
                    if (data.enabledScripts?.[scriptUrl] !== false) {
                        injectScript(tabId, content, scriptUrl, runAt, frameId);
                    }
                });
            }
        }
    });
}

/**
 * Ejecuta un script en la página usando la API de scripting.
 * @param {number} tabId - ID de la pestaña.
 * @param {string} scriptContent - El código del script.
 * @param {string} scriptName - Nombre/identificador del script.
 * @param {string} runAt - Cuándo ejecutar el script ('document_start' o 'document_end').
 * @param {number} frameId - ID del frame.
 */
function injectScript(tabId, scriptContent, scriptName, runAt, frameId) {
    chrome.scripting.executeScript({
        target: { tabId, frameIds: [frameId] },
        func: (code, name) => {
            if (document.querySelector(`script[data-dks-name="${name}"]`)) return;
            const script = document.createElement("script");
            script.textContent = code;
            script.setAttribute("data-dks-name", name); // Atributo único para evitar re-inyección
            (document.head || document.documentElement).appendChild(script);
        },
        args: [scriptContent, scriptName],
        world: "MAIN",
        injectImmediately: runAt === "document_start",
    }, () => {
        if (chrome.runtime.lastError) {
            console.log(`   ↳ 🚨 Error al inyectar '${scriptName}': ${chrome.runtime.lastError.message}`);
        }
    });
}

/**
 * Comprueba si una URL coincide con un patrón de expresión regular.
 * @param {string} url - La URL a comprobar.
 * @param {string} pattern - El patrón de expresión regular.
 * @returns {boolean}
 */
function matchUrlPattern(url, pattern) {
    try {
        return new RegExp(pattern).test(url);
    } catch(e) {
        console.error(`Patrón de Regex inválido: "${pattern}". Error: ${e.message}`);
        return false;
    }
}

// ================================================================= //
// ======================= EVENT LISTENERS ========================= //
// ================================================================= //

// Listener para inyectar scripts tan pronto como sea posible.
chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.url && details.url.startsWith('http')) {
       injectScriptForUrl(details.tabId, details.url, details.frameId);
    }
}, {
    url: [{ schemes: ['http', 'https'] }]
});

// Listener para la actualización manual desde el popup.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateScripts") {
        fetchScripts(true).then(() => sendResponse({ status: "updated" }));
        return true; // Indicar que la respuesta es asíncrona.
    }
});

// Descargar scripts al instalar o iniciar la extensión.
chrome.runtime.onStartup.addListener(fetchScripts);
chrome.runtime.onInstalled.addListener(fetchScripts);

// Programar una recarga periódica de los scripts.
chrome.alarms.create('fetchScriptsAlarm', { periodInMinutes: 15 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'fetchScriptsAlarm') {
        fetchScripts();
    }
});
