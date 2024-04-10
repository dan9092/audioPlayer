import React, { useCallback, useState } from "react";
import { AudioContext, FileContext, URLContext } from '../../contexts/audioContext';
import AudioControlsComponent from "../playerControls/PlayerControlsComponent";
import { faArrowUpFromBracket, faBars, faList, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import MultitrackComponent from "../multitrack/MultitrackComponent";
import './PlayerComponent.css';

const PlayerComponent = () => {
    const [audio, setAudio] = useState(new Audio());
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('/audio/audio5.ogg');
    const [speakersMultiStream, setSpeakersMultiStream] = useState(false);

    const handleMultiSpeakersView = useCallback(() => {
        setSpeakersMultiStream((prevState) => !prevState);
    }, []);

    const isFileValid = useCallback((file) => {
      console.log(file);
      
      return true;
    });
  
    const handleFileInput = useCallback((event) => {
      const uploadedFile = event.currentTarget.files[0];
  
      if (isFileValid(uploadedFile)) {
        setFile(uploadedFile)

        const formData = new FormData();
        
        formData.append("audioFile", uploadedFile, uploadedFile.name);
        
        axios.post("api/uploadFile", formData).then((response) => setUrl(response));
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
                            <label htmlFor='upload-file-input'>
                                <FontAwesomeIcon icon={faArrowUpFromBracket} className='fa-lg button' />
                            </label>
                        </div>
                        <p>Audio: {url}</p>
                        <div className=''>
                            <div className="speakers-view">
                                <FontAwesomeIcon 
                                    icon={faMinus}
                                    className={speakersMultiStream ? "fs-lg speakers-view-button" : "fs-lg speakers-view-button speakers-view-button-active"}
                                    onClick={handleMultiSpeakersView}
                                />
                                <FontAwesomeIcon 
                                    icon={faList}
                                    className={speakersMultiStream ? "fs-lg speakers-view-button speakers-view-button-active" : "fs-lg speakers-view-button"}
                                    onClick={handleMultiSpeakersView}
                                />
                                <p>תצוגת דוברים:</p>
                            </div>
                            {
                             speakersMultiStream ? <MultitrackComponent /> : <AudioControlsComponent />
                            }
                            
                        </div>
                    </>
                </URLContext.Provider>
            </FileContext.Provider>
        </AudioContext.Provider>  
    )
}

export default PlayerComponent;
