import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ src }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        video.src = src;
        video.load();
        video.play();

        return () => {
            video.pause();
        };
    }, [src]);

    return <video ref={videoRef} loop={true} controls={false} className="w-full h-full object-cover" />;

};

export default VideoPlayer;
