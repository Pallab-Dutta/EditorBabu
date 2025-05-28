document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('form-container');
    const updateUrlBtn = document.getElementById('update-url');
    const newUrlContainer = document.getElementById('new-url-container');
    const newUrlDisplay = document.getElementById('new-url');
    const copyUrlBtn = document.getElementById('copy-url');

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const variablesParam = urlParams.get('variables');
    
    let variables = {};
    
    try {
        if (variablesParam) {
            variables = JSON.parse(decodeURIComponent(variablesParam));
        }
    } catch (e) {
        console.error('Error parsing variables parameter:', e);
        formContainer.innerHTML = '<p class="error">Invalid variables parameter in URL</p>';
        return;
    }

    // Create form from variables
    function createForm() {
        if (Object.keys(variables).length === 0) {
            formContainer.innerHTML = '<p>No variables found in URL. Add ?variables={"name":"John","age":30} to the URL to see an example.</p>';
            return;
        }

        let formHTML = '<form id="variables-form">';
        
        for (const [key, value] of Object.entries(variables)) {
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

    // Generate new URL with updated variables
    function generateNewUrl() {
        const form = document.getElementById('variables-form');
        const formData = new FormData(form);
        const updatedVariables = {};
        
        for (const [key, value] of formData.entries()) {
            try {
                // Try to parse as JSON if the value looks like JSON
                if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
                    updatedVariables[key] = JSON.parse(value);
                } else if (value === 'true') {
                    updatedVariables[key] = true;
                } else if (value === 'false') {
                    updatedVariables[key] = false;
                } else if (!isNaN(value) && value !== '') {
                    updatedVariables[key] = Number(value);
                } else {
                    updatedVariables[key] = value;
                }
            } catch (e) {
                // If parsing fails, just use the string value
                updatedVariables[key] = value;
            }
        }
        
        const newUrl = new URL(window.location.href.split('?')[0]);
        newUrl.searchParams.set('variables', encodeURIComponent(JSON.stringify(updatedVariables)));
        
        return newUrl.toString();
    }

    // Initialize the form
    createForm();

    // Update URL button click handler
    updateUrlBtn.addEventListener('click', function() {
        const newUrl = generateNewUrl();
        newUrlDisplay.textContent = newUrl;
        newUrlContainer.classList.remove('hidden');
    });

    // Copy URL button click handler
    copyUrlBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(newUrlDisplay.textContent)
            .then(() => {
                const originalText = copyUrlBtn.textContent;
                copyUrlBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyUrlBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy URL: ', err);
            });
    });
});