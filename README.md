# Leafy - Your Plant Doctor & Friend 🌿

A lightweight, serverless web application that acts as your personal AI plant doctor. Built with HTML5, Tailwind CSS, and powered by the Gemini Multimodal API. Hosted seamlessly on GitHub Pages.

## Features
- **Instant Photo Diagnosis:** Take a picture or upload an existing photo of your plant directly from your device camera.
- **Runtime API Key Configuration:** Securely configure your Gemini API key through a sleek settings modal (gear icon).
- **Permanent Device Storage:** Your API key is stored safely in your browser's `localStorage` so you only have to enter it once.
- **Friendly Expert Advice:** Identifies your plant, diagnoses health issues, and outlines custom care strategies (sunlight, water, soil, and pro-tips).

## Project Structure
```text
plant-doctor/
├── index.html       # Main UI and application layout
├── script.Api.js    # Core logic, camera capture, and Gemini API integration
└── README.md        # Project documentation
```

## How to Deploy on GitHub Pages
1. Create a new public repository on GitHub (e.g., `plant-doctor`).
2. Extract and upload all files (`index.html`, `script.Api.js`, `README.md`) to the root of your repository's `main` branch.
3. Go to your repository **Settings** -> **Pages**.
4. Set the source branch to `main` and folder to `/ (root)`, then click **Save**.
5. Open your generated live GitHub Pages URL and enjoy!
