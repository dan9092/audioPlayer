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



const WaveSurferComponent = () => {
    const audio = useContext(AudioContext);
    const url = useContext(URLContext);    

    return (
        <>
           
        </>
    );
};

export default WaveSurferComponent;