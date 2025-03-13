// const chatContainer = document.getElementById("chat-container");
// const chatInput = document.getElementById("chat-input");
// const chatMessages = document.getElementById("chat-messages");
// let isChatOpen = false;
// let orchestrationSteps = [];
// let currentStep = null; 
// let parameterIndex = 0; 
// let ticketData = {}; 
// let availableTicketingSystems = []; 
// let availableDatabases = []; 

// // Prevent chat from closing when clicking inside it
// chatContainer.addEventListener('click', (e) => {
//     e.stopPropagation();
//     console.log('Chat container clicked, preventing propagation');
// });

// // Function to load the orchestration file
// async function loadOrchestrationFile() {
//     console.log('Loading Orchestration File...');
//     try {
//         const response = await fetch('http://127.0.0.1:5000/get_orchestration');
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         console.log('Orchestration file loaded successfully:', data);
        
//         // Identify available ticketing systems and databases
//         identifyTicketingSystems(data.steps);
//         identifyDatabases(data.steps);
        
//         return data;
//     } catch (error) {
//         console.error('Error loading orchestration file:', error);
//         throw error;
//     }
// }

// // Function to identify available ticketing systems in the orchestration steps
// function identifyTicketingSystems(steps) {
//     availableTicketingSystems = [];
    
//     // Map of function names to ticketing systems
//     const ticketingFunctions = {
//         'create_servicenow_incident': 'ServiceNow',
//         'create_zendesk_ticket': 'Zendesk',
//         'create_jira_incident': 'Jira'
//     };
    
//     // Check each step to see if it's a ticketing function
//     steps.forEach(step => {
//         const system = ticketingFunctions[step.function];
//         if (system && !availableTicketingSystems.includes(system)) {
//             availableTicketingSystems.push({
//                 name: system,
//                 function: step.function,
//                 step: step
//             });
//         }
//     });
    
//     console.log('Available ticketing systems:', availableTicketingSystems.map(sys => sys.name));
// }

// // Function to identify available databases in the orchestration steps
// function identifyDatabases(steps) {
//     availableDatabases = [];
    
//     // Map of function names to databases
//     const databaseFunctions = {
//         'semantic_search_and_answer': 'Milvus'
//     };
    
//     // Check each step to see if it's a database function
//     steps.forEach(step => {
//         const database = databaseFunctions[step.function];
//         if (database && !availableDatabases.includes(database)) {
//             availableDatabases.push({
//                 name: database,
//                 function: step.function,
//                 step: step
//             });
//         }
//     });
    
//     console.log('Available databases:', availableDatabases.map(db => db.name));
// }

// async function fetchGreeting() {
//     try {
//         const baseUrl = "http://127.0.0.1:5000";
//         const endpoint = `${baseUrl}/greeting`;
//         const method = "POST"; // Assuming the method is POST as per your JSON

//         const response = await fetch(endpoint, {
//             method: method,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         });

//         const result = await response.json();
//         console.log('Greeting API Response:', result);

//         if (response.ok) {
//             return result.result; // Assuming the backend returns { "greeting": "Good Morning!" }
//         } else {
//             console.error('Error fetching greeting:', result);
//             return "Hello"; // Fallback greeting in case of an error
//         }
//     } catch (error) {
//         console.error('Error while fetching greeting:', error.message);
//         return "Hello"; // Fallback greeting in case of an error
//     }
// }

// async function displayGreetingAndDefaultMessage() {
//     const greeting = await fetchGreeting();
//     const defaultMessage = 'How can I assist you? You can say "create ticket" or "fetch data".';
//     const fullMessage = `${greeting} ${defaultMessage}`;
//     displayMessage(fullMessage, 'bot');
// }

// // Function to initiate the ticket creation process
// function initiateTicketCreation() {
//     if (availableTicketingSystems.length === 0) {
//         displayMessage('No ticketing systems available in the current orchestration.', 'bot');
//         return;
//     }
    
//     // If there's only one ticketing system available, use it directly
//     if (availableTicketingSystems.length === 1) {
//         const system = availableTicketingSystems[0];
//         displayMessage(`Creating a ${system.name} ticket...`, 'bot');
//         createTicket(system.step);
//         return;
//     }
    
//     // If there are multiple systems, use the first one available in this priority order:
//     const priorityOrder = ['ServiceNow', 'Jira', 'Zendesk'];
//     for (const priority of priorityOrder) {
//         const system = availableTicketingSystems.find(sys => sys.name === priority);
//         if (system) {
//             displayMessage(`Creating a ${system.name} ticket...`, 'bot');
//             createTicket(system.step);
//             return;
//         }
//     }
// }

