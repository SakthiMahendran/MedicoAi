import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  styled,
  Avatar,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SendIcon from "@mui/icons-material/Send";

const BASE_URL = "http://localhost:8000";

const ChatCard = styled(Card)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(3),
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  height: "80vh",
  display: "flex",
  flexDirection: "column",
}));

const MessageContainer = styled(Box)({
  flex: 1,
  overflowY: "auto",
  marginBottom: "16px",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: "4px",
  },
});

const Message = styled(Paper)(({ theme, isAi }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  maxWidth: "80%",
  width: "fit-content",
  backgroundColor: isAi ? "#f8f9fa" : theme.palette.primary.main,
  color: isAi ? "inherit" : "#fff",
  borderRadius: "12px",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    width: 0,
    height: 0,
    borderTop: "8px solid transparent",
    borderBottom: "8px solid transparent",
    top: "20px",
    ...(isAi
      ? {
          left: "-8px",
          borderRight: `8px solid ${theme.palette.background.paper}`,
        }
      : {
          right: "-8px",
          borderLeft: `8px solid ${theme.palette.primary.main}`,
        }),
  },
}));

const MessageWrapper = styled(Box)(({ isAi }) => ({
  display: "flex",
  justifyContent: isAi ? "flex-start" : "flex-end",
  alignItems: "flex-start",
  gap: "12px",
  padding: "8px 16px",
}));

const TimeStamp = styled(Typography)({
  fontSize: "0.75rem",
  color: "#666",
  marginTop: "4px",
  textAlign: "right",
});

const ChatPage = () => {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuery = async () => {
    if (!query.trim()) {
      setError("Please enter a question.");
      return;
    }

    setError("");
    setIsLoading(true);

    // Add user message
    const userMessage = {
      content: query.trim(),
      timestamp: new Date().toISOString(),
      type: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");

    try {
      const { data } = await axios.get(`${BASE_URL}/api/ai/chat/`, {
        params: { query: userMessage.content },
      });

      // Add AI response
      const aiMessage = {
        content: data.response,
        timestamp: new Date().toISOString(),
        type: "ai",
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred while querying AI."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleQuery();
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#FFF0F5", py: 6 }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: "bold",
            color: "#FF1493",
            mb: 1,
          }}
        >
          MedicAI Chat
        </Typography>
        <Typography
          variant="h6"
          align="center"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Ask questions based on your uploaded report.
        </Typography>

        <ChatCard>
          <MessageContainer>
            {messages.map((message, index) => (
              <MessageWrapper key={index} isAi={message.type === "ai"}>
                <Avatar
                  sx={{
                    bgcolor: message.type === "ai" ? "#f8f9fa" : "primary.main",
                    color: message.type === "ai" ? "primary.main" : "white",
                  }}
                >
                  {message.type === "ai" ? (
                    <SmartToyOutlinedIcon />
                  ) : (
                    <PersonOutlineOutlinedIcon />
                  )}
                </Avatar>
                <Box sx={{ maxWidth: "80%" }}>
                  <Message isAi={message.type === "ai"}>
                    {message.type === "ai" ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </Message>
                  <TimeStamp>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </TimeStamp>
                </Box>
              </MessageWrapper>
            ))}
            <div ref={messagesEndRef} />
          </MessageContainer>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              variant="outlined"
              disabled={isLoading}
            />
            <IconButton
              onClick={handleQuery}
              disabled={isLoading}
              color="primary"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                width: "56px",
                height: "56px",
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
        </ChatCard>
      </Container>
    </Box>
  );
};

export default ChatPage;