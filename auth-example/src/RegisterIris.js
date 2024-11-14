import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './RegisterIris.css';

const RegisterIris = ({ onRegistrationComplete }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [irisImage, setIrisImage] = useState(null);
  const [showHeading, setShowHeading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null); // Ref for the canvas element

  useEffect(() => {
    setShowCamera(true);

    return () => {
      setShowCamera(false);
    };
  }, []);

  const captureIris = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setIrisImage(imageSrc);
    setShowCamera(false);

    // Convert image to greyscale and prepare for upload
    const greyscaleBlob = await convertToGreyscale(imageSrc);
    const formData = new FormData();
    formData.append('irisImage', greyscaleBlob, 'irisImage.jpg');

    try {
      setIsUploading(true);
      const response = await fetch('http://localhost:5000/api/auth/upload-iris', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        onRegistrationComplete(); // Notify parent that registration is complete
      } else {
        const errorMessage = await response.json();
        toast.error(`Failed to save iris image: ${errorMessage.message}`);
      }
    } catch (error) {
      toast.error('Error capturing iris image.');
    } finally {
      setIsUploading(false);
    }

    setTimeout(() => {
      setIrisImage(null);
      setShowHeading(false);
    }, 3000);
  };

  const convertToGreyscale = (imageSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageSrc;
      img.crossOrigin = 'anonymous'; // To avoid cross-origin issues

      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to the image size
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);

        // Get image data from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Convert to greyscale
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;     // Red
          data[i + 1] = avg; // Green
          data[i + 2] = avg; // Blue
          // Alpha (data[i + 3]) remains unchanged
        }

        // Put the modified data back to the canvas
        ctx.putImageData(imageData, 0, 0);

        // Get the greyscale image as a blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg');
      };

      img.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className="register-iris-container">
      {showHeading && <h2>Register Iris</h2>}

      {showCamera && (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
            height={300}
          />
          <button onClick={captureIris} disabled={isUploading}>
            {isUploading ? 'Capturing...' : 'Capture Iris'}
          </button>
        </div>
      )}

      {irisImage && (
        <div className="iris-captured">
          <h3>Iris Image Captured:</h3>
          <img 
            src={irisImage} 
            alt="Captured Iris" 
            style={{ width: '150px', height: 'auto' }}
          />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} /> {/* Hidden canvas */}
      <ToastContainer />
    </div>
  );
};

export default RegisterIris;
