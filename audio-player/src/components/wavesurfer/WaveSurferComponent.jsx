import React, { useCallback, useRef, useMemo, useState, useEffect, useContext, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import { useWavesurfer, useRegionEvent } from '@wavesurfer/react';
import {WaveForm, WaveSurfer, Region} from 'wavesurfer-react';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import ZoomPlugin from 'wavesurfer.js/dist/plugins/zoom.esm.js';
import HoverPlugin from 'wavesurfer.js/dist/plugins/hover.esm.js';
import MinimapPlugin from 'wavesurfer.js/dist/plugins/minimap.esm.js';
import SpectrogramPlugin from 'wavesurfer.js/dist/plugins/spectrogram.esm.js';
import createColormap from 'colormap';
import './wavesurfer.css';
import { AudioContext, FileContext, URLContext } from '../../contexts/audioContext';



const WaveSurferComponent = ({ wavesurfer }) => {
    const audio = useContext(AudioContext);
    const url = useContext(URLContext);

    

    
   
    /* ----------------------------- Equalizer ------------------------------------ */
    
    // const createEqualizer = useCallback(() => {
    //     const equalizerBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

    //     const filters = equalizerBands.map((band) => {
    //         const filter = audioContext.createBiquadFilter();

    //         filter.type = band <= 32 ? 'lowshelf' : band >= 16000 ? 'highshelf' : 'peaking';
    //         filter.gain.value = Math.random() * 40 - 20;
    //         filter.Q.value = 1; // resonance
    //         filter.frequency.value = band; // the cut-off frequency

    //         return filter;
    //     });

    //     const mediaElement = audioContext.createMediaElementSource(new Audio(url));
    //     console.log(mediaElement);
    // }, []);    

        // wavesurfer.panner = wavesurfer.backend.ac.createStereoPanner();
        // wavesurfer.backend.setFilter(wavesurfer.panner);

        // audio.addEventListener('canplay', () => {
        //     // Create a MediaElementSourceNode from the audio element
        //     const mediaNode = audioContext.createMediaElementSource(audio);
    
        //     console.log(filters);
        //     // Connect the filters and media node sequentially
        //     const equalizer = filters.reduce((prev, curr) => {
        //         prev.connect(curr);
            
        //         return curr;
        //     }, mediaNode);
    
        //     // Connect the filters to the audio output
        //     equalizer.connect(audioContext.destination);
        // }, { once: true });

    

    return (
        <>
           
        </>
    );
};

export default WaveSurferComponent;