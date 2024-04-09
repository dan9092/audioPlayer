import React, { useCallback, useEffect, useRef, useState } from "react";
import Multitrack from './multitrack.js'

const MultitrackComponent = () => {
    const [multitrack, setMultitrack] = useState(null);
    const multitrackContainerRef = useRef(null);


    useEffect(() => {
        console.log(multitrackContainerRef);
        // if (multitrackContainerRef.current.children.length > 1) {
        //     multitrackContainerRef.current.removeChild(multitrackContainerRef.current.lastElementChild);
        // }

        if (!multitrackContainerRef.current) return;
        
        const multiTrack = Multitrack.create([
            {
                id: 0,
                url: './audio/audio4.mp3',
                startPosition: 3,
                intro: {
                    endTime: 10,
                    label: "Intro",
                },
                options: {
                    barWidth: 5,
                    barRadius: 4,
                    barGap: 3,
                }
            },
            {
                id: 1,
                url: './audio/audio5.ogg',
                options: {
                    barWidth: 3,
                    barRadius: 4,
                    barGap: 3,
                }
            },
        ],
        {
            container: multitrackContainerRef.current,
        });


        setMultitrack(multiTrack);
    }, [])

    return (
        <>
            <p>MultiTrack</p>
            <div ref={multitrackContainerRef}></div>
        </>
    )
}

export default MultitrackComponent;
