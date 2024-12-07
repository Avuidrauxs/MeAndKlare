/*
I would prefer performing evaluation tests with LLMs and GPTs
*/
/* istanbul ignore file */
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { BaseChatMessageHistory } from '@langchain/core/chat_history';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import {
  AnthropicModel,
  GroqModel,
  OpenAIModel,
} from '../../../lib/LangChainClient';
import RedisClient from '../../../lib/RedisClient';
import {
  CLASSIFY_SYSTEM_PROMPT,
  CONTEXTUALIZE_SYSTEM_PROMPT,
  NORMAL_CONVERSATION_SYSTEM_PROMPT,
} from '../../constants';
import { config } from '../../../config';
import { LlmServiceError } from '../../../core/errors';

class LLMService {
  private static redisClient = RedisClient.getInstance();

  private static store: Record<string, BaseChatMessageHistory> = {};

  private static async loadAndSplitDocuments(url: string) {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    return textSplitter.splitDocuments(docs);
  }

  private static async createRetriever(url: string) {
    const splits = await this.loadAndSplitDocuments(url);
    const vectorstore = await MemoryVectorStore.fromDocuments(
      splits,
      new OpenAIEmbeddings(),
    );
    return vectorstore.asRetriever();
  }

  private static getLLM() {
    const { openAiApiKey, anthropicApiKey, groqApiKey } = config.ai;
    if (anthropicApiKey) {
      return AnthropicModel;
    }
    if (openAiApiKey) {
      return OpenAIModel;
    }
    if (groqApiKey) {
      return GroqModel;
    }
    throw new LlmServiceError('No OpenAI or Anthropic or Groq API key found');
  }

  private static generateSystemPrompt(systemPrompt: string) {
    return ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ]);
  }

  private static getSessionHistory(sessionId: string): BaseChatMessageHistory {
    if (!(sessionId in this.store)) {
      this.store[sessionId] = new RedisChatMessageHistory({
        client: this.redisClient,
        sessionId,
      });
    }
    return this.store[sessionId];
  }

  private static async createRagChain(
    systemPrompt: string,
    retriever: VectorStoreRetriever,
  ) {
    const llm = this.getLLM();
    const prompt = this.generateSystemPrompt(systemPrompt);

    const combineDocsChain = await createStuffDocumentsChain({
      llm,
      prompt,
    });

    return createRetrievalChain({
      retriever,
      combineDocsChain,
    });
  }

  public static async classifyMessageAndResponse() {
    const retriever = await this.createRetriever(
      'https://www.clareandme.com/faq',
    );
    const llm = this.getLLM();

    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm,
      retriever,
      rephrasePrompt: this.generateSystemPrompt(CONTEXTUALIZE_SYSTEM_PROMPT),
    });

    const classifyMessageChain = await createStuffDocumentsChain({
      llm,
      prompt: this.generateSystemPrompt(CLASSIFY_SYSTEM_PROMPT),
    });

    const ragChain = await createRetrievalChain({
      retriever: historyAwareRetriever,
      combineDocsChain: classifyMessageChain,
    });

    return new RunnableWithMessageHistory({
      runnable: ragChain,
      getMessageHistory: this.getSessionHistory.bind(this),
      inputMessagesKey: 'input',
      historyMessagesKey: 'chat_history',
      outputMessagesKey: 'answer',
    });
  }

  public static async klareConversationAgent() {
    try {
      const retriever = await this.createRetriever(
        'https://www.clareandme.com/faq',
      );
      const llm = this.getLLM();

      const historyAwareRetriever = await createHistoryAwareRetriever({
        llm,
        retriever,
        rephrasePrompt: this.generateSystemPrompt(CONTEXTUALIZE_SYSTEM_PROMPT),
      });

      const normaleFlowMessageChain = await createStuffDocumentsChain({
        llm,
        prompt: this.generateSystemPrompt(NORMAL_CONVERSATION_SYSTEM_PROMPT),
      });

      const ragChain = await createRetrievalChain({
        retriever: historyAwareRetriever,
        combineDocsChain: normaleFlowMessageChain,
      });

      return new RunnableWithMessageHistory({
        runnable: ragChain,
        getMessageHistory: this.getSessionHistory.bind(this),
        inputMessagesKey: 'input',
        historyMessagesKey: 'chat_history',
        outputMessagesKey: 'answer',
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new LlmServiceError(error.message);
      } else {
        throw new LlmServiceError('Something went wrong with LangChain');
      }
    }
  }
}

export default LLMService;
