import React, { useCallback, useState } from "react";
import { AudioContext, FileContext, URLContext } from '../../contexts/audioContext';
import AudioControlsComponent from "../playerControls/PlayerControlsComponent";

const PlayerComponent = () => {
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
            <FileContext.Provider value={file}>
                <URLContext.Provider value={url}>
                    <>
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
                        <p>Audio: {url}</p>
                        <div className='wavesurfer-container'>
                            <AudioControlsComponent />
                            {/* <PlayerComponent /> */}
                        </div>
                        {/* <MultitrackComponent></MultitrackComponent> */}
                    </>
                </URLContext.Provider>
            </FileContext.Provider>
        </AudioContext.Provider>  
    )
}

export default PlayerComponent;
