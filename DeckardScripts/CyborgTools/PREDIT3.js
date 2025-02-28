(function () {
    'use strict';

    const CACHE_KEY = 'projectDataCache';
    const COLUMN_WIDTHS = ['10%', '10%', '10%', '50%', '20%'];
    const HEADERS = ['Project', 'Public Records & GIS', 'License List', 'Important Info', 'Media'];

    const PROJECT_NAME_PATTERNS = [
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/_/, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[2].replace(/_/g, ' '))} County` },
        { regex: /\/listing\/([A-Za-z]+)\/([^\/]+)\/([^\/]+)\//, format: m => `${m[1].toUpperCase()} - ${capitalizeWords(m[3].replace(/_/g, ' '))}` }
    ];

    const NO_PREVIEW_IMAGE = "https://via.placeholder.com/150x100?text=No+Preview";

    function getProjectNameFromUrl() {
        const url = window.location.href;
        for (const { regex, format } of PROJECT_NAME_PATTERNS) {
            const match = url.match(regex);
            if (match) return format(match);
        }
        return null;
    }

    function capitalizeWords(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    function applyStyles(element, styles) {
        for (const property in styles) {
            element.style[property] = styles[property];
        }
    }

    function displayData(data) {
        const projectName = getProjectNameFromUrl();
        if (!projectName) {
            console.error('Project name not found in URL.');
            return;
        }

        const projectData = data.tabla.find(project => project.Project.toLowerCase() === projectName.toLowerCase());
        if (!projectData) {
            console.warn(`No data found for: ${projectName}`);
            return;
        }

        if (projectData.Project.includes(' - ')) {
            projectData.Project = projectData.Project.split(' - ').map((part, index) => index === 0 ? part : capitalizeWords(part)).join(' - ');
        }

        const table = document.createElement('table');
        applyStyles(table, {
            width: '100%', borderCollapse: 'collapse', fontSize: '14px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd'
        });

        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        HEADERS.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;
            applyStyles(th, {
                border: '1px solid #ddd', padding: '10px 12px', width: COLUMN_WIDTHS[index], textAlign: 'left',
                backgroundColor: '#f8f9fa', fontSize: '16px', color: '#343a40', fontWeight: '600',
                borderBottom: '2px solid #dee2e6'
            });
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();
        const row = tbody.insertRow();
        HEADERS.forEach((header, index) => {
            const cell = row.insertCell();
            applyStyles(cell, {
                border: '1px solid #ddd', padding: '10px 12px', width: COLUMN_WIDTHS[index], fontSize: '14px', color: '#495057'
            });

            if (Array.isArray(projectData[header])) {
                if (header === 'Media') {
                    projectData[header].forEach(item => {
                        const container = document.createElement('div');
                        container.style.marginBottom = '8px';

                        const img = document.createElement('img');
                        img.alt = item.type;
                        img.style.cssText = 'max-width: 100%; max-height: 100px; border-radius: 4px; display: block; margin: 0 auto;';
                        img.loading = "lazy";

                        img.onerror = () => {
                            img.src = NO_PREVIEW_IMAGE;
                            img.alt = "No Preview Available";
                        };

                        img.src = item.url;

                        container.appendChild(img);
                        cell.appendChild(container);
                    });
                } else {
                    projectData[header].forEach(link => {
                        const a = document.createElement('a');
                        a.href = link.url;
                        a.textContent = link.type;
                        a.target = '_blank';
                        applyStyles(a, { display: 'block', fontSize: '14px', color: '#23A9D8', textDecoration: 'none' });

                        a.addEventListener('mouseover', () => a.style.textDecoration = 'underline');
                        a.addEventListener('mouseout', () => a.style.textDecoration = 'none');

                        cell.appendChild(a);
                    });
                }
            } else if (header === 'Important Info') {
                cell.innerHTML = projectData[header] ? projectData[header].replace(/\n/g, '<br>') : '';
            } else {
                cell.textContent = projectData[header] || '';
            }
        });

        document.body.appendChild(table);
    }

    function requestDataFromExtension() {
        chrome.runtime.sendMessage({ action: "getProjectData" }, (response) => {
            if (response && response.success) {
                displayData(response.data);
            } else {
                console.error("Error retrieving data from extension:", response?.error || "Unknown error");
            }
        });
    }

    requestDataFromExtension();
})();
