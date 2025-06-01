document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('form-container');
    // updateUrlBtn, newUrlContainer, newUrlDisplay, copyUrlBtn are not used in the provided HTML structure for TG WebApp
    // const updateUrlBtn = document.getElementById('update-url');
    // const newUrlContainer = document.getElementById('new-url-container');
    // const newUrlDisplay = document.getElementById('new-url');
    // const copyUrlBtn = document.getElementById('copy-url');

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

    // Helper function to auto-resize textarea
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto'; // Reset height to allow shrinking
        textarea.style.height = textarea.scrollHeight + 'px'; // Set height to content size
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
            
            // Textarea for arrays or objects
            if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                formHTML += `<textarea id="${key}" name="${key}" class="auto-resize-textarea">${JSON.stringify(value, null, 2)}</textarea>`;
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

        // Add auto-resize functionality to textareas
        // Select all textareas within the form, or specifically those needing auto-resize
        const textareas = formContainer.querySelectorAll('textarea.auto-resize-textarea'); 
        textareas.forEach(textarea => {
            autoResizeTextarea(textarea); // Initial resize
            textarea.addEventListener('input', () => autoResizeTextarea(textarea)); // Resize on input
        });
    }

    // Compare two values deeply (remains unchanged)
    function isEqual(value1, value2) {
        return JSON.stringify(value1) === JSON.stringify(value2);
    }

    // Generate new JSON with only updated variables (remains largely unchanged)
    function generateNewJson() {
        const form = document.getElementById('variables-form');
        if (!form) return {}; // Handle case where form might not exist
        
        const formData = new FormData(form);
        const updatedVariables = {};
        
        for (const [key, value] of formData.entries()) {
            try {
                let parsedValue;
                const originalValue = originalVariables[key];
                
                // Attempt to parse if it looks like JSON (array/object) or is boolean/number string
                if (typeof originalValue === 'boolean') {
                    parsedValue = (value === 'true');
                } else if (typeof originalValue === 'number') {
                    parsedValue = parseFloat(value);
                     if (isNaN(parsedValue) && value !== '') { // if parsing to float fails but original was number
                        parsedValue = value; // keep as string if not a valid number string
                    } else if (value === '') { // if field is cleared
                        parsedValue = null; // or handle as you see fit, e.g., undefined or keep empty string
                    }
		} else if (value === 'null') {
		    parsedValue = null;
                } else if (Array.isArray(originalValue) || (typeof originalValue === 'object' && originalValue !== null)) {
                     try {
                        parsedValue = JSON.parse(value);
                    } catch (jsonError) {
                        // If it was an object/array but now invalid JSON, treat as string
                        // This might happen if user manually edits a JSON textarea into invalid syntax
                        parsedValue = value; 
                    }
                }
                else { // Default to string
                    parsedValue = value;
                }
                
                if (!isEqual(parsedValue, originalValue)) {
                    updatedVariables[key] = parsedValue;
                }
            } catch (e) { // Catch errors from direct parsing attempts (though mostly handled above)
                console.warn(`Error processing form value for key ${key}:`, e);
                // Fallback: if an unexpected error occurs, compare as string if different
                if (value !== originalVariables[key]) {
                    updatedVariables[key] = value;
                }
            }
        }
        return updatedVariables;
    }

    // Function to parse URL parameters (remains unchanged)
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

    // Telegram Web App integration (remains unchanged)
    const TW = Telegram.WebApp;
    TW.ready();

    TW.MainButton.text = 'Save';
    TW.MainButton.color = '#eb4034'; // Example color
    TW.MainButton.textColor = '#ffffff';

    TW.MainButton.show().onClick(function () {
        var formData = generateNewJson();

        formData['formNAME'] = 'EditorBabu'; // Hardcoded form name
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
