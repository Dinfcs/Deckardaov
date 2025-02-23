'use strict';

const scripts = [
    { urlPattern: /^https:\/\/cyborg\.deckard\.com\//, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/CyborgButtons.js' },
    { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*<span class="math-inline">/, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/CyborgTools/NearbyParcels\.js' \},
\{ urlPattern\: /^https\:\\/\\/cyborg\\\.deckard\\\.com\\/listing\\/\.\*\\/STR\.\*</span>/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/Duplicate.js' },
    { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*<span class="math-inline">/, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/CyborgTools/BingAndDuck\.js' \},
\{ urlPattern\: /^https\:\\/\\/cyborg\\\.deckard\\\.com\\/listing\\/\.\*\\/STR\.\*</span>/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/CopyHost.js' },
    { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*<span class="math-inline">/, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/CyborgTools/ProjectResoursesCyborg\.js' \},
\{ urlPattern\: /^https\:\\/\\/cyborg\\\.deckard\\\.com\\/listing\\/CA\\/sonoma\\/\.\*\\/STR\.\*</span>/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PrSonoma.js' },
    { urlPattern: /^https:\/\/www\.google\.com\/maps\/.*<span class="math-inline">/, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/ExternalScripts/Buscador\.js' \},
\{ urlPattern\: /^https\:\\/\\/www\\\.bing\\\.com\\/maps\.\*</span>/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/Buscador.js' },
    { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/.*\/STR.*<span class="math-inline">/, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/CyborgTools/Viewer\.js' \},
\{ urlPattern\: /^https\:\\/\\/cyborg\\\.deckard\\\.com\\//, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/CyborgTools/StylesCyborg\.js' \},
\{ urlPattern\: /^https\:\\/\\/cyborg\\\.deckard\\\.com\\/listing\\/\.\*\\/\.\*\\?\.\*subset\=pending\_qa/, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/CyborgTools/Autofilterforqa\.js' \},
\{ urlPattern\: /^https\:\\/\\/cyborg\\\.deckard\\\.com\\/parcel\\/\.\+</span>/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/CyborgTools/ParcelAdresses.js' },
    { urlPattern: /^https:\/\/cyborg\.deckard\.com\/parcel\/.+<span class="math-inline">/, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/CyborgTools/ParcelFilter\.js' \},
\{ urlPattern\: /^https\:\\/\\/cyborg\\\.deckard\\\.com\\/listing\\/MA\\/dukes\.\.\.town\_of\_oak\_bluffs\\/\.\*\\/STR\.\*</span>/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PR-MA%20-Town_of_Oak_Bluffs.js' },
    { urlPattern: /^https:\/\/cyborg\.deckard\.com\/listing\/MA\/dukes...town_of_tisbury\/.*\/STR.*<span class="math-inline">/, scriptUrl\: 'https\://dinfcs\.github\.io/Deckardaov/DeckardScripts/ScriptsFotPrGis/PR\-MA\-Town\_of\_Tisbury\.js' \},
\{ urlPattern\: /^https\:\\/\\/login\-spatialstream\\\.prod\\\.lightboxre\\\.com\\/MemberPages\(\\/\.\*\)?</span>/i, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/AutologinLB-PQ.js' },
    { urlPattern: /^https:\/\/pqweb\.parcelquest\.com\/#login$/, scriptUrl: 'https://dinfcs.github.io/Deckardaov/DeckardScripts/ExternalScripts/AutologinLB-PQ.js' }
];
