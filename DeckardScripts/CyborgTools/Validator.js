// ==UserScript==
// @name         Validador de Campos Mejorado
// @version      1.0
// @description  Valida campos en una tabla y muestra alertas con diseño moderno
// @author       Lucho (Optimizado)
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuración
    const CONFIG = {
        animationDuration: '1s',
        notificationTimeout: 30000, // Tiempo en ms para que la notificación desaparezca automáticamente
        observerDelay: 3000       // Tiempo en ms para iniciar el observador
    };

    // Mensajes de error
    const MENSAJES = {
        unitboxFaltante: 'Missing unitbox',
        olvidoEliminarAO: 'Forgot to delete AO'
    };

    // Añadir estilos CSS modernos
    const insertarEstilos = () => {
        const estilos = document.createElement('style');
        estilos.textContent = `
            @keyframes aparecer {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes pulsar {
                0%, 100% { transform: scale(1); box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); }
                50% { transform: scale(1.05); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4); }
            }

            .validador-notificacion {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ff5252, #b33939);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                font-weight: 500;
                font-size: 16px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                animation: aparecer 0.3s ease-out, pulsar ${CONFIG.animationDuration} infinite;
                display: flex;
                align-items: center;
                min-width: 250px;
                max-width: 450px;
                backdrop-filter: blur(5px);
            }

            .validador-icono {
                margin-right: 10px;
                font-size: 20px;
            }

            .validador-notificacion.validador-exito {
                background: linear-gradient(135deg, #4CAF50, #2E7D32);
            }

            .celda-error {
                background-color: rgba(255, 0, 0, 0.1) !important;
                border: 1px solid rgba(255, 0, 0, 0.3) !important;
            }

            .celda-animada {
                animation: pulsar 1s infinite;
            }
        `;
        document.head.appendChild(estilos);
    };

    // Sistema de notificaciones mejorado
    class SistemaNotificaciones {
        constructor() {
            this.notificacionActual = null;
            this.timeoutId = null;
        }

        mostrar(mensaje, tipo = 'error') {
            this.ocultar(); // Oculta cualquier notificación previa

            // Crear contenedor de la notificación
            const notificacion = document.createElement('div');
            notificacion.className = `validador-notificacion ${tipo === 'exito' ? 'validador-exito' : ''}`;

            // Icono según el tipo
            const icono = document.createElement('span');
            icono.className = 'validador-icono';
            icono.textContent = tipo === 'exito' ? '✓' : '⚠️';

            // Texto de la notificación
            const texto = document.createElement('span');
            texto.textContent = mensaje;

            // Ensamblar notificación
            notificacion.appendChild(icono);
            notificacion.appendChild(texto);
            document.body.appendChild(notificacion);

            this.notificacionActual = notificacion;

            // Configurar autodesaparición
            this.timeoutId = setTimeout(() => this.ocultar(), CONFIG.notificationTimeout);

            // Permitir cerrar haciendo clic
            notificacion.addEventListener('click', () => this.ocultar());

            return notificacion;
        }

        ocultar() {
            if (this.notificacionActual) {
                document.body.removeChild(this.notificacionActual);
                this.notificacionActual = null;
            }

            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        }

        exito(mensaje) {
            return this.mostrar(mensaje, 'exito');
        }
    }

    // Validador mejorado
    class ValidadorCampos {
        constructor() {
            this.notificaciones = new SistemaNotificaciones();
            this.observer = null;
            this.ultimoEstado = {
                estructuraCorrecta: true,
                apnCorrecto: true
            };
        }

        resaltarCeldaError(celda) {
            if (!celda) return;

            celda.classList.add('celda-error', 'celda-animada');

            // Eliminar el resaltado después de unos segundos
            setTimeout(() => {
                celda.classList.remove('celda-animada');
            }, 30000);
        }

        limpiarResaltados() {
            const celdas = document.querySelectorAll('.celda-error');
            celdas.forEach(celda => {
                celda.classList.remove('celda-error', 'celda-animada');
            });
        }

        validar() {
            // Selecciona la tabla dentro del div con id 'div_vetted_data'
            const tabla = document.querySelector("#div_vetted_data #vetted_result_table");
            if (!tabla) return;

            let estructuraCorrecta = true;
            let apnCorrecto = true;
            let celdasConError = [];

            // Validar campo "structure" y "unit_number"
            const estructuraElementos = tabla.querySelectorAll("td.value[data-field-name='structure'] p");
            estructuraElementos.forEach(elemento => {
                if (elemento.textContent.trim().toLowerCase().startsWith('adu')) {
                    const fila = elemento.closest('tr');
                    const celdaUnitNumber = fila ?
                        fila.parentElement.querySelector("tr td.value[data-field-name='unit_number']") : null;
                    const siguienteElemento = celdaUnitNumber ?
                        celdaUnitNumber.querySelector("p") : null;

                    if (!siguienteElemento || !siguienteElemento.textContent.trim().toUpperCase().startsWith('ADU')) {
                        estructuraCorrecta = false;
                        if (celdaUnitNumber) celdasConError.push(celdaUnitNumber);
                    }
                }
            });

            // Validar campo "apn" y "address"
            const apnElementos = tabla.querySelectorAll("td.value[data-field-name='apn'] p");
            apnElementos.forEach(elemento => {
                if (!elemento.textContent.trim().startsWith('__NO_MATCH_FOUND')) {
                    const addressCelda = tabla.querySelector("td.value[data-field-name='address']");
                    const addressElemento = addressCelda ? addressCelda.querySelector("p") : null;

                    if (addressElemento && addressElemento.textContent.includes('Unit # unk')) {
                        apnCorrecto = false;
                        if (addressCelda) celdasConError.push(addressCelda);
                    }
                }
            });

            // Comprobar si hubo cambios en el estado
            const estadoActual = {
                estructuraCorrecta,
                apnCorrecto
            };

            const huboCSambios =
                this.ultimoEstado.estructuraCorrecta !== estadoActual.estructuraCorrecta ||
                this.ultimoEstado.apnCorrecto !== estadoActual.apnCorrecto;

            // Actualizar el estado
            this.ultimoEstado = estadoActual;

            if (huboCSambios) {
                // Limpiar resaltados anteriores
                this.limpiarResaltados();

                // Mostrar notificaciones según las validaciones
                if (!estructuraCorrecta) {
                    this.notificaciones.mostrar(MENSAJES.unitboxFaltante);
                    // Resaltar celdas con error
                    celdasConError.forEach(celda => this.resaltarCeldaError(celda));
                } else if (!apnCorrecto) {
                    this.notificaciones.mostrar(MENSAJES.olvidoEliminarAO);
                    // Resaltar celdas con error
                    celdasConError.forEach(celda => this.resaltarCeldaError(celda));
                } else {
                    this.notificaciones.exito('Done!');
                    setTimeout(() => this.notificaciones.ocultar(), 2000);
                }
            }
        }

        iniciar() {
            // Insertar estilos
            insertarEstilos();

            // Configurar el observador
            this.observer = new MutationObserver(() => this.validar());

            // Esperar a que la tabla esté disponible
            const iniciarObservador = () => {
                const tabla = document.querySelector("#div_vetted_data #vetted_result_table");
                if (tabla) {
                    this.observer.observe(tabla, {
                        childList: true,
                        subtree: true,
                        characterData: true,
                        attributes: true
                    });

                    // Ejecutar validación inicial
                    this.validar();
                } else {
                    // Si no encuentra la tabla, volver a intentar en 1 segundo
                    setTimeout(iniciarObservador, 1000);
                }
            };

            // Iniciar el observador con un retraso
            setTimeout(iniciarObservador, CONFIG.observerDelay);
        }

        detener() {
            if (this.observer) {
                this.observer.disconnect();
            }
            this.notificaciones.ocultar();
        }
    }

    // Iniciar el validador
    const validador = new ValidadorCampos();
    validador.iniciar();

    // Exportar a la ventana para depuración (opcional)
    window.validadorCampos = validador;
})();
