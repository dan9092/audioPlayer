import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Multitrack from './multitrack.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faBackward, faBackwardFast, faBackwardStep, faForward, faForwardFast, faForwardStep, faGauge, faHeadphones, faMagnifyingGlass, faMagnifyingGlassPlus, faPause, faPlay, faRepeat, faStop, faVolumeHigh, faVolumeLow, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import VolumeSliderComponent from "../volumeSlider/VolumeSliderComponent.jsx";
import './MultitrackComponent.css';


const formatTime = (seconds) => [seconds / 3600, seconds / 60 % 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':');

const generateNum = (min, max) => Math.random() * (max - min + 1) + min;

const randomColor = () => {
    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

const MultitrackComponent = () => {
    const [multitrack, setMultitrack] = useState(null);
    const multitrackContainerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const zoomRef = useRef(null);

    const onPlayPause = useCallback(() => {
        multitrack.isPlaying() ? multitrack.pause() : multitrack.play();
        setIsPlaying(multitrack.isPlaying());
    }, [multitrack])

    const onStop = useCallback(() => {
        multitrack.pause();
        multitrack.setTime(0);
        setIsPlaying(false);
    }, [multitrack])

    const onSkip = useCallback((seconds) => {
        const newTime = multitrack.getCurrentTime() + seconds;

        if (newTime < 0.0) {
            multitrack.setTime(0);
        } else {
            multitrack.setTime(newTime);
        }
        
    }, [multitrack]);

    const getVolumeIcon = useCallback((value) => {
        if (value == 0) 
            return faVolumeXmark;

        if (value <= 50) 
            return faVolumeLow;
        
        return faVolumeHigh;
    }, []); 

    const muteTrack = useCallback((trackIndex) => {
        if (!multitrack) return;

        if (trackIndex === null) {
            multitrack.tracks.forEach((_, trackIndex) => multitrack.setTrackVolume(trackIndex, 0)); 
        } else {
            multitrack.setTrackVolume(trackIndex, 0);
        }
    }, [multitrack]);

    const unmuteTrack = useCallback((trackIndex, volume) => {
        if (!multitrack) return;

        if (trackIndex === null) {
            multitrack.tracks.forEach((_, trackIndex) => multitrack.setTrackVolume(trackIndex, volume)); 
        } else {
            multitrack.setTrackVolume(trackIndex, volume);
        }
    }, [multitrack]);

    const handleTrackVolumeInput = useCallback((e, trackIndex) => {
        if (trackIndex === null) {
            multitrack.tracks.forEach((_, index) => multitrack.setTrackVolume(index, e.currentTarget.valueAsNumber));
        } else {
            multitrack.setTrackVolume(trackIndex, e.currentTarget.valueAsNumber);
        }
    }, [multitrack]);

    const handleZoomInput = useCallback(() => {
        multitrack.zoom(zoomRef.current.valueAsNumber);
    }, [multitrack])

    const getMultitrackDuration = useCallback(() => {
        if (!multitrack || !multitrack.wavesurfers) return 0;

        const tracksDurations = multitrack.wavesurfers.map((ws) => ws.getDuration());

        return tracksDurations.length === 0 ? 0 : Math.max(...tracksDurations);
    }, [multitrack]);

    useEffect(() => {    
        if (!multitrackContainerRef.current) return;
        
        if (multitrackContainerRef.current.children.length === 0) {
            const multiTrack = Multitrack.create([
                {
                    id: 0,
                    url: './audio/single-channel.aac',
                    startPosition: 3,
                    draggable: false,
                    volume: 1,
                    intro: {
                        time: 0,
                        label: 'דובר 1',
                    },
                    options: {
                        barWidth: 5,
                        barRadius: 4,
                        barGap: 3,
                        plugins: [
                            RegionsPlugin.create(),
                        ]
                    }
                },
                {
                    id: 1,
                    url: './audio/audio5.ogg',
                    startPosition: 30,
                    draggable: false,
                    volume: 1,
                    intro: {
                        time: 0,
                        label: 'דובר 2',
                    },
                    options: {
                        barWidth: 3,
                        barRadius: 4,
                        barGap: 3,
                        plugins: [
                            RegionsPlugin.create(),
                        ]
                    }
                },
                {
                    id: 2,
                    url: './audio/speaker.mp3',
                    startPosition: 90,
                    draggable: false,
                    volume: 1,
                    intro: {
                        time: 0,
                        label: 'דובר 3',
                    },
                    options: {
                        barWidth: 3,
                        barRadius: 4,
                        barGap: 3,
                        plugins: [
                            RegionsPlugin.create(),
                        ]
                    }
                },
            ],
            {
                container: multitrackContainerRef.current,
                minPxPerSec: 10,
                trackBorderColor: '#7C7C7C',
                rightButtonDrag: false,
                timelineOptions: {
                    primaryLabelInterval: 1,
                    secondaryLabelInterval: 1,
                    formatTimeCallback: ((seconds) => formatTime(seconds)),
                    style: {
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        margin: '1em 0',
                    },
                }
            });

            setMultitrack(multiTrack);
        }
    }, [])

    useEffect(() => {
        if (!multitrack) return;

        multitrack.once('canplay', () => {
            multitrack.tracks.forEach((track, trackIndex) => {
                const color = randomColor();
                const duration = multitrack.wavesurfers[trackIndex].getDuration();

                track.options.plugins && track.options.plugins[0].addRegion({
                    start: 0,
                    end: duration,
                    color: color,
                    drag: false,
                    resize: false,
                })
            })
        });
    }, [multitrack])

    return (
        <>
            <section className="top-section">
                <div ref={multitrackContainerRef} style={{maxWidth: '85%'}}></div>
                <div className="top-volumes">
                    {
                        multitrack && multitrack.tracks.map((track, index) => {
                            if (typeof(track.id) !== 'number') return;
                            
                            return (
                                <div className='speaker-container' key={`track_${track.id}`}>
                                    <p>{track.intro.label}</p>
                                    <VolumeSliderComponent 
                                        trackIndex={index}
                                        handleVolumeInput={handleTrackVolumeInput}
                                        mute={muteTrack}
                                        unmute={unmuteTrack}
                                        getVolumeIcon={getVolumeIcon}                                        
                                    />
                                </div>
                                
                            );
                        })
                    }
                </div>
            </section>
            <div>   
                <div className='controls-container'>
                    <p className="time">{formatTime(currentTime)} / { formatTime(getMultitrackDuration()) }</p>
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
                    <div className="more-controls">
                        <VolumeSliderComponent 
                            handleVolumeInput={handleTrackVolumeInput}
                            mute={muteTrack}
                            unmute={unmuteTrack}
                            getVolumeIcon={getVolumeIcon}                                        
                        />
                        <div className='volume-container'>
                            <label htmlFor='volume-input'>
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
                    </div>
                </div>
                {/* <div className='speed-container'>
                    <label htmlFor='speed-input'>
                        <FontAwesomeIcon icon={faGauge} className='fa-sm' />
                    </label>
                    <input 
                        id='speed-input'
                        type='range'
                        data-action='speed'
                        ref={playbackRateRef}
                        onInput={(e) => handlePlaybackRateInput(e)}   
                        min={0}
                        max={playbackRates.length - 1}
                        step={1}
                        defaultValue={6}
                        className='volume-input'
                    />
                    <span>X{playbackRate}</span>
                </div> */}
                {/* <div className='volume-container'>
                    <label htmlFor='volume-input'>
                        <FontAwesomeIcon 
                            icon={volumeIcon}
                            className='fa-sm volume-icon'
                            onClick={toggleMute} />
                    </label>
                    <input 
                        id='volume-input'
                        type='range'
                        data-action='volume'
                        ref={volumeRef}
                        onInput={handleVolumeInput}   
                        min={0}
                        max={1}
                        step={0.01}
                        defaultValue={1}
                        className='volume-input'
                    />
                    <span className='volume-value'>{volume}%</span>
                </div> */}
            </div>
        </>
    )
}

export default MultitrackComponent;
