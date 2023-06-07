import React from "react";

const VideoPlayer = (src) => {
    return (
        <div style={{ position: "relative", width: "500px", height: "500px", margin: "0 auto", overflow: "hidden"}}>
            <video
                src={src}
                style={{
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%"
                }}
                autoPlay muted playsInline loop
            />
        </div>
    );
};

export default VideoPlayer;




