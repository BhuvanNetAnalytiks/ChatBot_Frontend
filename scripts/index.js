// Required DOM elements and state
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
let isChatOpen = false;
let orchestrationSteps = []; 
let currentStep = null; // To track the current step being executed
let parameterIndex = 0; // To track the current parameter being asked
let requestBody = {}; 

// Prevent chat from closing when clicking inside it
chatContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Chat container clicked, preventing propagation');
});

// Function to load the orchestration file
async function loadOrchestrationFile() {
    console.log('Loading Orchestration File...');
    try {
        const response = await fetch('http://127.0.0.1:5002/orchestration.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Orchestration file loaded successfully:', data);
        return data;
    } catch (error) {
        console.error('Error loading orchestration file:', error);
        throw error;
    }
}

// Function to execute the ServiceNow ticket creation step
async function createServiceNowTicket(step) {
    currentStep = step;
    parameterIndex = 0;
    requestBody = {};

    // Ask for the first parameter
    askForParameter();
}

// Function to ask for the next parameter
function askForParameter() {
    if (parameterIndex < currentStep.parameters.length) {
        const param = currentStep.parameters[parameterIndex];
        displayMessage(`Please enter the value for ${param.name}:`, 'bot');
    } else {
        // All parameters collected, send the API request
        sendTicketRequest();
    }
}

// Function to send the API request
async function sendTicketRequest() {
    try {
        const { endpoint, methods } = currentStep;

        // Make the API call
        const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
            method: methods[0],
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const result = await response.json();
            displayMessage(`Ticket created successfully! Ticket Number: ${result.result.number}, System ID: ${result.result.sys_id}`, 'bot');
            console.log('Ticket creation result:', result);
        } else {
            displayMessage('Failed to create ticket. Please try again.', 'bot');
        }
    } catch (error) {
        displayMessage('An error occurred while creating the ticket.', 'bot');
        console.error('Error:', error);
    }
}

// Function to toggle chat visibility
async function toggleChat() {
    // Toggle chat state
    isChatOpen = !isChatOpen;
    console.log('Chat toggled:', isChatOpen ? 'opened' : 'closed');

    // Add or remove 'open' class
    chatContainer.classList.toggle('open');

    if (isChatOpen) {
        console.log('Loading Orchestration Config...');
        try {
            const data = await loadOrchestrationFile();
            orchestrationSteps = data.steps; // Store the steps in the global variable

            // Clear existing messages when opening chat
            chatMessages.innerHTML = '';
            console.log('Chat messages cleared');

            // Display welcome messages with a slight delay between each
            displayMessage("Welcome! How can I assist you today?", 'bot');
            console.log("Successfully loaded Orchestration Config");
        } catch (error) {
            console.error('Error loading welcome messages:', error);
            displayMessage("Sorry, I'm having trouble loading messages.", 'bot');
        }

        setTimeout(() => {
            chatInput.focus();
            console.log('Input focused');
        }, 800);
    }
}

// Function to send a message
function sendMessage() {
    const messageText = chatInput.value.trim();
    console.log('Attempting to send message:', messageText);

    if (messageText === "") {
        console.log('Empty message, ignoring');
        return;
    }

    // Display user's message
    console.log('Displaying user message');
    displayMessage(messageText, 'user');

    // Process the user message
    processUserMessage(messageText);

    // Clear the input field
    chatInput.value = "";
    console.log('Input field cleared');
}

// Function to process the user message
function processUserMessage(message) {
    // Normalize the message by trimming whitespace and converting to lowercase
    const normalizedMessage = message.trim().toLowerCase();

    // Check if the message includes "create ticket"
    if (normalizedMessage.includes('create ticket')) {
        if (orchestrationSteps.length === 0) {
            displayMessage('No orchestration loaded. Please load an orchestration first.', 'bot');
            return;
        }

        // Find the ServiceNow ticket creation step
        const serviceNowStep = orchestrationSteps.find(step => step.function === 'create_servicenow_incident');

        if (serviceNowStep) {
            // Execute the ServiceNow ticket creation step
            console.log('Executing ServiceNow ticket creation step');
            createServiceNowTicket(serviceNowStep);
        } else {
            displayMessage('ServiceNow ticket creation step not found in the orchestration.', 'bot');
        }
    } else if (currentStep && parameterIndex < currentStep.parameters.length) {
        // Store the user's input for the current parameter
        const param = currentStep.parameters[parameterIndex];
        requestBody[param.name] = message;

        // Move to the next parameter
        parameterIndex++;
        askForParameter();
    } else if (normalizedMessage === "hi") {
        console.log('Hi detected, preparing bot response');
        setTimeout(() => {
            displayMessage("Hello", 'bot');
            console.log('Bot response sent');
        }, 500);
    } else {
        displayMessage('How can I assist you?', 'bot');
    }
}

// Function to display messages in the chat
function displayMessage(text, sender) {
    console.log(`Creating new message - Text: "${text}", Sender: ${sender}`);

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = text;
    chatMessages.appendChild(messageElement);

    // Add visible class for animation
    setTimeout(() => {
        messageElement.classList.add('visible');
        console.log(`Message visibility class added for: "${text}"`);
    }, 10);

    // Scroll to the bottom of the chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
    console.log('Chat scrolled to bottom');
}

// Add event listener for Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        console.log('Enter key pressed, sending message');
        sendMessage();
    }
});

// Log when the script loads
console.log('Chat script initialized');