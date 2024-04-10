import React from "react";
import './ChannelsSquaresComponent.css';

const ChannelsSquaresComponent = (props) => {
    const {
        isTopLeftActive,
        setIsTopLeftActive,
        isTopRightActive,
        setIsTopRightActive,
        isBottomLeftActive,
        setIsBottomLeftActive,
        isBottomRightActive,
        setIsBottomRightActive
    } = props;

    return (
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
    );
}

export default ChannelsSquaresComponent;