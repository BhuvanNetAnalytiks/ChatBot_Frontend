const chatContainer = document.getElementById("chat-container");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
let isChatOpen = false;
let orchestrationSteps = [];
let currentStep = null; 
let parameterIndex = 0; 
let ticketData = {}; 
let availableTicketingSystems = []; 
let availableDatabases = []; 

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
        
        // Identify available ticketing systems and databases
        identifyTicketingSystems(data.steps);
        identifyDatabases(data.steps);
        
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

// Function to identify available databases in the orchestration steps
function identifyDatabases(steps) {
    availableDatabases = [];
    
    // Map of function names to databases
    const databaseFunctions = {
        'semantic_search_and_answer': 'Milvus'
    };
    
    // Check each step to see if it's a database function
    steps.forEach(step => {
        const database = databaseFunctions[step.function];
        if (database && !availableDatabases.includes(database)) {
            availableDatabases.push({
                name: database,
                function: step.function,
                step: step
            });
        }
    });
    
    console.log('Available databases:', availableDatabases.map(db => db.name));
}

async function fetchGreeting() {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        const endpoint = `${baseUrl}/greeting`;
        const method = "POST"; // Assuming the method is POST as per your JSON

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        console.log('Greeting API Response:', result);

        if (response.ok) {
            return result.result; // Assuming the backend returns { "greeting": "Good Morning!" }
        } else {
            console.error('Error fetching greeting:', result);
            return "Hello"; // Fallback greeting in case of an error
        }
    } catch (error) {
        console.error('Error while fetching greeting:', error.message);
        return "Hello"; // Fallback greeting in case of an error
    }
}

async function displayGreetingAndDefaultMessage() {
    const greeting = await fetchGreeting();
    const defaultMessage = 'How can I assist you? You can say "create ticket" or "fetch data".';
    const fullMessage = `${greeting} ${defaultMessage}`;
    displayMessage(fullMessage, 'bot');
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

// Function to create a ticket
function createTicket(step) {
    currentStep = step;
    parameterIndex = 0;
    ticketData = {}; // Reset ticketData for the new ticket creation
    
    // Ask for the first parameter
    askForParameter();
}

// Function to initiate the data fetching process
function initiateDataFetching() {
    if (availableDatabases.length === 0) {
        displayMessage('No databases available in the current orchestration.', 'bot');
        return;
    }
    
    // If there's only one database available, use it directly
    if (availableDatabases.length === 1) {
        const database = availableDatabases[0];
        displayMessage(`Fetching data from ${database.name}...`, 'bot');
        fetchData(database.step);
        return;
    }
    
    // If there are multiple databases, prompt the user to select one
    displayMessage('Please select a database to fetch data from:', 'bot');
    availableDatabases.forEach((db, index) => {
        displayMessage(`${index + 1}. ${db.name}`, 'bot');
    });
}

// Function to fetch data from a database
function fetchData(step) {
    currentStep = step;
    parameterIndex = 0;
    ticketData = {}; // Reset ticketData for the new data fetching process
    
    // Ask for the first parameter
    askForParameter();
}

// Function to ask for the next parameter
function askForParameter() {
    if (parameterIndex < currentStep.parameters.length) {
        const param = currentStep.parameters[parameterIndex];
        let promptMessage = `Please enter the value for ${param.name}:`;
        
        // Add helpful context for specific parameters
        if (param.name === 'top_k') {
            promptMessage += " (e.g., 5)";
        }
        
        displayMessage(promptMessage, 'bot');
    } else {                                        //
        // All parameters collected, send the API request
        if (currentStep.function.startsWith('create_')) {
            sendTicketRequest();
        } else if (currentStep.function === 'semantic_search_and_answer') {
            sendDataFetchRequest();
        }
    }
}

// Function to send the ticket request
async function sendTicketRequest() {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        const endpoint = `${baseUrl}${currentStep.endpoint}`;
        const method = currentStep.methods[0]; // Assuming the first method is the primary one

        const requestBody = JSON.stringify(ticketData);

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        const result = await response.json();
        console.log(`${currentStep.function} API Response:`, result);

        if (response.ok) {
            const successMessage = `Ticket created successfully! Response: ${JSON.stringify(result)}`;
            displayMessage(successMessage, 'bot');
        } else {
            console.error(`Error creating the ticket:`, result);
            displayMessage(`Error creating the ticket. ${result.error || 'Please try again later.'}`, 'bot');
        }
    } catch (error) {
        console.error(`Error while creating the ticket:`, error.message);
        displayMessage("An error occurred while creating the ticket.", 'bot');
    }
}

