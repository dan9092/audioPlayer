import React, { useCallback, useRef, useContext, useState, useEffect, useMemo, memo } from 'react';
import { URLContext } from '../../contexts/audioContext';
import WaveSurfer from 'wavesurfer.js';
import { useWavesurfer, useRegionEvent } from '@wavesurfer/react';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.esm.js';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.esm.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugins/minimap.esm.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import createColormap from 'colormap';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faBackward, faBackwardStep, faForward, faForwardStep, faGauge, faHeadphones, faPause, faPlay, faRepeat, faStop, faVolumeHigh, faVolumeLow, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import './playerControls.css';


const formatTime = (seconds) => [seconds / 3600, seconds / 60 % 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':');

const generateNum = (min, max) => Math.random() * (max - min + 1) + min;

const randomColor = () => {
    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}

const PlayerControlsComponent = () => {
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
            primaryLabelInterval: 1,
            secondaryLabelInterval: 0.5,
            secondaryLabelOpacity: 0.75,
            // timeIntreval: 10,
            style: {
                fontSize: '0.75rem',
                fontWeight: '500',
                margin: '1em 0',
            },
        }),
        // ZoomPlugin.create({
        //     scale: 0.5,
        //     maxZoom: 250,
        // }),
        // HoverPlugin.create({
        //     labelBackground: '#232424',
        //     labelColor: '#f1f1f1',
        //     labelSize: 14,
        //     lineWidth: 2,
        // }),
        MinimapPlugin.create({
            height: 20,
            waveColor: '#ddd',
            progressColor: '#999',
        }),
        
    ], []);

    const [wavesurfer, setWavesurfer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isMultipleChannels, setIsMultipleChannels] = useState(false);
    const [spectrogram, setSpectrogram] = useState(false);

    const handleWavesurferLoading = useCallback((data) => {
        console.log("loading --> ", data);
    }, [wavesurfer]);

    const onWavesurferReady = useCallback(() => {
        console.log("Wavesurfer is ready");
        wavesurfer.plugins[0] && wavesurfer.plugins[0].enableDragSelection({color: randomColor()}); 
        setCurrentTime(wavesurfer.getCurrentTime());
        setIsPlaying(wavesurfer.isPlaying()); 
    }, [wavesurfer]);

    const handleFinish = useCallback(() => {
        wavesurfer.seekTo(0);
        wavesurfer.play();
    }, [wavesurfer]);

    const onWavesurferDestroy = useCallback(() => {
        wavesurfer.unAll();
        wavesurfer.destroy();
    }, [wavesurfer]);

    const volumeRef = useRef(null);
    const [volume, setVolume] = useState(100);
    const [volumeIcon, setVolumeIcon] = useState(faVolumeHigh);

    const getVolumeIcon = useCallback((value) => {
        if (value == 0) 
            return faVolumeXmark;

        if (value < 50) 
            return faVolumeLow;
        
        return faVolumeHigh;
    }, []); 

    const handleVolumeInput = useCallback(() => {
        const newVolume = Number(volumeRef.current.value);
        const volumeLabel = (newVolume * 100).toFixed();

        console.log('Volume changed', newVolume);
        
        setVolume(volumeLabel);
        setVolumeIcon(getVolumeIcon(volumeLabel));        
        wavesurfer.setVolume(newVolume);
    }, [wavesurfer]);

    const toggleMuteWavesurfer = useCallback(() => {
        const shouldMute = !wavesurfer.getMuted();
        console.log('volume icon', volumeIcon);
        setVolumeIcon(() => {
            return shouldMute ? faVolumeXmark : getVolumeIcon(volumeRef.current.value * 100);
        });
        wavesurfer.setMuted(shouldMute);
    }, [wavesurfer]);


    const leftVolumeRef = useRef(null);
    const [leftVolume, setLeftVolume] = useState(100);
    const [leftVolumeIcon, setleftVolumeIcon] = useState(faVolumeHigh); 
    const handleLeftVolumeInput = useCallback(() => {
        const newVolume = Number(leftVolumeRef.current.value);
        const volumeLabel = (newVolume * 100).toFixed();

        setLeftGain((prevLeftGain) => {
            prevLeftGain.gain.value = newVolume;

            return prevLeftGain;
        });

        setLeftVolume(volumeLabel);
        setleftVolumeIcon(getVolumeIcon(volumeLabel));
        console.log('Left volume changed', leftGain.gain.value);
    }, []);

    const toggleMuteLeft = useCallback(() => {
        const shouldMute = JSON.stringify(leftVolumeIcon) !== JSON.stringify(faVolumeXmark);

        setleftVolumeIcon(() => {
            return shouldMute ? faVolumeXmark : getVolumeIcon(leftVolumeRef.current.value * 100);
        });

        setLeftGain((prevLeftGain) => {
            prevLeftGain.gain.value = shouldMute ? 0 : Number(leftVolumeRef.current.value);

            return prevLeftGain;
        });
    }, [leftVolumeIcon]);

    const rightVolumeRef = useRef(null);  
    const [rightVolume, setRightVolume] = useState(100);
    const [rightVolumeIcon, setRightVolumeIcon] = useState(faVolumeHigh);
    const handleRightVolumeInput = useCallback(() => {
        const newVolume = Number(rightVolumeRef.current.value);
        const volumeLabel = (newVolume * 100).toFixed();

        setRightGain((prevRightGain) => {
            prevRightGain.gain.value = newVolume;

            return prevRightGain;
        });

        setRightVolume(volumeLabel);
        setRightVolumeIcon(getVolumeIcon(volumeLabel));
        console.log('Right volume changed', rightGain.gain.value);
    }, []);

    const toggleMuteRight = useCallback(() => {
        const shouldMute = JSON.stringify(rightVolumeIcon) !== JSON.stringify(faVolumeXmark);

        setRightVolumeIcon(() => {
            return shouldMute ? faVolumeXmark : getVolumeIcon(rightVolumeRef.current.value * 100);
        });

        setRightGain((prevRightGain) => {
            prevRightGain.gain.value = shouldMute ? 0 : Number(rightVolumeRef.current.value);

            return prevRightGain;
        });
    }, [rightVolumeIcon]);

    const playbackRateRef = useRef(null);
    const [playbackRate, setPlaybackRate] = useState(1);
    const playbackRates = [0.25, 0.50, 0.55, 0.65, 0.75, 0.85, 1, 1.30, 1.50, 1.70, 2];
    const handlePlaybackRateInput = useCallback((event) => {
        const newPlaybackRate = playbackRates[event.target.valueAsNumber].toFixed(2);

        console.log('playback rate changed', newPlaybackRate);
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

    /* ----------------------------- Audio ------------------------------------ */

    const [audioContext, setAudioContext] = useState(new AudioContext());
    const [splitter, setSplitter] = useState(audioContext.createChannelSplitter(2));
    const [merger, setMerger] = useState(audioContext.createChannelMerger(2));
    const [leftGain, setLeftGain] = useState(audioContext.createGain());
    const [rightGain, setRightGain] = useState(audioContext.createGain());
    const [source, setSource] = useState(!audio.src && audioContext.createMediaElementSource(audio));
    const [pannerNode, setPannerNode] = useState(audioContext.createStereoPanner());
    const [isTopLeftActive, setIsTopLeftActive] = useState(false);
    const [isTopRightActive, setIsTopRightActive] = useState(false);
    const [isBottomLeftActive, setIsBottomLeftActive] = useState(false);
    const [isBottomRightActive, setIsBottomRightActive] = useState(false);

    const setDufaultAudioDivision = useCallback(() => {
        source.connect(pannerNode);
        pannerNode.connect(splitter);
        splitter.connect(leftGain, 0);
        splitter.connect(rightGain, 1);
        leftGain.connect(merger, 0, 0);
        rightGain.connect(merger, 0, 1);
        merger.connect(audioContext.destination);
    }, []);

    /* ----------------------------- Regions ------------------------------------ */

    const [regions, setRegions] = useState([]);
    const [orderedRegions, setOrderedRegions] = useState([]);
    const [loopRegions, setLoopRegions] = useState(false);
    const loopRegionsRef = useRef(null);

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
        console.log('loop regions state -->', loopRegionsRef.current.checked);

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

    const equalizerSliders = equalizerFilters.map((filter) => {
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

   /* ----------------------------- useEffects ------------------------------------ */

   useEffect(() => {
        if (!containerRef.current) return;

        const ws = WaveSurfer.create({
            container: containerRef.current,
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
            splitChannels: isMultipleChannels,
            plugins: plugins,
        });
        
        setWavesurfer(ws);

        return () => {
            ws.destroy();
        }
    }, [isMultipleChannels, spectrogram])

    useEffect(() => {
        setDufaultAudioDivision();
        
    }, [audio, audioContext])

   useEffect(() => {
    if (!wavesurfer) return;

    registerRegionPluginEvents();

    wavesurfer.markers && wavesurfer.clearMarkers();

    wavesurfer.on("ready", onWavesurferReady);

    wavesurfer.on("loading", handleWavesurferLoading);

    wavesurfer.on("decode", () => {
        const data = wavesurfer.getDecodedData();
        setIsMultipleChannels(data.numberOfChannels > 1);
    });

    wavesurfer.on("play", () => setIsPlaying(true));

    wavesurfer.on("pause", () => setIsPlaying(false));

    wavesurfer.on("audioprocess", (time) => setCurrentTime(time));

    wavesurfer.on('finish', handleFinish);

    wavesurfer.on('destroy', onWavesurferDestroy);
    
    if (spectrogram) {
        wavesurfer.registerPlugin(
            SpectrogramPlugin.create({
                labels: true,
                height: 200,
                fftSamples: 1024,
                splitChannels: isMultipleChannels,
                colorMap: createColormap({colormap: 'velocity-blue', nshades: 256, format: 'float'}),
            })
        );

        console.log("wavesurfer spectrogram registered");
    }

    }, [url, wavesurfer, spectrogram])

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

        equalizer.connect(merger);
    }, [equalizerFilters])

    useEffect(() => {
        createEqualizer();
    }, [])

    useEffect(() => {
        leftGain.disconnect();
        leftGain.connect(merger, 0, 0);
        rightGain.disconnect();
        rightGain.connect(merger, 0, 1);

        const all = isTopLeftActive && isTopRightActive && isBottomLeftActive && isBottomRightActive;
        const topStream = isTopLeftActive && isTopRightActive && !isBottomLeftActive && !isBottomRightActive;
        const bottomStream = isBottomLeftActive && isBottomRightActive && !isTopLeftActive && !isTopRightActive;
        const leftSide = isTopLeftActive && isBottomLeftActive && !isTopRightActive && !isBottomRightActive;
        const rightSide = isTopRightActive && isBottomRightActive && !isTopLeftActive && !isBottomLeftActive;
        const diagonals = isTopRightActive && isBottomLeftActive && !isTopLeftActive && !isBottomRightActive;

        if (all) {
            leftGain.connect(merger, 0, 1);
            rightGain.connect(merger, 0, 1);
        } else if (topStream) {
            rightGain.gain.value = 0;
        } else if (bottomStream) {
            leftGain.gain.value = 0;
        } else if (leftSide) {
            setPannerNode((prevPannerNode) => {
                prevPannerNode.pan.setValueAtTime(1, audioContext.currentTime);

                return prevPannerNode;
            })
        } else if (rightSide) {
            pannerNode.pan.setValueAtTime(-1, audioContext.currentTime);
        } else if (diagonals) {
            pannerNode.pan.setValueAtTime(0, audioContext.currentTime);
        }

    }, [isTopLeftActive, isTopRightActive, isBottomLeftActive, isBottomRightActive])

    return (
        <>
            <section className='top-section'>
                <div className="wavesurfer-container" ref={containerRef} style={{maxWidth: "85%"}}></div>
                <div className='top-volumes'>
                    <div className='volume-container'>
                        <FontAwesomeIcon 
                            icon={leftVolumeIcon}
                            className='fa-sm volume-icon'
                            onClick={toggleMuteLeft}
                        />
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
                        <span className='volume-value'>{leftVolume}%</span>
                    </div>
                    <div className='volume-container'>
                        <FontAwesomeIcon 
                            icon={rightVolumeIcon}
                            className='fa-sm volume-icon'
                            onClick={toggleMuteRight}
                        />
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
                        <span className='volume-value'>{rightVolume}%</span>
                    </div>
                </div>  
            </section>                
            <div className='wavesurfer-data-container'>
                <p>Current time: {formatTime(currentTime)} / {wavesurfer ? formatTime(wavesurfer.getDuration()) : '00:00'}</p>
                <div className='checkbox-container'>
                    <label htmlFor='loop-regions-checkbox'>
                        <FontAwesomeIcon 
                            icon={faRepeat}
                            className={regions.length === 0 ? 'fa-sm button disabled' : 'fa-sm button'}
                            color={loopRegions ? 'orange' : 'black'}
                        />
                    </label>
                    <input 
                        type='checkbox'
                        id='loop-regions-checkbox'
                        ref={loopRegionsRef}
                        onInput={(e) => setLoopRegions(e.currentTarget.checked)} 
                        style={{display: "none"}}
                    />
                </div>
                <div className='checkbox-container'>
                    <label htmlFor='spectrogram-checkbox'>Spectrogram</label>
                    <input 
                        type='checkbox'
                        id='spectrogram-checkbox'
                        onInput={(e) => setSpectrogram(e.currentTarget.checked)}
                    />
                </div>
            </div>
            
            <div className="audio-controls-with-equalizer">
                <div className="controls">
                    <div className='controls-container'>
                        <div className='control-buttons-container'>
                            <button onClick={() => onSkip(-5)} className='skip-button button'>
                                <FontAwesomeIcon icon={faBackward} className='fa-xl' />
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
                                <FontAwesomeIcon icon={faForward} className='fa-xl' />
                            </button>
                            <button onClick={onStop} className='stop-button button'>
                                <FontAwesomeIcon icon={faStop} className='fa-xl' />
                            </button>
                        </div>
                        <div className='speed-container'>
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
                        </div>
                        <div className='volume-container'>
                            <label htmlFor='volume-input'>
                                <FontAwesomeIcon 
                                    icon={volumeIcon}
                                    className='fa-sm volume-icon'
                                    onClick={toggleMuteWavesurfer} />
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
                        </div>
                        {/* <p>Channels:</p>
                        <div className='left-right-panner-container'>
                            <FontAwesomeIcon 
                                icon={faHeadphones}
                                className='fa-sm headphones-icon' />
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
                        </div> */}
                    </div>
                    {/* <div className='channels-division-container'>
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
                    </div> */}
                    <div className='channels-squares'>
                        <div className='stream-squares-container'>
                            <div 
                                className="square"
                                onClick={() => setIsTopLeftActive((prevState) => !prevState)}
                                style={{backgroundColor: isTopLeftActive ? "lightblue" : "white"}}
                            ></div>
                            <div 
                                className="square"
                                onClick={() => setIsTopRightActive((prevState) => !prevState)}
                                style={{backgroundColor: isTopRightActive ? "lightblue" : "white"}}
                            ></div>
                        </div>
                        <div className='stream-squares-container'>
                            <div 
                                className="square"
                                onClick={() => setIsBottomLeftActive((prevState) => !prevState)}
                                style={{backgroundColor: isBottomLeftActive ? "lightblue" : "white"}}
                            ></div>
                            <div 
                                className="square"
                                onClick={() => setIsBottomRightActive((prevState) => !prevState)}
                                style={{backgroundColor: isBottomRightActive ? "lightblue" : "white"}}
                            ></div>
                        </div>
                    </div>
                </div> 
                <div className="equalizer">
                    <div className="equalizer-buttons-container">
                        <button className='reset-equalizers-button' onClick={resetEqualizer}>Reset</button>
                    </div>
                    <div className='equalizer-container'>
                        <hr className='equalizer-zero-line'></hr>
                        { equalizerSliders }
                    </div>
                </div> 
            </div> 
        </>
                
    )
};

export default PlayerControlsComponent;