// Generic Form Validation and Submission Handler
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.powerAutomateIntegration = new PowerAutomateIntegration();
        
        this.validators = {
            text: this.validateText,
            email: this.validateEmail,
            phone: this.validatePhone,
            number: this.validateNumber,
            date: this.validateDate,
            select: this.validateSelect,
            'checkbox-group': this.validateCheckboxGroup,
            radio: this.validateRadio,
            'required-checkbox': this.validateRequiredCheckbox,
            textarea: this.validateTextarea
        };
        
        this.init();
    }

    init() {
        // Add real-time validation
        this.form.addEventListener('input', (e) => this.validateField(e.target));
        this.form.addEventListener('change', (e) => this.validateField(e.target));
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add blur validation for better UX
        this.form.addEventListener('blur', (e) => this.validateField(e.target), true);
    }

    validateField(field) {
        const validationType = field.dataset.validation;
        if (!validationType) return true;

        const validator = this.validators[validationType];
        if (!validator) return true;

        const result = validator.call(this, field);
        this.displayValidation(field, result);
        return result.isValid;
    }

    validateText(field) {
        const value = field.value.trim();
        const minLength = parseInt(field.dataset.minLength) || 1;
        const maxLength = parseInt(field.dataset.maxLength) || Infinity;

        if (field.hasAttribute('required') && !value) {
            return { isValid: false, message: 'This field is required.' };
        }

        if (value && (value.length < minLength || value.length > maxLength)) {
            return { 
                isValid: false, 
                message: `Must be between ${minLength} and ${maxLength} characters.` 
            };
        }

        return { isValid: true, message: '' };
    }

    validateEmail(field) {
        const value = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (field.hasAttribute('required') && !value) {
            return { isValid: false, message: 'Email is required.' };
        }

        if (value && !emailRegex.test(value)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        return { isValid: true, message: '' };
    }

    validatePhone(field) {
        const value = field.value.trim();
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;

        if (field.hasAttribute('required') && !value) {
            return { isValid: false, message: 'Phone number is required.' };
        }

        if (value && !phoneRegex.test(value)) {
            return { isValid: false, message: 'Please enter a valid phone number.' };
        }

        return { isValid: true, message: '' };
    }

    validateNumber(field) {
        const value = field.value;
        const min = parseFloat(field.dataset.min) || -Infinity;
        const max = parseFloat(field.dataset.max) || Infinity;

        if (field.hasAttribute('required') && (value === '' || value === null)) {
            return { isValid: false, message: 'This field is required.' };
        }

        const numValue = parseFloat(value);
        if (value !== '' && (isNaN(numValue) || numValue < min || numValue > max)) {
            return { 
                isValid: false, 
                message: `Please enter a number between ${min} and ${max}.` 
            };
        }

        return { isValid: true, message: '' };
    }

    validateDate(field) {
        const value = field.value;

        if (field.hasAttribute('required') && !value) {
            return { isValid: false, message: 'Date is required.' };
        }

        if (value) {
            const date = new Date(value);
            const today = new Date();
            const hundredYearsAgo = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

            if (date > today) {
                return { isValid: false, message: 'Date cannot be in the future.' };
            }

            if (date < hundredYearsAgo) {
                return { isValid: false, message: 'Please enter a valid date.' };
            }
        }

        return { isValid: true, message: '' };
    }

    validateSelect(field) {
        const value = field.value;

        if (field.hasAttribute('required') && !value) {
            return { isValid: false, message: 'Please select an option.' };
        }

        return { isValid: true, message: '' };
    }

    validateCheckboxGroup(field) {
        const name = field.name;
        const checkboxes = this.form.querySelectorAll(`input[name="${name}"]`);
        const minChecked = parseInt(field.dataset.minChecked) || 1;
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

        if (checkedCount < minChecked) {
            return { 
                isValid: false, 
                message: `Please select at least ${minChecked} option(s).` 
            };
        }

        return { isValid: true, message: '' };
    }

    validateRadio(field) {
        const name = field.name;
        const radios = this.form.querySelectorAll(`input[name="${name}"]`);
        const isChecked = Array.from(radios).some(radio => radio.checked);

        if (field.hasAttribute('required') && !isChecked) {
            return { isValid: false, message: 'Please select an option.' };
        }

        return { isValid: true, message: '' };
    }

    validateRequiredCheckbox(field) {
        if (field.hasAttribute('required') && !field.checked) {
            return { isValid: false, message: 'This field is required.' };
        }

        return { isValid: true, message: '' };
    }

    validateTextarea(field) {
        const value = field.value.trim();
        const maxLength = parseInt(field.dataset.maxLength) || Infinity;

        if (field.hasAttribute('required') && !value) {
            return { isValid: false, message: 'This field is required.' };
        }

        if (value.length > maxLength) {
            return { 
                isValid: false, 
                message: `Maximum ${maxLength} characters allowed.` 
            };
        }

        return { isValid: true, message: '' };
    }

    displayValidation(field, result) {
        const errorElement = field.parentNode.querySelector('.error-message');
        
        // Handle checkbox and radio groups
        if (field.type === 'checkbox' && field.dataset.validation === 'checkbox-group') {
            const group = field.closest('.form-group');
            const groupErrorElement = group.querySelector('.error-message');
            if (groupErrorElement) {
                groupErrorElement.textContent = result.message;
            }
        } else if (field.type === 'radio') {
            const group = field.closest('.form-group');
            const groupErrorElement = group.querySelector('.error-message');
            if (groupErrorElement) {
                groupErrorElement.textContent = result.message;
            }
        } else if (errorElement) {
            errorElement.textContent = result.message;
        }

        // Update field styling
        field.classList.remove('valid', 'error');
        if (field.value !== '') {
            field.classList.add(result.isValid ? 'valid' : 'error');
        }
    }

    validateForm() {
        const fields = this.form.querySelectorAll('[data-validation]');
        let isFormValid = true;

        // Validate individual fields
        fields.forEach(field => {
            const isFieldValid = this.validateField(field);
            if (!isFieldValid) isFormValid = false;
        });

        // Handle checkbox groups separately to avoid duplicate validation
        const checkboxGroups = {};
        const radioGroups = {};
        
        fields.forEach(field => {
            if (field.type === 'checkbox' && field.dataset.validation === 'checkbox-group') {
                if (!checkboxGroups[field.name]) {
                    checkboxGroups[field.name] = field;
                }
            } else if (field.type === 'radio') {
                if (!radioGroups[field.name]) {
                    radioGroups[field.name] = field;
                }
            }
        });

        // Validate checkbox groups
        Object.values(checkboxGroups).forEach(field => {
            const isGroupValid = this.validateField(field);
            if (!isGroupValid) isFormValid = false;
        });

        // Validate radio groups
        Object.values(radioGroups).forEach(field => {
            const isGroupValid = this.validateField(field);
            if (!isGroupValid) isFormValid = false;
        });

        return isFormValid;
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};

        // Dynamically collect all form data
        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        // Handle unchecked checkboxes
        const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (!data.hasOwnProperty(checkbox.name)) {
                data[checkbox.name] = false;
            }
        });

        // Add metadata
        data.applicationId = this.generateApplicationId();
        data.submissionTimestamp = new Date().toISOString();
        data.submissionDate = new Date().toLocaleDateString();
        data.submissionTime = new Date().toLocaleTimeString();
        data._formFields = Object.keys(data).filter(key => !key.startsWith('_'));

        return data;
    }

    generateApplicationId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `APP-${timestamp}-${random}`;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        this.form.classList.add('loading');

        try {
            if (this.validateForm()) {
                const formData = this.collectFormData();

                // Submit to Power Automate
                const powerAutomateIntegration = new PowerAutomateIntegration();
                const submitted = await powerAutomateIntegration.submitToPowerAutomate(formData);

                if (!submitted) {
                    throw new Error('Failed to submit to Power Automate');
                }

                console.log('✅ Successfully submitted to Power Automate');

                // Show success message
                this.showSuccess(formData);

                // Enable PDF export
                document.getElementById('exportPdfBtn').style.display = 'inline-block';

            } else {
                alert('Please fix the errors in the form before submitting.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('There was an error submitting the form. Please check the console for details and try again.');
        } finally {
            // Reset loading state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            this.form.classList.remove('loading');
        }
    }

    showSuccess(formData) {
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        document.getElementById('applicationId').textContent = formData.applicationId;
        document.getElementById('submissionTime').textContent = 
            `${formData.submissionDate} at ${formData.submissionTime}`;
    }

    // Export form data as CSV (for manual Excel import)
    exportToCSV(formData) {
        const headers = Object.keys(formData);
        const values = Object.values(formData).map(value => 
            Array.isArray(value) ? value.join('; ') : value
        );
        
        const csvContent = headers.join(',') + '\n' + values.map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `application_${formData.applicationId}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateExcelTemplate() {
        return this.powerAutomateIntegration.exportFormStructureForExcel(this.form);
    }
}

// // Enhanced FormValidator with dynamic field detection
// class EnhancedFormValidator extends FormValidator {
//     constructor(formId) {
//         super(formId);
//         this.powerAutomateIntegration = new PowerAutomateIntegration();
//     }

//     // Override the collectFormData method to be more dynamic
//     collectFormData() {
//         const formData = new FormData(this.form);
//         const data = {};

//         // Dynamically collect all form data
//         for (let [key, value] of formData.entries()) {
//             if (data[key]) {
//                 // Handle multiple values (like checkboxes)
//                 if (Array.isArray(data[key])) {
//                     data[key].push(value);
//                 } else {
//                     data[key] = [data[key], value];
//                 }
//             } else {
//                 data[key] = value;
//             }
//         }

//         // Handle unchecked checkboxes (they don't appear in FormData)
//         const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
//         checkboxes.forEach(checkbox => {
//             if (!data.hasOwnProperty(checkbox.name)) {
//                 data[checkbox.name] = false;
//             }
//         });

//         // Add metadata
//         data.applicationId = this.generateApplicationId();
//         data.submissionTimestamp = new Date().toISOString();
//         data.submissionDate = new Date().toLocaleDateString();
//         data.submissionTime = new Date().toLocaleTimeString();
        
//         // Add form structure info (useful for debugging)
//         data._formFields = Object.keys(data).filter(key => !key.startsWith('_'));

//         return data;
//     }

//     // Method to analyze current form and generate Excel headers
//     generateExcelTemplate() {
//         return this.powerAutomateIntegration.exportFormStructureForExcel(this.form);
//     }
// }



// PDF Export functionality
class PDFExporter {
    constructor() {
        this.initPDFExport();
    }

    initPDFExport() {
        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            this.exportToPDF();
        });
    }

    async exportToPDF() {
        const exportBtn = document.getElementById('exportPdfBtn');
        const originalText = exportBtn.textContent;
        
        try {
            exportBtn.textContent = 'Generating PDF...';
            exportBtn.disabled = true;

            // Get the form data for the PDF
            const formData = validator.collectFormData();
            
            // Create PDF content
            await this.generatePDF(formData);
            
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        } finally {
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
        }
    }

    async generatePDF(formData) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Set up PDF styling
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;

        // Header
        pdf.setFillColor(79, 172, 254);
        pdf.rect(0, 0, pageWidth, 40, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.setFont(undefined, 'bold');
        pdf.text('Network Application Form Submission', pageWidth / 2, 25, { align: 'center' });
        
        currentY = 50;

        // Submission details
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        
        if (formData.applicationId) {
            pdf.text(`Submission ID: ${formData.applicationId}`, margin, currentY);
            currentY += 7;
        }
        
        if (formData.submissionDate && formData.submissionTime) {
            pdf.text(`Submitted: ${formData.submissionDate} at ${formData.submissionTime}`, margin, currentY);
            currentY += 15;
        }

        // Table setup
        const tableTop = currentY;
        const col1 = margin; // Field name column
        const col2 = margin + 50; // Reduced from 60 to make columns closer
        const lineHeight = 7;
        const rowHeight = 8;

        // Table header
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(44, 62, 80);
        pdf.text('Form Data', margin, currentY);
        currentY += 10;

        // Draw table header row - now as a single rectangle
        pdf.setFillColor(240, 240, 240);
        pdf.rect(col1, currentY, contentWidth, rowHeight, 'F');
        
        pdf.setFontSize(11);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Field', col1 + 3, currentY + 5);
        pdf.text('Value', col2 + 3, currentY + 5);
        
        currentY += rowHeight;

        // Draw horizontal line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(col1, currentY, pageWidth - margin, currentY);
        currentY += 2;

        // Table content
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');

        for (const [fieldName, value] of Object.entries(formData)) {
            // Skip metadata fields
            if (fieldName.startsWith('_') || 
                fieldName === 'applicationId' || 
                fieldName === 'submissionTimestamp' || 
                fieldName === 'submissionDate' || 
                fieldName === 'submissionTime') {
                continue;
            }

            const label = this.humanizeFieldName(fieldName);
            let displayValue = value;

            // Format different field types
            if (Array.isArray(displayValue)) {
                displayValue = displayValue.join(', ');
            } else if (typeof displayValue === 'boolean') {
                displayValue = displayValue ? 'Yes' : 'No';
            } else if (displayValue === null || displayValue === undefined) {
                displayValue = 'N/A';
            }

            // Split text into multiple lines if needed
            const fieldLines = pdf.splitTextToSize(label, 50);
            const valueLines = pdf.splitTextToSize(String(displayValue), contentWidth - 60);

            // Calculate row height needed
            const linesNeeded = Math.max(fieldLines.length, valueLines.length);
            const thisRowHeight = linesNeeded * lineHeight;

            // Check if we need a new page
            if (currentY + thisRowHeight > pageHeight - margin) {
                pdf.addPage();
                currentY = margin;
                
                // Redraw table header on new page
                pdf.setFillColor(240, 240, 240);
                pdf.rect(col1, currentY, 50, rowHeight, 'F');
                pdf.rect(col2, currentY, contentWidth - 60, rowHeight, 'F');
                pdf.setFontSize(11);
                pdf.setTextColor(0, 0, 0);
                pdf.text('Field', col1 + 3, currentY + 5);
                pdf.text('Value', col2 + 3, currentY + 5);
                currentY += rowHeight;
                pdf.setDrawColor(200, 200, 200);
                pdf.line(col1, currentY, pageWidth - margin, currentY);
                currentY += 2;
                pdf.setFontSize(10);
            }

            // Draw alternating row background
            if (currentY % (rowHeight * 2) < rowHeight) {
                pdf.setFillColor(248, 248, 248);
                pdf.rect(col1, currentY, contentWidth, thisRowHeight, 'F');
            }

            // Write field name (left column)
            pdf.text(fieldLines, col1 + 3, currentY + 5);

            // Write value (right column)
            pdf.text(valueLines, col2 + 3, currentY + 5);

            // Draw horizontal line
            pdf.setDrawColor(200, 200, 200);
            pdf.line(col1, currentY + thisRowHeight, pageWidth - margin, currentY + thisRowHeight);

            currentY += thisRowHeight;
        }

        // Footer
        const footerY = pageHeight - 15;
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('This document was generated automatically from the form submission.', 
                 pageWidth / 2, footerY, { align: 'center' });

        // Save the PDF
        const fileName = formData.applicationId ? `FormSubmission_${formData.applicationId}.pdf` : 'FormSubmission.pdf';
        pdf.save(fileName);
    }

    humanizeFieldName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }
}




// Dynamic Power Automate Integration
class PowerAutomateIntegration {
    constructor() {
        // ⚠️ REPLACE THIS WITH YOUR ACTUAL POWER AUTOMATE HTTP TRIGGER URL ⚠️
        this.powerAutomateURL = 'https://prod-193.westeurope.logic.azure.com:443/workflows/42a3034b7bb74873baf40c44697baf7c/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=hqvdI8QpADuTT1cl6znnqwS1lWdZ8TFxFAxloy18ncc';
        
        // Define fields that should be excluded from dynamic processing
        this.excludedFields = new Set(['submit', 'reset', 'button']);
        
        // Define field transformations for special cases
        this.fieldTransformations = {
            // Transform boolean checkboxes to Yes/No
            'checkbox': (value) => value ? 'Yes' : 'No',
            // Transform arrays (multi-select) to comma-separated strings
            'array': (value) => Array.isArray(value) ? value.join(', ') : value,
            // Transform salary to formatted number
            'salary': (value) => value ? parseInt(value).toLocaleString() : '',
            // Transform experience to include "years"
            'experience': (value) => value ? `${value} years` : ''
        };
    }

    async submitToPowerAutomate(formData) {
        try {
            console.log('📤 Submitting to Power Automate...', formData);
            
            // Dynamically format data
            const formattedData = this.dynamicallyFormatData(formData);
            
            // Add schema information for Power Automate
            formattedData._schema = this.generateSchema(formattedData);

            const response = await fetch(this.powerAutomateURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formattedData)
            });

            if (response.ok) {
                console.log('✅ Successfully submitted to Power Automate');
                console.log('📋 Submitted data:', formattedData);
                return true;
            } else {
                console.error('❌ Power Automate submission failed:', response.status, response.statusText);
                return false;
            }

        } catch (error) {
            console.error('❌ Power Automate submission error:', error);
            return false;
        }
    }

    dynamicallyFormatData(formData) {
        const formatted = {};
        
        for (const [key, value] of Object.entries(formData)) {
            // Skip excluded fields
            if (this.excludedFields.has(key)) {
                continue;
            }

            // Apply specific transformations
            if (key === 'terms' || key === 'newsletter') {
                formatted[key] = this.fieldTransformations.checkbox(value);
            } else if (Array.isArray(value)) {
                formatted[key] = this.fieldTransformations.array(value);
            } else if (key === 'salary' && value) {
                formatted[key] = this.fieldTransformations.salary(value);
            } else if (key === 'experience' && value) {
                formatted[key] = this.fieldTransformations.experience(value);
            } else {
                // Default: convert to string and handle empty values
                formatted[key] = value !== undefined && value !== null ? String(value) : '';
            }
        }

        return formatted;
    }

    // Generate schema information that Power Automate can use
    generateSchema(data) {
        const schema = {
            type: "object",
            properties: {}
        };

        for (const [key, value] of Object.entries(data)) {
            if (key === '_schema') continue;
            
            schema.properties[key] = {
                type: "string",
                title: this.humanizeFieldName(key),
                description: `Auto-generated field for ${key}`
            };
        }

        return schema;
    }

    // Convert camelCase field names to human-readable titles
    humanizeFieldName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }

    // Get all form fields dynamically from the DOM
    getAllFormFields(formElement) {
        const fields = {};
        const formElements = formElement.querySelectorAll('input, select, textarea');
        
        formElements.forEach(element => {
            if (element.name && !this.excludedFields.has(element.type)) {
                const fieldInfo = {
                    name: element.name,
                    type: element.type,
                    label: this.getFieldLabel(element),
                    required: element.hasAttribute('required'),
                    validation: element.dataset.validation || 'none'
                };
                
                fields[element.name] = fieldInfo;
            }
        });
        
        return fields;
    }

    // Get the label for a form field
    getFieldLabel(element) {
        // Try to find associated label
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) {
            return label.textContent.trim();
        }
        
        // Try to find parent label
        const parentLabel = element.closest('label');
        if (parentLabel) {
            return parentLabel.textContent.replace(element.value || '', '').trim();
        }
        
        // Fallback to humanized field name
        return this.humanizeFieldName(element.name);
    }

    async testConnection() {
        try {
            console.log('🔍 Testing connection to Power Automate...');
            
            const testData = {
                test: true,
                timestamp: new Date().toISOString(),
                message: 'Test connection from form',
                _schema: {
                    type: "object",
                    properties: {
                        test: { type: "string", title: "Test" },
                        timestamp: { type: "string", title: "Timestamp" },
                        message: { type: "string", title: "Message" }
                    }
                }
            };

            const response = await fetch(this.powerAutomateURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            if (response.ok) {
                console.log('✅ Power Automate connection successful');
                return true;
            } else {
                console.error('❌ Power Automate connection failed:', response.status);
                return false;
            }

        } catch (error) {
            console.error('❌ Power Automate connection error:', error);
            return false;
        }
    }

    // Utility method to export current form structure for Excel template creation
    exportFormStructureForExcel(formElement) {
        const fields = this.getAllFormFields(formElement);
        const headers = Object.keys(fields);
        
        console.log('📋 Form Structure for Excel:');
        console.log('Headers:', headers);
        console.log('Field Details:', fields);
        
        // Create downloadable CSV template
        const csvContent = headers.join(',') + '\n' + 
                          headers.map(() => '').join(','); // Empty row for template
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'excel_template_headers.csv';
        a.click();
        URL.revokeObjectURL(url);
        
        return fields;
    }
}

// Initialize the application
let validator;
let pdfExporter;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize form validation with Power Automate
    validator = new FormValidator('applicationForm');
    
    // Initialize PDF export
    pdfExporter = new PDFExporter();
    
    // Add helper button to generate Excel template (for development)
    if (window.location.hash === '#dev') {
        const devButton = document.createElement('button');
        devButton.textContent = 'Generate Excel Template';
        devButton.onclick = () => validator.generateExcelTemplate();
        devButton.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999;background:red;color:white;padding:10px;border:none;border-radius:5px;cursor:pointer;';
        document.body.appendChild(devButton);
        console.log('🔧 Development mode: Excel template generator added');
    }
    
    console.log('Application form initialized successfully!');
});

// Utility function to format form data for Excel
function formatForExcel(formData) {
    const formatted = {};
    
    for (const [key, value] of Object.entries(formData)) {
        if (Array.isArray(value)) {
            formatted[key] = value.join('; ');
        } else if (typeof value === 'boolean') {
            formatted[key] = value ? 'Yes' : 'No';
        } else {
            formatted[key] = value;
        }
    }
    
    return formatted;
}

function testDynamicSubmission() {
    const testData = {
        firstName: "Test",
        lastName: "User", 
        email: "test@example.com",
        dynamicField1: "This is a new field",
        dynamicField2: "Another new field",
        timestamp: new Date().toISOString()
    };
    
    const powerAutomate = new PowerAutomateIntegration();
    powerAutomate.submitToPowerAutomate(testData);
}