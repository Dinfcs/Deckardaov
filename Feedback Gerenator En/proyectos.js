const proyectos = [
    "WY - City of Cody",
    "WI - Town of La Pointe",
    "WI - Burnett County",
    "WA - Grant County",
    "WA - City of College Place",
    "WA - City of Bainbridge Island",
    "WA - Chelan County",
    "IL - Village of Forest View",
    "VT - Town of Chester",
    "VT - City of South Burlington",
    "UT - Uintah County",
    "UT - Kane County",
    "UT - City of Salt Lake City",
    "UT - City of Hurricane",
    "TX - Uvalde County",
    "TX - Town of South Padre Island",
    "TX - Real County",
    "TX - Llano County",
    "TX - Comanche County",
    "TX - City of Wimberley",
    "TX - City of Tyler",
    "TX - City of Texarkana",
    "TX - City of Rowlett",
    "TX - City of Rockport",
    "TX - City of Plano",
    "TX - City of New Braunfels",
    "TX - City of Nacogdoches",
    "TX - City of League City",
    "TX - City of La Porte",
    "TX - City of Hewitt",
    "TX - City of Haltom City",
    "TX - City of Grapevine",
    "TX - City of Galveston",
    "TX - City of Fort Worth",
    "CA - City of Marina",
    "TX - City of Dripping Springs",
    "TX - City of Denton",
    "TX - City of College Station",
    "TX - City of Carrollton",
    "TX - City of Canyon",
    "TX - City of Amarillo",
    "TX - Bosque County",
    "TX - Bastrop County",
    "TX - Angelina County",
    "SD - City of Lead",
    "SD - City of Deadwood",
    "SC - Town of Summerville",
    "SC - Town of Port Royal",
    "SC - Town of Mount Pleasant",
    "SC - City of North Charleston",
    "SC - City of Isle of Palms",
    "SC - City of Folly Beach",
    "SC - City of Columbia",
    "SC - City of Charleston",
    "AZ - Town of Carefree",
    "PA - Township of Penn Forest",
    "PA - City of Lancaster",
    "PA - Centre County",
    "OR - City of Klamath Falls",
    "OK - City of Norman",
    "OK - City of Edmond",
    "OH - Vinton County",
    "OH - Village of Kelleys Island",
    "OH - Tuscarawas County",
    "OH - Stark County",
    "OH - Ross County",
    "OH - Pickaway County",
    "OH - Muskingum County",
    "OH - Jackson County",
    "OH - Hocking County",
    "OH - Fairfield County",
    "OH - City of Sandusky",
    "OH - Ashland County",
    "NY - Village of Saranac Lake",
    "NY - Village of Ocean Beach",
    "NY - Town of Skaneateles",
    "NY - Town of Greece",
    "NY - Town of Copake",
    "NY - Town of Chatham",
    "NY - Town of Babylon",
    "NY - City of Newburgh",
    "NY - City of Glens Falls",
    "NY - City of Geneva",
    "NV - Douglas County",
    "NM - Village of Cloudcroft",
    "NH - Town of Sunapee",
    "NC - Mitchell County",
    "NC - City of Asheville",
    "NC - Avery County",
    "MT - City of Whitefish",
    "MT - City of Bozeman",
    "MT - City of Billings",
    "MO - City of Springfield",
    "FL - City of Neptune Beach",
    "MO - City of Florissant",
    "MN - Otter Tail County",
    "MI - Township of Chikaming",
    "MI - Muskegon County",
    "MI - City of Charlevoix",
    "ME - Town of Rockport",
    "ME - City of Bangor",
    "MD - Town of Ocean City",
    "LA - City of Shreveport",
    "KY - Shelby County",
    "KY - Powell County",
    "KY - Estill County",
    "KY - Boone-Campbell-Kenton County",
    "IL - Williamson County",
    "IL - Village of Orland Park",
    "AZ - City of Litchfield Park",
    "IL - City of Princeton",
    "IL - City of Moline",
    "IL - City of Joliet",
    "IL - City of Decatur",
    "ID - Fremont County",
    "ID - City of Sandpoint",
    "ID - City of Driggs",
    "ID - Bonner County",
    "GA - Henry County",
    "GA - Fayette County",
    "AL - City of Madison",
    "GA - City of Savannah",
    "GA - City of Dalton",
    "GA - City of Chamblee",
    "GA - Chatham County",
    "GA - Bulloch County",
    "GA - Athens-Clarke County",
    "MO - City of Independence",
    "FL - Town of Palm Beach Shores",
    "FL - Seminole County",
    "AZ - City of Buckeye",
    "FL - Duval County",
    "CA - City of Modesto",
    "CA - City of Walnut Creek",
    "TX - City of Euless",
    "GA - Douglas County",
    "CA - City of Redwood City",
    "FL - City of Holmes Beach",
    "VT - Town of Dover",
    "FL - City of Key Colony Beach",
    "FL - City of Delray Beach",
    "AZ - City of Surprise",
    "FL - City of Cape Canaveral",
    "CO - Town of Telluride",
    "CO - Town of Mount Crested Butte",
    "CO - Ouray County",
    "CO - Town of Fraser",
    "CO - Summit County",
    "CO - Pitkin County",
    "FL - City of Fernandina Beach",
    "CO - Mineral County",
    "CO - Eagle County",
    "CO - City of Westminster",
    "CO - City of Ouray",
    "CO - City of Longmont",
    "CO - City of Lakewood",
    "CO - City of Durango",
    "CO - Broomfield County",
    "CO - Boulder County",
    "FL - Village of Islamorada Village of Islands",
    "CO - Adams County",
    "CAN - Township of Wainfleet",
    "CAN - Municipality of Gimli",
    "CA - Ventura County",
    "CA - Tuolumne County",
    "CA - Tulare County",
    "CA - Trinity County",
    "CA - Town of Mammoth Lakes",
    "CA - Town of Fairfax",
    "CA - Town of Corte Madera",
    "CA - Tehama County",
    "CA - Sierra County",
    "CA - Santa Cruz County",
    "CA - Santa Clara County",
    "CA - Santa Barbara County",
    "CA - San Mateo County",
    "CA - San Joaquin County",
    "CA - San Bernardino County",
    "CA - Sacramento County",
    "CA - Riverside County",
    "CA - Placer County",
    "CA - Nevada County",
    "FL - City of Cocoa Beach",
    "CA - Mono County",
    "CA - Mariposa County",
    "CA - Madera County",
    "CA - Kern County",
    "CA - El Dorado County",
    "CA - Del Norte County",
    "CO - Archuleta County",
    "CA - City of Ukiah",
    "CA - City of Trinidad",
    "CA - City of South Lake Tahoe",
    "CA - City of Solvang",
    "CA - City of Santa Barbara",
    "CA - City of San Ramon",
    "CA - City of San Rafael",
    "CA - City of San Mateo",
    "CA - City of San Luis Obispo",
    "CA - City of San Buenaventura",
    "CA - City of Roseville",
    "CA - City of Rocklin",
    "CA - City of Riverside",
    "CA - City of Ridgecrest",
    "FL - City of Marathon",
    "CA - City of Redding",
    "CA - City of Rancho Palos Verdes",
    "CA - City of Rancho Cordova",
    "CA - City of Pomona",
    "CA - City of Pismo Beach",
    "CA - City of Pasadena",
    "CA - City of Palm Desert",
    "CA - City of Pacifica",
    "CA - City of Pacific Grove",
    "CA - City of Ojai",
    "CA - City of Novato",
    "CA - City of Nevada City",
    "CA - City of Needles",
    "CA - City of Monterey Park",
    "CA - City of Monterey",
    "CA - City of Arroyo Grande",
    "CA - City of Mission Viejo",
    "CA - City of Menlo Park",
    "AZ - Coconino County",
    "CA - City of Manteca",
    "CA - City of Los Angeles",
    "CA - City of Lodi",
    "CA - City of Lemon Grove",
    "CA - City of Lakeport",
    "CA - City of Lake Elsinore",
    "CA - City of Laguna Hills",
    "CA - City of La Quinta",
    "CA - City of Irvine",
    "CA - City of Indio",
    "CA - City of Imperial Beach",
    "CA - City of Half Moon Bay",
    "CA - City of Grover Beach",
    "CA - City of Grass Valley",
    "CA - City of Glendora",
    "CA - City of Gardena",
    "CA - City of Fresno",
    "CA - City of Fremont",
    "CA - City of Folsom",
    "CA - City of El Cajon",
    "CA - City of Eastvale",
    "CA - City of Diamond Bar",
    "CA - City of Desert Hot Springs",
    "CA - City of Corona",
    "CA - City of Coachella",
    "CA - City of Clovis",
    "CA - City of Clearlake",
    "CA - City of Citrus Heights",
    "CA - City of Chula Vista",
    "CA - City of Chico",
    "CA - City of Cathedral City",
    "CA - City of Carpinteria",
    "CA - City of Carlsbad",
    "CA - City of Capitola",
    "CA - City of Calabasas",
    "CA - City of Burlingame",
    "CA - City of Big Bear Lake",
    "CA - City of Beverly Hills",
    "CA - City of Benicia",
    "CA - Monterey County",
    "CA - Calaveras County",
    "AZ - Town of Queen Creek",
    "FL - City of Sunny Isles Beach",
    "CO - Town of Keystone",
    "AZ - City of Tempe",
    "AZ - Maricopa County",
    "FL - Monroe County",
    "AZ - City of Show Low",
    "AZ - City of Scottsdale",
    "AZ - City of Phoenix",
    "AZ - City of Goodyear",
    "CA - City of Lincoln",
    "FL - City of North Miami Beach",
    "AZ - City of Avondale",
    "AUS - City of Brisbane",
    "AUS - City of Adelaide",
    "AUS - Bass Coast Shire",
    "AL - City of Vestavia Hills",
    "AL - City of Tuscumbia",
    "AL - City of Prattville",
    "AL - City of Northport",
    "SC - Charleston County",
    "AL - City of Leeds",
    "AL - City of Irondale",
    "AL - City of Decatur",
    "AL - City of Auburn",
    "CO - Clear Creek County",
    "TX - Kleberg County",
    "TX - City of Sugar Land",
    "VT - Town of Dorset",
    "FL - City of Hallandale Beach",
    "CA - City of Oxnard",
    "CA - City of Morro Bay",
    "VT - Town of Stowe",
    "OR - City of Seaside",
    "GA - Stephens County",
    "AZ - City of Flagstaff",
    "MN - Saint Louis County",
    "FL - Nassau County",
    "CA - City of Glendale",
    "KY - Menifee County",
    "UT - Emery County",
    "OK - City of Lawton",
    "CA - City of Buena Park",
    "CA - City of Claremont",
    "AUS - City of Unley",
    "FL - Marion County",
    "ID - Bear Lake County",
    "AZ - City of Casa Grande",
    "KY - Rowan County",
    "TN - Blount County",
    "CO - Town of Palisade",
    "VT - Town of Londonderry",
    "FL - City of Margate",
    "CO - Town of Silverthorne",
    "TX - City of Lubbock",
    "MA - City of Revere",
    "CA - City of Vista",
    "CA - City of Santa Clara",
    "CO - City of Leadville",
    "NJ - City of Atlantic City",
    "OR - City of Newberg",
    "ME - Town of Camdem",
    "NY - Sullivan County",
    "PA - Township of College",
    "TX - City of Grand Prairie",
    "NY - Town of Jewett",
   "CA - City of Jurupa Valley",
    "TX - Wood County"

    


    // para agregar un nuevo proyecto a la lista añada una coma al final del ultimo proyecto existente y escriba el nombre del nuevo debajo entre comillas 
];


function filtrarProyectos() {
    const input = document.getElementById('proyecto').value.toLowerCase();
    const lista = document.getElementById('listaProyectos');
    lista.innerHTML = ''; // Limpiar opciones previas

    const coincidencias = proyectos.filter(proyecto => proyecto.toLowerCase().includes(input));

    coincidencias.forEach(coincidencia => {
        const option = document.createElement('option');
        option.value = coincidencia;
        lista.appendChild(option);
    });
}

// Escuchar cambios en el campo de entrada y filtrar proyectos
document.getElementById('proyecto').addEventListener('input', filtrarProyectos);