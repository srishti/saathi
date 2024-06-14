import * as Constants from './constants.js';

/**
 * Function to convert image to speech
 * @param {*} action action object defining the action to be taken
 */
export const convertImageToAudio = async ({
    language,
    image,
    audioUrls,
    systemInstruction,
}) => {
    const payload = JSON.stringify({ language, image, systemInstruction });

    try {
        const response = await fetch('http://localhost:7779/img-to-text', {
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
