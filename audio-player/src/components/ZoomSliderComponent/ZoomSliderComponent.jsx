import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlassPlus } from "@fortawesome/free-solid-svg-icons";

const ZoomSliderComponent = ({zoomRef, handleZoomInput}) => {
    return (
        <div className='zoom-container'>
            <label htmlFor='zoom-input'>
                <FontAwesomeIcon
                    icon={faMagnifyingGlassPlus}
                    className='fa-sm zoom-icon'
                />
            </label>
            <input 
                id='zoom-input'
                type='range'
                data-action='zoom'
                ref={zoomRef}
                onInput={handleZoomInput}   
                min={10}
                max={100}
                step={1}
                defaultValue={10}
                className='zoom-input'
            />
        </div>
    );
};

export default ZoomSliderComponent;