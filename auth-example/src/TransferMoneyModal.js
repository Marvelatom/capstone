import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TransferMoneyModal.css';

const TransferMoneyModal = ({ onClose, onTransfer }) => {
  const [formData, setFormData] = useState({
    receiverName: '',
    phoneNumber: '',
    amount: '',
  });
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loading screen
  const [isIrisVerified, setIsIrisVerified] = useState(false); // State to track verification status
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onTransfer(formData);
      onClose();
    } catch (error) {
      console.error('Transfer failed', error);
    }
  };

  // Start webcam when "Verify Iris" is clicked
  const startCamera = () => {
    setShowCamera(true);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((error) => console.error("Camera access denied", error));
  };
  
  // Stop webcam and hide camera overlay
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    const tracks = stream ? stream.getTracks() : [];
    tracks.forEach(track => track.stop());
    setShowCamera(false);
  };

  // Capture image from video feed and auto-close camera
  const captureImage = () => {
    setIsLoading(true);  // Start loading screen
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }

    context.putImageData(imageData, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/png');

    fetch(imageDataUrl)
      .then(res => res.blob())
      .then(blob => {
        const formData = new FormData();

        // Use a specific pattern for the filename
        const uniqueId = Date.now();
        const filename = `300_1_${uniqueId % 100}.jpg`;
        formData.append('irisImage', blob, filename);

        fetch("http://localhost:5000/api/upload-iris", {
          method: "POST",
          body: formData,
        })
        .then(response => response.json())
        .then(data => {
          console.log("Image saved:", data);
          toast.success("Image saved successfully!");
          stopCamera();

          // Now trigger the verification process
          fetch("http://localhost:5000/api/verify-iris", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ filename }),  // Send the correct filename here
          })
          .then(response => response.json())
          .then(result => {
            setIsLoading(false);  // Stop loading
            if (result.success && result.match) {
              setIsIrisVerified(true); // Set verification status to true
              toast.success("Iris verification successful!");
            } else if (result.message === "No sample found") {
              toast.error("No sample found.");
            } else {
              toast.error("Iris verification failed. Image does not match.");
            }
          })
          .catch(error => {
            console.error("Verification error:", error);
            toast.error("Verification failed.");
            setIsLoading(false);  // Stop loading on error
          });
        })
        .catch((error) => {
          console.error("Error saving image:", error);
          toast.error("Failed to save image.");
          setIsLoading(false);  // Stop loading on error
        });
      });
  };

  return (
    <>
      {/* Loading Screen */}
      {isLoading && (
        <div className="loading-screen">
          <div className="loading-content">
            <h2>Processing...</h2>
            <div className="spinner"></div> {/* You can style this spinner */}
          </div>
        </div>
      )}

      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Transfer Money</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Receiver's Name:</label>
              <input
                type="text"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </div>
            {/* Transfer button disabled until iris verification is successful */}
            <button type="submit" disabled={!isIrisVerified}>Transfer Money</button>
          </form>

          {/* Verify Iris Button */}
          {!isIrisVerified && (
            <button onClick={startCamera} className="verify-iris-button">
              Verify Iris
            </button>
          )}
          <button onClick={onClose} className="close-modal">Close</button>
        </div>

        {/* Camera Overlay */}
        {showCamera && (
          <div className="camera-overlay">
            <div className="camera-content">
              <h2>Verify Iris</h2>
              <video ref={videoRef} autoPlay></video>
              <button onClick={captureImage} className="capture-button">Capture</button>
              <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
              <button onClick={stopCamera} className="close-camera">Close Camera</button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default TransferMoneyModal;
