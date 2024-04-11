import React, { useCallback, useState, useRef } from "react";
import { AudiosContext, FileContext, URLContext } from '../../contexts/Context';
import AudioControlsComponent from "../playerControls/PlayerControlsComponent";
import { faArrowUpFromBracket, faArrowsRotate, faBars, faFloppyDisk, faGear, faList, faMinus, faRotate, faUpRightFromSquare, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import './PlayerComponent.css';
import SidePanelComponent from "../SidePanelComponents/SidePanelComponent/SidePanelComponent";

const PlayerComponent = () => {
    const [audio, setAudio] = useState(new Audio());
    const audioContextRef = useRef(new AudioContext());
    const splitterRef = useRef(audioContextRef.current.createChannelSplitter(2));
    const mergerRef = useRef(audioContextRef.current.createChannelMerger(2));
    const leftGainRef = useRef(audioContextRef.current.createGain());
    const rightGainRef = useRef(audioContextRef.current.createGain());
    const sourceRef = useRef(!audio.src && audioContextRef.current.createMediaElementSource(audio));
    const stereoPannerNodeRef = useRef(audioContextRef.current.createStereoPanner());

    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('/audio/audio5.ogg');

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
        <AudiosContext.Provider value={{audio, audioContextRef, splitterRef, mergerRef, leftGainRef, rightGainRef, sourceRef, stereoPannerNodeRef}}>
            <FileContext.Provider value={file}>
                <URLContext.Provider value={url}>
                    <>
                        <section className="top-general-actions">
                            <div className="top-icons-container">
                                <div className="settings-container">
                                    <FontAwesomeIcon 
                                        icon={faGear}
                                        className="button top-icon settings-icon"
                                    />
                                </div>
                                <div className="upload-file-container">
                                    <input 
                                    type='file'
                                    id='upload-file-input'
                                    hidden={true}
                                    accept='audio/*'
                                    onInput={(e) => handleFileInput(e)}
                                    />
                                    <label htmlFor='upload-file-input'>
                                        <FontAwesomeIcon 
                                            icon={faArrowUpFromBracket}
                                            className='button top-icon upload-file-icon'
                                        />
                                    </label>
                                </div>
                                <div className="export-container">
                                    <FontAwesomeIcon 
                                        icon={faUpRightFromSquare}
                                        className="button top-icon export-icon"
                                    />
                                </div>
                                <div className="save-container">
                                    <FontAwesomeIcon 
                                        icon={faFloppyDisk}
                                        className="button top-icon save-icon"
                                    />
                                </div>
                                <div className="refresh-container">
                                    <FontAwesomeIcon 
                                        icon={faArrowsRotate}
                                        className="button top-icon refresh-icon"
                                    />
                                </div>
                            </div>
                            <div className="general-details-container">
                                <b>שם</b>
                                <FontAwesomeIcon 
                                    icon={faUser}
                                    className="fa-xs subject-icon"
                                />
                            </div>
                        </section>
                        
                        <p>Audio: {url}</p>
                    </>
                    <AudioControlsComponent />
                    <SidePanelComponent />
                </URLContext.Provider>
            </FileContext.Provider>
        </AudiosContext.Provider>  
    )
}

export default PlayerComponent;
