let filters = [];

// Sugerencias específicas para cada columna
const columnSuggestions = {
  location_exact: ["true", "false"],
  property_type: ["Apart-hotel", "Apartment", "B&B", "Barn", "Bed & breakfast", "Building", "Bungalow", "Bus", "Cabin", "Camp ground", "Camper/RV", "Castle", "Condo", "Corporate apartment", "Cottage", "Dome", "Earthen home", "Entire apartment", "Entire bungalow", "Entire cabin", "Entire chalet", "Entire condo", "Entire condominium", "Entire cottage", "Entire guest suite", "Entire guesthouse", "Entire holiday home", "Entire home", "Entire home/apt", "Entire home/flat", "Entire house", "Entire loft", "Entire place", "Entire rental unit", "Entire residential home", "Entire serviced apartment", "Entire townhouse", "Entire vacation home", "Entire villa", "Estate", "Farm stay", "Farmhouse", "Guest House", "Hotel", "House", "Hut", "Lodge", "Mobile Home", "Private room", "Room in hotel", "Studio", "Tent", "Townhome", "Villa", "Yurt"],
  visibility: ["now", "not_live", "upcoming", "no_bookings", "past_30"],
  activity: ["blocked", "upcoming", "no_bookings"],
  structure: ["main structure", "adu", "unit (1 of many)", "RV", "timeshare", "resort", "event space", "other", "unknown"],
  rental: ["non_self_contained", "self_contained"],
  use_type: ["RESIDENTIAL", "COMMERCIAL (RETAIL)", "AGRICULTURAL/RURAL", "VACANT LAND", "MULTIFAMILY"],
  hoe_violation: ["true", "false"],
  suggest_qa: ["true", "false"]
};

function updateSuggestions() {
  const column = document.getElementById('column-select').value;
  const suggestionsDropdown = document.getElementById('suggestions-container');
  if (column && columnSuggestions[column]) {
    suggestionsDropdown.innerHTML = columnSuggestions[column].map(suggestion => 
      `<div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">${suggestion}</div>`
    ).join('');
    suggestionsDropdown.style.display = 'block';
  } else {
    suggestionsDropdown.style.display = 'none';
  }
}

function showSuggestions() {
  const valueInput = document.getElementById('value-input');
  const suggestionsDropdown = document.getElementById('suggestions-container');
  if (valueInput.value.length > 0) {
    suggestionsDropdown.style.display = 'block';
  } else {
    suggestionsDropdown.style.display = 'none';
  }
}

function selectSuggestion(suggestion) {
  document.getElementById('value-input').value = suggestion;
  document.getElementById('suggestions-container').style.display = 'none';
}

function addFilter() {
  const logicalOperator = document.getElementById('logical-operator-select').value;
  const column = document.getElementById('column-select').value;
  const operator = document.getElementById('operator-select').value;
  const value = document.getElementById('value-input').value;

  if (column && value) {
    const filter = { logicalOperator, column, operator, value };
    filters.push(filter);
    renderFilters();
    updateFinalScript();
  }
}

function renderFilters() {
  const filterList = document.getElementById('filter-list');
  filterList.innerHTML = filters.map((filter, index) => 
    `<div class="filter-item">
      ${filter.column} ${filter.operator} ${filter.value} 
      ${index > 0 ? ' ' + filter.logicalOperator : ''}
      <button onclick="removeFilter(${index})">X</button>
    </div>`
  ).join('');
}

function removeFilter(index) {
  filters.splice(index, 1);
  renderFilters();
  updateFinalScript();
}

// Función para limpiar los campos
function clearFields() {
    document.getElementById('logical-operator-select').value ='and';  // Valor por defecto
    document.getElementById('column-select').value = '';             // Desmarcar columna
    document.getElementById('operator-select').value = '=';          // Operador por defecto
    document.getElementById('value-input').value = '';               // Limpiar valor
    document.getElementById('suggestions-container').style.display = 'none'; // Ocultar sugerencias
  }
  

function updateFinalScript() {
  const finalScript = document.getElementById('final-script');
  
  finalScript.value = filters.map((filter, index) => {
    let filterString = `${filter.column} ${filter.operator} '${filter.value}'`;
    if (index > 0) {
      filterString = `${filter.logicalOperator} ${filterString}`;
    }
    return filterString;
  }).join(' ');
}

function copyToClipboard() {
  const finalScript = document.getElementById('final-script');
  finalScript.select();
  document.execCommand('copy');
  document.getElementById('notification').style.display = 'block';
  setTimeout(() => {
    document.getElementById('notification').style.display = 'none';
  }, 2000);
}
