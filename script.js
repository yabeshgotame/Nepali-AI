// Shared OpenAI API Key (Free tier - replace with yours if needed)
const API_KEY = "sk-proj-xxxxxxxxxxxxxxxx"; // Note: For demo only. In production, use a backend.

document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("voiceBtn").addEventListener("click", startVoiceInput);

// Function to send user message to AI
async function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    // Add user message to chat
    addMessage(userInput, "user");

    // Call OpenAI API for Nepali response
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful Nepali mother. Respond only in Nepali." },
                    { role: "user", content: userInput }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        addMessage(aiResponse, "ai");
    } catch (error) {
        addMessage("माफ गर्नुहोस्, समस्य आयो। फेरी प्रयास गर्नुहोस्।", "ai");
    }

    document.getElementById("userInput").value = "";
}

// Voice Input (Nepali)
function startVoiceInput() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "ne-NP"; // Nepali language code
    recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        document.getElementById("userInput").value = spokenText;
    };
    recognition.start();
}

// Add message to chat box
function addMessage(text, sender) {
    const chatBox = document.getElementById("chatBox");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(`${sender}-message`);
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
      }
