import React, { useState, useCallback, useEffect, useContext, useMemo, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import './EqualizerComponent.css';
import { AudiosContext } from "../../contexts/Context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight } from "@fortawesome/free-solid-svg-icons";

const EqualizerComponent = (props) => {
    const { resetEqualizerRef } = props;
    const {audioContextRef, sourceRef, mergerRef} = useContext(AudiosContext);
    const [equalizerFilters, setEqualizerFilters] = useState([]);
    const [filtersValues, setFiltersValues] = useState([]);
    const equalizerSetsRef = useRef(null);

    const createEqualizer = useCallback(() => {
        const equalizerBands = [64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

        setEqualizerFilters(equalizerBands.map((band) => {
            const filter = audioContextRef.current.createBiquadFilter();

            filter.type = band <= 32 ? 'lowshelf' : band >= 16000 ? 'highshelf' : 'peaking';
            filter.gain.value = 0;
            filter.Q.value = 1; // resonance
            filter.frequency.value = band; // the cut-off frequency

            return filter;
        }));
    }, [audioContextRef]);       

    const handleEqualizerInput = useCallback((event, filter, index) => {
        filter.gain.value = event.target.valueAsNumber; 

        setFiltersValues((prevState) => {
            prevState[index] = event.target.valueAsNumber.toFixed(2);

            return [...prevState];
        });
    }, []);

    const resetEqualizer = useCallback(() => {
        equalizerSetsRef.current.value = "default";

        setEqualizerFilters((prevFilters) => {
            return prevFilters.map((filter) => {
                filter.gain.value = 0;

                return filter;
            });
        });
    }, []);

    const resetEqualizerFilter = useCallback((filter, index) => {
        filter.gain.value = 0;

        setFiltersValues((prevState) => {
            prevState[index] = 0;

            return [...prevState];
        });
    }, []);

    const equalizerSliders = useMemo(() => equalizerFilters.map((filter, index) => {
        const inputId = uuidv4();   
        
        return  (
            <div className='equalizer-panner-container' key={`equalizer-panner-container-${inputId}`}>
                <div className='equalizer-values-container'>
                    <FontAwesomeIcon 
                        icon={faArrowRotateRight}
                        className="button"
                        onClick={() => resetEqualizerFilter(filter, index)}
                    />
                    <p>{filtersValues[index]}</p>
                </div>
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
                    onInput={(e) => handleEqualizerInput(e, filter, index)}
                />
                <label 
                    key={`equalizer-label-${inputId}`}
                    htmlFor={inputId}
                    className='equalizer-label'
                >{filter.frequency.value % 1000 === 0 ? `${filter.frequency.value / 1000}k` : filter.frequency.value}</label>
            </div>
        );
    }), [filtersValues, equalizerFilters]);

    useEffect(() => {
        if (!sourceRef.current) return;

        const equalizer = equalizerFilters.reduce((prev, curr) => {
            prev.connect(curr);
        
            return curr;
        }, sourceRef.current);

        equalizer.connect(mergerRef.current);

        setFiltersValues(() => {
            return equalizerFilters.map((filter) => filter.gain.value);
        });
    }, [equalizerFilters, sourceRef.current])

    useEffect(() => {
        createEqualizer();
    }, [])

    useEffect(() => {
        if (resetEqualizerRef && resetEqualizerRef.current) {
            resetEqualizerRef.current.addEventListener('click', resetEqualizer);
        } 
    }, [resetEqualizerRef])

    const equalizerSets = useMemo(() => {
        return [
        {
                id: 1,
                title: 'סט 1',
                value: 'set1',
                gains: [5, 15, 25, 35, 40, 0, 0, 0, 0],
            },
            {
                id: 2,
                title: 'סט 2',
                value: 'set2',
                gains: [0, 0, 0, 10, 20, 40, 30, 0, 0],
            },
            {
                id: 3,
                title: 'סט 3',
                value: 'set3',
                gains: [0, 0, 0, 0, 0, 40, 35, 25, 15],
            },
        ];
    }, []);

    const changeEqualizerSet = useCallback(() => {
        if (equalizerSetsRef.current.value === "default") {
            setEqualizerFilters((prevFilters) => {
                prevFilters.forEach((filter, index) => filter.gain.value = 0);

                return [...prevFilters];            
            });
        } else {
            const set = JSON.parse(equalizerSetsRef.current.value);

            setEqualizerFilters((prevFilters) => {
                prevFilters.forEach((filter, index) => filter.gain.value = set.gains[index]);

                return [...prevFilters];            
            });
        }

        
    }, [equalizerSetsRef.current]);

    return (
        <>
            <select 
                ref={equalizerSetsRef}
                className="equalizer-sets-select"
                onInput={changeEqualizerSet}
            >
                <option value="default" className="equalizer-sets-option">בחר סט</option>
                {
                    equalizerSets.map((set) => {
                        return (
                            <option 
                                key={`equalizer-set-${set.id}`}
                                value={JSON.stringify(set)}
                                className="equalizer-sets-option"
                            >{set.title}</option>
                        );
                    })
                }
            </select>
            <div className="equalizer">                
                
                <div className='equalizer-container'>
                    <hr className='equalizer-zero-line'></hr>
                    { equalizerSliders }
                </div>
            </div> 
        </>
    );
};

export default EqualizerComponent;