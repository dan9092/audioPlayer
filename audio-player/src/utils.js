import { faVolumeXmark, faVolumeLow, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";

const formatTime = (seconds) => [seconds / 3600, seconds / 60 % 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':');

const generateNum = (min, max) => Math.random() * (max - min + 1) + min;

const randomColor = () => {
    const r = generateNum(0, 255);
    const g = generateNum(0, 255);
    const b = generateNum(0, 255);

    return `rgba(${r}, ${g}, ${b}, 0.5)`;
};

const getVolumeIcon = (value) => {
    if (value == 0) 
        return faVolumeXmark;

    if (value <= 50) 
        return faVolumeLow;
    
    return faVolumeHigh;
}; 

export { formatTime, randomColor, getVolumeIcon };