// // Function to create a ticket
// function createTicket(step) {
//     currentStep = step;
//     parameterIndex = 0;
//     ticketData = {}; // Reset ticketData for the new ticket creation
    
//     // Ask for the first parameter
//     askForParameter();
// }

// // Function to initiate the data fetching process
// function initiateDataFetching() {
//     if (availableDatabases.length === 0) {
//         displayMessage('No databases available in the current orchestration.', 'bot');
//         return;
//     }
    
//     // If there's only one database available, use it directly
//     if (availableDatabases.length === 1) {
//         const database = availableDatabases[0];
//         displayMessage(`Fetching data from ${database.name}...`, 'bot');
//         fetchData(database.step);
//         return;
//     }
    
//     // If there are multiple databases, prompt the user to select one
//     displayMessage('Please select a database to fetch data from:', 'bot');
//     availableDatabases.forEach((db, index) => {
//         displayMessage(`${index + 1}. ${db.name}`, 'bot');
//     });
// }

// // Function to fetch data from a database
// function fetchData(step) {
//     currentStep = step;
//     parameterIndex = 0;
//     ticketData = {}; // Reset ticketData for the new data fetching process
    
//     // Ask for the first parameter
//     askForParameter();
// }

// // Function to ask for the next parameter
// function askForParameter() {
//     if (parameterIndex < currentStep.parameters.length) {
//         const param = currentStep.parameters[parameterIndex];
//         let promptMessage = `Please enter the value for ${param.name}:`;
        
//         // Add helpful context for specific parameters
//         if (param.name === 'top_k') {
//             promptMessage += " (e.g., 5)";
//         }
        
//         displayMessage(promptMessage, 'bot');
//     } else {                                        //
//         // All parameters collected, send the API request
//         if (currentStep.function.startsWith('create_')) {
//             sendTicketRequest();
//         } else if (currentStep.function === 'semantic_search_and_answer') {
//             sendDataFetchRequest();
//         }
//     }
// }

// // Function to send the ticket request
// async function sendTicketRequest() {
//     try {
//         const baseUrl = "http://127.0.0.1:5000";
//         const endpoint = `${baseUrl}${currentStep.endpoint}`;
//         const method = currentStep.methods[0]; // Assuming the first method is the primary one

//         const requestBody = JSON.stringify(ticketData);

//         const response = await fetch(endpoint, {
//             method: method,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: requestBody,
//         });

//         const result = await response.json();
//         console.log(`${currentStep.function} API Response:`, result);

//         if (response.ok) {
//             const successMessage = `Ticket created successfully! Response: ${JSON.stringify(result.result.number)}`;
//             displayMessage(successMessage, 'bot');
//         } else {
//             console.error(`Error creating the ticket:`, result);
//             displayMessage(`Error creating the ticket. ${result.error || 'Please try again later.'}`, 'bot');
//         }
//     } catch (error) {
//         console.error(`Error while creating the ticket:`, error.message);
//         displayMessage("An error occurred while creating the ticket.", 'bot');
//     }
// }

// // Function to send the data fetch request
// async function sendDataFetchRequest() {
//     try {
//         const baseUrl = "http://127.0.0.1:5000";
//         const endpoint = `${baseUrl}${currentStep.endpoint}`;
//         const method = currentStep.methods[0]; // Assuming the first method is the primary one

//         const requestBody = JSON.stringify(ticketData);

//         const response = await fetch(endpoint, {
//             method: method,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: requestBody,
//         });

//         const result = await response.json();
//         console.log(`${currentStep.function} API Response:`, result);

//         if (response.ok) {
//             const successMessage = `Data fetched successfully! ${JSON.stringify(result.result)}`;
//             displayMessage(successMessage, 'bot');
//         } else {
//             console.error(`Error fetching data:`, result);
//             displayMessage(`Error fetching data. ${result.error || 'Please try again later.'}`, 'bot');
//         }
//     } catch (error) {
//         console.error(`Error while fetching data:`, error.message);
//         displayMessage("An error occurred while fetching the data.", 'bot');
//     }
// }

// // Function to toggle chat visibility
// async function toggleChat() {
//     isChatOpen = !isChatOpen;
//     console.log('Chat toggled:', isChatOpen ? 'opened' : 'closed');
    
//     chatContainer.classList.toggle('open');
    
//     if (isChatOpen) {
//         console.log('Loading Orchestration Config...');
//         try {
//             const data = await loadOrchestrationFile();
//             orchestrationSteps = data.steps; // Store the steps in the global variable
            
//             chatMessages.innerHTML = '';
//             console.log('Chat messages cleared');
            
//             displayGreetingAndDefaultMessage();
//             console.log("Successfully loaded Orchestration Config");
            
