import React from "react";
import ReactDOM from "react-dom/client";

import Video from "./Video";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<Video/>
)

// (async () => {
// 	const human = new Human();

// 	const mediaStream = await navigator.mediaDevices.getUserMedia({
// 		video: true,
// 	})

// 	const video = document.createElement("video");

// 	document.querySelector("#root").appendChild(video);


// 	video.srcObject = mediaStream;
// 	video.addEventListener("loadedmetadata", () => {video.play();});
// })();