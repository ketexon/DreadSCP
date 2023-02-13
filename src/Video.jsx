import Human from "@vladmandic/human"

import React from "react"
import { Box, Container } from "@mui/system"

const HumanConfig = {
	async: true,
	backend: "webgpu",
	debug: true,
	body: { enabled: false },
	cacheModels: true,
	face: {
		enabled: true,

		attention: { enabled: false },
		antispoof: { enabled: false },
		description: { enabled: false },
		detector: { enabled: true, rotation: false, maxDetected: 100, minConfidence: 0.2, return: true },
		mesh: { enabled: true },
		emotion: { enabled: false },
		gear: { enabled: false },
		iris: { enabled: true },
		liveness: { enabled: false },
	},
	filter: { enabled: true, equalization: false, flip: false },
	gesture: { enabled: true },
	hand: { enabled: false },
	object: { enabled: false },
	segmentation: { enabled: false },
}

const HumanDrawConfig = {
	alpha: 0.5,
	drawAttention: true,
	drawBoxes: true,
	drawGaze: true,
	drawGestures: true,
	drawLabels: true,
	drawPoints: false,
	drawPolygons: false,

	faceLabels: `Face [id]
	Roll: [roll]°, yaw:[yaw]°, pitch:[pitch]°
	Gaze: [gaze]°
	`
}

export default function Video(){
	const videoRef = React.useRef();
	const canvasRef = React.useRef();
	const [startedInit, setStartedInit] = React.useState(false);
	const [statusText, setStatusText] = React.useState("");
	const [ready, setReady] = React.useState(false)

	const human = new Human(HumanConfig);

	async function update(){
		if(!canvasRef.current || !videoRef.current) return;
		const video = videoRef.current;
		const canvas = canvasRef.current;

		const ctx = canvasRef.current.getContext('2d');
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		const interpolated = human.next(human.result);
		const processed = await human.image(video);

		const facesEyesClosed = {};
		const facesLookingAway = {};
		for(const gesture of human.result.gesture){
			if("face" in gesture){
				if(/^blink (left|right) eye$/i.test(gesture.gesture)){
					if(!(gesture.face in facesEyesClosed)){
						facesEyesClosed[gesture.face] = 0;
					}
					facesEyesClosed[gesture.face]++;
				}
			}
			if("iris" in gesture){
				if(/^looking (left|right|up|down)$/i.test(gesture.gesture)){
					facesLookingAway[gesture.iris] = true;
				}
			}
		}

		for(const [face, eyesClosed] of Object.entries(facesEyesClosed)){
			if(eyesClosed >= 2){
				console.log(`Face ${face} is blinking`)
			}
		}
		for(const [iris, lookingAway] of Object.entries(facesLookingAway)){
			if(lookingAway){
				console.log(`Iris ${iris} is looking away`)
			}
		}

		await human.draw.all(
			canvas,
			interpolated,
			HumanDrawConfig
		);

		setTimeout(update, 30);
	}

	function handleResize(){
		if(!canvasRef.current || !videoRef.current) return;
		const canvas = canvasRef.current;
		const video = videoRef.current;

		const rect = canvas.parentNode.getBoundingClientRect();
		canvas.width = rect.width;
		console.log
		canvas.height = canvas.width * video.videoHeight / video.videoWidth;
	}

	React.useEffect(() => {
		if(startedInit) return;
		setStartedInit(true);
		console.log("HI");
		(async () => {
			setStatusText(`Loading...`);
			await human.load();

			setStatusText(`Warming up...`);
			await human.warmup();
		})().then(() => {
			navigator.mediaDevices.getUserMedia({
				video: {
					width: {ideal: 1280},
					height: {ideal: 720},
				},
				audio: false
			}).then(mediaStream => {
				const video = videoRef.current;
				const canvas = canvasRef.current;
				if(video && canvas){
					video.srcObject = mediaStream;
					video.addEventListener(
						"loadedmetadata",
						() => {
							setReady(true);
							video.play();
							human.video(video, {});
							handleResize();

							update();
						}
					)
				}
			})
		})

		window.addEventListener("resize", handleResize);
		return _ => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<Container sx={{display: "flex"}}>
			<span style={{display: ready ? "none" : "block"}}>{statusText}</span>
			<video ref={videoRef} style={{display: "none"}}></video>
			<Box sx={{
				display: ready ? "block" : "none",
				flex: "1 1 auto",
				flexBasis: 0,
			}}>
				<canvas ref={canvasRef} ></canvas>
			</Box>
		</Container>
	)
}