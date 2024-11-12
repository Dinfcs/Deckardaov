document.getElementById("addressInput").addEventListener("input", function() {
    const addressInput = document.getElementById("addressInput").value;

    // Paso 1: Formatear la dirección
    let formattedAddress = formatAddress(addressInput);

    // Paso 2: Validar y abreviar solo el último sufijo
    formattedAddress = abbreviateLastSuffix(formattedAddress);

    // Paso 3: Agregar las comas
    formattedAddress = addCommas(formattedAddress);

    // Mostrar la dirección formateada con comas mientras se escribe
    document.getElementById("formattedAddress").textContent = formattedAddress;

    // Paso 4: Gestionar la sección de Direcciones para Condominios
    handleCondoAddress(formattedAddress);
});

// Diccionario de abreviaciones para sufijos y puntos cardinales
const replacements = {
    "Avenue": "Ave",
    "Boulevard": "Blvd",
    "Circle": "Cir",
    "Court": "Ct",
    "CT": "Ct",
    "Drive": "Dr",
    "Expressway": "Expy",
    "Freeway": "Fwy",
    "Lane": "Ln",
    "Parkway": "Pkwy",
    "Place": "Pl",
    "Road": "Rd",
    "Square": "Sq",
    "Street": "St",
    "Terrace": "Ter",
    "Turnpike": "Tpke",
    "Way": "Way",
    "Alley": "Aly",
    "Branch": "Br",
    "Bridge": "Brg",
    "Brook": "Brk",
    "Burg": "Bg",
    "Bypass": "Byp",
    "Camp": "Cp",
    "Canyon": "Cyn",
    "Cape": "Cpe",
    "Causeway": "Cswy",
    "Center": "Ctr",
    "Cliff": "Clf",
    "Club": "Clb",
    "Corner": "Cor",
    "Cove": "Cv",
    "Creek": "Crk",
    "Crescent": "Cres",
    "Crossing": "Xing",
    "Dale": "Dl",
    "Dam": "Dm",
    "Divide": "Dv",
    "Estate": "Est",
    "Fall": "Fall",
    "Ferry": "Fry",
    "Field": "Fld",
    "Flats": "Flt",
    "Ford": "Frd",
    "Forest": "Frst",
    "Forge": "Frg",
    "Fork": "Frk",
    "Fort": "Ft",
    "Garden": "Gdn",
    "Gateway": "Gtwy",
    "Glen": "Gln",
    "Green": "Grn",
    "Grove": "Grv",
    "Harbor": "Hbr",
    "Haven": "Hvn",
    "Heights": "Hts",
    "Hill": "Hl",
    "Hollow": "Holw",
    "Inlet": "Inlt",
    "Junction": "Jct",
    "Key": "Ky",
    "Knoll": "Knl",
    "Lake": "Lk",
    "Landing": "Lndg",
    "Light": "Lgt",
    "Loaf": "Lf",
    "Lock": "Lck",
    "Lodge": "Ldg",
    "Loop": "Loop",
    "Mall": "Mall",
    "Manor": "Mnr",
    "Meadow": "Mdw",
    "Mill": "Ml",
    "Mission": "Msn",
    "Motorway": "Mtwy",
    "Mount": "Mt",
    "Neck": "Nck",
    "Orchard": "Orch",
    "Oval": "Oval",
    "Pass": "Pass",
    "Path": "Path",
    "Pike": "Pike",
    "Pine": "Pne",
    "Plain": "Pln",
    "Plaza": "Plz",
    "Point": "Pt",
    "Port": "Prt",
    "Prairie": "Pr",
    "Radial": "Radl",
    "Ranch": "Rnch",
    "Rapid": "Rpd",
    "Rest": "Rst",
    "Ridge": "Rdg",
    "River": "Riv",
    "Row": "Row",
    "Run": "Run",
    "Shoal": "Shl",
    "Shore": "Shr",
    "Spring": "Spg",
    "Spur": "Spur",
    "Station": "Sta",
    "Stravenue": "Stra",
    "Stream": "Strm",
    "Summit": "Smt",
    "Trace": "Trce",
    "Track": "Trak",
    "Trafficway": "Trfy",
    "Trail": "Trl",
    "Tunnel": "Tunl",
    "Union": "Un",
    "Valley": "Vly",
    "Viaduct": "Via",
    "View": "Vw",
    "Village": "Vlg",
    "Ville": "Vl",
    "Vista": "Vis",
    "Walk": "Walk",
    "Wells": "Wls"

};
// Lista de abreviaturas de estados
const stateAbbreviations = ["qld", "sa", "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj", "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi", "wy"];

// Diccionario para abreviar puntos cardinales, si están después del número de la calle
const cardinalPoints = {
    "North": "N",
    "South": "S",
    "East": "E",
    "West": "W"
};

