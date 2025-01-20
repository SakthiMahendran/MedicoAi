import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  Paper,
  styled,
  Container,
  Stack,
  Grid,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  ReceiptLong as ReceiptIcon,
  Chat as ChatIcon,
  Insights as InsightsIcon,
} from "@mui/icons-material";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

const DragDropZone = styled(Paper)(({ theme, isDragging }) => ({
  border: "2px dashed",
  borderColor: isDragging ? theme.palette.primary.main : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: "center",
  backgroundColor: isDragging
    ? theme.palette.action.hover
    : theme.palette.background.paper,
  transition: "all 0.3s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const VisuallyHiddenInput = styled("input")({
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
});

const BackgroundAnimation = styled("div")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  zIndex: -1,
  background: `linear-gradient(120deg, rgba(255, 182, 193, 0.5) 0%, rgba(255, 105, 180, 0.7) 50%, rgba(255, 240, 245, 0.5) 100%)`,
  backgroundSize: "400% 400%",
  animation: "gradient 10s ease infinite",
  "@keyframes gradient": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
});

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const supportedFormats = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const uploadedFile = e.dataTransfer.files[0];
    validateAndSetFile(uploadedFile);
  }, []);

  const handleFileChange = useCallback((e) => {
    const uploadedFile = e.target.files[0];
    validateAndSetFile(uploadedFile);
  }, []);

  const validateAndSetFile = (uploadedFile) => {
    if (!uploadedFile) return;

    if (!supportedFormats.includes(uploadedFile.type)) {
      setError("Unsupported file format. Please upload a PDF, DOCX, DOC, or TXT file.");
      setFile(null);
      return;
    }

    if (uploadedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setFile(null);
      return;
    }

    setFile(uploadedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file before uploading");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${BASE_URL}/api/ai/chat/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploadProgress(progress);
        },
      });

      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <BackgroundAnimation />
      <Container maxWidth="lg" sx={{ pt: 8, pb: 8 }}>
        <Stack spacing={6}>
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                color: "#FF1493",
              }}
            >
              Welcome to MedicAI
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Upload your patient reports to get personalized medical insights.
            </Typography>
          </Box>

          {/* Feature Cards Section */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FeatureCard elevation={2}>
                <ReceiptIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h6">Analyze Reports</Typography>
                <Typography color="text.secondary">
                  Upload medical documents and let AI summarize key insights.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FeatureCard elevation={2}>
                <InsightsIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h6">Insights & Analysis</Typography>
                <Typography color="text.secondary">
                  Gain actionable insights into patient data with AI support.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FeatureCard elevation={2}>
                <ChatIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h6">Chat with AI</Typography>
                <Typography color="text.secondary">
                  Ask questions and get advice based on the uploaded reports.
                </Typography>
              </FeatureCard>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <Card elevation={3} sx={{ width: "100%", maxWidth: 600, p: 2, pt: 3 }}>
              <CardContent>
                <DragDropZone
                  isDragging={isDragging}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                >
                  <Typography variant="h6" gutterBottom>
                    Drag and Drop or Select Your Patient Report
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Supported file types: PDF, DOCX, DOC, TXT (max size: 5MB)
                  </Typography>
                  <label htmlFor="file-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 2 }}
                    >
                      Select File
                    </Button>
                  </label>
                  <VisuallyHiddenInput
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                </DragDropZone>
                {file && <Typography sx={{ mt: 2 }}>{file.name}</Typography>}
                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                >
                  {isUploading ? `Uploading... (${uploadProgress}%)` : "Analyze Report"}
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;
