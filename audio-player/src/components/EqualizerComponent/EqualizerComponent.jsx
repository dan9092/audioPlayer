import React, { useState, useCallback, useEffect, useContext, useMemo, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import './EqualizerComponent.css';
import { AudiosContext } from "../../contexts/Context";

const EqualizerComponent = () => {
    const {audioContextRef, sourceRef, mergerRef} = useContext(AudiosContext);
    const [equalizerFilters, setEqualizerFilters] = useState([]);

    const createEqualizer = useCallback(() => {
        const equalizerBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

        setEqualizerFilters(equalizerBands.map((band) => {
            const filter = audioContextRef.current.createBiquadFilter();

            filter.type = band <= 32 ? 'lowshelf' : band >= 16000 ? 'highshelf' : 'peaking';
            filter.gain.value = 0;
            filter.Q.value = 1; // resonance
            filter.frequency.value = band; // the cut-off frequency

            return filter;
        }));
    }, [audioContextRef]);       

    const handleEqualizerInput = useCallback((event, filter) => {
        filter.gain.value = event.target.value;  
    }, []);

    const resetEqualizer = useCallback(() => {
        setEqualizerFilters((prevFilters) => {
            return prevFilters.map((filter) => {
                filter.gain.value = 0;

                return filter;
            });
        });
    }, []);

    const equalizerSliders = useMemo(() => equalizerFilters.map((filter) => {
        const inputId = uuidv4();   

        return  (
            <div className='equalizer-panner-container' key={`equalizer-panner-container-${inputId}`}>
                <span key={`equalizer-span-${inputId}`} className='equalizer-span'>{filter.gain.value.toFixed(2)}</span>
                <input 
                    key={`equalizer-panner-${inputId}`}
                    id={inputId}
                    type='range'
                    orient='vertical'
                    className='equalizer-slider'
                    min={-40}
                    max={40}
                    step={0.1}
                    defaultValue={filter.gain.value}
                    onInput={(e) => handleEqualizerInput(e, filter)}
                />
                <label 
                    key={`equalizer-label-${inputId}`}
                    htmlFor={inputId}
                    className='equalizer-label'
                >{filter.frequency.value}</label>
            </div>
        );
    }), [equalizerFilters]);

    useEffect(() => {
        if (!sourceRef.current) return;

        const equalizer = equalizerFilters.reduce((prev, curr) => {
            prev.connect(curr);
        
            return curr;
        }, sourceRef.current);

        equalizer.connect(mergerRef.current);
    }, [equalizerFilters, sourceRef.current])

    useEffect(() => {
        createEqualizer();
    }, [])

    return (
        <>
            <div className="equalizer">
                <div className="equalizer-buttons-container">
                    <button className='reset-equalizers-button' onClick={resetEqualizer}>Reset</button>
                </div>
                <div className='equalizer-container'>
                    <hr className='equalizer-zero-line'></hr>
                    { equalizerSliders }
                </div>
            </div> 
        </>
    );
};

export default EqualizerComponent;