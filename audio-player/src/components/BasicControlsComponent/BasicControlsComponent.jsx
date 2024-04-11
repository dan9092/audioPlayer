import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackwardFast, faBackwardStep, faPause, faPlay, faForwardStep, faForwardFast, faStop} from "@fortawesome/free-solid-svg-icons";

const BasicControlsComponent = ({ onSkip, onPlayPause, onStop, isPlaying }) => {
    return (
        <>
            <div className='control-buttons-container'>
                <button onClick={() => onSkip(-5)} className='skip-button button'>
                    <FontAwesomeIcon icon={faBackwardFast} className='fa-xl' />
                </button>
                <button onClick={() => onSkip(-2)} className='skip-button button'>
                    <FontAwesomeIcon icon={faBackwardStep} className='fa-xl' />
                </button>
                <button onClick={onPlayPause} className='play-pause-button button'>
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className='fa-xl' />
                </button>
                <button onClick={() => onSkip(2)} className='skip-button button'>
                    <FontAwesomeIcon icon={faForwardStep} className='fa-xl' />
                </button>
                <button onClick={() => onSkip(5)} className='skip-button button'>
                    <FontAwesomeIcon icon={faForwardFast} className='fa-xl' />
                </button>
                <button onClick={onStop} className='stop-button button'>
                    <FontAwesomeIcon icon={faStop} className='fa-xl' />
                </button>
            </div>
        </>
    );
};

export default BasicControlsComponent;

