<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA Tool</title>
    <style>
        /* Estilos para el contenedor y el botón de activación */
        #qa-button-container {
            position: fixed;
            bottom: 10px;
            left: 10px;
            display: none;
            background-color: #333;
            padding: 10px;
            border-radius: 5px;
            z-index: 1000;
        }
        
        #qa-button {
            position: fixed;
            bottom: 10px;
            left: 10px;
            background-color: #007bff;
            color: white;
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 1001;
        }

        .qa-tool-button {
            background-color: #555;
            color: white;
            padding: 8px;
            margin: 5px 0;
            border: none;
            cursor: pointer;
            width: 100%;
            border-radius: 3px;
        }

        /* Estilos del iframe y botón de cierre */
        #iframe-display {
            position: fixed;
            top: 0;
            right: 0;
            width: 0;
            height: 100%;
            background-color: white;
            border-left: 2px solid #333;
            z-index: 1002;
            transition: width 0.3s;
        }

        #close-button {
            position: absolute;
            top: 10px;
            left: 10px;
            background-color: red;
            color: white;
            padding: 5px;
            border: none;
            cursor: pointer;
            display: none;
        }
    </style>
</head>
<body>

    <!-- Botón de activación -->
    <div id="qa-button">QA</div>

    <!-- Contenedor de botones -->
    <div id="qa-button-container">
        <button class="qa-tool-button" onclick="openReports()">Reports</button>
        <button class="qa-tool-button" onclick="toggleIframe('https://dinfcs.github.io/Deckardaov/Feedback%20Gerenator/', 50)">FBG</button>
        <button class="qa-tool-button" onclick="openNewTab('https://deckardtech.atlassian.net/wiki/spaces/PC/pages/1717403844')">PR</button>
        <button class="qa-tool-button" onclick="toggleIframe('https://login-spatialstream.prod.lightboxre.com/MemberPages/Login.aspx?ReturnUrl=%2fmemberpages%2fdefault.aspx%3fma%3ddeckardtech&ma=deckardtech', 95)">LB</button>
        <button class="qa-tool-button" onclick="openNewTab('https://pqweb.parcelquest.com/#login')">PQ</button>
        <button class="qa-tool-button" onclick="openNewTab('https://app.regrid.com/')">Regrid</button>
    </div>

    <!-- Iframe y botón de cierre -->
    <div id="iframe-display">
        <button id="close-button" onclick="closeIframe()">Cerrar</button>
        <iframe id="iframe-content" src="" frameborder="0" style="width: 100%; height: 100%;"></iframe>
    </div>

    <script>
        const qaButton = document.getElementById('qa-button');
        const qaButtonContainer = document.getElementById('qa-button-container');
        const iframeDisplay = document.getElementById('iframe-display');
        const iframeContent = document.getElementById('iframe-content');
        const closeButton = document.getElementById('close-button');
        let timeoutId;

        // Mostrar/ocultar contenedor al hacer clic en QA
        qaButton.addEventListener('click', () => {
            qaButtonContainer.style.display = qaButtonContainer.style.display === 'block' ? 'none' : 'block';
            resetHideTimeout();
        });

        // Función para abrir los enlaces de "Reports" en nuevas pestañas
        function openReports() {
            const urls = [
                'https://docs.google.com/forms/d/e/1FAIpQLScy1lhhAZ4ToD24DDpR_lZBS-cTuSGwlBJgthaaRKIOMdP2SA/viewform',
                'https://netorgft4047789.sharepoint.com/:x:/r/sites/DeckardTech/_layouts/15/Doc.aspx?sourcedoc=%7B47368938-EB2C-4EFE-9DAA-121BFE647C8B%7D&file=Random%20QA%20projects.xlsx&action=default&mobileredirect=true',
                'https://docs.google.com/spreadsheets/d/14N1pWw7fVIDgTko2A7faqbmkPVXM8LnHaeR0bd_TGxw/edit?gid=0#gid=0'
            ];
            urls.forEach(url => window.open(url, '_blank'));
        }

        // Función para abrir URLs en un iframe específico
        function toggleIframe(url, widthPercent) {
            if (iframeContent.src === url) {
                closeIframe();
            } else {
                iframeContent.src = url;
                iframeDisplay.style.width = widthPercent + '%';
                closeButton.style.display = 'block';
            }
            resetHideTimeout();
        }

        // Cerrar el iframe y ocultar el botón de cierre
        function closeIframe() {
            iframeDisplay.style.width = '0%';
            iframeContent.src = '';
            closeButton.style.display = 'none';
        }

        // Abrir una nueva pestaña para otros botones
        function openNewTab(url) {
            window.open(url, '_blank');
        }

        // Función para reiniciar el temporizador de ocultamiento
        function resetHideTimeout() {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                qaButtonContainer.style.display = 'none';
            }, 30000);
        }
    </script>

</body>
</html>
