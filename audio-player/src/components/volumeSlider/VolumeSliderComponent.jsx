import React, { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './VolumeSliderComponent.css';


const VolumeSliderComponent = ({ getVolumeIcon, mute, unmute, handleVolumeInput, trackIndex = null }) => {
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    const handleIconClick = useCallback(() => {
        if (isMuted) {
            unmute(trackIndex, volume);      
            setIsMuted(false);
        } else {
            mute(trackIndex);  
            setIsMuted(true);
        }
    }, [isMuted]);
    
    useEffect(() => {
        setIsMuted(volume === 0);
    }, [volume])

    return (
        <div className='volume-container'>
            <FontAwesomeIcon 
                icon={isMuted ? getVolumeIcon(0) : getVolumeIcon(volume * 100)}
                className='fa-sm volume-icon'
                onClick={handleIconClick}
            />
            <input 
                type='range'
                onInput={(e) => {handleVolumeInput(e, trackIndex); setVolume(e.currentTarget.valueAsNumber)}}    
                min={0}
                max={1}
                step={0.01}
                className='volume-input'
            />
            <span className='volume-value'>{(volume * 100).toFixed()}%</span>
        </div>
    );
};

export default VolumeSliderComponent;