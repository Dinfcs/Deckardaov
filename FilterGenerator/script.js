const columnConfigs = {
    "apn_mapped_via_cyborg": { operators: ['=', '!=', 'icontains'], suggestions: ['__NO_MATCH_FOUND_1','__NO_MATCH_FOUND_2'] },
    "resolved_apn": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "title": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "description": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "host_name": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "location_exact": { operators: ['is'], suggestions: ['true', 'false'] },
    "property_type": { operators: ['=', '!=', 'icontains'], suggestions: ['Apart-hotel', 'Apartment', 'B&B', 'Barn', 'Bed & breakfast', 'Building', 'Bungalow', 'Bus', 'Cabin', 'Camp ground', 'Camper/RV', 'Campervan/Motorhome', 'Campervan/RV', 'Campsite', 'Casa particular', 'Castle', 'Chalet', 'Condo', 'Cottage', 'Entire bungalow', 'Entire condominium (condo)', 'Entire guest suite', 'Entire guesthouse', 'Entire home', 'Entire rental unit', 'Entire residential home', 'Entire villa', 'House', 'Private room in apartment', 'Private room in condominium', 'Private room in guest suite', 'Private room in guesthouse', 'Private room in home', 'Private room in rental unit', 'Private room in residential home', 'Private room in townhouse', 'Shared room in apartment', 'Shared room in rental unit', 'Tiny home', 'Yurt'] },
    "visibility": { operators: ['=', '!='], suggestions: ['now', 'not_live', 'upcoming', 'no_bookings', 'past_30'] },
    "activity": { operators: ['=', '!=', 'icontains'], suggestions: ['blocked', 'upcoming', 'no_bookings'] },
    "bathrooms": { operators: ['=', '!=', '>', '<'], suggestions: [] },
    "bedrooms": { operators: ['=', '!=', '>', '<'], suggestions: [] },
    "occupancy": { operators: ['=', '!=', '>', '<'], suggestions: [] },
    "partial_apn": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "geo_cluster": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "structure": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "rental": { operators: ['=', '!='], suggestions: ['true', 'false'] },
    "address": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "override_address": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "unit_number": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "use_type": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "by_who": { operators: ['=', '!=', 'icontains'], suggestions: [] },
    "updated_at": { operators: ['<','>','>=', '<=', '=', '!='], suggestions: [] },
    "hoe_violation": { operators: ['=', '!='], suggestions: ['true', 'false'] },
    "suggest_qa": { operators: ['=', '!='], suggestions: ['true', 'false'] }
};

// Restaurar filtros al cargar la página
window.addEventListener('load', () => {
    const savedFilters = JSON.parse(localStorage.getItem('filters'));
    if (savedFilters) {
        Object.keys(savedFilters).forEach(columnName => {
            const columnData = savedFilters[columnName];
            const checkbox = document.getElementById(columnName);
            checkbox.checked = true;
            toggleFields(checkbox, columnData);  // Paso adicional de datos guardados
        });
    }
});

function toggleFields(checkbox, savedData = null) {
    const filtersDiv = document.getElementById('filters');
    const columnName = checkbox.id;

    if (checkbox.checked) {
        const filterGroup = document.createElement('div');
        filterGroup.classList.add('filter-group');
        filterGroup.id = columnName + '_group';

        const operatorSelect = document.createElement('select');
        operatorSelect.innerHTML = columnConfigs[columnName].operators.map(op => `<option value="${op}">${op}</option>`).join('');
        
        let valueInput;
        if (columnName === 'updated_at') {
            // Si es updated_at, usar un selector de fecha
            valueInput = document.createElement('input');
            valueInput.type = 'date';
            valueInput.placeholder = `YYYY-MM-DD`;  // formato de ejemplo
        } else {
            // Para otros campos, usar input de texto
            valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.placeholder = `Valor para ${columnName}`;
            
            // Añadir lista de sugerencias si existen
            const suggestionsList = document.createElement('datalist');
            suggestionsList.id = `${columnName}_suggestions`;
            columnConfigs[columnName].suggestions.forEach(suggestion => {
                const option = document.createElement('option');
                option.value = suggestion;
                suggestionsList.appendChild(option);
            });
            valueInput.setAttribute('list', `${columnName}_suggestions`);
            filtersDiv.appendChild(suggestionsList);
        }

        filterGroup.appendChild(document.createTextNode(columnName + ' '));
        filterGroup.appendChild(operatorSelect);
        filterGroup.appendChild(valueInput);
        filtersDiv.appendChild(filterGroup);

        // Restaurar datos guardados si existen
        if (savedData) {
            operatorSelect.value = savedData.operator;
            valueInput.value = savedData.value;
        }

        // Guardar cambios cuando el usuario cambia operador o valor
        operatorSelect.addEventListener('change', () => saveFilters());
        valueInput.addEventListener('input', () => saveFilters());

        // Guardar los filtros seleccionados inicialmente
        saveFilters();

    } else {
        const filterGroup = document.getElementById(columnName + '_group');
        if (filterGroup) {
            filtersDiv.removeChild(filterGroup);
            saveFilters();
        }
    }
}


// Función para guardar los filtros actuales en localStorage
function saveFilters() {
    const filtersDiv = document.getElementById('filters');
    const filtersToSave = {};
    
    filtersDiv.childNodes.forEach(group => {
        if (group.classList && group.classList.contains('filter-group')) {
            const column = group.childNodes[0].nodeValue.trim();
            const operator = group.childNodes[1].value;
            const value = group.childNodes[2].value;

            filtersToSave[column] = {
                operator: operator,
                value: value
            };
        }
    });

    localStorage.setItem('filters', JSON.stringify(filtersToSave));
}

// Función para generar el filtro en texto
function generateFilter() {
    const filtersDiv = document.getElementById('filters');
    const filterExpressions = [];
    const filterGroups = filtersDiv.childNodes;

    filterGroups.forEach(group => {
        if (group.classList && group.classList.contains('filter-group')) {
            const column = group.childNodes[0].nodeValue.trim();
            const operator = group.childNodes[1].value;
            const value = group.childNodes[2].value;

            const filterExpression = operator === 'is' 
                ? `${column} ${operator} ${value}`
                : `${column} ${operator} "${value}"`;

            filterExpressions.push(filterExpression);
        }
    });

    const finalFilter = filterExpressions.join(' and ');
    document.getElementById('result').innerText = finalFilter;

    // Copiar al portapapeles
    navigator.clipboard.writeText(finalFilter).then(() => {
        showNotification();
    });
}

// Mostrar la notificación de copiado
function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show');
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}
