import React, { useEffect } from 'react';
import { Widget, addResponseMessage } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';

const ChatbotWidget = () => {
  useEffect(() => {
    // Send an initial welcome message when the widget loads
    addResponseMessage('Welcome to Accessriano Support! How can we help you today?');
  }, []);

  const handleNewUserMessage = (newMessage) => {
    // Here you can integrate with a chatbot API (like Dialogflow) or handle responses manually
    console.log(`New message received: ${newMessage}`);
    // For now, we'll simply echo the user's message as a demo response
    addResponseMessage(`You said: ${newMessage}`);
  };

  return (
    <div className="chat-widget">
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title="Accessriano Support"
        subtitle="Chat with us for quick help"
      />
    </div>
  );
};

export default ChatbotWidget;