function formatAddress(address) {
    // Eliminar cualquier coma que traiga la dirección original
    address = address.replace(/,/g, '');

    // Remover espacios extra y asegurarse de que solo haya un espacio entre palabras
    address = address.replace(/\s+/g, ' ');

    // Convertir a mayúscula inicial, el resto en minúsculas
    address = address.toLowerCase().replace(/\b(\w)/g, char => char.toUpperCase());

    // Abreviar puntos cardinales, pero solo si están como el segundo elemento después del número de la casa
    address = abbreviateCardinalPoints(address);

// Convertir #, Apt, Apartment o Unit pegado al número a "Unit" y asegurarse de que esté separado
address = address.replace(/(#|Apt|Apartment|Unit)\s?([\w-]+)/i, function(match, prefix, unitNumber) {
    return `Unit ${unitNumber}`;
});

 // Mayúsculas para la palabra que esté después de "Unit"
 address = address.replace(/(Unit\s)([\w-]+)/, function(match, unitText, unitNumber) {
    return unitText + unitNumber.toUpperCase();
});

    // Mayúsculas para abreviaturas de estados
    stateAbbreviations.forEach(state => {
        const regex = new RegExp("\\b" + state + "\\b", "gi");
        address = address.replace(regex, state.toUpperCase());
    });

    // Detectar el estado y borrar lo que esté después del código postal
    address = removeExtraAfterZip(address);

    return address;
}


function removeExtraAfterZip(address) {
    // Buscar la abreviatura del estado seguida de un código postal
    const regex = new RegExp(`\\b(${stateAbbreviations.join("|")})\\s+\\d+`, "i");

    // Eliminar cualquier cosa después del estado y el código postal
    return address.replace(regex, function(match) {
        return match;
    }).replace(/(\b\w{2}\b\s\d{5})\s?.*$/, "$1");  // Borrar lo que venga después del estado y código postal
}

// Función para abreviar solo el último sufijo encontrado que aún no está abreviado
function abbreviateLastSuffix(address) {

    let words = address.split(" ");
    let lastSuffixIndex = -1;

    // Recorremos todas las palabras para identificar el último sufijo (abierto o abreviado)
    for (let i = 0; i < words.length; i++) {
        if (replacements[words[i]] || Object.values(replacements).includes(words[i])) {
            lastSuffixIndex = i;  // Guardamos el índice del último sufijo, ya sea abreviado o no
        }
    }

    // Si encontramos al menos un sufijo, abreviamos el último
    if (lastSuffixIndex !== -1) {
        let lastSuffix = words[lastSuffixIndex];
        // Si el sufijo ya está abreviado, lo vuelve a abreviar, si es necesario
        if (replacements[lastSuffix] && lastSuffix !== replacements[lastSuffix]) {
            words[lastSuffixIndex] = replacements[lastSuffix];  // Abreviamos el último sufijo
        }
    }

    return words.join(" ");  // Reconstruimos la dirección
}



// Función para abreviar puntos cardinales solo si están en la segunda posición
function abbreviateCardinalPoints(address) {
    // Dividir la dirección en palabras
    let words = address.split(" ");
    
    // Verificar si la segunda palabra es un punto cardinal
    if (words.length > 1 && cardinalPoints[words[1]]) {
        // Abreviar el punto cardinal
        words[1] = cardinalPoints[words[1]];
    }

    return words.join(" ");  // Reconstruir la dirección
}

