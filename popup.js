document.addEventListener('DOMContentLoaded', () => {
    const volumeSlider = document.getElementById('volume-slider');
    const volumeLabel = document.getElementById('volume-label');

    // Load saved volume and update UI
    chrome.storage.sync.get(['volumeLevel'], (result) => {
        if (result.volumeLevel) {
            const level = parseFloat(result.volumeLevel);
            volumeSlider.value = level;
            volumeLabel.textContent = `${Math.round(level * 100)}%`;
        }
    });

    volumeSlider.addEventListener('input', () => {
        const level = parseFloat(volumeSlider.value);
        volumeLabel.textContent = `${Math.round(level * 100)}%`;

        // Save the volume level
        chrome.storage.sync.set({ volumeLevel: level });

        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab && activeTab.id) {
                // First, inject the content script.
                // The content script is designed to run only once per page.
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    files: ['content.js']
                }).then(() => {
                    // After the script is injected, send the message.
                    chrome.tabs.sendMessage(activeTab.id, {
                        type: 'BOOST_VOLUME',
                        level: level
                    });
                }).catch(err => {
                    // We can get an error if we try to inject into a page like
                    // chrome://extensions or the web store. It's fine to ignore.
                    if (!err.message.includes('Cannot access a chrome:// URL') && !err.message.includes('The extensions gallery cannot be scripted')) {
                        console.error('Failed to execute script:', err);
                    }
                });
            }
        });
    });
});
