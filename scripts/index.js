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

// // State tracking variables
// let waitingForTicketID = false;
// let waitingForTicketConfirmation = false;
// let waitingForTicketDescription = false;
// let waitingForSatisfactionFeedback = false;
// let lastDepartment = null;
// let lastQuery = "";
// // Authentication state (persistent using localStorage)
// let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
// let userName = localStorage.getItem('userName');
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

//         if (data.steps && Array.isArray(data.steps)) {
//             identifyTicketingSystems(data.steps);
//             identifyDatabases(data.steps);
//         } else {
//             console.warn("Warning: 'steps' is missing or not an array in orchestration file.");
//         }

//         return data;
//     } catch (error) {
//         console.error('Error loading orchestration file:', error);
//         throw error;
//     }
// }

// // Function to identify available ticketing systems in the orchestration steps
// function identifyTicketingSystems(steps) {
//     availableTicketingSystems = [];

//     const ticketingFunctions = {
//         'create_servicenow_incident': 'ServiceNow',
//         'create_zendesk_ticket': 'Zendesk',
//         'create_jira_incident': 'Jira'
//     };

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

//     const databaseFunctions = {
//         'semantic_search_and_answer': 'Milvus'
//     };

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

// // Function to get the appropriate endpoint for a specific function from orchestration steps
// function getEndpointForFunction(functionName) {
//     const step = orchestrationSteps.find(step => step.function === functionName);
//     return step ? step.endpoint : null;
// }

// async function fetchGreeting() {
//     try {
//         const baseUrl = "http://127.0.0.1:5000";
//         const endpoint = `${baseUrl}/get_greeting`;
//         const method = "POST";

//         const response = await fetch(endpoint, {
//             method: method,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         });

//         const result = await response.json();
//         console.log('Greeting API Response:', result);

//         if (response.ok) {
//             return result.result; 
//         } else {
//             console.error('Error fetching greeting:', result);
//             return "Hello"; // Fallback greeting
//         }
//     } catch (error) {
//         console.error('Error while fetching greeting:', error.message);
//         return "Hello"; // Fallback greeting
//     }
// }

// async function displayGreetingAndDefaultMessage() {
//     try {
//         const greeting = await fetchGreeting();
//         const defaultMessage = 'How can I assist you today?';

//         if (!isAuthenticated) {
//             await displayMessage(`${greeting} ${defaultMessage}`, 'bot');
//             await displaySignInButton();
//         } else {
//             await displayMessage(`${greeting} ${userName}! ${defaultMessage}`, 'bot');
//         }
//     } catch (error) {
//         console.error('Error displaying greeting:', error);
//         await displayMessage("Hello! How can I assist you today?", 'bot');
//         if (!isAuthenticated) {
//             await displaySignInButton();
//         }
//     }
// }

// async function classifyDepartment(message) {
//     try {
//         const baseUrl = "http://127.0.0.1:5000";
//         const endpoint = `${baseUrl}/department_detection?user_message=${encodeURIComponent(message)}`;

//         console.log(`Sending department detection request for message: "${message}"`);
//         const response = await fetch(endpoint, {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log('Department Classification API Response:', result);

//         if (result && result.result) {
//             return result.result;
//         } else {
//             console.error('Invalid department classification response:', result);
//             return "IT"; // Default to IT as fallback
//         }
//     } catch (error) {
//         console.error('Error while classifying department:', error.message);
//         return "IT"; // Default to IT as fallback
//     }
// }

// async function displaySignInButton() {
//     try {
//         const messageElement = document.createElement('div');
//         messageElement.classList.add('message', 'bot');

//         const button = document.createElement('button');
//         button.textContent = 'Sign in with Microsoft';
//         button.style.padding = '8px 16px';
//         button.style.backgroundColor = '#0078d4';
//         button.style.color = 'white';
//         button.style.border = 'none';
//         button.style.borderRadius = '4px';
//         button.style.cursor = 'pointer';

//         button.addEventListener('click', async () => {
//             try {
//                 const authUrl = await fetchAuthUrl();
//                 if (authUrl) {
//                     window.location.href = authUrl; // Redirect to Microsoft login
//                 } else {
//                     displayMessage("Failed to initiate sign-in. Please try again.", 'bot');
//                 }
//             } catch (error) {
//                 console.error('Error initiating sign-in:', error);
//                 displayMessage("Error starting authentication. Please try again.", 'bot');
//             }
//         });

