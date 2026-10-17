const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const diagnoseBtn = document.getElementById('diagnoseBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultCard = document.getElementById('resultCard');
const resultContent = document.getElementById('resultContent');

// Settings Elements
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const apiKeyStatus = document.getElementById('apiKeyStatus');

let base64Image = null;
const STORAGE_KEY = 'plant_doctor_gemini_api_key';

// On load: check if API key exists. If not, pop up settings automatically on first visit!
window.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) {
        apiKeyInput.value = savedKey;
        apiKeyStatus.classList.remove('hidden');
    } else {
        // First-time visitor prompt
        settingsModal.classList.remove('hidden');
    }
});

// Settings Modal Open/Close Logic
openSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// Close modal when clicking outside the box
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Save API Key permanently to device
saveSettingsBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
        alert('Please enter a valid API key.');
        return;
    }
    localStorage.setItem(STORAGE_KEY, key);
    apiKeyStatus.classList.remove('hidden');
    
    // Brief visual confirmation then close modal
    saveSettingsBtn.textContent = 'Saved! ✓';
    setTimeout(() => {
        saveSettingsBtn.textContent = 'Save Key';
        settingsModal.classList.add('hidden');
    }, 800);
});

// Handle image selection
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            imagePreview.src = uploadEvent.target.result;
            base64Image = uploadEvent.target.result.split(',')[1]; // Extract base64 payload
            previewContainer.classList.remove('hidden');
            resultCard.classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Handle diagnosis click
diagnoseBtn.addEventListener('click', async () => {
    const apiKey = localStorage.getItem(STORAGE_KEY);
    
    if (!apiKey) {
        alert('Please configure your Gemini API key in the settings (gear icon) first!');
        settingsModal.classList.remove('hidden');
        apiKeyInput.focus();
        return;
    }

    if (!base64Image) {
        alert('Please select an image first.');
        return;
    }

    // UI State: Loading
    loadingSpinner.classList.remove('hidden');
    resultCard.classList.add('hidden');
    previewContainer.classList.add('hidden');

    try {
        const response = await callGeminiAPI(apiKey, base64Image);
        displayResult(response);
    } catch (error) {
        console.error(error);
        resultContent.innerHTML = `<p class="text-red-500 font-medium">Oops! Something went wrong: ${error.message}. Please check if your API key is correct in settings.</p>`;
        resultCard.classList.remove('hidden');
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

async function callGeminiAPI(apiKey, base64Data) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const promptText = `You are "Leafy", a warm, friendly, expert plant doctor and botanist companion. 
Analyze this plant image carefully. Provide your response using clear markdown headings:
1. **Plant Identification:** Common name and scientific name.
2. **Health Status & Diagnosis:** Is the plant healthy, stressed, overwatered, underwatered, or dealing with pests/diseases? Mention symptoms visible in the photo.
3. **Friendly Care Strategy:** 
   - Sunlight requirements
   - Watering frequency & technique
   - Soil & nutrients
4. **Pro-Tip / Fun Fact:** A friendly tip to help this specific plant thrive.
Keep the tone encouraging, warm, and conversational like a good gardening friend!`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: promptText },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Data
                        }
                    }
                ]
            }
        ]
    };

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error?.message || 'Failed to connect to Gemini API');
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
}

function displayResult(markdownText) {
    let html = markdownText
        .replace(/### (.*?)
/g, '<h4 class="font-bold text-emerald-800 mt-3 mb-1 text-base">$1</h4>')
        .replace(/## (.*?)
/g, '<h4 class="font-bold text-emerald-800 mt-3 mb-1 text-base">$1</h4>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')
        .replace(/\* (.*?)
/g, '<li class="ml-4 list-disc text-slate-700">$1</li>');

    resultContent.innerHTML = html;
    resultCard.classList.remove('hidden');
}