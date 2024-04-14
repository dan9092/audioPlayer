import React, { useCallback, useRef, useContext, useState, useEffect, useMemo, memo } from 'react';
import { URLContext } from '../../contexts/Context';
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
import { faMinus, faList, faVolumeHigh, faVolumeLow, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import './playerControls.css';
import { formatTime, randomColor, getVolumeIcon } from '../../utils';
import ControlsComponent from '../ControlsComponent/ControlsComponent';
import MultitrackComponent from '../multitrack/MultitrackComponent';
import { AudiosContext } from '../../contexts/Context';

const PlayerControlsComponent = () => {
    // const audio = useContext(audio_context);
    // const file = useContext(FileContext);
    const url = useContext(URLContext);
    const multitrackRef = useRef(null);
    const [multitrack, setMultitrack] = useState(null);
    const [multitrackCurrentTime, setMultitrackCurrentTime] = useState(0);
    const [isMultitrackPlaying, setIsMultitrackPlaying] = useState(false);
    const [multitrackDuration, setMultitrackDuration] = useState(0);
    const [speakersMultiStream, setSpeakersMultiStream] = useState(false);

    const handleMultiSpeakersView = useCallback(() => {
        setSpeakersMultiStream((prevState) => !prevState);
    }, []);
    /* ----------------------------- WavesSurfer ------------------------------------ */

    const containerRef = useRef(null);

    const plugins = useMemo(() => [
        RegionsPlugin.create({
            dragSelection: true,
        }),
        HoverPlugin.create({
            labelBackground: '#232424',
            labelColor: '#f1f1f1',
            labelSize: 14,
            formatTimeCallback: (seconds) => {
                return formatTime(seconds);
            },
            lineWidth: 2,
        }),
        TimelinePlugin.create({
            primaryLabelInterval: 1,
            secondaryLabelInterval: 1,
            formatTimeCallback: ((seconds) => formatTime(seconds)),
            style: {
                fontSize: '0.75rem',
                fontWeight: '500',
                margin: '1em 0',
            },
        }),
        MinimapPlugin.create({
            height: 20,
            waveColor: '#ddd',
            progressColor: '#999',
        }),
        
    ], []);

    const [wavesurfer, setWavesurfer] = useState(null);
    const [decodedData, setDecodedData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
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

    const onWavesurferDecode = useCallback(() => {
        const data = wavesurfer.getDecodedData();
        console.log('wavesurfer decoded data -->', data);
        setDecodedData(data);
    }, [wavesurfer]);

    const volumeRef = useRef(null);
    const [volume, setVolume] = useState(100);
    const [volumeIcon, setVolumeIcon] = useState(faVolumeHigh);

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
    const [shouldDisplayLeftVolumeSlider, setShouldDisplayLeftVolumeSlider] = useState(false);

    const handleLeftVolumeInput = useCallback(() => {
        const newVolume = Number(leftVolumeRef.current.value);
        const volumeLabel = (newVolume * 100).toFixed();

        leftGainRef.current.gain.value = newVolume;
        
        disconnectAllAudioNodes();
        setAudioDivision();

        setLeftVolume(volumeLabel);
        setleftVolumeIcon(getVolumeIcon(volumeLabel));
        console.log('Left volume changed', leftGainRef.current.gain.value);
    }, []);

    const toggleMuteLeft = useCallback(() => {
        const shouldMute = JSON.stringify(leftVolumeIcon) !== JSON.stringify(faVolumeXmark);
        const newVolume = Number(leftVolumeRef.current.value);

        leftGainRef.current.gain.value = shouldMute ? 0 : newVolume;
        disconnectAllAudioNodes();
        setAudioDivision();

        setleftVolumeIcon(() => {
            return shouldMute ? faVolumeXmark : getVolumeIcon(newVolume * 100);
        });
    }, [leftVolumeIcon]);

    const rightVolumeRef = useRef(null);  
    const [rightVolume, setRightVolume] = useState(100);
    const [rightVolumeIcon, setRightVolumeIcon] = useState(faVolumeHigh);
    const [shouldDisplayRightVolumeSlider, setShouldDisplayRightVolumeSlider] = useState(false);

    const handleRightVolumeInput = useCallback(() => {
        const newVolume = Number(rightVolumeRef.current.value);
        const volumeLabel = (newVolume * 100).toFixed();

        rightGainRef.current.gain.value = newVolume;
        disconnectAllAudioNodes();
        setAudioDivision();

        setRightVolume(volumeLabel);
        setRightVolumeIcon(getVolumeIcon(volumeLabel));
        console.log('Right volume changed', rightGainRef.current.gain.value);
    }, []);

    const toggleMuteRight = useCallback(() => {
        const shouldMute = JSON.stringify(rightVolumeIcon) !== JSON.stringify(faVolumeXmark);
        const newVolume = Number(rightVolumeRef.current.value);

        rightGainRef.current.gain.value = shouldMute ? 0 : newVolume;
        disconnectAllAudioNodes();
        setAudioDivision();

        setRightVolumeIcon(() => {
            return shouldMute ? faVolumeXmark : getVolumeIcon(newVolume * 100);
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

    const zoomRef = useRef(null);
    const handleZoomInput = useCallback(() => {
        wavesurfer.zoom(zoomRef.current.valueAsNumber);
    }, [wavesurfer]);
    /* ----------------------------- Audio ------------------------------------ */

    const {audio, audioContextRef, splitterRef, mergerRef, leftGainRef, rightGainRef, sourceRef, stereoPannerNodeRef} = useContext(AudiosContext);
    const [isTopLeftActive, setIsTopLeftActive] = useState(true);
    const [isTopRightActive, setIsTopRightActive] = useState(false);
    const [isBottomLeftActive, setIsBottomLeftActive] = useState(false);
    const [isBottomRightActive, setIsBottomRightActive] = useState(true);

    const disconnectAllAudioNodes = useCallback(() => {
        sourceRef.current.disconnect();
        stereoPannerNodeRef.current.disconnect();
        splitterRef.current.disconnect();
        leftGainRef.current.disconnect();
        rightGainRef.current.disconnect();
        mergerRef.current.disconnect();
    }, []);

    const setAudioDivision = useCallback(() => {
        sourceRef.current.connect(stereoPannerNodeRef.current);
        stereoPannerNodeRef.current.connect(splitterRef.current);
        splitterRef.current.connect(leftGainRef.current, 0);
        splitterRef.current.connect(rightGainRef.current, 1);
        leftGainRef.current.connect(mergerRef.current, 0, 0);
        rightGainRef.current.connect(mergerRef.current, 0, 1);
        mergerRef.current.connect(audioContextRef.current.destination);
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
    
    

   /* ----------------------------- useEffects ------------------------------------ */

   useEffect(() => {
        if (!containerRef.current) return;

        const ws = WaveSurfer.create({
            container: containerRef.current,
            autoScroll: true,
            height: 100,
            waveColor: 'rgb(200, 0, 200)',
            progressColor: 'rgb(100, 0, 100)',
            fillParent: true,
            normalize: true,
            barWidth: 5,
            barRadius: 4,
            barGap: 3,
            // backend: 'MediaElementWebAudio',
            cursorWidth: 1,
            hideScrollbar: true,
            media: audio,
            minPxPerSec: 100,
            splitChannels: true,
            plugins: plugins,
        });

        setWavesurfer(ws);

        console.log('multitrackRef.current', multitrackRef.current);

        return () => {
            ws.unAll();
            ws.destroy();
        };
    }, [spectrogram, speakersMultiStream, multitrackRef.current])

    useEffect(() => {
        disconnectAllAudioNodes();
        setAudioDivision();
        
    }, [audio, audioContextRef.current])

   useEffect(() => {
    if (!wavesurfer) return;

    registerRegionPluginEvents();

    wavesurfer.markers && wavesurfer.clearMarkers();

    wavesurfer.on("ready", onWavesurferReady);

    wavesurfer.on("loading", handleWavesurferLoading);

    wavesurfer.on("decode", onWavesurferDecode);

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
                splitChannels: true,
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
        leftGainRef.current.gain.value = 1;
        rightGainRef.current.gain.value = 1;

        disconnectAllAudioNodes();
        setAudioDivision();

        const all = isTopLeftActive && isTopRightActive && isBottomLeftActive && isBottomRightActive;
        const topStream = isTopLeftActive && isTopRightActive && !isBottomLeftActive && !isBottomRightActive;
        const bottomStream = isBottomLeftActive && isBottomRightActive && !isTopLeftActive && !isTopRightActive;
        const leftSide = isTopLeftActive && isBottomLeftActive && !isTopRightActive && !isBottomRightActive;
        const rightSide = isTopRightActive && isBottomRightActive && !isTopLeftActive && !isBottomLeftActive;
        const diagonalRightToLeft = isTopRightActive && isBottomLeftActive && !isTopLeftActive && !isBottomRightActive;

        const isMultiChannels = decodedData && decodedData.numberOfChannels > 1;
        console.log('isMultiChannel', isMultiChannels);

        if (all) {
            leftGainRef.current.connect(mergerRef.current, 0, 1);
            rightGainRef.current.connect(mergerRef.current, 0, 0);
            setAudioDivision();
        } else if (isMultiChannels && topStream) {
            rightGainRef.current.gain.value = 0;
            setAudioDivision();
        } else if (isMultiChannels && bottomStream) {
            leftGainRef.current.gain.value = 0;
            setAudioDivision();
        } else if (leftSide) {
            stereoPannerNodeRef.current.pan.setValueAtTime(-1, audioContextRef.current.currentTime);
            setAudioDivision();
        } else if (rightSide) {
            stereoPannerNodeRef.current.pan.setValueAtTime(1, audioContextRef.current.currentTime);
            setAudioDivision();
        } else if (diagonalRightToLeft) {
            stereoPannerNodeRef.current.pan.setValueAtTime(0, audioContextRef.current.currentTime);
            splitterRef.current.disconnect();
            splitterRef.current.connect(leftGainRef.current, 1);
            splitterRef.current.connect(rightGainRef.current, 0);
        } else {
            stereoPannerNodeRef.current.pan.setValueAtTime(0, audioContextRef.current.currentTime);
            setAudioDivision();
        }
    }, [isTopLeftActive, isTopRightActive, isBottomLeftActive, isBottomRightActive])

    const areDiagonalsActive = useMemo(() => {
        return (isTopLeftActive && isBottomRightActive && !isTopRightActive && !isBottomLeftActive)
            || (isTopRightActive && isBottomLeftActive && !isTopLeftActive && !isBottomRightActive);
    }, [isTopLeftActive, isTopRightActive, isBottomLeftActive, isBottomRightActive]);

    return (
        <div className='player-controls-component'>
            <div className=''>
                <div className="speakers-view">
                    <FontAwesomeIcon 
                        icon={faMinus}
                        className={speakersMultiStream ? "fs-lg speakers-view-button" : "fs-lg speakers-view-button speakers-view-button-active"}
                        onClick={handleMultiSpeakersView}
                    />
                    <FontAwesomeIcon 
                        icon={faList}
                        className={speakersMultiStream ? "fs-lg speakers-view-button speakers-view-button-active" : "fs-lg speakers-view-button"}
                        onClick={handleMultiSpeakersView}
                    />
                </div>
                
                
            </div>
            <div className="player">
                <MultitrackComponent 
                    ref={multitrackRef}
                    shouldDisplay={speakersMultiStream}
                    multitrack={multitrack}
                    setMultitrack={setMultitrack}
                    setIsPlaying={setIsMultitrackPlaying}
                    currentTime={multitrackCurrentTime}
                    setCurrentTime={setMultitrackCurrentTime} 
                    setDuration={setMultitrackDuration}   
                /> 
                { !speakersMultiStream && 
                    <>
                        <section className='main-section'>
                            <div className="wavesurfer-container" ref={containerRef}></div>
                        </section>                            
                        <section className='side-pannel'>
                            <div 
                                className='wavesurfer-top-volumes'
                                style={{display: decodedData && decodedData.numberOfChannels !== 1 ? 'block' : 'none'}}
                            >
                                <div className='wavesurfer-stream-container'>
                                    <div 
                                        className='volume-container-wavesurfer'
                                        onMouseOver={() => setShouldDisplayLeftVolumeSlider(true)}
                                        onMouseLeave={() => setShouldDisplayLeftVolumeSlider(false)}
                                    >
                                        <FontAwesomeIcon 
                                            icon={leftVolumeIcon}
                                            className={areDiagonalsActive ? 'fa-sm volume-icon' : 'fa-sm volume-icon disabled'}
                                            onClick={toggleMuteLeft}
                                        />
                                        <input 
                                            id='left-volume-input'
                                            type='range'
                                            data-action='leftVolume'
                                            ref={leftVolumeRef}
                                            onInput={handleLeftVolumeInput}    
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            // disabled if diagonals are not active
                                            disabled={!areDiagonalsActive}
                                            className='volume-input-wavesurfer'
                                            hidden={!shouldDisplayLeftVolumeSlider}
                                        />
                                        <span className='volume-value-wavesurfer'>{leftVolume}%</span>
                                    </div>
                                </div>
                                <div className='wavesurfer-stream-container'>
                                    <div className='volume-container-wavesurfer'
                                        onMouseOver={() => setShouldDisplayRightVolumeSlider(true)}
                                        onMouseLeave={() => setShouldDisplayRightVolumeSlider(false)}
                                    >
                                        <FontAwesomeIcon 
                                            icon={rightVolumeIcon}
                                            className={areDiagonalsActive ? 'fa-sm volume-icon' : 'fa-sm volume-icon disabled'}
                                            onClick={toggleMuteRight}
                                        />
                                        <input 
                                            id='right-volume-input'
                                            type='range'
                                            data-action='rightVolume'
                                            ref={rightVolumeRef}
                                            onInput={handleRightVolumeInput}   
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            className='volume-input-wavesurfer'
                                            // disabled if diagonals are not active
                                            disabled={!areDiagonalsActive}
                                            hidden={!shouldDisplayRightVolumeSlider}
                                        />
                                        <span className='volume-value-wavesurfer'>{rightVolume}%</span>
                                    </div>
                                </div>
                            </div>  
                        </section>
                      </>
                }
            </div>
            {
                speakersMultiStream && multitrackRef.current
                ? <ControlsComponent
                    currentTime={multitrackCurrentTime}
                    duration={multitrackDuration}
                    isPlaying={isMultitrackPlaying}
                    onSkip={multitrackRef.current.onSkip}
                    onPlayPause={multitrackRef.current.onPlayPause}
                    onStop={multitrackRef.current.onStop}
                    zoomRef={multitrackRef.current.zoomRef}
                    handleZoomInput={multitrackRef.current.handleZoomInput}
                    displaySpectrogramIcon={false}
                /> 
                : <ControlsComponent
                    currentTime={currentTime}
                    duration={wavesurfer ? wavesurfer.getDuration() : 0}
                    isPlaying={isPlaying}
                    onSkip={onSkip}
                    onPlayPause={onPlayPause}
                    onStop={onStop}
                    regions={regions}
                    loopRegions={loopRegions}
                    loopRegionsRef={loopRegionsRef}
                    setLoopRegions={setLoopRegions}
                    displaySpectrogramIcon={true}
                    spectrogram={spectrogram}
                    setSpectrogram={setSpectrogram}
                    playbackRateRef={playbackRateRef}
                    playbackRates={playbackRates}
                    playbackRate={playbackRate}
                    handlePlaybackRateInput={handlePlaybackRateInput}
                    zoomRef={zoomRef}
                    handleZoomInput={handleZoomInput}
                    channelsSquaresProps={{
                        isTopLeftActive,
                        setIsTopLeftActive,
                        isBottomLeftActive,
                        setIsBottomLeftActive,
                        isTopRightActive,
                        setIsTopRightActive,
                        isBottomRightActive,
                        setIsBottomRightActive
                    }}
                />
            }
            
        </div>
    )
};

export default PlayerControlsComponent;