//         messageElement.appendChild(button);
//         chatMessages.appendChild(messageElement);

//         setTimeout(() => {
//             messageElement.classList.add('visible');
//         }, 10);

//         chatMessages.scrollTop = chatMessages.scrollHeight;
//     } catch (error) {
//         console.error('Error displaying sign-in button:', error);
//         displayMessage("Error displaying sign-in option.", 'bot');
//     }
// }

// async function fetchAuthUrl() {
//     try {
//         const response = await fetch('http://127.0.0.1:5000/microsoft/login', {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });
//         console.log("/microsoft/login");

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         if (data.status === 'success' && data.auth_url) {
//             console.log('Auth URL fetched:', data.auth_url);
//             return data.auth_url;
//         } else {
//             console.error('Error in auth URL response:', data.error);
//             return null;
//         }
//     } catch (error) {
//         console.error('Error fetching auth URL:', error);
//         return null;
//     }
// }

// async function callRAG(query, department) {
//     try {
//         const baseUrl = "http://127.0.0.1:5000";
//         let endpoint = getEndpointForFunction('semantic_search_and_answer');

//         if (!endpoint) {
//             console.error('Semantic search endpoint not found in orchestration steps');
//             return "I couldn't find information on that. Would you like to create a ticket instead?";
//         }

//         const queryParams = new URLSearchParams({
//             question: query,
//             department: department
//         }).toString();

//         const url = `${baseUrl}${endpoint}?${queryParams}`;
//         console.log(`Sending RAG request to: ${url}`);

//         const response = await fetch(url, { method: "GET" });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log('RAG API Response:', result);

//         return result?.result || "I couldn't find information on that. Would you like to create a ticket instead?";
//     } catch (error) {
//         console.error('Error while fetching RAG response:', error.message);
//         return "I couldn't find information on that. Would you like to create a ticket instead?";
//     }
// }

// async function handleAuthCallback(code) {
//     try {
//         const response = await fetch('http://127.0.0.1:5000/getAToken', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ code: code }),
//         });

//         console.log('http://localhost:5000/getAToken Iam being ExECUTED!!!!!');

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         if (data.status === 'success' && data.user) {
//             isAuthenticated = true;
//             userName = data.user.displayName || data.user.userPrincipalName.split('@')[0];

//             // Store in localStorage for persistence
//             localStorage.setItem('isAuthenticated', 'true');
//             localStorage.setItem('userName', userName);

//             // Redirect to homepage or show UI changes
//             window.location.href = '/';  // Redirect to homepage or dashboard
//         } else {
//             console.error('Error in callback response:', data.error);
//             displayMessage(`Authentication failed: ${data.error || 'Unknown error'}`, 'bot');
//         }
//     } catch (error) {
//         console.error('Error handling auth callback:', error);
//         displayMessage("Error completing authentication. Please try again.", 'bot');
//     }
// }

// function initiateTicketCreation() {
//     try {
//         if (availableTicketingSystems.length === 0) {
//             displayMessage('No ticketing systems available in the current orchestration.', 'bot');
//             return;
//         }

//         if (availableTicketingSystems.length === 1) {
//             const system = availableTicketingSystems[0];
//             displayMessage(`Creating a ${system.name} ticket...`, 'bot');
//             createTicket(system.step);
//             return;
//         }

//         const priorityOrder = ['ServiceNow', 'Jira', 'Zendesk'];
//         for (const priority of priorityOrder) {
//             const system = availableTicketingSystems.find(sys => sys.name === priority);
//             if (system) {
//                 displayMessage(`Creating a ${system.name} ticket...`, 'bot');
//                 createTicket(system.step);
//                 return;
//             }
//         }
//     } catch (error) {
//         console.error('Error initiating ticket creation:', error);
//         displayMessage("I'm sorry, I couldn't create a ticket at this time. Please try again later.", 'bot');
//     }
// }

// function createTicket(step) {
//     try {
//         currentStep = step;
//         parameterIndex = 0;

//         if (ticketData.description) {
//             console.log('Using existing description:', ticketData.description);
//             sendTicketRequest();
//         } else {
//             askForParameter();
//         }
//     } catch (error) {
//         console.error('Error creating ticket:', error);
//         displayMessage("An error occurred while setting up the ticket. Please try again.", 'bot');
//     }
// }

// function askForParameter() {
//     try {
//         if (!currentStep || !currentStep.parameters) {
//             console.error('Invalid step or parameters missing');
//             displayMessage("I'm sorry, I couldn't process your ticket request. Please try again.", 'bot');
//             return;
//         }

//         if (parameterIndex < currentStep.parameters.length) {
//             const param = currentStep.parameters[parameterIndex];
//             let promptMessage = `Please enter the value for ${param.name}:`;

//             if (param.name === 'top_k') {
//                 promptMessage += " (e.g., 5)";
//             }

//             displayMessage(promptMessage, 'bot');
//         } else {
//             if (currentStep.function.startsWith('create_')) {
//                 sendTicketRequest();
//             } else if (currentStep.function === 'semantic_search_and_answer') {
//                 sendDataFetchRequest();
//             }
//         }
//     } catch (error) {
//         console.error('Error asking for parameter:', error);
//         displayMessage("An error occurred while processing your request. Please try again.", 'bot');
//     }
// }

// async function sendTicketRequest() {
//     try {
//         const baseUrl = "http://127.0.0.1:5000";
//         const endpoint = `${baseUrl}${currentStep.endpoint}`;
//         const method = currentStep.methods[0];

//         console.log(`Sending ticket request to ${endpoint} with data:`, ticketData);
//         const requestBody = JSON.stringify(ticketData);

//         const response = await fetch(endpoint, {
//             method: method,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: requestBody,
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log(`${currentStep.function} API Response:`, result);

//         if (result && result.result && result.result.number) {
//             const ticketNumber = result.result.number;
//             const successMessage = `Ticket ${ticketNumber} created successfully!`;
//             displayMessage(successMessage, 'bot');
//             displayMessage("Is there anything else I can help you with today?", 'bot');
//         } else {
//             console.error(`Invalid ticket creation response:`, result);
//             displayMessage("The ticket was processed, but I couldn't retrieve a reference number. Please contact support if you need to follow up.", 'bot');
//         }
//     } catch (error) {
//         console.error(`Error while creating the ticket:`, error.message);
//         displayMessage("An error occurred while creating the ticket. Please try again later.", 'bot');
//     } finally {
//         currentStep = null;
//         parameterIndex = 0;
//         ticketData = {};
//     }
// }

// async function sendDataFetchRequest() {
//     try {
//         const baseUrl = "http://127.0.0.1:5000";
//         const endpoint = `${baseUrl}${currentStep.endpoint}`;
//         const method = currentStep.methods[0];

//         console.log(`Sending data fetch request to ${endpoint} with data:`, ticketData);
//         const requestBody = JSON.stringify(ticketData);

//         const response = await fetch(endpoint, {
//             method: method,
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: requestBody,
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();
//         console.log(`${currentStep.function} API Response:`, result);

//         if (result && result.result) {
//             const successMessage = `${result.result}`;
//             displayMessage(successMessage, 'bot');
//         } else {
//             console.error(`Invalid data fetch response:`, result);
//             displayMessage("I couldn't retrieve the information you requested. Would you like to create a ticket instead?", 'bot');
//             waitingForTicketConfirmation = true;
//         }
//     } catch (error) {
//         console.error(`Error while fetching data:`, error.message);
//         displayMessage("An error occurred while fetching the data. Would you like to create a ticket instead?", 'bot');
//         waitingForTicketConfirmation = true;
//     } finally {
//         currentStep = null;
//         parameterIndex = 0;
//     }
// }

// // Automatically detect authentication callback on page load
// document.addEventListener('DOMContentLoaded', async function () {
//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get('code');
//     const error = urlParams.get('error');

//     if (code || error) {
//         // Clear URL parameters after processing
//         window.history.replaceState({}, document.title, window.location.pathname);

//         if (error) {
//             console.error('Authentication error:', error);
//             displayMessage(`Authentication failed: ${error}`, 'bot');
//         } else if (code) {
//             await handleAuthCallback(code);
//         }
//     }
// });

// async function toggleChat() {
//     isChatOpen = !isChatOpen;
//     console.log('Chat toggled:', isChatOpen ? 'opened' : 'closed');

//     chatContainer.classList.toggle('open');

//     if (isChatOpen) {
//         console.log('Loading Orchestration Config...');
//         try {
//             const data = await loadOrchestrationFile();
//             orchestrationSteps = data.steps;

//             chatMessages.innerHTML = '';
//             console.log('Chat messages cleared');

//             await displayGreetingAndDefaultMessage();
//             console.log("Successfully loaded Orchestration Config");
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

// function collectParameter(message) {
//     try {
//         if (!currentStep || !currentStep.parameters || parameterIndex >= currentStep.parameters.length) {
//             console.error('Invalid state for parameter collection');
//             displayMessage("I'm sorry, there was an error processing your request. Let's start over.", 'bot');
//             resetConversationState();
//             return;
//         }

//         const param = currentStep.parameters[parameterIndex];
//         ticketData[param.name] = message;
//         console.log(`Collected parameter ${param.name}: ${message}`);
//         parameterIndex++;

//         askForParameter();
//     } catch (error) {
//         console.error('Error collecting parameter:', error);
//         displayMessage("There was a problem processing your input. Let's try again.", 'bot');
//         resetConversationState();
//     }
// }

// function resetConversationState() {
//     currentStep = null;
//     parameterIndex = 0;
//     ticketData = {};
//     waitingForTicketID = false;
//     waitingForTicketConfirmation = false;
//     waitingForTicketDescription = false;
//     waitingForSatisfactionFeedback = false;
// }

// async function processUserMessage(message) {
//     try {
//         console.log(`Processing user message: "${message}"`);
//         console.log(`Current state - waitingForTicketDescription: ${waitingForTicketDescription}, waitingForTicketConfirmation: ${waitingForTicketConfirmation}, waitingForSatisfactionFeedback: ${waitingForSatisfactionFeedback}, waitingForTicketID: ${waitingForTicketID}`);

//         const statusCheck = message.match(/\b(?:status of|check the status of|what is the status of|give me the status of)\s*(INC\d+)\b/i);

//         if (statusCheck) {
//             const ticketNumber = statusCheck[1];
//             if (ticketNumber) {
//                 console.log(`Fetching status for ticket: ${ticketNumber}`);
//                 try {
//                     const status = await checkTicketStatus(ticketNumber);
//                     if (status && typeof status === 'string' && status.trim() !== "") {
//                         displayMessage(`Incident Status Details:\nIncident Number: ${ticketNumber}\nStatus: ${status}`, 'bot');
//                     } 
//                 } catch (error) {
//                     console.error("Error fetching ticket status:", error);
//                     displayMessage("There was an error fetching the ticket status. Please try again later.", 'bot');
//                 }
//             }
//             return;
//         }

//         if (waitingForTicketDescription) {
//             console.log("Processing ticket description input");
//             waitingForTicketDescription = false;

//             ticketData.description = message;
//             initiateTicketCreation();
//             return;
//         }

//         if (currentStep && parameterIndex < currentStep.parameters.length) {
//             console.log("Processing parameter input");
//             collectParameter(message);
//             return;
//         }

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

//         if (waitingForSatisfactionFeedback) {
//             console.log("Processing satisfaction feedback input");
//             waitingForSatisfactionFeedback = false;

//             if (message.toLowerCase().includes('yes') || 
//                 message.toLowerCase().includes('helpful') ||
//                 message.toLowerCase().includes('thanks') ||
//                 message.toLowerCase().includes('thank')) {
//                 displayMessage("Glad I could assist you. Let me know if you have any other queries.", 'bot');
//             } else if (message.toLowerCase().includes('yes create') || 
//                       message.toLowerCase().includes('ticket') || 
//                       message.toLowerCase().includes('incident')) {
//                 displayMessage("Please describe the issue in detail.", 'bot');
//                 waitingForTicketDescription = true;
//             } else {
//                 console.log("Unrecognized satisfaction response, restarting flow");

//                 lastQuery = message;

//                 console.log("Classifying department for new query...");
//                 const department = await classifyDepartment(message);
//                 console.log(`Classified department: ${department}`);
//                 lastDepartment = department;

//                 if (department === "Greetings") {
//                     console.log("Processing as greeting");
//                     await displayGreetingAndDefaultMessage();
//                 } else if (department === "IT") {
//                     console.log("Processing as IT query");

//                     const ragResponse = await callRAG(message, department);
//                     console.log(`RAG response received: "${ragResponse}"`);
//                     displayMessage(ragResponse, 'bot');

//                     setTimeout(() => {
//                         displayMessage("Is this helpful or would you like me to create an incident?", 'bot');
//                         waitingForSatisfactionFeedback = true;
//                         console.log("Waiting for satisfaction feedback set to true");
//                     }, 1000);
//                 } else if (department === "HR" || department === "Finance") {
//                     console.log(`Processing as ${department} query`);

//                     const ragResponse = await callRAG(message, department);
//                     console.log(`RAG response received: "${ragResponse}"`);
//                     displayMessage(ragResponse, 'bot');
//                 } else {
//                     console.log("Unrecognized department, defaulting to IT");

//                     const ragResponse = await callRAG(message, "IT");
//                     console.log(`RAG response received: "${ragResponse}"`);
//                     displayMessage(ragResponse, 'bot');

//                     setTimeout(() => {
//                         displayMessage("Is this helpful or would you like me to create an incident?", 'bot');
//                         waitingForSatisfactionFeedback = true;
//                         console.log("Waiting for satisfaction feedback set to true");
//                     }, 1000);
//                 }
//             }
//             return;
//         }

//         lastQuery = message;

//         if (message.toLowerCase().includes('create ticket') || 
//             message.toLowerCase().includes('open ticket') || 
//             message.toLowerCase().includes('submit ticket') ||
//             message.toLowerCase().includes('raise ticket')) {
//             displayMessage("Please describe the issue in detail.", 'bot');
//             waitingForTicketDescription = true;
//             return;
//         }

//         console.log("Classifying department...");
//         const department = await classifyDepartment(message);
//         console.log(`Classified department: ${department}`);
//         lastDepartment = department;

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

// async function checkTicketStatus(ticketNumber) {
//     try {
//         const viewStep = orchestrationSteps.find(step => 
//             step.function === "view_ticket_detailed"
//         );

//         if (!viewStep) {
//             displayMessage("Ticket viewing is not configured", 'bot');
//             return;
//         }

//         const baseUrl = "http://127.0.0.1:5000";
//         const endpoint = `${baseUrl}${viewStep.endpoint}`;

//         const queryParams = new URLSearchParams({
//             incident_id: ticketNumber,
//             sys_id: ticketNumber
//         }).toString();

//         const response = await fetch(`${endpoint}?${queryParams}`, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" }
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const responseData = await response.json();

//         if (responseData.error) {
//             displayMessage(`Error checking incident status: ${responseData.error}`, 'bot');
//             return;
//         }

//         const result = responseData.result || responseData;

//         if (result.number && result.state) {
//             const statusMessage = `Incident Status Details:\n` +
//                                 `Incident Number: ${result.number}\n` +
//                                 `Status: ${result.state}`;
//             displayMessage(statusMessage, 'bot');
//         } else {
//             displayMessage("Received incomplete status information from the API", 'bot');
//         }
//     } catch (error) {
//         console.error('Status check error:', error);
//         displayMessage("Couldn't retrieve ticket status. Please verify the ticket number.", 'bot');
//     }
// }

// async function displayMessage(text, sender) {
//     try {
//         console.log(`Creating new message - Text: "${text}", Sender: ${sender}`);

//         const messageElement = document.createElement('div');
//         messageElement.classList.add('message', sender);

//         if (sender === 'bot') {
//             const words = text.split(" ");
//             if (words.length > 30) {
//                 const previewText = words.slice(0, 30).join(" ") + "... ";
//                 const messageContent = document.createElement('div');
//                 messageContent.classList.add('message-content');
//                 messageContent.textContent = previewText;

//                 const readMoreLink = document.createElement('a');
//                 readMoreLink.textContent = "Read More...";
//                 readMoreLink.href = "#";
//                 readMoreLink.style.cursor = "pointer";
//                 readMoreLink.classList.add('read-more-link');

//                 readMoreLink.addEventListener('click', function(event) {
//                     event.preventDefault();
//                     messageContent.textContent = text;
//                     readMoreLink.style.display = "none";
//                 });

//                 messageElement.appendChild(messageContent);
//                 messageElement.appendChild(readMoreLink);
//             } else {
//                 messageElement.textContent = text;
//             }
//         } else {
//             messageElement.textContent = text;
//         }

//         chatMessages.appendChild(messageElement);

//         setTimeout(() => {
//             messageElement.classList.add('visible');
//         }, 10);

//         chatMessages.scrollTop = chatMessages.scrollHeight;

//         try {
//             const baseUrl = "http://127.0.0.1:5000";
//             const endpoint = `${baseUrl}/log_message`;
//             const method = "POST";

//             const requestBody = JSON.stringify({
//                 message: text,
//                 sender: sender
//             });

//             const response = await fetch(endpoint, {
//                 method: method,
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: requestBody,
//             });

//             const result = await response.json();
//             console.log('Message logged successfully:', result);
//         } catch (error) {
//             console.error('Error logging message:', error);
//         }
//     } catch (error) {
//         console.error('Error displaying message:', error);
//         try {
//             const messageElement = document.createElement('div');
//             messageElement.className = `message ${sender}`;
//             messageElement.textContent = text;
//             chatMessages.appendChild(messageElement);
//             chatMessages.scrollTop = chatMessages.scrollHeight;
//         } catch (innerError) {
//             console.error('Critical error in display message:', innerError);
//         }
//     }
// }

// chatInput.addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') {
//         sendMessage();
//     }
// });

// console.log('Enhanced chat script initialized with improved ticket flow and organized code');

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

// Authentication state
let isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
let userName = localStorage.getItem('userName') || '';

// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: "8afea2b4-ce8f-457c-bfe2-a70fcb161dff",
        authority: "https://login.microsoftonline.com/6e191e37-aea9-4f1a-b96b-073b145f0cce",
        redirectUri: "http://localhost:5501/templates/",
        navigateToLoginRequestUrl: false // Prevent redirect after popup
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// Handle MSAL redirect response on page load
async function handleRedirectResponse() {
    try {
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
            console.log('Handling redirect response:', response);
            isAuthenticated = true;
            localStorage.setItem('isAuthenticated', 'true');
            userName = response.account.name || response.account.username.split('@')[0];
            localStorage.setItem('userName', userName);
            localStorage.setItem('msalAccount', JSON.stringify(response.account));
            chatMessages.innerHTML = '';
            await displayMessage(`Welcome, ${userName}! How can I assist you today?`, 'bot');
            // Clear URL fragment to prevent re-processing
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (error) {
        console.error('Error handling redirect response:', error);
    }
}

// Prevent chat from closing when clicking inside it
chatContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Chat container clicked, preventing propagation');
});

async function displaySignInButton() {
    try {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'bot');

        const button = document.createElement('button');
        button.textContent = 'Sign in with Microsoft';
        button.style.padding = '8px 16px';
        button.style.backgroundColor = '#0078d4';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                const loginRequest = {
                    scopes: ["User.Read"],
                    prompt: "select_account"
                };
                console.log('Initiating MSAL login popup with redirect URI:', msalConfig.auth.redirectUri);
                const loginResponse = await msalInstance.loginRedirect(loginRequest);
                console.log('Login response:', loginResponse);

                isAuthenticated = true;
                localStorage.setItem('isAuthenticated', 'true');
                userName = loginResponse.account.name || loginResponse.account.username.split('@')[0];
                localStorage.setItem('userName', userName);
                localStorage.setItem('msalAccount', JSON.stringify(loginResponse.account));

                console.log('User authenticated:', userName);
                chatMessages.innerHTML = '';
                await displayMessage(`Welcome, ${userName}! How can I assist you today?`, 'bot');
            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = "Failed to sign in. Please try again.";
                if (error.errorCode === "user_cancelled") errorMessage = "Login was cancelled.";
                else if (error.errorCode === "access_denied") errorMessage = "Access was denied.";
                await displayMessage(errorMessage, 'bot');
            }
        });

        messageElement.appendChild(button);
        chatMessages.appendChild(messageElement);
        setTimeout(() => messageElement.classList.add('visible'), 10);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('Error displaying sign-in button:', error);
        displayMessage("Error displaying sign-in option.", 'bot');
    }
}

