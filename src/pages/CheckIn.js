import React, { useState, useRef } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CameraAlt,
  QrCodeScanner,
  LocationOn,
  CheckCircle,
} from "@mui/icons-material";
import Webcam from "react-webcam";
import { attendanceAPI } from "../services/api";

const CheckIn = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const webcamRef = useRef(null);

  const handleTabChange = (event, newValue) => {
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
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setMessage("Failed to capture image");
        setMessageType("error");
        return;
      }

      // Convert base64 to blob
      const base64Data = imageSrc.replace(/^data:image\/jpeg;base64,/, "");
      await attendanceAPI.faceCheckIn({
        sessionId,
        imageBase64: base64Data,
      });

      setMessage("Check-in successful! Face recognized.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Check-in failed");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleQRCheckIn = async (qrData) => {
    if (!qrData) {
      setMessage("Invalid QR code");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      await attendanceAPI.qrCheckIn({
        sessionId: sessionId || "auto-detect", // QR might contain session info
        qrCodeData: qrData,
      });

      setMessage("Check-in successful via QR code!");
      setMessageType("success");
    } catch (error) {
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
        } catch (error) {
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

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Check In
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Session ID
          </Typography>
          <input
            type="text"
            placeholder="Enter session ID or scan QR code"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </Box>

        {message && (
          <Alert severity={messageType} sx={{ mb: 3 }}>
            {message}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<CameraAlt />} label="Face Recognition" />
          <Tab icon={<QrCodeScanner />} label="QR Code" />
          <Tab icon={<LocationOn />} label="GPS Location" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Face Recognition Check-in
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    style={{
                      width: "100%",
                      maxWidth: "400px",
                      borderRadius: "8px",
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <CheckCircle />
                    }
                    onClick={handleFaceCheckIn}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? "Processing..." : "Take Photo & Check In"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  QR Code Check-in
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Point your camera at the QR code to check in
                  </Typography>
                  {/* QR Scanner component would go here - simplified for now */}
                  <Button
                    variant="contained"
                    startIcon={<QrCodeScanner />}
                    onClick={() => handleQRCheckIn("sample-qr-data")}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? "Scanning..." : "Scan QR Code"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  GPS Location Check-in
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <LocationOn sx={{ fontSize: 64, color: "primary.main" }} />
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    textAlign="center"
                  >
                    This will check your current location and verify you're
                    within the allowed check-in area.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <LocationOn />
                    }
                    onClick={handleGPSCheckIn}
                    disabled={loading}
                    size="large"
                  >
                    {loading ? "Getting Location..." : "Check In with GPS"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Paper>

      {/* Recent Check-ins */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No recent check-ins to display.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CheckIn;