//             if (availableTicketingSystems.length > 0) {
//                 const systems = availableTicketingSystems.map(sys => sys.name).join(', ');
//                 setTimeout(() => {
//                     // displayMessage(`Available ticketing systems: ${systems}. You can say "create ticket" to start the process.`, 'bot');
//                 }, 500);
//             }
//             if (availableDatabases.length > 0) {
//                 const databases = availableDatabases.map(db => db.name).join(', ');
//                 setTimeout(() => {
//                     // displayMessage(`Available databases: ${databases}. You can say "fetch data" to start the process.`, 'bot');
//                 }, 1000);
//             }
//         } catch (error) {
//             console.error('Error loading welcome messages:', error);
//             displayMessage("Sorry, I'm having trouble loading messages.", 'bot');
//         }
        
//         setTimeout(() => {
//             chatInput.focus();
//             console.log('Input focused');
//         }, 800);
//     }
// }

// // Function to send a message
// function sendMessage() {
//     const messageText = chatInput.value.trim();
//     console.log('Attempting to send message:', messageText);
    
//     if (messageText === "") {
//         console.log('Empty message, ignoring');
//         return;
//     }
    
//     displayMessage(messageText, 'user');
//     processUserMessage(messageText);
//     chatInput.value = "";
//     console.log('Input field cleared');
// }

// // Function to process the user message
// function processUserMessage(message) {
//     const normalizedMessage = message.trim().toLowerCase();
    
//     if (normalizedMessage.includes('create ticket')) {
//         if (orchestrationSteps.length === 0) {
//             displayMessage('No orchestration loaded. Please load an orchestration first.', 'bot');
//             return;
//         }
//         initiateTicketCreation();
//     } else if (normalizedMessage.includes('fetch data')) {
//         if (orchestrationSteps.length === 0) {
//             displayMessage('No orchestration loaded. Please load an orchestration first.', 'bot');
//             return;
//         }
//         initiateDataFetching();
//     } else if (currentStep && parameterIndex < currentStep.parameters.length) {
//         const param = currentStep.parameters[parameterIndex];
//         ticketData[param.name] = message;
//         parameterIndex++;
//         askForParameter();
//     } else if (normalizedMessage === "hi" || normalizedMessage === "hello") {
//         setTimeout(() => {
//             displayMessage("Hello! I can help you create tickets or fetch data. Just say 'create ticket' or 'fetch data' to get started.", 'bot');
//         }, 500);
//     } else {
//         displayGreetingAndDefaultMessage();
//     }
// }

// async function displayMessage(text, sender) {
//     console.log(`Creating new message - Text: "${text}", Sender: ${sender}`);
    
//     // Create and display the message in the chat
//     const messageElement = document.createElement('div');
//     messageElement.classList.add('message', sender);
//     messageElement.textContent = text;
//     chatMessages.appendChild(messageElement);
    
//     setTimeout(() => {
//         messageElement.classList.add('visible');
//     }, 10);
    
//     chatMessages.scrollTop = chatMessages.scrollHeight;

//     // Send the message to the backend
//     try {
//         const baseUrl = "http://127.0.0.1:5000"; // Replace with your backend URL
//         const endpoint = `${baseUrl}/log_message`; // Replace with your API endpoint
//         const method = "POST"; // Use POST to send data

//         const requestBody = JSON.stringify({
//             message: text,
//             sender: sender
//         });

//         const response = await fetch(endpoint, {
//             method: method,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: requestBody,
//         });

//         const result = await response.json();
//         console.log('Message logged successfully:', result);
//     } catch (error) {
//         console.error('Error logging message:', error);
//     }
// }

// // Add event listener for Enter key
// chatInput.addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') {
//         sendMessage();
//     }
// });

// // Log when the script loads
//     console.log('Enhanced chat script initialized with ticketing and data fetching support');



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

// State tracking variables
let waitingForTicketID = false;
let waitingForTicketConfirmation = false;
let waitingForTicketDescription = false;
let waitingForSatisfactionFeedback = false;
let lastDepartment = null;
let lastQuery = "";

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

        // Check if 'steps' exists before calling forEach
        if (data.steps && Array.isArray(data.steps)) {
            identifyTicketingSystems(data.steps);
            identifyDatabases(data.steps);
        } else {
            console.warn("Warning: 'steps' is missing or not an array in orchestration file.");
        }

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
        'create_zendesk_ticket': 'Zendesk',
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

// Function to get the appropriate endpoint for a specific function from orchestration steps
function getEndpointForFunction(functionName) {
    const step = orchestrationSteps.find(step => step.function === functionName);
    return step ? step.endpoint : null;
}

