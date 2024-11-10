let filters = [];
let editIndex = null; // Definir `editIndex` globalmente

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

// Deshabilitar campo de valor si se selecciona "is blank"
function handleOperatorChange() {
  const operator = document.getElementById('operator-select').value;
  const valueInput = document.getElementById('value-input');

  if (operator === "is blank") {
      valueInput.disabled = true;
      valueInput.value = ""; // Limpiar el campo si "is blank" está seleccionado
  } else {
      valueInput.disabled = false;
  }
}

function addFilter() {
  const logicalOperator = document.getElementById('logical-operator-select').value;
  const column = document.getElementById('column-select').value;
  const operator = document.getElementById('operator-select').value;
  const value = document.getElementById('value-input').value;

  if (column && operator && (operator === "is blank" || value)) {
    const newFilter = {
      logicalOperator: logicalOperator,
      column: column,
      operator: operator,
      value: operator !== "is blank" ? value : '' 
    };

    if (editIndex !== null) {
      filters[editIndex] = newFilter; // Actualizar filtro en la posición `editIndex`
      editIndex = null; // Restablecer el índice de edición
    } else {
      filters.push(newFilter); // Agregar nuevo filtro
    }

    renderFilters(); 
    updateFinalScript(); 
    clearFields(); 
    saveFilters(); // Guardar los filtros en localStorage
  } else {
    alert('Por favor complete todos los campos requeridos.');
  }
}

function editFilter(index) {
  const filter = filters[index];
  document.getElementById('logical-operator-select').value = filter.logicalOperator;
  document.getElementById('column-select').value = filter.column;
  document.getElementById('operator-select').value = filter.operator;
  document.getElementById('value-input').value = filter.value;
  editIndex = index; // Establecer índice de edición
}

function renderFilters() {
  const filterList = document.getElementById('filter-list');
  filterList.innerHTML = filters.map((filter, index) => 
    `<div class="filter-item">
      ${index > 0 ? filter.logicalOperator : ''} ${filter.column} ${filter.operator} ${filter.value} 
      <button onclick="editFilter(${index})">Editar</button>
      <button onclick="removeFilter(${index})">Borrar</button>
    </div>`
  ).join('');
}

function removeFilter(index) {
  filters.splice(index, 1);
  renderFilters();
  updateFinalScript();
  saveFilters(); // Guardar los filtros actualizados en localStorage
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
  const filterExpressions = filters.map((filter, index) => {
    const { logicalOperator, column, operator, value } = filter;

    // Crear la expresión de la condición, con o sin valor dependiendo del operador
    const condition = operator === "is blank" ? 
      `${column} ${operator}` : 
      `${column} ${operator} '${value}'`;

    // Agregar paréntesis si el operador lógico es "and not" o "or not"
    if (logicalOperator === "and not" || logicalOperator === "or not") {
      return `${index > 0 ? logicalOperator : ''} (${condition})`;
    } else {
      return `${index > 0 ? logicalOperator : ''} ${condition}`;
    }
  });

  // Unir todas las expresiones para formar el script final
  const finalScript = filterExpressions.join(' ');
  document.getElementById('final-script').textContent = finalScript;
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

// Guardar filtros en localStorage
function saveFilters() {
  localStorage.setItem('filters', JSON.stringify(filters));
}

// Cargar filtros desde localStorage
function loadFilters() {
  const savedFilters = localStorage.getItem('filters');
  if (savedFilters) {
    try {
      filters = JSON.parse(savedFilters);
      if (!Array.isArray(filters)) {
        filters = []; // Si el formato no es un array, inicializa como un array vacío
      }
    } catch (e) {
      filters = []; // Si hay un error en el formato, inicializa como un array vacío
    }
  }
  renderFilters();
  updateFinalScript();
}

// Cargar filtros al cargar la página
window.onload = loadFilters;

// Función para borrar todos los filtros
function clearAllFilters() {
  // Limpiar el arreglo de filtros
  filters = [];
  
  // Limpiar el localStorage
  localStorage.removeItem('filters');
  
  // Volver a renderizar los filtros y el script final
  renderFilters();
  updateFinalScript();
}
// Asignamos la función al botón
document.getElementById('clear-filters-btn').addEventListener('click', clearAllFilters);
// animacion de carga
window.addEventListener('load', function() {
  setTimeout(function() {
    document.getElementById('loading-container').style.display = 'none';
  }, 1000); // 1.5segundos
});


// ajusta tipo de dato y operadores en 'updated_at'
document.getElementById("column-select").addEventListener("change", function () {
  const valueInput = document.getElementById("value-input");
  const operatorSelect = document.getElementById("operator-select");

  if (this.value === "updated_at") {
    valueInput.type = "date";  // Cambia el campo a tipo fecha para mostrar el calendario
    valueInput.placeholder = "Selecciona una fecha";

    // Actualiza las opciones de operadores solo para 'updated_at'
    operatorSelect.innerHTML = `
      <option value="icontains" selected>=</option>
      <option value="!=">≠</option>
      <option value=">">></option>
      <option value="<"><</option>
      <option value=">=">≥</option>
      <option value="<=">≤</option>
    `;
  } else {
    valueInput.type = "text";  // Vuelve a tipo texto para otros campos
    valueInput.placeholder = "Valor de filtro";

    // Restaura las opciones de operadores estándar
    operatorSelect.innerHTML = `
      <option value="=" selected>=</option>
      <option value="!=">≠</option>
      <option value="icontains">contains</option>
      <option value="is blank">is blank</option>
      <option value=">">></option>
      <option value="<"><</option>
      <option value=">=">≥</option>
      <option value="<=">≤</option>
    `;
  }
});
