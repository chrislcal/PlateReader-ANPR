import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs-backend-webgl";
import FormData from "form-data";

import Sidebar from './Sidebar';

tf.setBackend("webgl");

const Detector = () => {
  const videoRef = useRef();
  const canvasRef = useRef();

  const [model, setModel] = useState(null);
  const [carInfo, setCarInfo] = useState({});
  const [plateInfo, setPlateInfo] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [captureInterval, setCaptureInterval] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const updateCanvasDimensions = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const aspectRatio = videoWidth / videoHeight;

    const maxWidth = (window.innerWidth * 0.7) - 10;
    const maxHeight = window.innerHeight * 0.9;

    let newWidth = maxWidth;
    let newHeight = newWidth / aspectRatio;

    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    } else {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    canvasRef.current.width = newWidth;
    canvasRef.current.height = newHeight;
    videoRef.current.width = newWidth;
    videoRef.current.height = newHeight;
    videoRef.current.style.width = `${newWidth}px`;
    videoRef.current.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    // Loading car model
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load({ class: ["car"], score: 0.5 });
        setModel(loadedModel);
      } catch (error) {
        console.error(error);
      }
    };
    loadModel();
  }, []);

  const predictFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const predictions = await model.detect(videoRef.current);
    drawPredictions(predictions);
    requestAnimationFrame(predictFrame);
  };

  // Draw bounding box around detected car
const drawPredictions = (predictions) => {
  if (!canvasRef.current) return;

  const ctx = canvasRef.current.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const font = "16px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  predictions.forEach((prediction) => {
    if (prediction.class === "car") {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];

      // Draw prediction box.
      ctx.strokeStyle = "#fa00ff";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      // Draw text box.
      ctx.fillStyle = "#fa00ff";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

      // Draw text.
      ctx.fillStyle = "black";
      ctx.fillText(prediction.class, x, y);
    }
  });
};


  // Obtain info about car
  const handleGetInfo = async () => {
    if (isCapturing) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
      setIsCapturing(false);
    } else {
      setIsCapturing(true);
      const interval = setInterval(async () => {
        try {
          if (!canvasRef.current) return;
  
          const ctx = canvasRef.current.getContext("2d");
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
          ctx.drawImage(
            videoRef.current,0,0,
            videoWidth,
            videoHeight
          );
  
          const capturedImage = canvasRef.current.toDataURL("image/jpeg", 0.8);
  
          if (capturedImage) {
            const body = new FormData();
            body.append("upload", capturedImage);
            body.append("regions", "no");
  
            const plateRequest = await fetch(
              "https://api.platerecognizer.com/v1/plate-reader/",
              {
                method: "POST",
                headers: {
                  Authorization: `Token ${process.env.REACT_APP_TOKEN}`,
                },
                body: body,
              }
            );
  
            const plateResponse = await plateRequest.json();

            setErrorMessage("");
  
            if (plateResponse.results && plateResponse.results.length > 0) {
              const plateNumber = plateResponse.results[0].plate;
              setPlateInfo(plateNumber);
  
              try {
                const carInfoRequest = await fetch(
                  `http://localhost:5000/cardata?plateNumber=${plateNumber}`,
                  {
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
                const carInfoResponse = await carInfoRequest.json();
                console.log(carInfoResponse);

                // Update the carInfo state with the car data
                setCarInfo(carInfoResponse);
                setErrorMessage("");

                // Stop the interval and reset the capture button
                clearInterval(interval);
                setCaptureInterval(null);
                setIsCapturing(false);
  
              } catch (error) {
                console.log(`Vegvesen: ${error}`);
              }
  
            } else {
              console.log("No plate detected");
            }
          }
        } catch (error) {
          console.log(error);
          setErrorMessage("Failed to get data");
        
        }
      }, 4000);
      setCaptureInterval(interval);
    }
  };

  

  useEffect(() => {
    if (model) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "user",
          },
          audio: false,
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              updateCanvasDimensions();
              requestAnimationFrame(predictFrame);
            };
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [model, predictFrame]);

  useEffect(() => {
    const handleResize = () => {
      updateCanvasDimensions();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="detector-container">
      <div className="video-container">
        <video
          style={{ position: "absolute", top: 0, left: 0 }}
          autoPlay
          playsInline
          muted
          ref={videoRef}
        />
        <canvas
          style={{ position: "absolute", top: 0, left: 0 }}
          ref={canvasRef}
        />
      </div>
      <Sidebar carInfo={carInfo}
       plateNumber={plateInfo}
       errorMessage={errorMessage}
       handleGetInfo={handleGetInfo}
       captureInterval={captureInterval}
      />
    </div>
  );
};

export default Detector;
