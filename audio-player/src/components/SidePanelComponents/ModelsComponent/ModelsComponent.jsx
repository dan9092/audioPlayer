import React, { useCallback, useContext, useRef, useState } from "react";
import './ModelsComponent.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";
import EqualizerComponent from "../../EqualizerComponent/EqualizerComponent";
import ModelComponent from "./ModelComponent/ModelComponent";

const ModelsComponent = (props) => {
    const resetEqualizerRef = useRef(null);
    const firstModelRef = useRef(null);
    const secondModelRef = useRef(null);

    const resetModel = useCallback((ref) => {
        ref.current.setModelValue(0);
        ref.current.sliderRef.current.value = 0;
        ref.current.methodsSelectRef.current.value = 'natural';
    }, []);

    const resetModels = useCallback(() => {
        resetModel(firstModelRef);
        resetModel(secondModelRef);
    }, [firstModelRef, secondModelRef]);

    const submitModels = useCallback(() => {

    }, [firstModelRef, secondModelRef]);

    return (
        <>
            <div className="models-component-container">
                <div className="model-container top-model-container">
                    <div className="models-title top-models-title">
                        <b>Title</b>
                        <FontAwesomeIcon 
                            icon={faArrowRotateRight}
                            className="button"
                            onClick={resetModels}
                        />
                    </div>
                    <ModelComponent 
                        name="שם המודל" 
                        options={[
                            {value: "natural", title: "טבעי"},
                            {value: "synethetic", title: "מסונתז"},
                            {value: "natural aggressive", title:"טבעי אגרסיבי"},
                        ]}
                        ref={firstModelRef}
                    />
                     <ModelComponent 
                        name="שם המודל" 
                        options={[
                            {value: "natural", title: "טבעי"},
                            {value: "synethetic", title: "מסונתז"},
                            {value: "mask", title:"מסכה"},
                        ]}
                        ref={secondModelRef}
                    />
                    <button className="submit-button" onClick={submitModels}>שלח</button>
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