function addCommas(address) {
    // Buscar el estado seguido de cualquier código postal que sea un número entero positivo
    const regex = new RegExp(`\\b(${stateAbbreviations.join("|")})\\s+\\d+\\b`, "gi");

    let matches = address.match(regex);  // Buscar todas las coincidencias de estado + código postal

    if (!matches || matches.length === 0) {
        return address;  // Si no coincide con el patrón, devolver sin cambios
    }

    // Usar la última coincidencia encontrada (el estado + código postal correctos)
    let lastMatch = matches[matches.length - 1];
    let lastIndex = address.lastIndexOf(lastMatch);

    let streetAndCity = address.substring(0, lastIndex).trim();  // Todo lo que está antes del último estado y código postal
    let stateZip = lastMatch.trim();  // Estado + código postal correctos

    // Verificar si la dirección contiene una unidad (Unit o #)
    let unitPattern = /\b(Unit|#)\s?([\w-]+)/i;
    let hasUnit = unitPattern.test(streetAndCity);

    let streetWords = streetAndCity.trim().split(" ");
    const suffixesAbbreviations = Object.values(replacements);  // Obtener todas las abreviaciones de sufijos

    // Detectar si hay un sufijo en la calle
    let containsSuffix = streetWords.some(word => suffixesAbbreviations.includes(word));

    // Si no hay sufijo, mostrar mensaje flotante y devolver la dirección tal como está
    if (!containsSuffix) {
        showFloatingMessage("Address without suffix or street type. Add commas manually if necessary");
        return address;
    }

    // Si tiene unidad, agregar la coma después de la unidad
    if (hasUnit) {
        streetAndCity = streetAndCity.replace(unitPattern, (match) => `${match},`);
    } else {
        // Si no tiene unidad, buscar el último sufijo abreviado y agregar la coma después de él
        for (let i = streetWords.length - 1; i >= 0; i--) {
            if (suffixesAbbreviations.includes(streetWords[i])) {
                streetWords[i] = streetWords[i] + ",";
                break;
            }
        }
        streetAndCity = streetWords.join(" ");
    }

    // Eliminar cualquier espacio antes de las comas
    address = `${streetAndCity}, ${stateZip}`.replace(/\s+,/g, ',');

    return address;
}

// Función para mostrar el mensaje flotante
function showFloatingMessage(message) {
    const floatingMessage = document.createElement("div");
    floatingMessage.textContent = message;
    floatingMessage.style.position = "fixed";
    floatingMessage.style.top = "20px";
    floatingMessage.style.left = "50%";
    floatingMessage.style.transform = "translateX(-50%)";
    floatingMessage.style.padding = "20px 40px";  // Aumentar el tamaño del padding
    floatingMessage.style.backgroundColor = "#ff4747";  // Color rojo brillante de fondo
    floatingMessage.style.color = "#ffffff";  // Texto blanco
    floatingMessage.style.borderRadius = "10px";  // Bordes redondeados más grandes
    floatingMessage.style.fontSize = "18px";  // Aumentar el tamaño de la fuente
    floatingMessage.style.fontWeight = "bold";  // Poner el texto en negrita
    floatingMessage.style.textAlign = "center";  // Centrar el texto
    floatingMessage.style.zIndex = "1000";
    floatingMessage.style.display = "none";  // Inicialmente oculto

    // Agregar una sombra para que resalte más
    floatingMessage.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.3)";  // Sombra para el mensaje

    // Agregar un borde blanco si se desea más contraste
    floatingMessage.style.border = "2px solid #ffffff";  

    document.body.appendChild(floatingMessage);

    // Mostrar el mensaje
    floatingMessage.style.display = "block";

    // Después de 3 segundos, ocultar el mensaje
    setTimeout(() => {
        floatingMessage.style.display = "none";
    }, 5000);
}




// Gestión de la sección para Direcciones de Condominios
function handleCondoAddress(formattedAddress) {
    let unitPattern = /\b(Unit|#)\s?([\w-]+)/i;
    let hasUnit = unitPattern.test(formattedAddress);

    const condoSection = document.getElementById("condoAddressSection");

    if (hasUnit) {
        condoSection.style.display = "none";
    } else {
        let condoAddress = insertUnitInCondoAddress(formattedAddress);
        document.getElementById("condoAddress").textContent = condoAddress;
        condoSection.style.display = "block";
    }
}

function insertUnitInCondoAddress(address) {
    return address.replace(/(\b\w+\b)(?=\s?,)/, "$1 Unit # unk");
}

// Función para copiar la dirección formateada
document.getElementById("copyButton").addEventListener("click", function() {
    const formattedAddress = document.getElementById("formattedAddress").textContent;
    
    if (formattedAddress) {
        navigator.clipboard.writeText(formattedAddress).then(() => {
            showCopyNotification();
        }).catch(err => {
            console.error("Error copying text: ", err);
        });
    } else {
        console.error("No formatted address to copy");
    }
});

// Función para copiar la dirección de la sección de condominios
document.getElementById("copyCondoButton").addEventListener("click", function() {
    const condoAddress = document.getElementById("condoAddress").textContent;
    navigator.clipboard.writeText(condoAddress).then(() => {
        showCopyNotification();
    }).catch(err => {
        console.error("Error copying text: ", err);
    });
});

// Mostrar una notificación temporal cuando se copie la dirección en el centro de la pantalla
function showCopyNotification() {
    const notification = document.createElement('div');
    notification.innerText = "Address copied!";
    notification.style.position = "fixed";
    notification.style.top = "60%";
    notification.style.left = "50%";
    notification.style.transform = "translate(-50%, -50%)";
    notification.style.backgroundColor = "green";
    notification.style.color = "white";
    notification.style.padding = "20px";
    notification.style.borderRadius = "10px";
    document.body.appendChild(notification);

    // Desaparecer después de 2 segundos
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// animacion de carga
window.addEventListener('load', function() {
    setTimeout(function() {
      document.getElementById('loading-container').style.display = 'none';
    }, 500); // .5segundos
  });
  
