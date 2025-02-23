// cargador.js (Este es el contenido que subirías a GitHub)
// ¡¡¡IMPORTANTE!!!  Este script *NO* se ejecuta directamente.  Solo se *analiza* su contenido.

const scripts = [
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/CyborgButtons.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/NearbyParcels.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/Duplicate.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/BingAndDuck.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/CopyHost.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/ProjectResoursesCyborg.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/CA\\/sonoma\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PrSonoma.js' },
    { urlPattern: '^https:\\/\\/www\\.google\\.com\\/maps\\/.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/Buscador.js' },
    { urlPattern: '^https:\\/\\/www\\.bing\\.com\\/maps.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/Buscador.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/Viewer.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/StylesCyborg.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/.*\\/.*\\?.*subset=pending_qa', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/Autofilterforqa.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/parcel\\/.+$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/ParcelAdresses.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/parcel\\/.+$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/ParcelFilter.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/MA\\/dukes\\.\\.\\.town_of_oak_bluffs\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PR-MA%20-Town_of_Oak_Bluffs.js' },
    { urlPattern: '^https:\\/\\/cyborg\\.deckard\\.com\\/listing\\/MA\\/dukes\\.\\.\\.town_of_tisbury\\/.*\\/STR.*$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PR-MA-Town_of_Tisbury.js' },
    { urlPattern: '^https:\\/\\/login-spatialstream\\.prod\\.lightboxre\\.com\\/MemberPages(\\/.*)?$/i', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/AutologinLB-PQ.js' },
    { urlPattern: '^https:\\/\\/pqweb\\.parcelquest\\.com\\/#login$', scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/AutologinLB-PQ.js' }
];

//MUY IMPORTANTE: Este script ya NO define loadScriptsForUrl.  La lógica está en background.js.
