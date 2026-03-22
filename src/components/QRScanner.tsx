// QRScanner.tsx
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Box, Button, Stack, TextField } from "@mui/material";

const qrcodeRegionId = "qr-reader";

const QRScanner: React.FC = () => {
  const [result, setResult] = useState<string>("");
  const [scanning, setScanning] = useState<boolean>(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!scanning) return;

    const qrCodeScanner = new Html5Qrcode(qrcodeRegionId);
    html5QrCodeRef.current = qrCodeScanner;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      videoConstraints: {
        facingMode: "environment"
      }
    };

    qrCodeScanner
      .start(
        { facingMode: "environment" }, // or use { deviceId } from camera list
        config,
        (decodedText) => {
          console.log("Scanned:", decodedText);
          setResult(decodedText);
          stopScanner(); // optional: stop after successful scan
        },
        (errorMessage) => {
           console.warn("Scan error:", errorMessage); // too noisy
        }
      )
      .catch((err) => {
        console.error("Failed to start scanner:", err);
        setScanning(false);
      });

    // Cleanup when component unmounts
    return () => {
      qrCodeScanner
        .stop()
        .then(() => qrCodeScanner.clear())
        .catch((err) => console.error("Failed to stop scanner", err));
    };
  }, [scanning]);

  const stopScanner = () => {
    setScanning(false);
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => html5QrCodeRef.current?.clear())
        .catch((err) => console.error("Stop error", err));
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 350, margin: "auto", mt: 10 }}>
      <TextField label="Scan Result" value={result} fullWidth />
      <Button
        variant="contained"
        onClick={() => setScanning((prev) => !prev)}
      >
        {scanning ? "Stop Scanner" : "Start Scanner"}
      </Button>

      {/* Scanner region */}
      {scanning && (
        <Box
          id={qrcodeRegionId}
          sx={{ width: "100%", height: 300, border: "1px solid #ccc" }}
        />
      )}
    </Stack>
  );
};

export default QRScanner;
