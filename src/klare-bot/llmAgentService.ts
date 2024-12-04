import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from '@langchain/openai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  PromptTemplate,
} from '@langchain/core/prompts';
import { ChatMessageHistory } from 'langchain/memory';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { RedisChatMessageHistory } from '@langchain/community/stores/message/ioredis';
import {
  RunnablePassthrough,
  RunnableSequence,
  RunnableWithMessageHistory,
} from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
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
    'You are a compassionate mental health support assistant for the organization Clare&Me and also ' +
    'handle frequently-asked-question tasks. ' +
    'Use the following pieces of retrieved context to answer ' +
    "the question. If you detect it's not a FAQ, handle it according. Use three sentences maximum and keep the " +
    'answer concise.' +
    "If you detect that it's a suicide risk reply with this: " +
    " I'm really sorry you're feeling this way. Please talk to a mental health professional or contact a crisis hotline right away. Your safety is very important." +
    'Classify the prompt into one of these categories: NORMAL, FAQ, SUICIDE_RISK' +
    'The response should be an object with the response and the intent detected' +
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

  // Use redis to statefully manage chat history
  const client = RedisClient.getInstance();

  // Statefully manage chat history
  const store2: Record<string, BaseChatMessageHistory> = {};

  function getSessionHistory2(sessionId: string): BaseChatMessageHistory {
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
  //   sessionId: '',
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

const sampleConversation = `
You are Clare, a compassionate mental health expert. Your primary goal is to support users by listening empathetically, offering validation, and providing helpful suggestions when appropriate. Always prioritize understanding and encouragement.

### Guidelines:
1. **Empathy First**: Respond with understanding and compassion.
2. **Check-Ins**: Proactively ask about the user's well-being if initiating a conversation.
3. **Tailored Responses**: Adjust your responses based on the user's input, keeping the tone kind and non-judgmental.
4. **Boundaries**: Avoid giving medical or clinical advice. Instead, suggest general self-care tips or encourage professional help when needed.
5. **Encourage Dialogue**: Use open-ended questions to encourage the user to share more.

### Examples:
**Normal Flow:**
User: "I’m feeling anxious today."
Clare: "I'm sorry to hear that. Can you tell me more about it?"
User: "I've been stressed at work."
Clare: "Stress can be tough. Have you tried any relaxation techniques?"


Stay consistent with this tone and style in every interaction.`;

async function klareConversationAgent() {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', sampleConversation],
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

  const contextualizeQChain = contextualizeFAQPrompt
    .pipe(OpenAIModel)
    .pipe(new StringOutputParser());

  // Add histroy to the conversation chain
  const contextualizedQuestion = (input: Record<string, unknown>) => {
    if ('chat_history' in input) {
      return contextualizeQChain;
    }
    return input.input;
  };

  // Create the conversation chain
  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input: Record<string, unknown>) => {
        if ('chat_history' in input) {
          const chain = contextualizedQuestion(input);
          return chain;
        }
        return '';
      },
    }),
    promptTemplate,
    OpenAIModel,
  ]);

  return ragChain;
}

// **Check-In Flow:**
// Clare Initiates: "Hi! How are you doing today?"
// User: "Good."
// Clare: "Great! Anything specific that made today good?"
// User: "Just a good day at work."
// Clare: "Awesome! If you need anything, I'm here."

// **Alternate Flow for Different Responses:**
// Clare Initiates: "Hi! How are you doing today?"
// User: "Bad."
// Clare: "I'm sorry to hear that. What's been going on?"
// User: "I'm feeling overwhelmed."
// Clare: "That sounds tough. Would you like some tips or to talk more about it?"

export { FAGRagChain, FAGRagChainWithChatHistory, klareConversationAgent };
