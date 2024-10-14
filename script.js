document.getElementById("addressInput").addEventListener("input", function() {
    processAddress();
});

document.getElementById("copyButton").addEventListener("click", function() {
    copyToClipboard(document.getElementById("formattedAddress").textContent);
});

document.getElementById("copyButtonWithUnit").addEventListener("click", function() {
    copyToClipboard(document.getElementById("formattedAddressWithUnit").textContent);
});

function processAddress() {
    let inputAddress = document.getElementById("addressInput").value;
    let formattedAddress = formatAddress(inputAddress);

    // Verificar si la dirección contiene alguna palabra clave y agregar "Unit # unk"
    const keywords = ["St", "Street", "Ave", "Avenue", "Rd", "Road", "Blvd", "Boulevard", "Dr", "Drive", "Ln", "Lane", "Ct", "Court", "CT", "Pl", "Place", "Cir", "Circle", "Way", "W", "tce", "Terrace", "Pky", "Parkway", "Hwy", "Highway"];
    let addressWithoutUnit = formattedAddress;
    let addressWithUnit = formattedAddress;

    for (let i = 0; i < keywords.length; i++) {
        if (addressWithUnit.includes(keywords[i])) {
            addressWithUnit = addressWithUnit.replace(keywords[i], keywords[i] + " Unit # unk");
            break;
        }
    }

    addressWithoutUnit = addressWithoutUnit.replace(/(UNIT|Unit)\s+(\w+)/gi, (match, unit, value) => `${unit} ${value.toUpperCase()},`);
    addressWithoutUnit = addressWithoutUnit.replace(/#\s+(\w+)/g, (match, value) => `Unit ${value.toUpperCase()},`);
    const commaIndices = getAllIndexes(addressWithoutUnit, ",");
    if (commaIndices.length >= 3) {
        addressWithoutUnit = addressWithoutUnit.replace(",", "");
    }

    const countUnit = (addressWithUnit.match(/Unit/g) || []).length;
    const countHash = (addressWithUnit.match(/#/g) || []).length;
    if (countUnit === 2 || countHash === 2) {
        addressWithUnit = "The address provided does not comply with NMF conditions";
    }

    addressWithoutUnit = replaceKeywordsWithAbbreviations(addressWithoutUnit);
    addressWithUnit = replaceKeywordsWithAbbreviations(addressWithUnit);

    addressWithoutUnit = addressWithoutUnit.replace(/,+/g, ',');

    document.getElementById("formattedAddress").textContent = addressWithoutUnit;
    document.getElementById("formattedAddressWithUnit").textContent = addressWithUnit;

    addressWithoutUnit = validateDirectionAfterComma(addressWithoutUnit);
    addressWithUnit = validateDirectionAfterComma(addressWithUnit);

    document.getElementById("formattedAddress").textContent = addressWithoutUnit;
    document.getElementById("formattedAddressWithUnit").textContent = addressWithUnit;
}

function replaceKeywordsWithAbbreviations(address) {
    const australianReplacements = {
        "Alley": "Aly",
        "Avenue": "Ave",
        "Boulevard": "Blvd",
        "Bend": "Bnd",
        "Bypass": "Byp",
        "Circuit": "Cct",
        "Close": "Cl",
        "Court": "Ct",
        "Crescent": "Cres",
        "Drive": "Dr",
        "Esplanade": "Esp",
        "Freeway": "Fwy",
        "Highway": "Hwy",
        "Lane": "Ln",
        "Motorway": "Mwy",
        "Parade": "Pde",
        "Parkway": "Pkwy",
        "Place": "Pl",
        "Road": "Rd",
        "Square": "Sq",
        "Street": "St",
        "Terrace": "Tce",
        "Way": "Way",
        "Walk": "Walk",
        "Promenade": "Prom",
        "Quay": "Qy",
        "Grove": "Gr",
        "Loop": "Loop",
        "Meander": "Mndr",
        "Mews": "Mews",
        "Plaza": "Plz",
        "Rise": "Rise",
        "Vista": "Vsta",
        "Close": "Cl",
        "Glade": "Gld",
        "Row": "Row",
        "Cul-de-sac": "CdS",
        "Track": "Trk",
        "Cove": "Cv",
        "Gardens": "Gdns",
        "Retreat": "Rtt",
        "Lookout": "Lkt",
        "View": "Vw",
        "Vale": "Vale",
        "Broadway": "Bwy",
        "Harbour": "Hbr",
        "Heights": "Hts",
        "Meadow": "Mdw",
        "Pass": "Pass",
        "Point": "Pt",
        "Trail": "Trl",
        "Vista": "Vsta",
        "Glen": "Glen",
        "Knoll": "Knl"
    };
    
    
    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        address = address.replace(regex, value);
    }

    return address;
}

function validateDirectionAfterComma(address) {
    const parts = address.split(",");
    if (parts.length > 1) {
        parts[1] = parts[1].replace(/\bN\b/g, "North").replace(/\bS\b/g, "South");
    }
    return parts.join(",");
}

function formatAddress(address) {
    let words = address.toLowerCase().split(" ");
    for (let i = 0; i < words.length; i++) {
        if (i === 0 || !isAbbreviation(words[i])) {
            words[i] = capitalize(words[i]);
        }
        if (isCityAbbreviation(words[i])) {
            words[i] = words[i].toUpperCase();
            if (i > 0 && words[i - 1] !== ",") {
                words.splice(i, 0, ",");
                i++;
            }
        }
        if (isStreetKeyword(words[i])) {
            if (i < words.length - 1 && words[i + 1] !== ",") {
                words.splice(i + 1, 0, ",");
                i++;
            }
        }
    }
    return words.join(" ").replace(/\s,+/g, ',').replace(/,+/g, ',');
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function isAbbreviation(word) {
    const abbreviations = ["qld","sa","al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "id", "il", "in", "ia", "ks", "ky", "la", "me", "md", "ma", "mi", "mn", "ms", "mo", "mt", "ne", "nv", "nh", "nj", "nm", "ny", "nc", "nd", "oh", "ok", "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "vt", "va", "wa", "wv", "wi", "wy"];
    return abbreviations.includes(word.toLowerCase());
}

function isCityAbbreviation(word) {
    return isAbbreviation(word.toUpperCase());
}

function isStreetKeyword(word) {
    const keywords = ["st", "street", "ave", "avenue", "rd", "road", "blvd", "boulevard", "dr", "drive", "ln", "lane", "ct","CT", "court", "pl", "place", "cir", "circle", "way", "w", "tce", "terrace", "pky", "parkway", "hwy", "highway"];
    return keywords.includes(word.toLowerCase());
}

function copyToClipboard(text) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function getAllIndexes(str, subStr) {
    let indices = [];
    let index = str.indexOf(subStr);
    while (index !== -1) {
        indices.push(index);
        index = str.indexOf(subStr, index + 1);
    }
    return indices;
}
