// script.js

document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');

  // OPTIONAL: Use your Gemini API key here if needed
  const GEMINI_API_KEY = 'AIzaSyB0svCI9QLtSmw20qA28NfYFgKbMFJaRSw'; // Replace with real key if using Gemini API

  // Adds a message to the chat with optional typing effect for bot
  function addMessage(text, sender, delay = 0) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    if (sender === 'user' || sender === 'bot') {
      const icon = document.createElement('i');
      icon.classList.add('message-icon', 'fas');
      icon.classList.add(sender === 'user' ? 'fa-circle-user' : 'fa-robot');
      messageDiv.appendChild(icon);
    }

    const textContainer = document.createElement('span');
    messageDiv.appendChild(textContainer);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    if (sender === 'bot') {
      // Typing effect
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          textContainer.textContent += text.charAt(i++);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
          clearInterval(interval);
        }
      }, 20);
    } else {
      textContainer.textContent = text;
      messageDiv.style.opacity = '1';
    }
  }

  // Returns a bot response (static or via Gemini API)
  async function getBotResponse(userMessage) {
    const msg = userMessage.toLowerCase();

    // Static replies
    if (msg.includes('your creator')) {
      return "I was created by Reman Dey.";
    }

    if (msg.includes('reman dey')) {
      return "Reman Dey is a curious mind who built me to assist with ideas and learning!";
    }

    // Fallback to Gemini API if needed
    if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_API_KEY_HERE') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: userMessage }] }]
            })
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          console.error('Gemini API Error:', errData);
          return 'API error: ' + (errData.error?.message || 'Unknown error');
        }

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return reply || "I didn't understand that. Try rephrasing?";
      } catch (err) {
        console.error('Fetch error:', err);
        return "Couldn't reach the AI service. Try again later.";
      }
    }

    // Fallback generic reply
    return "That's interesting! Tell me more.";
  }

  // Send user's message and get bot reply
  async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    userInput.disabled = true;
    sendButton.disabled = true;

    // Typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
    typingDiv.textContent = 'Dodo is thinking...';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const botReply = await getBotResponse(message);

    // Remove indicator and show typed response
    chatMessages.removeChild(typingDiv);
    addMessage(botReply, 'bot');

    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
  }

  // Event Listeners
  sendButton.addEventListener('click', sendMessage);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Initial bot greeting
  addMessage("Hello! I'm Dodo, your AI companion. Ask me anything.", 'bot', 500);
});
