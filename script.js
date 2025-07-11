// script.js
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // !!! IMPORTANT: FOR LOCAL TESTING ONLY. DO NOT EXPOSE YOUR API KEY IN PRODUCTION !!!
    // Get your API key from Google AI Studio: https://ai.google.dev/aistudio
    const GEMINI_API_KEY = 'AIzaSyB0svCI9QLtSmw20qA28NfYFgKbMFJaRSw'; // <--- PASTE YOUR API KEY HERE

    // Function to add a message to the chat display
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        // Scroll to the bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to get bot response directly from Gemini API
    async function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();

        // --- CUSTOM RESPONSE FOR CREATOR QUESTION ---
        if (lowerCaseMessage.includes('who is your creator') ||
            lowerCaseMessage.includes('who created you') ||
            lowerCaseMessage.includes('who made you') ||
            lowerCaseMessage.includes('your creator')) {
            return "I was created by Reman Dey."; // Your specified response
        }
        // --- END CUSTOM RESPONSE ---

        // --- CUSTOM RESPONSE FOR BIOGRAPHY QUESTION ---
        if (lowerCaseMessage.includes('who is reman dey') ||
            lowerCaseMessage.includes('tell me about reman dey') ||
            lowerCaseMessage.includes('reman dey biography') ||
            lowerCaseMessage.includes('about reman dey')) {
            return "Reman Dey was born on November 15, 2006. He is a physics enthusiast with a profound passion for hands-on innovation and solving tough, research-oriented physics problems. His journey in STEM is fueled by a relentless curiosity and a drive to transform complex ideas into tangible solutions.";
        }
        // --- END CUSTOM RESPONSE ---


        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: userMessage
                        }]
                    }]
                })
            });

            if (!response.ok) {
                // If the response is not OK (e.g., 400, 500 status)
                const errorData = await response.json();
                console.error('Gemini API error:', errorData);
                return `An API error occurred: ${errorData.error.message || 'Unknown error'}. Please try again.`;
            }

            const data = await response.json();
            // Gemini API response structure can be nested. Adjust based on exact response.
            // This common path extracts text from the first part of the first candidate.
            if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                return data.candidates[0].content.parts[0].text;
            } else {
                console.error('Unexpected Gemini API response structure:', data);
                return "I received an unexpected response from the AI. Could you rephrase?";
            }

        } catch (error) {
            console.error('Error fetching AI response:', error);
            return "I'm having trouble connecting right now. Please check your internet or API key.";
        }
    }

    // Event listener for sending message
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = ''; // Clear input

            // Add a "typing..." indicator (optional, but good UX)
            const typingIndicator = document.createElement('div');
            typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
            typingIndicator.textContent = 'Dodo is thinking...';
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;


            const botResponse = await getBotResponse(message);

            // Remove typing indicator before adding the actual message
            chatMessages.removeChild(typingIndicator);

            addMessage(botResponse, 'bot');
        }
    }

    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial bot greeting
    addMessage("Hello! I'm Dodo, your AI companion for a deep chat. What's on your mind?", 'bot');
});