import * as Constants from "./constants.js";
import data from './data.json' assert { type: 'json' };

const audioUrls = [];
let currentAudioIndex = 0;

const convertToVoice = async (action) => {
  const body = JSON.stringify({ text: action.text, languageCode: action.languageCode });
  
  const response = await fetch('http://localhost:3000/synthesize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  });

  if (response.ok) {
    const { url } = await response.json();
    audioUrls.push(url);
  } else {
    console.error('Error synthesizing text.');
  }
}

function playAudio() {
  if (currentAudioIndex < audioUrls.length) {
    const url = audioUrls[currentAudioIndex];
    const audio = document.getElementById('audio');
    audio.src = url;
    audio.muted = true; // Start muted to allow autoplay
    audio.play().then(() => {
      // Unmute after starting to play
      audio.muted = false;
    }).catch(error => {
      console.error('Autoplay failed:', error);
      // Handle autoplay failure, e.g., show a play button to the user
    });

    audio.onended = function() {
      currentAudioIndex++;
      playAudio();
    };

    audio.onerror = function() {
      console.error('Error playing audio:', url);
      currentAudioIndex++;
      playAudio();
    };
  }
}

document.addEventListener("DOMContentLoaded", function() {
  console.log("Saathi loaded!");

  const startPlayback = () => {
    playAudio();
    document.removeEventListener('click', startPlayback); // Remove the event listener after first interaction
  };

  const currentPageElementsList = data.input.filter((item) => {
    const pageUrlRegex = new RegExp(item.pageUrl);
    return pageUrlRegex.test(window.location.href);
  });

  currentPageElementsList.forEach(element => {
    const targetElement = document.querySelector(`[${Constants.DATA_IDENTIFIER}='${element["data-identifier"]}']`);
    
    if (targetElement) {
      element.actions.forEach(async action => {
        switch(action.type) {
          case "audio": {
            await convertToVoice(action);
            playAudio();

            // Add a fallback to start playback on user interaction
            document.addEventListener('click', startPlayback);
            break;
          }
          case "text": {
            targetElement.textContent = action.text;
            break;
          }
          case "interaction": {
            targetElement.addEventListener(action.event, () => convertToVoice(action));
            break;
          }
          default: {
            console.warn(`Unsupported action type: ${action.type}`);
          }
        }
      });
    }
  });

  playAudio();
});
