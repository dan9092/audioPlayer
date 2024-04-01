import './App.css';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import MultitrackComponent from './components/multitrack/MultitrackComponent';
import AudioControlsComponent from './components/audioControls/AudioControlsComponent';
import { AudioContext, FileContext, URLContext } from './contexts/audioContext';
import { render } from 'react-dom';

const App = () => {
  const [audio, setAudio] = useState(new Audio());
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('/audio/audio5.ogg');

  const isFileValid = useCallback((file) => {
    console.log(file);
    
    return true;
  });

  const handleFileInput = useCallback((event) => {
    const uploadedFile = event.currentTarget.files[0];

    if (isFileValid(uploadedFile)) {
      setUrl(URL.createObjectURL(uploadedFile));
      setFile(uploadedFile)
    }
  }, []);

  return (
    <AudioContext.Provider value={audio}>
      {/* <FileContext.Provider value={file}> */}
        <URLContext.Provider value={url}>
          <div className="App">
            <main className='app-main'>
              <div>
                <input 
                  type='file'
                  id='upload-file-input'
                  hidden={true}
                  accept='audio/*'
                  onInput={(e) => handleFileInput(e)}
                />
                <label htmlFor='upload-file-input' className='upload-file'>טען קובץ שמע</label>
              </div>
              <div className='wavesurfer-container'>
                <AudioControlsComponent />
              </div>
              {/* <MultitrackComponent></MultitrackComponent> */}
            </main>
          </div>
        </URLContext.Provider>
      {/* </FileContext.Provider> */}
    </AudioContext.Provider>
  );
}

export default App;
