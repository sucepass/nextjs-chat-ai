import { ChatModule } from "@mlc-ai/web-llm";

class Gamma {
  private static instance: Gamma | null = null;
  private chatModule: ChatModule | null = null;
  private isInitialized: Promise<void>;

  private constructor() {
    this.isInitialized = this.initializeGemma();
  }

  // Singleton pattern to avoid multiple instances of Gamma
  public static getInstance(): Gamma {
    if (!Gamma.instance) {
      Gamma.instance = new Gamma();
    }
    return Gamma.instance;
  }

  private async initializeGemma(): Promise<void> {
    if (navigator.gpu) {
      console.log("Initializing in-browser model");
      this.chatModule = new ChatModule();
      await this.chatModule.reload("gemma-2b-it-q4f16_1", undefined, {
        model_list: [
          {
            model_url:
              "https://huggingface.co/mlc-ai/gemma-2b-it-q4f16_1-MLC/resolve/main/",
            local_id: "gemma-2b-it-q4f16_1",
            model_lib_url:
              "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/gemma-2b-it/gemma-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
            required_features: ["shader-f16"],
          },
        ],
      });
      console.log("Gemma initialized");
    }
  }

  public async summarize(text: string): Promise<string> {
    if (!this.isInitialized) {
      this.isInitialized = this.initializeGemma();
    }
    await this.isInitialized;
    if (navigator.gpu) {
      console.log("Using Gemma...");
      // Use Gemma for summarization
      return this.summarizeWithGemma(text);
    } else {
      console.log("Using Gemini...");
      // Fallback to Gemini (Google AI JavaScript SDK)
      return this.summarizeWithGeminiAPI(text);
    }
  }

  private async summarizeWithGemma(text: string): Promise<string> {
    if (!this.chatModule) throw new Error("Gemma not initialized");
    return this.chatModule.generate(text);
  }

  private async summarizeWithGeminiAPI(text: string): Promise<string> {
    try {
      const response = await fetch("/.netlify/functions/gemini-summarizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch summary from Gemini API"
        );
      }

      const data = await response.json();
      return data.summary;
    } catch (error: any) {
      console.error(`Error in summarizeWithGeminiAPI: ${error.message}`);
      throw error;
    }
  }
}

export default Gamma;
