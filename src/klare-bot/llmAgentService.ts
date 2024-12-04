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
import { AnthropicModel, OpenAIModel } from '../lib/LangChainClient';
import RedisClient from '../lib/RedisClient';
import {
  CLASSIFY_SYSTEM_PROMPT,
  CONTEXTUALIZE_SYSTEM_PROMPT,
  NORMAL_CONVERSATION_SYSTEM_PROMPT,
} from '../core/constants';

async function loadAndSplitDocuments(url: string) {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  return textSplitter.splitDocuments(docs);
}

async function createRetriever(url: string) {
  const splits = await loadAndSplitDocuments(url);
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings(),
  );
  return vectorstore.asRetriever();
}

function getLLM() {
  const { OPENAI_API_KEY, ANTHROPIC_API_KEY } = process.env;
  if (OPENAI_API_KEY) {
    return OpenAIModel;
  }
  if (ANTHROPIC_API_KEY) {
    return AnthropicModel;
  }
  throw new Error('No OpenAI or Anthropic API key found');
}

function generateSystemPrompt(systemPrompt: string) {
  return ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
  ]);
}

async function handleChatHistory() {
  const client = RedisClient.getInstance();
  const store: Record<string, BaseChatMessageHistory> = {};

  return function getSessionHistory(sessionId: string): BaseChatMessageHistory {
    if (!(sessionId in store)) {
      store[sessionId] = new RedisChatMessageHistory({
        client,
        sessionId,
      });
    }
    return store[sessionId];
  };
}

async function createRagChain(
  systemPrompt: string,
  retriever: VectorStoreRetriever,
) {
  const llm = getLLM();
  const prompt = generateSystemPrompt(systemPrompt);

  const combineDocsChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  return createRetrievalChain({
    retriever,
    combineDocsChain,
  });
}

async function classifyMessageAndResponse() {
  const retriever = await createRetriever('https://www.clareandme.com/faq');
  const llm = getLLM();

  const historyAwareRetriever = await createHistoryAwareRetriever({
    llm,
    retriever,
    rephrasePrompt: generateSystemPrompt(CONTEXTUALIZE_SYSTEM_PROMPT),
  });

  const classifyMessageChain = await createStuffDocumentsChain({
    llm,
    prompt: generateSystemPrompt(CLASSIFY_SYSTEM_PROMPT),
  });

  const ragChain = await createRetrievalChain({
    retriever: historyAwareRetriever,
    combineDocsChain: classifyMessageChain,
  });

  const getSessionHistory = await handleChatHistory();

  return new RunnableWithMessageHistory({
    runnable: ragChain,
    getMessageHistory: getSessionHistory,
    inputMessagesKey: 'input',
    historyMessagesKey: 'chat_history',
    outputMessagesKey: 'answer',
  });
}

async function klareConversationAgent() {
  const retriever = await createRetriever('https://www.clareandme.com/faq');
  const llm = getLLM();

  const historyAwareRetriever = await createHistoryAwareRetriever({
    llm,
    retriever,
    rephrasePrompt: generateSystemPrompt(CONTEXTUALIZE_SYSTEM_PROMPT),
  });

  const normaleFlowMessageChain = await createStuffDocumentsChain({
    llm,
    prompt: generateSystemPrompt(NORMAL_CONVERSATION_SYSTEM_PROMPT),
  });

  const ragChain = await createRetrievalChain({
    retriever: historyAwareRetriever,
    combineDocsChain: normaleFlowMessageChain,
  });

  const getSessionHistory = await handleChatHistory();

  return new RunnableWithMessageHistory({
    runnable: ragChain,
    getMessageHistory: getSessionHistory,
    inputMessagesKey: 'input',
    historyMessagesKey: 'chat_history',
    outputMessagesKey: 'answer',
  });
}

export { classifyMessageAndResponse, klareConversationAgent };