async function fetchGreeting() {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        const endpoint = `${baseUrl}/get_greeting`;
        const method = "POST";

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        console.log('Greeting API Response:', result);

        if (response.ok) {
            return result.result; 
        } else {
            console.error('Error fetching greeting:', result);
            return "Hello"; // Fallback greeting
        }
    } catch (error) {
        console.error('Error while fetching greeting:', error.message);
        return "Hello"; // Fallback greeting
    }
}

async function displayGreetingAndDefaultMessage() {
    try {
        const greeting = await fetchGreeting();
        const defaultMessage = 'How can I assist you today?';
        const fullMessage = `${greeting} ${defaultMessage}`;
        await displayMessage(fullMessage, 'bot');
    } catch (error) {
        console.error('Error displaying greeting:', error);
        await displayMessage("Hello! How can I assist you today?", 'bot');
    }
}

// Function to classify department based on user message
async function classifyDepartment(message) {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        const endpoint = `${baseUrl}/department_detection?user_message=${encodeURIComponent(message)}`;

        console.log(`Sending department detection request for message: "${message}"`);
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Department Classification API Response:', result);

        if (result && result.result) {
            return result.result;
        } else {
            console.error('Invalid department classification response:', result);
            return "IT"; // Default to IT as fallback
        }
    } catch (error) {
        console.error('Error while classifying department:', error.message);
        return "IT"; // Default to IT as fallback
    }
}

// Function to call RAG (semantic search) API with GET
async function callRAG(query, department) {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        let endpoint = getEndpointForFunction('semantic_search_and_answer');

        if (!endpoint) {
            console.error('Semantic search endpoint not found in orchestration steps');
            return "I couldn't find information on that. Would you like to create a ticket instead?";
        }

        // Encode parameters as query string
        const queryParams = new URLSearchParams({
            question: query,
            department: department
        }).toString();

        const url = `${baseUrl}${endpoint}?${queryParams}`;
        console.log(`Sending RAG request to: ${url}`);

        const response = await fetch(url, { method: "GET" });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('RAG API Response:', result);

        return result?.result || "I couldn't find information on that. Would you like to create a ticket instead?";
    } catch (error) {
        console.error('Error while fetching RAG response:', error.message);
        return "I couldn't find information on that. Would you like to create a ticket instead?";
    }
}

// Function to initiate the ticket creation process
function initiateTicketCreation() {
    try {
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
    } catch (error) {
        console.error('Error initiating ticket creation:', error);
        displayMessage("I'm sorry, I couldn't create a ticket at this time. Please try again later.", 'bot');
    }
}

// Function to create a ticket
function createTicket(step) {
    try {
        currentStep = step;
        parameterIndex = 0;
        
        // Check if we already have a description
        if (ticketData.description) {
            console.log('Using existing description:', ticketData.description);
            // Skip directly to sending the ticket request
            sendTicketRequest();
        } else {
            // We should only reach here if initiateTicketCreation was called without a prior description
            askForParameter();
        }
    } catch (error) {
        console.error('Error creating ticket:', error);
        displayMessage("An error occurred while setting up the ticket. Please try again.", 'bot');
    }
}

// Function to ask for the next parameter
function askForParameter() {
    try {
        if (!currentStep || !currentStep.parameters) {
            console.error('Invalid step or parameters missing');
            displayMessage("I'm sorry, I couldn't process your ticket request. Please try again.", 'bot');
            return;
        }

        if (parameterIndex < currentStep.parameters.length) {
            const param = currentStep.parameters[parameterIndex];
            let promptMessage = `Please enter the value for ${param.name}:`;
            
            // Add helpful context for specific parameters
            if (param.name === 'top_k') {
                promptMessage += " (e.g., 5)";
            }
            
            displayMessage(promptMessage, 'bot');
        } else {
            // All parameters collected, send the API request
            if (currentStep.function.startsWith('create_')) {
                sendTicketRequest();
            } else if (currentStep.function === 'semantic_search_and_answer') {
                sendDataFetchRequest();
            }
        }
    } catch (error) {
        console.error('Error asking for parameter:', error);
        displayMessage("An error occurred while processing your request. Please try again.", 'bot');
    }
}

// Function to send the ticket request
async function sendTicketRequest() {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        const endpoint = `${baseUrl}${currentStep.endpoint}`;
        const method = currentStep.methods[0];

        console.log(`Sending ticket request to ${endpoint} with data:`, ticketData);
        const requestBody = JSON.stringify(ticketData);

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`${currentStep.function} API Response:`, result);

        if (result && result.result && result.result.number) {
            const ticketNumber = result.result.number;
            const successMessage = `Ticket ${ticketNumber} created successfully!`;
            displayMessage(successMessage, 'bot');
            displayMessage("Is there anything else I can help you with today?", 'bot');
        } else {
            console.error(`Invalid ticket creation response:`, result);
            displayMessage("The ticket was processed, but I couldn't retrieve a reference number. Please contact support if you need to follow up.", 'bot');
        }
    } catch (error) {
        console.error(`Error while creating the ticket:`, error.message);
        displayMessage("An error occurred while creating the ticket. Please try again later.", 'bot');
    } finally {
        // Reset the current step and parameters
        currentStep = null;
        parameterIndex = 0;
        ticketData = {};
    }
}

