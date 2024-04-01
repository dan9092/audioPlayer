import React, { useCallback, useRef, useContext, useState, useEffect, useMemo } from 'react';
import { URLContext } from '../../contexts/audioContext';
import { useWavesurfer, useRegionEvent } from '@wavesurfer/react';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.esm.js';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.esm.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugins/minimap.esm.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import createColormap from 'colormap';
import { v4 as uuidv4 } from 'uuid';
import './audioControls.css';


const formatTime = (seconds) => [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':');

const generateNum = (min, max) => Math.random() * (max - min + 1) + min;

const randomColor = () => {
    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

const AudioControlsComponent = () => {
    // const audio = useContext(audio_context);
    // const file = useContext(FileContext);
    const url = useContext(URLContext);
    const [audio, setAudio] = useState(new Audio());

    /* ----------------------------- WavesSurfer ------------------------------------ */

    const containerRef = useRef(null);
    const timelineRef = useRef(null);

    const plugins = useMemo(() => [
        RegionsPlugin.create({
            dragSelection: true,
        }),
        TimelinePlugin.create({
            container: timelineRef,
            primaryLabelInterval: 1,
            secondaryLabelInterval: 0.5,
            secondaryLabelOpacity: 0.75,
            timeInterval: 0.1,
            style: {
                fontSize: '0.75rem',
                fontWeight: '500',
                margin: '1em 0',
            },
        }),
        ZoomPlugin.create({
            scale: 0.5,
            maxZoom: 250,
        }),
        HoverPlugin.create({
            labelBackground: '#232424',
            labelColor: '#f1f1f1',
            labelSize: 14,
            lineWidth: 2,
        }),
        MinimapPlugin.create({
            height: 20,
            waveColor: '#ddd',
            progressColor: '#999',
        }),
        
    ], []);

    const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
        container: containerRef,
        height: 100,
        waveColor: 'rgb(200, 0, 200)',
        progressColor: 'rgb(100, 0, 100)',
        fillParent: true,
        normalize: true,
        minPxPerSec: 100,
        barWidth: 5,
        barRadius: 4,
        barGap: 3,
        // backend: 'MediaElementWebAudio',
        cursorWidth: 1,
        media: audio,
        splitChannels: true,
        plugins: plugins,
    });

    const [audioContext, setAudioContext] = useState(new AudioContext());
    const [splitter, setSplitter] = useState(audioContext.createChannelSplitter(2));
    const [merger, setMerger] = useState(audioContext.createChannelMerger(2));
    const [leftGain, setLeftGain] = useState(audioContext.createGain());
    const [rightGain, setRightGain] = useState(audioContext.createGain());
    const [source, setSource] = useState(!audio.src && audioContext.createMediaElementSource(audio));
    const [pannerNode, setPannerNode] = useState(audioContext.createStereoPanner());

    const handleWavesurferLoading = useCallback((data) => {
        console.log("loading --> ", data);
    }, [wavesurfer]);

    const onWavesurferReady = useCallback(() => {
        console.log("Wavesurfer is ready");
        wavesurfer.plugins[0] && wavesurfer.plugins[0].enableDragSelection({color: randomColor()});  
    }, [wavesurfer]);

    const handleFinish = useCallback(() => {
        wavesurfer.seekTo(0);
        wavesurfer.play();
    }, [wavesurfer]);

    const volumeRef = useRef(null);
    const [volume, setVolume] = useState(100);    
    const handleVolumeInput = useCallback(() => {
        console.log('Volume changed');
        const newVolume = Number(volumeRef.current.value);

        wavesurfer.setVolume(newVolume);
        setVolume((newVolume * 100).toFixed());
    }, [wavesurfer]);


    const leftVolumeRef = useRef(null);
    const handleLeftVolumeInput = useCallback(() => {
        setLeftGain((prevLeftGain) => {
            prevLeftGain.gain.value = Number(leftVolumeRef.current.value);

            return prevLeftGain;
        });
        console.log('Left volume changed', leftGain.gain.value);
    }, []);

    const rightVolumeRef = useRef(null);  
    const handleRightVolumeInput = useCallback(() => {
        setRightGain((prevRightGain) => {
            prevRightGain.gain.value = Number(rightVolumeRef.current.value);

            return prevRightGain;
        });
        console.log('Right volume changed', rightGain.gain.value);
    }, []);

    const pannerRef = useRef(null);
    const handleSliderInput = useCallback(() => {
        pannerNode.pan.setValueAtTime(Number(pannerRef.current.value), audioContext.currentTime);
    }, []);

    const playbackRateRef = useRef(null);
    const [playbackRate, setPlaybackRate] = useState(1);
    const handlePlaybackRateInput = useCallback(() => {
        console.log('playback rate changed', playbackRateRef.current.value);
        const newPlaybackRate = Number(playbackRateRef.current.value);
        wavesurfer.setPlaybackRate(newPlaybackRate, true); // preserve pitch
        setPlaybackRate(newPlaybackRate);
    }, [wavesurfer]);

    const onPlayPause = useCallback(() => {
        wavesurfer && wavesurfer.playPause();
    }, [wavesurfer]);

    const onStop = useCallback(() => {  
        wavesurfer && wavesurfer.stop();
    }, [wavesurfer]);

    const onSkip = useCallback((seconds) => {
        if (wavesurfer) {
            const newTime = wavesurfer.getCurrentTime() + seconds;

            if (newTime < 0.0) {
                wavesurfer.setTime(0);
            } else if (newTime > wavesurfer.getDuration()) {
                onStop();
            } else {
                wavesurfer.skip(seconds);
            }
        }
    }, [wavesurfer]);

    const channelsDivisionRef = useRef(null);
    const [selectedChannelsDivision, setSelectedChannelsDivision] = useState("none");
    const channelsDivision = [
        {
            value: "none",
            title: "L <- -> R הפרדה",
        },
        {
            value: "both",
            title: "L + R איחוד",
        },
        {
            value: "left",
            title: "L <- -> L שמאל בלבד",
        },
        {
            value: "right",
            title: "R <- -> R ימין בלבד",
        }
    ];

    const disablePanner = useCallback(() => {
        pannerRef.current.disabled = true;
    }, []);

    const enablePanner = useCallback(() => {
        pannerRef.current.disabled = false;
    }, []);

    const handleChannelsDivisionInput = useCallback((e) => {
        console.log('channels division changed');
        
        const wasPlaying = wavesurfer.isPlaying();

        wasPlaying && wavesurfer.pause();
        
        disablePanner();
        setSelectedChannelsDivision(channelsDivisionRef.current.value);
        
        leftGain.disconnect();
        leftGain.connect(merger, 0, 0);
        rightGain.disconnect();
        rightGain.connect(merger, 0, 1);

        switch (channelsDivisionRef.current.value) {
            case "none":
                enablePanner();
                pannerNode.pan.setValueAtTime(0, audioContext.currentTime);
                pannerRef.current.value = 0;
                break;
            case "both": {
                leftGain.disconnect();
                leftGain.connect(merger, 0, 0);
                leftGain.connect(merger, 0, 1);
                rightGain.disconnect();
                rightGain.connect(merger, 0, 0);
                rightGain.connect(merger, 0, 1);
                pannerRef.current.value = 0;
                break;
            }
            case "left": {
                rightGain.disconnect();
                pannerRef.current.value = -1;
                
                break;
            }
            case "right": {
                leftGain.disconnect();
                pannerRef.current.value = 1;

                break;
            }
            default: {
                break;
            }
        }

        wasPlaying && wavesurfer.play();
    }, [wavesurfer]);

    /* ----------------------------- Regions ------------------------------------ */

    const loopRegionsRef = useRef(null); 
    const [regions, setRegions] = useState([]);
    const [orderedRegions, setOrderedRegions] = useState([]);

    const findRegionLocation = useMemo(() => (region, regionsArray) => {
        let left = 0;
        let right = regionsArray.length - 1;
        let middle = 0;
        
        while (left <= right) {
            middle = Math.floor((left + right) / 2);

            if (regionsArray[middle].id === region.id) return middle;

            if (regionsArray[middle] && regionsArray[middle].start < region.start) {
                left = middle + 1;
            } else {
                right = middle - 1;
            }
        }

        return middle;
    }, []);

    const handleRegionCreate = useCallback((region) => {
        console.log("region-created --> region:", region);
        setRegions((prevRegions) => [...prevRegions, region]);;
    }, []);

    const handleRegionRemove = useCallback((region) => {
        console.log("region-removed --> region:", region);
        setRegions((prevRegions) => prevRegions.filter((r) => r.id.localeCompare(region.id) !== 0));
    }, []);

    const handleRegionUpdateEnd = useCallback((region) => {
        console.log("region-update-end --> region:", region);
        setRegions((prevRegions) => [...prevRegions.filter((r) => r.id.localeCompare(region.id) !== 0), region]);
    }, []);

    const handleRegionClick = useCallback((region, event) => {
        console.log("region-clicked --> ", region);
        event.stopPropagation();
        region.play();
    }, []);

    const handleRegionOut = useCallback((region) => {        
        console.log('region-out -->', region);

        if (loopRegionsRef.current.checked) {
            region.play();
        } else {
            console.log('handleRegionOut --> orderedRegions', orderedRegions);
            const nextIndex = findRegionLocation(region, orderedRegions) + 1;
            console.log('handleRegionOut --> nextIndex', nextIndex);
            const nextRegion = orderedRegions[nextIndex];
            console.log('handleRegionOut --> nextRegion', nextRegion);

            if (nextRegion) {
                wavesurfer.plugins[0].unAll();
                nextRegion.play();
                registerRegionPluginEvents();
            }
        }        
    }, [wavesurfer, orderedRegions]);

    const handleRegionDoubleClick = useCallback((region, event) => {
        console.log("region-doubleClicked --> ", region);
        event.stopPropagation();
        region.remove();
    }, []);    

    const registerRegionPluginEvents = useCallback(() => {
        if (wavesurfer && wavesurfer.plugins[0]) {
            wavesurfer.plugins[0].unAll();

            wavesurfer.plugins[0].on("region-created", handleRegionCreate);

            wavesurfer.plugins[0].on("region-removed", handleRegionRemove);

            wavesurfer.plugins[0].on("region-clicked", handleRegionClick);

            wavesurfer.plugins[0].on('region-double-clicked', handleRegionDoubleClick);

            wavesurfer.plugins[0].on("region-updated", handleRegionUpdateEnd); 

            wavesurfer.plugins[0].on("region-out", handleRegionOut);  
        }
    }, [wavesurfer, orderedRegions]);

    /* ----------------------------- Equalizer ------------------------------------ */
    
    const [equalizerFilters, setEqualizerFilters] = useState([]);

    const createEqualizer = useCallback(() => {
        const equalizerBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

        setEqualizerFilters(equalizerBands.map((band) => {
            const filter = audioContext.createBiquadFilter();

            filter.type = band <= 32 ? 'lowshelf' : band >= 16000 ? 'highshelf' : 'peaking';
            filter.gain.value = 0;
            filter.Q.value = 1; // resonance
            filter.frequency.value = band; // the cut-off frequency

            return filter;
        }));
    }, []);       

    const handleEqualizerInput = (event, filter) => {
        filter.gain.value = event.target.value;  
    }

    const resetEqualizer = () => {
        setEqualizerFilters((prevFilters) => {
            return prevFilters.map((filter) => {
                filter.gain.value = 0;

                return filter;
            });
        });
    }

   /* ----------------------------- useEffects ------------------------------------ */

    useEffect(() => {
        source.connect(pannerNode);
        pannerNode.connect(splitter);
        splitter.connect(leftGain, 0);
        splitter.connect(rightGain, 1);
        leftGain.connect(merger, 0, 0);
        rightGain.connect(merger, 0, 1);
        merger.connect(audioContext.destination);
    }, [audio, audioContext])

   useEffect(() => {
    if (!wavesurfer) return;
    console.log("started");
    registerRegionPluginEvents();

    wavesurfer.markers && wavesurfer.clearMarkers();

    wavesurfer.on("ready", onWavesurferReady);

    wavesurfer.on("loading", handleWavesurferLoading);

    wavesurfer.on('finish', handleFinish);

    wavesurfer.registerPlugin(
        SpectrogramPlugin.create({
            labels: true,
            height: 200,
            fftSamples: 1024,
            splitChannels: true,
            colorMap: createColormap({colormap: 'velocity-blue', nshades: 256, format: 'float'}),
        })
    );

    console.log("wavesurfer spectrogram registered");
    

    return () => {
        wavesurfer.destroy();
    }
    }, [url, wavesurfer])

    useEffect(() => {
        setOrderedRegions(() => {
            const regionsArray = [...regions];

            regionsArray.sort((prev, curr) => prev.start - curr.start);

            return regionsArray;
        });        
    }, [regions])

    useEffect(() => {
        console.log('ordered regions', orderedRegions);
        registerRegionPluginEvents();
    }, [orderedRegions])

    useEffect(() => {
        console.log("url is ", url);
        audio.setAttribute('src', url);
        wavesurfer && wavesurfer.setMediaElement(audio);
    }, [audio, url, wavesurfer]);

    useEffect(() => {
        const equalizer = equalizerFilters.reduce((prev, curr) => {
            prev.connect(curr);
        
            return curr;
        }, source);

        console.log(equalizer);

        equalizer.connect(merger);
    }, [equalizerFilters])

    useEffect(() => {
        createEqualizer();
    }, [])

    return (
        <>
            <div className="wavesurfer-container" ref={containerRef}>
            </div>
            <div className="timeline-container" ref={timelineRef}></div>
            <div className='loop-regions-checkbox-container'>
                <label htmlFor='loop-regions-checkbox'>Loop</label>
                <input type='checkbox' id='loop-regions-checkbox' ref={loopRegionsRef}></input>
            </div>
            <div className="audio-controls-with-equalizer">
                <div className="controls">
                    <p>Audio: {url}</p>
                    <p>Current time: {formatTime(currentTime)} / {wavesurfer ? formatTime(wavesurfer.getDuration()) : '00:00'}</p>
                    <div className='controls-container'>
                        <div className='control-buttons-container'>
                            <button onClick={onPlayPause} className='play-pause-button button'>
                                {isPlaying ? 'Pause' : 'Play'}
                            </button>
                            <button onClick={onStop} className='stop-button button'>
                                stop
                            </button>
                            <button onClick={() => onSkip(-5)} className='skip-button button'>
                                Back 5s
                            </button>
                            <button onClick={() => onSkip(5)} className='skip-button button'>
                                Forward 5s
                            </button>
                        </div>
                        <div className='speed-container'>
                            <label htmlFor='speed-input'>Speed</label>
                            <input 
                                id='speed-input'
                                type='range'
                                data-action='speed'
                                ref={playbackRateRef}
                                onInput={handlePlaybackRateInput}   
                                min={0.25}
                                max={4}
                                step={0.05}
                                defaultValue={1}
                                className='volume-input'
                            />
                            <span>X{playbackRate}</span>
                        </div>
                        <div className='volume-container'>
                            <label htmlFor='volume-input'>Volume</label>
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
                            <span>{volume}%</span>
                        </div>
                        <p>Channels:</p>
                        <div className='volume-container'>
                            <label htmlFor='left-volume-input'>L</label>
                            <input 
                                id='left-volume-input'
                                type='range'
                                data-action='leftVolume'
                                ref={leftVolumeRef}
                                onInput={handleLeftVolumeInput}    
                                min={0}
                                max={1}
                                step={0.01}
                                className='volume-input'
                            />
                            <span>{(leftGain.gain.value * 100).toFixed()}%</span>
                        </div>
                        <div className='volume-container'>
                            <label htmlFor='right-volume-input'>R</label>
                            <input 
                                id='right-volume-input'
                                type='range'
                                data-action='rightVolume'
                                ref={rightVolumeRef}
                                onInput={handleRightVolumeInput}   
                                min={0}
                                max={1}
                                step={0.01}
                                className='volume-input'
                            />
                            <span>{(rightGain.gain.value * 100).toFixed()}%</span>
                        </div>
                        <div className='left-right-panner-container'>
                            <label>L</label>
                            <input 
                                id='left-right-panner-input'
                                type='range'
                                data-action='pan'
                                min={-1}
                                max={1}
                                step={0.2}
                                defaultValue={0}
                                ref={pannerRef}
                                onInput={handleSliderInput}    
                            />
                            <label>R</label>
                        </div>
                    </div>
                    <div className='channels-division-container'>
                        <select
                            className='channels-division-select'
                            ref={channelsDivisionRef}
                            onInput={handleChannelsDivisionInput}
                            value={selectedChannelsDivision}
                        >
                        {
                            channelsDivision.map((item) => {
                                return (
                                    <option key={uuidv4()} value={item.value}>{item.title}</option>
                                );
                            })
                        }   
                        </select>
                    </div>
                </div>
                <div className="equalizer">
                    <div className="equalizer-buttons-container">
                        <button className='reset-equalizers-button' onClick={resetEqualizer}>Reset</button>
                    </div>
                    <div className='equalizer-container'>
                        <hr className='equalizer-zero-line'></hr>
                        {
                            equalizerFilters.map((filter) => {
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
                            })
                        }
                    </div>
                </div>
            </div> 
        </>
                
    )
};

export default AudioControlsComponent;