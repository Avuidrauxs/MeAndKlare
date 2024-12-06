import LLMService from '../../core/infrastructure/llm/service';
import {
  FlowType,
  Intent,
  LlmChainResponse,
  LlmChainRunnable,
  MessageArray,
} from '../../core/types';
import { ContextService } from '../context/service';
import KlareChatBotController from './controller';
import { config } from '../../config';

class KlareChatBotService {
  static contextService: ContextService = new ContextService();

  static async sendMessage(
    input: string,
    userId: string,
    sessionId: string,
  ): Promise<string> {
    const userContext =
      await KlareChatBotController.contextService.getContext(userId);
    let response: LlmChainResponse;
    if (config.ai.noLllm) {
      // Code goes here for NoLllmService
      response = {
        answer: 'I am sorry, I am not available at the moment',
        context: [],
        chat_history: [],
      };
    } else {
      const llmChain = await this.getLLMChain(userContext?.flow);
      response = await this.invokeLLMChain(
        llmChain,
        input,
        userContext?.flow,
        sessionId,
      );
    }

    return this.handleResponse(response, input, userId, sessionId);
  }

  private static async getLLMChain(flow?: FlowType): Promise<LlmChainRunnable> {
    if (flow) {
      return LLMService.klareConversationAgent();
    }
    return LLMService.classifyMessageAndResponse();
  }

  private static async invokeLLMChain(
    llmChain: LlmChainRunnable,
    input: string,
    flow: FlowType | undefined,
    sessionId: string,
  ) {
    return llmChain.invoke(
      { input, flow: flow || FlowType.NORMAL },
      { configurable: { sessionId } },
    );
  }

  private static async handleResponse(
    response: LlmChainResponse,
    input: string,
    userId: string,
    sessionId: string,
  ): Promise<string> {
    let result;
    try {
      result = JSON.parse(response.answer);
    } catch {
      // For weird behaviours
      await this.updateContext(
        userId,
        input,
        response.answer,
        sessionId,
        response.context,
        response.chat_history || [],
      );
      return response.answer;
    }

    await this.updateContext(
      userId,
      input,
      result.response,
      sessionId,
      response.context,
      response.chat_history || [],
      result.intent,
    );
    return result.response;
  }

  static async initiateCheckIn(
    userId: string,
    sessionId: string,
  ): Promise<string> {
    const input = 'Hi';

    // Hi user and then  For Check-In Flow, use a predefined script like "How are you doing today?" without needing classification.

    const normalChatChain = await LLMService.klareConversationAgent();

    // get the user context to get the sessionId

    const response = await normalChatChain.invoke(
      { input, flow: FlowType.CHECK_IN },
      { configurable: { sessionId } },
    );

    // Store context and return the response
    await KlareChatBotController.contextService.upsertContext(userId, {
      flow: FlowType.CHECK_IN,
      sessionId,
      lastMessage: '',
      lastResponse: response.answer,
      intent: Intent.NORMAL,
      lastUpdated: new Date(),
      llmContext: response.context,
      chatHistory: response.chat_history as MessageArray,
    });

    return response.answer;
  }

  private static async updateContext(
    userId: string,
    lastMessage: string,
    lastResponse: string,
    sessionId: string,
    llmContext: unknown[],
    chatHistory: MessageArray,
    intent: Intent = Intent.NORMAL,
  ) {
    await KlareChatBotController.contextService.upsertContext(userId, {
      flow: FlowType.NORMAL,
      sessionId,
      lastMessage,
      lastResponse,
      intent,
      lastUpdated: new Date(),
      llmContext,
      chatHistory,
    });
  }
}

export default KlareChatBotService;