// Function to send the data fetch request
async function sendDataFetchRequest() {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        const endpoint = `${baseUrl}${currentStep.endpoint}`;
        const method = currentStep.methods[0];

        console.log(`Sending data fetch request to ${endpoint} with data:`, ticketData);
        const requestBody = JSON.stringify(ticketData);

        const response = await fetch(endpoint, {
            method: method,
            headers: {
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log(`${currentStep.function} API Response:`, result);

        if (result && result.result) {
            const successMessage = `${result.result}`;
            displayMessage(successMessage, 'bot');
        } else {
            console.error(`Invalid data fetch response:`, result);
            displayMessage("I couldn't retrieve the information you requested. Would you like to create a ticket instead?", 'bot');
            waitingForTicketConfirmation = true;
        }
    } catch (error) {
        console.error(`Error while fetching data:`, error.message);
        displayMessage("An error occurred while fetching the data. Would you like to create a ticket instead?", 'bot');
        waitingForTicketConfirmation = true;
    } finally {
        // Reset the current step and parameters
        currentStep = null;
        parameterIndex = 0;
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
            
            // Step 1: Call get_greeting API and display greeting message
            await displayGreetingAndDefaultMessage();
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
    
    displayMessage(messageText, 'user');
    processUserMessage(messageText);
    chatInput.value = "";
    console.log('Input field cleared');
}

// Function to collect parameters from user input
function collectParameter(message) {
    try {
        if (!currentStep || !currentStep.parameters || parameterIndex >= currentStep.parameters.length) {
            console.error('Invalid state for parameter collection');
            displayMessage("I'm sorry, there was an error processing your request. Let's start over.", 'bot');
            resetConversationState();
            return;
        }

        const param = currentStep.parameters[parameterIndex];
        ticketData[param.name] = message;
        console.log(`Collected parameter ${param.name}: ${message}`);
        parameterIndex++;
        
        // Ask for the next parameter or create ticket if all parameters are collected
        askForParameter();
    } catch (error) {
        console.error('Error collecting parameter:', error);
        displayMessage("There was a problem processing your input. Let's try again.", 'bot');
        resetConversationState();
    }
}

// Reset conversation state
function resetConversationState() {
    currentStep = null;
    parameterIndex = 0;
    ticketData = {};
    waitingForTicketID = false;
    waitingForTicketConfirmation = false;
    waitingForTicketDescription = false;
    waitingForSatisfactionFeedback = false;
}

// async function processUserMessage(message) {
//     try {
//         console.log(`Processing user message: "${message}"`);
//         console.log(`Current state - waitingForTicketDescription: ${waitingForTicketDescription}, waitingForTicketConfirmation: ${waitingForTicketConfirmation}, waitingForSatisfactionFeedback: ${waitingForSatisfactionFeedback}, waitingForTicketID: ${waitingForTicketID}`);

//         // Handle status check commands with better regex
//         const statusCheck = message.match(/\b(?:status of|check the status of|what is the status of|give me the status of)\s*(INC\d+)\b/i);

//         if (statusCheck) {
//             const ticketNumber = statusCheck[1];
//             if (ticketNumber) {
//                 console.log(`Fetching status for ticket: ${ticketNumber}`);
//                 try {
//                     const status = await checkTicketStatus(ticketNumber);
//                     // Fix the conditional check
//                     if (status && typeof status === 'strnbdhedhing' && status.trim() !== "") {
//                         displayMessage(`Incident Status Details:\nIncident Number: ${ticketNumber}\nStatus: ${status}`, 'bot');
//                     } 
//                 } catch (error) {
//                     console.error("Error fetching ticket status:", error);
//                     displayMessage("There was an error fetching the ticket status. Please try again later.", 'bot');
//                 }
//             }
//             return;
//         }

//         // Check if we're waiting for the ticket description
//         if (waitingForTicketDescription) {
//             console.log("Processing ticket description input");
//             waitingForTicketDescription = false;
            
//             // Store the description and immediately initiate ticket creation
//             ticketData.description = message;
//             initiateTicketCreation();
//             return;
//         }

//         // Check if we're collecting parameters for a ticket
//         if (currentStep && parameterIndex < currentStep.parameters.length) {
//             console.log("Processing parameter input");
//             collectParameter(message);
//             return;
//         }

//         // Check if we're waiting for a yes/no response for ticket creation
//         if (waitingForTicketConfirmation) {
//             console.log("Processing ticket confirmation input");
//             waitingForTicketConfirmation = false;
            
//             if (message.toLowerCase().includes('yes') || 
//                 message.toLowerCase().includes('create') || 
//                 message.toLowerCase().includes('ticket') || 
//                 message.toLowerCase().includes('incident')) {
                
//                 displayMessage("Please describe the issue in detail.", 'bot');
//                 waitingForTicketDescription = true;
//             } else {
//                 displayMessage("Glad I could assist you. Let me know if you have any other queries.", 'bot');
//             }
//             return;
//         }

//         // Check if we're waiting for satisfaction feedback
//         if (waitingForSatisfactionFeedback) {
//             console.log("Processing satisfaction feedback input");
//             waitingForSatisfactionFeedback = false;

//             if (message.toLowerCase().includes('yes')) {
//                 displayMessage("Glad I could assist you. Let me know if you have any other queries.", 'bot');
//             } else if (message.toLowerCase().includes('create') || 
//                        message.toLowerCase().includes('ticket') || 
//                        message.toLowerCase().includes('incident')) {
//                 displayMessage("Please describe the issue in detail.", 'bot');
//                 waitingForTicketDescription = true;
//             } else {
//                 displayMessage("Let me know if you need further assistance.", 'bot');
//             }
//             return;
//         }

//         // Store the current query for potential ticket creation
//         lastQuery = message;

//         // Direct ticket creation handling
//         if (message.toLowerCase().includes('create ticket') || 
//             message.toLowerCase().includes('open ticket') || 
//             message.toLowerCase().includes('submit ticket') ||
//             message.toLowerCase().includes('raise ticket')) {
//             displayMessage("Please describe the issue in detail.", 'bot');
//             waitingForTicketDescription = true;
//             return;
//         }

//         // Step 2: Classify the department
//         console.log("Classifying department...");
//         const department = await classifyDepartment(message);
//         console.log(`Classified department: ${department}`);
//         lastDepartment = department;

//         // Step 3: Process based on department classification
//         if (department === "Greetings") {
//             console.log("Processing as greeting");
//             await displayGreetingAndDefaultMessage();
//         } else if (department === "IT") {
//             console.log("Processing as IT query");
            
//             const ragResponse = await callRAG(message, department);
//             console.log(`RAG response received: "${ragResponse}"`);
//             displayMessage(ragResponse, 'bot');
            
//             setTimeout(() => {
//                 displayMessage("Is this helpful or would you like me to create an incident?", 'bot');
//                 waitingForSatisfactionFeedback = true;
//                 console.log("Waiting for satisfaction feedback set to true");
//             }, 1000);
//         } else if (department === "HR" || department === "Finance") {
//             console.log(`Processing as ${department} query`);
            
//             const ragResponse = await callRAG(message, department);
//             console.log(`RAG response received: "${ragResponse}"`);
//             displayMessage(ragResponse, 'bot');
//         } else {
//             console.log("Unrecognized department, defaulting to IT");
            
//             const ragResponse = await callRAG(message, "IT");
//             console.log(`RAG response received: "${ragResponse}"`);
//             displayMessage(ragResponse, 'bot');
            
//             setTimeout(() => {
//                 displayMessage("Is this helpful or would you like me to create an incident?", 'bot');
//                 waitingForSatisfactionFeedback = true;
//                 console.log("Waiting for satisfaction feedback set to true");
//             }, 1000);
//         }
//     } catch (error) {
//         console.error('Error processing user message:', error);
//         displayMessage("I'm sorry, I encountered an error while processing your request. Please try again.", 'bot');
//     }
// }

async function processUserMessage(message) {
    try {
        console.log(`Processing user message: "${message}"`);
        console.log(`Current state - waitingForTicketDescription: ${waitingForTicketDescription}, waitingForTicketConfirmation: ${waitingForTicketConfirmation}, waitingForSatisfactionFeedback: ${waitingForSatisfactionFeedback}, waitingForTicketID: ${waitingForTicketID}`);

        // Handle status check commands with better regex
        const statusCheck = message.match(/\b(?:status of|check the status of|what is the status of|give me the status of)\s*(INC\d+)\b/i);

        if (statusCheck) {
            const ticketNumber = statusCheck[1];
            if (ticketNumber) {
                console.log(`Fetching status for ticket: ${ticketNumber}`);
                try {
                    const status = await checkTicketStatus(ticketNumber);
                    // Fix the conditional check
                    if (status && typeof status === 'string' && status.trim() !== "") {
                        displayMessage(`Incident Status Details:\nIncident Number: ${ticketNumber}\nStatus: ${status}`, 'bot');
                    } 
                } catch (error) {
                    console.error("Error fetching ticket status:", error);
                    displayMessage("There was an error fetching the ticket status. Please try again later.", 'bot');
                }
            }
            return;
        }

        // Check if we're waiting for the ticket description
        if (waitingForTicketDescription) {
            console.log("Processing ticket description input");
            waitingForTicketDescription = false;
            
            // Store the description and immediately initiate ticket creation
            ticketData.description = message;
            initiateTicketCreation();
            return;
        }

        // Check if we're collecting parameters for a ticket
        if (currentStep && parameterIndex < currentStep.parameters.length) {
            console.log("Processing parameter input");
            collectParameter(message);
            return;
        }

        // Check if we're waiting for a yes/no response for ticket creation
        if (waitingForTicketConfirmation) {
            console.log("Processing ticket confirmation input");
            waitingForTicketConfirmation = false;
            
            if (message.toLowerCase().includes('yes') || 
                message.toLowerCase().includes('create') || 
                message.toLowerCase().includes('ticket') || 
                message.toLowerCase().includes('incident')) {
                
                displayMessage("Please describe the issue in detail.", 'bot');
                waitingForTicketDescription = true;
            } else {
                displayMessage("Glad I could assist you. Let me know if you have any other queries.", 'bot');
            }
            return;
        }

        // Check if we're waiting for satisfaction feedback
        if (waitingForSatisfactionFeedback) {
            console.log("Processing satisfaction feedback input");
            waitingForSatisfactionFeedback = false;

            if (message.toLowerCase().includes('yes') || 
                message.toLowerCase().includes('helpful') ||
                message.toLowerCase().includes('thanks') ||
                message.toLowerCase().includes('thank')) {
                displayMessage("Glad I could assist you. Let me know if you have any other queries.", 'bot');
            } else if (message.toLowerCase().includes('yes create') || 
                      message.toLowerCase().includes('ticket') || 
                      message.toLowerCase().includes('incident')) {
                displayMessage("Please describe the issue in detail.", 'bot');
                waitingForTicketDescription = true;
            } else {
                // If the response isn't clearly yes or no, restart the flow with department detection
                console.log("Unrecognized satisfaction response, restarting flow");
                
                // Process as a new query
                lastQuery = message;
                
                // Classify the department for the new query
                console.log("Classifying department for new query...");
                const department = await classifyDepartment(message);
                console.log(`Classified department: ${department}`);
                lastDepartment = department;
                
                // Process based on department classification
                if (department === "Greetings") {
                    console.log("Processing as greeting");
                    await displayGreetingAndDefaultMessage();
                } else if (department === "IT") {
                    console.log("Processing as IT query");
                    
                    const ragResponse = await callRAG(message, department);
                    console.log(`RAG response received: "${ragResponse}"`);
                    displayMessage(ragResponse, 'bot');
                    
                    setTimeout(() => {
                        displayMessage("Is this helpful or would you like me to create an incident?", 'bot');
                        waitingForSatisfactionFeedback = true;
                        console.log("Waiting for satisfaction feedback set to true");
                    }, 1000);
                } else if (department === "HR" || department === "Finance") {
                    console.log(`Processing as ${department} query`);
                    
                    const ragResponse = await callRAG(message, department);
                    console.log(`RAG response received: "${ragResponse}"`);
                    displayMessage(ragResponse, 'bot');
                } else {
                    console.log("Unrecognized department, defaulting to IT");
                    
                    const ragResponse = await callRAG(message, "IT");
                    console.log(`RAG response received: "${ragResponse}"`);
                    displayMessage(ragResponse, 'bot');
                    
                    setTimeout(() => {
                        displayMessage("Is this helpful or would you like me to create an incident?", 'bot');
                        waitingForSatisfactionFeedback = true;
                        console.log("Waiting for satisfaction feedback set to true");
                    }, 1000);
                }
            }
            return;
        }

        // Store the current query for potential ticket creation
        lastQuery = message;

        // Direct ticket creation handling
        if (message.toLowerCase().includes('create ticket') || 
            message.toLowerCase().includes('open ticket') || 
            message.toLowerCase().includes('submit ticket') ||
            message.toLowerCase().includes('raise ticket')) {
            displayMessage("Please describe the issue in detail.", 'bot');
            waitingForTicketDescription = true;
            return;
        }

        // Step 2: Classify the department
        console.log("Classifying department...");
        const department = await classifyDepartment(message);
        console.log(`Classified department: ${department}`);
        lastDepartment = department;

        // Step 3: Process based on department classification
        if (department === "Greetings") {
            console.log("Processing as greeting");
            await displayGreetingAndDefaultMessage();
        } else if (department === "IT") {
            console.log("Processing as IT query");
            
            const ragResponse = await callRAG(message, department);
            console.log(`RAG response received: "${ragResponse}"`);
            displayMessage(ragResponse, 'bot');
            
            setTimeout(() => {
                displayMessage("Is this helpful or would you like me to create an incident?", 'bot');
                waitingForSatisfactionFeedback = true;
                console.log("Waiting for satisfaction feedback set to true");
            }, 1000);
        } else if (department === "HR" || department === "Finance") {
            console.log(`Processing as ${department} query`);
            
            const ragResponse = await callRAG(message, department);
            console.log(`RAG response received: "${ragResponse}"`);
            displayMessage(ragResponse, 'bot');
        } else {
            console.log("Unrecognized department, defaulting to IT");
            
            const ragResponse = await callRAG(message, "IT");
            console.log(`RAG response received: "${ragResponse}"`);
            displayMessage(ragResponse, 'bot');
            
            setTimeout(() => {
                displayMessage("Is this helpful or would you like me to create an incident?", 'bot');
                waitingForSatisfactionFeedback = true;
                console.log("Waiting for satisfaction feedback set to true");
            }, 1000);
        }
    } catch (error) {
        console.error('Error processing user message:', error);
        displayMessage("I'm sorry, I encountered an error while processing your request. Please try again.", 'bot');
    }
}

async function checkTicketStatus(ticketNumber) {
    try {
        const viewStep = orchestrationSteps.find(step => 
            step.function === "view_ticket_detailed"
        );

        if (!viewStep) {
            displayMessage("Ticket viewing is not configured", 'bot');
            return;
        }

        const baseUrl = "http://127.0.0.1:5000";
        const endpoint = `${baseUrl}${viewStep.endpoint}`;
        
        const queryParams = new URLSearchParams({
            incident_id: ticketNumber,
            sys_id: ticketNumber
        }).toString();

        const response = await fetch(`${endpoint}?${queryParams}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        
        // Handle error response from backend
        if (responseData.error) {
            displayMessage(`Error checking incident status: ${responseData.error}`, 'bot');
            return;
        }

        // Access the nested result object
        const result = responseData.result || responseData;
        
        // Display formatted status information
        if (result.number && result.state) {
            const statusMessage = `Incident Status Details:\n` +
                                `Incident Number: ${result.number}\n` +
                                `Status: ${result.state}`;
            displayMessage(statusMessage, 'bot');
        } else {
            displayMessage("Received incomplete status information from the API", 'bot');
        }

    } catch (error) {
        console.error('Status check error:', error);
        displayMessage("Couldn't retrieve ticket status. Please verify the ticket number.", 'bot');
    }
}

// Function to display message with read more option for long messages
async function displayMessage(text, sender) {
    try {
        console.log(`Creating new message - Text: "${text}", Sender: ${sender}`);
        
        // Create the message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        // Handle long messages with read more functionality if it's a bot message
        if (sender === 'bot') {
            const words = text.split(" ");
            if (words.length > 30) {
                // Create preview text (first 30 words)
                const previewText = words.slice(0, 30).join(" ") + "... ";
                
                // Create content container
                const messageContent = document.createElement('div');
                messageContent.classList.add('message-content');
                messageContent.textContent = previewText;
                
                // Create read more link
                const readMoreLink = document.createElement('a');
                readMoreLink.textContent = "Read More...";
                readMoreLink.href = "#";
                readMoreLink.style.cursor = "pointer";
                readMoreLink.classList.add('read-more-link');
                
                // Add click event to read more link
                readMoreLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    messageContent.textContent = text;
                    readMoreLink.style.display = "none";
                });
                
                // Append content and read more link to message
                messageElement.appendChild(messageContent);
                messageElement.appendChild(readMoreLink);
            } else {
                // Just set the text for shorter messages
                messageElement.textContent = text;
            }
        } else {
            // User messages don't get the read more treatment
            messageElement.textContent = text;
        }
        
        // Add message to chat
        chatMessages.appendChild(messageElement);
        
        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 10);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Send the message to the backend for logging
        try {
            const baseUrl = "http://127.0.0.1:5000";
            const endpoint = `${baseUrl}/log_message`;
            const method = "POST";

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
            // Continue even if logging fails
        }
    } catch (error) {
        console.error('Error displaying message:', error);
        // Try a simpler approach as fallback
        try {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${sender}`;
            messageElement.textContent = text;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (innerError) {
            console.error('Critical error in display message:', innerError);
        }
    }
}

// Add event listener for Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Log when the script loads
console.log('Enhanced chat script initialized with improved ticket flow and organized code');