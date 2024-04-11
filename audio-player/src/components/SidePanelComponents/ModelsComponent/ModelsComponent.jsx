import React, { useContext } from "react";
import './ModelsComponent.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import EqualizerComponent from "../../EqualizerComponent/EqualizerComponent";

const ModelsComponent = (props) => {

    return (
        <>
            <div className="models-component-container">
                <div className="models-container">
                    <div className="models-title">
                        <b>Title</b>
                        <FontAwesomeIcon 
                            icon={faArrowRotateRight}
                            className="button"/>
                    </div>
                </div>
                <EqualizerComponent />
            </div>
        </>
    );
};

export default ModelsComponent;