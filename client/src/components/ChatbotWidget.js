import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  Fab,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import API_BASE_URL from '../config';

const ChatbotWidget = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{ text: t('chatbot.welcome_message'), sender: 'bot' }]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      console.log('Sending message to chatbot:', {
        message: userMessage,
        sessionId,
        language: i18n.language
      });

      const { data } = await axios.post(`${API_BASE_URL}/chatbot/message`, {
        message: userMessage,
        sessionId,
        language: i18n.language
      });

      console.log('Chatbot response:', data);

      if (data.success) {
        setMessages(prev => [...prev, { text: data.response, sender: 'bot' }]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        text: t('chatbot.error'),
        sender: 'bot',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Collapse in={isOpen} timeout="auto">
        <Paper
          elevation={3}
          sx={{
            width: 300,
            height: 400,
            display: 'flex',
            flexDirection: 'column',
            mb: 2,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h6">{t('chatbot.title')}</Typography>
            <IconButton 
              size="small" 
              onClick={() => setIsOpen(false)} 
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <List sx={{ 
            flex: 1, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}>
            {messages.map((message, index) => (
              <ListItem
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  p: 0
                }}
              >
                <Paper
                  sx={{
                    p: 1,
                    bgcolor: message.error ? 'error.light' : 
                            message.sender === 'user' ? 'primary.light' : 'grey.100',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    maxWidth: '80%',
                  }}
                >
                  <ListItemText 
                    primary={message.text}
                    sx={{
                      '& .MuiListItemText-primary': {
                        wordBreak: 'break-word'
                      }
                    }}
                  />
                </Paper>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>

          {/* Input */}
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={t('chatbot.placeholder')}
              disabled={isLoading}
              multiline
              maxRows={3}
              sx={{ mr: 1 }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
            </IconButton>
          </Box>
        </Paper>
      </Collapse>

      {/* Toggle Button */}
      <Fab
        color="primary"
        onClick={() => setIsOpen(!isOpen)}
        sx={{ boxShadow: 3 }}
      >
        <ChatIcon />
      </Fab>
    </Box>
  );
};

export default ChatbotWidget;
