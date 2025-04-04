(function() {
    'use strict';

    // Obtener la URL actual
    const currentURL = window.location.href;

    // Expresión regular para verificar si estamos en el dominio correcto
    const regexCyborgDomain = /https:\/\/cyborg\.deckard\.com\//; // Coincide con cualquier página en cyborg.deckard.com

    // Verificamos si la página actual corresponde al dominio deseado
    if (!regexCyborgDomain.test(currentURL)) {
        console.log("Este script no se ejecutará en esta página.");
        return;  // Salimos si no estamos en el dominio correcto
    }

    const addStyle = (css) => {
        // Verifica si los estilos ya fueron añadidos
        if (document.querySelector('#custom-cyborg-styles')) return;

        const style = document.createElement('style');
        style.id = 'custom-cyborg-styles';
        style.textContent = css;
        document.head.appendChild(style);
    };

    const applyStyles = () => {
        if (!document.head) {
            setTimeout(applyStyles, 50);
            return;
        }

        addStyle(`
        /* Encabezados */
        .cyborg-str-tool h1:not(#window_vetting_dlg *):not(#vetting_data_footer *), 
        .cyborg-str-tool h2:not(#window_vetting_dlg *):not(#vetting_data_footer *), 
        .cyborg-str-tool h3:not(#window_vetting_dlg *):not(#window_vetting_dlg *), 
        .cyborg-str-tool h4:not(#window_vetting_dlg *):not(#vetting_data_footer *), 
        .cyborg-str-tool h5:not(#vetting_dlg *):not(#vetting_data_footer *), 
        .cyborg-str-tool h6:not(#window_vetting_dlg *):not(#vetting_data_footer *) {
            font-weight: bold !important;
            color: #C9D82B !important; 
            font-size: 15px !important;
        }

        /* Resto de los botones */
        .cyborg-str-tool button:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(#btn_submit_vetting_dlg):not([style*="Nearby Parcels"]):not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]):not(.pop_up_header_container *):not(#iframe-button-container button),
        .cyborg-str-tool .btn:not(#window_vetting_dlg *):not(#vetting_data_footer *):not(#btn_submit_vetting_dlg):not([style*="Nearby Parcels"]):not(.fancybox-button):not([data-test-id="float-window-minimize-or-restore-btn"]):not([data-test-id="float-window-close-btn"]):not(.pop_up_header_container *):not(#iframe-button-container button),
        #btn_submit_vetting_dlg {
            background-color: #1b95bf !important;
            color: white !important;
            border-radius: 5px !important;
            padding: 5px 8px !important;
            font-size: 14px !important;
            border: none !important;
            transition: 0.3s ease-in-out !important;
        }

        /* Otros estilos, similar a los que has dado */
        `);

        document.body.classList.add('cyborg-str-tool');
    };

    // Esperamos hasta que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyStyles);
        window.addEventListener('load', applyStyles); 
    } else {
        applyStyles();
    }

    // Función para hacer clic en el botón
    function clickButton() {
        var button = document.getElementById('btn_submit_vetting_dlg');
        if (button) {
            button.click();
        }
    }

    // Evento para detectar la combinación de teclas Ctrl+S
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            clickButton();
        }
    }, false);

})();

