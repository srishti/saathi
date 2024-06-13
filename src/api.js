import * as Constants from './constants.js';

/**
 * Function to convert text to speech
 * @param {*} action action object defining the action to be taken
 * @returns url and targetElement of the audio file
 */
export const convertTextToSpeech = async ({
    text,
    languageCode,
}) => {
    const payload = JSON.stringify({ text, languageCode });

    const url = `${Constants.SAATHI_SERVER_HOST}/tts`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payload,
        });

        if (response.ok) {
            const { url } = await response.json();
            return url;
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
 * Function to convert image to audio
 * @param {string} language language code
 * @param {*} image base64 encoded image
 * @returns url of the audio file
 */
export const convertImageToSpeech = async ({ languageCode, image }) => {
    const payload = JSON.stringify({ languageCode, image });

    const url = `${Constants.SAATHI_SERVER_HOST}/img-to-text`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: payload,
        });

        if (response.ok) {
            const { url } = await response.json();
            return url;
        } else {
            console.error(
                `${Constants.ERROR.IMG_TO_SPEECH_CONVERSION}: ${response.status}`
            );
        }
    } catch (err) {
        console.error(`${Constants.ERROR.IMG_TO_SPEECH_CONVERSION}: ${err}`);
    }
};