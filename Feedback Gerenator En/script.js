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
        feedback = `Hi ${nombre}! I hope you are having a good day. Today I am performing Random QA and I found <a href="${link}" target="_blank">this property of yours</a> in ${proyecto}. You did a good job identifying the property, however I noticed you mapped it as ${wrongStructure}, when in reality it is ${correctStructure}. I identified this through public records and aerial images. I recommend reviewing it more thoroughly next time. Thank you!`;
    } else if (template === 'wrong-apn') {
        const reasons = document.getElementById('motivos').value;
        feedback = `Hi ${nombre}, I hope everything is going well! 🤗 Today I am performing Random QA and I came across <a href="${link}" target="_blank">this property of yours</a> in ${proyecto}. After carefully reviewing it, I concluded that it was not identified correctly. My reasons are: ${reasons}. Please let me know if you have any questions about it. Thank you for your time!`;
    } else if (template === 'missing-address-override') {
        const source = document.getElementById('fuente').value;
        feedback = `Greetings ${nombre}, I hope everything is fine. Today while reviewing Random QA, I found <a href="${link}" target="_blank">this property of yours</a> in ${proyecto}. The identification was accurate and the evidence spectacular 😍. However, upon reviewing it, I noticed that the address was a bit strange, so I searched it on ${source} and realized it was necessary to perform an Address Override, as the one that appeared was different. Please keep this in mind for next time. Thank you!`;
    } else if (template === 'missing-unit-box') {
        const unitBox = document.getElementById('unitBox').value;
        feedback = `Greetings ${nombre}! I hope everything is going well! 🤗 Today I am performing Random QA and I came across <a href="${link}" target="_blank">this property of yours</a> in ${proyecto}. I noticed you omitted filling out the 'Unit Box' field, in this case it was "${unitBox}". Remember that this field is important for separating the Property Cards in RS. It can be found in the images or in the listing description. Keep it in mind for next time. Thank you!`;
    } else if (template === 'nmf-address-override') {
        feedback = `Greetings ${nombre}! I hope everything is going well! 🤗 Today I am performing Random QA and I came across <a href="${link}" target="_blank">this property of yours</a> in ${proyecto}. It is very well identified, but you forgot to delete the previous AOV when it was in NMF. Always validate this before saving the listing, especially when you are in FP. Thank you!`;
    } else if (template === 'wrong-unit-box') {
        const wrongUnitBox = document.getElementById('wrong-unit-box').value;
        const correctUnitBox = document.getElementById('correct-unit-box').value;
        feedback = `Hi ${nombre}! I hope you are having a good day. Today I am performing Random QA and I found <a href="${link}" target="_blank">this property of yours</a> in ${proyecto}. You did a good job identifying the property, however, I noticed you left ${wrongUnitBox} in the Unit Box, when it should be "${correctUnitBox}". I recommend reviewing it more thoroughly next time. Thank you!`;
    } else if (template === 'wrong-address-override') {
        const sourceOverride = document.getElementById('fuente-override').value;
        const correctOverride = document.getElementById('correct-override').value;
        feedback = `Hi ${nombre}! I hope you are having a good day. Today I am performing Random QA and I found <a href="${link}" target="_blank">this property of yours</a> in ${proyecto}. The identification was accurate and the evidence spectacular. However, upon reviewing it on ${sourceOverride}, I noticed that the correct override for it is "${correctOverride}". Please keep this in mind for next time. Thank you!`;
    }
    
    resultado.innerHTML = feedback;
}