async function fetchUserDetails(accessToken) {
    try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error(`Graph API error! status: ${response.status}`);
        const userData = await response.json();
        console.log('User details fetched from Graph API:', userData);
        return userData;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, checking authentication state...');
    await handleRedirectResponse(); // Handle any redirect response first

    try {
        const accounts = msalInstance.getAllAccounts();
        console.log('Accounts found on load:', accounts);
        const storedAccount = localStorage.getItem('msalAccount') ? JSON.parse(localStorage.getItem('msalAccount')) : null;

        if (accounts.length > 0 && isAuthenticated && storedAccount) {
            const silentRequest = { scopes: ["User.Read"], account: accounts[0] };
            console.log('Attempting silent token acquisition for account:', accounts[0].username);
            const tokenResponse = await msalInstance.acquireTokenSilent(silentRequest);
            console.log('Silent token response:', tokenResponse);

            const userDetails = await fetchUserDetails(tokenResponse.accessToken);
            userName = userDetails.displayName || userDetails.mail || userDetails.userPrincipalName.split('@')[0];
            localStorage.setItem('userName', userName);
            isAuthenticated = true;
            localStorage.setItem('isAuthenticated', 'true');
            console.log('User already authenticated:', userName);

            chatMessages.innerHTML = '';
            await displayMessage(`Welcome back, ${userName}! How can I assist you today?`, 'bot');
        } else {
            console.log('No valid authenticated session found, prompting for login.');
            await displayGreetingAndDefaultMessage();
        }
    } catch (error) {
        console.error('Silent token acquisition failed:', error);
        isAuthenticated = false;
        localStorage.setItem('isAuthenticated', 'false');
        localStorage.removeItem('userName');
        localStorage.removeItem('msalAccount');
        await displayMessage("Session expired or invalid. Please sign in again.", 'bot');
        await displayGreetingAndDefaultMessage();
    }
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

    const ticketingFunctions = {
        'create_servicenow_incident': 'ServiceNow',
        'create_zendesk_ticket': 'Zendesk',
        'create_jira_incident': 'Jira'
    };

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

    const databaseFunctions = {
        'semantic_search_and_answer': 'Milvus'
    };

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

        if (!isAuthenticated) {
            await displayMessage(`${greeting} ${defaultMessage}`, 'bot');
            await displaySignInButton();
        } else {
            await displayMessage(`${greeting} ${userName}! ${defaultMessage}`, 'bot');
        }
    } catch (error) {
        console.error('Error displaying greeting:', error);
        await displayMessage("Hello! How can I assist you today?", 'bot');
        if (!isAuthenticated) {
            await displaySignInButton();
        }
    }
}

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

