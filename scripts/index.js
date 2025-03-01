// JS for all 3 Ticketing Systems

// Required DOM elements and state
const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
let isChatOpen = false;
let orchestrationSteps = [];
let currentStep = null; // To track the current step being executed
let parameterIndex = 0; // To track the current parameter being asked
let ticketData = {}; // Global variable to hold the ticket data
let availableTicketingSystems = []; // To store available ticketing systems

// Prevent chat from closing when clicking inside it
chatContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Chat container clicked, preventing propagation');
});

// Function to load the orchestration file
async function loadOrchestrationFile() {
    console.log('Loading Orchestration File...');
    try {
        const response = await fetch('http://127.0.0.1:5000/get_orchestration');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Orchestration file loaded successfully:', data);
        
        // Identify available ticketing systems
        identifyTicketingSystems(data.steps);
        
        return data;
    } catch (error) {
        console.error('Error loading orchestration file:', error);
        throw error;
    }
}

// Function to identify available ticketing systems in the orchestration steps
function identifyTicketingSystems(steps) {
    availableTicketingSystems = [];
    
    // Map of function names to ticketing systems
    const ticketingFunctions = {
        'create_servicenow_incident': 'ServiceNow',
        'create_zendesk_incident': 'Zendesk',
        'create_jira_incident': 'Jira'
    };
    
    // Check each step to see if it's a ticketing function
    steps.forEach(step => {
        const system = ticketingFunctions[step.function];
        if (system && !availableTicketingSystems.includes(system)) {
            availableTicketingSystems.push({
                name: system,
                function: step.function,
                step: step
            });
        }
    });
    
    console.log('Available ticketing systems:', availableTicketingSystems.map(sys => sys.name));
}

// Function to initiate the ticket creation process
function initiateTicketCreation() {
    if (availableTicketingSystems.length === 0) {
        displayMessage('No ticketing systems available in the current orchestration.', 'bot');
        return;
    }
    
    // If there's only one ticketing system available, use it directly
    if (availableTicketingSystems.length === 1) {
        const system = availableTicketingSystems[0];
        displayMessage(`Creating a ${system.name} ticket...`, 'bot');
        createTicket(system.step);
        return;
    }
    
    // If there are multiple systems, use the first one available in this priority order:
    const priorityOrder = ['ServiceNow', 'Jira', 'Zendesk'];
    for (const priority of priorityOrder) {
        const system = availableTicketingSystems.find(sys => sys.name === priority);
        if (system) {
            displayMessage(`Creating a ${system.name} ticket...`, 'bot');
            createTicket(system.step);
            return;
        }
    }
}

// Generic function to create a ticket for any supported system
function createTicket(step) {
    currentStep = step;
    parameterIndex = 0;
    ticketData = {}; // Reset ticketData for the new ticket creation
    
    // Ask for the first parameter
    askForParameter();
}

// Function to ask for the next parameter
function askForParameter() {
    if (parameterIndex < currentStep.parameters.length) {
        const param = currentStep.parameters[parameterIndex];
        let promptMessage = `Please enter the value for ${param.name}:`;
        
        // Add helpful context for specific parameters based on the system
        if (currentStep.function === 'create_zendesk_incident') {
            if (param.name === 'priority') {
                promptMessage += " (low, normal, high, urgent)";
            } else if (param.name === 'type') {
                promptMessage += " (question, incident, problem, task)";
            }
        } else if (currentStep.function === 'create_jira_incident') {
            if (param.name === 'issuetype') {
                promptMessage += " (Bug, Task, Story, Epic)";
            } else if (param.name === 'project_key') {
                promptMessage += " (e.g., PROJ)";
            }
        } else if (currentStep.function === 'create_servicenow_incident') {
            if (param.name === 'urgency') {
                promptMessage += " (1-High, 2-Medium, 3-Low)";
            } else if (param.name === 'impact') {
                promptMessage += " (1-High, 2-Medium, 3-Low)";
            }
        }
        
        displayMessage(promptMessage, 'bot');
    } else {
        // All parameters collected, send the API request based on the ticketing system
        sendTicketRequest();
    }
}

