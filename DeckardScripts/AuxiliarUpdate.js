// ==UserScript==
// @name         Script Principal
// @version      1.1
// @description  Define y carga scripts auxiliares según la URL
// @author       Luis Escalante
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

const token = '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'; 
const lastUpdateKey = "lastUpdateScripts"; // Clave para almacenar la fecha de última actualización

    const scripts = [
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.+$/, scriptPath: 'DeckardScripts/CyborgTools/CyborgButtons.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/WA\/king\/city_of_seattle\/STR.*/, scriptPath: 'DeckardScripts/ScriptsFotPrGis/seatlepr.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/?$/, scriptPath: 'DeckardScripts/CyborgTools/HlinkQars.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/\?show_data_lead_per_region=true$/, scriptPath: 'DeckardScripts/CyborgTools/HlinkQars.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/CyborgTools/NearbyParcels.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/FAQ/faqscyborg.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/CyborgTools/qa-sqa-productivity.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/CyborgTools/Validator.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/Licenses/LicValidator.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/CyborgTools/Duplicate.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/CyborgTools/BingAndDuck.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/CyborgTools/CopyHost.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/CyborgTools/ProjectResoursesCyborg.js' },
        { urlPattern: /^https:\/\/www\.google\.com\/maps\/.*$/, scriptPath: 'DeckardScripts/ExternalScripts/Buscador.js' },
        { urlPattern: /^https:\/\/www\.bing\.com\/maps.*$/, scriptPath: 'DeckardScripts/ExternalScripts/Buscador.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*$/, scriptPath: 'DeckardScripts/CyborgTools/Viewer.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\//, scriptPath: 'DeckardScripts/CyborgTools/StylesCyborg.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/parcel\/.+$/, scriptPath: 'DeckardScripts/CyborgTools/ParcelAdresses.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/parcel\/.+$/, scriptPath: 'DeckardScripts/CyborgTools/ParcelFilter.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/parcel\/.+$/, scriptPath: 'DeckardScripts/CyborgTools/ParcelPages.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/parcel\/.+$/, scriptPath: 'DeckardScripts/CyborgTools/DownloadParcels.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/MA\/dukes...town_of_oak_bluffs\/.*\/STR.*$/, scriptPath: 'DeckardScripts/ScriptsFotPrGis/PR-MA-Town_of_Oak_Bluffs.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/MA\/dukes...town_of_tisbury\/.*\/STR.*$/, scriptPath: 'DeckardScripts/ScriptsFotPrGis/PR-MA-Town_of_Tisbury.js' },
        { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/FL\/st_johns\/.*\/STR.*$/, scriptPath: 'DeckardScripts/ScriptsFotPrGis/PR-FL-St_Johns_County.js' }
    ];

// Función para verificar si han pasado 24 horas desde la última actualización
const shouldUpdate = () => {
    const lastUpdate = GM_getValue(lastUpdateKey, 0);
    const now = Date.now();
    return (now - lastUpdate) > 24 * 60 * 60 * 1000; // 24 horas en milisegundos
};

// Función para cargar un script desde GitHub
const loadScript = (scriptPath) => {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://api.github.com/repos/Dinfcs/Deckard/contents/${scriptPath}`,
            headers: {
                "Authorization": `token ${token}`,
                "Accept": "application/vnd.github.v3.raw"
            },
            onload: function(response) {
                if (response.status === 200) {
                    GM_setValue(scriptPath, response.responseText); // Guardar el script en almacenamiento local
                    resolve(response.responseText);
                } else {
                    console.error(`❌ Error al cargar ${scriptPath} - Status: ${response.status}`);
                    reject();
                }
            },
            onerror: function() {
                console.error(`❌ Error de conexión al cargar ${scriptPath}`);
                reject();
            }
        });
    });
};

// Cargar los scripts desde almacenamiento local o actualizar si han pasado 24 horas
(async function() {
    try {
        const matchingScripts = scripts.filter(({ urlPattern }) => urlPattern.test(window.location.href));

        for (const { scriptPath } of matchingScripts) {
            const cachedScript = GM_getValue(scriptPath);
            if (cachedScript && !shouldUpdate()) {
                eval(cachedScript);
                console.log(`✅ ${scriptPath} cargado desde caché.`);
            } else {
                console.log(`🔄 Actualizando ${scriptPath} desde GitHub...`);
                const newScript = await loadScript(scriptPath);
                eval(newScript);
            }
        }

        // Guardar la fecha de actualización
        GM_setValue(lastUpdateKey, Date.now());
    } catch (error) {
        console.error('❌ Error al cargar scripts:', error);
    }
})();
