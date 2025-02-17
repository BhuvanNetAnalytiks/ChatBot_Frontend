// Required DOM elements
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
let isChatOpen = false;

// Initialize chatbot
const chatbot = new Chatbot();

// Function to add message to chat
function addMessage(message, isBot = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to handle message sending
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Display user message
    addMessage(message, false);
    chatInput.value = '';

    try {
        // Show typing indicator
        addMessage("Processing your request...", true);

        // Process message through chatbot
        const response = await chatbot.handleUserInput(message);
        
        // Remove typing indicator and show response
        chatMessages.removeChild(chatMessages.lastChild);
        addMessage(response, true);

    } catch (error) {
        addMessage("Sorry, there was an error processing your request. Please try again.", true);
    }
}

// Function to toggle chat window
async function toggleChat() {
    isChatOpen = !isChatOpen;
    chatContainer.classList.toggle('open');
    
    if (isChatOpen) {
        setTimeout(() => {
            chatInput.focus();
        }, 800);
        
        // Show welcome message with available commands
        addMessage(`Welcome! I can help you with:
1. Creating tickets (try "create ticket in servicenow/zendesk/jira")
2. Asking AI (try "ask AI using claude/gemini")
3. Microsoft authentication

What would you like to do?`, true);
    }
}

// Add command suggestions
function addCommandSuggestions() {
    const suggestionsDiv = document.createElement("div");
    suggestionsDiv.className = "command-suggestions";
    suggestionsDiv.innerHTML = `
        <button onclick="suggestCommand('create ticket')">Create Ticket</button>
        <button onclick="suggestCommand('ask AI')">Ask AI</button>
        <button onclick="suggestCommand('microsoft login')">Microsoft Login</button>
    `;
    chatMessages.appendChild(suggestionsDiv);
}

// Function to suggest command
function suggestCommand(command) {
    chatInput.value = command;
    chatInput.focus();
}

// Event listener for Enter key in input
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Add these styles to your existing CSS