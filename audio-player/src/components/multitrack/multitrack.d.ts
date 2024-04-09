/**
 * Multitrack is a super-plugin for creating a multitrack audio player.
 * Individual tracks are synced and played together.
 * They can be dragged to set their start position.
 * The top track is meant for dragging'n'dropping an additional track id (not a file).
 */
import { type WaveSurferOptions } from 'wavesurfer.js';
import { type TimelinePluginOptions } from 'wavesurfer.js/dist/plugins/timeline.js';
import { type EnvelopePoint, type EnvelopePluginOptions } from 'wavesurfer.js/dist/plugins/envelope.js';
import EventEmitter from 'wavesurfer.js/dist/event-emitter.js';
export type TrackId = string | number;
type SingleTrackOptions = Omit<WaveSurferOptions, 'container' | 'minPxPerSec' | 'duration' | 'cursorColor' | 'cursorWidth' | 'interact' | 'hideScrollbar'>;
export type TrackOptions = {
    id: TrackId;
    url?: string;
    peaks?: WaveSurferOptions['peaks'];
    envelope?: boolean | EnvelopePoint[];
    draggable?: boolean;
    startPosition: number;
    startCue?: number;
    endCue?: number;
    fadeInEnd?: number;
    fadeOutStart?: number;
    volume?: number;
    markers?: Array<{
        time: number;
        label?: string;
        color?: string;
    }>;
    intro?: {
        endTime: number;
        label?: string;
        color?: string;
    };
    options?: SingleTrackOptions;
};
export type MultitrackOptions = {
    container: HTMLElement;
    minPxPerSec?: number;
    cursorColor?: string;
    cursorWidth?: number;
    trackBackground?: string;
    trackBorderColor?: string;
    rightButtonDrag?: boolean;
    dragBounds?: boolean;
    envelopeOptions?: EnvelopePluginOptions;
    timelineOptions?: TimelinePluginOptions;
};
export type MultitrackEvents = {
    canplay: [];
    'start-position-change': [{
        id: TrackId;
        startPosition: number;
    }];
    'start-cue-change': [{
        id: TrackId;
        startCue: number;
    }];
    'end-cue-change': [{
        id: TrackId;
        endCue: number;
    }];
    'fade-in-change': [{
        id: TrackId;
        fadeInEnd: number;
    }];
    'fade-out-change': [{
        id: TrackId;
        fadeOutStart: number;
    }];
    'envelope-points-change': [{
        id: TrackId;
        points: EnvelopePoint[];
    }];
    'volume-change': [{
        id: TrackId;
        volume: number;
    }];
    'intro-end-change': [{
        id: TrackId;
        endTime: number;
    }];
    drop: [{
        id: TrackId;
    }];
};
export type MultitrackTracks = Array<TrackOptions>;
declare class MultiTrack extends EventEmitter<MultitrackEvents> {
    private tracks;
    private options;
    private audios;
    private wavesurfers;
    private envelopes;
    private durations;
    private currentTime;
    private maxDuration;
    private rendering;
    private frameRequest;
    private subscriptions;
    private audioContext;
    static create(tracks: MultitrackTracks, options: MultitrackOptions): MultiTrack;
    constructor(tracks: MultitrackTracks, options: MultitrackOptions);
    private initDurations;
    private initAudio;
    private initAllAudios;
    private initWavesurfer;
    private initAllWavesurfers;
    private updatePosition;
    private onDrag;
    private findCurrentTracks;
    private startSync;
    play(): void;
    pause(): void;
    isPlaying(): boolean;
    getCurrentTime(): number;
    /** Position percentage from 0 to 1 */
    seekTo(position: number): void;
    /** Set time in seconds */
    setTime(time: number): void;
    zoom(pxPerSec: number): void;
    addTrack(track: TrackOptions): void;
    destroy(): void;
    setSinkId(sinkId: string): Promise<void[]>;
    setTrackVolume(index: number, volume: number): void;
    getEnvelopePoints(trackIndex: number): EnvelopePoint[] | undefined;
    setEnvelopePoints(trackIndex: number, points: EnvelopePoint[]): void;
}
export default MultiTrack;
