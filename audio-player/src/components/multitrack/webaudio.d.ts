/**
 * Web Audio buffer player emulating the behavior of an HTML5 Audio element.
 */
declare class WebAudioPlayer {
    private audioContext;
    private gainNode;
    private bufferNode;
    private listeners;
    private autoplay;
    private playStartTime;
    private playedDuration;
    private _src;
    private _duration;
    private _muted;
    private buffer;
    paused: boolean;
    crossOrigin: string | null;
    constructor(audioContext?: AudioContext);
    addEventListener(event: string, listener: () => void, options?: {
        once?: boolean;
    }): void;
    removeEventListener(event: string, listener: () => void): void;
    private emitEvent;
    get src(): string;
    set src(value: string);
    getChannelData(): Float32Array[] | undefined;
    play(): Promise<void>;
    pause(): void;
    setSinkId(deviceId: string): Promise<void>;
    get playbackRate(): number;
    set playbackRate(value: number);
    get currentTime(): number;
    set currentTime(value: number);
    get duration(): number;
    set duration(value: number);
    get volume(): number;
    set volume(value: number);
    get muted(): boolean;
    set muted(value: boolean);
}
export default WebAudioPlayer;
