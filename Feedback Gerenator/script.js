const extraFields = document.getElementById('extra-fields');
const resultado = document.getElementById('resultado');

// Manejar la selección de la plantilla para mostrar los campos correspondientes
document.getElementById('template').addEventListener('change', function () {
    extraFields.innerHTML = '';
    const selectedTemplate = this.value;

    // Generar campos específicos según la plantilla seleccionada
    if (selectedTemplate === 'wrong-structure') {
        extraFields.innerHTML += `
            <label for="wrong-structure">Estructura incorrecta:</label>
            <select id="wrong-structure">
                <option value="Main">Main</option>
                <option value="Adu">Adu</option>
                <option value="U1OM">U1OM</option>
                <option value="Rv">Rv</option>
                <option value="Resort">Resort</option>
                <option value="Timeshared">Time shared</option>
                <option value="Event Space">Event Space</option>
                <option value="Other">Other</option>
                <option value="Unknown">Unknown</option>
            </select>

            <label for="correct-structure">Estructura correcta:</label>
            <select id="correct-structure">
                <option value="Main">Main</option>
                <option value="Adu">Adu</option>
                <option value="U1OM">U1OM</option>
                <option value="Rv">Rv</option>
                <option value="Resort">Resort</option>
                <option value="Timeshared">Time shared</option>
                <option value="Event Space">Event Space</option>
                <option value="Other">Other</option>
                <option value="Unknown">Unknown</option>
            </select>
        `;
    } else if (selectedTemplate === 'wrong-apn') {
        extraFields.innerHTML += `
            <label for="motivos">Motivos:</label>
            <textarea id="motivos" placeholder="Introduce los motivos por los que piensas que la APN está mal"></textarea>
        `;
    } else if (selectedTemplate === 'missing-address-override') {
        extraFields.innerHTML += `
            <label for="fuente">Fuente de información:</label>
            <input type="text" id="fuente" placeholder="Fuente de información (RP, LB, etc.)">
        `;
    } else if (selectedTemplate === 'missing-unit-box') {
        extraFields.innerHTML += `
            <label for="unitBox">Unit Box:</label>
            <input type="text" id="unitBox" placeholder="Unit Box no completado">
        `;
    } else if (selectedTemplate === 'nmf-address-override') {
        extraFields.innerHTML += `
            <!-- No se necesita campo adicional -->
        `;
    } else if (selectedTemplate === 'wrong-unit-box') {
        extraFields.innerHTML += `
            <label for="wrong-unit-box">Unit Box incorrecto:</label>
            <input type="text" id="wrong-unit-box" placeholder="Sin informacion / Unit Box incorrecto">
            
            <label for="correct-unit-box">Unit Box correcto:</label>
            <input type="text" id="correct-unit-box" placeholder="Unit Box correcto">
        `;
    } else if (selectedTemplate === 'wrong-address-override') {
        extraFields.innerHTML += `
            <label for="fuente-override">Fuente de información:</label>
            <input type="text" id="fuente-override" placeholder="Fuente de información (RP, LB, etc.)">
            
            <label for="correct-override">Override correcto:</label>
            <input type="text" id="correct-override" placeholder="Override correcto">
        `;
    }
});

