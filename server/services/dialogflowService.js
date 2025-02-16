const dialogflow = require('@google-cloud/dialogflow');
const { struct } = require('pb-util');

class DialogflowService {
  constructor() {
    this.projectId = process.env.DIALOGFLOW_PROJECT_ID;
    this.sessionClient = new dialogflow.SessionsClient();
  }

  async detectIntent(sessionId, query, languageCode = 'en') {
    const sessionPath = this.sessionClient.projectAgentSessionPath(
      this.projectId,
      sessionId
    );

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: query,
          languageCode: languageCode,
        },
      },
    };

    try {
      const [response] = await this.sessionClient.detectIntent(request);
      return {
        fulfillmentText: response.queryResult.fulfillmentText,
        intent: response.queryResult.intent.displayName,
        parameters: struct.decode(response.queryResult.parameters),
        contexts: response.queryResult.outputContexts,
      };
    } catch (error) {
      console.error('Error detecting intent:', error);
      throw error;
    }
  }

  async handleProductQuery(sessionId, query, languageCode) {
    const response = await this.detectIntent(sessionId, query, languageCode);
    
    // Handle different intents
    switch (response.intent) {
      case 'product.search':
        return await this.handleProductSearch(response.parameters);
      case 'product.price':
        return await this.handlePriceQuery(response.parameters);
      case 'order.status':
        return await this.handleOrderStatus(response.parameters);
      default:
        return response.fulfillmentText;
    }
  }

  async handleProductSearch(parameters) {
    // Implement product search logic based on parameters
    // This should integrate with your product database
    return "I'll help you find the perfect product!";
  }

  async handlePriceQuery(parameters) {
    // Implement price query logic
    return "I'll check the price for you!";
  }

  async handleOrderStatus(parameters) {
    // Implement order status check logic
    return "I'll check your order status!";
  }
}

module.exports = new DialogflowService();