// Function to send the data fetch request
async function sendDataFetchRequest() {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        const endpoint = `${baseUrl}${currentStep.endpoint}`;
        const method = currentStep.methods[0]; // Assuming the first method is the primary one

        const requestBody = JSON.stringify(ticketData);

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        const result = await response.json();
        console.log(`${currentStep.function} API Response:`, result);

        if (response.ok) {
            const successMessage = `Data fetched successfully! Response: ${JSON.stringify(result)}`;
            displayMessage(successMessage, 'bot');
        } else {
            console.error(`Error fetching data:`, result);
            displayMessage(`Error fetching data. ${result.error || 'Please try again later.'}`, 'bot');
        }
    } catch (error) {
        console.error(`Error while fetching data:`, error.message);
        displayMessage("An error occurred while fetching the data.", 'bot');
    }
}

// Function to toggle chat visibility
async function toggleChat() {
    isChatOpen = !isChatOpen;
    console.log('Chat toggled:', isChatOpen ? 'opened' : 'closed');
    
    chatContainer.classList.toggle('open');
    
    if (isChatOpen) {
        console.log('Loading Orchestration Config...');
        try {
            const data = await loadOrchestrationFile();
            orchestrationSteps = data.steps; // Store the steps in the global variable
            
            chatMessages.innerHTML = '';
            console.log('Chat messages cleared');
            
            displayGreetingAndDefaultMessage();
            console.log("Successfully loaded Orchestration Config");
            
            if (availableTicketingSystems.length > 0) {
                const systems = availableTicketingSystems.map(sys => sys.name).join(', ');
                setTimeout(() => {
                    // displayMessage(`Available ticketing systems: ${systems}. You can say "create ticket" to start the process.`, 'bot');
                }, 500);
            }
            if (availableDatabases.length > 0) {
                const databases = availableDatabases.map(db => db.name).join(', ');
                setTimeout(() => {
                    // displayMessage(`Available databases: ${databases}. You can say "fetch data" to start the process.`, 'bot');
                }, 1000);
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
    
    displayMessage(messageText, 'user');
    processUserMessage(messageText);
    chatInput.value = "";
    console.log('Input field cleared');
}

// Function to process the user message
function processUserMessage(message) {
    const normalizedMessage = message.trim().toLowerCase();
    
    if (normalizedMessage.includes('create ticket')) {
        if (orchestrationSteps.length === 0) {
            displayMessage('No orchestration loaded. Please load an orchestration first.', 'bot');
            return;
        }
        initiateTicketCreation();
    } else if (normalizedMessage.includes('fetch data')) {
        if (orchestrationSteps.length === 0) {
            displayMessage('No orchestration loaded. Please load an orchestration first.', 'bot');
            return;
        }
        initiateDataFetching();
    } else if (currentStep && parameterIndex < currentStep.parameters.length) {
        const param = currentStep.parameters[parameterIndex];
        ticketData[param.name] = message;
        parameterIndex++;
        askForParameter();
    } else if (normalizedMessage === "hi" || normalizedMessage === "hello") {
        setTimeout(() => {
            displayMessage("Hello! I can help you create tickets or fetch data. Just say 'create ticket' or 'fetch data' to get started.", 'bot');
        }, 500);
    } else {
        displayGreetingAndDefaultMessage();
    }
}

async function displayMessage(text, sender) {
    console.log(`Creating new message - Text: "${text}", Sender: ${sender}`);
    
    // Create and display the message in the chat
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = text;
    chatMessages.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.classList.add('visible');
    }, 10);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Send the message to the backend
    try {
        const baseUrl = "http://127.0.0.1:5000"; // Replace with your backend URL
        const endpoint = `${baseUrl}/log_message`; // Replace with your API endpoint
        const method = "POST"; // Use POST to send data

        const requestBody = JSON.stringify({
            message: text,
            sender: sender
        });

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        const result = await response.json();
        console.log('Message logged successfully:', result);
    } catch (error) {
        console.error('Error logging message:', error);
    }
}

// Add event listener for Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Log when the script loads
    console.log('Enhanced chat script initialized with ticketing and data fetching support');