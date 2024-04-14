import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import './ModelComponent.css';

const ModelComponent = forwardRef(function ModelComponent({name, options}, ref) {
    const sliderRef = useRef(null);
    const methodsSelectRef = useRef(null);
    const [modelValue, setModelValue] = useState(0);

    useImperativeHandle(ref, () => {
        return {
            sliderRef,
            methodsSelectRef,
            modelValue,
            setModelValue
        };
    }, []);

    return (
        <>
             <div className="model">
                <p className="model-name">{name}</p>
                <select className="model-select" ref={methodsSelectRef}>
                    {options.map((option) => {
                        return (
                            <option value={option.value}>{option.title}</option>
                        );
                    })}
                </select>
                <div className="model-slider-container">
                    <label htmlFor="slider">{modelValue}%</label>
                    <input 
                        id="slider"
                        type="range"
                        defaultValue={0}
                        min={0}
                        max={100}
                        ref={sliderRef}
                        onInput={() => setModelValue(sliderRef.current.value)}
                    />
                </div>
            </div>
        </>
    );
}, []);

export default ModelComponent;