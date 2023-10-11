import { Pinecone } from "@pinecone-database/pinecone";

export const getPineconeClient = async () => {
  const client = new Pinecone({
    apiKey: process.env.PINE_CONE_API_KEY!,
    environment: "us-central1-gcp",
  });

  return client;
};