async function callRAG(query, department) {
    try {
        const baseUrl = "http://127.0.0.1:5000";
        let endpoint = getEndpointForFunction('semantic_search_and_answer');

        if (!endpoint) {
            console.error('Semantic search endpoint not found in orchestration steps');
            return "I couldn't find information on that. Would you like to create a ticket instead?";
        }

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

function initiateTicketCreation() {
    try {
        if (availableTicketingSystems.length === 0) {
            displayMessage('No ticketing systems available in the current orchestration.', 'bot');
            return;
        }

        if (availableTicketingSystems.length === 1) {
            const system = availableTicketingSystems[0];
            displayMessage(`Creating a ${system.name} ticket...`, 'bot');
            createTicket(system.step);
            return;
        }

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

function createTicket(step) {
    try {
        currentStep = step;
        parameterIndex = 0;

        if (ticketData.description) {
            console.log('Using existing description:', ticketData.description);
            sendTicketRequest();
        } else {
            askForParameter();
        }
    } catch (error) {
        console.error('Error creating ticket:', error);
        displayMessage("An error occurred while setting up the ticket. Please try again.", 'bot');
    }
}

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

            if (param.name === 'top_k') {
                promptMessage += " (e.g., 5)";
            }

            displayMessage(promptMessage, 'bot');
        } else {
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
        currentStep = null;
        parameterIndex = 0;
        ticketData = {};
    }
}

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
        currentStep = null;
        parameterIndex = 0;
    }
}

