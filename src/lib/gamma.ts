/*
Switch between Gemma (on-device) and Gemini (server-based) summarization

The Gamma class is responsible for initializing a ChatModule instance, which is used for text summarization. 
The initialization process checks if the navigator.gpu is available, and if so, it loads a specific model 
from a URL. The class provides two methods for text summarization: summarize and summarizeWithGemma. 
The summarize method checks if the navigator.gpu is available and decides whether to use the ChatModule 
instance for summarization (summarizeWithGemma) or fall back to another method (summarizeWithGeminiAPI).
*/
import { ChatModule } from "@mlc-ai/web-llm";

class Gamma {
  private chatModule: ChatModule | null = null;
  private isInitialized: Promise<void>;

  constructor() {
    this.isInitialized = this.initializeGemma();
  }

  private async initializeGemma(): Promise<void> {
    if (navigator.gpu) {
      console.log("Initializing in-browser model");
      this.chatModule = new ChatModule();
      await this.chatModule.reload("gemma-2b-it-q4f16_1", undefined, {
        model_list: [{
          model_url: "https://huggingface.co/mlc-ai/gemma-2b-it-q4f16_1-MLC/resolve/main/",
          local_id: "gemma-2b-it-q4f16_1",
          model_lib_url: "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/gemma-2b-it/gemma-2b-it-q4f16_1-ctx4k_cs1k-webgpu.wasm",
          required_features: ["shader-f16"],
        }]
      });
      console.log('Gemma initialized');
    }
  }

  public async summarize(text: string): Promise<string> {
    await this.initializeGemma();
    if (navigator.gpu) {
      console.log('Using Gemma...');
       // Use Gemma for summarization
      return this.summarizeWithGemma(text);
    } else {
      console.log('Using Gemini...');
       // Fallback to Gemini (Google AI JavaScript SDK)
      return this.summarizeWithGeminiAPI(text);
    }
  }

  public async summarizeWithGemma(text: string): Promise<string> {
    return this.chatModule.generate(text);
  }

  private async summarizeWithGeminiAPI(text: string): Promise<string> {
    try {
      const response = await fetch('/.netlify/functions/gemini-summarizer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: text }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch summary from Gemini API');
      }
  
      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error(`Error in summarizeWithGeminiAPI: ${error.message}`);
      throw error; 
    }
  }
}


export default Gamma;
