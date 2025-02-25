(function () {
    'use strict';

    // Verifica si un texto contiene coordenadas en el formato "lat, lng"
    function esCoordenada(texto) {
        const regex = /^\s*([-+]?\d{1,2}(?:\.\d+)?),\s*(-\d{1,3}(?:\.\d+)?)\s*$/;
        return regex.test(texto);
    }

    // Obtiene coordenadas desde el portapapeles
    async function obtenerCoordenadasDesdePortapapeles() {
        try {
            const texto = await navigator.clipboard.readText();
            return esCoordenada(texto) ? texto.match(/([-+]?\d{1,2}(?:\.\d+)?),\s*(-\d{1,3}(?:\.\d+)?)/).slice(1, 3) : null;
        } catch (e) {
            console.error('Error al acceder al portapapeles:', e);
            return null;
        }
    }

    // Crea un contenedor flotante
    function crearContenedorBotones() {
        if (document.getElementById('buscador-coordenadas-container')) return;

        const contenedor = document.createElement('div');
        contenedor.id = 'buscador-coordenadas-container';
        contenedor.style.position = 'fixed';
        contenedor.style.top = '50%';
        contenedor.style.right = '20px';
        contenedor.style.transform = 'translateY(-50%)';
        contenedor.style.zIndex = '9999';
        contenedor.style.background = 'rgba(0, 0, 0, 0.5)';
        contenedor.style.borderRadius = '10px';
        contenedor.style.padding = '10px';
        contenedor.style.display = 'flex';
        contenedor.style.flexDirection = 'column';
        contenedor.style.gap = '5px';
        document.body.appendChild(contenedor);
        return contenedor;
    }

    // Crea un botón flotante dentro del contenedor
    function crearBoton(icono, onClick) {
        const btn = document.createElement('button');
        btn.innerHTML = icono;
        btn.style.padding = '10px';
        btn.style.fontSize = '24px';
        btn.style.background = 'transparent';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.display = 'block';
        btn.onclick = onClick;
        return btn;
    }

    // Inicializa los botones según el servicio de mapas actual
    async function inicializarBotones() {
        const mapaActual = window.location.host;
        const contenedor = crearContenedorBotones();
        if (!contenedor) return;

        // Mapeo de botones según el servicio actual
        const botones = {
            'bing.com': [
                { icono: '🌐', url: (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
                { icono: '🦆', url: (lat, lng) => `https://duckduckgo.com/?q=${lat},${lng}+Show+on+Map&ia=web&iaxm=maps` }
            ],
            'google.com': [
                { icono: '📍', url: (lat, lng) => `https://www.bing.com/maps?q=${lat},${lng}&cp=${lat}~${lng}&lvl=16.0&style=h` },
                { icono: '🦆', url: (lat, lng) => `https://duckduckgo.com/?q=${lat},${lng}+Show+on+Map&ia=web&iaxm=maps` }
            ],
            'duckduckgo.com': [
                { icono: '🌐', url: (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
                { icono: '📍', url: (lat, lng) => `https://www.bing.com/maps?q=${lat},${lng}&cp=${lat}~${lng}&lvl=16.0&style=h` }
            ]
        };

        // Determina qué botones agregar según la página actual
        const mapaClave = mapaActual.includes('bing.com') ? 'bing.com'
            : mapaActual.includes('google.com') ? 'google.com'
                : 'duckduckgo.com';

        for (const { icono, url } of botones[mapaClave]) {
            contenedor.appendChild(crearBoton(icono, async () => {
                const coordenadas = await obtenerCoordenadasDesdePortapapeles();
                if (coordenadas) {
                    const [lat, lng] = coordenadas;
                    window.open(url(lat, lng), '_blank');
                } else {
                    alert('No se encontraron coordenadas válidas en el portapapeles.');
                }
            }));
        }
    }

    // Ejecutar cuando la página cargue
    window.addEventListener('load', inicializarBotones);
})();
