import * as Constants from './constants.js';
import data from './data.json' assert { type: 'json' };
import {
    injectAudioElement,
    highlightElement,
    removeHighlightFromElement,
} from './utils.js';
import { convertTextToSpeech, convertImageToSpeech } from './api.js';

export class Saathi {
    constructor() {
        this._audioUrls = [];
        this._currentAudioIndex = 0;
        this._audioElement = null;
        this._currentTargetElement = null;
        this._SAATHI_SERVER_HOST = '';
    }

    set setSaathiServer(_SAATHI_SERVER_HOST) {
        this._SAATHI_SERVER_HOST = _SAATHI_SERVER_HOST;
    }

    _highlightAndPlay(args) {
        const { highlight = true } = args || {};
        if (this._currentAudioIndex >= this._audioUrls.length) {
            return;
        }
        const { url, targetElement = null } =
            this._audioUrls[this._currentAudioIndex];
        this._currentTargetElement = targetElement;
        if (this._currentTargetElement && highlight) {
            highlightElement(this._currentTargetElement);
        }
        this._audioElement =
            document.getElementById('audio') || injectAudioElement();
        this._audioElement.src = url;
        this._audioElement.muted = true; // Start muted to allow autoplay
        this._audioElement
            .play()
            .then(() => {
                // Unmute after starting to play
                this._audioElement.muted = false;
            })
            .catch((error) => {
                console.error(`${Constants.ERROR.AUTOPLAY_AUDIO}: ${error}`);
            });

        // Move to the next audio when the current audio ends
        this._audioElement.onended = () => {
            if (this._currentTargetElement) {
                removeHighlightFromElement(this._currentTargetElement);
            }
            this._currentAudioIndex++;
            this._highlightAndPlay();
        };

        // Move to the next audio if an error occurs in playing the current audio
        this._audioElement.onerror = (event) => {
            console.error(`${Constants.ERROR.PLAY_AUDIO}: ${url}`, event);
            if (this._currentTargetElement) {
                removeHighlightFromElement(this._currentTargetElement);
            }
            this._currentAudioIndex++;
            this._highlightAndPlay();
        };
    }

    _takeAudioAction = async (action, targetElement) => {
        const url = await convertTextToSpeech({
            baseUrl: this._SAATHI_SERVER_HOST,
            text: action.text,
            languageCode: action.languageCode,
            audioUrls: this._audioUrls,
            targetElement,
        });
        this._audioUrls.push({ url, targetElement });
        this._highlightAndPlay();
    };

    start = async (data) => {
        console.log('Saathi initialized!');

        // Filter elements for current page only
        const currentPageElementsList = data.input.filter((item) => {
            const pageUrlRegex = new RegExp(item.pageUrl);
            return pageUrlRegex.test(window.location.href);
        });

        for (const element of currentPageElementsList) {
            const targetElement = document.querySelector(
                `[${Constants.DATA_IDENTIFIER}='${element['data-identifier']}']`
            );

            if (!targetElement) {
                console.warn(
                    `${Constants.ERROR.ELEMENT_NOT_FOUND}: ${element['data-identifier']}`
                );
            } else {
                for (const action of element.actions) {
                    switch (action.type) {
                        case 'audio': {
                            await this._takeAudioAction(action, targetElement);
                            break;
                        }
                        case 'text': {
                            // TODO: Handle this case
                            break;
                        }
                        case 'interaction': {
                            targetElement.addEventListener(
                                action.event,
                                async () => {
                                    await this._takeAudioAction(
                                        action,
                                        targetElement
                                    );
                                }
                            );
                            break;
                        }
                        default: {
                            console.warn(
                                `${Constants.ERROR.NON_SUPPORTED_ACTION}: ${action.type}`
                            );
                        }
                    }
                }
            }
        }
    };

    stop = () => {
        if (this._audioElement) {
            this._audioElement.pause();
            this._audioElement.currentTime = 0;
            this._audioElement = null;
            removeHighlightFromElement(this._currentTargetElement);
            this._currentTargetElement = null;
        }
        this._audioUrls = [];
        this._currentAudioIndex = 0;
    };

    play = () => {
        if (this._audioElement && this._audioElement.paused) {
            this._audioElement.play();
            highlightElement(this._currentTargetElement);
        }
    };

    pause = () => {
        if (this._audioElement && !this._audioElement.paused) {
            this._audioElement.pause();
            removeHighlightFromElement(this._currentTargetElement);
        }
    };

    startScreenshot = () => {
        this._highlightAndPlay({
            highlight: false,
        });
    };

    screenshot = async ({ language, image, systemInstruction }) => {
        this.stop();
        const url = await convertImageToSpeech({
            baseUrl: this._SAATHI_SERVER_HOST,
            language,
            image,
            systemInstruction,
        });
        this._audioUrls.push({ url });
        this.startScreenshot();
    };
}

// This flow is for testing
document.addEventListener('DOMContentLoaded', () => {
    const saathi = new Saathi();
    saathi.setSaathiServer = 'http://localhost:7779';

    document.getElementById('start').addEventListener('click', () => {
        saathi.start(data);
    });

    document.getElementById('stop').addEventListener('click', () => {
        saathi.stop();
    });

    document.getElementById('play').addEventListener('click', () => {
        saathi.play();
    });

    document.getElementById('pause').addEventListener('click', () => {
        saathi.pause();
    });

    document.getElementById('screenshot').addEventListener('click', () => {
        saathi.screenshot({
            language: 'Hindi',
            image: 'gs://saathi/ynrju/1718299319342/canvas_image.png',
            systemInstruction:
                'This image is captured from the Payouts section of the Supplier panel i.e. Meesho has paid out or yet to pay amounts',
        });
    });
});
