const extraFields = document.getElementById('extra-fields');
const result = document.getElementById('result');

// Handle template selection to show the corresponding fields
document.getElementById('template').addEventListener('change', function () {
    extraFields.innerHTML = '';
    const selectedTemplate = this.value;

    // Generate specific fields according to the selected template
    if (selectedTemplate === 'wrong-structure') {
        extraFields.innerHTML += `
            <label for="wrong-structure">Wrong structure:</label>
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

            <label for="correct-structure">Correct structure:</label>
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
            <label for="motivos">Reasons:</label>
            <textarea id="motivos" placeholder="Enter the reasons why you think the APN is wrong"></textarea>
        `;
    } else if (selectedTemplate === 'missing-address-override') {
        extraFields.innerHTML += `
            <label for="fuente">Source of information:</label>
            <input type="text" id="fuente" placeholder="Source of information (RP, LB, etc.)">
        `;
    } else if (selectedTemplate === 'missing-unit-box') {
        extraFields.innerHTML += `
            <label for="unitBox">Unit Box:</label>
            <input type="text" id="unitBox" placeholder="Unit Box not completed">
        `;
    } else if (selectedTemplate === 'nmf-address-override') {
        extraFields.innerHTML += `
            <!-- No additional field needed -->
        `;
    } else if (selectedTemplate === 'wrong-unit-box') {
        extraFields.innerHTML += `
            <label for="wrong-unit-box">Wrong Unit Box:</label>
            <input type="text" id="wrong-unit-box" placeholder="No information / Wrong Unit Box">
            
            <label for="correct-unit-box">Correct Unit Box:</label>
            <input type="text" id="correct-unit-box" placeholder="Correct Unit Box">
        `;
    } else if (selectedTemplate === 'wrong-address-override') {
        extraFields.innerHTML += `
            <label for="fuente-override">Source of information:</label>
            <input type="text" id="fuente-override" placeholder="Source of information (RP, LB, etc.)">
            
            <label for="correct-override">Correct override:</label>
            <input type="text" id="correct-override" placeholder="Correct override">
        `;
    }
});

// Generate feedback according to the selected template and user data
function generateFeedback() {
    const name = document.getElementById('nombre').value;
    const project = document.getElementById('proyecto').value;
    const link = document.getElementById('link').value;
    const template = document.getElementById('template').value;

    let feedback = '';
    if (template === 'wrong-structure') {
        const wrongStructure = document.getElementById('wrong-structure').value;
        const correctStructure = document.getElementById('correct-structure').value;
        feedback = `Hi ${name}! I hope you're having a good day. Today I'm conducting Random QA and found <a href="${link}" target="_blank">this property of yours</a> in ${project}. You did a good job identifying the property, but I noticed you mapped it as ${wrongStructure}, when in reality it is ${correctStructure}. I identified this through public records and aerial images. I recommend reviewing it more thoroughly next time. Thank you!`;
    } else if (template === 'wrong-apn') {
        const reasons = document.getElementById('motivos').value;
        feedback = `Hi ${name}, I hope everything is going well! 🤗 Today I'm conducting Random QA and came across <a href="${link}" target="_blank">this property of yours</a> in ${project}. After carefully reviewing it, I concluded that it was not identified correctly. My reasons are: ${reasons}. Please let me know if you have any questions about it. Thanks for your time!`;
    } else if (template === 'missing-address-override') {
        const source = document.getElementById('fuente').value;
        feedback = `Greetings ${name}, I hope everything is fine. Today while reviewing Random QA, I found <a href="${link}" target="_blank">this property of yours</a> in ${project}. The identification was accurate and the evidence spectacular 😍. However, upon reviewing it, I noticed that the address was a bit strange, so I searched it on ${source} and realized it was necessary to perform an Address Override, as the one that appeared was different. Please keep this in mind for next time. Thank you!`;
    } else if (template === 'missing-unit-box') {
        const unitBox = document.getElementById('unitBox').value;
        feedback = `Greetings ${name}!, I hope everything is going well! 🤗 Today I'm conducting Random QA and came across <a href="${link}" target="_blank">this property of yours</a> in ${project}. I noticed you omitted filling out the 'Unit Box' field, in this case it was "${unitBox}". Remember that this field is important for separating the Property Cards in RS. It can be found in the images or in the listing description. Keep it in mind for next time. Thank you!`;
    } else if (template === 'nmf-address-override') {
        feedback = `Greetings ${name}!, I hope everything is going well! 🤗 Today I'm conducting Random QA and came across <a href="${link}" target="_blank">this property of yours</a> in ${project}. It is very well identified, but you forgot to delete the previous AOV when it was in NMF. Always validate this before saving the listing, especially when you are in FP. Thank you!`;

    } else if (template === 'wrong-unit-box') {
        const wrongUnitBox = document.getElementById('wrong-unit-box').value;
        const correctUnitBox = document.getElementById('correct-unit-box').value;
        feedback = `Hi ${name}! I hope you're having a good day. Today I'm conducting Random QA and found <a href="${link}" target="_blank">this property of yours</a> in ${project}. You did a good job identifying the property, but I noticed you left ${wrongUnitBox} in the Unit Box, when it should be "${correctUnitBox}". I recommend reviewing it more thoroughly next time. Thank you!`;
    } else if (template === 'wrong-address-override') {
        const sourceOverride = document.getElementById('fuente-override').value;
        const correctOverride = document.getElementById('correct-override').value;
        feedback = `Hi ${name}! I hope you're having a good day. Today I'm conducting Random QA and found <a href="${link}" target="_blank">this property of yours</a> in ${project}. The identification was accurate and the evidence spectacular. However, upon reviewing it on ${sourceOverride}, I noticed that the correct override for it is "${correctOverride}". Please keep this in mind for next time. Thank you!`;
    }

    result.innerHTML = feedback;
}