async function toggleChat() {
    isChatOpen = !isChatOpen;
    console.log('Chat toggled:', isChatOpen ? 'opened' : 'closed');

    chatContainer.classList.toggle('open');

    if (isChatOpen) {
        console.log('Loading Orchestration Config...');
        try {
            const data = await loadOrchestrationFile();
            orchestrationSteps = data.steps;

            chatMessages.innerHTML = '';
            console.log('Chat messages cleared');

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

        askForParameter();
    } catch (error) {
        console.error('Error collecting parameter:', error);
        displayMessage("There was a problem processing your input. Let's try again.", 'bot');
        resetConversationState();
    }
}

function resetConversationState() {
    currentStep = null;
    parameterIndex = 0;
    ticketData = {};
    waitingForTicketID = false;
    waitingForTicketConfirmation = false;
    waitingForTicketDescription = false;
    waitingForSatisfactionFeedback = false;
}

async function processUserMessage(message) {
    try {
        console.log(`Processing user message: "${message}"`);
        console.log(`Current state - waitingForTicketDescription: ${waitingForTicketDescription}, waitingForTicketConfirmation: ${waitingForTicketConfirmation}, waitingForSatisfactionFeedback: ${waitingForSatisfactionFeedback}, waitingForTicketID: ${waitingForTicketID}`);

        const statusCheck = message.match(/\b(?:status of|check the status of|what is the status of|give me the status of)\s*(INC\d+)\b/i);

        if (statusCheck) {
            const ticketNumber = statusCheck[1];
            if (ticketNumber) {
                console.log(`Fetching status for ticket: ${ticketNumber}`);
                try {
                    const status = await checkTicketStatus(ticketNumber);
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

        if (waitingForTicketDescription) {
            console.log("Processing ticket description input");
            waitingForTicketDescription = false;

            ticketData.description = message;
            initiateTicketCreation();
            return;
        }

        if (currentStep && parameterIndex < currentStep.parameters.length) {
            console.log("Processing parameter input");
            collectParameter(message);
            return;
        }

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
                console.log("Unrecognized satisfaction response, restarting flow");

                lastQuery = message;

                console.log("Classifying department for new query...");
                const department = await classifyDepartment(message);
                console.log(`Classified department: ${department}`);
                lastDepartment = department;

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

        lastQuery = message;

        if (message.toLowerCase().includes('create ticket') || 
            message.toLowerCase().includes('open ticket') || 
            message.toLowerCase().includes('submit ticket') ||
            message.toLowerCase().includes('raise ticket')) {
            displayMessage("Please describe the issue in detail.", 'bot');
            waitingForTicketDescription = true;
            return;
        }

        console.log("Classifying department...");
        const department = await classifyDepartment(message);
        console.log(`Classified department: ${department}`);
        lastDepartment = department;

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

        if (responseData.error) {
            displayMessage(`Error checking incident status: ${responseData.error}`, 'bot');
            return;
        }

        const result = responseData.result || responseData;

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

async function displayMessage(text, sender) {
    try {
        console.log(`Creating new message - Text: "${text}", Sender: ${sender}`);

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        if (sender === 'bot') {
            const words = text.split(" ");
            if (words.length > 30) {
                const previewText = words.slice(0, 30).join(" ") + "... ";
                const messageContent = document.createElement('div');
                messageContent.classList.add('message-content');
                messageContent.textContent = previewText;

                const readMoreLink = document.createElement('a');
                readMoreLink.textContent = "Read More...";
                readMoreLink.href = "#";
                readMoreLink.style.cursor = "pointer";
                readMoreLink.classList.add('read-more-link');

                readMoreLink.addEventListener('click', function(event) {
                    event.preventDefault();
                    messageContent.textContent = text;
                    readMoreLink.style.display = "none";
                });

                messageElement.appendChild(messageContent);
                messageElement.appendChild(readMoreLink);
            } else {
                messageElement.textContent = text;
            }
        } else {
            messageElement.textContent = text;
        }

        chatMessages.appendChild(messageElement);

        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 10);

        chatMessages.scrollTop = chatMessages.scrollHeight;

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
        }
    } catch (error) {
        console.error('Error displaying message:', error);
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

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});