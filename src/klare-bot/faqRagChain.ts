import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ChatMessageHistory } from 'langchain/memory';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { BaseChatMessageHistory } from '@langchain/core/chat_history';
import { AnthropicModel, OpenAIModel } from '../lib/LangChainClient';
import RedisClient from '../lib/RedisClient';

async function FAGRagChain() {
  // 1. Load, chunk and index the contents of the blog to create a retriever.
  const loader = new CheerioWebBaseLoader('https://www.clareandme.com/faq');
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments(docs);
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings(),
  );
  const retriever = vectorstore.asRetriever();

  // 2. Incorporate the retriever into a question-answering chain.
  const systemPrompt =
    'You are an assistant for the orgamization Calre&Me and handle frequently-asked-question tasks. ' +
    'Use the following pieces of retrieved context to answer ' +
    "the question. If you don't know the answer, say that you " +
    "don't know. Use three sentences maximum and keep the " +
    'answer concise.' +
    '\n\n' +
    '{context}';

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['human', '{input}'],
  ]);

  const { OPENAI_API_KEY, ANTHROPIC_API_KEY } = process.env;
  let llm;

  if (OPENAI_API_KEY) {
    llm = OpenAIModel;
  } else if (ANTHROPIC_API_KEY) {
    llm = AnthropicModel;
  } else {
    throw new Error('No OpenAI or Anthropic API key found');
  }

  const faqChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  const ragChain = await createRetrievalChain({
    retriever,
    combineDocsChain: faqChain,
  });

  return ragChain;
}

async function FAGRagChainWithChatHistory() {
  // 1. Load, chunk and index the contents of the blog to create a retriever.
  const loader = new CheerioWebBaseLoader('https://www.clareandme.com/faq');
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments(docs);
  const vectorstore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings(),
  );
  const retriever = vectorstore.asRetriever();

  // 2. Incorporate the retriever into a question-answering chain.
  const systemPrompt =
    'You are an assistant for the organization Calre&Me and handle frequently-asked-question tasks. ' +
    'Use the following pieces of retrieved context to answer ' +
    "the question. If you don't know the answer, say that you " +
    "don't know. Use three sentences maximum and keep the " +
    'answer concise.' +
    '\n\n' +
    '{context}';

  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
  ]);

  // Handle contexualizing prompts with chat history
  const contextualizeFAQSystemPrompt =
    'Given a chat history and the latest user question ' +
    'which might reference context in the chat history, ' +
    'formulate a standalone question which can be understood ' +
    'without the chat history. Do NOT answer the question, ' +
    'just reformulate it if needed and otherwise return it as is.';

  const contextualizeFAQPrompt = ChatPromptTemplate.fromMessages([
    ['system', contextualizeFAQSystemPrompt],
    new MessagesPlaceholder('chat_history'),
    ['human', '{input}'],
  ]);

  const { OPENAI_API_KEY, ANTHROPIC_API_KEY } = process.env;
  let llm;

  if (OPENAI_API_KEY) {
    llm = OpenAIModel;
  } else if (ANTHROPIC_API_KEY) {
    llm = AnthropicModel;
  } else {
    throw new Error('No OpenAI or Anthropic API key found');
  }

  const historyAwareRetriever = await createHistoryAwareRetriever({
    llm,
    retriever,
    rephrasePrompt: contextualizeFAQPrompt,
  });

  const faqChain = await createStuffDocumentsChain({
    llm,
    prompt,
  });

  const ragChain = await createRetrievalChain({
    retriever: historyAwareRetriever,
    combineDocsChain: faqChain,
  });

  // USe redis to statefully mamanger chat history
  const client = RedisClient.getInstance();

  // Statefully manage chat history
  const store2: Record<string, BaseChatMessageHistory> = {};

  function getSessionHistory2(sessionId: string): BaseChatMessageHistory {
    console.log('getSessionHistory2', sessionId);

    if (!(sessionId in store2)) {
      store2[sessionId] = new RedisChatMessageHistory({
        client,
        sessionId,
      });
    }
    return store2[sessionId];
  }

  // const demoEphemeralChatMessageHistoryForChain = new RedisChatMessageHistory({
  //   client,
  //   sessionId: '{sessionId}',
  // });

  const conversationalRagChain2 = new RunnableWithMessageHistory({
    runnable: ragChain,
    getMessageHistory: getSessionHistory2,
    inputMessagesKey: 'input',
    historyMessagesKey: 'chat_history',
    outputMessagesKey: 'answer',
  });

  return conversationalRagChain2;
}

export { FAGRagChain, FAGRagChainWithChatHistory };
