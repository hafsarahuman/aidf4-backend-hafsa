import { Request, Response, NextFunction } from "express";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
import Hotel from "../Infrastructure/schemas/Hotel";
import { Document } from "@langchain/core/documents";


export const createEmbeddings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Setup OpenAI embeddings
    const embeddingsModel = new OpenAIEmbeddings({
      model: "text-embedding-ada-002",
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Setup MongoDB vector search index
    const vectorIndex = new MongoDBAtlasVectorSearch(embeddingsModel, {
      collection: mongoose.connection.collection("hotelVectors"),
      indexName: "vector_index",
    });

    // Fetch hotel data
    const hotels = await Hotel.find({});

    // Create documents for each hotel
    const docs = hotels.map((hotel) => {
      const { _id, location, price, description } = hotel;
      return new Document({
        pageContent: `${description} Located in ${location}. Price per night: ${price}`,
        metadata: { _id: _id.toString() }, // Metadata should be strings
      });
    });

    // Add documents to vector index
    await vectorIndex.addDocuments(docs);

    res.status(200).json({ message: "Embedding created successfully" });

  } catch (error) {
    console.error("Error creating embeddings:", error);
    next(error);
  }
};
