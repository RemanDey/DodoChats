// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Splash screen transition
    setTimeout(() => {
        document.getElementById('splash-screen').style.display = 'none';
        document.querySelector('.chat-container').style.display = 'flex';
    }, 5000);

    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // !!! WARNING: FOR LOCAL TESTING ONLY !!!
    const GEMINI_API_KEY = 'AIzaSyB0svCI9QLtSmw20qA28NfYFgKbMFJaRSw'; // Replace this

    function addMessage(message, sender, delay = 0) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        if (sender === 'user' || sender === 'bot') {
            const iconElement = document.createElement('i');
            iconElement.classList.add('message-icon', 'fas');
            iconElement.classList.add(sender === 'user' ? 'fa-circle-user' : 'fa-robot');
            messageDiv.appendChild(iconElement);
        }

        const textNode = document.createTextNode(message);
        messageDiv.appendChild(textNode);

        chatMessages.appendChild(messageDiv);
        void messageDiv.offsetWidth;

        setTimeout(() => {
            messageDiv.style.opacity = '1';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, delay);
    }

    async function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();

        // Hardcoded replies
        if (lowerCaseMessage.includes('your creator')) {
            return "I was created by Reman Dey.";
        }

        if (lowerCaseMessage.includes('reman dey')) {
            return "Reman Dey is a physics enthusiast with a passion for research and innovation. Born Nov 15, 2006.";
        }

        // Gemini API call
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userMessage }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API error:', errorData);
                return `API error: ${errorData.error.message || 'Unknown error'}`;
            }

            const data = await response.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            return reply || "Unexpected response from AI. Please try again.";
        } catch (err) {
            console.error('Fetch error:', err);
            return "Connection issue. Check your internet or API key.";
        }
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            userInput.disabled = true;
            sendButton.disabled = true;

            const typingIndicator = document.createElement('div');
            typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
            typingIndicator.textContent = 'Dodo is thinking...';
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            const botResponse = await getBotResponse(message);
            chatMessages.removeChild(typingIndicator);
            addMessage(botResponse, 'bot');

            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Initial greeting
    addMessage("Hello! I'm Dodo, your AI companion. What's on your mind?", 'bot', 500);
});
