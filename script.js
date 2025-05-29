document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const dropArea = document.getElementById('dropArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewPlaceholder = document.getElementById('previewPlaceholder');
    const convertBtn = document.getElementById('convertBtn');
    const convertBtnText = convertBtn.querySelector('.btn-text');
    const convertBtnSpinner = convertBtn.querySelector('.spinner');
    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');
    const newConversionBtn = document.getElementById('newConversionBtn');
    const statusMessageDiv = document.getElementById('statusMessage');

    let uploadedFiles = []; // Stores File objects selected by the user
    const MAX_FILE_SIZE_MB = 10; // Max size for individual image file
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

    // --- Helper Functions for UI Management ---
    function showStatusMessage(message, type = 'info') {
        statusMessageDiv.textContent = message;
        statusMessageDiv.className = `status-message show ${type}`; // Reset classes and add new ones
        // Automatically hide after 5 seconds
        setTimeout(() => {
            statusMessageDiv.classList.remove('show');
        }, 5000);
    }

    function hideStatusMessage() {
        statusMessageDiv.classList.remove('show');
    }

    function showLoadingState() {
        convertBtn.disabled = true;
        convertBtn.classList.add('loading');
        convertBtnText.style.display = 'none';
        convertBtnSpinner.style.display = 'inline-block';
        showStatusMessage('Converting images to PDF...', 'info');
    }

    function hideLoadingState() {
        convertBtn.classList.remove('loading');
        convertBtnText.style.display = 'inline-block';
        convertBtnSpinner.style.display = 'none';
    }

    function togglePreviewPlaceholder() {
        if (uploadedFiles.length === 0) {
            previewPlaceholder.style.display = 'block';
        } else {
            previewPlaceholder.style.display = 'none';
        }
    }

    // --- Drag and Drop functionality ---
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('highlight');
        showStatusMessage('Drop your images here!', 'info');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('highlight');
        hideStatusMessage();
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('highlight');
        hideStatusMessage();
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // --- File input change functionality ---
    imageUpload.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });

    // --- Function to handle selected files (from input or drag/drop) ---
    function handleFiles(files) {
        if (files.length === 0) return;

        let validFilesCount = 0;
        let invalidFilesCount = 0;

        Array.from(files).forEach(file => {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                showStatusMessage(`"${file.name}" is not a supported image type.`, 'warning');
                invalidFilesCount++;
                return;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                showStatusMessage(`"${file.name}" is too large (max ${MAX_FILE_SIZE_MB}MB).`, 'warning');
                invalidFilesCount++;
                return;
            }

            // Check if file already exists (by name and size, a basic check)
            const isDuplicate = uploadedFiles.some(existingFile =>
                existingFile.name === file.name && existingFile.size === file.size
            );
            if (isDuplicate) {
                showStatusMessage(`"${file.name}" has already been added.`, 'info');
                invalidFilesCount++;
                return;
            }

            uploadedFiles.push(file);
            renderImagePreview(file);
            validFilesCount++;
        });

        if (validFilesCount > 0) {
            showStatusMessage(`Added ${validFilesCount} image(s).`, 'success');
        }
        if (invalidFilesCount > 0 && validFilesCount === 0) {
             showStatusMessage('No valid images were added.', 'error');
        }

        updateConvertButtonState();
        togglePreviewPlaceholder();
    }

    // --- Render image preview ---
    function renderImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.classList.add('image-preview-item');
            previewItem.setAttribute('data-file-name', file.name); // Store file name for easy lookup

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = `Preview of ${file.name}`;
            img.title = file.name; // Tooltip on hover

            const removeButton = document.createElement('button');
            removeButton.classList.add('remove-image');
            removeButton.innerHTML = '&times;'; // HTML entity for multiplication sign (X)
            removeButton.title = `Remove ${file.name}`;

            removeButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent triggering other events on parent
                removeImage(file, previewItem);
            });

            previewItem.appendChild(img);
            previewItem.appendChild(removeButton);
            imagePreview.appendChild(previewItem);
        };
        reader.onerror = () => {
            showStatusMessage(`Could not read file: ${file.name}.`, 'error');
            // Remove file from uploadedFiles if it failed to load its preview
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            updateConvertButtonState();
            togglePreviewPlaceholder();
        };
        reader.readAsDataURL(file);
    }

    // --- Remove image from preview and uploadedFiles array ---
    function removeImage(fileToRemove, previewItem) {
        uploadedFiles = uploadedFiles.filter(file => file !== fileToRemove);
        previewItem.remove();
        showStatusMessage(`Removed "${fileToRemove.name}".`, 'info');
        updateConvertButtonState();
        togglePreviewPlaceholder();
    }

    // --- Update convert button state ---
    function updateConvertButtonState() {
        convertBtn.disabled = uploadedFiles.length === 0;
    }

    // --- Convert to PDF button click ---
    convertBtn.addEventListener('click', async () => {
        if (uploadedFiles.length === 0) {
            showStatusMessage('Please upload images first!', 'warning');
            return;
        }

        showLoadingState();
        hideStatusMessage(); // Hide any previous status message

        try {
            // --- SERVER-SIDE PDF GENERATION PLACEHOLDER ---
            // This is the ideal place to send images to your backend for conversion.
            // For this client-side example, we'll simulate it with jsPDF.

            // Example of how you would send to a server:
            /*
            const formData = new FormData();
            uploadedFiles.forEach((file, index) => {
                formData.append(`image_${index}`, file);
            });

            const response = await fetch('/api/convert-to-pdf', { // Replace with your actual backend endpoint
                method: 'POST',
                body: formData,
                // Add headers like 'Authorization' if needed
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'PDF conversion failed on server.');
            }

            const pdfBlob = await response.blob();
            */

            // --- CLIENT-SIDE PDF GENERATION (for demonstration ONLY) ---
            // **WARNING:** For production, move this logic to your backend.
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' size
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 10; // mm

            // Use a Promise.all to handle image loading in parallel for efficiency
            const imagePromises = uploadedFiles.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
                        img.src = e.target.result;
                    };
                    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
                    reader.readAsDataURL(file);
                });
            });

            const loadedImages = await Promise.all(imagePromises);

            loadedImages.forEach((img, index) => {
                if (index > 0) {
                    doc.addPage();
                }

                const imgWidth = img.naturalWidth;
                const imgHeight = img.naturalHeight;

                // Calculate aspect ratio to fit image within page boundaries
                const maxContentWidth = pageWidth - (2 * margin);
                const maxContentHeight = pageHeight - (2 * margin);

                let ratio = Math.min(maxContentWidth / imgWidth, maxContentHeight / imgHeight);
                let scaledWidth = imgWidth * ratio;
                let scaledHeight = imgHeight * ratio;

                // Center image on the page
                const x = (pageWidth - scaledWidth) / 2;
                const y = (pageHeight - scaledHeight) / 2; // Centered vertically

                doc.addImage(img, 'JPEG', x, y, scaledWidth, scaledHeight, '', 'FAST'); // 'FAST' for performance
            });

            const pdfBlob = doc.output('blob'); // Get PDF as a Blob
            // --- END CLIENT-SIDE PDF GENERATION ---


            // Update UI for download
            const pdfUrl = URL.createObjectURL(pdfBlob);
            downloadLink.href = pdfUrl;
            downloadSection.style.display = 'block';
            document.querySelector('.upload-section').style.display = 'none';

            showStatusMessage('PDF created successfully!', 'success');

        } catch (error) {
            console.error('Conversion error:', error);
            showStatusMessage(`Conversion failed: ${error.message || 'An unexpected error occurred.'}`, 'error');
            // If conversion fails, keep upload section visible
            document.querySelector('.upload-section').style.display = 'block';
            downloadSection.style.display = 'none';
        } finally {
            hideLoadingState(); // Always hide loading spinner
        }
    });

    // --- Start New Conversion Button ---
    newConversionBtn.addEventListener('click', () => {
        uploadedFiles = [];
        imagePreview.innerHTML = '<p class="preview-placeholder" id="previewPlaceholder">No images selected yet.</p>'; // Reset previews
        togglePreviewPlaceholder();
        updateConvertButtonState();
        hideStatusMessage();
        document.querySelector('.upload-section').style.display = 'block';
        downloadSection.style.display = 'none';
        if (downloadLink.href) {
            URL.revokeObjectURL(downloadLink.href); // Clean up the Blob URL
            downloadLink.href = '#';
        }
    });

    // Initialize button state
    updateConvertButtonState();
    togglePreviewPlaceholder(); // Show placeholder on load
});