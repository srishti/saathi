/**
 * Function to create and inject an audio element in the DOM
 * @returns
 */
export function injectAudioElement() {
    const audio = document.createElement('audio');
    audio.id = 'audio';
    audio.style.display = 'none'; // Hide the audio element
    document.body.appendChild(audio);

    return audio;
}

/**
 * Function to highlight the element being interacted with
 * @param {*} element element to be highlighted
 */
export function highlightElement(element) {
    document.body.classList.add('dimmed');
    element.classList.add('highlighted');
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Function to remove the highlight from the element
 * @param {*} element element to remove highlight from
 */
export function removeHighlightFromElement(element) {
    document.body.classList.remove('dimmed');
    element.classList.remove('highlighted');
}
