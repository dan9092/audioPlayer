import React from "react";
import { formatTime } from '../../utils.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat, faChartColumn, faGauge } from "@fortawesome/free-solid-svg-icons";
import BasicControlsComponent from '../BasicControlsComponent/BasicControlsComponent.jsx';
import ZoomSliderComponent from "../ZoomSliderComponent/ZoomSliderComponent.jsx";
import ChannelsSquaresComponent from "../channelsSquaresComponent/ChannelsSquaresComponent.jsx";

const ControlsComponent = (props) => {
    const {
        currentTime,
        duration,
        isPlaying,
        onSkip,
        onPlayPause,
        onStop,
        regions,
        loopRegions,
        loopRegionsRef,
        setLoopRegions,
        displaySpectrogramIcon,
        spectrogram,
        setSpectrogram,
        channelsSquaresProps,
        playbackRateRef,
        playbackRates,
        playbackRate,
        handlePlaybackRateInput,
        zoomRef,
        handleZoomInput,
    } = props;

    return (
        <>
            <section className='controls-container'>
                <p className='time'>{formatTime(currentTime)} / {formatTime(duration)}</p>
                <BasicControlsComponent
                    onSkip={onSkip}
                    onPlayPause={onPlayPause}
                    onStop={onStop}
                    isPlaying={isPlaying}
                />
                <div className='more-controls'>
                    { regions &&
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
                    }

                    {displaySpectrogramIcon &&
                        <div className='checkbox-container'>
                            <label htmlFor='spectrogram-checkbox' className='spectrogram-label'>
                                <FontAwesomeIcon 
                                    icon={faChartColumn} 
                                    className='fa-sm button'
                                    color={spectrogram ? 'orange' : 'black'}
                                />
                            </label>
                            <input 
                                type='checkbox'
                                id='spectrogram-checkbox'
                                onInput={(e) => setSpectrogram(e.currentTarget.checked)}
                                style={{display: "none"}}
                            />
                        </div>
                    }
                    
                    {channelsSquaresProps &&
                        <ChannelsSquaresComponent
                            {...channelsSquaresProps}
                        />
                    }
                    {playbackRate &&
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
                                className='speed-input'
                            />
                            <span>X{playbackRate}</span>
                        </div>
                    }
                    
                    {/* <div className='volume-container'>
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
                    </div> */}
                    <ZoomSliderComponent
                        zoomRef={zoomRef}
                        handleZoomInput={handleZoomInput}
                    />
                </div>
            </section>
        </>
    );
}

export default ControlsComponent;