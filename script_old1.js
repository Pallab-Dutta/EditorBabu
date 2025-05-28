document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('form-container');
    const updateUrlBtn = document.getElementById('update-url');
    const newUrlContainer = document.getElementById('new-url-container');
    const newUrlDisplay = document.getElementById('new-url');
    const copyUrlBtn = document.getElementById('copy-url');

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const variablesParam = urlParams.get('variables');
    
    let originalVariables = {};
    let currentVariables = {};
    
    try {
        if (variablesParam) {
            originalVariables = JSON.parse(decodeURIComponent(variablesParam));
            currentVariables = JSON.parse(JSON.stringify(originalVariables)); // Deep copy
        }
    } catch (e) {
        console.error('Error parsing variables parameter:', e);
        formContainer.innerHTML = '<p class="error">Invalid variables parameter in URL</p>';
        return;
    }

    // Create form from variables
    function createForm() {
        if (Object.keys(currentVariables).length === 0) {
            formContainer.innerHTML = '<p>No variables found in URL. Add ?variables={"name":"John","age":30} to the URL to see an example.</p>';
            return;
        }

        let formHTML = '<form id="variables-form">';
        
        for (const [key, value] of Object.entries(currentVariables)) {
            formHTML += `
                <div class="form-group">
                    <label for="${key}">${key}</label>
            `;
            
            if (Array.isArray(value)) {
                formHTML += `<textarea id="${key}" name="${key}">${JSON.stringify(value, null, 2)}</textarea>`;
            } else if (typeof value === 'object' && value !== null) {
                formHTML += `<textarea id="${key}" name="${key}">${JSON.stringify(value, null, 2)}</textarea>`;
            } else if (typeof value === 'boolean') {
                formHTML += `
                    <select id="${key}" name="${key}">
                        <option value="true" ${value === true ? 'selected' : ''}>true</option>
                        <option value="false" ${value === false ? 'selected' : ''}>false</option>
                    </select>
                `;
            } else if (typeof value === 'number') {
                formHTML += `<input type="number" id="${key}" name="${key}" value="${value}">`;
            } else {
                formHTML += `<input type="text" id="${key}" name="${key}" value="${value}">`;
            }
            
            formHTML += `</div>`;
        }
        
        formHTML += '</form>';
        formContainer.innerHTML = formHTML;
    }

    // Compare two values deeply
    function isEqual(value1, value2) {
        return JSON.stringify(value1) === JSON.stringify(value2);
    }

    // Generate new URL with only updated variables
    function generateNewJson() {
        const form = document.getElementById('variables-form');
        const formData = new FormData(form);
        const updatedVariables = {};
        
        for (const [key, value] of formData.entries()) {
            try {
                let parsedValue;
                
                // Try to parse as JSON if the value looks like JSON
                if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                    parsedValue = JSON.parse(value);
                } else if (value === 'true') {
                    parsedValue = true;
                } else if (value === 'false') {
                    parsedValue = false;
                } else if (!isNaN(value) && value !== '') {
                    parsedValue = Number(value);
                } else {
                    parsedValue = value;
                }
                
                // Only include if the value has changed
                if (!isEqual(parsedValue, originalVariables[key])) {
                    updatedVariables[key] = parsedValue;
                }
            } catch (e) {
                // If parsing fails, just use the string value if it's different
                if (value !== originalVariables[key]) {
                    updatedVariables[key] = value;
                }
            }
        }
        
        // Only generate new URL if there are changes
        //if (Object.keys(updatedVariables).length === 0) {
        //    newUrlDisplay.textContent = "No changes detected";
        //    newUrlContainer.classList.remove('hidden');
        //    return;
        //}
        
        //const newUrl = new URL(window.location.href.split('?')[0]);
        //newUrl.searchParams.set('variables', encodeURIComponent(JSON.stringify(updatedVariables)));
        
        return updatedVariables;
    }

    // Function to parse URL parameters
    function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    // Initialize the form
    createForm();

    const TW = Telegram.WebApp;
    TW.ready();

    TW.MainButton.text = 'Save';
    TW.MainButton.color = '#eb4034';
    TW.MainButton.textColor = '#ffffff';

    TW.MainButton.show().onClick(function () {
        //var form = document.getElementById('orderForm');
        var formData = generateNewJson();

        formData['formNAME'] = 'EditorBabu';
	const fileNAME = getParameterByName('fileNAME');
        if (fileNAME) {
            formData['fileNAME'] = fileNAME;
        }
        var jsonString = JSON.stringify(formData);
        TW.sendData(jsonString);
        TW.close();
    });
    TW.expand();

});
