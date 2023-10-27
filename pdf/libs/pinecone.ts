import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeClient = async () => {
  const client = new Pinecone({
    apiKey: process.env.PINE_CONE_API_KEY!,
    environment: "gcp-starter",
  });

  return client;
};
