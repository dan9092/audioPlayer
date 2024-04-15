import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import Multitrack from './multitrack.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faBackward, faBackwardFast, faBackwardStep, faForward, faForwardFast, faForwardStep, faGauge, faHeadphones, faMagnifyingGlass, faMagnifyingGlassPlus, faPause, faPlay, faRepeat, faStop, faVolumeHigh, faVolumeLow, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { v4 as uuidv4 } from 'uuid';
import VolumeSliderComponent from "../volumeSlider/VolumeSliderComponent.jsx";
import './MultitrackComponent.css';
import ZoomSliderComponent from "../ZoomSliderComponent/ZoomSliderComponent.jsx";
import { getVolumeIcon } from "../../utils.js";

const formatTime = (seconds) => [seconds / 3600, seconds / 60 % 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':');

const generateNum = (min, max) => Math.random() * (max - min + 1) + min;

const randomColor = () => {
    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

const MultitrackComponent = forwardRef((props, ref) => {
    const { 
        shouldDisplay,
        multitrack,
        setMultitrack, 
        setIsPlaying,
        setDuration,
        setCurrentTime,
    } = props;

    const multitrackContainerRef = useRef(null);
    const zoomRef = useRef(null);

    const onPlayPause = useCallback(() => {
        multitrack.isPlaying() ? multitrack.pause() : multitrack.play();
        setIsPlaying(multitrack.isPlaying());
    }, [multitrack])

    const onStop = useCallback(() => {
        multitrack.pause();
        multitrack.setTime(0);
        setCurrentTime(0);
        setIsPlaying(false);
    }, [multitrack])

    const onSkip = useCallback((seconds) => {
        const newTime = multitrack.getCurrentTime() + seconds;

        if (newTime < 0.0) {
            multitrack.setTime(0);
        } else {
            multitrack.setTime(newTime);
        }

        setCurrentTime(multitrack.getCurrentTime());
        
    }, [multitrack]);

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

    const getMultitrackDuration = useCallback((multiTrack) => {
        if (!multiTrack || !multiTrack.wavesurfers) return 0;

        const tracksDurations = multiTrack.wavesurfers.map((ws) => ws.getDuration());

        return tracksDurations.length === 0 ? 0 : Math.max(...tracksDurations);
    }, []);

    useImperativeHandle(ref, () => {
        return ({
            zoomRef,
            onPlayPause,
            onStop,
            onSkip,
            muteTrack,
            unmuteTrack,
            handleTrackVolumeInput,
            handleZoomInput,
            getMultitrackDuration
        });
    }, [zoomRef,
        onPlayPause,
        onStop,
        onSkip,
        muteTrack,
        unmuteTrack,
        handleTrackVolumeInput,
        handleZoomInput,
        getMultitrackDuration])

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
            setDuration(getMultitrackDuration(multitrack));
            setCurrentTime(multitrack.getCurrentTime());

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

    useEffect(() => {
        if (multitrack && multitrack.isPlaying()) {
            setTimeout(() => {
                setCurrentTime(multitrack.getCurrentTime());   
            }, 1000);
        }        
    })

    return (
        <>
            <section className="multitrack-section" style={{ display: shouldDisplay ? "block" : "none" }}>
                <div ref={multitrackContainerRef}></div>
            </section>
            <section className="multitrack-side-panel" style={{ display: shouldDisplay ? "flex" : "none" }}>
                <div className="multitrack-top-volumes">
                    {
                        multitrack && multitrack.tracks.map((track, index) => {
                            if (typeof(track.id) !== 'number') return;
                            
                            return (
                                <div className='track-details-container' key={`track_${track.id}`}>
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
        </>
    )
}, []);

export default MultitrackComponent;
