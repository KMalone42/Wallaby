// settings.page.js
// ----------------------------------------------------------------------------


// Event listener for the buttons
document.addEventListener("DOMContentLoaded", async () => {

  await loadSettings();

  document
    .querySelector(".reset-button")
    .addEventListener("click", resetToDefaults);

  document
    .querySelector(".save-button")
    .addEventListener("click", saveSettings);

  const tempEnable = document.getElementById("tempEnable");
  const temperatureSlider = document.getElementById("temperatureSlider");
  const temperature = document.getElementById("temperature");
  const temperatureValue = document.getElementById("temperature-value");

  if (!tempEnable || !temperatureSlider || !temperature || !temperatureValue) {
    console.warn("Temperature slider elements missing from DOM");
    return;
  }

  function setTempSliderVisible(enabled) {
    temperatureSlider.classList.toggle("is-open", enabled);
    temperatureSlider.setAttribute("aria-hidden", String(!enabled));
  }

  // Update temperature value display
  temperature.addEventListener("input", () => {
    temperatureValue.textContent = temperature.value;
  });

  // Checkbox toggles slider visibility
  tempEnable.addEventListener("change", () => {
    setTempSliderVisible(tempEnable.checked);
  });

  // Correct initial render state
  setTempSliderVisible(tempEnable.checked);
  temperatureValue.textContent = temperature.value;
});

// Reset to defaults button
async function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        try {
            await window.settings.resetToDefaults();
            // Reload page to apply defaults
            window.location.reload();
        } catch (error) {
            console.error('Error resetting settings:', error);
            alert('Error resetting settings');
        }
    }
}

// Save Settings button
async function saveSettings() {
    console.log('Saving settings...');
    try {
        const theme          = document.getElementById('theme').value;
        const language       = document.getElementById('language').value;
        const model          = document.getElementById('model').value;
        const tempEnabled    = document.getElementById('tempEnable').checked;
        let temperature      = document.getElementById('temperature').value;
        const saveHistory    = document.getElementById('save-history').checked;
        const autoSave       = document.getElementById('auto-save').checked;
        const analytics      = document.getElementById('analytics').checked;
        const ollamaEndpoint = document.getElementById('ollama-endpoint').value;
        let prependPrompt    = document.getElementById('prependPrompt').value;
        let appendPrompt     = document.getElementById('appendPrompt').value;
        const maxTokens      = document.getElementById('max-tokens').value;
        const timeout        = document.getElementById('timeout').value;

        // additional logic
        if (!tempEnabled) { temperature = 0.5; } // a fair default.
        if (!prependPrompt) { prependPrompt = ''; }
        if (!appendPrompt) { appendPrompt = ''; }

        // Save all settings
        await call('theme', () => window.settings.setTheme(theme));
        await call('language', () => window.settings.setLanguage(language));
        await call('model', () => window.settings.setModel(model));
        await call('temperature', () => window.settings.setTemperature(temperature));
        await call('saveHistory', () => window.settings.setSaveHistory(saveHistory));
        await call('autoSave', () => window.settings.setAutoSave(autoSave));
        await call('analytics', () => window.settings.setAnalytics(analytics));
        await call('ollamaBaseUrl', () => window.settings.setOllamaBaseUrl(ollamaEndpoint));
        await call('prependPrompt', () => window.settings.setPrependPrompt(prependPrompt));
        await call('appendPrompt', () => window.settings.setAppendPrompt(appendPrompt));
        await call('maxTokens', () => window.settings.setMaxTokens(maxTokens));
        await call('timeout', () => window.settings.setTimeout(timeout));
        
        console.log('Settings saved successfully');
        alert('Settings saved successfully!');

    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Error saving settings');
    }
}

// Called by saveSettings() useful noisy console debugging.
async function call(name, fn) {
  console.log(`→ saving ${name}`);
  try {
    const result = await fn();
    console.log(`✓ saved ${name}`, result);
    return result;
  } catch (error) {
    console.error(`Error saving ${name}:`, error);
    throw error;
  }
}

async function loadSettings() {
    try {
        console.log('Loading settings...');
        // Load all settings
        const theme = await window.settings.getTheme();
        const language = await window.settings.getLanguage();
        const model = await window.settings.getModel();
        const temperature = await window.settings.getTemperature();
        const saveHistory = await window.settings.getSaveHistory();
        const autoSave = await window.settings.getAutoSave();
        const analytics = await window.settings.getAnalytics();
        const ollamaEndpoint = await window.settings.getOllamaBaseUrl();
        const maxTokens = await window.settings.getMaxTokens();
        const timeout = await window.settings.getTimeout();
        
        // Set values in UI
        document.getElementById('theme').value = theme;
        document.getElementById('language').value = language;
        document.getElementById('model').value = model;
        document.getElementById('temperature').value = temperature;
        document.getElementById('temperature-value').textContent = temperature;
        document.getElementById('save-history').checked = saveHistory;
        document.getElementById('auto-save').checked = autoSave;
        document.getElementById('analytics').checked = analytics;
        document.getElementById('ollama-endpoint').value = ollamaEndpoint;
        document.getElementById('max-tokens').value = maxTokens;
        document.getElementById('timeout').value = timeout;
        
        console.log('Settings loaded successfully');
        
        // Check if endpoint is saved and show banner if not
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}
