import React, { useState, useRef } from "react";
import { attendanceAPI } from "../services/api";
import "../styles/CheckIn.css";

const CheckIn: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const webcamRef = useRef<HTMLVideoElement>(null);

  const handleTabChange = (_event: any, newValue: number) => {
    setActiveTab(newValue);
    setMessage("");
  };

  const handleFaceCheckIn = async () => {
    if (!sessionId) {
      setMessage("Please enter session ID");
      setMessageType("error");
      return;
    }

    if (!webcamRef.current) {
      setMessage("Camera not available");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      // For demonstration - in real app this would capture and send image
      await attendanceAPI.faceCheckIn({
        sessionId,
        imageBase64: "demo-image-data", // Would be actual base64 image
      });

      setMessage("Check-in successful! Face recognized.");
      setMessageType("success");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Check-in failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleQRCheckIn = async (qrData?: string) => {
    if (!qrData) {
      setMessage("Invalid QR code");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      await attendanceAPI.qrCheckIn({
        sessionId: sessionId || "auto-detect",
        qrCodeData: qrData,
      });

      setMessage("Check-in successful via QR code!");
      setMessageType("success");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "QR check-in failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleGPSCheckIn = async () => {
    if (!sessionId) {
      setMessage("Please enter session ID");
      setMessageType("error");
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by this browser");
      setMessageType("error");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await attendanceAPI.gpsCheckIn({
            sessionId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setMessage("GPS check-in successful!");
          setMessageType("success");
        } catch (error: any) {
          setMessage(error.response?.data?.message || "GPS check-in failed");
          setMessageType("error");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setMessage("Failed to get location: " + error.message);
        setMessageType("error");
        setLoading(false);
      }
    );
  };

  return (
    <div className="checkin-container">
      <h1 className="checkin-title">Check In</h1>

      <div className="checkin-paper">
        <div className="session-input-section">
          <label className="form-label">Session ID</label>
          <input
            type="text"
            placeholder="Enter session ID or scan QR code"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="session-input"
          />
        </div>

        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
          </div>
        )}

        <div className="checkin-tabs">
          <button
            className={`tab-btn ${activeTab === 0 ? 'active' : ''}`}
            onClick={() => handleTabChange(null, 0)}
          >
            <span className="tab-icon">📷</span>
            Face Recognition
          </button>
          <button
            className={`tab-btn ${activeTab === 1 ? 'active' : ''}`}
            onClick={() => handleTabChange(null, 1)}
          >
            <span className="tab-icon">📱</span>
            QR Code
          </button>
          <button
            className={`tab-btn ${activeTab === 2 ? 'active' : ''}`}
            onClick={() => handleTabChange(null, 2)}
          >
            <span className="tab-icon">📍</span>
            GPS Location
          </button>
        </div>

        <div className="checkin-content">
          {activeTab === 0 && (
            <div className="checkin-card">
              <h3>Face Recognition Check-in</h3>
              <div className="face-checkin-content">
                <div className="webcam-container">
                  <video
                    ref={webcamRef}
                    autoPlay
                    playsInline
                    muted
                    className="webcam"
                  />
                </div>
                <button
                  className="btn btn-primary checkin-btn"
                  onClick={handleFaceCheckIn}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Take Photo & Check In"}
                </button>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="checkin-card">
              <h3>QR Code Check-in</h3>
              <div className="qr-checkin-content">
                <p className="instruction-text">
                  Point your camera at the QR code to check in
                </p>
                <button
                  className="btn btn-primary checkin-btn"
                  onClick={() => handleQRCheckIn("sample-qr-data")}
                  disabled={loading}
                >
                  {loading ? "Scanning..." : "Scan QR Code"}
                </button>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="checkin-card">
              <h3>GPS Location Check-in</h3>
              <div className="gps-checkin-content">
                <div className="gps-icon">📍</div>
                <p className="instruction-text">
                  This will check your current location and verify you're
                  within the allowed check-in area.
                </p>
                <button
                  className="btn btn-primary checkin-btn"
                  onClick={handleGPSCheckIn}
                  disabled={loading}
                >
                  {loading ? "Getting Location..." : "Check In with GPS"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <p className="no-activity">No recent check-ins to display.</p>
      </div>
    </div>
  );
};

export default CheckIn;