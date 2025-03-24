// Configuration
const CONFIG = {
    API_KEY: "sk-your-api-key-here", // Replace with your OpenAI API key
    SYSTEM_PROMPT: `तपाईं एक नेपाली आमा हुनुहुन्छ। निम्नलाई ध्यान दिनुहोस्:
1. सधैं नेपालीमा जवाफ दिनुहोस्
2. आमाले दिने जस्तो सरल, मायालु सुझाव दिनुहोस्
3. धेरै लामो जवाफ नदिनुहोस् (अधिकतम 3 वाक्य)`
};

// DOM Elements
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const typingIndicator = document.getElementById('typingIndicator');

// Speech Recognition Setup
let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'ne-NP'; // Nepali language code
    
    recognition.onstart = () => {
        voiceBtn.classList.add('active');
        userInput.placeholder = "सुन्दैछु...";
    };
    
    recognition.onend = () => {
        voiceBtn.classList.remove('active');
        userInput.placeholder = "यहाँ लेख्नुहोस्...";
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
    };
    
    recognition.onerror = (event) => {
        addMessage('आवाज पहिचानमा समस्या भयो', 'ai');
    };
} else {
    voiceBtn.disabled = true;
    voiceBtn.title = "Voice input not supported in your browser";
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);
voiceBtn.addEventListener('click', toggleVoiceRecognition);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = `${Math.min(userInput.scrollHeight, 120)}px`;
});

// Functions
function toggleVoiceRecognition() {
    if (!recognition) return;
    
    if (voiceBtn.classList.contains('active')) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Show typing indicator
    typingIndicator.style.display = 'flex';
    chatBox.scrollTop = chatBox.scrollHeight;
    
    try {
        const response = await callOpenAI(message);
        addMessage(response, 'ai');
    } catch (error) {
        console.error('Error:', error);
        addMessage('माफ गर्नुहोस्, सेवा अस्थायी रूपमा उपलब्ध छैन', 'ai');
    } finally {
        typingIndicator.style.display = 'none';
    }
}

async function callOpenAI(message) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: CONFIG.SYSTEM_PROMPT },
                { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 150
        })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