// Function to send the ticket request dynamically based on the JSON configuration
async function sendTicketRequest() {
    try {
        // Base API URL
        const baseUrl = "http://127.0.0.1:5000";

        // Extract endpoint and method from the JSON configuration
        if (!currentStep || !currentStep.endpoint || !currentStep.methods) {
            displayMessage("Invalid ticketing configuration. Cannot create ticket.", 'bot');
            return;
        }

        const endpoint = `${baseUrl}${currentStep.endpoint}`;
        const method = currentStep.methods[0]; // Assuming the first method is the primary one

        // Prepare the request payload
        const requestBody = JSON.stringify(ticketData);

        // Make the API call
        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        // Parse response as JSON
        const result = await response.json();
        console.log(`${currentStep.function} API Response:`, result);

        // Determine success message and extract ticket ID dynamically
        let ticketId = "";
        let successMessagePrefix = "";

        switch (currentStep.function) {
            case "create_servicenow_incident":
                ticketId = result.result?.number || "Unknown ID";
                successMessagePrefix = "ServiceNow ticket created successfully! Incident ID:";
                break;
            case "create_zendesk_incident":
                ticketId = result.result?.ticket?.id || "Unknown ID";
                successMessagePrefix = "Zendesk ticket created successfully! Ticket ID:";
                break;
            case "create_jira_incident":
                ticketId = result?.key || "Unknown ID";
                successMessagePrefix = "Jira ticket created successfully! Issue ID:";
                break;
            default:
                displayMessage("Unknown ticketing system. Cannot create ticket.", 'bot');
                return;
        }

        // Handle API success and error response
        if (response.ok) {
            const successMessage = `${successMessagePrefix} ${ticketId}`;
            console.log(successMessage);
            displayMessage(successMessage, 'bot');
        } else {
            console.error(`Error creating the ${currentStep.function}:`, result);
            displayMessage(`Error creating the ticket. ${result.error || 'Please try again later.'}`, 'bot');
        }
    } catch (error) {
        console.error(`Error while creating ${currentStep.function}:`, error.message);
        displayMessage("An error occurred while creating the ticket.", 'bot');
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
            
            // Inform about available ticketing systems if any
            if (availableTicketingSystems.length > 0) {
                const systems = availableTicketingSystems.map(sys => sys.name).join(', ');
                setTimeout(() => {
                    displayMessage(`Available ticketing systems: ${systems}. You can say "create ticket" to start the process.`, 'bot');
                }, 500);
            }
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
        
        initiateTicketCreation();
    } else if (currentStep && parameterIndex < currentStep.parameters.length) {
        // Store the user's input for the current parameter
        const param = currentStep.parameters[parameterIndex];
        ticketData[param.name] = message;
        
        // Move to the next parameter
        parameterIndex++;
        askForParameter();
    } else if (normalizedMessage === "hi" || normalizedMessage === "hello") {
        console.log('Greeting detected, preparing bot response');
        setTimeout(() => {
            displayMessage("Hello! I can help you create tickets in our system. Just say 'create ticket' to get started.", 'bot');
            console.log('Bot response sent');
        }, 500);
    } else if (normalizedMessage.includes('status') && normalizedMessage.includes('ticket')) {
        // Handle ticket status requests
        const viewStatusStep = orchestrationSteps.find(step => 
            step.function === 'view_jira_ticket_status' || 
            step.function.includes('view') || 
            step.function.includes('status')
        );
        
        if (viewStatusStep) {
            displayMessage("Please provide the ticket ID to check its status:", 'bot');
            currentStep = viewStatusStep;
            parameterIndex = 0;
            ticketData = {};
        } else {
            displayMessage("I don't see any ticket status function in the current orchestration.", 'bot');
        }
    } else {
        displayMessage('How can I assist you? You can say "create ticket" to start the ticketing process.', 'bot');
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
console.log('Enhanced chat script initialized with multi-platform ticketing support');


