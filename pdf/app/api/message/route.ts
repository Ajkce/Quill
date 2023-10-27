import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { SendMessageValidator } from "@/libs/validator/SendMessageValidator";
import prisma from "@/libs/prismadb";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { getPineconeClient } from "@/libs/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { openai } from "@/libs/openai";

import { OpenAIStream, StreamingTextResponse } from "ai";

export const POST = async (req: NextRequest) => {
  //Endpoint for asking the question to the pdf file
  const body = await req.json();
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  if (!userId) return new Response("unauthorized", { status: 401 });

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });
  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  await prisma.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  //Vectorize message
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index("quill");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
  });
  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await prisma.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
      
\n----------------\n

PREVIOUS CONVERSATION:
${formattedPrevMessages.map((message) => {
  if (message.role === "user") return `User: ${message.content}\n`;
  return `Assistant: ${message.content}\n`;
})}

\n----------------\n

CONTEXT:
${results.map((r) => r.pageContent).join("\n\n")}

USER INPUT: ${message}`,
      },
    ],
  });

  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await prisma.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};