// Generar el feedback según la plantilla seleccionada y los datos del usuario
function generarFeedback() {
    const nombre = document.getElementById('nombre').value;
    const proyecto = document.getElementById('proyecto').value;
    const link = document.getElementById('link').value;
    const template = document.getElementById('template').value;

    let feedback = '';
    if (template === 'wrong-structure') {
        const wrongStructure = document.getElementById('wrong-structure').value;
        const correctStructure = document.getElementById('correct-structure').value;
        feedback = `¡Hola ${nombre}! Espero que estés teniendo un buen día. Hoy estoy realizando Random QA y encontré <a href="${link}" target="_blank">esta propiedad tuya</a> en ${proyecto}. Hiciste un buen trabajo identificando la propiedad, sin embargo noté que la mapeaste como ${wrongStructure}, cuando en realidad es ${correctStructure}. Esto lo identifiqué a través de los registros públicos y las imágenes aéreas. Te recomiendo revisarlo más a detalle una próxima vez. ¡Muchas Gracias!`;
    } else if (template === 'wrong-apn') {
        const motivos = document.getElementById('motivos').value;
        feedback = `Hola ${nombre}, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <a href="${link}" target="_blank">esta propiedad tuya</a> en ${proyecto}, Después de revisarla cuidadosamente, llegué a la conclusión de que no fue identificada correctamente. Mis motivos son: ${motivos}. Por favor, déjame saber si tienes alguna duda al respecto. ¡Gracias por tu tiempo!`;
    } else if (template === 'missing-address-override') {
        const fuente = document.getElementById('fuente').value;
        feedback = `Saludos ${nombre}, espero que todo esté bien. Hoy mientras revisaba Random QA, encontré <a href="${link}" target="_blank">esta propiedad tuya</a> en ${proyecto}. La identificación fue precisa y la evidencia espectacular 😍. Sin embargo, al revisarla, noté que la dirección era un poco extraña, así que la busqué en ${fuente} y me di cuenta de que era necesario realizar (Address Override), ya que la que apareció era diferente. Por favor, tenlo en cuenta para la próxima vez. ¡Muchas gracias!`;
    } else if (template === 'missing-unit-box') {
        const unitBox = document.getElementById('unitBox').value;
        feedback = `¡Saludos ${nombre}!, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <a href="${link}" target="_blank">esta propiedad tuya</a> en ${proyecto}. Noté que omitiste llenar el campo 'Unit Box', en este caso era "${unitBox}". Recuerda que este campo es importante para separar las Property Cards en RS. Este puede estar en las imágenes o en la descripción del listing. Tenlo presente para una próxima vez. ¡Muchas gracias!`;
    } else if (template === 'nmf-address-override') {
        feedback = `¡Saludos ${nombre}!, ¡espero que todo esté yendo bien! 🤗 Hoy estoy realizando Random QA y me encontré con <a href="${link}" target="_blank">esta propiedad tuya</a> en ${proyecto}. Está muy bien identificada, sin embargo, olvidaste borrar el AOV anterior cuando estaba en NMF. Ten presente siempre validar esto antes de guardar el listing, sobre todo cuando estás en FP. ¡Muchas gracias!`;

    } else if (template === 'wrong-unit-box') {
        const wrongUnitBox = document.getElementById('wrong-unit-box').value;
        const correctUnitBox = document.getElementById('correct-unit-box').value;
        feedback = `¡Hola ${nombre}! Espero que estés teniendo un buen día. Hoy estoy realizando Random QA y encontré <a href="${link}" target="_blank">esta propiedad tuya</a> en ${proyecto}. Hiciste un buen trabajo identificando la propiedad, sin embargo, noté que dejaste ${wrongUnitBox} en el Unit Box, cuando en realidad va "${correctUnitBox}". Te recomiendo revisarlo más a detalle en una próxima ocasión. ¡Muchas Gracias!`;
    } else if (template === 'wrong-address-override') {
        const fuenteOverride = document.getElementById('fuente-override').value;
        const correctOverride = document.getElementById('correct-override').value;
        feedback = `¡Hola ${nombre}! Espero que estés teniendo un buen día. Hoy estoy realizando Random QA y encontré <a href="${link}" target="_blank">esta propiedad tuya</a> en ${proyecto}. La identificación fue precisa y la evidencia espectacular. Sin embargo, al revisarla en ${fuenteOverride}, noté que el override correcto para la misma es "${correctOverride}". Por favor, tenlo en cuenta para la próxima. ¡Muchas Gracias!`;
    }

    resultado.innerHTML = feedback;
}
