(() => {
    // This is to ensure the script runs in its own scope and doesn't conflict with page scripts.

    if (window.hasRun) {
        return;
    }
    window.hasRun = true;


    const audioData = new WeakMap();

    function applyBoost(level, element) {
        if (!audioData.has(element)) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaElementSource(element);
                const gainNode = audioContext.createGain();
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
                audioData.set(element, { audioContext, gainNode, source });
            } catch (e) {
                console.error("Could not create audio context for element", element, e);
                return;
            }
        }

        const { gainNode } = audioData.get(element);
        gainNode.gain.value = level;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'BOOST_VOLUME') {
            const level = message.level;
            document.querySelectorAll('audio, video').forEach(element => {
                applyBoost(level, element);
            });
            sendResponse({status: "ok"});
        }
        return true; // Keep the message channel open for async response
    });

})();
