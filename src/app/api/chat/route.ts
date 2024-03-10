// Import necessary modules and dependencies
import { StreamingTextResponse, Message } from "ai";
// Assuming ChatOllama is used for Ollama model interactions
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BytesOutputParser } from "@langchain/core/output_parsers";
// Import your REST API handler, assuming it's defined elsewhere
import { handleRESTAPIRequest } from "../../../lib/restApiHandler";

export async function POST(req: Request) {
  try {

  const { messages, selectedModel } = await req.json();

  // Handle Browser Model selection differently since it's client-side
  if (selectedModel === "Browser Model") {
    // The actual Browser Model handling should be done client-side
    // Respond with a message indicating the client to handle this
    console.log('Handle Browser Model client-side');
    return new Response(JSON.stringify({ message: "Handle Browser Model client-side" }), { status: 200 });
  } else if (selectedModel === "REST API") {
    // Handle REST API call
    // This assumes you have a function to handle REST API requests
    return handleRESTAPIRequest(messages);
  } else {
    // Default to using Ollama or other server-side handled models
    const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

    const model = new ChatOllama({
      baseUrl: OLLAMA_URL,
      model: selectedModel || "gemma:2b",
    });

    console.log(model);

    const parser = new BytesOutputParser();

    const stream = await model
      .pipe(parser)
      .stream(
        (messages as Message[]).map((m) =>
          m.role == "user"
            ? new HumanMessage(m.content)
            : new AIMessage(m.content)
        )
      );

    console.log(stream);

    return new StreamingTextResponse(stream);
  }
 } catch (error) {
    console.error('Error in POST function:', error);
    return new Response(JSON.stringify({ error: 'Error in POST function' }), { status: 500 });
 }
}
