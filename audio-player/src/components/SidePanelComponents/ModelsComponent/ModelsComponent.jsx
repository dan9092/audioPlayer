import React, { useContext, useRef } from "react";
import './ModelsComponent.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import EqualizerComponent from "../../EqualizerComponent/EqualizerComponent";

const ModelsComponent = (props) => {
    const resetEqualizerRef = useRef(null);

    return (
        <>
            <div className="models-component-container">
                <div className="model-container">
                    <div className="models-title">
                        <b>Title</b>
                        <FontAwesomeIcon 
                            icon={faArrowRotateRight}
                            className="button"/>
                    </div>
                </div>
                <div className="model-container">
                    <div className="models-title">
                        <b>אקולייזר</b>
                        <FontAwesomeIcon 
                            icon={faArrowRotateRight}
                            className="button"
                            ref={resetEqualizerRef}
                        />
                    </div>
                    <EqualizerComponent resetEqualizerRef={resetEqualizerRef} />
                </div>
            </div>
        </>
    );
};

export default ModelsComponent;