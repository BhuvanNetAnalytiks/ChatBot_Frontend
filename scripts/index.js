class APIHandler {
    constructor() {
        // Load the orchestration configuration
        this.config = {
            // This would be your orchestration.json content
            steps: [
                // ... existing configuration ...
            ]
        };
    }

    // Function to handle different API calls
    async handleAPICall(serviceType, params) {
        // Find the corresponding API configuration
        let apiConfig;
        
        switch(serviceType) {
            case 'servicenow':
                apiConfig = this.config.steps.find(step => step.function === 'create_servicenow_incident');
                return await this.createServiceNowTicket(params, apiConfig);
                
            case 'zendesk':
                apiConfig = this.config.steps.find(step => step.function === 'create_zendesk_ticket');
                return await this.createZendeskTicket(params, apiConfig);
                
            case 'jira':
                apiConfig = this.config.steps.find(step => step.function === 'create_jira_ticket');
                return await this.createJiraTicket(params, apiConfig);
                
            case 'claude':
                apiConfig = this.config.steps.find(step => step.function === 'query_claude_llm');
                return await this.queryLLM(params, apiConfig);
                
            case 'gemini':
                apiConfig = this.config.steps.find(step => step.function === 'query_gemini_llm');
                return await this.queryLLM(params, apiConfig);
                
            case 'microsoft':
                apiConfig = this.config.steps.find(step => step.function === 'get_auth_url');
                return await this.handleMicrosoftAuth(apiConfig);
                
            default:
                throw new Error('Unsupported service type');
        }
    }

    // Individual API handlers
    async createServiceNowTicket(params, config) {
        try {
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: params.description,
                    urgency: params.urgency,
                    impact: params.impact
                })
            });
            return await response.json();
        } catch (error) {
            console.error('ServiceNow API Error:', error);
            throw error;
        }
    }

    async createZendeskTicket(params, config) {
        try {
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subject: params.subject,
                    description: params.description,
                    priority: params.priority
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Zendesk API Error:', error);
            throw error;
        }
    }

    async queryLLM(params, config) {
        try {
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: params.question,
                    context: params.context
                })
            });
            return await response.json();
        } catch (error) {
            console.error('LLM API Error:', error);
            throw error;
        }
    }

    async handleMicrosoftAuth(config) {
        try {
            window.location.href = config.endpoint;
        } catch (error) {
            console.error('Microsoft Auth Error:', error);
            throw error;
        }
    }
}

// Usage example in a chatbot interface
class Chatbot {
    constructor() {
        this.apiHandler = new APIHandler();
    }

    async handleUserInput(userInput) {
        try {
            // Example of processing user input and determining which service to use
            if (userInput.includes('create ticket')) {
                // Determine which ticket system to use based on user preference or context
                const ticketSystem = this.determineTicketSystem(userInput);
                const params = this.extractTicketParams(userInput);
                
                const response = await this.apiHandler.handleAPICall(ticketSystem, params);
                return `Ticket created successfully in ${ticketSystem}!`;
            }
            
            if (userInput.includes('ask AI')) {
                // Determine which LLM to use
                const llmSystem = userInput.includes('claude') ? 'claude' : 'gemini';
                const params = {
                    question: userInput,
                    context: "User's chat context"
                };
                
                const response = await this.apiHandler.handleAPICall(llmSystem, params);
                return response.answer;
            }
            
            // Add more conditions based on your needs
            
        } catch (error) {
            console.error('Error in chatbot:', error);
            return "Sorry, I encountered an error processing your request.";
        }
    }

    // Helper methods
    determineTicketSystem(input) {
        if (input.includes('servicenow')) return 'servicenow';
        if (input.includes('zendesk')) return 'zendesk';
        if (input.includes('jira')) return 'jira';
        return 'servicenow'; // default
    }

    extractTicketParams(input) {
        // Implement your logic to extract parameters from user input
        return {
            description: "Sample description",
            urgency: "medium",
            impact: "medium",
            subject: "Sample subject",
            priority: "medium"
        };
    }
}

// Example usage:
const chatbot = new Chatbot();

// Example function to handle user messages
async function handleUserMessage(userMessage) {
    const response = await chatbot.handleUserInput(userMessage);
    // Update your UI with the response
    console.log(response);
}

// Example calls:
handleUserMessage("create ticket in servicenow for network issue");
handleUserMessage("ask AI using claude about JavaScript");