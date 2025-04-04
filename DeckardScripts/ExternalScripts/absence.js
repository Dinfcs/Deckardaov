// ==UserScript==
// @name         BambooHR Out Summary con Selector de Semana Mejorado
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Muestra quién está fuera por semana/mes seleccionado desde BambooHR ICS feed con interfaz mejorada y filtrado
// @author       Tú y Asistente
// @match        https://deckard.bamboohr.com/home/
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      deckard.bamboohr.com
// ==/UserScript==

(function () {
    'use strict';

    // Configuración
    const CALENDAR_URL = 'https://deckard.bamboohr.com/feeds/feed.php?id=fec848cc616cc7fee3ca705949e70744';
    const CACHE_DURATION = 3600000; // 1 hora en milisegundos
    const THEME = {
        light: {
            bg: '#fff',
            text: '#333',
            border: '#ddd',
            primary: '#007bff',
            secondary: '#6c757d',
            danger: '#dc3545',
            success: '#28a745',
            header: '#f8f9fa',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        },
        dark: {
            bg: '#282c34',
            text: '#f8f9fa',
            border: '#444',
            primary: '#4da3ff',
            secondary: '#8c98a5',
            danger: '#f55c6a',
            success: '#48d869',
            header: '#1e2228',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }
    };

    // Estado global
    let currentTheme = 'light';
    let currentView = 'week';
    let allEvents = [];
    let filteredEvents = [];
    let cachedEvents = null;
    let cachedTimestamp = null;

    // Utilidades
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function formatDate(date) {
        return date.toISOString().split("T")[0];
    }

    function parseDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num));
        return new Date(year, month - 1, day);
    }

    // Persistencia
    function saveSettings() {
        GM_setValue('bamboohr_theme', currentTheme);
        GM_setValue('bamboohr_view', currentView);
    }

    function loadSettings() {
        const savedTheme = GM_getValue('bamboohr_theme');
        const savedView = GM_getValue('bamboohr_view');

        if (savedTheme) currentTheme = savedTheme;
        if (savedView) currentView = savedView;
    }

    // Fetch y procesamiento de datos
    function fetchICS(callback, forceRefresh = false) {
        const now = new Date().getTime();

        // Usar caché si está disponible y es reciente
        if (!forceRefresh && cachedEvents && cachedTimestamp && (now - cachedTimestamp < CACHE_DURATION)) {
            console.log('Usando datos en caché de BambooHR');
            callback(cachedEvents);
            return;
        }

        console.log('Obteniendo datos frescos de BambooHR');
        GM_xmlhttpRequest({
            method: "GET",
            url: CALENDAR_URL,
            onload: function (response) {
                if (response.status === 200) {
                    const events = parseICS(response.responseText);
                    cachedEvents = events;
                    cachedTimestamp = now;
                    callback(events);
                } else {
                    showNotification("Error cargando el calendario: " + response.statusText, "error");
                }
            },
            onerror: function(e) {
                showNotification("Error de red: " + e.error, "error");
            }
        });
    }

    function parseICS(data) {
        const events = [];
        const entries = data.split('BEGIN:VEVENT').slice(1);

        for (const entry of entries) {
            const summary = entry.match(/SUMMARY:(.+)/)?.[1]?.trim();
            const start = entry.match(/DTSTART;?.*:(\d{8})/)?.[1];
            const end = entry.match(/DTEND;?.*:(\d{8})/)?.[1];
            const description = entry.match(/DESCRIPTION:(.+?)(?:\r\n|\n)/s)?.[1]?.trim();
            const eventType = determineEventType(summary, description);

            if (summary && start && end) {
                const startDate = new Date(
                    parseInt(start.substring(0, 4)),
                    parseInt(start.substring(4, 6)) - 1,
                    parseInt(start.substring(6, 8))
                );

                const endDate = new Date(
                    parseInt(end.substring(0, 4)),
                    parseInt(end.substring(4, 6)) - 1,
                    parseInt(end.substring(6, 8))
                );

                // Ajustar la fecha final (en BambooHR la fecha final es exclusiva)
                const adjustedEndDate = new Date(endDate);
                adjustedEndDate.setDate(adjustedEndDate.getDate());

                for (let d = new Date(startDate); d < adjustedEndDate; d.setDate(d.getDate() + 1)) {
                    const dateStr = formatDate(d);
                    events.push({
                        date: dateStr,
                        name: summary,
                        description: description || '',
                        type: eventType,
                        startDate: formatDate(startDate),
                        endDate: formatDate(new Date(adjustedEndDate.getTime() - 86400000))
                    });
                }
            }
        }

        return events;
    }

    function determineEventType(summary, description) {
        const lowercaseSummary = summary?.toLowerCase() || '';
        const lowercaseDesc = description?.toLowerCase() || '';

        if (lowercaseSummary.includes('vacaciones') || lowercaseDesc.includes('vacaciones')) {
            return 'vacation';
        } else if (lowercaseSummary.includes('enfermedad') || lowercaseDesc.includes('enfermedad')) {
            return 'sick';
        } else if (lowercaseSummary.includes('trabajo remoto') || lowercaseDesc.includes('trabajo remoto') ||
                  lowercaseSummary.includes('remoto') || lowercaseDesc.includes('remoto')) {
            return 'remote';
        } else {
            return 'other';
        }
    }

    function groupByDay(events) {
        const grouped = {};
        for (const e of events) {
            if (!grouped[e.date]) grouped[e.date] = [];

            // Evitar duplicados
            const existingIndex = grouped[e.date].findIndex(item => item.name === e.name);
            if (existingIndex === -1) {
                grouped[e.date].push(e);
            }
        }
        return grouped;
    }

    // Funciones de fecha
    function getMondayOfWeek(weekNumber, year, month) {
        const firstDayOfMonth = new Date(year, month, 1);
        const firstMonday = new Date(firstDayOfMonth);

        // Ajustar al primer lunes
        const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Lunes
        const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
        firstMonday.setDate(firstDayOfMonth.getDate() + daysUntilMonday - 7);

        // Avanzar al lunes de la semana solicitada
        const monday = new Date(firstMonday);
        monday.setDate(monday.getDate() + (weekNumber - 1) * 7);
        return monday;
    }

    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1);
    }

    function getLastDayOfMonth(year, month) {
        return new Date(year, month + 1, 0);
    }

    function getWeekNumber(date) {
        const d = new Date(date);
        // Obtener el primer día del mes
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);

        // Ajustar al primer lunes anterior o igual al primer día del mes
        const firstDayOfWeek = firstDay.getDay() || 7;
        const offsetToFirstMonday = (firstDayOfWeek === 1) ? 0 : (9 - firstDayOfWeek);
        const firstMonday = new Date(firstDay);
        firstMonday.setDate(firstDay.getDate() - firstDayOfWeek + 1);

        // Calcular la diferencia en días entre la fecha dada y el primer lunes
        const diffInDays = Math.floor((d - firstMonday) / (24 * 60 * 60 * 1000));

        // Calcular el número de semana
        return Math.floor(diffInDays / 7) + 1;
    }

    function getCurrentWeekNumber() {
        const now = new Date();
        return getWeekNumber(now);
    }

    // Generación de UI
    function createMainUI() {
        // Crear contenedor principal
        const container = document.createElement("div");
        container.id = "bamboohr-widget";
        container.style.position = "fixed";
        container.style.top = "60px";
        container.style.right = "20px";
        container.style.zIndex = "9999";
        container.style.fontFamily = "system-ui, -apple-system, sans-serif";
        applyTheme(container);

        // Añadir botón de acción
        const actionButton = createActionButton();
        document.body.appendChild(actionButton);

        // Ocultar por defecto
        container.style.display = 'none';
        document.body.appendChild(container);

        return container;
    }

    function applyTheme(element) {
        const theme = THEME[currentTheme];
        element.style.backgroundColor = theme.bg;
        element.style.color = theme.text;
        element.style.border = `1px solid ${theme.border}`;
        element.style.boxShadow = theme.boxShadow;
    }

    function createActionButton() {
        const btn = document.createElement("button");
        btn.id = "bamboohr-button";
        btn.innerHTML = "👥 Ver ausencias";
        btn.style.position = "fixed";
        btn.style.top = "20px";
        btn.style.right = "20px";
        btn.style.zIndex = "9999";
        btn.style.padding = "10px 15px";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.borderRadius = "8px";
        btn.style.cursor = "pointer";
        btn.style.fontFamily = "system-ui, -apple-system, sans-serif";
        btn.style.fontSize = "14px";
        btn.style.fontWeight = "500";
        btn.style.backgroundColor = THEME[currentTheme].primary;
        btn.style.boxShadow = THEME[currentTheme].boxShadow;

        btn.onclick = toggleWidget;

        return btn;
    }

    function toggleWidget() {
        const widget = document.getElementById("bamboohr-widget");
        const isVisible = widget.style.display !== 'none';

        if (isVisible) {
            widget.style.display = 'none';
        } else {
            widget.style.display = 'block';
            loadData();
        }
    }

    function loadData(forceRefresh = false) {
        const loadingIndicator = showLoading();

        fetchICS((events) => {
            hideLoading(loadingIndicator);
            allEvents = events;
            buildWidgetContent();
        }, forceRefresh);
    }

    function showLoading() {
        const widget = document.getElementById("bamboohr-widget");
        widget.innerHTML = '<div style="padding: 20px; text-align: center;">Cargando datos...</div>';
        return widget.firstChild;
    }

    function hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }

    function buildWidgetContent() {
        const widget = document.getElementById("bamboohr-widget");
        widget.innerHTML = '';

        // Añadir estilos
        widget.style.width = "550px";
        widget.style.maxHeight = "80vh";
        widget.style.overflowY = "auto";
        widget.style.borderRadius = "10px";
        widget.style.padding = "0";

        // Cabecera
        const header = document.createElement("div");
        header.style.padding = "12px 15px";
        header.style.borderBottom = `1px solid ${THEME[currentTheme].border}`;
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.backgroundColor = THEME[currentTheme].header;
        widget.appendChild(header);

        // Título
        const title = document.createElement("h2");
        title.innerText = "Ausencias";
        title.style.margin = "0";
        title.style.fontSize = "18px";
        title.style.fontWeight = "600";
        header.appendChild(title);

        // Controles
        const controls = document.createElement("div");
        controls.style.display = "flex";
        controls.style.gap = "10px";
        header.appendChild(controls);

        // Alternador de vista
        const viewToggle = createViewToggle();
        controls.appendChild(viewToggle);

        // Botón de refrescar
        const refreshBtn = document.createElement("button");
        refreshBtn.innerHTML = "🔄";
        refreshBtn.title = "Refrescar datos";
        styleButton(refreshBtn);
        refreshBtn.onclick = () => loadData(true);
        controls.appendChild(refreshBtn);

        // Botón de tema
        const themeBtn = document.createElement("button");
        themeBtn.innerHTML = currentTheme === 'light' ? "🌙" : "☀️";
        themeBtn.title = currentTheme === 'light' ? "Cambiar a tema oscuro" : "Cambiar a tema claro";
        styleButton(themeBtn);
        themeBtn.onclick = toggleTheme;
        controls.appendChild(themeBtn);

        // Botón de cerrar
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "❌";
        closeBtn.title = "Cerrar";
        styleButton(closeBtn);
        closeBtn.onclick = () => {
            widget.style.display = 'none';
        };
        controls.appendChild(closeBtn);

        // Barra de filtros
        const filterBar = createFilterBar();
        widget.appendChild(filterBar);

        // Área de contenido
        const content = document.createElement("div");
        content.id = "bamboohr-content";
        content.style.padding = "15px";
        widget.appendChild(content);

        // Mostrar contenido según la vista actual
        updateContent();
    }

    function styleButton(button) {
        button.style.background = "transparent";
        button.style.border = "none";
        button.style.cursor = "pointer";
        button.style.fontSize = "16px";
        button.style.padding = "5px";
        button.style.borderRadius = "5px";
        button.style.color = THEME[currentTheme].text;

        button.addEventListener('mouseover', function() {
            this.style.backgroundColor = currentTheme === 'light' ? '#eee' : '#444';
        });

        button.addEventListener('mouseout', function() {
            this.style.backgroundColor = 'transparent';
        });
    }

    function createViewToggle() {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.backgroundColor = THEME[currentTheme].border;
        container.style.borderRadius = "6px";
        container.style.overflow = "hidden";

        const weekBtn = document.createElement("button");
        weekBtn.innerHTML = "Semana";
        weekBtn.style.padding = "5px 10px";
        weekBtn.style.border = "none";
        weekBtn.style.cursor = "pointer";
        weekBtn.style.fontSize = "14px";
        weekBtn.style.backgroundColor = currentView === 'week'
            ? THEME[currentTheme].primary
            : 'transparent';
        weekBtn.style.color = currentView === 'week'
            ? '#fff'
            : THEME[currentTheme].text;
        weekBtn.onclick = () => setView('week');

        const monthBtn = document.createElement("button");
        monthBtn.innerHTML = "Mes";
        monthBtn.style.padding = "5px 10px";
        monthBtn.style.border = "none";
        monthBtn.style.cursor = "pointer";
        monthBtn.style.fontSize = "14px";
        monthBtn.style.backgroundColor = currentView === 'month'
            ? THEME[currentTheme].primary
            : 'transparent';
        monthBtn.style.color = currentView === 'month'
            ? '#fff'
            : THEME[currentTheme].text;
        monthBtn.onclick = () => setView('month');

        container.appendChild(weekBtn);
        container.appendChild(monthBtn);

        return container;
    }

    function setView(view) {
        currentView = view;
        saveSettings();
        buildWidgetContent();
    }

    function toggleTheme() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        saveSettings();

        // Actualizar el botón principal
        const mainButton = document.getElementById("bamboohr-button");
        if (mainButton) {
            mainButton.style.backgroundColor = THEME[currentTheme].primary;
            mainButton.style.boxShadow = THEME[currentTheme].boxShadow;
        }

        buildWidgetContent();
    }

    function createFilterBar() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        const filterBar = document.createElement("div");
        filterBar.style.padding = "12px 15px";
        filterBar.style.borderBottom = `1px solid ${THEME[currentTheme].border}`;
        filterBar.style.display = "flex";
        filterBar.style.justifyContent = "space-between";
        filterBar.style.gap = "10px";
        filterBar.style.alignItems = "center";

        if (currentView === 'week') {
            // Selector de semana
            const weekSelect = document.createElement("select");
            weekSelect.style.padding = "8px";
            weekSelect.style.borderRadius = "5px";
            weekSelect.style.border = `1px solid ${THEME[currentTheme].border}`;
            weekSelect.style.backgroundColor = THEME[currentTheme].bg;
            weekSelect.style.color = THEME[currentTheme].text;

            // Calcular el número de semanas en el mes
            const lastDay = new Date(year, month + 1, 0);
            const numberOfWeeks = Math.ceil((lastDay.getDate() + new Date(year, month, 1).getDay()) / 7);

            const currentWeek = getCurrentWeekNumber();

            for (let i = 1; i <= 6; i++) {
                const monday = getMondayOfWeek(i, year, month);
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);

                const optText = `Semana ${i}: ${monday.getDate()} ${monday.toLocaleDateString('es-ES', {month: 'short'})} - ${sunday.getDate()} ${sunday.toLocaleDateString('es-ES', {month: 'short'})}`;

                const opt = document.createElement("option");
                opt.value = i;
                opt.innerText = optText;

                if (i === currentWeek) {
                    opt.selected = true;
                }

                weekSelect.appendChild(opt);
            }

            weekSelect.onchange = () => {
                updateContent(parseInt(weekSelect.value));
            };

            filterBar.appendChild(weekSelect);
        } else {
            // Selector de mes
            const monthSelect = document.createElement("select");
            monthSelect.style.padding = "8px";
            monthSelect.style.borderRadius = "5px";
            monthSelect.style.border = `1px solid ${THEME[currentTheme].border}`;
            monthSelect.style.backgroundColor = THEME[currentTheme].bg;
            monthSelect.style.color = THEME[currentTheme].text;

            const months = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];

            // Añadir mes actual y meses siguientes
            for (let i = 0; i < 3; i++) {
                const m = (month + i) % 12;
                const y = year + Math.floor((month + i) / 12);

                const opt = document.createElement("option");
                opt.value = m;
                opt.innerText = `${months[m]} ${y}`;

                if (i === 0) {
                    opt.selected = true;
                }

                monthSelect.appendChild(opt);
            }

            monthSelect.onchange = () => {
                updateContent(parseInt(monthSelect.value));
            };

            filterBar.appendChild(monthSelect);
        }

        // Filtros adicionales
        const filterTypes = document.createElement("div");
        filterTypes.style.display = "flex";
        filterTypes.style.gap = "5px";

        // Filtro por tipo
        const typeFilter = createTypeFilter();
        filterTypes.appendChild(typeFilter);

        // Búsqueda por nombre
        const searchInput = document.createElement("input");
        searchInput.type = "text";
        searchInput.placeholder = "Buscar persona...";
        searchInput.style.padding = "8px";
        searchInput.style.borderRadius = "5px";
        searchInput.style.border = `1px solid ${THEME[currentTheme].border}`;
        searchInput.style.backgroundColor = THEME[currentTheme].bg;
        searchInput.style.color = THEME[currentTheme].text;
        searchInput.style.width = "150px";

        searchInput.oninput = () => {
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm.length > 0) {
                filteredEvents = allEvents.filter(e =>
                    e.name.toLowerCase().includes(searchTerm)
                );
            } else {
                filteredEvents = [...allEvents];
            }
            updateContent();
        };

        filterTypes.appendChild(searchInput);
        filterBar.appendChild(filterTypes);

        return filterBar;
    }

    function createTypeFilter() {
        const container = document.createElement("select");
        container.style.padding = "8px";
        container.style.borderRadius = "5px";
        container.style.border = `1px solid ${THEME[currentTheme].border}`;
        container.style.backgroundColor = THEME[currentTheme].bg;
        container.style.color = THEME[currentTheme].text;

        const options = [
            { value: 'all', label: 'Todos los tipos' },
            { value: 'vacation', label: '🏖️ Vacaciones' },
            { value: 'sick', label: '🤒 Enfermedad' },
            { value: 'remote', label: '🏠 Remoto' },
            { value: 'other', label: '📝 Otros' }
        ];

        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option.value;
            opt.innerText = option.label;
            container.appendChild(opt);
        });

        container.onchange = () => {
            const selectedType = container.value;
            if (selectedType === 'all') {
                filteredEvents = [...allEvents];
            } else {
                filteredEvents = allEvents.filter(e => e.type === selectedType);
            }
            updateContent();
        };

        return container;
    }

    function updateContent(periodNum) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        // Si no hay eventos filtrados, usar todos los eventos
        const events = filteredEvents.length > 0 ? filteredEvents : allEvents;

        // Agrupar eventos por día
        const eventsByDay = groupByDay(events);

        const content = document.getElementById("bamboohr-content");
        content.innerHTML = '';

        if (currentView === 'week') {
            // Vista semanal
            const weekNum = periodNum || getCurrentWeekNumber();
            const monday = getMondayOfWeek(weekNum, year, month);

            // Título de la semana
            const weekTitle = document.createElement("h3");
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            weekTitle.innerText = `Semana ${weekNum}: ${monday.getDate()} ${monday.toLocaleDateString('es-ES', {month: 'short'})} - ${sunday.getDate()} ${sunday.toLocaleDateString('es-ES', {month: 'short'})}`;
            weekTitle.style.marginBottom = "15px";
            weekTitle.style.marginTop = "0";
            content.appendChild(weekTitle);

            // Mostrar cada día de la semana
            for (let i = 0; i < 7; i++) {
                const day = new Date(monday);
                day.setDate(monday.getDate() + i);
                const dateStr = formatDate(day);
                const peopleOut = eventsByDay[dateStr] || [];

                // Crear sección para el día
                const daySection = createDaySection(day, peopleOut);
                content.appendChild(daySection);
            }
        } else {
            // Vista mensual
            const selectedMonth = periodNum !== undefined ? periodNum : month;
            const firstDay = getFirstDayOfMonth(year, selectedMonth);
            const lastDay = getLastDayOfMonth(year, selectedMonth);

            // Título del mes
            const monthTitle = document.createElement("h3");
            monthTitle.innerText = firstDay.toLocaleDateString('es-ES', {month: 'long', year: 'numeric'});
            monthTitle.style.marginBottom = "15px";
            monthTitle.style.marginTop = "0";
            content.appendChild(monthTitle);

            // Crear calendario mensual
            const calendar = createMonthlyCalendar(firstDay, lastDay, eventsByDay);
            content.appendChild(calendar);

            // Lista de personas por día
            const summary = document.createElement("div");
            summary.style.marginTop = "20px";
            content.appendChild(summary);

            // Título de resumen
            const summaryTitle = document.createElement("h4");
            summaryTitle.innerText = "Resumen de ausencias";
            summaryTitle.style.marginBottom = "10px";
            summary.appendChild(summaryTitle);

            // Obtener todos los días del mes
            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                const dateStr = formatDate(d);
                const peopleOut = eventsByDay[dateStr] || [];

                if (peopleOut.length > 0) {
                    const daySection = createDaySection(d, peopleOut, true);
                    summary.appendChild(daySection);
                }
            }
        }
    }

    function createDaySection(date, peopleList, isCompact = false) {
        const section = document.createElement("div");
        section.style.marginBottom = isCompact ? "10px" : "15px";
        section.style.padding = isCompact ? "8px" : "12px";
        section.style.borderRadius = "8px";
        section.style.border = `1px solid ${THEME[currentTheme].border}`;

        // Destacar el día actual
        const isToday = date.toDateString() === new Date().toDateString();
        if (isToday) {
            section.style.borderColor = THEME[currentTheme].primary;
            section.style.borderWidth = "2px";
        }

        const dayName = date.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "short"
        });

        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.marginBottom = isCompact ? "5px" : "8px";
        section.appendChild(header);

        const dayTitle = document.createElement("strong");
        dayTitle.style.fontSize = isCompact ? "15px" : "16px";
        dayTitle.innerHTML = `📅 ${capitalize(dayName)}`;
        if (isToday) {
            dayTitle.innerHTML += ' <span style="color:' + THEME[currentTheme].primary + ';">(Hoy)</span>';
        }
        header.appendChild(dayTitle);

        const count = document.createElement("span");
        count.style.padding = "3px 8px";
        count.style.borderRadius = "12px";
        count.style.fontSize = "12px";
        count.style.fontWeight = "bold";
        count.style.backgroundColor = THEME[currentTheme].secondary;
        count.style.color = "#fff";
        count.innerText = `${peopleList.length} ${peopleList.length === 1 ? "persona" : "personas"}`;
        header.appendChild(count);

        if (peopleList.length > 0) {
            const list = document.createElement("ul");
            list.style.margin = "0";
            list.style.padding = "0 0 0 " + (isCompact ? "15px" : "20px");

            peopleList.sort((a, b) => a.name.localeCompare(b.name));
      for (const person of peopleList) {
                const item = document.createElement("li");
                item.style.marginBottom = "4px";

                // Generar iconos según el tipo de ausencia
                let typeIcon = '';
                let typeColor = '';

                switch (person.type) {
                    case 'vacation':
                        typeIcon = '🏖️';
                        typeColor = '#4CAF50'; // Verde
                        break;
                    case 'sick':
                        typeIcon = '🤒';
                        typeColor = '#F44336'; // Rojo
                        break;
                    case 'remote':
                        typeIcon = '🏠';
                        typeColor = '#2196F3'; // Azul
                        break;
                    default:
                        typeIcon = '📝';
                        typeColor = '#9E9E9E'; // Gris
                }

                // Mostrar duración si es multidía
                let duration = '';
                if (person.startDate !== person.endDate) {
                    const startDate = parseDate(person.startDate);
                    const endDate = parseDate(person.endDate);
                    const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

                    duration = ` (${totalDays} día${totalDays > 1 ? 's' : ''})`;
                }

                item.innerHTML = `<span style="color: ${typeColor}; margin-right: 5px;">${typeIcon}</span> ${person.name}${duration}`;

                // Añadir tooltip con fechas completas
                if (person.startDate !== person.endDate) {
                    item.title = `${person.startDate} hasta ${person.endDate}`;
                }

                list.appendChild(item);
            }
            section.appendChild(list);
        } else {
            const emptyMsg = document.createElement("p");
            emptyMsg.style.margin = "5px 0 0 0";
            emptyMsg.style.fontStyle = "italic";
            emptyMsg.style.color = THEME[currentTheme].secondary;
            emptyMsg.innerText = "Nadie ausente";
            section.appendChild(emptyMsg);
        }

        return section;
    }

    function createMonthlyCalendar(firstDay, lastDay, eventsByDay) {
        const container = document.createElement("div");
        container.style.display = "grid";
        container.style.gridTemplateColumns = "repeat(7, 1fr)";
        container.style.gap = "5px";

        // Añadir cabeceras de los días de la semana
        const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        weekdays.forEach(day => {
            const header = document.createElement("div");
            header.style.textAlign = "center";
            header.style.fontWeight = "bold";
            header.style.padding = "5px";
            header.innerText = day;
            container.appendChild(header);
        });

        // Calcular el offset para el primer día
        const firstDayOfWeek = firstDay.getDay() || 7; // 0 = Domingo, 1-6 = Lunes-Sábado
        const offset = firstDayOfWeek - 1; // Ajustar para que Lunes sea 0

        // Añadir celdas vacías antes del primer día
        for (let i = 0; i < offset; i++) {
            const emptyCell = document.createElement("div");
            emptyCell.style.padding = "8px";
            container.appendChild(emptyCell);
        }

        // Añadir todos los días del mes
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            const peopleOut = eventsByDay[dateStr] || [];

            const cell = document.createElement("div");
            cell.style.padding = "5px";
            cell.style.border = `1px solid ${THEME[currentTheme].border}`;
            cell.style.borderRadius = "5px";
            cell.style.minHeight = "60px";

            // Destacar el día actual
            const isToday = d.toDateString() === new Date().toDateString();
            if (isToday) {
                cell.style.borderColor = THEME[currentTheme].primary;
                cell.style.borderWidth = "2px";
            }

            // Añadir número de día
            const dayNumber = document.createElement("div");
            dayNumber.style.fontWeight = "bold";
            dayNumber.style.marginBottom = "5px";
            dayNumber.innerText = d.getDate();

            if (isToday) {
                dayNumber.style.color = THEME[currentTheme].primary;
            }

            cell.appendChild(dayNumber);

            // Mostrar número de personas ausentes
            if (peopleOut.length > 0) {
                const count = document.createElement("div");
                count.style.fontSize = "12px";
                count.style.fontWeight = "500";
                count.style.padding = "2px 5px";
                count.style.borderRadius = "10px";
                count.style.backgroundColor = THEME[currentTheme].secondary;
                count.style.color = "#fff";
                count.style.display = "inline-block";
                count.innerText = peopleOut.length.toString();
                count.title = `${peopleOut.length} persona${peopleOut.length > 1 ? 's' : ''} ausente${peopleOut.length > 1 ? 's' : ''}`;

                cell.appendChild(count);

                // Mostrar iconos de tipo de ausencia
                const typeIcons = document.createElement("div");
                typeIcons.style.marginTop = "5px";

                const typeCount = {
                    vacation: 0,
                    sick: 0,
                    remote: 0,
                    other: 0
                };

                peopleOut.forEach(person => typeCount[person.type]++);

                if (typeCount.vacation > 0) {
                    typeIcons.innerHTML += `<span title="${typeCount.vacation} Vacaciones">🏖️${typeCount.vacation > 1 ? typeCount.vacation : ''}</span> `;
                }

                if (typeCount.sick > 0) {
                    typeIcons.innerHTML += `<span title="${typeCount.sick} Enfermedad">🤒${typeCount.sick > 1 ? typeCount.sick : ''}</span> `;
                }

                if (typeCount.remote > 0) {
                    typeIcons.innerHTML += `<span title="${typeCount.remote} Remoto">🏠${typeCount.remote > 1 ? typeCount.remote : ''}</span> `;
                }

                if (typeCount.other > 0) {
                    typeIcons.innerHTML += `<span title="${typeCount.other} Otros">📝${typeCount.other > 1 ? typeCount.other : ''}</span>`;
                }

                cell.appendChild(typeIcons);
            }

            container.appendChild(cell);
        }

        return container;
    }

    function showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.innerText = message;
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.right = "20px";
        notification.style.padding = "10px 15px";
        notification.style.borderRadius = "5px";
        notification.style.zIndex = "10000";
        notification.style.fontSize = "14px";
        notification.style.fontWeight = "500";
        notification.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";

        if (type === "error") {
            notification.style.backgroundColor = THEME[currentTheme].danger;
            notification.style.color = "#fff";
        } else {
            notification.style.backgroundColor = THEME[currentTheme].success;
            notification.style.color = "#fff";
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = "0";
            notification.style.transition = "opacity 0.5s ease";
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Inicialización
    function init() {
        loadSettings();

        // Comprobar si el widget ya existe y eliminarlo
        const existingWidget = document.getElementById("bamboohr-widget");
        if (existingWidget) existingWidget.remove();

        const existingButton = document.getElementById("bamboohr-button");
        if (existingButton) existingButton.remove();

        // Crear la UI principal
        createMainUI();
    }

    // Ejecutar después de que la página se ha cargado completamente
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(init, 1000);
    } else {
        window.addEventListener("DOMContentLoaded", () => setTimeout(init, 1000));
    }
})();
