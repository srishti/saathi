import * as Constants from './constants.js';
import data from './data.json' assert { type: 'json' };

const audioUrls = []; // used for storing all audio URLs
let currentAudioIndex = 0; // used for tracking the current audio being played

/**
 * Function to convert text to speech
 * @param {*} action action object defining the action to be taken
 */
const convertTextToVoice = async ({ text, languageCode }) => {
    const payload = JSON.stringify({ text, languageCode });

    try {
        const response = await fetch('http://localhost:3000/tts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payload,
        });

        if (response.ok) {
            const { url } = await response.json();
            audioUrls.push(url);
        } else {
            console.error(
                `${Constants.ERROR.TEXT_TO_SPEECH_CONVERSION}: ${response.status}`
            );
        }
    } catch (err) {
        console.error(`${Constants.ERROR.TEXT_TO_SPEECH_CONVERSION}: ${err}`);
    }
};

/**
 * Function to create and inject an audio element in the DOM
 * @returns
 */
function injectAudioElement() {
    const audio = document.createElement('audio');
    audio.id = 'audio';
    audio.style.display = 'none'; // Hide the audio element
    document.body.appendChild(audio);

    return audio;
}

/**
 * Function to play audio
 */
function playAudio() {
    if (currentAudioIndex >= audioUrls.length) {
        return;
    }
    const url = audioUrls[currentAudioIndex];
    const audioElement =
        document.getElementById('audio') || injectAudioElement();
    audioElement.src = url;
    audioElement.muted = true; // Start muted to allow autoplay
    audioElement
        .play()
        .then(() => {
            // Unmute after starting to play
            audioElement.muted = false;
        })
        .catch((error) => {
            console.error(`${Constants.ERROR.AUTOPLAY_AUDIO}: ${error}`);
        });

    // Move to the next audio when the current audio ends
    audioElement.onended = function () {
        currentAudioIndex++;
        playAudio();
    };

    // Move to the next audio if an error occurs in playing the current audio
    audioElement.onerror = function (event) {
        console.error(`${Constants.ERROR.PLAY_AUDIO}: ${url}`, event);
        currentAudioIndex++;
        playAudio();
    };
}

/**
 * Function to start audio playback on user interaction
 */
const startAudioPlayback = () => {
    playAudio();
    // Remove the event listener after first interaction
    document.removeEventListener('click', startAudioPlayback);
};

export const init = () => {
    console.log('Saathi initialized!');

    // filter elements for current page only
    const currentPageElementsList = data.input.filter((item) => {
        const pageUrlRegex = new RegExp(item.pageUrl);
        return pageUrlRegex.test(window.location.href);
    });

    currentPageElementsList.forEach((element) => {
        const targetElement = document.querySelector(
            `[${Constants.DATA_IDENTIFIER}='${element['data-identifier']}']`
        );

        if (!targetElement) {
            console.warn(
                `${Constants.ERROR.ELEMENT_NOT_FOUND}: ${element['data-identifier']}`
            );
        } else {
            element.actions.forEach(async (action) => {
                switch (action.type) {
                    case 'audio': {
                        await convertTextToVoice(action);
                        break;
                    }
                    case 'text': {
                        // TODO: Handle this case
                        break;
                    }
                    case 'interaction': {
                        targetElement.addEventListener(action.event, () =>
                            convertTextToVoice(action)
                        );
                        break;
                    }
                    default: {
                        console.warn(
                            `${Constants.ERROR.NON_SUPPORTED_ACTION}: ${action.type}`
                        );
                    }
                }
            });
        }
    });

    playAudio();

    // Add a fallback to start playback on user interaction
    document.addEventListener('click', startAudioPlayback);
}

document.addEventListener('DOMContentLoaded', init);
